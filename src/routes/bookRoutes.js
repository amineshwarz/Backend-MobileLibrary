import express from "express";
import cloudinary from "../lib/cloudinary.js";
import Book from "../models/Books.js";
import protectRoute  from "../middleware/auth.middleware.js";


const router = express.Router(); // Création d'un routeur Express


/*--------------------------------------- route pour recuperer un livre ------------------------------------*/
router.post ("/", protectRoute ,async (req, res) => {
    try{
        // recuperer les données de la requete
        const {title, caption, rating, image} = req.body;

        // verifier que les champs son remplie
        if(!title || !caption || !rating || !image){
            return res.status(400).json({message: "Veuillez remplir tous les champs obligatoires"});
        }

        //charge les images de cloudinary
        const uploadResponse = await cloudinary.uploader.upload(image);
        const imageUrl = uploadResponse.secure_url;

        // creation d'un nouveau livre
        const newBook = new Book({
            title,
            caption,
            rating,
            image: imageUrl,
            user: req.user._id // Associer le livre à l'utilisateur authentifié
        });

        // sauvegarder le livre dans la base de données
        await newBook.save();

        // Retour de la réponse avec le livre créé
        res.status(201).json({message: "Livre créé avec succès", book: newBook});



    }catch (error) {
        console.error("Error creation du livre:", error);
        res.status(500).json({ message:error.message });
    }
})

/*--------------------------------------- route pour recuperer tous les livres ------------------------------------*/
router.get("/", protectRoute ,async (req, res) => {
    try{
        const page = req.query.page || 1;       // Page actuelle, par défaut 1
        const limit = req.query.limit || 5;     // Nombre de livres par page, par défaut 5
        const skip = (page - 1) * limit;        // Calcul du nombre de livres à sauter

        // recherche des livre dans la base de données
        const books = await Book.find()
            .sort({ createdAt: -1 })          // Trier par date de création décroissante
            .skip(skip)                       // Sauter les livres pour la pagination
            .limit(limit)                    // Limiter le nombre de livres récupérés
            .populate('user', 'username email'); // Recuperer les informations de l'utilisateur associé au livre

        const totalBooks = await Book.countDocuments(); // Nombre total de livres    

        // envoie la reponse avec les livres et les informations de pagination
        res.send({
            books,
            currentPage: page,
            totalBooks,
            totalPages: Math.ceil(totalBooks / limit) // Calcul du nombre total de pages et l'arrondi à l'entier supérieur
        })
    } catch (error) {
        console.error("erreur dans la route qui recupere tout les livres", error);
        res.status(500).json({ message: error.message });
    }

})
/*---------------------------- Route pour récupérer les livres d'un utilisateur spécifique--------------------------*/

router.get ("/user", protectRoute ,async (req, res) => {
    try {
        // Recherche des livres associés à l'utilisateur authentifié et tri par date de création décroissante
        const books = await Book.find({user: req.user._id}).sort({ createdAt: -1 }); 
        res.json({ books }); // Envoi des livres en réponse
    } catch (error) {
        console.error("Erreur lors de la récupération des livres de l'utilisateur:", error);
        res.status(500).json({ message: error.message });
    }
});

/*--------------------------------------- route pour supprimer un livre ------------------------------------*/

router.delete("/:id", protectRoute ,async (req, res) => {
    try {
        const book = await Book.findById(req.params.id); // Recherche du livre par son ID

        if (!book) return res.status(404).json({ message: "Livre non trouvé" }); // verifier si le livre existe

         // Vérification si l'utilisateur est autorisé à supprimer le livre
        if (book.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: "Accès refusé. Vous n'êtes pas autorisé à supprimer ce livre." });
        }

        // Suppression de l'image associée au livre si elle est hébergée sur Cloudinary
        if (book.image && book.image.includes("cloudinary")){
            try {
                const publicId = book.image.split("/").pop().split(".")[0]; // recupeerer l'ID public de l'image à partir de l'URL
                await cloudinary.uploader.destroy(publicId); // suppression de l'image de Cloudinary
            } catch (deleteError){
                console.log("Erreur lors de la suppression de l'image de Cloudinary:", deleteError);
            }
        }

        await book.remove(); // Suppression du livre de la base de données
        
        res.json({ message: "Livre supprimé avec succès" }); //Envoie d'une réponse de succes 

    } catch (error) {
        console.log("Erreur lors de la suppression du livre:", error);
        res.status(500).json({ message: error.message });
    }
});


export default router;
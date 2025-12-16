import express from 'express';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';

const router = express.Router();            // Création d'un objet Router pour gérer les routes de l'application
const generateToken = (userId) => {
    return jwt.sign({userId}, process.env.JWT_SECRET, {expiresIn: '7d'}); // Génération d'un token JWT avec une durée de validité de 7 jours
}

/*---------------------------------------Route pour l'inscription d'un utilisateur------------------------------------*/
router.post("/register", async (req, res) => {
    try{
        const {email, username, password} = req.body; // extraction des données du corps de la requête
        if (!username || !email || !password) { 
            return res.status(400).json({ message: "Veuillez fournie tous les champs" });
        }
        if (password.length < 6) {
            return res.status(400).json({ message: "Le mot de passe doit contenir au moins 6 caractères" });
        }
        if (username.length < 3) {
            return res.status(400).json({ message: "Le nom d'utilisateur doit contenir au moins 3 caractères" });
        }

    // Vérification si l'email existe déjà dans la base de données
        const existingEmail = await User.findOne({ email });                    
        if (existingEmail) {
            return res.status(400).json({ message: "L'email existe déjà" });
        }

    // Vérification si le nom d'utilisateur existe déjà dans la base de données
        const existingUserName = await User.findOne({ username });              
        if (existingUserName) {
            return res.status(400).json({ message: "Le nom d'utilisateur existe déjà" });
        }

    //creation de l'avatar aléatoire 
        const profileImage = `https://avatars.dicebear.com/api/avataaars/${username}.svg`;

    //creation d'un nouvel utilisateur
        const user = new User ({
            email,
            username,
            password,
            profileImage,
        });
        await user.save(); // Sauvegarde de l'utilisateur dans la base de données

    // Génération d'un token d'authentification (fonction à implémenter)
        const token = generateToken(user._id);
        res.status(201).json({
            token,
            user:{
                id: user._id,
                username: user.username,
                password: user.password,
                email: user.email,
                profileImage: user.profileImage,
            }
        });

    }catch(error){
        console.error("Erreur dans la route register", error);
        res.status(500).json({ message: "Erreur du serveur" });
    }
});

/*---------------------------------------Route pour LOGIN d'un utilisateur------------------------------------*/
router.post("/login", async (req, res) => {
    try {
    // extraction des données du corps de la requête
        const {email ,password} = req.body; 

    // Si un ou plusieurs champs obligatoires sont manquants, renvoi d'une erreur 400 
        if (!email || !password) {
            return res.status(400).json({ message: "Veuillez fournir tous les champs" });
        }

    //Vérifie si le user existe sinn message d'erreur
        const user =await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "l'email n'existe pas " });
        }

    // verifier si le password est correst sinn renvoie erreur 400
        const isPasswordCorrect = await user.comparePassword(password);
        if (!isPasswordCorrect) {
            return res.status(400).json({ message: "Mot de passe incorrect" });
        }
    // Génération d'un token d'authentification
        const token = generateToken(user._id);
    
    // renvoi des informations de l'utilisateur et du token
        res.status(201).json({
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                password: user.password,
                profileImage: user.profileImage,
            }
        });
    } catch (error) {
        console.error("Erreur dans la route login", error);
        res.status(500).json({ message: "Erreur du serveur" });
    }

});

export default router;
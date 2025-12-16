import express from 'express';
import cors from "cors";
import "dotenv/config";
import job from "./lib/cron.js";
import authRoutes from "./routes/authRoutes.js"; // Importation des routes d'authentification
import bookRoutes from "./routes/bookRoutes.js"; // Importation des routes de gestion des livres
import { connectDB } from './lib/db.js';




const app = express();                      // creation d'une instance d'express
const PORT= process.env.PORT || 3000 ;      // Définition du port d'écoute de serveur

job.start();                                // Démarrage du travail cron
app.use(express.json());                    // Middleware pour parser le corps des requêtes en JSON 
app.use( cors());                           // Middleware pour gérer les problèmes de CORS

// Dans index.js, avant les autres routes
app.get('/ping', (req, res) => {
    res.send('Pong ! Je suis vivant et connecté.');
});


app.use("/api/auth", authRoutes);           // Utilisation des routes d'authentification
app.use("/api/books",bookRoutes);           // Utilisation des routes de gestion des livres

app.listen(PORT, () => {                    // Définition du port d'écoute de serveur
    console.log(`Server is running on port ${PORT}`); // message de confirmation lorsque le serveur est en cours dexécution
    connectDB();                            // Connexion à la base de données MongoDB
    
});

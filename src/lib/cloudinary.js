import {v2 as cloudinary} from 'cloudinary'; 
import "dotenv/config"; // Importer les variables d'environnement depuis le fichier .env



// configuration de cloudinary avec les clé API

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;
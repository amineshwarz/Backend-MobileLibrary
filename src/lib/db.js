import mangoose from 'mongoose';


export const connectDB = async () => {
    try {
        const conn =await mangoose.connect(process.env.MONGO_URI);      // Connexion à la base de données MongoDB
         console.log(`MongoDB connected: ${conn.connection.host}`);     // Message de confirmation lorsque la connexion est réussie
    } catch (error) {
        console.error("MongoDB connection error:", error);
        process.exit(1); // Exit process with failure
    }
}
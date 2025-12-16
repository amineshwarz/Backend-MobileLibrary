import mangoose from 'mongoose';
import bcrypt from 'bcryptjs';



const userSchema = new mangoose.Schema({
    username: { type: String, required: true, unique: true }, // champ de donnés "username" et leur types 
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, minlength: 6 },
    profileImage: { type: String, default: '' },
}, { timestamps: true }); // Ajoute des champs createdAt et updatedAt automatiquement);

/*---------------------------------------hash du password avant sauvgarde a la bdd------------------------------------*/
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();            // Vérifie si le mot de passe a été modifié
    
    const salt = await bcrypt.genSalt(10);                     // Génère un sel pour le hachage
    this.password = await bcrypt.hash(this.password, salt);    // Hache le mot de passe avec le sel
});
// comparaison de mots de passer taper avec celui qui est haché
userSchema.methods.comparePassword = async function (userPassword) {
    return await bcrypt.compare(userPassword, this.password); // Compare le mot de passe fourni avec le mot de passe haché
};

const User = mangoose.model('User', userSchema);
export default User;
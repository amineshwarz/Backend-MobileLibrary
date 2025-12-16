import mongoose from 'mongoose';



/*--------------------------------------- Schama book ------------------------------------*/
const bookSchema = new mongoose.Schema({
    title: { type: String, required: true },   // titre du livre
    caption: { type: String, required: true }, // description du livre
    image: { type: String, required: true },   // image du livre
    rating: { type: Number, required: true, min:1, max:5},    // note du livre
    user : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
},{ timestamps: true } );


const Book = mongoose.model("Book", bookSchema);
export default Book;
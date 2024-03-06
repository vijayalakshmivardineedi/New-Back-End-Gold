const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Reference to your user model
    cartItems: [
        {

            product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
            quantity: { type: Number, default: 1 },
            name: { type: String, required: true },
            description: { type: String, required: true },
            selectedGoldType: { type: String, required: false },
            selectedSize: { type: String, required: false },
            selectedDiamondType: { type: String, required: false },
            selectedGoldKt: { type: String, required: false },
            originalPrice: { type: String, required: true },
            sizePrice: { type: String, required: false },
            diamondTypePrice: { type: String, required: false },
            goldKtPrice: { type: String, required: false },
            finalTotal: { type: String, required: true },
            image: { type: String, required: true},

            
        },
    ],
}, { timestamps: true });

module.exports = mongoose.model('Cart', cartSchema);



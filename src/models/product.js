const mongoose = require('mongoose');
const productSchema = new mongoose.Schema({
    category: {
        type: String,
        required: true,
        trim: true

    },
    name: {
        type: String,
        required: true,
        trim: true

    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    productCode: {
        type: String,
        required:true
    },//from backed
    productBy: {
        type: String,
        required:false,
        default: "Chatoyer",
    },
    


    quantity: {
        type: Number,
        required: true
    },
    height: {
        type: String,

    },
    width: {
        type: String,

        required: false
    },
    length: {
        type: String,
        required: false
    },
     
    size: [{
        type: String,
        required: true
    }],
    
 
    totalProductWeight: {
        type: String,

        required: false
    },


    goldType: [{
        type: String,
        required: true
    }],
    goldWeight: {
        type: String,
        required: false
    },
    goldKt: [{
        type: String,
        required: true
    }],



    diamondType: [{
        type: String,
        required: false
    }],
    diamondSize: {
        type: String,
        required: false
    },
    diamondShape: {
        type: String,
        required: false
    },
    diamondKt: {
        type: String,
        required: false
    },
    diamondColour: {
        type: String,
        required: false
    },
    diamondCount: {
        type: String,
        required: false
    },
    diamondWeight: {
        type: String,
        required: false
    },
    diamondClarity: {
        type: String,
        required: false
    },
    diamondSettingType: {
        type: String,
        required: false
    },


    stone: {
        type: String,
        required: false
    },
    stoneSize: {
        type: String,
        required: false
    },
    stoneShape: {
        type: String,
        required: false
    },
    stonesCount: {
        type: String,
        required: false
    },
    stoneColour: {
        type: String,
        required: false
    },
    stoneWeight: {
        type: String,
        required: false
    },
    stoneSettingtype: {
        type: String,
        required: false
    },
    
   
    

    diamondprice: {
        type: String,
        required: true
    },
    goldprice: {
        type: String,
        required: true
    },
    stoneprice: {
        type: String,
        required: true
    },
     makingCharges: {
        type: String,
        required: true
    },
    gst: {
        type: String,
        required: true
    },
    offer: { 
        type: String 
    },
    total: {
        type: String,
        required: true
    },


   
    productPictures: [
        { img: { type: String } }
    ],
    videoProduct: {
        type: String
      },
    
    reviews: [
        {
            userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
            review: String
        }
    ],

}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
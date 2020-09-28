const mongoose = require('mongoose');

const itemSchema = mongoose.Schema({
    itemName: {
        type: String,
        required: true
    },
    itemCategory: {
        type: String,
        required: true
    },
    itemPrice: {
        type: Number,
        required: true
    },
    itemCount: {
        type: Number,
        required: true
    },
    purchaseLimit: {
        type: Number,
        required: true
    },
    itemVendorId: {
        type: String,
        required: true
    },
    itemVendorName: {
        type: String,
        required: true
    }
});

itemSchema.pre('save', async function(next){

    next();
});

//fire a function BEFORE a new document is updated in the database
itemSchema.pre('update', async function(next){

    next();
});

const Item = mongoose.model('item', itemSchema);  
// the name 'user' MUST be singular of whatever the collection is called on the database

module.exports = Item; 
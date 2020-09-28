const mongoose = require('mongoose');

const itemInTransaction = {
    itemId: {
        type: String,
        required: true
    },
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
    unitsBought: {
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
}

const transactionSchema = mongoose.Schema({
    buyerId: {
        type: String,
        required: true
    },
    buyerName: {
        type: String,
        required: true
    },
    sellerId: {
        type: String,
        required: true
    },
    sellerName: {
        type: String,
        required: true
    },
    items: {
        type: [itemInTransaction]
    },
    totalAmount: {
        type: String,
        required: true
    },
    transactionDateTime: {
        type: String,
        required: true
    }
});
 
transactionSchema.pre('save', async function(next){

    next();
});

//fire a function BEFORE a new document is updated in the database
transactionSchema.pre('update', async function(next){

    next();
});

const Transaction = mongoose.model('transactions', transactionSchema);  
// the name 'user' MUST be singular of whatever the collection is called on the database

module.exports = Transaction; 
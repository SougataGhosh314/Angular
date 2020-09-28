const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { isEmail, isMobilePhone } = require('validator');

const validateName = function(str){
    return str.match(/^[a-zA-Z][a-zA-Z ]+[a-zA-Z]$/);
}

const validatePhone = function(str){
    return isMobilePhone(str, 'en-IN');
}

const cart_item = {
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
    unitsToBuy: {
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

const status = {
    status: {
        type: String,
        required: true
    },
    estimatedArrival: {
        type: String,
        required: true
    }
}

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        validate: [validateName, 'invalid name'],
        required: [true, 'Do not leave empty']
    },
    phone: {
        type: String,
        validate: [validatePhone, 'invalid phone'],
        required: [true, 'Do not leave empty']
    },
    address: {
        type: String,
        required: [true, 'Do not leave empty']
    },
    email: { 
        type: String,
        required: [true, 'Please enter an email'],
        unique: true,
        lowercase: true,
        validate: [isEmail, 'invalid email']
    },
    password: {
        type: String,
        required: [true, 'Please enter password'],
        minlength: [6, 'invalid password']
    },
    balance: {
        type: Number,
    },
    balanceHistory: {
        type: [
            {
                balanceBefore: {
                    type: Number,
                    required: true
                },
                taggedTransactionId: {
                    type: String,
                    required: true
                },
                balanceAfter: {
                    type: Number,
                    required: true
                }    
            }
        ]
    },
    cart: {
        cartItems: [cart_item],
        cartTotal: {
            type: Number
        }
    },
    deliveryStatus: {
        type: [status]
    }
});

// //fire a function after a new document is saved to the database
// userSchema.post('save', function(doc, next){
//     console.log("New user was created and saved", doc);
//     next();
//     //next() method is necessary for any mongoose middleware or hook
//     //otherwise code will get stuck
// });

//fire a function BEFORE a new document is saved to the database
userSchema.pre('save', async function(next){
    const salt = await bcrypt.genSalt();
    if(this.password.length < 41){
        this.password = await bcrypt.hash(this.password, salt);
        //console.log("Code reaches here");
    }
    next();
});

//fire a function BEFORE a new document is updated in the database
userSchema.pre('update', async function(next){
    const salt = await bcrypt.genSalt();
    if(this.password.length < 41){
        this.password = await bcrypt.hash(this.password, salt);
        //console.log("Code reaches here");
    }
    next();
});

//static method to login user
userSchema.statics.login = async function(email, password){
    const user = await this.findOne({ email });
    if (user) {
        // bcryp.compare hashes entered password and compares it for us
        
        const auth = await bcrypt.compare(password, user.password);
        if (auth) {
            return user;
        }
        throw Error('incorrect password');
    }
    throw Error('incorrect email');


}


const User = mongoose.model('user', userSchema);  
// the name 'user' MUST be singular of whatever the collection is called on the database

module.exports = User; 
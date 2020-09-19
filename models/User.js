const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { isEmail } = require('validator');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Do not leave empty']
    },
    phone: {
        type: String,
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
        validate: [isEmail, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: [true, 'Please enter password'],
        minlength: [6, 'Password should be at least 6 character long. Use a combination of alphabets, numbers and special characters.']
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
    this.password = await bcrypt.hash(this.password, salt);

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
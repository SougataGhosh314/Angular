const User = require('../models/User');
//const Order = require('../models/Order');
const Item = require('../models/Item');
const Transaction = require('../models/Transaction');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const nodemailer = require("nodemailer");
// var xoauth2 = require('xoauth2');
const { isMobilePhone } = require('validator');
const { findById } = require('../models/Transaction');
//const { findById } = require('../models/User');
//const Cart = require('../models/Cart');
const maxAge = 3*60*60*24;
// const { StripeCheckout } = require('../controllers/checkout');

if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}
   
  
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripePublicKey = process.env.STRIPE_PUBLIC_KEY;
const stripe = require('stripe')(stripeSecretKey);
const encrptionKey = process.env.ENCRYPTION_KEY;


////////////////////////////////////////   FUNCTIONS    /////////////////////////////////////////////////
////////////////////////////////////////   FUNCTIONS    /////////////////////////////////////////////////
////////////////////////////////////////   FUNCTIONS    /////////////////////////////////////////////////

const validateName = function(str){
    return str.match(/^[a-zA-Z][a-zA-Z ]+[a-zA-Z]$/);
}

const validatePhone = function(str){
    return isMobilePhone(str, 'en-IN');
}

const createToken = (id, password) => {
    var payload = {  
        id: id,
        password: password
    }
    return jwt.sign(payload, encrptionKey, {
        expiresIn: maxAge
    });

    // header + payload + secret ----> signature
    // header is automatically applied
}

//handle errors
const handleErrors = (err) => {   
    // console.log("@@@@", err.errors, "@@@@");
    // console.log("### ", err.message, " ### ", err.code);
    let errors = { email: '', password: '', name: '', phone: '', new_password: '' };

    if(err.message.includes('user validation failed')){
        //for login:
        //incorrect email
        if (err.message.includes('incorrect email')) {
            errors.email = 'That email is not registered';
        }

        //incorrect password
        if (err.message.includes('incorrect password')) {
            errors.password = 'That password is incorrect';
        }

        //for signup:
        //invalid phone
        if (err.message.includes('invalid phone')) {
            errors.phone = 'Please enter a valid mobile number';
        }

        //invalid email
        if (err.message.includes('invalid email')) {
            errors.email = 'Please enter a valid email address';
        }

        //invalid name
        if (err.message.includes('invalid name')) {
            errors.name = 'Please enter a valid name';
        }

        //invalid password
        if (err.message.includes('invalid password')) {
            errors.password = 'Please enter a valid password (minimum of 6 characters)';
        }

        //duplicate error code
        if (err.code === 11000) {
            errors.email = 'This email is already registered.';
            console.log(errors.email);
            //return errors;
        }
        
        // //destructure properties
        // Object.values(err.errors).forEach(({ properties }) => {
        //     //errors[properties.path] = properties.message;
        // }); 
    }else{
        if (err.message.includes('incorrect password')) {
            errors.password = 'That password is incorrect';
        }

        if (err.message.includes('too short password')) {
            errors.new_password = 'Please enter a valid password (minimum of 6 characters)';
        }
    }


    // //validations error
    // if(err.message.includes('user validation failed')){
    //     //destructure properties
    //     Object.values(err.errors).forEach(({ properties }) => {
    //         errors[properties.path] = properties.message;
    //     });;
    // }
    console.log("hahaha:  ", errors);
    return errors;
}

const handleEditErrors = (name, phone) => {   
    // console.log("@@@@", err.errors, "@@@@");
    // console.log("### ", err.message, " ### ", err.code);
    let errors = { name: '', phone: '' };

    if(!validateName(name)){
        errors.name = 'Please enter a valid name';
    }

    if (!validatePhone(phone)) {
        errors.phone = 'Please enter a valid mobile number';
    }

    console.log("hahaha:  ", errors);
    return errors;
}

function verifyTokenAndGetUserId(token){
    var id = "";
    if (token) {
        jwt.verify(token, 'brainstormSecret', async (err, decodedToken) => {
            if (err) {
                console.log(err.message);
            }else{
                console.log(decodedToken);
                id = decodedToken.id;
            }
       });
    }else{
        console.log("User not logged in currently");
    }
    return id;
}

//delete operation
async function deleteProfile(password, hash, id, res){
    try{
        // const user = await User.create({ name, phone, address, email, password });
        //console.log("##1000##");
        
        //var auth = null;

        // function(err, res){
        //     if (err){
        //         // handle error
        //         auth = null;
        //         console.log(password, " and id: ", id);
        //       }
        //       if (res){
        //         // Send JWT
        //         auth = res;

        //       } else {
        //         // response is OutgoingMessage object that server response http request
        //         //return response.json({success: false, message: 'passwords do not match'});
        //       }
        console.log(password, " and hash: ", hash);
        
        const auth = await bcrypt.compare(password, hash);
        console.log("Compare didn't throw errors");
        console.log("auth: ", auth);

        if (auth) {

            User.findByIdAndDelete(id, function (err, docs) { 
                if (err){ 
                    console.log(err) 
                } 
                else{ 
                    console.log("Deleted : ", docs); 
                } 
            });
            // findByIdAndDelete(id, function (err, docs) { 
            //     if (err){ 
            //         console.log(err) 
            //     } 
            //     else{ 
            //         console.log("Deleted : ", docs); 
            //     } 
            // });
            //this returns a promise/async task
            //creates a document in our collection 'users' in Atlas and returns
            //an instance of an object
            res.cookie('jwt', '', { maxAge: 1 });
            res.status(201).json({ "deleted": "yes" });
        }else{
            throw Error("incorrect password");
        }
        // const token = createToken(user._id);
        // res.cookie('jwt', token, {httpOnly: true, maxAge: maxAge*1000});
        // res.status(201).json(user);
        // res.status(201).json({ user: user._id });    
    }catch(err){
        
        const errors = handleErrors(err);
        res.status(400).json({ errors });
    }
    
    // console.log(email+"   "+password);
    // res.send('new signup');
    return res;
}

async function changePassword(password, hash, newPassword, id, res){
    try{
        // const user = await User.create({ name, phone, address, email, password });
        //console.log("##1000##");
        
        //var auth = null;

        // function(err, res){
        //     if (err){
        //         // handle error
        //         auth = null;
        //         console.log(password, " and id: ", id);
        //       }
        //       if (res){
        //         // Send JWT
        //         auth = res;

        //       } else {
        //         // response is OutgoingMessage object that server response http request
        //         //return response.json({success: false, message: 'passwords do not match'});
        //       }
        console.log(password, " and hash: ", hash, "new Pass: ", newPassword);
        
        const auth = await bcrypt.compare(password, hash);
        console.log("Compare didn't throw errors");
        console.log("auth: ", auth);

        if (auth) {
            if(newPassword.length < 6){
                throw Error("too short password");
            }else{
                const salt = await bcrypt.genSalt();
                newPassword = await bcrypt.hash(newPassword, salt);
                User.findByIdAndUpdate(id, {
                    password: newPassword
                }, {useFindAndModify: false}, function(err, doc){
                    if (err){  
                        console.log(err) 
                    } 
                    else{
                        //const user = await User.login(email, password);
                        const token = createToken(id, newPassword);
                        //res.cookie('jwt', '', { maxAge: 1 });
                        //res.cookie('jwt', token, {httpOnly: true, maxAge: maxAge*1000});
                        console.log("Updated user : ", doc);
                        console.log("160 line");
                        res.cookie('jwt', token, {httpOnly: true, maxAge: maxAge*1000});
                        res.status(201).json({ "updated": "yes", id: id });
                        console.log("163 line");
                    } 
                });
            }
             
            //this returns a promise/async task
            //creates a document in our collection 'users' in Atlas and returns
            //an instance of an object
            
        }else{
            throw Error("incorrect password");
        }

        // const token = createToken(user._id);
        //res.cookie('jwt', "", {maxAge: 1});
        // res.status(201).json(user);
        // res.status(201).json({ user: user._id });    
    }catch(err){        
        const errors = handleErrors(err);
        res.status(400).json({ errors });
    }
    
    // console.log(email+"   "+password);
    // res.send('new signup');
    return res;
}

async function getBuyerNames(transactions){
    var toReturn = transactions;
    //console.log("transactions.length: ", transactions.length);
    for(var i=0; i<transactions.length;i++){
        const user = await User.findById(transactions[i].buyerId);
        //console.log("Buyer object: ", user);
        toReturn[i].buyerId = user.name;
        //console.log("toReturn[i]: ", toReturn[i]);
    }
    return toReturn;
}

async function performAvailabilityChecks(noConflict, cartItems, itemCheckVector){
    for(i=0; i<cartItems.length; i++) {
        itemId = cartItems[i].itemId;
        await Item.findById(itemId, function(err, item){
            if (err) {
                console.log("can't find item", cartItems[i]);
                noConflict = noConflict && false;
            }else{
                if(item.itemCount >= cartItems[i].unitsToBuy){
                    itemCheckVector[i].isBuyable = true;
                    noConflict = noConflict && true;
                }else{
                    itemCheckVector[i].isBuyable = false;
                    noConflict = noConflict && false;
                }

            }
        });
    }
    return { noConflict, itemCheckVector };
}

function processPayment(result, cartTotal){

    return true;

    // stripe.charges.create({
    //     amount: price,
    //     source: stripePublicKey,
    //     currency: 'usd'
    // }).then(function(){
    //     console.log("Charge successful.");
    //     flag = true;
    // }).catch(){
    //     console.log("Charge error.");
    // }
    // return flag;
    // return true;
}





////////////////////////////////////////   GET REQUESTS    /////////////////////////////////////////////////
////////////////////////////////////////   GET REQUESTS    /////////////////////////////////////////////////
////////////////////////////////////////   GET REQUESTS    /////////////////////////////////////////////////
////////////////////////////////////////   GET REQUESTS    /////////////////////////////////////////////////
////////////////////////////////////////   GET REQUESTS    /////////////////////////////////////////////////

module.exports.signup_get = (req, res) => {
    res.render('signup');
}

module.exports.login_get = (req, res) => {
    res.render('login');
}

module.exports.edit_profile_get = (req, res) => {
    res.render('edit_profile');
}

module.exports.delete_profile_get = (req, res) => {
    res.render('delete_profile');
}

module.exports.change_password_get = (req, res) => {
    res.render('change_password');
}

module.exports.logout_get = (req, res) => {
    
    res.cookie('jwt', '', { maxAge: 1 });
    res.redirect('/');

}

module.exports.order_history_get = (req, res) => {
    res.redirect('/transaction_history');
}

module.exports.sell_products_get = (req, res) => {
    res.redirect('/sell_products');
}

module.exports.food_items_get = (req, res) => {
    res.redirect('/food_items');
}

module.exports.my_cart_get = (req, res) => {
    res.redirect('/my_cart');
}

module.exports.balance_history_get = (req, res) => {
    res.render('balance_history');
}


////////////////////////////////////////   POST REQUESTS    /////////////////////////////////////////////////
////////////////////////////////////////   POST REQUESTS    /////////////////////////////////////////////////
////////////////////////////////////////   POST REQUESTS    /////////////////////////////////////////////////
////////////////////////////////////////   POST REQUESTS    /////////////////////////////////////////////////
////////////////////////////////////////   POST REQUESTS    /////////////////////////////////////////////////



//async function marked by 'async' keyword
module.exports.signup_post = async (req, res) => {
    const { name, phone, address, email, password } = req.body;
    
    try{
        const user = await User.create({
            name: name, 
            phone: phone, 
            address: address, 
            email: email, 
            password: password,
            balance: 1000000,
            balanceHistory: [],
            cart: {
                cartItems: [],
                cartTotal: 0
            },
            deliveryStatus: []
        }); 
        //this returns a promise/async task
        //creates a document in our collection 'users' in Atlas and returns
        //an instance of an object

        const token = createToken(user._id, user.password);
        res.cookie('jwt', token, {httpOnly: true, maxAge: maxAge*1000});
        // res.status(201).json(user);
        res.status(201).json({ user: user._id });
    }catch(err){
        const errors = handleErrors(err);
        res.status(400).json({ errors });
    }

}

module.exports.login_post = async (req, res) => {
    const { email, password } = req.body;
    
    try{
        const user = await User.login(email, password);
        const token = createToken(user._id, user.password);
        res.cookie('jwt', token, {httpOnly: true, maxAge: maxAge*1000});

        res.status(200).json({ user: user._id });
    }catch(err){
        const errors = handleErrors(err);
        res.status(400).json({ errors });
    }
    
    // console.log(email+"   "+password);
    // res.send('user login');
}

module.exports.auto_login_post = async (req, res) => {
    //const { id, password } = req.body;
    console.log("inside auto_login_post, req.body: ", req.body);
    const id = req.body.id;
    const password = req.body.new_password;
    console.log("inside auto_login_post, id: ", id);
    console.log("inside auto-login_post, pass: ", password);
    
    try{
        var email;
        let forEmail = await User.findById(id);
        email = forEmail.email;
        console.log("Email found#####", email);

        // const salt = await bcrypt.genSalt();
        
        // password = await bcrypt.hash(password, salt);
        

        const user = await User.login(email, password);
        console.log("Auto-login OK");

        // const salt = await bcrypt.genSalt();
        // const toHash = await bcrypt.hash(password, salt);

        // const token = createToken(id, toHash);
        // res.cookie('jwt', token, {httpOnly: true, maxAge: maxAge*1000});

        res.status(200).json({ user: user._id });
    }catch(err){
        const errors = handleErrors(err);
        res.status(400).json({ errors });
    }
    
    // console.log(email+"   "+password);
    // res.send('user login');
}

//todo: needs work!!!
module.exports.edit_profile_post = async (req, res) => {
    const { name, phone, address } = req.body;
    var id = "";

    const token = req.cookies.jwt;
    // console.log("99999", token);
    if (token) {
        jwt.verify(token, 'brainstormSecret', async (err, decodedToken) => {
            if (err) {
                console.log(err.message);
                // res.locals.user = null;
                // next();
            }else{
                console.log(decodedToken);
                id = decodedToken.id;
                //console.log("middleware: ", res.locals.user);
                //next();
                //lets you carry on with the next middleware
                //i.e., middleware inside the routehandler for /products
            }
       });
    }else{
        console.log("User not logged in currently");
        // res.locals.user = null;
        // next();
    }
    
    try{
        // const user = await User.create({ name, phone, address, email, password });
        //console.log("##1000##");
        var flag = true;
        const errors = handleEditErrors(name, phone);
        if (errors.name!='' || errors.phone!='') {
            flag = false;
            res.status(400).json({ errors });
        }

        if(flag){
            await User.findByIdAndUpdate(id, {
                name: name,
                phone: phone,
                address: address
            }, async function(err, doc){
                if (err) {
                    console.log(err);
                }else{
                    res.status(201).json({ "updated": "yes" });
                    console.log("Updated values for user : ", doc); 
                }
            });
        }
        // const errors = handleErrors(err);
        // res.status(400).json({ errors });
        // res.status(201).json({ "updated": "yes" });
        // console.log("Updated values for user : ", user);

        // const password = user.password;
        // const email = user.email;
        
        // User.findByIdAndUpdate(id, {
        //     name: name,
        //     phone: phone,
        //     address: address
        // }, {useFindAndModify: false}, function(err, doc){
        //     if (err){  
        //         console.log(err) 
        //     } 
        //     else{ 
        //         console.log("Updated values for user : ", doc.email); 
        //     } 
        // }); 
        //this returns a promise/async task
        //creates a document in our collection 'users' in Atlas and returns
        //an instance of an object

        // const token = createToken(user._id);
        // res.cookie('jwt', token, {httpOnly: true, maxAge: maxAge*1000});
        // res.status(201).json(user);


        //!!! needs work: flags and stuff!!!
    }catch(err){
        // const errors = handleErrors(err);
        // res.status(400).json({ errors });
    }
    
    // console.log(email+"   "+password);
    // res.send('new signup');
}

module.exports.delete_profile_post = async (req, res) => {
    const { password } = req.body;

    var id = "";
    var hash = "";

    const token = req.cookies.jwt;
    
    //, user.password
    if (token) {
        jwt.verify(token, 'brainstormSecret', async (err, decodedToken) => {
            if (err) {
                
                console.log(err.message);
                // res.locals.user = null;
                // next();
            }else{
                
                console.log(decodedToken);
                id = decodedToken.id;
                //console.log("middleware: ", res.locals.user);
                //next();
                //lets you carry on with the next middleware
                //i.e., middleware inside the routehandler for /products
            }
       });
    }else{
        console.log("User not logged in currently");
        // res.locals.user = null;
        // next();
    }

    // else{
    //     throw Error('incorrect password');
    // }
    User.findOne({_id: id}, function (err, docs) { 
        if (err){ 
            console.log(err) 
        } 
        else{ 
            console.log("Result : ", docs); 
            hash = docs.password;

            res = deleteProfile(password, hash, id, res);

            //return hash;
        }
        //console.log("Got the hash: ", hash);
    });
    //console.log("Got the hash: ", hash);
    //console.log("res: ", res);
    
} 

module.exports.change_password_post = async (req, res) => {
    //console.log("99999", token);
    const { password, newPassword } = req.body;
    console.log("99999", password);
    ///////////////////////////////////////////
    //Currently doesn't require password. But should. So TODO
    ///////////////////////////////////////////

    //console.log(deleteConfirmation);
    var id = "";
    var hash = "";
    //var email = "";

    const token = req.cookies.jwt;
    
    //, user.password
    if (token) {
        jwt.verify(token, 'brainstormSecret', async (err, decodedToken) => {
            if (err) {
                
                console.log(err.message);
                // res.locals.user = null;
                // next();
            }else{
                
                console.log(decodedToken);
                id = decodedToken.id;
                //console.log("middleware: ", res.locals.user);
                //next();
                //lets you carry on with the next middleware
                //i.e., middleware inside the routehandler for /products
            }
       });
    }else{
        console.log("User not logged in currently");
        // res.locals.user = null;
        // next();
    }

    // else{
    //     throw Error('incorrect password');
    // }
    User.findOne({_id: id}, function (err, docs) { 
        if (err){ 
            console.log(err) 
        } 
        else{ 
            console.log("Result : ", docs); 
            hash = docs.password;

            res = changePassword(password, hash, newPassword, id, res);

            //return hash;
        }
        //console.log("Got the hash: ", hash);
    });
    //console.log("Got the hash: ", hash);
    //console.log("res: ", res);
    
}

////// Home page//... functions

module.exports.load_inventory_post = async (req, res) => {
    const { dummyBody } = req.body;
    const token = req.cookies.jwt;
    const id = verifyTokenAndGetUserId(token);

    try{
        Item.find({ itemVendorId: id }, function(err, docs){
            if (err) {
                console.log("Ran into an error while fetching inventory: ", err);
            }else{
                res.status(201).json({ docs });
                console.log("Past orders fetched: ", docs);
            }
        });
    }catch(err){
        res.status(400).json({ "error": "Error in load inventory post request" });
    }
    
}

module.exports.sell_products_post = async (req, res) => {
    const { name, category, price, count, purchaseLimit } = req.body;
    const token = req.cookies.jwt;
    const id = verifyTokenAndGetUserId(token);

    const user = await User.findById(id);
    const itemVendorName = user.name;

    try{
        const item = await Item.create({
            itemName: name,
            itemCategory: category,
            itemPrice: price,
            itemCount: count,
            purchaseLimit: purchaseLimit,
            itemVendorId: id,
            itemVendorName: itemVendorName
        });
        if (!item) {
            console.log("Ran into an error while adding item: ", err);
            res.status(400).json({ "error": "Error in adding item" });
        }else{
            console.log("Added item: ", item);
            res.status(201).json({ item });
        }
    }catch(err){
        console.log("Error in sell products post rquest: item addition in items");
    }
    
}

module.exports.get_items_post = async (req, res) => {
    const { category } = req.body;
    const token = req.cookies.jwt;
    const id = verifyTokenAndGetUserId(token);

    try{
        const docs = await Item.find({ itemCategory: category, itemVendorId: {$ne: id}});
        if (!docs) {
            console.log("Ran into an error while fetching "+category+" items: ", err);
            res.status(400).json({ "Error: ": "Fetching items" });
        }else{
            console.log(category + " items fetched fetched: ", docs);
            res.status(201).json({ docs });
        }
    }catch(err){
        res.status(400).json({ "error": "Error in get items post request" });
    }
    
}

module.exports.add_to_cart_post = async (req, res) => {
    const { itemId, unitsToBuy } = req.body;
    const token = req.cookies.jwt;
    const id = verifyTokenAndGetUserId(token);

    const item = await Item.findById(itemId);
    const itemTotal = item.itemPrice*unitsToBuy;

    const user = await User.findByIdAndUpdate(id, {
        $addToSet: { 
            "cart.cartItems": {
                itemId: itemId,
                itemName: item.itemName,
                itemCategory: item.itemCategory,
                itemPrice: item.itemPrice,
                unitsToBuy: unitsToBuy,
                itemVendorId: item.itemVendorId,
                itemVendorName: item.itemVendorName
            }
        },
        $inc: {
            "cart.cartTotal": itemTotal
        }
    }, {useFindAndModify: false, upsert: true});

    if (!user) {
        console.log("Some error in add to cart...");
        res.status(400).json({ "Success": "false" });
    }else{
        res.status(201).json({ "Success": "true" });
        console.log("Cart updated for the user: ", user); 
    }
    
}

module.exports.my_cart_post = async (req, res) => {
    const token = req.cookies.jwt;
    const id = verifyTokenAndGetUserId(token);
    const user = await User.findById(id);
    if (!user) {
        console.log("Ran into an error while fetching cart items: ", err);
        res.status(400).json({ "error": "yes" });
    }else{
        const cart = user.cart;
        res.status(201).json({ cart });
    }
}

module.exports.remove_from_cart_post = async (req, res) => {
    const { itemId } = req.body;
    const token = req.cookies.jwt;
    const id = verifyTokenAndGetUserId(token);

    const user = await User.findById(id);
    var toDecrement;
    user.cart.cartItems.forEach((item) => {
        if (item.itemId === itemId) {
            toDecrement = parseInt(item.itemPrice)*parseInt(item.unitsToBuy);
        }
    });

    const done = await User.findByIdAndUpdate(id, {
        $pull: { 
            "cart.cartItems": {
                itemId: itemId
            }
        },
        $inc: {
            "cart.cartTotal": (-1)*toDecrement
        }
    }, { new: true, useFindAndModify: false });

    if (!done) {
        console.log("Some error in remove from cart...");
        res.status(400).json({ "Success": "false" });
    }else{
        res.status(201).json({ "Success": "true" });
        console.log("Cart updated for the user: ", done); 
    }
    
}

module.exports.my_cart_checkout_post = async (req, res) => {
    const token = req.cookies.jwt;
    const id = verifyTokenAndGetUserId(token);
    var i;

    const user = await User.findById(id);
    const cartTotal = user.cart.cartTotal;
    const cartItems = user.cart.cartItems;
    const buyerName = user.name;

    var itemCheckVector = [];
    var sellersAndTheirItems = [];
    var sellers = [];

    for(i=0; i<cartItems.length; i++) {

        if(!sellers.includes(
            cartItems[i].itemVendorId    
        )){
            sellers.push(cartItems[i].itemVendorId);
            sellersAndTheirItems.push(
                {
                    sellerId: cartItems[i].itemVendorId,
                    sellerName: cartItems[i].itemVendorName,
                    items: [{
                        itemId: cartItems[i].itemId,
                        itemName: cartItems[i].itemName,
                        itemCategory: cartItems[i].itemCategory,
                        itemPrice: cartItems[i].itemPrice,
                        unitsBought: cartItems[i].unitsToBuy,
                        itemVendorId: cartItems[i].itemVendorId,
                        itemVendorName: cartItems[i].itemVendorName
                    }],
                    totalPrice: parseInt(cartItems[i].itemPrice)*parseInt(cartItems[i].unitsToBuy)
                }
            );
        }else{
            sellersAndTheirItems.forEach(sellerAndItems => {
                if(cartItems[i].itemVendorId === sellerAndItems.sellerId){
                    sellerAndItems.items.push({
                        itemId: cartItems[i].itemId,
                        itemName: cartItems[i].itemName,
                        itemCategory: cartItems[i].itemCategory,
                        itemPrice: cartItems[i].itemPrice,
                        unitsBought: cartItems[i].unitsToBuy,
                        itemVendorId: cartItems[i].itemVendorId,
                        itemVendorName: cartItems[i].itemVendorName
                    });
                    sellerAndItems.totalPrice+= parseInt(cartItems[i].itemPrice)*parseInt(cartItems[i].unitsToBuy)
                }
            });
        }

        itemCheckVector.push({
            itemId: cartItems[i].itemId,
            itemName: cartItems[i].itemName,
            isBuyable: false
        });
    }

    var noConflict = true;
    const result = await performAvailabilityChecks(noConflict, cartItems, itemCheckVector);

    if (!result.noConflict) {
        //Should return itemCheckVector also, make it happen!!!
        res.status(400).json({
            "Transaction": "Failure",
            "reason": "conflict"
        });
    }else{
        if(processPayment(result, cartTotal)){

            try{

                // TRICKY !!! think!
                sellersAndTheirItems.forEach( async sellerAndItems => {
                    // create unique transaction for each seller-buyer pair
                    
                    const transaction = await Transaction.create({
                        buyerId: id,
                        buyerName: buyerName,
                        sellerId: sellerAndItems.sellerId,
                        sellerName: sellerAndItems.sellerName,
                        items: sellerAndItems.items,
                        totalAmount: sellerAndItems.totalPrice,
                        transactionDateTime: Date().toLocaleString()
                    });

                    if (!transaction) {
                        console.log("Some error in creating transaction: ");
                        res.status(400).json({ "Transaction": "Failure" });
                    }else{
                        console.log("Created transaction: ", transaction);
                    }

                    // for each item, deduct unitsBought from item count
                    sellerAndItems.items.forEach( async item => {
                        try{
                            await Item.findByIdAndUpdate(item.itemId, {
                                $inc: {
                                    itemCount: (-1)*parseInt(item.unitsBought)
                                }
                            }, { new: true, useFindAndModify: false });
                        }catch(err){
                            console.log("error in updating itemCount:", err);
                        }
                    });

                    const seller = await User.findById(sellerAndItems.sellerId);
                    var balanceBefore = seller.balance;

                    // increase balance of the seller
                    try{
                        await User.findByIdAndUpdate(sellerAndItems.sellerId, {
                            $inc: {
                                balance: sellerAndItems.totalPrice
                            },
                            $addToSet: {
                                balanceHistory: {
                                    balanceBefore: balanceBefore,
                                    taggedTransactionId: transaction._id,
                                    balanceAfter: balanceBefore + sellerAndItems.totalPrice
                                }
                            }
                        }, { new: true, useFindAndModify: false });
                    }catch(err){
                        console.log("error in increasing seller balance: ", err);
                    }

                    const buyer = await User.findById(id);
                    balanceBefore = buyer.balance;

                    // decrease balance of the buyer
                    try{
                        await User.findByIdAndUpdate(id, {
                            $inc: {
                                balance: (-1)*sellerAndItems.totalPrice
                            },
                            $addToSet: {
                                balanceHistory: {
                                    balanceBefore: balanceBefore,
                                    taggedTransactionId: transaction._id,
                                    balanceAfter: balanceBefore - sellerAndItems.totalPrice
                                }
                            }
                        }, { new: true, useFindAndModify: false });
                    }catch(err){
                        console.log("error in decreasing buyer's balance: ", err);
                    }
                    

                });

                // clear buyer's cart
                try{
                    await User.findByIdAndUpdate(id, {
                        $set: {
                            "cart.cartItems": [],
                            "cart.cartTotal": "0"
                        }
                    }, { new: true, useFindAndModify: false });
                }catch(err){
                    console.log("some error in clearing buyer's cart");
                }

                res.status(201).json({
                    "Transaction": "Success"
                });

            }catch(err){
                console.log("error printed: ", err);
            }

        }else{
            console.log("Error in payment. Transaction denied.");
            res.status(400).json({ "Transaction": "Failure" });
        }
    }
}

module.exports.confirm_payment_and_update_balance_post = async (req, res) => {
    const token = req.cookies.jwt;
    const id = verifyTokenAndGetUserId(token);
    var { stripeTokenId, amount } = req.body;
    // const user = await User.findById(id);
    // const buyerName = user.name;

    // var toCharge = price/100;
    console.log(stripeTokenId, " :   ", amount);
    amount = parseInt(Math.floor(amount));

    try{
        stripe.charges.create({
            amount: amount,
            source: stripeTokenId,
            currency: 'usd',
            description: "Shopping for products.",
            shipping: {
                    "name": "Raj Kumar",
                    "address": {
                        "city": "Waxahachie", 
                        "country": "United States", 
                        "line1": "219 N Patrick St", 
                        "line2": "",
                        "postal_code": "75165",
                        "state": "TX"
                    }
                }
        }).then(async function(){
            console.log("Charge successful.");
            const user = await User.findByIdAndUpdate(id, {
                $inc: {
                    balance: parseInt((amount/100)*72.2256)
                },
            }, {new:true, useFindAndModify: false });

            res.status(201).json({
                "Charge": "Successful"
            });
        });
    }catch(err){
        log("Error stripe: ", err)
    }

}

module.exports.order_history_post = async (req, res) => {
    const { dummyBody } = req.body;
    const token = req.cookies.jwt;
    const id = verifyTokenAndGetUserId(token);

    try{
        var transactions = await Transaction.find({
            $or: [{ buyerId: id }, { sellerId: id }]
        }).sort({ _id: -1 });

        if (!transactions) {
            console.log("Ran into an error while fetching transactions: ");
        }else{
            console.log("Transactions fetched: ", transactions);
            res.status(201).json({ transactions });
        }
    }catch(err){
        res.status(400).json({ "error": "Error in order history post request" });
    }
    
}

async function generateBalanceHistory(id, balanceHistory, res){
    var balanceHistoryObject = [];
    var count = balanceHistory.length;
    const user = await User.findById(id);
    
    balanceHistory.forEach(async obj => {
        await Transaction.findById(obj.taggedTransactionId, function(err, transaction){
            balanceHistoryObject.push({
                balanceBefore: obj.balanceBefore,
                taggedTransaction: transaction,
                balanceAfter: obj.balanceAfter
            }); 
        });
        count--;

        if(count === 0){
            balanceHistoryObject = balanceHistoryObject
            res.status(201).json({ balanceHistoryObject, stripePublicKey });
        }
    });
    //console.log("generateBalanceHistory: ", balanceHistoryObject);
    //return balanceHistoryObject;
    
}

module.exports.balance_history_post = async (req, res) => {
    const { dummyBody } = req.body;
    const token = req.cookies.jwt;
    const id = verifyTokenAndGetUserId(token);

    try{
        var user = await User.findById(id);

        if (!user) {
            console.log("Ran into an error while fetching balance history: ");
        }else{
            console.log("User fetched: ", user);
            await generateBalanceHistory(id, user.balanceHistory, res);
            //var balanceHistoryObject = 
            //console.log("generateBalanceHistory: ", await balanceHistoryObject);
            // res.status(201).json({ balanceHistoryObject });
        }
    }catch(err){
        res.status(400).json({ "error": "Error in order history post request" });
    }
}

module.exports.send_otp_post = async (req, res) => {
    const { type, email } = req.body;

    let otp = Math.floor(Math.random() * (999999 - 100000) ) + 100000;
    if (type === "email") {
        var smtpTransport = nodemailer.createTransport(
            "smtps://titan6thanos@gmail.com:"
            +encodeURIComponent('qaz123zxc#S314G') 
            + "@smtp.gmail.com:465"
        );

        console.log("Email: ", email);
        // return false;

        var mailOptions;
        mailOptions={
            to : email,
            subject : "Brainstorm products: Please confirm your Email account",
            html : "Your verification code is: " + otp 
        }

        console.log(mailOptions);
        smtpTransport.sendMail(mailOptions, function(error, response){
            if(error){
                console.log(error);
                res.status(400).json({ "error": "Error in order history post request" });
     }      else{
                console.log("Message sent: " + response.message);
                res.status(201).json({ "message": "sent", otp: otp });
            }
        });
    }
}

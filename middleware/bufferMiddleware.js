const jwt = require('jsonwebtoken');
const Item = require('../models/Item');
// const Order = require('../models/Order');
const User = require('../models/User');
// const Cart = require('../models/Cart');

//const bcrypt = require('bcrypt');
//const { __esModule } = require('validator/lib/isAlpha');

async function resolveVendorNames(docs){
    var docsToReturn = docs;

    try{
        for(var i = 0; i < docs.length; i++) {
            var name = '';
            await User.findOne({ _id: docs[i].itemVendor }, function(err, doc){
                if (err) {
                    console.log(err);
                }else{
                    //console.log(doc.name);
                    name = doc.name;
                    //docsToReturn[i].itemVendor = doc.name;
                }
            });
            docsToReturn[i].itemVendor = name;
            console.log("hahaha", docsToReturn[i].itemVendor);
            //console.log(obj.itemName);
        }
    }catch(err){
        console.log(err);
    }
    return docsToReturn;
};

// async function getNameFromId(id){
//     var name = "";
//     //console.log(id);
//     try{
//         await User.findOne({ _id: id }, function(err, doc){
//             if (err) {
//                 console.log(err);
//             }else{
//                 //console.log(doc.name);
//                 name = doc.name;
//                 //docsToReturn[i].itemVendor = doc.name;
//             }
//         });
//     }catch(err){
//         console.log("Some error in find name from id", err);
//     }
//     return name;
// }

async function getDetailsFromItemId(docs){
    var docsToReturn = [];
    var itemId, itemName, itemCategory, itemVendor, itemCount;

    try{
        for(var i = 0; i < docs.items.length; i++) {
            itemId = docs.items[i].itemId;
            itemCount = docs.items[i].unitsToBuy;

            await Item.findOne({ _id: itemId }, async function(err, doc){
                if (err) {
                    console.log(err);
                }else{
                    //console.log(doc.name);
                    itemName = doc.itemName;
                    itemCategory = doc.itemCategory;
                    var idToUse = doc.itemVendor
                    //console.log("vendorId: ", doc.itemVendor);
                    const user = await User.findById(idToUse);
                    itemVendor = user.name;
                    //docsToReturn[i].itemVendor = doc.name;
                }
            });
            docsToReturn.push({
                itemName: itemName,
                itemCategory: itemCategory,
                itemCount: itemCount,
                itemVendor: itemVendor,
            });
            // docsToReturn[i].itemVendor = name;
            // console.log("hahaha", docsToReturn[i].itemVendor);
            //console.log(obj.itemName);
        }
    }catch(err){
        console.log(err);
    }
    return docsToReturn;
};

const fetchMyInventory = (req, res, next) => { 

    const token = req.cookies.jwt;

    //check if token exists
    if (token) {

        jwt.verify(token, 'brainstormSecret', async (err, decodedToken) => {
             if (err) {
                 console.log(err.message);
                 //res.redirect('/login'); 
                 next();
             }else{
                    try{
                        await Item.find({ itemVendor: decodedToken.id }, async function(err, docs){
                            if (err) {
                                console.log("Ran into an error while fetching inventory: ", err);
                            }else{
                                //res.locals.my_inventory = docs;
                                res.locals.my_inventory = docs;
                                //res.status(201).json({ docs });
                                console.log("Invrntory fetched: ", docs);
                            }
                        });
                    }catch(err){
                        console.log("some error in fetch inventory middleware");
                        //res.status(400).json({ "error": "Error in order history post request" });
                    }
                    next();
                } 
                 //lets you carry on with the next middleware
                 //i.e., middleware inside the routehandler for /products
        });
        
    }else{
        console.log("Ran into an error: fetch inventory middleware");
        //res.redirect('/login');
        next();
    }
}

const fetchOrderHistory = (req, res, next) => { 

    const token = req.cookies.jwt;

    //check if token exists
    if (token) {

        jwt.verify(token, 'brainstormSecret', async (err, decodedToken) => {
             if (err) {
                 console.log(err.message);
                 //res.redirect('/login'); 
                 next();
             }else{
                    try{
                        await Order.find({ userId: decodedToken.id }, function(err, docs){
                            if (err) {
                                console.log("Ran into an error while fetching past orders: ", err);
                            }else{
                                res.locals.past_orders = docs;
                                //res.status(201).json({ docs });
                                console.log("Past orders fetched: ", docs);
                            }
                        });
                    }catch(err){
                        console.log("some error in fetch history middleware");
                        //res.status(400).json({ "error": "Error in order history post request" });
                    }
                    next();
                } 
                 //lets you carry on with the next middleware
                 //i.e., middleware inside the routehandler for /products
        });
        
    }else{
        console.log("Ran into an error: fetch order history middleware");
        //res.redirect('/login');
        next();
    }
}

const fetchFoodItems = (req, res, next) => { 
    try{
        Item.find({ itemCategory: "food" }, async function(err, docs){
            if (err) {
                console.log("Ran into an error while fetching food items: ", err);
                next();
                //next();
            }else{
                console.log("Food items fetched fetched: ", docs);
                //docs = await getNameFromId(docs);
                //console.log(docs);

                var foods = await resolveVendorNames(docs)
                res.locals.food_items = foods;
                next();
                // .then(function(res){
                //     if (res) {
                //         res.locals.food_items = res; 
                //         console.log(".then() respose: ", res);
                //     }else{
                //         console.log("some error in getNamefromid promise");
                //         //res.locals.food_items = foods; 
                //     }
                // });
                // array = foods; 
                //console.log("FOODS:  ", food_items);

                //next();
                //res.status(201).json({ docs });
            }
        });                       
    }catch(err){
        console.log("some error in fetch inventory middleware");
        next();
        //res.status(400).json({ "error": "Error in order history post request" });
    }
} 

const fetchMyCart = (req, res, next) => { 

    const token = req.cookies.jwt;
    //check if token exists
        if (token) {
            jwt.verify(token, 'brainstormSecret', async (err, decodedToken) => {
                if (err) {
                    console.log(err.message);
                    //res.redirect('/login'); 
                    next();
                }else{
                        await Cart.findOne({ userId: decodedToken.id }, async function(err, docs){
                            if (err) {
                                console.log("Ran into an error while fetching cart items: ", err);
                            }else{
                                
                                //res.status(201).json({ docs });
                                // console.log(docs.items.itemVendor);
                                res.locals.cart_items = docs;
                                
                                const value = await getDetailsFromItemId(docs);
                                
                                //res.locals.cart_items_reduced = value;
                                next();
                                console.log("Cart items fetched: ", res.locals.cart_fetched);
                                
                            }
                        });
                        next();
                    } 
                    //lets you carry on with the next middleware
                    //i.e., middleware inside the routehandler for /products
            });
        }else{
            console.log("Ran into an error: fetch cart items middleware");
            //res.redirect('/login');
            next();
        }

}

    //lets you carry on with the next middleware
    //i.e., middleware inside the routehandler for /products


//console.log("Ran into an error: fetch inventory middleware");
//res.redirect('/login');

// // check current user 
// const checkUser = (req, res, next) => {
//     const token = req.cookies.jwt;
//     var passwordFromCurrentToken = "";
//     if (token) {
//         jwt.verify(token, 'brainstormSecret', async (err, decodedToken) => {
//             if (err) {
//                 console.log(err.message);
//                 res.locals.user = null;
//                 next();
//             }else{
//                 console.log(decodedToken);
//                 let user = await User.findById(decodedToken.id);
//                 passwordFromCurrentToken = decodedToken.password;
//                 if(passwordFromCurrentToken === user.password){
//                     console.log(user);
//                     console.log("$#$#$#");
//                     res.locals.user = user;
//                 }else{
//                     res.locals.user = null;
//                 }
//                 //console.log("middleware: ", res.locals.user);
//                 next();
//                 //lets you carry on with the next middleware
//                 //i.e., middleware inside the routehandler for /products
//             }
//        });
//     }else{
//         res.locals.user = null;
//         next();
//     }
// }

module.exports = { fetchOrderHistory, fetchMyInventory, fetchFoodItems, fetchMyCart };

//module.exports = { requireAuth, checkUser };
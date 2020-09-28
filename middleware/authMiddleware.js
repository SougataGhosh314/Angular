const jwt = require('jsonwebtoken');
const User = require('../models/User');

const bcrypt = require('bcrypt');
//const { __esModule } = require('validator/lib/isAlpha');
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}
const encrptionKey = process.env.ENCRYPTION_KEY;
 
const requireAuth = (req, res, next) => {

    const token = req.cookies.jwt;

    //check if token exists
    if (token) {

        jwt.verify(token, encrptionKey, async (err, decodedToken) => {
             if (err) {
                 console.log(err.message);
                 res.redirect('/login');
             }else{
                 const user = await User.findOne({ _id: decodedToken.id });
                 if (user) {
                    // bcryp.compare hashes entered password and compares it for us
                    // const salt = bcrypt.genSalt();
                    // const passwordFromToken = await bcrypt.hash(decodedToken.password, salt);
                    
                    console.log(decodedToken.password, "from decoded and from db: ", user.password);
                    if (decodedToken.password === user.password) {
                        // code won't reach else
                    }else{
                        res.locals.user = null;
                        res.redirect('/login');
                    }
                }else{
                    res.locals.user = null;
                    res.redirect('/login');
                }
                 next();
                 //lets you carry on with the next middleware
                 //i.e., middleware inside the routehandler for /products
             }
        });
        
    }else{
        res.redirect('/login');
    }
}

// check current user 
const checkUser = (req, res, next) => {
    const token = req.cookies.jwt;
    var passwordFromCurrentToken = "";
    if (token) {
        jwt.verify(token, 'brainstormSecret', async (err, decodedToken) => {
            if (err) {
                console.log(err.message);
                res.locals.user = null;
                next();
            }else{
                console.log(decodedToken);
                let user = await User.findById(decodedToken.id);
                passwordFromCurrentToken = decodedToken.password;
                if(user){
                    if(passwordFromCurrentToken === user.password){
                        console.log(user);
                        console.log("$#$#$#");
                        res.locals.user = user;
                    }else{
                        res.locals.user = null;
                    }
                }else{
                    res.locals.user = null;
                }
                //console.log("middleware: ", res.locals.user);
                next();
                //lets you carry on with the next middleware
                //i.e., middleware inside the routehandler for /products
            }
       });
    }else{
        res.locals.user = null;
        next();
    }
}


module.exports = { requireAuth, checkUser };
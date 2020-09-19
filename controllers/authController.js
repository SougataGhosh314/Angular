const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const createToken = (id, password) => {
    var payload = {
        id: id,
        password: password
    }
    return jwt.sign(payload, 'brainstormSecret', {
        expiresIn: maxAge
    });

    // header + payload + secret ----> signature
    // header is automatically applied
}

//handle errors
const handleErrors = (err) => {
    console.log(err.message, err.code);
    let errors = { email: '', password: '' };

    //incorrect email
    if (err.message === 'incorrect email') {
        errors.email = 'That email is not registered';
    }

    //incorrect password
    if (err.message === 'incorrect password') {
        errors.password = 'That password is incorrect';
    }

    //duplicate error code
    if (err.code === 11000) {
        errors.email = 'This email is already registered.';
        return errors;
    }

    //validations error
    if(err.message.includes('user validation failed')){
        //destructure properties
        Object.values(err.errors).forEach(({ properties }) => {
            errors[properties.path] = properties.message;
        });;
    }
    return errors;
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

const maxAge = 3*60*60*24;

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


//async function marked by 'async' keyword
module.exports.signup_post = async (req, res) => {
    const { name, phone, address, email, password } = req.body;
    
    try{
        const user = await User.create({ name, phone, address, email, password }); 
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
    
    // console.log(email+"   "+password);
    // res.send('new signup');
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
        
        User.findByIdAndUpdate(id, {
            name: name,
            phone: phone,
            address: address
        }, {useFindAndModify: false}, function(err, doc){
            if (err){  
                console.log(err) 
            } 
            else{ 
                console.log("Updated values for user : ", doc.email); 
            } 
        }); 
        //this returns a promise/async task
        //creates a document in our collection 'users' in Atlas and returns
        //an instance of an object

        // const token = createToken(user._id);
        // res.cookie('jwt', token, {httpOnly: true, maxAge: maxAge*1000});
        // res.status(201).json(user);


        //!!! needs work: flags and stuff!!!
        res.status(201).json({ "updated": "yes" });
    }catch(err){
        const errors = handleErrors(err);
        res.status(400).json({ errors });
    }
    
    // console.log(email+"   "+password);
    // res.send('new signup');
}

module.exports.delete_profile_post = async (req, res) => {
    //console.log("99999", token);
    const { password } = req.body;
    console.log("99999", password);
    ///////////////////////////////////////////
    //Currently doesn't require password. But should. So TODO
    ///////////////////////////////////////////

    //console.log(deleteConfirmation);
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

module.exports.logout_get = (req, res) => {
    
    res.cookie('jwt', '', { maxAge: 1 });
    res.redirect('/');

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
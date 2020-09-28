const express = require('express');
const mongoose = require('mongoose'); 
const authRoutes = require('./routes/authRoutes');
const cookieParser = require("cookie-parser");
const { requireAuth, checkUser } = require('./middleware/authMiddleware');
//const { fetchOrderHistory, fetchMyInventory, fetchFoodItems, fetchMyCart } = require('./middleware/bufferMiddleware');


if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const dbUri = process.env.DB_URI;
//console.log(stripeSecretKey, "   :   ", stripePublicKey);


const app = express();

// middleware
app.use(express.static('public'));
app.use(express.json());
app.use(cookieParser());

// view engine
app.set('view engine', 'ejs');

// database connection
//const dbURI = 'mongodb+srv://brainstorm:qaz123zxc@cluster0.6hwjp.mongodb.net/products-auth';
mongoose.connect(dbUri, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex:true })
  .then((result) => app.listen(3000))
  .catch((err) => console.log(err));

// routes
app.get('*', checkUser);
app.get('/', requireAuth, (req, res) => res.render('home'));
app.get('/products', requireAuth, (req, res) => res.render('products'));
app.get('/edit_profile', requireAuth, (req, res) => res.render('edit_profile'));
app.get('/delete_profile', requireAuth, (req, res) => res.render('delete_profile'));
app.get('/change_password', requireAuth, (req, res) => res.render('change_password'));
app.get('/buy_apples', requireAuth, (req, res) => res.render('buyApples'));
app.get('/order_history', requireAuth, (req, res) => res.render('transaction_history'));
app.get('/sell_products', requireAuth, (req, res) => res.render('sell_products'));
app.get('/food_items', requireAuth, (req, res) => res.render('food_items'));
app.get('/my_cart', requireAuth, (req, res) => res.render('my_cart'));
app.get('/balance_history', requireAuth, (req, res) => res.render('balance_history'));
// use requireAuth <--- nice middleware function to protect routes from
// unauthenticated users

app.use(authRoutes);

//app.listen(3000);

// //cookies
// app.get('/set-cookies', (req, res) => {

//   //res.setHeader('Set-Cookie', 'newUser=true');

//   res.cookie('newUser', false);
//   // res.cookie('isEmployee', true, {maxAge: 1000*60*60*24, secure: true});
//   res.cookie('isEmployee', true, {maxAge: 1000*60*60*24, httpOnly: true});
//   // secure --> true means transfer only over https
//   // httpOnly --> true means transfer between client and server only not from document console


//   res.send('You got the cookie');

// });

// app.get('/read-cookies', (req, res) => {

//   const cookies = req.cookies;
//   console.log(cookies);

//   res.send(cookies);

//   // res.send(cookies.isEmployee);
  
// });


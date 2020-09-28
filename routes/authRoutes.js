const express = require("express");

const { Router } = require('express');
const authController = require('../controllers/authController');

const router = Router();

router.get('/signup', authController.signup_get);
router.post('/signup', authController.signup_post);

router.get('/login', authController.login_get);
router.post('/login', authController.login_post);

router.post('/auto_login', authController.auto_login_post);

router.get('/logout', authController.logout_get);

router.get('/edit_profile', authController.edit_profile_get);
router.post('/edit_profile', authController.edit_profile_post);

router.get('/delete_profile', authController.delete_profile_get);
router.post('/delete_profile', authController.delete_profile_post);

router.get('/change_password', authController.change_password_get);
router.post('/change_password', authController.change_password_post);

router.get('/order_history', authController.order_history_get);
router.post('/order_history', authController.order_history_post);

router.get('/sell_products', authController.sell_products_get);
router.post('/sell_products', authController.sell_products_post);
router.post('/load_inventory', authController.load_inventory_post);

router.get('/food_items', authController.food_items_get);
// router.post('/food_items', authController.food_items_post);

router.post('/get_items', authController.get_items_post);

router.get('/my_cart', authController.my_cart_get);
router.post('/my_cart', authController.my_cart_post);
router.post('/my_cart_checkout', authController.my_cart_checkout_post);


router.post('/add_to_cart', authController.add_to_cart_post);
router.post('/remove_from_cart', authController.remove_from_cart_post);

router.get('/balance_history', authController.balance_history_get);
router.post('/balance_history', authController.balance_history_post);

router.post('/confirm_payment_and_update_balance', authController.confirm_payment_and_update_balance_post);

router.post('/send_otp', authController.send_otp_post);

module.exports = router;
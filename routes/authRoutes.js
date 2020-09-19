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

module.exports = router;
const express = require('express');
const passport = require('passport');
const router = express.Router();
const User = require('../models/user');
const catchAsync = require('../utils/catchAsync');
const usersController = require('../controllers/usersController');


router.route('/register')
    //register page
    .get(usersController.renderRegisterForm)
    //register process
    .post(catchAsync(usersController.registerUser));

router.route('/login')
    //login page
    .get(usersController.renderLoginForm)
    //login process
    .post(passport.authenticate('local', { failureFlash: true, failureRedirect: '/login', keepSessionInfo: true }), usersController.loginUser);

//logout process
router.get('/logout', usersController.logoutUser);

module.exports = router;
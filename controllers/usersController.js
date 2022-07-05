const User = require('../models/user');

// show register form
module.exports.renderRegisterForm = (req, res) => {
    res.render('users/register');
};

// process of registering user
module.exports.registerUser = async(req, res) => {
    try {
        const { username, password, email, phoneNumber } = req.body;
        const user = new User({ username, email, phoneNumber });
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, (err) => {
            if (err) return next(err);
            req.flash('success', 'Welcome to YelpCamp!');
            res.redirect('/campgrounds');
        });
    } catch (error) {
        req.flash('error', error.message);
        res.redirect('/register');
    }
};

//show login form
module.exports.renderLoginForm = (req, res) => {
    res.render('users/login');
};

//process of loginning
module.exports.loginUser = (req, res) => {
    req.flash('success', 'Welcome back!!!');
    const returnToUrl = req.session.returnTo || '/campgrounds';
    delete req.session.returnTo;
    res.redirect(returnToUrl);
};

//process of logoutting
module.exports.logoutUser = (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);
        req.flash('success', 'user logout');
        res.redirect('/campgrounds');
    });
};
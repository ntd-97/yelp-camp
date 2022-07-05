const express = require('express');
const app = express();

const path = require('path');

const mongoose = require('mongoose');

const ExpressError = require('./utils/ExpressError');

const methodOverride = require('method-override');

const ejsMate = require('ejs-mate');

const session = require('express-session');

const flash = require('connect-flash');

const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');

const usersRoute = require('./routes/users');
const campgroundsRoute = require('./routes/campgrounds');
const reviewsRoute = require('./routes/reviews');

const mongoSanitize = require('express-mongo-sanitize');

const MongoDBStore = require('connect-mongo');

//error handler of mongoDB connection
const dbURL = process.env.db_url || 'mongodb://localhost:27017/yelp-camp';
main().catch(err => console.log(`Can't connect to MongoDB! Err:${err}`));

//establish mongoDB connection
async function main() {
    await mongoose.connect(dbURL);
    console.log("MongoDB is connected!");
}


// set up view engine
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

//post request body encode
app.use(express.urlencoded({ extended: true }));

//overide method
app.use(methodOverride('_method'));

//set up public folder for css and js
app.use(express.static(__dirname + '/public'));

//set up session
const secret = process.env.secret || 'thisissecret'
const store = MongoDBStore.create({
    mongoUrl: dbURL,
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret,
    }
});

store.on("error", function(e) {
    console.log("Session store error", e)
})

const sessionConfig = {
    store,
    name: 'session',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        secure: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
};
app.use(session(sessionConfig));

//set up to prevent mongo injection
app.use(mongoSanitize({
    replaceWith: '_',
}))

//set up passport for authentication
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


//set up flash message
app.use(flash());
app.use((req, res, next) => {
    //set user login
    res.locals.currentUser = req.user;
    //set global flash message
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});

//campgrounds route
app.use('/campgrounds', campgroundsRoute);

//reviews route
app.use('/campgrounds/:id/reviews', reviewsRoute);

//users route
app.use('/', usersRoute);

//home page route
app.get('/', (req, res) => {
    res.render('home');
});

//page not found
app.all('*', (req, res, next) => {
    next(new ExpressError(404, 'page not found'));
});

//error handler
app.use((err, req, res, next) => {
    const { statusCode = 500, message = 'Internal Server Error' } = err;
    res.status(statusCode).render('error', { err });
});

// set up server listening
app.listen(3000, () => {
    console.log('Server is listening on port 3000...');
});
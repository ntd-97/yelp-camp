// use .env in dev environtment 
if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}


const express = require('express');
const router = express.Router();

const catchAsync = require('../utils/catchAsync');

const { isLoggedIn } = require('../middleware/authenticationMW');
const { validateCampground, isAuthorCampground } = require('../middleware/campgroundMW');

const campgroundsController = require('../controllers/campgroundsController');

const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });



router.route('/')
    //camprounds page route
    .get(catchAsync(campgroundsController.showCampgrounds))
    //adding new camground route
    .post(isLoggedIn, upload.array('images'), validateCampground, catchAsync(campgroundsController.createCampground));

//new campround page route
router.get('/new', isLoggedIn, campgroundsController.renderNewForm);


router.route('/:id')
    //campround details page route
    .get(catchAsync(campgroundsController.showDetailsCampground))
    //editting camground route
    .put(isLoggedIn, isAuthorCampground, upload.array('images'), validateCampground, catchAsync(campgroundsController.updateCampground))
    //deletting camground route
    .delete(isLoggedIn, isAuthorCampground, catchAsync(campgroundsController.deleteCampground));

//edit camground page route
router.get('/:id/edit', isLoggedIn, isAuthorCampground, catchAsync(campgroundsController.renderEditForm));

module.exports = router;
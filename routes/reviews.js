const express = require('express');
const router = express.Router({ mergeParams: true });

const catchAsync = require('../utils/catchAsync');
const { isLoggedIn } = require('../middleware/authenticationMW');
const { validateReview, isAuthorReview } = require('../middleware/reviewMW');
const reviewsController = require('../controllers/reviewsController');


//adding new review
router.post('/', isLoggedIn, validateReview, catchAsync(reviewsController.createReview))

//deleting review route
router.delete('/:reviewId', isLoggedIn, isAuthorReview, catchAsync(reviewsController.deleteReview));

module.exports = router;
const Review = require('../models/review');
const ExpressError = require('../utils/ExpressError');
const Joi = require('./sanitizeHTML');

//validate review function
module.exports.validateReview = (req, res, next) => {
    const reviewValidSchema = Joi.object({
        review: Joi.object({
            comment: Joi.string().required().escapeHTML(),
            rating: Joi.number().required().min(1).max(5)
        }).required()
    });
    const { error } = reviewValidSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(400, msg);
    } else {
        next();
    }
}

// Authorization Review
module.exports.isAuthorReview = async(req, res, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (!review.author.equals(req.user._id)) {
        req.flash('error', "You don't have permission to do that!");
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}
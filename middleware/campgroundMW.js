const Campground = require('../models/campground');
const ExpressError = require('../utils/ExpressError');
const Joi = require('./sanitizeHTML');

//validate campground function
module.exports.validateCampground = (req, res, next) => {
    const campgroundValidSchema = Joi.object({
        campground: Joi.object({
            title: Joi.string().required().escapeHTML(),
            price: Joi.number().required().min(0),
            // image: Joi.string().required(),
            location: Joi.string().required().escapeHTML(),
            description: Joi.string().required().escapeHTML()
        }).required(),
        deleteImages: Joi.array()
    });
    const { error } = campgroundValidSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(400, msg);
    } else {
        next();
    }
};

// Authorization Campground
module.exports.isAuthorCampground = async(req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground.author.equals(req.user._id)) {
        req.flash('error', "You don't have permission to do that!");
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}
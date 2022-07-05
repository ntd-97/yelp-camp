const Campground = require('../models/campground');

const { cloudinary } = require('../cloudinary');

const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.mapbox_token;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });


//show list campgrounds
module.exports.showCampgrounds = async(req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
};

//show new form to create campground
module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/createCampground');
};

//show details of campground
module.exports.showDetailsCampground = async(req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id).populate({
        path: 'reviews',
        populate: { path: 'author' }
    }).populate('author');
    if (!campground) {
        req.flash('error', 'Cannot find that campground');
        res.redirect('/campgrounds');
    }
    res.render('campgrounds/campgroundDetails', { campground })
};

//process for creating a new campground
module.exports.createCampground = async(req, res) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send();
    const campground = new Campground(req.body.campground);
    campground.images = req.files.map(file => ({ url: file.path, filename: file.filename }));
    campground.author = req.user._id;
    campground.geometry = geoData.body.features[0].geometry;
    await campground.save();
    req.flash('success', 'Successfully made a new campground!');
    res.redirect(`/campgrounds/${campground._id}`);
};

//show edit form to update campground
module.exports.renderEditForm = async(req, res) => {
    const campground = await Campground.findById(req.params.id);
    if (!campground) {
        req.flash('error', 'Cannot find that campground');
        res.redirect('/campgrounds');
    }
    res.render('campgrounds/editCampground', { campground });
};

//process for updating a campground
module.exports.updateCampground = async(req, res) => {
    const { id } = req.params;
    const campground = req.body.campground;
    const campgroundUpdated = await Campground.findByIdAndUpdate(id, campground, { runValidators: true });
    const imgs = req.files.map(file => ({ url: file.path, filename: file.filename }));
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send();
    campgroundUpdated.geometry = geoData.body.features[0].geometry;
    campgroundUpdated.images.push(...imgs);
    await campgroundUpdated.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await campgroundUpdated.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } });
    }
    req.flash('success', 'Successfully updated campground!');
    res.redirect(`/campgrounds/${id}`);
};

//process for deleting a campground
module.exports.deleteCampground = async(req, res) => {
    const campground = await Campground.findByIdAndDelete(req.params.id);
    req.flash('success', 'Successfully deleted campground!');
    res.redirect('/campgrounds');
};
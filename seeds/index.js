const mongoose = require('mongoose');
const cities = require('./cities');
const Campground = require('../models/campground');
const { descriptors, places } = require('./seedHelpers');
const axios = require('axios');

main().catch(err => console.log(`Can't connect to MongoDB! Err:${err}`));

async function main() {
    await mongoose.connect('mongodb://localhost:27017/yelp-camp');
    console.log("MongoDB is connected!");
}

//get image
async function getImage() {
    try {
        const res = await axios.get('https://api.unsplash.com/photos/random', {
            params: {
                client_id: 'Jma71dsSWlCVxIpdk_keeXC7hnfH0pWWtYqrL8gKlus',
                collections: 1114848
            }
        })
        console.log(res.data.urls.regular);
        return res.data.urls.regular;
    } catch (err) {
        console.log(err);
    }
}

//insert fake data
const randomArray = array => array[Math.floor(Math.random() * array.length) + 1];

const initData = async(arrObject) => {
    await Campground.deleteMany({});
    for (let i = 0; i < 50; i++) {
        const price = Math.floor(Math.random() * 100) + 1;
        const cityRandom = randomArray(cities);
        const camp = new Campground({
            title: `${randomArray(descriptors)} ${randomArray(places)}`,
            location: `${cityRandom.city}, ${randomArray(cities).state}`,
            price: price,
            author: '62b813a91d44ff9685bd010e',
            geometry: {
                type: "Point",
                coordinates: [cityRandom.longitude, cityRandom.latitude]
            },
            images: [{
                    url: 'https://res.cloudinary.com/yelpcampcloudimg/image/upload/v1656558733/YelpCampImg/img1_ospdig.jpg',
                    filename: 'YelpCampImg/fktugwapfl3mo5raps5f'
                },
                {
                    url: 'https://res.cloudinary.com/yelpcampcloudimg/image/upload/v1656558735/YelpCampImg/img2_fl4mdc.jpg',
                    filename: 'YelpCampImg/gupoxc4sewgfv58d7baa'
                }
            ],
            description: "Full hook ups, water & electric sites, tent sites, swimming area, Full bar and grill. Free WiFi, nearby bike trails, Hixon Forest, Volleyball, Horseshoe Pits, Golf nearby."
        });
        await camp.save();
    }
}

//close connection
initData().then(() => {
    mongoose.connection.close();
})
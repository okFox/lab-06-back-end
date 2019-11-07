require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const superagent = require('superagent');

app.use(cors());

//let latLngs;


const formatLocationResponse = locationItem => {
    const {
        geometry: {
            location: {
                lat,
                lng,
            },
        },
        formatted_address,
    } = locationItem;
    
    return {
        formatted_query: formatted_address,
        latitude: lat,
        longitude: lng,
    };
}; 

const getWeatherResponse = async(lat, long) => {
    const weatherData = await superagent.get(`https://api.darksky.net/forecast/${process.env.DARKSKY_API_KEY}/${lat},${long}`);

    const actualWeatherData = JSON.parse(weatherData.text);
    const dailyArray = actualWeatherData.daily.data;
    return dailyArray.map(day => { 
        return {
            forecast: day.summary,
            time: new Date(day.time * 1000).toDateString(),
        };
    });
};

const getTrailResponse = async(lat, long) => {
    const trailData = await superagent.get(`https://www.hikingproject.com/data/get-trails?lat=${lat}&lon=${long}&maxDistance=200&key=${process.env.HIKING_API_KEY}`);

    const actualTrailData = JSON.parse(trailData.text);
    let trailsArray = actualTrailData.trails;
    return trailsArray.map(trails => { 
        return {
            name: trails.name,
            location: trails.location,
            length: trails.length,
            stars: trails.stars,
            star_votes: trails.starVotes,
            summary: trails.summary,
            trail_url: trails.trail_url,
            conditions: trails.conditions,
            condition_date: trails.conditionDate,
            condition_time: trails.conditionTime

        };
    });
};

// const getEventResponse = async(lat, long) => {
//     const eventData = await superagent.get(`https://www.eventbriteapi.com/v3/events/search?token=${process.env.EVENTBRITE_API_KEY}&location.latitude=${lat}&location.longitude=${long}`);

//     const actualEventData = JSON.parse(eventData.text);
//     const eventArray = actualEventData;
//     console.log(actualEventData);
//     return actualEventData;
// };

const PORT = process.env.PORT || 3000;

app.use(express.static('./public'));

app.get('/location', async(req, res) => {

    const searchQuery = req.query.search;

    const GEOCODE_API_KEY = process.env.GEOCODE_API_KEY;

    const locationItem = await superagent.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${searchQuery}&key=${GEOCODE_API_KEY}`);

    const actualItem = JSON.parse(locationItem.text).results[0];
    const response = formatLocationResponse(actualItem);

    res.json(response);
});


// app.get('/events', async(req, res) => {
//     const eventObject = await getEventResponse(latLngs.latitude, latLngs.longitude);

//     res.json(eventObject);

// });

app.get('/weather', async(req, res) => {
    const weatherObject = await getWeatherResponse(req.query.latitude, req.query.longitude);

    res.json(weatherObject);
});

app.get('/trails', async(req, res) => {
    const trailObject = await getTrailResponse(req.query.latitude, req.query.longitude);

    res.json(trailObject);

});

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});
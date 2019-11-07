require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const superagent = require('superagent');

// Application Setup
// - make an express app!
// - get the port on which to run the server
// - enable CORS
app.use(cors());

let latLngs;

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

    latLngs = response;

    res.json(response);
});

// app.get('/events', async(req, res) => {
//     const eventObject = await getEventResponse(latLngs.latitude, latLngs.longitude);

//     res.json(eventObject);

// });

app.get('/weather', async(req, res) => {
    const weatherObject = await getWeatherResponse(latLngs.latitude, latLngs.longitude);

    res.json(weatherObject);
});


app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});
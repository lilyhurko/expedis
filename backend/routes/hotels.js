const express = require('express');
const router = express.Router();
const axios = require('axios');

const GEOAPIFY_API_KEY = process.env.GEOAPIFY_API_KEY;

router.get('/search', async (req, res) => {
  const { city } = req.query;
  if (!city) {
    return res.status(400).json({ message: 'City parameter is required' });
  }

  try {
    const geocodeUrl = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(city)}&format=json&apiKey=${GEOAPIFY_API_KEY}`;
    
    const geocodeResponse = await axios.get(geocodeUrl);
    
    if (!geocodeResponse.data.results || geocodeResponse.data.results.length === 0) {
      return res.status(404).json({ message: 'City not found' });
    }

    const { lat, lon } = geocodeResponse.data.results[0];


    const placesUrl = `https://api.geoapify.com/v2/places?categories=accommodation&filter=circle:${lon},${lat},10000&bias=proximity:${lon},${lat}&limit=6&apiKey=${GEOAPIFY_API_KEY}`;

    const placesResponse = await axios.get(placesUrl);
    
    const formattedHotels = placesResponse.data.features.map(place => {
      const props = place.properties;
      
      let link = `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(props.name || props.address_line1)}`;
      if (props.datasource.raw.website) {
         link = props.datasource.raw.website; 
      }
      
      return {
        name: props.name || props.address_line1,
        
        rating: props.datasource.raw.website ? 9.0 : 7.0, 
        imageUrl: `https://maps.geoapify.com/v1/staticmap?style=osm-carto&width=600&height=400&center=lonlat:${props.lon},${props.lat}&zoom=15&marker=lonlat:${props.lon},${props.lat};color:%23ff0000;size:medium&apiKey=${GEOAPIFY_API_KEY}`,
        link: link
      };
    });

    res.json(formattedHotels);

  } catch (error) {
    console.error('Error fetching from Geoapify API:', error.response ? error.response.data : error.message);
    res.status(500).json({ message: 'Internal server error while searching hotels' });
  }
});

module.exports = router;
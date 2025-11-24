const express = require('express');
const router = express.Router();
const axios = require('axios');

const GEOAPIFY_API_KEY = process.env.GEOAPIFY_API_KEY;


async function safeGeoapifyRequest(url) {
  try {
    const response = await axios.get(url, { validateStatus: () => true });

    if (response.status !== 200) {
      console.error(`Geoapify API Error: Status [${response.status}]`);
      return null;
    }


    const contentType = response.headers['content-type'];
    if (contentType && !contentType.includes('application/json')) {
      console.error('Geoapify Error: Received HTML instead of JSON (Service likely down)');
      return null;
    }

    return response.data;
  } catch (error) {
    console.error('Network Error requesting Geoapify:', error.message);
    return null;
  }
}

router.get('/search', async (req, res) => {
  const { city } = req.query;
  if (!city) {
    return res.status(400).json({ message: 'City parameter is required' });
  }

  try {
    const geocodeUrl = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(city)}&format=json&apiKey=${GEOAPIFY_API_KEY}`;
    
    const geocodeData = await safeGeoapifyRequest(geocodeUrl);
    
    if (!geocodeData) {
      return res.status(503).json({ message: 'Geoapify service is currently unavailable. Please try again later.' });
    }

    if (!geocodeData.results || geocodeData.results.length === 0) {
      return res.status(404).json({ message: 'City not found' });
    }

    const { lat, lon } = geocodeData.results[0];

    const placesUrl = `https://api.geoapify.com/v2/places?categories=accommodation&filter=circle:${lon},${lat},10000&bias=proximity:${lon},${lat}&limit=6&apiKey=${GEOAPIFY_API_KEY}`;

    const placesData = await safeGeoapifyRequest(placesUrl);

    if (!placesData) {
       return res.status(503).json({ message: 'Error fetching places data from Geoapify.' });
    }
    
    const formattedHotels = placesData.features.map(place => {
      const props = place.properties;
      
      let link = `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(props.name || props.address_line1)}`;
      if (props.datasource && props.datasource.raw && props.datasource.raw.website) {
         link = props.datasource.raw.website; 
      }
      
      const rating = (props.datasource && props.datasource.raw && props.datasource.raw.website) ? 9.0 : 7.0;

      return {
        name: props.name || props.address_line1,
        rating: rating, 
        imageUrl: `https://maps.geoapify.com/v1/staticmap?style=osm-carto&width=600&height=400&center=lonlat:${props.lon},${props.lat}&zoom=15&marker=lonlat:${props.lon},${props.lat};color:%23ff0000;size:medium&apiKey=${GEOAPIFY_API_KEY}`,
        link: link
      };
    });

    res.json(formattedHotels);

  } catch (error) {
    console.error('Internal server error:', error.message);
    res.status(500).json({ message: 'Internal server error while searching hotels' });
  }
});

module.exports = router;
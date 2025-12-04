const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const Car = require('../models/Car'); 
const Offer = require('../models/Offer'); 

// Use environment variable or default local DB
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/expedisDB'; 
const CARS_FILE_PATH = path.join(__dirname, 'cars_data.json'); 

const carImages = [
    '/images/cars/Audi A3 35 TDI Premium Plus.jpg',
    '/images/cars/Audi Q5 35TDI Premium Plus.jpg',
    '/images/cars/BMW 3 Series 320d.jpg',
    '/images/cars/BMW 6 Series GT 630d Luxury Line.jpg',
    '/images/cars/BMW X4 M Sport X xDrive20d.jpg',
    '/images/cars/Ford Aspire Titanium BSIV.jpg',
    '/images/cars/Ford Ecosport 1.0 Ecoboost Titanium Optional.jpg',
    '/images/cars/Ford Fiesta 1.4 SXi TDCi ABS.jpg',
    '/images/cars/Ford Figo Titanium Blu.jpg',
    '/images/cars/Honda Accord 2.4 AT.jpg',
    '/images/cars/Honda Amaze Anniversary Edition.jpg',
    '/images/cars/Hyundai Grand i10 1.2 Kappa Sportz AT.jpg',
    '/images/cars/Hyundai i20 1.2 Asta.jpg',
    '/images/cars/Hyundai Sonata 2.4 GDi MT.jpg',
    '/images/cars/Jeep Compass 2.0 Limited 4X4.jpg',
    '/images/cars/Kia Seltos HTX Plus AT D.jpg',
    '/images/cars/Lexus ES 300h.jpg',
    '/images/cars/Mercedes-Benz S-Class S 350 CDI.jpg',
    '/images/cars/Skoda Rapid Monte Carlo 1.5 TDI AT BSIV.jpg',
    '/images/cars/Toyota Camry 2.5 Hybrid.jpg',
];

const seedDatabase = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('--- MongoDB Connected ---');

        console.log('Fetching locations from Offers...');
        const offers = await Offer.find({}, 'city country');
        
        const uniqueLocationsMap = new Map();
        
        offers.forEach(offer => {
            if (offer.city && offer.country) {
                const key = `${offer.city}-${offer.country}`;
                if (!uniqueLocationsMap.has(key)) {
                    uniqueLocationsMap.set(key, { city: offer.city, country: offer.country });
                }
            }
        });

        const locations = Array.from(uniqueLocationsMap.values());

        if (locations.length === 0) {
            console.warn('Warning: No locations found in Offers collection! Using default fallback.');
            locations.push({ city: 'Lublin', country: 'Poland' }); 
        } else {
            console.log(`Found ${locations.length} unique locations from offers.`);
        }

        await Car.deleteMany();
        console.log('Existing Car collection cleared.');

        console.log('Starting JSON file parsing...');
        const rawData = fs.readFileSync(CARS_FILE_PATH, 'utf-8');
        const carsArray = JSON.parse(rawData);

        const transformedCars = carsArray.map((row, index) => { 
            
            const nameParts = (row.name || '').split(' ').filter(Boolean);
            let make = 'Unknown';
            let model = 'Unknown';

            if (nameParts.length > 1) {
                make = nameParts[0]; 
                model = nameParts.slice(1).join(' '); 
            } else if (nameParts.length === 1) {
                make = nameParts[0]; 
                model = nameParts[0]; 
            }

            const randomLocation = locations[Math.floor(Math.random() * locations.length)];
            
            const stableImage = carImages[index % carImages.length]; 

            return {
                make: make,
                model: model,
                year: parseInt(row.year) || 2020,
                
                city: randomLocation.city, 
                country: randomLocation.country, 
                
                pricePerDay: parseFloat(row.rental_price) || 50, 
                imageUrl: stableImage, 
                options: [
                    row.category || 'Standard', 
                    `${row.seats || 5} seats`
                ],
                description: row.category, 
            };
        }).filter(car => car.pricePerDay > 0 && car.model !== 'Unknown');

        await Car.insertMany(transformedCars);
        console.log(`Successfully imported ${transformedCars.length} cars distributed across ${locations.length} locations!`);

        mongoose.connection.close();
        console.log('--- Connection closed ---');

    } catch (error) {
        console.error('Data seeding failed:', error);
        process.exit(1);
    }
};

seedDatabase();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const Car = require('../models/Car'); 

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

const locations = [
    { country: 'Poland', cities: ['Warsaw', 'Krakow', 'Lublin', 'Gdansk'] },
    { country: 'Germany', cities: ['Berlin', 'Munich', 'Hamburg'] },
    { country: 'France', cities: ['Paris', 'Lyon', 'Marseille'] },
    { country: 'Spain', cities: ['Madrid', 'Barcelona', 'Valencia'] },
    { country: 'Italy', cities: ['Rome', 'Milan', 'Naples'] },
    { country: 'Czech Republic', cities: ['Prague', 'Brno'] },
    { country: 'Austria', cities: ['Vienna', 'Salzburg'] },
    { country: 'Netherlands', cities: ['Amsterdam', 'Rotterdam', 'The Hague'] },
    { country: 'UK', cities: ['London', 'Manchester', 'Edinburgh'] },
    { country: 'Portugal', cities: ['Lisbon', 'Porto'] }
];

const seedDatabase = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('--- MongoDB Connected ---');
        await Car.deleteMany();
        console.log('Existing Car collection cleared.');

        console.log('Starting JSON file parsing...');
        const rawData = fs.readFileSync(CARS_FILE_PATH, 'utf-8');
        const carsArray = JSON.parse(rawData);

        const transformedCars = carsArray.map((row, index) => { 
            
            const nameParts = row.name.split(' ');
            const make = nameParts[0]; 
            const model = nameParts.slice(1).join(' '); 

            const randomLocation = locations[Math.floor(Math.random() * locations.length)];
            const randomCity = randomLocation.cities[Math.floor(Math.random() * randomLocation.cities.length)];
            
            const stableImage = carImages[index % carImages.length]; 

            return {
                make: make,
                model: model,
                year: parseInt(row.year) || 2020,
                city: randomCity, 
                country: randomLocation.country, 
                pricePerDay: parseFloat(row.rental_price) || 50, 
                
                imageUrl: stableImage, 
                
                options: [
                    row.category || 'Standard', 
                    `${row.seats || 5} seats`
                ],
                description: row.category, 
            };
        }).filter(car => car.pricePerDay > 0);

        await Car.insertMany(transformedCars);
        console.log(`Successfully imported ${transformedCars.length} cars!`);

        mongoose.connection.close();
        console.log('--- Connection closed ---');

    } catch (error) {
        console.error('Data seeding failed:', error);
        process.exit(1);
    }
};

seedDatabase();
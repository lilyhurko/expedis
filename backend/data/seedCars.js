// =======================================================
// Файл: backend/data/seedCars.js
// =======================================================
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

// 1. Імпорт моделі
const Car = require('../models/Car'); 

// 2. Рядок підключення до вашої MongoDB
// Змініть це на ваш актуальний рядок підключення!
const MONGO_URI = 'mongodb://localhost:27017/expedisDB'; 

// 3. Шлях до вашого файлу CSV
const CARS_FILE_PATH = path.join(__dirname, 'cars_data.csv'); 
const locations = [
    { country: 'Poland', cities: ['Lublin', 'Warsaw', 'Krakow', 'Gdansk'] },
    { country: 'Germany', cities: ['Berlin', 'Munich', 'Hamburg', 'Frankfurt'] },
    { country: 'France', cities: ['Paris', 'Lyon', 'Marseille', 'Nice'] },
    { country: 'Italy', cities: ['Rome', 'Milan', 'Naples', 'Florence'] },
    { country: 'Spain', cities: ['Madrid', 'Barcelona', 'Valencia', 'Seville'] },
    { country: 'United Kingdom', cities: ['London', 'Manchester', 'Birmingham', 'Liverpool'] },
    { country: 'Netherlands', cities: ['Amsterdam', 'Rotterdam', 'Utrecht', 'The Hague'] },
    { country: 'Sweden', cities: ['Stockholm', 'Gothenburg', 'Malmö'] },
    { country: 'Czech Republic', cities: ['Prague', 'Brno', 'Ostrava'] },
    { country: 'Austria', cities: ['Vienna', 'Salzburg', 'Innsbruck'] },
    { country: 'Hungary', cities: ['Budapest', 'Debrecen', 'Szeged'] },
];

function getRandomLocation() {
    const randomCountry = locations[Math.floor(Math.random() * locations.length)];
    const randomCity = randomCountry.cities[Math.floor(Math.random() * randomCountry.cities.length)];
    return { city: randomCity, country: randomCountry.country };
}


const seedDatabase = async () => {
    let importedCount = 0;
    const carsToImport = [];

    // Підключення до MongoDB
    try {
        await mongoose.connect(MONGO_URI);
        console.log('--- MongoDB Connected ---');

        // Очищення старої колекції 
        await Car.deleteMany();
        console.log('Existing Car collection cleared.');

    } catch (dbError) {
        console.error('Database connection failed:', dbError);
        process.exit(1);
    }

    console.log('Starting CSV file parsing...');

    // ----------------------------------------------------
    // Читання та парсинг CSV-файлу (Асинхронний потік)
    // ----------------------------------------------------
    const readStreamPromise = new Promise((resolve, reject) => {
        fs.createReadStream(CARS_FILE_PATH)
            .pipe(csv())
            .on('data', (row) => {
                
                // --- Трансформація даних ---
                const sellingPrice = parseFloat(row.selling_price) || 0;
                // Встановлюємо щоденну ціну оренди як 5% від ціни продажу
                const pricePerDay = sellingPrice * 0.05; 

                // Перевірка наявності необхідних числових полів
                const validYear = parseInt(row.year);
                const validPricePerDay = parseFloat(pricePerDay.toFixed(2));
                const { city, country } = getRandomLocation();

                // Об'єкт, що відповідає моделі Car.js
                const transformedCar = {
                    make: 'Generic Brand', 
                    model: row.name || 'Unknown Model', 
                    year: validYear,

                    // Randomized geographic data
                    city, 
                    country,
                    
                    pricePerDay: validPricePerDay, 
                    imageUrl: '/images/cars/default.jpg', 
                    options: [
                        row.fuel || 'Unknown Fuel', 
                        row.transmission || 'Unknown Transmission', 
                        `Seats: ${row.seats}`,
                        `Power: ${row.max_power}`
                    ],
                    description: `Drove: ${row.km_driven} km. Seller type: ${row.seller_type}.`,
                };

                // Фільтрація: додаємо лише валідні записи
                if (validPricePerDay > 0 && transformedCar.model !== 'Unknown Model' && !isNaN(validYear)) {
                    carsToImport.push(transformedCar);
                    importedCount++;
                } else {
                    // Лог для налагодження, які записи пропущені
                    // console.warn('Skipped invalid record:', row.name, validPricePerDay); 
                }
            })
            .on('end', () => {
                console.log(`CSV file successfully processed. Found ${importedCount} valid records.`);
                resolve();
            })
            .on('error', (err) => {
                console.error('Error reading CSV stream:', err);
                reject(err);
            });
    });

    // ----------------------------------------------------
    // Вставка даних
    // ----------------------------------------------------
    try {
        await readStreamPromise;

        if (carsToImport.length > 0) {
            await Car.insertMany(carsToImport);
            console.log(`Successfully imported ${carsToImport.length} cars into MongoDB!`);
        } else {
            console.log('No valid records to import.');
        }

    } catch (importError) {
        console.error('Data import failed:', importError);
        process.exit(1);
    } finally {
        // Закриття підключення
        mongoose.connection.close();
        console.log('--- Connection closed ---');
    }
};

seedDatabase();
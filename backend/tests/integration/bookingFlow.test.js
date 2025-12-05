const request = require('supertest');
const app = require('../../server.js');
const User = require('../../models/User');
const Car = require('../../models/Car');

describe('Car Booking Flow - Integration', () => {
  let userToken, agencyToken, carId;

  beforeAll(async () => {
    const user = await User.create({
      name: 'John',
      surname: 'Doe',              
      username: 'johndoe',          
      email: 'john@test.com',
      password: '123456',
      balance: 5000
    });

    const agency = await User.create({
      name: 'Agency',
      surname: 'Manager',           
      username: 'agency_admin',     
      email: 'agency@test.com',
      password: '123456',
      role: 'agency'
    });

    const userLogin = await request(app).post('/api/auth/login').send({
      email: 'john@test.com', password: '123456'
    });
    userToken = userLogin.body.token;

    const agencyLogin = await request(app).post('/api/auth/login').send({
      email: 'agency@test.com', password: '123456'
    });
    agencyToken = agencyLogin.body.token;

    const carRes = await request(app)
      .post('/api/cars')
      .set('Authorization', `Bearer ${agencyToken}`)
      .attach('image', Buffer.from('fake-image'), 'test.jpg')
      .field('make', 'Toyota')
      .field('model', 'Camry')
      .field('year', '2024') 
      .field('pricePerDay', '300')
      .field('city', 'Warsaw')
      .field('country', 'Poland');

    if (!carRes.body.car) {
      console.error("Car creation failed:", carRes.body);
    }
    carId = carRes.body.car._id;

    await Car.findByIdAndUpdate(carId, { status: 'active' });
  });

  it('should create booking and deduct balance', async () => {
    const res = await request(app)
      .post('/api/cars/book')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        carId,
        pickupDate: '2025-12-05',
        returnDate: '2025-12-07'
      });

    expect(res.status).toBe(201);
    expect(res.body.message).toContain('Booking created');

    const user = await User.findOne({ email: 'john@test.com' });
    expect(user.balance).toBeLessThan(5000); 
  });
});
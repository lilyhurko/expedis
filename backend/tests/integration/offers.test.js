const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../../server'); 
const Offer = require('../../models/Offer');
const User = require('../../models/User');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
 
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('GET /api/offers', () => {
  it('should return all active offers', async () => {
    const user = await User.create({
        username: 'agency', email: 'agency@test.com', password: '123', name: 'Ag', surname: 'Ency', role: 'agency'
    });

    await Offer.create({
      title: 'Trip to Paris',
      description: 'Test Desc',
      price: 100,
      duration: 5,
      city: 'Paris',
      country: 'France',
      departureAirportIATA: 'WAW',
      latitude: 48.85, longitude: 2.35,
      creator: user._id,
      status: 'active'
    });

    const res = await request(app).get('/api/offers');

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBeTruthy();
    expect(res.body.length).toBe(1);
    expect(res.body[0].title).toBe('Trip to Paris');
  });
});
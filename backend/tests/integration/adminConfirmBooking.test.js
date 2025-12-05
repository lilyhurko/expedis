const request = require('supertest');
const app = require('../../server.js');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const User = require('../../models/User');
const CarBooking = require('../../models/CarBooking');
const Car = require('../../models/Car'); 

jest.mock('../../utils/sendEmail', () => jest.fn().mockResolvedValue(true));

describe('Admin confirms booking', () => {
  let adminToken;
  let bookingId;

  beforeAll(() => {
    const originalStartSession = mongoose.startSession.bind(mongoose);
    jest.spyOn(mongoose, 'startSession').mockImplementation(async () => {
      const session = await originalStartSession();
      session.startTransaction = jest.fn();
      session.commitTransaction = jest.fn();
      session.abortTransaction = jest.fn();
      return session;
    });
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  beforeEach(async () => {
    const adminUser = await User.create({
      name: 'Admin',
      surname: 'Test',
      username: 'admin123',
      email: 'admin@test.com',
      password: '123456',
      role: 'admin'
    });

    adminToken = jwt.sign(
      { id: adminUser._id, role: 'admin' },
      process.env.JWT_SECRET || 'testsecret123'
    );

    const clientUser = await User.create({
      name: 'Client',
      surname: 'User',
      username: 'client123',
      email: 'client@test.com',
      password: '123456',
      role: 'user'
    });

    const car = await Car.create({
      make: 'Toyota',
      model: 'Camry',
      year: 2024,
      pricePerDay: 100,
      city: 'Warsaw',
      country: 'Poland',
      agency: adminUser._id, 
      status: 'active',
      imageUrl: 'test.jpg',
      description: 'Test car',
      seats: 5
    });

    const booking = await CarBooking.create({
      car: car._id,      
      user: clientUser._id, 
      pickupDate: '2025-12-05',
      returnDate: '2025-12-07',
      totalPrice: 1200,
      status: 'pending'
    });

    bookingId = booking._id;
  });

  it('should confirm booking and trigger agency email', async () => {
    const res = await request(app)
      .patch(`/api/cars/admin/bookings/${bookingId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'confirmed' });

    if (res.status !== 200) {
      console.error('SERVER ERROR RESPONSE:', res.body);
    }

    expect(res.status).toBe(200);
    expect(res.body).toBeTruthy();

    const updatedBooking = await CarBooking.findById(bookingId);
    expect(updatedBooking.status).toBe('confirmed');

    const sendEmail = require('../../utils/sendEmail');
    expect(sendEmail).toHaveBeenCalled();
  });
});
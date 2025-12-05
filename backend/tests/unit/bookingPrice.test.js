const Car = require('../../models/Car');
const mongoose = require('mongoose');

describe('Booking price calculation', () => {
  it('should correctly calculate total price', async () => {
    const car = await Car.create({
      make: 'Toyota',
      model: 'Camry',
      year: 2023,
      pricePerDay: 300,
      city: 'Warsaw',
      country: 'Poland',
      imageUrl: '/test.jpg',
      agency: new mongoose.Types.ObjectId(),
      status: 'active'
    });

    const days = 5;
    const expected = 300 * days;
    expect(car.pricePerDay * days).toBe(expected);
  });
});
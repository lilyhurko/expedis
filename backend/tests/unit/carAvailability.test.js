const mongoose = require('mongoose');
const CarBooking = require('../../models/CarBooking');
const { isCarAvailable } = require('../../routes/carrent');

describe('isCarAvailable', () => {
  it('returns false if dates overlap', async () => {
    const carId = new mongoose.Types.ObjectId();
    await CarBooking.create({
      car: carId,
      user: new mongoose.Types.ObjectId(),
      pickupDate: '2025-12-15',
      returnDate: '2025-12-20',
      totalPrice: 1500,
      status: 'confirmed'
    });

    const available = await isCarAvailable(carId, '2025-12-18', '2025-12-22');
    expect(available).toBe(false);
  });

  it('returns true if no overlap', async () => {
    const carId = new mongoose.Types.ObjectId();
    await CarBooking.create({
      car: carId,
      user: new mongoose.Types.ObjectId(),
      pickupDate: '2025-12-10',
      returnDate: '2025-12-12',
      totalPrice: 600,
      status: 'confirmed'
    });

    const available = await isCarAvailable(carId, '2025-12-15', '2025-12-18');
    expect(available).toBe(true);
  });
});
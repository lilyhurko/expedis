const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
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

describe('User Model Test', () => {
  it('should hash password before saving', async () => {
    const userData = {
      username: 'tester',
      email: 'test@test.com',
      password: 'plainpassword',
      name: 'Test',
      surname: 'User',
      role: 'user'
    };
    const user = new User(userData);
    await user.save();

    expect(user.password).not.toBe('plainpassword');
    expect(user.password).toMatch(/^\$2b\$/); 
  });

  it('should create user correctly', async () => {
    const user = await User.findOne({ email: 'test@test.com' });
    expect(user.name).toBe('Test');
    expect(user.balance).toBe(0); 
  });
});
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

process.env.JWT_SECRET = 'testsecret123';
process.env.EMAIL_USER = 'test@example.com';
process.env.EMAIL_PASS = 'test123';

jest.mock('../utils/sendEmail', () => jest.fn().mockResolvedValue(true));
jest.setTimeout(60000); 

let mongoServer;

beforeAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }

  mongoServer = await MongoMemoryServer.create({
    replSet: {
      name: 'rs0',
      count: 1,
      storageEngine: 'wiredTiger',
    }
  });

  let uri = mongoServer.getUri();

  if (!uri.includes('replicaSet')) {
    uri = `${uri}?replicaSet=rs0`;
  }

  console.log("🛠️  FIXED DB URI:", uri);
  
  await mongoose.connect(uri, {
    directConnection: true,
    serverSelectionTimeoutMS: 5000,
  });
});

afterEach(async () => {
  if (mongoose.connection.readyState !== 0) {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  }
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
});
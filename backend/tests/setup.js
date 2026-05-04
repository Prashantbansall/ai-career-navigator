import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { beforeAll, afterAll, afterEach } from "vitest";

let mongoServer;

beforeAll(async () => {
  process.env.NODE_ENV = "test";
  process.env.CLIENT_URLS = "http://localhost:5173";
  process.env.RATE_LIMIT_MAX = "1000";

  mongoServer = await MongoMemoryServer.create();

  const uri = mongoServer.getUri();

  await mongoose.connect(uri);
});

afterEach(async () => {
  const collections = mongoose.connection.collections;

  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.disconnect();

  if (mongoServer) {
    await mongoServer.stop();
  }
});

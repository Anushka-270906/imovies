import mongoose from 'mongoose';

let memoryServer = null;

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  const isDefaultLocal = !uri || uri === 'mongodb://127.0.0.1:27017/imovies' || uri === 'mongodb://localhost:27017/imovies';

  // 1. If user provided a custom URI (like MongoDB Atlas), connect directly
  if (!isDefaultLocal) {
    try {
      console.log(`[MongoDB] Connecting to custom URI: ${uri.replace(/\/\/.*@/, '//<credentials>@')}...`);
      const conn = await mongoose.connect(uri, { autoIndex: true });
      console.log(`[MongoDB] Connected: ${conn.connection.host} / Database: ${conn.connection.name}`);
      return conn;
    } catch (error) {
      console.error(`[MongoDB Error] Connection failed to custom MONGODB_URI: ${error.message}`);
      process.exit(1);
    }
  }

  // 2. Try local MongoDB first with short timeout
  try {
    const conn = await mongoose.connect(uri || 'mongodb://127.0.0.1:27017/imovies', {
      autoIndex: true,
      serverSelectionTimeoutMS: 1500,
    });
    console.log(`[MongoDB] Connected locally: ${conn.connection.host} / Database: ${conn.connection.name}`);
    return conn;
  } catch (localError) {
    console.log('[MongoDB] Local MongoDB server (127.0.0.1:27017) not detected.');
    console.log('[MongoDB] Starting automatic In-Memory MongoDB instance for zero-setup demo...');

    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      memoryServer = await MongoMemoryServer.create({
        instance: { dbName: 'imovies' },
      });
      const memoryUri = memoryServer.getUri();
      const conn = await mongoose.connect(memoryUri, { autoIndex: true });
      console.log(`[MongoDB] In-Memory Database active at: ${memoryUri}`);

      // Auto-seed sample movies, theaters, showtimes, and users
      console.log('[MongoDB] Auto-seeding initial catalog and demo users...');
      const { seedDatabase } = await import('../scripts/seed.js');
      await seedDatabase(true);

      const cleanup = async () => {
        if (memoryServer) {
          await mongoose.disconnect();
          await memoryServer.stop();
        }
      };

      process.on('SIGINT', cleanup);
      process.on('SIGTERM', cleanup);

      return conn;
    } catch (memError) {
      console.error(`[MongoDB Error] Failed to initialize in-memory database: ${memError.message}`);
      process.exit(1);
    }
  }
};

import http from 'http';
import mongoose from 'mongoose';
import { config } from './config/env';
import { createApp } from './app';
import { Server } from 'socket.io';

async function bootstrap() {
  const app = createApp();
  const server = http.createServer(app);
  const io = new Server(server, {
    cors: {
      origin: config.CORS_ORIGIN,
      methods: ['GET', 'POST', 'PATCH']
    }
  });

  app.set('io', io);

  mongoose.set('strictQuery', true);
  await mongoose.connect(config.MONGO_URI);

  server.listen(config.PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`API listening on http://localhost:${config.PORT}`);
  });
}

bootstrap().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Fatal error during bootstrap:', err);
  process.exit(1);
});



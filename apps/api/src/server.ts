import { createServer } from 'node:http';
import app from './app.js';
import { env } from './config/env.js';
import { connectDatabase } from './config/database.js';
import { configureCloudinary } from './config/cloudinary.js';
import { logger } from './utils/logger.js';
import { initSocket } from './config/socket.js';

async function start(): Promise<void> {
  logger.info('Starting DevFlow API server', {
    env: env.NODE_ENV,
    port: env.PORT,
  });

  await connectDatabase();
  configureCloudinary();

  const httpServer = createServer(app);
  initSocket(httpServer);

  httpServer.listen(env.PORT, () => {
    logger.info(`Server running on port ${env.PORT}`, {
      url: `http://localhost:${env.PORT}`,
      health: `http://localhost:${env.PORT}/api/health`,
    });
  });
}

process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception', { error });
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled rejection', {
    error: reason instanceof Error ? reason : new Error(String(reason)),
  });
  process.exit(1);
});

start();

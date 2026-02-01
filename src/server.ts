import http, { Server } from 'http';
import { app } from './app';
import dotenv from 'dotenv';
import { prisma } from './config/prisma';

dotenv.config();

let server: Server | null = null;
async function checkDatabaseConnection() {
  try {
    await prisma.$connect();
    console.log('✅ Database connection established.');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
}

async function startServer() {
  try {
    server = http.createServer(app);
    await checkDatabaseConnection();
    server.listen(process.env.PORT, () => {
      console.log(`🚀 Server is running on port ${process.env.PORT}`);
    });

    handleProcessEvents();
  } catch (error) {
    console.error('❌ Error during server startup:', error);
    process.exit(1);
  }
}

/**
 * Gracefully shutdown the server and close database connections.
 * @param {string} signal - The termination signal received.
 */
async function gracefulShutdown(signal: string) {
  console.warn(`🔄 Received ${signal}, shutting down gracefully...`);

  if (server) {
    server.close(async () => {
      console.log('✅ HTTP server closed.');

      try {
        console.log('Server shutdown complete.');
      } catch (error) {
        console.error('❌ Error during shutdown:', error);
      }

      process.exit(0);
    });
  } else {
    process.exit(0);
  }
}

/**
 * Handle system signals and unexpected errors.
 */
function handleProcessEvents() {
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  process.on('uncaughtException', (error) => {
    console.error('💥 Uncaught Exception:', error);
    gracefulShutdown('uncaughtException');
  });

  process.on('unhandledRejection', (reason) => {
    console.error('💥 Unhandled Rejection:', reason);
    gracefulShutdown('unhandledRejection');
  });
}

// check if the database is connected

// Start the application
startServer();

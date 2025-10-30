/**
 * Express server setup
 * Following Cursor Clause 4.5 Rules
 */

import express, { Express } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileStorage } from './utils/file-storage';
import { searchService } from './services/search.service';
import { errorHandler, notFoundHandler } from './middleware/error-handler';
import { disconnectPrisma } from './db/client';

// Import routes
import programRoutes from './api/programs/routes';
import machineRoutes from './api/machines/routes';
import setupSheetRoutes from './api/setup-sheets/routes';
import { serveMedia } from './api/setup-sheets/upload';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 3001;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';

/**
 * Create and configure Express application
 * 
 * @returns Configured Express app
 */
function createApp(): Express {
  const app = express();

  // Middleware
  app.use(cors({
    origin: CORS_ORIGIN,
    credentials: true,
  }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Request logging in development
  if (process.env.NODE_ENV === 'development') {
    app.use((req, res, next) => {
      console.log(`${req.method} ${req.path}`);
      next();
    });
  }

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({
      success: true,
      message: 'MillPoint NC API is running',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
    });
  });

  // API routes
  app.use('/api/programs', programRoutes);
  app.use('/api/machines', machineRoutes);
  app.use('/api/setup-sheets', setupSheetRoutes);
  
  // Media file serving
  app.get('/api/files/media/:filename', serveMedia);

  // 404 handler
  app.use(notFoundHandler);

  // Global error handler (must be last)
  app.use(errorHandler);

  return app;
}

/**
 * Start the server
 */
async function startServer() {
  try {
    // Initialize file storage
    await fileStorage.initialize();

    // Initialize Meilisearch
    await searchService.initialize();

    // Create Express app
    const app = createApp();

    // Start listening
    const server = app.listen(PORT, () => {
      console.log('');
      console.log('🚀 MillPoint NC Backend API');
      console.log(`📡 Server running on http://localhost:${PORT}`);
      console.log(`🌍 CORS enabled for: ${CORS_ORIGIN}`);
      console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log('');
      console.log('Available endpoints:');
      console.log(`  - GET  /health`);
      console.log(`  - GET  /api/programs`);
      console.log(`  - GET  /api/machines`);
      console.log(`  - GET  /api/setup-sheets`);
      console.log('');
    });

    // Graceful shutdown
    process.on('SIGTERM', async () => {
      console.log('⚠️  SIGTERM received, shutting down gracefully...');
      server.close(async () => {
        await disconnectPrisma();
        console.log('✅ Server closed');
        process.exit(0);
      });
    });

    process.on('SIGINT', async () => {
      console.log('\n⚠️  SIGINT received, shutting down gracefully...');
      server.close(async () => {
        await disconnectPrisma();
        console.log('✅ Server closed');
        process.exit(0);
      });
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Start server if this file is run directly
if (require.main === module) {
  startServer();
}

export { createApp, startServer };


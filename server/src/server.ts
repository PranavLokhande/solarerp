import { createApp } from './app';
import { env } from './config/env';
import { connectDB, disconnectDB } from './config/db';

async function bootstrap() {
  await connectDB();

  const app = createApp();

  const server = app.listen(env.PORT, '0.0.0.0', () => {
    console.log(`=======================================================`);
    console.log(` HeliosOps - Enterprise Solar EPC ERP & CRM Engine`);
    console.log(` Server running on port ${env.PORT} in [${env.NODE_ENV}] mode`);
    console.log(` API Base: http://localhost:${env.PORT}/api/v1`);
    console.log(` Health Check: http://localhost:${env.PORT}/api/v1/health`);
    console.log(`=======================================================`);
  });

  // Graceful shutdown handling
  const shutdown = async (signal: string) => {
    console.log(`\n[Shutdown] Received ${signal}. Closing HTTP server...`);
    server.close(async () => {
      console.log('[Shutdown] HTTP server closed.');
      await disconnectDB();
      process.exit(0);
    });

    setTimeout(() => {
      console.error('[Shutdown] Forcefully shutting down after timeout');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

bootstrap().catch((err) => {
  console.error('[Bootstrap] Fatal startup failure:', err);
  process.exit(1);
});

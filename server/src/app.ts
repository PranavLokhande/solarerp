import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import path from 'path';

import { env } from './config/env';
import { errorHandler } from './middleware/error.middleware';

// Routes
import authRoutes from './modules/auth/auth.routes';
import employeeRoutes from './modules/employees/employee.routes';
import leadRoutes from './modules/leads/lead.routes';
import customerRoutes from './modules/customers/customer.routes';
import surveyRoutes from './modules/surveys/survey.routes';
import engineeringRoutes from './modules/engineering/engineering.routes';
import quotationRoutes from './modules/quotations/quotation.routes';
import projectRoutes from './modules/projects/project.routes';
import documentRoutes from './modules/documents/document.routes';
import regulatoryRoutes from './modules/regulatory/regulatory.routes';
import loanRoutes from './modules/loans/loan.routes';
import inventoryRoutes from './modules/inventory/inventory.routes';
import installationRoutes from './modules/installation/installation.routes';
import commissioningRoutes from './modules/commissioning/commissioning.routes';
import billingRoutes from './modules/billing/billing.routes';
import supportRoutes from './modules/support/ticket.routes';
import dashboardRoutes from './modules/dashboard/dashboard.routes';
import auditRoutes from './modules/audit/audit.routes';

export function createApp(): Application {
  const app = express();

  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.use(
    cors({
      origin: [
        env.CORS_ORIGIN,
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        'http://localhost:5174',
        'http://127.0.0.1:5174',
      ],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    })
  );

  app.use(compression());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(cookieParser());

  // Static uploads directory
  app.use('/uploads', express.static(env.UPLOAD_DIR));

  // Rate Limiting
  const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    message: { success: false, message: 'Too many requests, please try again later.' },
  });
  app.use('/api', generalLimiter);

  // Health check
  app.get('/api/v1/health', (req: Request, res: Response) => {
    res.status(200).json({
      status: 'UP',
      timestamp: new Date().toISOString(),
      environment: env.NODE_ENV,
      version: '1.0.0',
    });
  });

  // API Version 1 Routers
  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/employees', employeeRoutes);
  app.use('/api/v1/leads', leadRoutes);
  app.use('/api/v1/customers', customerRoutes);
  app.use('/api/v1/surveys', surveyRoutes);
  app.use('/api/v1/designs', engineeringRoutes);
  app.use('/api/v1/quotations', quotationRoutes);
  app.use('/api/v1/projects', projectRoutes);
  app.use('/api/v1/documents', documentRoutes);
  app.use('/api/v1/regulatory', regulatoryRoutes);
  app.use('/api/v1/loans', loanRoutes);
  app.use('/api/v1/inventory', inventoryRoutes);
  app.use('/api/v1/installation', installationRoutes);
  app.use('/api/v1/commissioning', commissioningRoutes);
  app.use('/api/v1/billing', billingRoutes);
  app.use('/api/v1/support', supportRoutes);
  app.use('/api/v1/dashboard', dashboardRoutes);
  app.use('/api/v1/audit', auditRoutes);

  // Catch-all 404
  app.use('*', (req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      message: `Endpoint not found: ${req.method} ${req.originalUrl}`,
    });
  });

  // Central Error Handler
  app.use(errorHandler);

  return app;
}

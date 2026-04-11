import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { appConfig, corsConfig } from './config/env.config';
import v1Router from './router';
import { errorHandler } from './http/middlewares/error-handler';
import { requestLogger } from './http/middlewares/request-logger';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app: Application = express();
const corsOptions = appConfig.isDevelopment
  ? { origin: true, credentials: true }
  : { origin: corsConfig.allowedOrigins, credentials: true };

app.use(helmet());
app.use(cors(corsOptions));
app.use(morgan(appConfig.isDevelopment ? 'dev' : 'combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(requestLogger);
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.use('/api', v1Router);

app.use(errorHandler);

export default app;

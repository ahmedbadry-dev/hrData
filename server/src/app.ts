import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { appConfig, corsConfig } from './config/env.config';
import v1Router from './router';
import { errorHandler } from './http/middlewares/error-handler';
import { requestLogger } from './http/middlewares/request-logger';

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

app.use('/api', v1Router);

app.use(errorHandler);

export default app;

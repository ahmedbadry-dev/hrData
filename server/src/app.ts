import express, { Application } from 'express';
import cors, { type CorsOptions } from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { appConfig, corsConfig } from './config/env.config';
import v1Router from './router';
import { errorHandler } from './http/middlewares/error-handler';
import { requestLogger } from './http/middlewares/request-logger';
import { apiRateLimitMiddleware } from './http/middlewares/rate-limit.middleware';
import { csrfProtectionMiddleware } from './http/middlewares/csrf.middleware';
import { bullBoardRouter } from './config/bull-board';

const buildCorsOriginValidator = (): CorsOptions['origin'] => {
  const allowedOrigins = new Set(corsConfig.allowedOrigins);

  return (origin, callback) => {
    if (!origin) {
      callback(null, true);
      return;
    }

    if (allowedOrigins.has(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error('Origin not allowed by CORS'));
  };
};

const app: Application = express();
app.set('trust proxy', 1);
const corsOptions: CorsOptions = {
  origin: buildCorsOriginValidator(),
  credentials: true,
};

app.use(helmet());
app.use(cors(corsOptions));
app.use(morgan(appConfig.isDevelopment ? 'dev' : 'combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(requestLogger);
app.use(csrfProtectionMiddleware);

app.use('/admin/queues', bullBoardRouter);

app.use('/api', apiRateLimitMiddleware, v1Router);

app.use(errorHandler);

export default app;

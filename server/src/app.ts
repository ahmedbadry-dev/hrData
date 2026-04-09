import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { appConfig } from './config/env';
import v1Router from './router';
import { errorHandler } from './http/middlewares/error-handler';
import { requestLogger } from './http/middlewares/request-logger';


const app: Application = express();

app.use(helmet());
app.use(cors());
app.use(morgan(appConfig.isDevelopment ? 'dev' : 'combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(requestLogger);

app.use('/api/v1', v1Router);

app.use(errorHandler);

export default app;

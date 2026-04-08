import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { appConfig } from '@/config/env';
import v1Router from '@/router';
import { errorHandler } from '@/http/middlewares/error-handler';
import { requestLogger } from '@/http/middlewares/request-logger';

const app: Application = express();

app.use(helmet());
app.use(cors());
app.use(morgan(appConfig.isDevelopment ? 'dev' : 'combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(requestLogger);

app.use('/api/v1', v1Router);

const notFoundHandler = (req: Request, res: Response): void => {
  const html = `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>٤٠٤ — الصفحة غير موجودة</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #0f0f0f;
      font-family: 'Segoe UI', 'Tahoma', sans-serif;
      color: #fff;
    }
    .container {
      text-align: center;
      padding: 2rem;
      max-width: 600px;
    }
    h1 {
      font-size: 8rem;
      font-weight: 900;
      color: #e74c3c;
      line-height: 1;
      margin-bottom: 0.5rem;
    }
    .arabic-number {
      font-size: 4rem;
      color: #e74c3c;
      font-weight: 700;
      display: block;
      margin-bottom: 1rem;
    }
    h2 {
      font-size: 1.5rem;
      margin: 1rem 0 0.5rem;
      color: #ccc;
    }
    p {
      font-size: 1rem;
      color: #888;
      margin-bottom: 2rem;
      line-height: 1.6;
    }
    code {
      background: #1e1e1e;
      padding: 0.5rem 1rem;
      border-radius: 8px;
      color: #e74c3c;
      font-size: 0.9rem;
      display: inline-block;
      margin-bottom: 2rem;
      font-family: 'Consolas', monospace;
    }
    .stats {
      display: flex;
      justify-content: center;
      gap: 2rem;
      margin: 2rem 0;
      flex-wrap: wrap;
    }
    .stat-item {
      text-align: center;
    }
    .stat-value {
      font-size: 2rem;
      font-weight: 700;
      color: #e74c3c;
    }
    .stat-label {
      font-size: 0.85rem;
      color: #888;
      margin-top: 0.25rem;
    }
    a {
      display: inline-block;
      padding: 0.8rem 2rem;
      background: #e74c3c;
      color: white;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 1rem;
      transition: all 0.2s;
      margin: 0.5rem;
    }
    a:hover {
      background: #c0392b;
      transform: translateY(-2px);
    }
    .footer {
      margin-top: 3rem;
      color: #555;
      font-size: 0.85rem;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1><span class="arabic-number">٤٠٤</span></h1>
    <h2>الصفحة غير موجودة</h2>
    <p>الصفحة التي تبحث عنها غير موجودة أو تم نقلها إلى مكان آخر.</p>
    <code>${req.method} ${req.originalUrl}</code>
    <div class="stats">
      <div class="stat-item">
        <div class="stat-value">٢٠+</div>
        <div class="stat-label">وظيفة متاحة</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">١٠٠٪</div>
        <div class="stat-label">تواصل مباشر</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">مجاني</div>
        <div class="stat-label">بدون رسوم</div>
      </div>
    </div>
    <div>
      <a href="/api/v1/health">فحص الخادم</a>
      <a href="javascript:history.back()">العودة للخلف</a>
    </div>
    <div class="footer">
      <p>كُفُـؤ — منصة التوظيف المباشر</p>
    </div>
  </div>
</body>
</html>`;
  res.status(404).send(html);
};

app.use(notFoundHandler);
app.use(errorHandler);

export default app;

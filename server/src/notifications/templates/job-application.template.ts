import { escapeHtml } from '../../shared/utils/escape-html.utils';

export function jobApplicationTemplate(data: {
  recipientName: string;
  jobTitle: string;
  companyName: string;
  trackingPixelUrl: string;
  logoCid?: string | null;
  logoMimeType?: string | null;
}): string {
  const safeRecipientName = escapeHtml(data.recipientName);
  const safeJobTitle = escapeHtml(data.jobTitle);
  const safeCompanyName = escapeHtml(data.companyName);
  const safeTrackingPixelUrl = escapeHtml(data.trackingPixelUrl);

  const logoInline =
    data.logoCid && data.logoMimeType
      ? `<img src="cid:${data.logoCid}" alt="Logo" style="max-height:60px;max-width:200px;margin-bottom:16px;" />`
      : '';

  return `
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>طلب انضمام - ${safeJobTitle}</title>
    </head>
    <body style="direction:ltr;text-align:right;">
      ${logoInline}
      <h1>طلب انضمام - ${safeJobTitle}</h1>
      <p>${safeCompanyName}</p>

      <p style="direction:ltr;">
        السلام عليكم ورحمة الله وبركاته،<br/><br/>
        أتقدم لكم بطلب الانضمام إلى الوظيفة المعلن عنها، وأرفقت سيرتي الذاتية للاطلاع على خبراتي ومهاراتي.<br/>
        يشرفني التواصل معكم في حال مناسبة ملفي لاحتياجكم الحالي.<br/><br/>
        مع خالص التقدير،<br/>
        ${safeRecipientName}
      </p>

      <p>تم إرسال هذا البريد عبر منصة HR Data بشكل آلي.</p>

      <img src="${safeTrackingPixelUrl}" width="1" height="1" alt="" />
    </body>
    </html>
  `;
}

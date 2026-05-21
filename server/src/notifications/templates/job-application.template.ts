import { escapeHtml } from '../../shared/utils/escape-html.utils';

export function jobApplicationTemplate(data: {
  recipientName: string;
  jobTitle: string;
  companyName: string;
}): string {
  const safeRecipientName = escapeHtml(data.recipientName);
  const safeJobTitle = escapeHtml(data.jobTitle);
  const safeCompanyName = escapeHtml(data.companyName);

  return `
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>طلب انضمام - ${safeJobTitle}</title>
    </head>
    <body style="font-family:Arial, sans-serif; line-height:1.6; color:#000; text-align:right; direction:rtl; padding:20px;">
      <h1 style="font-size:20px;">طلب انضمام - ${safeJobTitle}</h1>
      <p style="font-weight:bold;">${safeCompanyName}</p>

      <div style="margin-top:20px;">
        السلام عليكم ورحمة الله وبركاته،<br/><br/>
        أتقدم لكم بطلب الانضمام إلى الوظيفة المعلن عنها، وأرفقت سيرتي الذاتية للاطلاع على خبراتي ومهاراتي.<br/>
        يشرفني التواصل معكم في حال مناسبة ملفي لاحتياجكم الحالي.<br/><br/>
        مع خالص التقدير،<br/>
        ${safeRecipientName}
      </div>

      <div style="text-align: center; margin-top: 40px;">
        تم ارساله عبر منصه التوظيف المباشر<br/>
        HRDatasa
      </div>
    </body>
    </html>
  `;
}

import { escapeHtml } from '../../shared/utils/escape-html.utils';

export function jobApplicationTemplate(data: {
  recipientName: string;
  jobTitle: string;
  companyName: string;
  body?: string | undefined;
}): string {
  const safeRecipientName = escapeHtml(data.recipientName);
  const safeJobTitle = escapeHtml(data.jobTitle);
  const safeCompanyName = escapeHtml(data.companyName);

  const customBodyHtml = data.body
    ? escapeHtml(data.body).replace(/\n/g, '<br/>')
    : `أنا شاب سعودي طموح، أحمل مؤهلًا أكاديميًا مناسبًا وخبرة عملية أسهمت في صقل مهاراتي التحليلية وتعزيز قدرتي على العمل ضمن فريق متناسق وفعّال. وأُرفق مع هذه الرسالة سيرتي الذاتية التفصيلية للاطلاع على مسيرتي المهنية وأبرز إنجازاتي.<br/><br/>وأُعرب عن أملي في التواصل معكم في الوقت الذي يناسبكم، لمناقشة ما أستطيع تقديمه من قيمة مضافة تُسهم في تحقيق أهداف الشركة وتطلعاتها.<br/><br/>وتقبلوا خالص الشكر والتقدير،`;

  return `
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>طلب انضمام - ${safeJobTitle}</title>
    </head>
    <body style="font-family:Arial, sans-serif; line-height:1.6; color:#000; text-align:right; direction:rtl; padding:20px;">
      <div style="margin-top:20px;">
        السلام عليكم ورحمة الله وبركاته،<br/><br/>
        يُسعدني أن أتقدم بهذه الرسالة إلى شركة ${safeCompanyName}، مُعبِّرًا عن رغبتي الصادقة في الانضمام إلى فريقكم المتميز، لِما تتمتع به شركتكم من بيئة عمل احترافية وفرص حقيقية للنمو والتطور.<br/><br/>
        ${customBodyHtml}<br/><br/>
        ${safeRecipientName}
      </div>

      <div style="text-align: center; margin-top: 40px; font-size: 12px; color: #888;">
        تم ارساله عبر منصه التوظيف المباشر<br/>
        HRDatasa
      </div>
    </body>
    </html>
  `;
}

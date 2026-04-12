import { escapeHtml } from '../../shared/utils/escape-html.utils';

export function jobApplicationTemplate(data: {
  recipientName: string;
  jobTitle: string;
  companyName: string;
  trackingPixelUrl: string;
}): string {
  const safeRecipientName = escapeHtml(data.recipientName);
  const safeJobTitle = escapeHtml(data.jobTitle);
  const safeCompanyName = escapeHtml(data.companyName);
  const safeTrackingPixelUrl = escapeHtml(data.trackingPixelUrl);

  return `
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>طلب انضمام - ${safeJobTitle}</title>
    </head>
    <body style="margin:0;padding:0;background:#f5f0e8;font-family:'Cairo',Tahoma,Arial,sans-serif;color:#0d0d0d;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 12px;">
        <tr>
          <td align="center">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:620px;background:#f5f0e8;border:2px solid #0d0d0d;border-radius:4px;overflow:hidden;">
              <tr>
                <td style="padding:30px 28px;border-bottom:2px solid #0d0d0d;background:#ede8dc;text-align:center;">
                  <div style="font-size:34px;font-weight:900;letter-spacing:-0.8px;">كُفُـؤ<span style="color:#c0392b;">.</span></div>
                  <p style="margin:8px 0 0;font-size:12px;color:#a89880;font-weight:700;">تقديم وظيفي مباشر</p>
                </td>
              </tr>

              <tr>
                <td style="padding:34px 28px;">
                  <h1 style="margin:0 0 8px;font-size:24px;line-height:1.4;font-weight:900;color:#0d0d0d;">طلب انضمام - ${safeJobTitle}</h1>
                  <p style="margin:0 0 18px;font-size:14px;color:#a89880;line-height:1.8;">${safeCompanyName}</p>

                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:10px;background:#ede8dc;border:1px solid #c8b89a;border-radius:4px;">
                    <tr>
                      <td style="padding:16px 14px;font-size:14px;line-height:2;color:#0d0d0d;">
                        السلام عليكم ورحمة الله وبركاته،<br/><br/>
                        أتقدم لكم بطلب الانضمام إلى الوظيفة المعلن عنها، وأرفقت سيرتي الذاتية للاطلاع على خبراتي ومهاراتي.<br/>
                        يشرفني التواصل معكم في حال مناسبة ملفي لاحتياجكم الحالي.<br/><br/>
                        مع خالص التقدير،<br/>
                        ${safeRecipientName}
                      </td>
                    </tr>
                  </table>

                  <p style="margin:16px 0 0;font-size:12px;color:#a89880;line-height:1.8;">تم إرسال هذا البريد عبر منصة كُفُؤ بشكل آلي.</p>
                </td>
              </tr>

              <tr>
                <td style="padding:20px 28px;border-top:1px solid #c8b89a;background:#ede8dc;text-align:center;">
                  <p style="margin:0;font-size:12px;color:#a89880;line-height:1.8;">© 2026 كُفُؤ - جميع الحقوق محفوظة</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>

      <img src="${safeTrackingPixelUrl}" width="1" height="1" alt="" style="display:none;" />
    </body>
    </html>
  `;
}

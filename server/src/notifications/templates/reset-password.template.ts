import { escapeHtml } from '../../shared/utils/escape-html.utils';

export const resetPasswordTemplate = (name: string, resetUrl: string): string => {
  const safeName = escapeHtml(name);
  const safeResetUrl = escapeHtml(resetUrl);

  return `
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>إعادة تعيين كلمة المرور - HR Data</title>
    </head>
    <body style="margin:0;padding:0;background:#f5f0e8;font-family:'Cairo',Tahoma,Arial,sans-serif;color:#0d0d0d;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 12px;">
        <tr>
          <td align="center">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:620px;background:#f5f0e8;border:2px solid #0d0d0d;border-radius:4px;overflow:hidden;">
              <tr>
                <td style="padding:30px 28px;border-bottom:2px solid #0d0d0d;background:#ede8dc;text-align:center;">
                  <div style="font-size:34px;font-weight:900;letter-spacing:-0.8px;text-align:center;">HR Data<span style="color:#c0392b;">.</span></div>
                  <p style="margin:8px 0 0;font-size:12px;color:#a89880;font-weight:700;text-align:center;">أمان الحساب</p>
                </td>
              </tr>

              <tr>
                <td style="padding:34px 28px;">
                  <h1 style="margin:0 0 14px;font-size:26px;line-height:1.3;font-weight:900;color:#0d0d0d;text-align:right;">إعادة تعيين كلمة المرور</h1>
                  <p style="margin:0 0 16px;font-size:15px;line-height:1.9;color:#0d0d0d;direction:ltr;text-align:right;">
                    أهلاً ${safeName}، وصلنا طلب لإعادة تعيين كلمة المرور الخاصة بحسابك. اضغط الزر التالي لإكمال العملية.
                  </p>

                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
                    <tr>
                      <td align="center">
                        <a href="${safeResetUrl}" style="display:inline-block;background:#0d0d0d;color:#f5f0e8;text-decoration:none;padding:14px 30px;border-radius:2px;font-size:15px;font-weight:700;">إعادة تعيين كلمة المرور</a>
                      </td>
                    </tr>
                  </table>

                  <p style="margin:0 0 12px;font-size:13px;line-height:1.8;color:#a89880;text-align:right;">
                    صلاحية الرابط: ساعة واحدة فقط. إذا لم تطلب هذا الإجراء، تجاهل الرسالة.
                  </p>
                  <p style="margin:0;padding:12px 14px;background:#ede8dc;border:1px dashed #c8b89a;font-size:12px;line-height:1.8;color:#0d0d0d;word-break:break-all;direction:ltr;text-align:right;">
                    ${safeResetUrl}
                  </p>
                </td>
              </tr>

              <tr>
                <td style="padding:20px 28px;border-top:1px solid #c8b89a;background:#ede8dc;text-align:center;">
                  <p style="margin:0;font-size:12px;color:#a89880;line-height:1.8;text-align:right;">© 2026 HR Data - جميع الحقوق محفوظة</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
};

import { escapeHtml } from '../../shared/utils/escape-html.utils';

export const verifyEmailTemplate = (
  name: string,
  verifyUrl: string,
  logoCid?: string | null,
  logoMimeType?: string | null
): string => {
  const safeName = escapeHtml(name);
  const safeVerifyUrl = escapeHtml(verifyUrl);

  const logoInline =
    logoCid && logoMimeType
      ? `<img src="cid:${logoCid}" alt="Logo" style="max-height:60px;max-width:200px;margin-bottom:8px;" />`
      : `<div style="font-size:34px;font-weight:900;letter-spacing:-0.8px;text-align:center;">LOGO</div>`;

  return `
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>تفعيل البريد الإلكتروني</title>
    </head>
    <body style="margin:0;padding:0;background:#F4F0E8;font-family:'Cairo',Tahoma,Arial,sans-serif;color:#0d0d0d;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 12px;">
        <tr>
          <td align="center">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:620px;background:#F4F0E8;border:2px solid #0d0d0d;border-radius:4px;overflow:hidden;">
              <tr>
                <td style="padding:40px 28px;border-bottom:2px solid #0d0d0d;background:#F4F0E8;text-align:center;">
                  ${logoInline}
                  <p style="margin:8px 0 0;font-size:12px;color:#a89880;font-weight:700;text-align:center;">منصة التوظيف المباشر</p>
                </td>
              </tr>

              <tr>
                <td style="padding:34px 28px;">
                  <h1 style="margin:0 0 14px;font-size:26px;line-height:1.3;font-weight:900;color:#0d0d0d;text-align:right;">تفعيل البريد الإلكتروني</h1>
                  <p style="margin:0 0 16px;font-size:15px;line-height:1.9;color:#0d0d0d;direction:ltr;text-align:right;">
                    أهلاً ${safeName}، شكراً لتسجيلك في منصتنا. لتفعيل حسابك والبدء باستخدام جميع الميزات، اضغط على زر التفعيل التالي.
                  </p>

                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
                    <tr>
                      <td align="center">
                        <a href="${safeVerifyUrl}" style="display:inline-block;background:#0d0d0d;color:#F4F0E8;text-decoration:none;padding:14px 30px;border-radius:2px;font-size:15px;font-weight:700;">تفعيل الحساب</a>
                      </td>
                    </tr>
                  </table>

                  <p style="margin:0 0 12px;font-size:13px;line-height:1.8;color:#a89880;text-align:right;">
                    إذا لم يفتح الزر، انسخ الرابط التالي في المتصفح:
                  </p>
                  <p style="margin:0;padding:12px 14px;background:#ede8dc;border:1px dashed #c8b89a;font-size:12px;line-height:1.8;color:#0d0d0d;word-break:break-all;direction:ltr;text-align:right;">
                    ${safeVerifyUrl}
                  </p>
                </td>
              </tr>

              <tr>
                <td style="padding:20px 28px;border-top:1px solid #c8b89a;background:#F4F0E8;text-align:center;">
                  <p style="margin:0;font-size:12px;color:#a89880;line-height:1.8;text-align:right;">© 2026 جميع الحقوق محفوظة لدى HR Data</p>
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

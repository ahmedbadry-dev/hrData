import { escapeHtml } from '../../shared/utils/escape-html.utils';

export const verifyEmailTemplate = (name: string, verifyUrl: string): string => {
  const safeName = escapeHtml(name);
  return `
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>تحقق من بريدك الإلكتروني - كفو</title>
      <style>
        .verify-btn:hover {
          background-color: #6366f1 !important;
          box-shadow: 0 8px 24px rgba(99, 102, 241, 0.40) !important;
          transform: translateY(-2px) !important;
        }
        .verify-btn {
          transition: all 0.25s ease !important;
        }
      </style>
    </head>
    <body style="
      margin: 0;
      padding: 0;
      background-color: #0f172a;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      -webkit-font-smoothing: antialiased;
    ">

      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #0f172a; padding: 48px 16px;">
        <tr>
          <td align="center">

            <!-- Card -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="
              max-width: 560px;
              background-color: #1e293b;
              border-radius: 20px;
              overflow: hidden;
              border: 1px solid #334155;
              box-shadow: 0 24px 60px rgba(0, 0, 0, 0.50);
            ">

              <!-- ── HEADER ── -->
              <tr>
                <td style="
                  background: linear-gradient(160deg, #1e1b4b 0%, #312e81 60%, #1e1b4b 100%);
                  padding: 48px 40px 40px;
                  text-align: center;
                  border-bottom: 1px solid #3730a3;
                ">
                  <!-- Glow ring icon -->
                  <div style="
                    display: inline-block;
                    width: 72px;
                    height: 72px;
                    background: rgba(99, 102, 241, 0.10);
                    border: 1px solid rgba(99, 102, 241, 0.30);
                    border-radius: 50%;
                    line-height: 72px;
                    text-align: center;
                    font-size: 30px;
                    margin-bottom: 22px;
                  ">✉️</div>

                  <h1 style="
                    margin: 0;
                    color: #f8fafc;
                    font-size: 22px;
                    font-weight: 700;
                    letter-spacing: -0.3px;
                    line-height: 1.35;
                  ">تحقق من بريدك الإلكتروني</h1>

                  <p style="
                    margin: 10px 0 0;
                    color: #94a3b8;
                    font-size: 14px;
                    line-height: 1.5;
                  ">خطوتك الأخيرة قبل تفعيل حسابك في كفو</p>
                </td>
              </tr>

              <!-- ── BODY ── -->
              <tr>
                <td style="padding: 40px 40px 32px;">

                  <!-- Greeting -->
                  <p style="
                    margin: 0 0 14px;
                    font-size: 16px;
                    font-weight: 600;
                    color: #e2e8f0;
                  ">مرحباً ${safeName}،</p>

                  <!-- Intro text -->
                  <p style="
                    margin: 0 0 32px;
                    font-size: 15px;
                    color: #94a3b8;
                    line-height: 1.8;
                  ">
                    شكراً لك على إنشاء حسابك في كفو. لإكمال تسجيلك والبدء في البحث عن الوظائف، يرجى التحقق من بريدك الإلكتروني بالنقر على الزر أدناه.
                  </p>

                  <!-- CTA Button -->
                  <table width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td align="center" style="padding-bottom: 32px;">
                        <a
                          href="${verifyUrl}"
                          class="verify-btn"
                          style="
                            display: inline-block;
                            background-color: #6366f1;
                            color: #ffffff;
                            text-decoration: none;
                            font-size: 15px;
                            font-weight: 700;
                            letter-spacing: 0.3px;
                            padding: 16px 52px;
                            border-radius: 12px;
                            box-shadow: 0 4px 18px rgba(99, 102, 241, 0.30);
                          "
                        >✅ &nbsp;تحقق من بريدي الإلكتروني</a>
                      </td>
                    </tr>
                  </table>

                  <!-- Expiry notice -->
                  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="
                    background-color: #1f1f1f;
                    border: 1px solid #404040;
                    border-radius: 10px;
                    margin-bottom: 28px;
                  ">
                    <tr>
                      <td style="padding: 14px 18px;">
                        <table cellpadding="0" cellspacing="0" border="0">
                          <tr>
                            <td style="
                              font-size: 17px;
                              padding-left: 10px;
                              vertical-align: middle;
                            ">⏰</td>
                            <td style="
                              font-size: 13px;
                              color: #a1a1aa;
                              line-height: 1.6;
                              vertical-align: middle;
                            ">
                              هذا الرابط ينتهي خلال <strong style="color: #facc15;">24 ساعة</strong>.
                              بعد ذلك، ستحتاج إلى طلب رابط جديد.
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>

                  <!-- Divider -->
                  <table width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td style="border-top: 1px solid #334155; padding-bottom: 24px;"></td>
                    </tr>
                  </table>

                  <!-- URL fallback label -->
                  <p style="
                    margin: 0 0 8px;
                    font-size: 11px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.8px;
                    color: #64748b;
                  ">أو انسخ هذا الرابط في متصفحك</p>

                  <!-- URL fallback box -->
                  <p style="
                    margin: 0 0 28px;
                    padding: 12px 16px;
                    background: #0f172a;
                    border: 1px dashed #334155;
                    border-radius: 8px;
                    font-size: 12px;
                    color: #94a3b8;
                    word-break: break-all;
                    line-height: 1.7;
                  ">${verifyUrl}</p>

                  <!-- Security notice -->
                  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="
                    background-color: #1e1e2e;
                    border: 1px solid #3f3f5f;
                    border-radius: 10px;
                  ">
                    <tr>
                      <td style="padding: 14px 18px;">
                        <table cellpadding="0" cellspacing="0" border="0">
                          <tr>
                            <td style="
                              font-size: 17px;
                              padding-left: 10px;
                              vertical-align: middle;
                            ">🔒</td>
                            <td style="
                              font-size: 13px;
                              color: #a1a1aa;
                              line-height: 1.6;
                              vertical-align: middle;
                            ">
                              لم تقم بإنشاء حساب في كفو؟ يمكنك تجاهل هذا البريد بأمان.
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>

                </td>
              </tr>

              <!-- ── FOOTER ── -->
              <tr>
                <td style="
                  background-color: #0f172a;
                  border-top: 1px solid #334155;
                  padding: 24px 40px;
                  text-align: center;
                ">
                  <p style="
                    margin: 0 0 8px;
                    font-size: 13px;
                    font-weight: 700;
                    color: #6366f1;
                    letter-spacing: 1.5px;
                    text-transform: uppercase;
                  ">كفو 🎯</p>

                  <p style="
                    margin: 0;
                    font-size: 12px;
                    color: #64748b;
                    line-height: 1.8;
                  >
                    منصة البحث عن الوظائف<br/>
                    © 2026 كفو. جميع الحقوق محفوظة.<br/>
                    هذا بريد إلكتروني آلي - يرجى عدم الرد.
                  </p>
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

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
      <title>طلب انضمام — ${safeJobTitle}</title>
    </head>
    <body style="
      margin: 0;
      padding: 0;
      background-color: #0f1117;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      -webkit-font-smoothing: antialiased;
    ">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #0f1117; padding: 48px 16px;">
        <tr>
          <td align="center">
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="
              max-width: 560px;
              background-color: #16181f;
              border-radius: 20px;
              overflow: hidden;
              border: 1px solid #2a2d3a;
              box-shadow: 0 24px 60px rgba(0, 0, 0, 0.50);
            ">
              <tr>
                <td style="
                  background: linear-gradient(160deg, #1a2e1a 0%, #1f3d1f 60%, #1a2a1a 100%);
                  padding: 44px 40px 36px;
                  text-align: center;
                  border-bottom: 1px solid #2a3d2a;
                ">
                  <div style="
                    display: inline-block;
                    width: 72px;
                    height: 72px;
                    background: rgba(34, 197, 94, 0.12);
                    border: 1px solid rgba(34, 197, 94, 0.3);
                    border-radius: 50%;
                    line-height: 72px;
                    text-align: center;
                    font-size: 30px;
                    margin-bottom: 20px;
                  ">📨</div>

                  <h1 style="
                    margin: 0;
                    color: #f1f5f9;
                    font-size: 22px;
                    font-weight: 700;
                    letter-spacing: -0.3px;
                    line-height: 1.35;
                  ">طلب انضمام — ${safeJobTitle}</h1>

                  <p style="
                    margin: 10px 0 0;
                    color: #4a5568;
                    font-size: 14px;
                    line-height: 1.5;
                  ">${safeCompanyName}</p>
                </td>
              </tr>

              <tr>
                <td style="padding: 36px 40px 32px;">
                  <p style="
                    margin: 0 0 14px;
                    font-size: 16px;
                    font-weight: 600;
                    color: #e2e8f0;
                  ">السلام عليكم ورحمة الله وبركاته،</p>

                  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="
                    background-color: #101923;
                    border: 1px solid #1f2c3a;
                    border-radius: 12px;
                    margin-bottom: 24px;
                  ">
                    <tr>
                      <td style="
                        padding: 18px 20px;
                        font-size: 15px;
                        color: #cbd5e1;
                        line-height: 1.9;
                        white-space: pre-wrap;
                        text-align: right;
                      ">أتقدم بهذه الرسالة مُعبِّراً عن اهتمامي الصادق بالانضمام إلى فريقكم الكريم، وذلك في ضوء ما تُقدِّمه مؤسستكم من بيئة عمل محفِّزة وفرص واعدة للنمو المهني.

أحمل مؤهلاً أكاديمياً ملائماً، وخبرةً عملية أسهمت في تطوير مهاراتي التحليلية وقدراتي على العمل ضمن فريق متكامل. وأُرفق بهذه الرسالة سيرتي الذاتية المُفصَّلة للاطلاع على مسيرتي المهنية وإنجازاتي.

يسعدني التواصل معكم في الوقت المناسب لمناقشة كيفية إسهامي في تحقيق أهداف مؤسستكم.

وتفضلوا بقبول فائق الاحترام والتقدير،
${safeRecipientName}</td>
                    </tr>
                  </table>

                  <p style="
                    margin: 0;
                    font-size: 13px;
                    color: #64748b;
                    line-height: 1.7;
                  ">
                    يُرجى العلم بأن السيرة الذاتية مُرفقة مع هذه الرسالة. هذا إيميل آلي، لا replies.
                  </p>
                </td>
              </tr>

              <tr>
                <td style="
                  background-color: #12141a;
                  border-top: 1px solid #1e2533;
                  padding: 20px 40px;
                  text-align: center;
                ">
                  <p style="
                    margin: 0;
                    font-size: 12px;
                    color: #2d3748;
                    line-height: 1.8;
                  ">© 2026 Kafoo. جميع الحقوق محفوظة.</p>
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

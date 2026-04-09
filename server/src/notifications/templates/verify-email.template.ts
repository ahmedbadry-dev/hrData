import { escapeHtml } from '../../shared/utils/escape-html.utils';

export const verifyEmailTemplate = (name: string, verifyUrl: string): string => {
  const safeName = escapeHtml(name);
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Verify Your Email</title>
      <style>
        .verify-btn:hover {
          background-color: #0ea271 !important;
          box-shadow: 0 8px 24px rgba(16, 185, 129, 0.40) !important;
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
      background-color: #0f1117;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      -webkit-font-smoothing: antialiased;
    ">

      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #0f1117; padding: 48px 16px;">
        <tr>
          <td align="center">

            <!-- Card -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="
              max-width: 560px;
              background-color: #16181f;
              border-radius: 20px;
              overflow: hidden;
              border: 1px solid #2a2d3a;
              box-shadow: 0 24px 60px rgba(0, 0, 0, 0.50);
            ">

              <!-- ── HEADER ── -->
              <tr>
                <td style="
                  background: linear-gradient(160deg, #0d1f2d 0%, #0f2137 60%, #0d1a2e 100%);
                  padding: 48px 40px 40px;
                  text-align: center;
                  border-bottom: 1px solid #1e2d3d;
                ">
                  <!-- Glow ring icon -->
                  <div style="
                    display: inline-block;
                    width: 72px;
                    height: 72px;
                    background: rgba(16, 185, 129, 0.10);
                    border: 1px solid rgba(16, 185, 129, 0.30);
                    border-radius: 50%;
                    line-height: 72px;
                    text-align: center;
                    font-size: 30px;
                    margin-bottom: 22px;
                  ">✉️</div>

                  <h1 style="
                    margin: 0;
                    color: #f1f5f9;
                    font-size: 22px;
                    font-weight: 700;
                    letter-spacing: -0.3px;
                    line-height: 1.35;
                  ">Confirm Your Email Address</h1>

                  <p style="
                    margin: 10px 0 0;
                    color: #4a5568;
                    font-size: 14px;
                    line-height: 1.5;
                  ">You're one step away from accessing ETBS</p>
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
                  ">Hi ${safeName},</p>

                  <!-- Intro text -->
                  <p style="
                    margin: 0 0 32px;
                    font-size: 15px;
                    color: #64748b;
                    line-height: 1.8;
                  ">
                    Thanks for creating your ETBS account. To complete your
                    registration and start booking events, please verify your
                    email address by clicking the button below.
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
                            background-color: #10b981;
                            color: #ffffff;
                            text-decoration: none;
                            font-size: 15px;
                            font-weight: 700;
                            letter-spacing: 0.3px;
                            padding: 16px 52px;
                            border-radius: 12px;
                            box-shadow: 0 4px 18px rgba(16, 185, 129, 0.30);
                          "
                        >✅ &nbsp;Verify My Email Address</a>
                      </td>
                    </tr>
                  </table>

                  <!-- Expiry notice -->
                  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="
                    background-color: #1a1a0f;
                    border: 1px solid #3d3510;
                    border-radius: 10px;
                    margin-bottom: 28px;
                  ">
                    <tr>
                      <td style="padding: 14px 18px;">
                        <table cellpadding="0" cellspacing="0" border="0">
                          <tr>
                            <td style="
                              font-size: 17px;
                              padding-right: 10px;
                              vertical-align: middle;
                            ">⏳</td>
                            <td style="
                              font-size: 13px;
                              color: #a38b3a;
                              line-height: 1.6;
                              vertical-align: middle;
                            ">
                              This link expires in <strong style="color: #d4a017;">24 hours</strong>.
                              After that, you'll need to request a new one.
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>

                  <!-- Divider -->
                  <table width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td style="border-top: 1px solid #1e2533; padding-bottom: 24px;"></td>
                    </tr>
                  </table>

                  <!-- URL fallback label -->
                  <p style="
                    margin: 0 0 8px;
                    font-size: 11px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.8px;
                    color: #2d3748;
                  ">Or copy this link into your browser</p>

                  <!-- URL fallback box -->
                  <p style="
                    margin: 0 0 28px;
                    padding: 12px 16px;
                    background: #12141a;
                    border: 1px dashed #2a2d3a;
                    border-radius: 8px;
                    font-size: 12px;
                    color: #4a5568;
                    word-break: break-all;
                    line-height: 1.7;
                  ">${verifyUrl}</p>

                  <!-- Security notice -->
                  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="
                    background-color: #0d1a14;
                    border: 1px solid #1a3328;
                    border-radius: 10px;
                  ">
                    <tr>
                      <td style="padding: 14px 18px;">
                        <table cellpadding="0" cellspacing="0" border="0">
                          <tr>
                            <td style="
                              font-size: 17px;
                              padding-right: 10px;
                              vertical-align: middle;
                            ">🔒</td>
                            <td style="
                              font-size: 13px;
                              color: #2d6a4f;
                              line-height: 1.6;
                              vertical-align: middle;
                            ">
                              Didn't create an ETBS account? You can safely
                              ignore this email — no action is required.
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
                  background-color: #12141a;
                  border-top: 1px solid #1e2533;
                  padding: 24px 40px;
                  text-align: center;
                ">
                  <p style="
                    margin: 0 0 8px;
                    font-size: 13px;
                    font-weight: 700;
                    color: #10b981;
                    letter-spacing: 1.5px;
                    text-transform: uppercase;
                  ">🎟 ETBS</p>

                  <p style="
                    margin: 0;
                    font-size: 12px;
                    color: #2d3748;
                    line-height: 1.8;
                  ">
                    Event Ticketing & Booking System<br/>
                    © 2026 ETBS. All rights reserved.<br/>
                    This is an automated message — please do not reply.
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

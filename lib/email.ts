import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = 'Signal <noreply@bnedsignal.com>'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://bnedsignal.com'

export async function sendBriefReadyEmail(
  to: string,
  donorName: string,
  briefId: string,
  latteStage?: string | null,
  nextMove?: string | null,
) {
  const briefUrl = `${APP_URL}/brief/${briefId}`

  const teaser = latteStage && nextMove
    ? `
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;margin-bottom:28px;">
        <tr>
          <td style="padding:16px 20px;">
            <p style="margin:0 0 6px;font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.6px;">Your next move · ${latteStage} stage</p>
            <p style="margin:0;font-size:14px;color:#374151;line-height:1.6;">${nextMove.length > 120 ? nextMove.slice(0, 117) + '…' : nextMove}</p>
          </td>
        </tr>
      </table>`
    : ''

  await resend.emails.send({
    from: FROM,
    to: [to],
    subject: `Your Signal brief on ${donorName} is ready`,
    html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
</head>
<body style="margin:0;padding:0;background-color:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f3f4f6;padding:48px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

          <!-- Logo -->
          <tr>
            <td style="padding-bottom:28px;">
              <p style="margin:0;font-size:22px;font-weight:700;color:#1E3A5F;letter-spacing:-0.3px;">Signal</p>
              <p style="margin:4px 0 0;font-size:12px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.8px;">Donor Intelligence</p>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;padding:40px 40px 36px;">

              <!-- Accent bar -->
              <table cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td style="background:#C8922A;border-radius:4px;width:40px;height:3px;"></td>
                </tr>
              </table>

              <p style="margin:0 0 6px;font-size:24px;font-weight:700;color:#111827;letter-spacing:-0.3px;">Your brief on ${donorName} is ready.</p>
              <p style="margin:0 0 28px;font-size:15px;color:#6b7280;line-height:1.65;">
                Signal has finished researching ${donorName}'s values, affiliations, and giving patterns — and generated your L.A.T.T.E. cultivation recommendation.
              </p>

              ${teaser}

              <!-- CTA -->
              <table cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td style="background:#C8922A;border-radius:8px;">
                    <a href="${briefUrl}" style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;letter-spacing:-0.1px;">
                      View your brief →
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Divider -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
                <tr><td style="border-top:1px solid #f3f4f6;"></td></tr>
              </table>

              <p style="margin:0;font-size:13px;color:#9ca3af;line-height:1.6;">
                Button not working? <a href="${briefUrl}" style="color:#1E3A5F;word-break:break-all;">${briefUrl}</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding-top:28px;">
              <p style="margin:0;font-size:12px;color:#d1d5db;">
                Signal · Donor intelligence for nonprofit leaders · <a href="https://bnedsignal.com" style="color:#9ca3af;text-decoration:none;">bnedsignal.com</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  })
}

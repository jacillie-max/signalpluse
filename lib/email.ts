import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.BREVO_SMTP_LOGIN!,
    pass: process.env.BREVO_SMTP_PASSWORD!,
  },
})

const FROM = 'Signal <signal@bnedsignal.com>'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL

export async function sendBriefReadyEmail(to: string, donorName: string, briefId: string) {
  await transporter.sendMail({
    from: FROM,
    to,
    subject: `Your Signal brief for ${donorName} is ready`,
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; color: #111827;">
        <h2 style="color: #1E3A5F;">Your brief is ready.</h2>
        <p>Your Signal donor brief for <strong>${donorName}</strong> has been generated and is ready to review.</p>
        <a href="${APP_URL}/brief/${briefId}"
           style="display: inline-block; background: #C8922A; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; margin: 16px 0;">
          View your brief →
        </a>
        <p style="color: #6B7280; font-size: 14px;">Signal · bnedsignal.com</p>
      </div>
    `,
  })
}

export async function sendFollowUpEmail(to: string) {
  await transporter.sendMail({
    from: FROM,
    to,
    subject: 'What did you think of your Signal brief?',
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; color: #111827;">
        <h2 style="color: #1E3A5F;">Did your brief land?</h2>
        <p>You generated a Signal brief a couple of days ago. We hope it helped you walk into that conversation with confidence.</p>
        <p>Founding Member pricing is still available — $99/month for 10 briefs, locked in for 12 months. The cap is 25 members.</p>
        <a href="${APP_URL}/pricing"
           style="display: inline-block; background: #C8922A; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; margin: 16px 0;">
          See Founding Member pricing →
        </a>
        <p style="color: #6B7280; font-size: 14px;">Signal · bnedsignal.com</p>
      </div>
    `,
  })
}

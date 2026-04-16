import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const TO_EMAIL = process.env.CONTACT_EMAIL || 'toms.liepins@gmail.com';
const FROM_EMAIL = process.env.FROM_EMAIL || 'Yatra.lv <onboarding@resend.dev>';
const TURNSTILE_SECRET = process.env.TURNSTILE_SECRET_KEY;

async function verifyTurnstile(token, ip) {
  if (!TURNSTILE_SECRET) {
    // If no secret configured, skip verification so dev works without it.
    return { success: true, skipped: true };
  }
  if (!token) return { success: false, reason: 'missing_token' };

  const body = new URLSearchParams({ secret: TURNSTILE_SECRET, response: token });
  if (ip) body.append('remoteip', ip);

  const resp = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body,
  });
  const data = await resp.json();
  return { success: data.success === true, reason: data['error-codes']?.join(',') };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    name, email, phone, dates, journey, participants, message,
    'cf-turnstile-response': turnstileToken,
  } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: 'Trūkst obligāto lauku' });
  }

  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress;
  const verify = await verifyTurnstile(turnstileToken, ip);
  if (!verify.success) {
    return res.status(403).json({ error: 'Neizdevās verificēt captcha', reason: verify.reason });
  }

  const journeyLabel = journey || 'Pančakarma';
  const datesRow = dates
    ? `<tr><td style="padding:6px 12px 6px 0;color:#888">Datumi</td><td style="padding:6px 0">${dates}</td></tr>`
    : '';

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: TO_EMAIL,
      replyTo: email,
      subject: `Jauns pieteikums (${journeyLabel}) — ${name}`,
      html: `
        <h2>Jauns pieteikums no yatra.lv</h2>
        <table style="border-collapse:collapse;font-family:sans-serif;font-size:15px">
          <tr><td style="padding:6px 12px 6px 0;color:#888">Ceļojums</td><td style="padding:6px 0"><strong>${journeyLabel}</strong></td></tr>
          <tr><td style="padding:6px 12px 6px 0;color:#888">Vārds</td><td style="padding:6px 0">${name}</td></tr>
          <tr><td style="padding:6px 12px 6px 0;color:#888">E-pasts</td><td style="padding:6px 0">${email}</td></tr>
          <tr><td style="padding:6px 12px 6px 0;color:#888">Tālrunis</td><td style="padding:6px 0">${phone || '—'}</td></tr>
          ${datesRow}
          <tr><td style="padding:6px 12px 6px 0;color:#888">Dalībnieki</td><td style="padding:6px 0">${participants || '1'}</td></tr>
          <tr><td style="padding:6px 12px 6px 0;color:#888">Ziņojums</td><td style="padding:6px 0">${message || '—'}</td></tr>
        </table>
      `,
    });

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Resend error:', err);
    return res.status(500).json({ error: 'Neizdevās nosūtīt e-pastu' });
  }
}

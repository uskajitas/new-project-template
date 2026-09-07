import { getSetting } from './settings';

// Sends the site owner one email when something worth knowing happens (a
// brand-new visitor signed in, a trial ran out, etc). Uses Resend — a REST
// API, so no SMTP setup, no nodemailer. RESEND_API_KEY comes from the
// settings table (shared across projects) with an env fallback for dev.
//
// Never throws: a failed notification must never break the request that
// triggered it (e.g. a login). Errors are logged, not propagated.
export async function notifyAdmin(subject: string, text: string): Promise<void> {
  try {
    const apiKey = await getSetting('RESEND_API_KEY');
    const to = (await getSetting('NOTIFY_EMAIL')) || 'usquiano@gmail.com';
    if (!apiKey) { console.warn('[notify] RESEND_API_KEY not set — skipping:', subject); return; }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        // Resend's shared sandbox sender — works without verifying your own
        // domain. Swap for a verified address later if you want a custom "from".
        from: 'onboarding@resend.dev',
        to,
        subject,
        text,
      }),
    });
    if (!res.ok) {
      console.error('[notify] Resend send failed', res.status, await res.text().catch(() => ''));
    }
  } catch (e) {
    console.error('[notify] send error (non-fatal):', e);
  }
}

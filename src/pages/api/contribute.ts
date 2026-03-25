// This route runs on the server (not prerendered)
export const prerender = false;

/**
 * Community Contribution API Route
 *
 * Receives transition story submissions from the /contribute form.
 * Sends the submission details to the site owner via email (Resend)
 * for manual review and verification before adding to roadmaps.
 *
 * Environment variables required:
 *   RESEND_API_KEY - Your Resend API key
 *   FROM_EMAIL - Verified sender email
 *   ADMIN_EMAIL - Email to receive submissions (defaults to FROM_EMAIL)
 */

import type { APIRoute } from 'astro';

const TECH_ROLE_LABELS: Record<string, string> = {
  'clinical-data-analyst': 'Clinical Data Analyst',
  'health-informatics-analyst': 'Health Informatics Analyst',
  'ehr-implementation-specialist': 'EHR Implementation Specialist',
  'health-tech-product-manager': 'Health Tech Product Manager',
  'healthcare-ai-ml-engineer': 'Healthcare AI/ML Engineer',
  'health-tech-regulatory-compliance-analyst': 'Health Tech Regulatory Compliance Analyst',
  'health-data-analyst': 'Health Data Analyst',
  'healthcare-cybersecurity-analyst': 'Healthcare Cybersecurity Analyst',
  'clinical-research-associate': 'Clinical Research Associate',
  'healthcare-it-project-manager': 'Healthcare IT Project Manager',
  'healthcare-data-engineer': 'Healthcare Data Engineer',
  'heor-rwe-analyst': 'HEOR/Real-World Evidence Analyst',
  'medical-writer': 'Medical Writer',
  'other': 'Other Health Tech Role',
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    const {
      name,
      email,
      previousRole,
      previousRoleOther,
      currentTitle,
      techRoleSlug,
      techRoleOther,
      company,
      transitionTimeline,
      skillsTransferred,
      whatYouLearned,
      resourcesThatHelped,
      whatSurprisedYou,
      adviceForOthers,
      linkedinUrl,
      publicSourceUrl,
      consentToFeature,
    } = data;

    // Validate required fields
    if (!name || !email || !previousRole || !techRoleSlug || !transitionTimeline) {
      return new Response(
        JSON.stringify({ error: 'Please fill in all required fields.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!consentToFeature) {
      return new Response(
        JSON.stringify({ error: 'Consent to feature is required.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const RESEND_API_KEY = import.meta.env.RESEND_API_KEY;
    const FROM_EMAIL = import.meta.env.FROM_EMAIL || 'obed@tarvra.com';
    const ADMIN_EMAIL = import.meta.env.ADMIN_EMAIL || FROM_EMAIL;

    if (!RESEND_API_KEY) {
      console.error('RESEND_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Email service not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const techRoleLabel = techRoleSlug === 'other'
      ? (techRoleOther || 'Other')
      : (TECH_ROLE_LABELS[techRoleSlug] || techRoleSlug);

    const clinicalRole = previousRole === 'Other Clinical Role'
      ? (previousRoleOther || 'Other')
      : previousRole;

    // Send notification email to admin
    const emailRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `Health Tech Roadmaps <${FROM_EMAIL}>`,
        to: [ADMIN_EMAIL],
        subject: `New Contribution: ${clinicalRole} to ${techRoleLabel} (${name})`,
        html: buildNotificationEmail({
          name,
          email,
          clinicalRole,
          techRoleLabel,
          techRoleSlug,
          currentTitle,
          company,
          transitionTimeline,
          skillsTransferred,
          whatYouLearned,
          resourcesThatHelped,
          whatSurprisedYou,
          adviceForOthers,
          linkedinUrl,
          publicSourceUrl,
        }),
        tags: [
          { name: 'type', value: 'contribution' },
          { name: 'roadmap', value: techRoleSlug },
        ],
      }),
    });

    if (!emailRes.ok) {
      const errText = await emailRes.text();
      console.error('Resend error:', errText);
      return new Response(
        JSON.stringify({ error: 'Failed to submit. Please try again.' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Send confirmation email to contributor
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `Ehoneah Health Tech Roadmaps <${FROM_EMAIL}>`,
        to: [email],
        subject: 'We received your transition story',
        html: buildConfirmationEmail(name, techRoleLabel),
        tags: [
          { name: 'type', value: 'contribution-confirmation' },
        ],
      }),
    });

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Contribute error:', error);
    return new Response(
      JSON.stringify({ error: 'Something went wrong. Please try again.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

interface EmailData {
  name: string;
  email: string;
  clinicalRole: string;
  techRoleLabel: string;
  techRoleSlug: string;
  currentTitle: string;
  company: string;
  transitionTimeline: string;
  skillsTransferred: string;
  whatYouLearned: string;
  resourcesThatHelped: string;
  whatSurprisedYou: string;
  adviceForOthers: string;
  linkedinUrl: string;
  publicSourceUrl: string;
}

function buildNotificationEmail(d: EmailData): string {
  const section = (label: string, value: string) =>
    value ? `<tr><td style="padding:8px 12px;font-weight:600;vertical-align:top;color:#374151;width:200px;border-bottom:1px solid #f3f4f6;">${label}</td><td style="padding:8px 12px;color:#4b5563;border-bottom:1px solid #f3f4f6;">${value.replace(/\n/g, '<br>')}</td></tr>` : '';

  const link = (label: string, url: string) =>
    url ? `<tr><td style="padding:8px 12px;font-weight:600;vertical-align:top;color:#374151;width:200px;border-bottom:1px solid #f3f4f6;">${label}</td><td style="padding:8px 12px;border-bottom:1px solid #f3f4f6;"><a href="${url}" style="color:#16a34a;">${url}</a></td></tr>` : '';

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;line-height:1.6;color:#171717;max-width:700px;margin:0 auto;padding:20px;">
  <div style="border-bottom:3px solid #16a34a;padding-bottom:12px;margin-bottom:20px;">
    <h1 style="font-size:20px;margin:0;">New Transition Story Submission</h1>
    <p style="color:#6b7280;margin:4px 0 0;font-size:14px;">Roadmap: ${d.techRoleLabel}</p>
  </div>

  <table style="width:100%;border-collapse:collapse;font-size:14px;">
    ${section('Name', d.name)}
    ${section('Email', d.email)}
    ${section('Clinical Role', d.clinicalRole)}
    ${section('Tech Role', d.techRoleLabel)}
    ${section('Current Title', d.currentTitle)}
    ${section('Company', d.company)}
    ${section('Timeline', d.transitionTimeline)}
    ${link('LinkedIn', d.linkedinUrl)}
    ${link('Public Source', d.publicSourceUrl)}
  </table>

  <h2 style="font-size:16px;margin:24px 0 12px;color:#111827;">Experience Details</h2>
  <table style="width:100%;border-collapse:collapse;font-size:14px;">
    ${section('Skills Transferred', d.skillsTransferred)}
    ${section('What They Learned', d.whatYouLearned)}
    ${section('Resources That Helped', d.resourcesThatHelped)}
    ${section('What Surprised Them', d.whatSurprisedYou)}
    ${section('Advice for Others', d.adviceForOthers)}
  </table>

  <div style="margin-top:24px;padding:16px;background:#f0fdf4;border-radius:8px;font-size:13px;color:#166534;">
    <strong>Next steps:</strong> Verify this story against their LinkedIn profile and any public sources.
    If verified, add to <code>${d.techRoleSlug}.json</code> under <code>transitionStories.verified</code>.
  </div>
</body>
</html>`;
}

function buildConfirmationEmail(name: string, role: string): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;line-height:1.6;color:#171717;max-width:600px;margin:0 auto;padding:20px;">
  <div style="border-bottom:3px solid #16a34a;padding-bottom:16px;margin-bottom:24px;">
    <h1 style="font-size:22px;margin:0;">Thank you, ${name}</h1>
    <p style="color:#525252;margin:8px 0 0;">Health Tech Roadmaps by Ehoneah</p>
  </div>

  <p>We received your transition story for the <strong>${role}</strong> roadmap. Here is what happens next:</p>

  <div style="background:#f0fdf4;border-left:4px solid #16a34a;padding:16px;margin:24px 0;border-radius:0 8px 8px 0;">
    <p style="margin:0 0 8px;"><strong>1. Verification</strong><br>We will review your submission and confirm details against public sources. This typically takes 3 to 5 business days.</p>
    <p style="margin:0 0 8px;"><strong>2. Curation</strong><br>We may reach out to clarify details or ask follow-up questions to make your story as helpful as possible.</p>
    <p style="margin:0;"><strong>3. Publication</strong><br>Once verified, your story will appear on the ${role} roadmap page with your name, role, and company credited.</p>
  </div>

  <p>In the meantime, here are some ways to stay connected:</p>
  <p>
    <a href="https://thetransmutation.substack.com" style="color:#16a34a;font-weight:600;">Subscribe to The Transmutation</a> for weekly insights on healthcare to tech transitions.
  </p>
  <p>
    <a href="https://youtube.com/@ehoneah" style="color:#16a34a;font-weight:600;">Watch video guides on YouTube</a> featuring real transition stories and tutorials.
  </p>

  <hr style="border:none;border-top:1px solid #e5e5e5;margin:32px 0;">

  <p style="color:#737373;font-size:14px;">
    You received this because you submitted a transition story on Health Tech Roadmaps by Ehoneah.
  </p>
</body>
</html>`;
}

// This route runs on the server (not prerendered)
export const prerender = false;

/**
 * Email Capture API Route
 *
 * Handles subscription requests from roadmap pages.
 * Uses Resend to:
 * 1. Add the contact to Resend Audiences (tagged by roadmap)
 * 2. Send the action kit email for the requested roadmap
 *
 * Environment variables required:
 *   RESEND_API_KEY - Your Resend API key
 *   RESEND_AUDIENCE_ID - Your Resend Audience ID for the roadmap list
 *   FROM_EMAIL - Verified sender email (e.g., hello@ehoneahobed.com)
 */

import type { APIRoute } from 'astro';

// Action kit metadata per roadmap (customize download links as you build kits)
const ACTION_KITS: Record<string, { subject: string; kitName: string }> = {
  'clinical-data-analyst': {
    subject: 'Your Clinical Data Analyst Action Kit is here',
    kitName: 'Clinical Data Analyst Action Kit',
  },
  'health-informatics-analyst': {
    subject: 'Your Health Informatics Analyst Action Kit is here',
    kitName: 'Health Informatics Analyst Action Kit',
  },
  'ehr-implementation-specialist': {
    subject: 'Your EHR Implementation Specialist Action Kit is here',
    kitName: 'EHR Implementation Specialist Action Kit',
  },
  'health-tech-product-manager': {
    subject: 'Your Health Tech Product Manager Action Kit is here',
    kitName: 'Health Tech Product Manager Action Kit',
  },
  'healthcare-ai-ml-engineer': {
    subject: 'Your Healthcare AI/ML Engineer Action Kit is here',
    kitName: 'Healthcare AI/ML Engineer Action Kit',
  },
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    const { email, roadmapSlug, source } = data;

    // Validate input
    if (!email || !email.includes('@')) {
      return new Response(
        JSON.stringify({ error: 'Valid email address required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!roadmapSlug || !ACTION_KITS[roadmapSlug]) {
      return new Response(
        JSON.stringify({ error: 'Invalid roadmap' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const RESEND_API_KEY = import.meta.env.RESEND_API_KEY;
    const RESEND_AUDIENCE_ID = import.meta.env.RESEND_AUDIENCE_ID;
    const FROM_EMAIL = import.meta.env.FROM_EMAIL || 'obed@tarvra.com';

    if (!RESEND_API_KEY) {
      console.error('RESEND_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Email service not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Step 1: Add contact to Resend Audience with tags
    if (RESEND_AUDIENCE_ID) {
      await fetch(`https://api.resend.com/audiences/${RESEND_AUDIENCE_ID}/contacts`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          first_name: '',
          last_name: '',
          unsubscribed: false,
        }),
      });
    }

    // Step 2: Send the action kit email
    const kit = ACTION_KITS[roadmapSlug];

    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `Ehoneah Health Tech Roadmaps <${FROM_EMAIL}>`,
        to: [email],
        subject: kit.subject,
        html: buildActionKitEmail(roadmapSlug, kit.kitName),
        tags: [
          { name: 'source', value: 'roadmap-platform' },
          { name: 'roadmap', value: roadmapSlug },
          { name: 'cta_position', value: source || 'unknown' },
        ],
      }),
    });

    return new Response(
      JSON.stringify({ success: true, message: 'Action kit sent! Check your inbox.' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Subscribe error:', error);
    return new Response(
      JSON.stringify({ error: 'Something went wrong. Please try again.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

function buildActionKitEmail(slug: string, kitName: string): string {
  const siteUrl = 'https://roadmaps.tarvra.com';
  const roadmapUrl = `${siteUrl}/r/${slug}`;
  const downloadUrl = `${siteUrl}/action-kits/${slug}-action-kit.pdf`;
  const quizUrl = 'https://quiz.ehoneahobed.com';
  const newsletterUrl = 'https://thetransmutation.substack.com';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #171717; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="border-bottom: 3px solid #16a34a; padding-bottom: 16px; margin-bottom: 24px;">
    <h1 style="font-size: 24px; margin: 0;">Your ${kitName}</h1>
    <p style="color: #525252; margin: 8px 0 0;">From Health Tech Roadmaps by Obed Ehoneah</p>
  </div>

  <div style="text-align: center; margin: 24px 0;">
    <a href="${downloadUrl}" style="display: inline-block; background: #16a34a; color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">Download Your Action Kit (PDF)</a>
  </div>

  <p>Your action kit includes 13-15 pages of practical tools:</p>

  <div style="background: #f0fdf4; border-left: 4px solid #16a34a; padding: 16px; margin: 24px 0; border-radius: 0 8px 8px 0;">
    <ul style="margin: 0; padding-left: 20px;">
      <li><strong>90-Day Execution Plan</strong> with weekly milestones and checkboxes</li>
      <li><strong>Portfolio Project Templates</strong> with starter prompts for each project</li>
      <li><strong>Resume Bullet Formulas</strong> that translate your clinical experience</li>
      <li><strong>Interview Prep Questions</strong> (technical, behavioral, and scenario-based)</li>
      <li><strong>Resource Checklist</strong> with direct links organized by phase</li>
    </ul>
  </div>

  <p>Your full roadmap is always available at:<br>
  <a href="${roadmapUrl}" style="color: #16a34a; font-weight: 600;">${roadmapUrl}</a></p>

  <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 32px 0;">

  <h2 style="font-size: 18px;">What to do next</h2>

  <p><strong>1. Take the Career Quiz</strong><br>
  Not sure which role fits you best? <a href="${quizUrl}" style="color: #16a34a;">Take the 3-minute quiz</a> to get a personalized recommendation.</p>

  <p><strong>2. Read The Transmutation</strong><br>
  Weekly newsletter for healthcare professionals who know they were built for more. <a href="${newsletterUrl}" style="color: #16a34a;">Subscribe on Substack</a>.</p>

  <p><strong>3. Start with Move 1</strong><br>
  Go back to the "First Three Moves" section of your roadmap and complete Move 1 today. It takes less than 3 hours.</p>

  <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 32px 0;">

  <p style="color: #737373; font-size: 14px;">
    You received this because you requested the ${kitName} from Health Tech Roadmaps by Ehoneah.
    <br>Built by a pharmacist who made the switch.
  </p>
</body>
</html>`;
}

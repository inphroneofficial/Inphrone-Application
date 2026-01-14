import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface FeedbackRequest {
  type: 'contact' | 'feedback';
  name: string;
  email: string;
  subject?: string;
  message?: string;
}

// SECURITY: Escape HTML to prevent XSS in email clients
function escapeHtml(unsafe: string): string {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const data: FeedbackRequest = await req.json()

    // SECURITY: Input validation - length limits
    if (data.name && data.name.length > 100) {
      return new Response(
        JSON.stringify({ error: 'Name too long (max 100 characters)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    if (data.email && data.email.length > 255) {
      return new Response(
        JSON.stringify({ error: 'Email too long (max 255 characters)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    if (data.subject && data.subject.length > 200) {
      return new Response(
        JSON.stringify({ error: 'Subject too long (max 200 characters)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    if (data.message && data.message.length > 5000) {
      return new Response(
        JSON.stringify({ error: 'Message too long (max 5000 characters)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let emailSubject = '';
    let emailHtml = '';

    // SECURITY: Escape all user input before including in HTML
    const safeName = escapeHtml(data.name);
    const safeEmail = escapeHtml(data.email);
    const safeSubject = escapeHtml(data.subject || '');
    const safeMessage = escapeHtml(data.message || '').replace(/\n/g, '<br>');

    if (data.type === 'contact') {
      emailSubject = `Contact Form: ${safeSubject}`;
      emailHtml = `
        <h2>New Contact Message</h2>
        <p><strong>Name:</strong> ${safeName}</p>
        <p><strong>Email:</strong> ${safeEmail}</p>
        <p><strong>Subject:</strong> ${safeSubject}</p>
        <p><strong>Message:</strong></p>
        <p>${safeMessage}</p>
      `;
    } else {
      emailSubject = `New Platform Feedback from ${safeName}`;
      emailHtml = `
        <h2>New Platform Feedback</h2>
        <p><strong>Name:</strong> ${safeName}</p>
        <p><strong>Email:</strong> ${safeEmail}</p>
        <p><strong>Feedback:</strong></p>
        <p>${safeMessage}</p>
      `;
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Inphrone <onboarding@resend.dev>',
        to: ['inphrone@gmail.com'],
        subject: emailSubject,
        html: emailHtml,
      }),
    })

    if (!res.ok) {
      const error = await res.text()
      throw new Error(`Failed to send email: ${error}`)
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

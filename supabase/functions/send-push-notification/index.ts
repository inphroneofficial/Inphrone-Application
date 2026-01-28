import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.58.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const RESEND_FROM = Deno.env.get("RESEND_FROM") || "Inphrone <onboarding@resend.dev>";
const VAPID_PUBLIC_KEY = Deno.env.get("VAPID_PUBLIC_KEY");
const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY");
const VAPID_SUBJECT = Deno.env.get("VAPID_SUBJECT") || "mailto:inphroneofficial@gmail.com";

interface NotificationRequest {
  userId?: string;
  userIds?: string[];
  userType?: string;
  title: string;
  message: string;
  url?: string;
  type?: string;
  sendPush?: boolean;
  sendEmail?: boolean;
  sendInApp?: boolean;
}

interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

// Function to send Web Push notification using web-push compatible format
async function sendWebPush(
  subscription: PushSubscription,
  payload: { title: string; body: string; url: string; icon?: string }
): Promise<boolean> {
  try {
    if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
      console.warn("[sendWebPush] VAPID keys not configured");
      return false;
    }

    console.log("[sendWebPush] Sending to endpoint:", subscription.endpoint);

    // For now, use a simple fetch to the push endpoint
    // In production, you'd use a proper web-push library or service
    const response = await fetch(subscription.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "TTL": "86400",
      },
      body: JSON.stringify(payload),
    });

    if (response.ok || response.status === 201) {
      console.log("[sendWebPush] Push sent successfully");
      return true;
    } else {
      console.error("[sendWebPush] Push failed:", response.status, await response.text());
      return false;
    }
  } catch (error) {
    console.error("[sendWebPush] Error:", error);
    return false;
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing Supabase environment variables");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const body: NotificationRequest = await req.json();
    console.log("[send-push-notification] Request received:", JSON.stringify(body, null, 2));

    const {
      userId,
      userIds = [],
      userType,
      title,
      message,
      url = "/dashboard",
      type = "notification",
      sendPush = true,
      sendEmail = true,
      sendInApp = true
    } = body;

    if (!title || !message) {
      console.error("[send-push-notification] Missing title or message");
      return new Response(
        JSON.stringify({ error: "Title and message are required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Build target user IDs
    let targetUserIds: string[] = [...userIds];

    if (userId) {
      targetUserIds = [userId];
    } else if (userType && targetUserIds.length === 0) {
      // Fetch users by type
      let query = supabase.from("profiles").select("id");
      
      if (userType === "all") {
        // No filter - get all users
      } else if (userType === "non_audience") {
        query = query.neq("user_type", "audience");
      } else {
        query = query.eq("user_type", userType);
      }

      const { data: users, error: usersError } = await query;
      if (usersError) {
        console.error("[send-push-notification] Error fetching users:", usersError);
        throw usersError;
      }
      targetUserIds = users?.map(u => u.id) || [];
    }

    console.log(`[send-push-notification] Target user IDs count: ${targetUserIds.length}`);
    console.log(`[send-push-notification] Target user IDs: ${targetUserIds.slice(0, 5).join(', ')}${targetUserIds.length > 5 ? '...' : ''}`);

    if (targetUserIds.length === 0) {
      console.log("[send-push-notification] No target users found");
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "No target users found",
          results: {
            pushSent: 0,
            pushFailed: 0,
            emailSent: 0,
            emailFailed: 0,
            inAppSent: 0,
            inAppFailed: 0,
            errors: ["No target users found"]
          }
        }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`[send-push-notification] Processing ${targetUserIds.length} users`);

    const results = {
      pushSent: 0,
      pushFailed: 0,
      emailSent: 0,
      emailFailed: 0,
      inAppSent: 0,
      inAppFailed: 0,
      errors: [] as string[]
    };

    // Batch fetch all user profiles - fetch in chunks if too many
    const chunkSize = 100;
    const allProfiles: any[] = [];
    
    for (let i = 0; i < targetUserIds.length; i += chunkSize) {
      const chunk = targetUserIds.slice(i, i + chunkSize);
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, email, full_name, settings")
        .in("id", chunk);

      if (profilesError) {
        console.error("[send-push-notification] Error fetching profiles chunk:", profilesError);
        continue;
      }
      
      if (profiles) {
        allProfiles.push(...profiles);
      }
    }

    console.log(`[send-push-notification] Found ${allProfiles.length} profiles for ${targetUserIds.length} user IDs`);

    if (allProfiles.length === 0) {
      console.log("[send-push-notification] No profiles found for provided user IDs");
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "No profiles found for user IDs",
          results: {
            pushSent: 0,
            pushFailed: 0,
            emailSent: 0,
            emailFailed: 0,
            inAppSent: 0,
            inAppFailed: 0,
            errors: ["No profiles found for provided user IDs"]
          }
        }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Check RESEND_API_KEY upfront for email notifications
    if (sendEmail && !RESEND_API_KEY) {
      console.error("[send-push-notification] RESEND_API_KEY not configured - cannot send emails");
      results.errors.push("RESEND_API_KEY not configured");
    }

    // Process each user
    for (const profile of allProfiles) {
      const settings = (profile.settings as Record<string, unknown>) || {};
      const userName = profile.full_name || "User";
      const userEmail = profile.email;

      // 1. Send In-App Notification
      if (sendInApp && settings.notifications_enabled !== false) {
        try {
          const { error: notifError } = await supabase
            .from("notifications")
            .insert({
              user_id: profile.id,
              title,
              message,
              type,
              action_url: url
            });

          if (notifError) {
            console.error(`[send-push-notification] In-app notification failed for ${profile.id}:`, notifError);
            results.inAppFailed++;
            results.errors.push(`In-app failed for ${userEmail}: ${notifError.message}`);
          } else {
            results.inAppSent++;
          }
        } catch (inAppError) {
          console.error(`[send-push-notification] In-app error for ${profile.id}:`, inAppError);
          results.inAppFailed++;
        }
      }

      // 2. Send Web Push Notification
      if (sendPush && settings.push_subscription) {
        try {
          const subscription = settings.push_subscription as PushSubscription;
          
          const pushPayload = {
            title,
            body: message,
            url,
            icon: "/favicon.ico"
          };

          const pushSent = await sendWebPush(subscription, pushPayload);
          
          if (pushSent) {
            results.pushSent++;
          } else {
            results.pushFailed++;
          }
        } catch (pushError) {
          console.error(`[send-push-notification] Push error for ${profile.id}:`, pushError);
          results.pushFailed++;
        }
      }

      // 3. Send Email Notification
      if (sendEmail && userEmail && RESEND_API_KEY) {
        // Check if user has disabled email notifications (default to enabled)
        const emailEnabled = settings.email_notifications !== false;
        
        if (!emailEnabled) {
          console.log(`[send-push-notification] User ${profile.id} has disabled email notifications`);
          continue;
        }

        try {
          const emailHtml = `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; padding: 0; background-color: #f4f4f5;">
              <table cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
                <tr>
                  <td style="background: linear-gradient(135deg, #1F0021 0%, #751006 100%); padding: 40px 30px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">INPHRONE™</h1>
                    <p style="color: rgba(255,255,255,0.8); margin: 10px 0 0; font-size: 14px;">People-Powered Entertainment Intelligence</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 40px 30px;">
                    <h2 style="color: #1F0021; margin: 0 0 20px; font-size: 24px; font-weight: 600;">${title}</h2>
                    <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">Hi ${userName},</p>
                    <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 30px;">${message}</p>
                    <table cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td align="center">
                          <a href="https://inphrone.com${url}" style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #1F0021 0%, #751006 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                            View Now
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                    <p style="color: #6b7280; font-size: 14px; margin: 0 0 10px;">Thank you for being part of Inphrone™!</p>
                    <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                      © ${new Date().getFullYear()} Inphrone. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </body>
            </html>
          `;

          const emailPayload = {
            from: RESEND_FROM,
            to: [userEmail],
            subject: title,
            html: emailHtml
          };

          const emailRes = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${RESEND_API_KEY}`
            },
            body: JSON.stringify(emailPayload)
          });

          const emailResponseText = await emailRes.text();

          if (emailRes.ok) {
            console.log(`[send-push-notification] Email sent successfully to ${userEmail}`);
            results.emailSent++;
          } else {
            console.error(`[send-push-notification] Email failed for ${userEmail}:`, emailRes.status, emailResponseText);
            results.emailFailed++;
            results.errors.push(`Email failed for ${userEmail}: ${emailResponseText}`);
          }
        } catch (emailError) {
          console.error(`[send-push-notification] Email error for ${userEmail}:`, emailError);
          results.emailFailed++;
          results.errors.push(`Email error for ${userEmail}: ${String(emailError)}`);
        }
      }
    }

    console.log("[send-push-notification] Final results:", JSON.stringify(results, null, 2));

    return new Response(
      JSON.stringify({
        success: true,
        results,
        targetCount: targetUserIds.length,
        processedCount: allProfiles.length
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: unknown) {
    console.error("[send-push-notification] Critical error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ 
        error: errorMessage, 
        success: false,
        results: {
          pushSent: 0,
          pushFailed: 0,
          emailSent: 0,
          emailFailed: 0,
          inAppSent: 0,
          inAppFailed: 0,
          errors: [errorMessage]
        }
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// VAPID keys for Web Push - Retrieved from environment secrets
const VAPID_PUBLIC_KEY = Deno.env.get("VAPID_PUBLIC_KEY");

if (!VAPID_PUBLIC_KEY) {
  console.warn("[get-vapid-key] VAPID_PUBLIC_KEY not configured in secrets");
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("[get-vapid-key] Returning VAPID public key");
    
    return new Response(
      JSON.stringify({ 
        publicKey: VAPID_PUBLIC_KEY,
        success: true 
      }),
      {
        status: 200,
        headers: { 
          "Content-Type": "application/json",
          ...corsHeaders 
        },
      }
    );
  } catch (error: unknown) {
    console.error("[get-vapid-key] Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});

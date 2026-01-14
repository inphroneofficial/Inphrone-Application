import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.58.0";
import { corsHeaders } from "../_shared/cors.ts";

type CountsResponse = {
  totalUsers: number;
  countriesCount: number;
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
    const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
      return new Response(JSON.stringify({ error: "Server not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const service = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });

    const [{ count: totalUsers, error: usersErr }, { data: countriesRows, error: countriesErr }] =
      await Promise.all([
        service.from("profiles").select("*", { count: "exact", head: true }),
        service.from("profiles").select("country"),
      ]);

    if (usersErr) throw usersErr;
    if (countriesErr) throw countriesErr;

    const countriesCount = new Set(
      (countriesRows ?? [])
        .map((r: any) => (typeof r?.country === "string" ? r.country.trim() : ""))
        .filter(Boolean)
    ).size;

    const payload: CountsResponse = {
      totalUsers: totalUsers ?? 0,
      countriesCount,
    };

    return new Response(JSON.stringify(payload), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("public-platform-counts error", e);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

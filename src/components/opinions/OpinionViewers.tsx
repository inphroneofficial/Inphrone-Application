import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye } from "lucide-react";

interface OpinionViewersProps {
  opinionId: string;
}

interface ViewerRow {
  id: string;
  viewer_id: string;
  viewed_at: string;
  viewer: {
    full_name: string | null;
    user_type: string | null;
  } | null;
}

interface ViewersRPCResult {
  total: number;
  by_type: Record<string, number>;
  recent: Array<{ full_name: string; user_type: string; viewed_at: string }>;
}

const LABELS: Record<string, string> = {
  audience: "Audience",
  creator: "Creators",
  studio: "Studios",
  production: "Films",
  ott: "OTT",
  tv: "TV",
  music: "Music",
  gaming: "Game Developers",
};

export function OpinionViewers({ opinionId }: OpinionViewersProps) {
  const [viewers, setViewers] = useState<ViewerRow[]>([]);
  const [byType, setByType] = useState<Record<string, number>>({});
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentUserType, setCurrentUserType] = useState<string>("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();

        // Determine if current user owns this opinion and get their user type
        if (user) {
          const { data: opinion } = await supabase
            .from("opinions")
            .select("user_id")
            .eq("id", opinionId)
            .single();
          setIsOwner(!!opinion && opinion.user_id === user.id);

          const { data: profile } = await supabase
            .from("profiles")
            .select("user_type")
            .eq("id", user.id)
            .single();
          if (profile) {
            setCurrentUserType(profile.user_type);
          }
        }

        // Fetch aggregated viewers using secure RPC (bypasses RLS joins)
        const { data: agg, error } = await supabase.rpc('get_opinion_viewers', { _opinion_id: opinionId });
        if (error) throw error;

        const result = (agg as unknown as ViewersRPCResult) || { total: 0, by_type: {}, recent: [] };
        const total = result.total || 0;
        const counts: Record<string, number> = result.by_type || {};
        const recent = result.recent || [];

        // Build lightweight viewer rows for owner view
        const rows: ViewerRow[] = recent.map((r, idx) => ({
          id: `${idx}`,
          viewer_id: '',
          viewed_at: r.viewed_at,
          viewer: { full_name: r.full_name, user_type: r.user_type }
        }));

        setViewers(rows);
        setByType(counts);

        // If there are no views yet, still reflect total=0
        if (!rows.length && total === 0) {
          setViewers([]);
        }
      } catch (e) {
        console.error("OpinionViewers error:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Realtime subscription for new views
    const channel = supabase
      .channel(`opinion_views:${opinionId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "opinion_views", filter: `opinion_id=eq.${opinionId}` },
        () => fetchData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [opinionId]);

  if (loading) return null;
  const total = Object.values(byType || {}).reduce((sum, n) => sum + (n || 0), 0);
  if (total === 0) return null;

  // Only show to audience members who own the opinion
  if (currentUserType !== 'audience' || !isOwner) return null;

  const orderedKeys = ["creator","studio","production","ott","tv","music","gaming"].filter(k => byType[k] > 0);

  return (
    <Card className="p-4 mt-4 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
      <div className="flex items-center gap-2 mb-3">
        <Eye className="w-4 h-4 text-primary" />
        <h3 className="font-semibold text-sm">
          Your opinion was viewed by {total} {total === 1 ? "person" : "people"}
        </h3>
      </div>

      {/* Category summary */}
      <div className="flex flex-wrap gap-2">
        {orderedKeys.map((k) => (
          <Badge key={k} variant="secondary" className="capitalize">
            {LABELS[k]}: {byType[k]}
          </Badge>
        ))}
      </div>
    </Card>
  );
}

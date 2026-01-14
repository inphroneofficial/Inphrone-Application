import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Eye, User, Briefcase, Film, Monitor, Tv, Gamepad2, Music } from "lucide-react";

interface ViewCount {
  total: number;
  by_type: Record<string, number>;
}

interface OpinionViewCountProps {
  opinionId: string;
  showForUserType?: string;
}

const PROFILE_TYPE_LABELS: Record<string, { icon: any; label: string }> = {
  creator: { icon: User, label: "Creator" },
  studio: { icon: Film, label: "Studio" },
  production: { icon: Briefcase, label: "Production" },
  ott: { icon: Monitor, label: "OTT Platform" },
  tv: { icon: Tv, label: "TV Network" },
  gaming: { icon: Gamepad2, label: "Game Developer" },
  music: { icon: Music, label: "Music Industry" },
};

export function OpinionViewCount({ opinionId, showForUserType = "audience" }: OpinionViewCountProps) {
  const [viewData, setViewData] = useState<ViewCount | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchViewData = async () => {
      try {
        const { data } = await supabase.rpc('get_opinion_viewers', {
          _opinion_id: opinionId
        });
        
        if (data && typeof data === 'object' && !Array.isArray(data)) {
          const viewCountData = data as any;
          if (viewCountData.total !== undefined && viewCountData.by_type !== undefined) {
            setViewData(viewCountData as ViewCount);
          }
        }
      } catch (error) {
        console.error("Error fetching view data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchViewData();

    // Real-time subscription for view updates
    const channel = supabase
      .channel(`opinion-views-${opinionId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'opinion_views',
          filter: `opinion_id=eq.${opinionId}`,
        },
        () => {
          fetchViewData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [opinionId]);

  // Only show for audience users
  if (showForUserType !== "audience" || loading || !viewData || viewData.total === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 border border-primary/20">
        <Eye className="w-3 h-3 text-primary" />
        <span className="font-semibold">{viewData.total} views</span>
      </div>
      
      {Object.entries(viewData.by_type || {}).map(([type, count]) => {
        const config = PROFILE_TYPE_LABELS[type];
        if (!config || count === 0) return null;
        
        const Icon = config.icon;
        return (
          <Badge key={type} variant="secondary" className="gap-1 px-2 py-0.5">
            <Icon className="w-3 h-3" />
            <span>{count} {config.label}</span>
          </Badge>
        );
      })}
    </div>
  );
}

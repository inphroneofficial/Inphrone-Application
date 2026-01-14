import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Key, Award, TrendingUp, Zap, Users, Sparkles, Film, Clapperboard, Tv, MonitorPlay, Music, Gamepad2 } from "lucide-react";
import { motion } from "framer-motion";

interface BadgeData {
  id: string;
  badge_type: string;
  badge_name: string;
  badge_description: string;
  earned_at: string;
  metadata: any;
}

const BADGE_ICONS: Record<string, any> = {
  visionary_key: Key,
  harmony_key: Key,
  echo_key: Key,
  origin_light: Zap,
  resonance_echo: TrendingUp,
  trend_prophet: Award,
  audience: Users,
  creator: Sparkles,
  studio: Film,
  production: Clapperboard,
  ott: Tv,
  tv: MonitorPlay,
  music: Music,
  gaming: Gamepad2,
};

const BADGE_COLORS: Record<string, string> = {
  visionary_key: "from-purple-500 to-pink-500",
  harmony_key: "from-blue-500 to-cyan-500",
  echo_key: "from-green-500 to-emerald-500",
  origin_light: "from-yellow-500 to-orange-500",
  resonance_echo: "from-red-500 to-rose-500",
  trend_prophet: "from-indigo-500 to-purple-500",
  audience: "from-blue-500 to-cyan-500",
  creator: "from-purple-500 to-pink-500",
  studio: "from-orange-500 to-red-500",
  production: "from-yellow-500 to-orange-500",
  ott: "from-green-500 to-emerald-500",
  tv: "from-indigo-500 to-blue-500",
  music: "from-pink-500 to-purple-500",
  gaming: "from-cyan-500 to-blue-500",
};

export function WisdomBadges() {
  const [badges, setBadges] = useState<BadgeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState<string | null>(null);

  useEffect(() => {
    fetchBadges();
    
    // Set up realtime subscription for new badges
    const channel = supabase
      .channel('badge-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'user_badges',
        },
        (payload) => {
          if (payload.new && typeof payload.new === 'object') {
            const newData = payload.new as Record<string, any>;
            supabase.auth.getUser().then(({ data: { user } }) => {
              if (user && 'user_id' in newData && newData.user_id === user.id) {
                setBadges((prev) => [newData as BadgeData, ...prev]);
              }
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchBadges = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Check user type first
      const { data: profile } = await supabase
        .from("profiles")
        .select("user_type")
        .eq("id", user.id)
        .single();

      setUserType(profile?.user_type || null);

      // Fetch badges for all user types

      const { data, error } = await supabase
        .from("user_badges")
        .select("*")
        .eq("user_id", user.id)
        .order("earned_at", { ascending: false });

      if (error) {
        console.error("Error fetching badges:", error);
      } else {
        setBadges(data || []);
      }
    } catch (error) {
      console.error("Badge fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Show loading state
  if (loading) return null;

  return (
    <Card className="shadow-elegant">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="w-5 h-5 text-primary" />
          Wisdom Keys
          <Badge variant="secondary" className="ml-auto">
            {badges.length} Earned
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {badges.length === 0 ? (
          <div className="text-center py-8">
            <Award className="w-12 h-12 mx-auto text-muted-foreground mb-3 opacity-30" />
            <p className="text-sm text-muted-foreground">
              Share insights to earn your first Wisdom Key
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {badges.map((badge, index) => {
              const Icon = BADGE_ICONS[badge.badge_type] || Award;
              const colorClass = BADGE_COLORS[badge.badge_type] || "from-gray-500 to-gray-600";

              return (
                <motion.div
                  key={badge.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative p-4 rounded-lg bg-gradient-to-br ${colorClass} text-white overflow-hidden group cursor-pointer hover:scale-105 transition-transform`}
                >
                  {/* Shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  
                  <div className="relative z-10 flex items-start gap-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm mb-1">{badge.badge_name}</h4>
                      <p className="text-xs opacity-90">{badge.badge_description}</p>
                      <p className="text-xs opacity-75 mt-2">
                        Earned {new Date(badge.earned_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
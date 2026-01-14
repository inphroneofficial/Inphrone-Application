import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap, Waves, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

interface AvatarData {
  avatar_name: string;
  wisdom_energy: number;
  harmony_flow: number;
  curiosity_sparks: number;
  avatar_color: string;
  avatar_glow_intensity: number;
  evolution_stage: number;
  total_opinions_contributed: number;
}

export function CreativeSoulAvatar() {
  const [avatar, setAvatar] = useState<AvatarData | null>(null);
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState<string | null>(null);

  useEffect(() => {
    fetchAvatar();
    
    // Set up realtime subscription
    const channel = supabase
      .channel('avatar-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_avatars',
        },
        (payload) => {
          if (payload.new && typeof payload.new === 'object' && 'user_id' in payload.new) {
            const newData = payload.new as Record<string, any>;
            supabase.auth.getUser().then(({ data: { user } }) => {
              if (user && newData.user_id === user.id) {
                setAvatar(newData as AvatarData);
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

  const fetchAvatar = async () => {
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

      // Only fetch avatar for audience users
      if (profile?.user_type !== 'audience') {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("user_avatars")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error("Error fetching avatar:", error);
      }
      
      // Set avatar data or default values if no data exists
      if (data) {
        setAvatar(data);
      } else {
        // Initialize with default values for audience users without avatar data
        setAvatar({
          avatar_name: 'Insight Soul',
          wisdom_energy: 0,
          harmony_flow: 0,
          curiosity_sparks: 0,
          avatar_color: '#6366f1',
          avatar_glow_intensity: 50,
          evolution_stage: 1,
          total_opinions_contributed: 0
        });
      }
    } catch (error) {
      console.error("Avatar fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Don't show for non-audience users
  if (userType !== 'audience' && !loading) return null;
  
  // Show loading skeleton
  if (loading) {
    return (
      <Card className="shadow-elegant overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-muted-foreground" />
            Creative Soul
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center gap-4">
            <Skeleton className="w-32 h-32 rounded-full" />
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Skeleton className="h-20 rounded-lg" />
            <Skeleton className="h-20 rounded-lg" />
            <Skeleton className="h-20 rounded-lg" />
          </div>
          <Skeleton className="h-3 w-full rounded-full" />
        </CardContent>
      </Card>
    );
  }
  
  // Show with default values if no avatar data
  const displayAvatar = avatar || {
    avatar_name: 'Insight Soul',
    wisdom_energy: 0,
    harmony_flow: 0,
    curiosity_sparks: 0,
    avatar_color: '#6366f1',
    avatar_glow_intensity: 50,
    evolution_stage: 1,
    total_opinions_contributed: 0
  };

  const energyLevel = (displayAvatar.wisdom_energy + displayAvatar.harmony_flow + displayAvatar.curiosity_sparks) / 3;
  const glowColor = displayAvatar.avatar_color;

  return (
    <Card className="shadow-elegant overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.7, 1, 0.7],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <Sparkles className="w-5 h-5 text-primary" />
          </motion.div>
          Creative Soul
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Living Avatar Visual */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <motion.div
              className="w-32 h-32 rounded-full"
              style={{
                background: `radial-gradient(circle, ${glowColor}88 0%, ${glowColor}44 50%, transparent 100%)`,
                boxShadow: `0 0 ${displayAvatar.avatar_glow_intensity}px ${glowColor}`,
              }}
              animate={{
                scale: [1, 1.05, 1],
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <div
                className="w-full h-full rounded-full flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${glowColor} 0%, ${glowColor}CC 100%)`,
                }}
              >
                <span className="text-5xl">✨</span>
              </div>
            </motion.div>
            <Badge className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-primary text-white">
              Stage {displayAvatar.evolution_stage}
            </Badge>
          </div>
          
          <div className="text-center">
            <h3 className="text-xl font-bold mb-1">{displayAvatar.avatar_name}</h3>
            <p className="text-sm text-muted-foreground">
              {displayAvatar.total_opinions_contributed} Insights Shared
            </p>
          </div>
        </div>

        {/* Energy Metrics */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 p-3 rounded-lg text-center">
            <Zap className="w-5 h-5 mx-auto mb-2 text-yellow-600 dark:text-yellow-400" />
            <p className="text-2xl font-bold">{displayAvatar.wisdom_energy}</p>
            <p className="text-xs text-muted-foreground">Wisdom</p>
          </div>
          <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 p-3 rounded-lg text-center">
            <Waves className="w-5 h-5 mx-auto mb-2 text-blue-600 dark:text-blue-400" />
            <p className="text-2xl font-bold">{displayAvatar.harmony_flow}</p>
            <p className="text-xs text-muted-foreground">Harmony</p>
          </div>
          <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 p-3 rounded-lg text-center">
            <Sparkles className="w-5 h-5 mx-auto mb-2 text-purple-600 dark:text-purple-400" />
            <p className="text-2xl font-bold">{displayAvatar.curiosity_sparks}</p>
            <p className="text-xs text-muted-foreground">Curiosity</p>
          </div>
        </div>

        {/* Energy Level Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Overall Energy</span>
            <span className="font-semibold">{Math.round(energyLevel)}</span>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{
                background: `linear-gradient(90deg, ${glowColor}, ${glowColor}CC)`,
                width: `${Math.min(energyLevel, 100)}%`,
              }}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(energyLevel, 100)}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
        </div>

        <p className="text-xs text-center text-muted-foreground">
          Your creative aura grows with every insight you share
        </p>
      </CardContent>
    </Card>
  );
}
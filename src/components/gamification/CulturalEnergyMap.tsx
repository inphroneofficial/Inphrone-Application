import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Globe, TrendingUp, MapPin } from "lucide-react";
import { motion } from "framer-motion";

interface EnergySpot {
  city: string;
  country: string;
  category_id: string;
  energy_level: number;
  total_opinions: number;
  category_name?: string;
}

export function CulturalEnergyMap() {
  const [hotspots, setHotspots] = useState<EnergySpot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHotspots();
    
    // Set up realtime subscription for energy updates
    const channel = supabase
      .channel('energy-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'cultural_energy_map',
        },
        () => {
          // Refetch when energy map changes
          fetchHotspots();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchHotspots = async () => {
    try {
      const { data, error } = await supabase
        .from("cultural_energy_map")
        .select(`
          id,
          city,
          country,
          energy_level,
          total_opinions,
          last_activity_at,
          category_id,
          categories (
            name
          )
        `)
        .order("energy_level", { ascending: false })
        .limit(10);

      if (error) {
        console.error("Error fetching hotspots:", error);
      } else {
        const formatted = (data || []).map((spot: any) => ({
          ...spot,
          category_name: spot.categories?.name || "Unknown",
        }));
        setHotspots(formatted);
      }
    } catch (error) {
      console.error("Hotspot fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return null;

  const maxEnergy = Math.max(...hotspots.map((h) => h.energy_level), 1);

  return (
    <Card className="shadow-elegant">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-primary" />
          Global Insight Pulse
          <Badge variant="secondary" className="ml-auto">Live</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {hotspots.length === 0 ? (
          <div className="text-center py-8">
            <Globe className="w-12 h-12 mx-auto text-muted-foreground mb-3 opacity-30" />
            <p className="text-sm text-muted-foreground">
              Waiting for opinions to light up the global map...
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Be among the first to share your insights!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {hotspots.map((spot, index) => {
              const intensity = (spot.energy_level / maxEnergy) * 100;
              const glowColor = intensity > 70 ? "text-red-500" : intensity > 40 ? "text-orange-500" : "text-yellow-500";

              return (
                <motion.div
                  key={`${spot.city}-${spot.country}-${spot.category_id}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors group"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <motion.div
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.7, 1, 0.7],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: index * 0.2,
                      }}
                    >
                      <MapPin className={`w-5 h-5 ${glowColor}`} />
                    </motion.div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {spot.city}, {spot.country}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {spot.category_name} • {spot.total_opinions} insights
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-muted-foreground/20 rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full ${glowColor} bg-current rounded-full`}
                        initial={{ width: 0 }}
                        animate={{ width: `${intensity}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                      />
                    </div>
                    <span className="text-xs font-semibold min-w-[2rem] text-right">
                      {spot.energy_level}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        <div className="mt-6 p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg border border-primary/20">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-5 h-5 text-primary flex-shrink-0" />
            <p className="text-sm">
              <span className="font-semibold">Real-time insights</span> from creators and audiences worldwide
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
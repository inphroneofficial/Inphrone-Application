import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Film, Music, Tv, Gamepad2, Youtube, Share2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface DNASegment {
  category: string;
  percentage: number;
  color: string;
  icon: React.ReactNode;
  opinions: number;
}

interface EntertainmentDNAProps {
  userId: string;
  size?: "sm" | "md" | "lg";
  showDetails?: boolean;
  className?: string;
}

const categoryConfig: Record<string, { color: string; icon: React.ReactNode; gradient: string }> = {
  film: { 
    color: "hsl(345, 75%, 50%)", 
    icon: <Film className="w-4 h-4" />,
    gradient: "from-rose-500 to-pink-600"
  },
  music: { 
    color: "hsl(280, 75%, 55%)", 
    icon: <Music className="w-4 h-4" />,
    gradient: "from-purple-500 to-violet-600"
  },
  "ott/tv": { 
    color: "hsl(200, 85%, 50%)", 
    icon: <Tv className="w-4 h-4" />,
    gradient: "from-blue-500 to-cyan-500"
  },
  tv: { 
    color: "hsl(200, 85%, 50%)", 
    icon: <Tv className="w-4 h-4" />,
    gradient: "from-blue-500 to-cyan-500"
  },
  gaming: { 
    color: "hsl(145, 75%, 45%)", 
    icon: <Gamepad2 className="w-4 h-4" />,
    gradient: "from-emerald-500 to-green-600"
  },
  youtube: { 
    color: "hsl(0, 85%, 55%)", 
    icon: <Youtube className="w-4 h-4" />,
    gradient: "from-red-500 to-orange-500"
  },
  social: { 
    color: "hsl(210, 90%, 55%)", 
    icon: <Share2 className="w-4 h-4" />,
    gradient: "from-blue-500 to-indigo-600"
  },
};

export function EntertainmentDNA({ userId, size = "md", showDetails = true, className }: EntertainmentDNAProps) {
  const [dnaData, setDnaData] = useState<DNASegment[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredSegment, setHoveredSegment] = useState<string | null>(null);

  const sizeConfig = {
    sm: { orbSize: 120, strokeWidth: 8, fontSize: "text-xs" },
    md: { orbSize: 180, strokeWidth: 12, fontSize: "text-sm" },
    lg: { orbSize: 240, strokeWidth: 16, fontSize: "text-base" },
  };

  const { orbSize, strokeWidth } = sizeConfig[size];
  const radius = (orbSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    const fetchDNAData = async () => {
      try {
        // Fetch user's opinions grouped by category
        const { data: opinions, error } = await supabase
          .from("opinions")
          .select(`
            id,
            category_id,
            categories!inner(name)
          `)
          .eq("user_id", userId);

        if (error) throw error;

        // Group and count by category
        const categoryCount: Record<string, number> = {};
        let total = 0;

        opinions?.forEach((op: any) => {
          const catName = op.categories?.name?.toLowerCase() || "unknown";
          categoryCount[catName] = (categoryCount[catName] || 0) + 1;
          total++;
        });

        // Convert to DNA segments
        const segments: DNASegment[] = Object.entries(categoryCount)
          .map(([category, count]) => {
            const config = categoryConfig[category] || categoryConfig.film;
            return {
              category,
              percentage: total > 0 ? (count / total) * 100 : 0,
              color: config.color,
              icon: config.icon,
              opinions: count,
            };
          })
          .sort((a, b) => b.percentage - a.percentage);

        setDnaData(segments);
      } catch (err) {
        console.error("Error fetching DNA data:", err);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchDNAData();
    }
  }, [userId]);

  if (loading) {
    return (
      <div className={cn("flex items-center justify-center", className)}>
        <div 
          className="rounded-full animate-pulse bg-gradient-to-r from-primary/20 to-accent/20"
          style={{ width: orbSize, height: orbSize }}
        />
      </div>
    );
  }

  if (dnaData.length === 0) {
    return (
      <div className={cn("flex flex-col items-center justify-center gap-4", className)}>
        <div 
          className="rounded-full bg-muted/50 flex items-center justify-center border-2 border-dashed border-muted-foreground/20"
          style={{ width: orbSize, height: orbSize }}
        >
          <div className="text-center p-4">
            <Sparkles className="w-8 h-8 mx-auto text-muted-foreground/50 mb-2" />
            <p className="text-xs text-muted-foreground">Share opinions to build your DNA</p>
          </div>
        </div>
      </div>
    );
  }

  let cumulativePercentage = 0;

  return (
    <div className={cn("flex flex-col items-center gap-6", className)}>
      {/* DNA Orb */}
      <div className="relative" style={{ width: orbSize, height: orbSize }}>
        {/* Glow effect */}
        <div 
          className="absolute inset-0 rounded-full blur-xl opacity-50"
          style={{
            background: `conic-gradient(${dnaData.map((seg, i) => {
              const start = i === 0 ? 0 : dnaData.slice(0, i).reduce((acc, s) => acc + s.percentage, 0);
              return `${seg.color} ${start}% ${start + seg.percentage}%`;
            }).join(", ")})`,
          }}
        />

        {/* SVG Ring */}
        <svg
          width={orbSize}
          height={orbSize}
          className="transform -rotate-90 relative z-10"
        >
          {/* Background ring */}
          <circle
            cx={orbSize / 2}
            cy={orbSize / 2}
            r={radius}
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth={strokeWidth}
            opacity={0.3}
          />

          {/* DNA Segments */}
          {dnaData.map((segment, index) => {
            const segmentLength = (segment.percentage / 100) * circumference;
            const offset = (cumulativePercentage / 100) * circumference;
            cumulativePercentage += segment.percentage;

            return (
              <motion.circle
                key={segment.category}
                cx={orbSize / 2}
                cy={orbSize / 2}
                r={radius}
                fill="none"
                stroke={segment.color}
                strokeWidth={hoveredSegment === segment.category ? strokeWidth + 4 : strokeWidth}
                strokeDasharray={`${segmentLength} ${circumference - segmentLength}`}
                strokeDashoffset={-offset}
                strokeLinecap="round"
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: -offset }}
                transition={{ duration: 1, delay: index * 0.1, ease: "easeOut" }}
                onMouseEnter={() => setHoveredSegment(segment.category)}
                onMouseLeave={() => setHoveredSegment(null)}
                className="cursor-pointer transition-all duration-200"
                style={{
                  filter: hoveredSegment === segment.category ? `drop-shadow(0 0 8px ${segment.color})` : undefined,
                }}
              />
            );
          })}
        </svg>

        {/* Center Content */}
        <div className="absolute inset-0 flex items-center justify-center">
          <AnimatePresence mode="wait">
            {hoveredSegment ? (
              <motion.div
                key={hoveredSegment}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="text-center"
              >
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-1"
                  style={{ 
                    backgroundColor: dnaData.find(d => d.category === hoveredSegment)?.color + "20",
                    color: dnaData.find(d => d.category === hoveredSegment)?.color 
                  }}
                >
                  {categoryConfig[hoveredSegment]?.icon}
                </div>
                <p className="text-lg font-bold">{dnaData.find(d => d.category === hoveredSegment)?.percentage.toFixed(0)}%</p>
                <p className="text-xs text-muted-foreground capitalize">{hoveredSegment}</p>
              </motion.div>
            ) : (
              <motion.div
                key="default"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="text-center"
              >
                <Sparkles className="w-6 h-6 mx-auto mb-1 text-primary" />
                <p className="text-xs font-medium text-muted-foreground">Your DNA</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Legend */}
      {showDetails && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full max-w-md">
          {dnaData.slice(0, 6).map((segment, index) => (
            <motion.div
              key={segment.category}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className={cn(
                "flex items-center gap-2 p-2 rounded-xl transition-all cursor-pointer",
                "hover:bg-muted/50",
                hoveredSegment === segment.category && "bg-muted/70 ring-1 ring-primary/20"
              )}
              onMouseEnter={() => setHoveredSegment(segment.category)}
              onMouseLeave={() => setHoveredSegment(null)}
            >
              <div 
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: segment.color }}
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium capitalize truncate">{segment.category}</p>
                <p className="text-xs text-muted-foreground">{segment.percentage.toFixed(0)}%</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
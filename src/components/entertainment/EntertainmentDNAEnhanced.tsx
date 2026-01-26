import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Film, Music, Tv, Gamepad2, Youtube, Share2, Sparkles, 
  Dna, Download, Copy, Check, Fingerprint, Zap
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface DNASegment {
  category: string;
  percentage: number;
  color: string;
  icon: React.ReactNode;
  opinions: number;
  trait: string;
}

interface EntertainmentDNAEnhancedProps {
  userId: string;
  showDetails?: boolean;
  showShareButton?: boolean;
  className?: string;
}

const categoryConfig: Record<string, { 
  color: string; 
  hue: number;
  icon: React.ReactNode; 
  trait: string;
  gradient: string;
}> = {
  film: { 
    color: "hsl(345, 75%, 50%)", 
    hue: 345,
    icon: <Film className="w-4 h-4" />,
    trait: "Cinephile",
    gradient: "from-rose-500 to-pink-600"
  },
  music: { 
    color: "hsl(280, 75%, 55%)", 
    hue: 280,
    icon: <Music className="w-4 h-4" />,
    trait: "Melodist",
    gradient: "from-purple-500 to-violet-600"
  },
  "ott/tv": { 
    color: "hsl(200, 85%, 50%)", 
    hue: 200,
    icon: <Tv className="w-4 h-4" />,
    trait: "Binge Expert",
    gradient: "from-blue-500 to-cyan-500"
  },
  ott: { 
    color: "hsl(200, 85%, 50%)", 
    hue: 200,
    icon: <Tv className="w-4 h-4" />,
    trait: "Streamer",
    gradient: "from-blue-500 to-cyan-500"
  },
  tv: { 
    color: "hsl(210, 85%, 55%)", 
    hue: 210,
    icon: <Tv className="w-4 h-4" />,
    trait: "TV Enthusiast",
    gradient: "from-indigo-500 to-blue-600"
  },
  gaming: { 
    color: "hsl(145, 75%, 45%)", 
    hue: 145,
    icon: <Gamepad2 className="w-4 h-4" />,
    trait: "Gamer",
    gradient: "from-emerald-500 to-green-600"
  },
  youtube: { 
    color: "hsl(0, 85%, 55%)", 
    hue: 0,
    icon: <Youtube className="w-4 h-4" />,
    trait: "Digital Native",
    gradient: "from-red-500 to-orange-500"
  },
  social: { 
    color: "hsl(210, 90%, 55%)", 
    hue: 210,
    icon: <Share2 className="w-4 h-4" />,
    trait: "Trendsetter",
    gradient: "from-blue-500 to-indigo-600"
  },
  "social media": { 
    color: "hsl(330, 80%, 55%)", 
    hue: 330,
    icon: <Share2 className="w-4 h-4" />,
    trait: "Social Maven",
    gradient: "from-pink-500 to-rose-600"
  },
  "app development": { 
    color: "hsl(250, 70%, 55%)", 
    hue: 250,
    icon: <Sparkles className="w-4 h-4" />,
    trait: "Tech Visionary",
    gradient: "from-violet-500 to-purple-600"
  },
};

// DNA Helix animation
const DNAHelix = ({ segments, size = 200 }: { segments: DNASegment[]; size?: number }) => {
  const helixPoints = useMemo(() => {
    const points: { x: number; y: number; color: string; delay: number }[] = [];
    const numPoints = 20;
    
    for (let i = 0; i < numPoints; i++) {
      const t = (i / numPoints) * Math.PI * 2;
      const segmentIndex = Math.floor((i / numPoints) * segments.length) % segments.length;
      const color = segments[segmentIndex]?.color || "hsl(var(--primary))";
      
      // Left strand
      points.push({
        x: 30 + Math.sin(t) * 20,
        y: (i / numPoints) * 100,
        color,
        delay: i * 0.05,
      });
      
      // Right strand
      points.push({
        x: 70 - Math.sin(t) * 20,
        y: (i / numPoints) * 100,
        color,
        delay: i * 0.05 + 0.5,
      });
    }
    
    return points;
  }, [segments]);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg 
        viewBox="0 0 100 100" 
        className="w-full h-full"
        style={{ filter: "drop-shadow(0 0 10px hsl(var(--primary) / 0.3))" }}
      >
        {/* Connection bars */}
        {Array.from({ length: 10 }).map((_, i) => {
          const y = (i + 0.5) * 10;
          const t = ((i + 0.5) / 10) * Math.PI * 2;
          const x1 = 30 + Math.sin(t) * 20;
          const x2 = 70 - Math.sin(t) * 20;
          const segmentIndex = Math.floor((i / 10) * segments.length) % segments.length;
          const color = segments[segmentIndex]?.color || "hsl(var(--primary))";
          
          return (
            <motion.line
              key={`bar-${i}`}
              x1={x1}
              y1={y}
              x2={x2}
              y2={y}
              stroke={color}
              strokeWidth="2"
              strokeOpacity="0.4"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
            />
          );
        })}
        
        {/* DNA points */}
        {helixPoints.map((point, i) => (
          <motion.circle
            key={i}
            cx={point.x}
            cy={point.y}
            r="3"
            fill={point.color}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              opacity: [0.6, 1, 0.6],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{
              delay: point.delay,
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </svg>
      
      {/* Center icon */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-xl"
          animate={{ 
            rotate: [0, 5, -5, 0],
            scale: [1, 1.05, 1],
          }}
          transition={{ duration: 4, repeat: Infinity }}
        >
          <Dna className="w-7 h-7 text-primary-foreground" />
        </motion.div>
      </div>
    </div>
  );
};

// Personality trait card
const TraitCard = ({ 
  trait, 
  percentage, 
  color, 
  icon, 
  delay 
}: { 
  trait: string; 
  percentage: number; 
  color: string; 
  icon: React.ReactNode;
  delay: number;
}) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay }}
    className="flex items-center gap-3 p-3 rounded-xl bg-card/50 backdrop-blur-sm border border-border/30 hover:border-primary/30 transition-all group"
  >
    <div 
      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
      style={{ backgroundColor: `${color}20`, color }}
    >
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-bold truncate">{trait}</p>
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 bg-muted/50 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: color }}
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ delay: delay + 0.3, duration: 0.8 }}
          />
        </div>
        <span className="text-xs font-bold text-muted-foreground w-10">{percentage.toFixed(0)}%</span>
      </div>
    </div>
  </motion.div>
);

export function EntertainmentDNAEnhanced({ 
  userId, 
  showDetails = true, 
  showShareButton = true,
  className 
}: EntertainmentDNAEnhancedProps) {
  const [dnaData, setDnaData] = useState<DNASegment[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [dominantTrait, setDominantTrait] = useState<string>("");

  useEffect(() => {
    const fetchDNAData = async () => {
      try {
        const { data: opinions, error } = await supabase
          .from("opinions")
          .select(`id, category_id, categories!inner(name)`)
          .eq("user_id", userId);

        if (error) throw error;

        const categoryCount: Record<string, number> = {};
        let total = 0;

        opinions?.forEach((op: any) => {
          const catName = op.categories?.name?.toLowerCase() || "unknown";
          categoryCount[catName] = (categoryCount[catName] || 0) + 1;
          total++;
        });

        const segments: DNASegment[] = Object.entries(categoryCount)
          .map(([category, count]) => {
            const config = categoryConfig[category] || categoryConfig.film;
            return {
              category,
              percentage: total > 0 ? (count / total) * 100 : 0,
              color: config.color,
              icon: config.icon,
              opinions: count,
              trait: config.trait,
            };
          })
          .sort((a, b) => b.percentage - a.percentage);

        setDnaData(segments);
        if (segments.length > 0) {
          setDominantTrait(segments[0].trait);
        }
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

  const handleShare = async () => {
    const shareText = `🧬 My Entertainment DNA on Inphrone:\n${dnaData.slice(0, 3).map(d => `• ${d.trait}: ${d.percentage.toFixed(0)}%`).join('\n')}\n\nDiscover your entertainment personality: inphrone.com`;
    
    if (navigator.share) {
      try {
        await navigator.share({ title: "My Entertainment DNA", text: shareText });
      } catch (err) {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      toast.success("DNA profile copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className={cn("flex flex-col items-center justify-center gap-6", className)}>
        <motion.div
          className="w-48 h-48 rounded-full bg-gradient-to-br from-primary/20 to-accent/20"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />
        <p className="text-sm text-muted-foreground animate-pulse">Analyzing your DNA...</p>
      </div>
    );
  }

  if (dnaData.length === 0) {
    return (
      <div className={cn("flex flex-col items-center justify-center gap-6 p-8", className)}>
        <div className="w-32 h-32 rounded-3xl bg-muted/30 flex items-center justify-center border-2 border-dashed border-muted-foreground/20">
          <Fingerprint className="w-12 h-12 text-muted-foreground/40" />
        </div>
        <div className="text-center">
          <h3 className="text-lg font-bold mb-2">Build Your DNA</h3>
          <p className="text-sm text-muted-foreground max-w-xs">
            Share opinions across categories to unlock your unique entertainment personality profile.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col items-center gap-6", className)}>
      {/* Header */}
      <div className="text-center">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4"
        >
          <Zap className="w-4 h-4 text-primary" />
          <span className="text-sm font-bold text-primary">{dominantTrait}</span>
        </motion.div>
        <h3 className="text-xl font-bold">Your Entertainment DNA</h3>
      </div>

      {/* DNA Helix Visualization */}
      <DNAHelix segments={dnaData} size={200} />

      {/* Traits Grid */}
      {showDetails && (
        <div className="w-full max-w-md space-y-2">
          {dnaData.slice(0, 5).map((segment, i) => (
            <TraitCard
              key={segment.category}
              trait={segment.trait}
              percentage={segment.percentage}
              color={segment.color}
              icon={segment.icon}
              delay={0.3 + i * 0.1}
            />
          ))}
        </div>
      )}

      {/* Share Button */}
      {showShareButton && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
            className="gap-2"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                Copied!
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4" />
                Share DNA
              </>
            )}
          </Button>
        </motion.div>
      )}
    </div>
  );
}

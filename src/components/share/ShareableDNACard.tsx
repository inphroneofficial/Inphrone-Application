import { useState, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Share2, Download, Copy, Twitter, Instagram, Loader2, Sparkles, Dna } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import html2canvas from "html2canvas";

interface ShareableDNACardProps {
  userId: string;
  userName?: string;
  className?: string;
}

interface DNAData {
  category: string;
  percentage: number;
  color: string;
  icon: string;
}

const categoryConfig: Record<string, { color: string; icon: string; trait: string }> = {
  "Film": { color: "#F59E0B", icon: "🎬", trait: "Cinephile" },
  "OTT/Web Series": { color: "#EF4444", icon: "📺", trait: "Binge Master" },
  "Music": { color: "#8B5CF6", icon: "🎵", trait: "Melodist" },
  "YouTube": { color: "#EC4899", icon: "▶️", trait: "Trendsetter" },
  "TV Shows": { color: "#10B981", icon: "📡", trait: "Prime Timer" },
  "Gaming": { color: "#6366F1", icon: "🎮", trait: "Gamer" },
  "Apps": { color: "#06B6D4", icon: "📱", trait: "App Explorer" },
  "Social Media": { color: "#F97316", icon: "💬", trait: "Influencer" },
};

export function ShareableDNACard({ userId, userName = "User", className }: ShareableDNACardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dnaData, setDnaData] = useState<DNAData[]>([]);
  const [dominantTrait, setDominantTrait] = useState("");
  const [generating, setGenerating] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && userId) {
      fetchDNAData();
    }
  }, [isOpen, userId]);

  const fetchDNAData = async () => {
    setLoading(true);
    try {
      const { data: opinions, error } = await supabase
        .from("opinions")
        .select("content_type")
        .eq("user_id", userId);

      if (error) throw error;

      const categoryCounts: Record<string, number> = {};
      opinions?.forEach((opinion) => {
        const type = opinion.content_type || "Other";
        categoryCounts[type] = (categoryCounts[type] || 0) + 1;
      });

      const total = Object.values(categoryCounts).reduce((a, b) => a + b, 0);
      const segments: DNAData[] = Object.entries(categoryCounts)
        .map(([category, count]) => ({
          category,
          percentage: Math.round((count / total) * 100),
          color: categoryConfig[category]?.color || "#64748B",
          icon: categoryConfig[category]?.icon || "📊",
        }))
        .sort((a, b) => b.percentage - a.percentage)
        .slice(0, 5);

      setDnaData(segments);
      if (segments.length > 0) {
        setDominantTrait(categoryConfig[segments[0].category]?.trait || "Explorer");
      }
    } catch (error) {
      console.error("Error fetching DNA data:", error);
    } finally {
      setLoading(false);
    }
  };

  const downloadCard = async () => {
    if (!cardRef.current) return;
    setGenerating(true);

    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
      });

      const link = document.createElement("a");
      link.download = `${userName.replace(/\s+/g, "_")}_Entertainment_DNA.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      toast.success("DNA Card downloaded!");
    } catch (error) {
      console.error("Error generating image:", error);
      toast.error("Failed to generate image");
    } finally {
      setGenerating(false);
    }
  };

  const copyShareText = () => {
    const text = `🧬 My Entertainment DNA on @Inphrone:\n\n${dnaData.map((d) => `${d.icon} ${d.category}: ${d.percentage}%`).join("\n")}\n\nI'm a ${dominantTrait}! Discover yours at inphrone.com 🎬`;
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const shareToTwitter = () => {
    const text = encodeURIComponent(
      `🧬 My Entertainment DNA: I'm a ${dominantTrait}!\n\n${dnaData.slice(0, 3).map((d) => `${d.icon} ${d.category}: ${d.percentage}%`).join("\n")}\n\nDiscover your entertainment personality @Inphrone`
    );
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent("https://inphrone.com")}`, "_blank");
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className={`gap-2 ${className}`}>
          <Dna className="w-4 h-4" />
          Share Your DNA
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md p-0 overflow-hidden bg-background/95 backdrop-blur-xl border-primary/20">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="w-5 h-5 text-primary" />
            Your Entertainment DNA
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : dnaData.length === 0 ? (
            <div className="text-center py-8">
              <Dna className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Share more opinions to unlock your DNA!</p>
            </div>
          ) : (
            <AnimatePresence>
              {/* DNA Card Preview */}
              <motion.div
                ref={cardRef}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative overflow-hidden rounded-2xl p-6"
                style={{
                  background: "linear-gradient(135deg, hsl(var(--primary)/0.15) 0%, hsl(var(--accent)/0.15) 100%)",
                }}
              >
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                  <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <defs>
                      <pattern id="dna-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                        <circle cx="10" cy="10" r="1" fill="currentColor" />
                      </pattern>
                    </defs>
                    <rect fill="url(#dna-pattern)" width="100" height="100" />
                  </svg>
                </div>

                <div className="relative z-10 space-y-4">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-foreground">{userName}</h3>
                      <p className="text-sm text-muted-foreground">Entertainment DNA</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-black bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                        {dominantTrait}
                      </p>
                      <p className="text-xs text-muted-foreground">Personality Type</p>
                    </div>
                  </div>

                  {/* DNA Bars */}
                  <div className="space-y-3 py-4">
                    {dnaData.map((item, index) => (
                      <motion.div
                        key={item.category}
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className="space-y-1"
                      >
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-2">
                            <span>{item.icon}</span>
                            <span className="font-medium">{item.category}</span>
                          </span>
                          <span className="font-bold" style={{ color: item.color }}>
                            {item.percentage}%
                          </span>
                        </div>
                        <div className="h-2 bg-muted/50 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${item.percentage}%` }}
                            transition={{ duration: 0.8, delay: 0.3 + index * 0.1 }}
                            className="h-full rounded-full"
                            style={{ backgroundColor: item.color }}
                          />
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-2 border-t border-border/50">
                    <span className="text-xs text-muted-foreground">inphrone.com</span>
                    <span className="text-xs font-mono text-muted-foreground">
                      {new Date().toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Share Actions */}
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={downloadCard}
                  disabled={generating}
                  variant="outline"
                  className="gap-2"
                >
                  {generating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  Download
                </Button>
                <Button
                  onClick={shareToTwitter}
                  className="gap-2 bg-[#1DA1F2] hover:bg-[#1a8cd8] text-white"
                >
                  <Twitter className="w-4 h-4" />
                  Tweet
                </Button>
              </div>

              <Button
                onClick={copyShareText}
                variant="secondary"
                className="w-full gap-2"
              >
                <Copy className="w-4 h-4" />
                Copy Share Text
              </Button>
            </AnimatePresence>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

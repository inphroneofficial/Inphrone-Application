import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Share2, Download, X, Sparkles, Check, Copy, Twitter, Facebook, Linkedin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import html2canvas from "html2canvas";
import { triggerHaptic } from "./InphroSyncPremium";

interface ShareInsightCardProps {
  moodChoice?: string;
  deviceChoice?: string;
  appChoice?: string;
  streakWeeks?: number;
  date?: string;
}

export function ShareInsightCard({
  moodChoice = "Cinematic Adventure",
  deviceChoice = "Mobile",
  appChoice = "Netflix",
  streakWeeks = 0,
  date = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
}: ShareInsightCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const getEmoji = (label: string) => {
    if (label.includes("Cinematic") || label.includes("Adventure")) return "🎬";
    if (label.includes("Fun") || label.includes("Comedy")) return "😄";
    if (label.includes("Emotional") || label.includes("Drama")) return "😢";
    if (label.includes("Chill") || label.includes("Relax")) return "😌";
    if (label.includes("Mobile")) return "📱";
    if (label.includes("TV")) return "📺";
    if (label.includes("Laptop")) return "💻";
    if (label.includes("Netflix")) return "🎬";
    if (label.includes("YouTube")) return "▶️";
    if (label.includes("Spotify")) return "🎵";
    if (label.includes("Prime")) return "📦";
    return "✨";
  };

  const downloadCard = async () => {
    if (!cardRef.current) return;
    
    setIsGenerating(true);
    triggerHaptic('medium');
    
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
      });
      
      const link = document.createElement('a');
      link.download = `inphrosync-insight-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      
      toast.success("Card downloaded! Share it on social media 🎉");
    } catch (error) {
      toast.error("Failed to generate card");
    } finally {
      setIsGenerating(false);
    }
  };

  const shareText = `My InphroSync Daily Insight 🎬\n\n😊 Mood: ${moodChoice}\n📱 Device: ${deviceChoice}\n📺 App: ${appChoice}\n🔥 Streak: ${streakWeeks} weeks\n\nTrack your entertainment journey at inphrone.com #InphroSync #Entertainment`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      triggerHaptic('light');
      toast.success("Copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  const shareToSocial = (platform: string) => {
    const encodedText = encodeURIComponent(shareText);
    const urls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?text=${encodedText}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?quote=${encodedText}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=https://inphrone.com&summary=${encodedText}`,
    };
    
    if (urls[platform]) {
      window.open(urls[platform], '_blank', 'width=600,height=400');
      triggerHaptic('light');
    }
  };

  return (
    <>
      {/* Share Button */}
      <motion.button
        onClick={() => {
          setIsOpen(true);
          triggerHaptic('light');
        }}
        className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 text-sm font-medium hover:from-primary/20 hover:to-accent/20 transition-all"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Share2 className="w-4 h-4" />
        <span>Share Insight</span>
      </motion.button>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              className="w-full max-w-md bg-card border border-border rounded-3xl overflow-hidden shadow-2xl"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold">Share Your Insight</h3>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Shareable Card Preview */}
              <div className="p-6">
                <div
                  ref={cardRef}
                  className="relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-slate-900 via-purple-900/50 to-slate-900"
                >
                  {/* Background pattern */}
                  <div className="absolute inset-0 opacity-20">
                    <div className="absolute inset-0" style={{
                      backgroundImage: `radial-gradient(circle at 20% 20%, rgba(139, 92, 246, 0.3) 0%, transparent 50%),
                                        radial-gradient(circle at 80% 80%, rgba(6, 182, 212, 0.3) 0%, transparent 50%)`
                    }} />
                  </div>
                  
                  {/* Content */}
                  <div className="relative z-10 space-y-4">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                          <span className="text-xs font-bold text-white">IS</span>
                        </div>
                        <span className="text-white/80 text-sm font-medium">InphroSync</span>
                      </div>
                      <span className="text-white/60 text-xs">{date}</span>
                    </div>

                    {/* Choices Grid */}
                    <div className="grid gap-3">
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 backdrop-blur-sm">
                        <span className="text-2xl">{getEmoji(moodChoice)}</span>
                        <div>
                          <p className="text-white/60 text-xs">Mood</p>
                          <p className="text-white font-medium">{moodChoice}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center gap-2 p-3 rounded-xl bg-white/5 backdrop-blur-sm">
                          <span className="text-xl">{getEmoji(deviceChoice)}</span>
                          <div>
                            <p className="text-white/60 text-[10px]">Device</p>
                            <p className="text-white text-sm font-medium">{deviceChoice}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 p-3 rounded-xl bg-white/5 backdrop-blur-sm">
                          <span className="text-xl">{getEmoji(appChoice)}</span>
                          <div>
                            <p className="text-white/60 text-[10px]">App</p>
                            <p className="text-white text-sm font-medium">{appChoice}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Streak */}
                    {streakWeeks > 0 && (
                      <div className="flex items-center justify-center gap-2 py-2">
                        <span className="text-orange-400">🔥</span>
                        <span className="text-white font-bold">{streakWeeks} week streak</span>
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-center gap-2 pt-2 border-t border-white/10">
                      <span className="text-white/40 text-xs">inphrone.com</span>
                      <Badge className="bg-primary/20 text-primary border-primary/30 text-[10px]">
                        #InphroSync
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="p-4 border-t border-border space-y-4">
                {/* Download Button */}
                <Button
                  onClick={downloadCard}
                  disabled={isGenerating}
                  className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90"
                >
                  {isGenerating ? (
                    <motion.div
                      className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Download Card
                    </>
                  )}
                </Button>

                {/* Social Share Buttons */}
                <div className="flex items-center justify-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => shareToSocial('twitter')}
                    className="rounded-full w-10 h-10"
                  >
                    <Twitter className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => shareToSocial('facebook')}
                    className="rounded-full w-10 h-10"
                  >
                    <Facebook className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => shareToSocial('linkedin')}
                    className="rounded-full w-10 h-10"
                  >
                    <Linkedin className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={copyToClipboard}
                    className="rounded-full w-10 h-10"
                  >
                    {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>

                <p className="text-center text-xs text-muted-foreground">
                  Share your entertainment journey with the world
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

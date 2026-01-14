import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Share2, Facebook, Twitter, Link as LinkIcon, Download, Flame, Award, Sparkles, Zap } from "lucide-react";
import { toast } from "sonner";
import html2canvas from "html2canvas";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";

interface ShareProfileButtonProps {
  userName: string;
  avatarUrl?: string;
  totalOpinions: number;
  likesReceived: number;
  rewards: number;
  level: number;
}

export function ShareProfileButton({ userName, avatarUrl, totalOpinions, likesReceived, rewards, level }: ShareProfileButtonProps) {
  const [open, setOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [streakWeeks, setStreakWeeks] = useState(0);
  const [badgesCount, setBadgesCount] = useState(0);
  const [wisdomEnergy, setWisdomEnergy] = useState(0);
  const [evolutionStage, setEvolutionStage] = useState(1);
  const [inphroSyncStreak, setInphroSyncStreak] = useState(0);

  useEffect(() => {
    const fetchGamificationData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch streak data including InphroSync streak
      const { data: streakData } = await supabase
        .from('user_streaks')
        .select('current_streak_weeks, inphrosync_streak_days')
        .eq('user_id', user.id)
        .single();
      
      if (streakData) {
        setStreakWeeks(streakData.current_streak_weeks || 0);
        setInphroSyncStreak((streakData as any).inphrosync_streak_days || 0);
      }

      // Fetch avatar/creative soul data
      const { data: avatarData } = await supabase
        .from('user_avatars')
        .select('wisdom_energy, evolution_stage')
        .eq('user_id', user.id)
        .single();
      
      if (avatarData) {
        setWisdomEnergy(avatarData.wisdom_energy || 0);
        setEvolutionStage(avatarData.evolution_stage || 1);
      }

      // Fetch badges count
      const { count } = await supabase
        .from('user_badges')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id);
      
      setBadgesCount(count || 0);
    };

    if (open) {
      fetchGamificationData();
    }
  }, [open]);

  const shareText = `🎬 Check out my #Inphrone profile!\n\n✨ Level ${level} | Stage ${evolutionStage}\n📝 ${totalOpinions} Opinions Shared\n❤️ ${likesReceived} Likes Received\n🔥 ${streakWeeks} Week Wisdom Streak\n⚡ ${inphroSyncStreak} Day InphroSync Streak\n💫 ${wisdomEnergy} Wisdom Energy\n🏆 ${badgesCount} Wisdom Keys\n\nJoin me in shaping the future of entertainment! 🚀`;

  const handleShare = async (platform: string) => {
    const url = window.location.origin;
    
    switch (platform) {
      case "twitter":
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(url)}`, "_blank");
        break;
      case "facebook":
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(shareText)}`, "_blank");
        break;
      case "whatsapp":
        window.open(`https://wa.me/?text=${encodeURIComponent(shareText + "\n" + url)}`, "_blank");
        break;
      case "copy":
        navigator.clipboard.writeText(shareText + "\n" + url);
        toast.success("Link copied to clipboard!");
        break;
    }
  };

  const isValidImageUrl = (url: string): boolean => {
    try {
      const parsed = new URL(url);
      return (parsed.protocol === 'http:' || parsed.protocol === 'https:') &&
             /\.(jpg|jpeg|png|gif|webp)$/i.test(parsed.pathname);
    } catch {
      return false;
    }
  };

  const generateShareImage = async () => {
    setGenerating(true);
    try {
      const shareCard = document.createElement("div");
      shareCard.style.width = "720px";
      shareCard.style.padding = "40px";
      shareCard.style.background = "linear-gradient(135deg, #5b2333 0%, #7d3449 50%, #9c4963 100%)";
      shareCard.style.color = "white";
      shareCard.style.fontFamily = "system-ui, -apple-system, sans-serif";
      shareCard.style.position = "absolute";
      shareCard.style.left = "-9999px";
      shareCard.style.borderRadius = "24px";
      
      const container = document.createElement("div");
      container.style.textAlign = "center";
      
      // Title with glow effect
      const title = document.createElement("h1");
      title.textContent = "#Inphrone";
      title.style.fontSize = "42px";
      title.style.margin = "0 0 8px 0";
      title.style.fontWeight = "bold";
      title.style.textShadow = "0 0 20px rgba(255,255,255,0.3)";
      container.appendChild(title);

      const subtitle = document.createElement("p");
      subtitle.textContent = "Entertainment Opinion Pioneer";
      subtitle.style.fontSize = "14px";
      subtitle.style.opacity = "0.8";
      subtitle.style.margin = "0 0 24px 0";
      subtitle.style.letterSpacing = "2px";
      subtitle.style.textTransform = "uppercase";
      container.appendChild(subtitle);
      
      // Profile section
      const profileDiv = document.createElement("div");
      profileDiv.style.display = "flex";
      profileDiv.style.alignItems = "center";
      profileDiv.style.gap = "20px";
      profileDiv.style.justifyContent = "center";
      profileDiv.style.margin = "24px 0";
      
      if (avatarUrl && isValidImageUrl(avatarUrl)) {
        const avatar = document.createElement("img");
        avatar.src = avatarUrl;
        avatar.alt = "Avatar";
        avatar.style.width = "80px";
        avatar.style.height = "80px";
        avatar.style.borderRadius = "50%";
        avatar.style.border = "4px solid rgba(255,255,255,.3)";
        avatar.style.boxShadow = "0 8px 32px rgba(0,0,0,0.3)";
        profileDiv.appendChild(avatar);
      }
      
      const infoDiv = document.createElement("div");
      infoDiv.style.textAlign = "left";
      
      const nameHeading = document.createElement("h2");
      nameHeading.textContent = userName;
      nameHeading.style.fontSize = "28px";
      nameHeading.style.margin = "0";
      nameHeading.style.fontWeight = "bold";
      infoDiv.appendChild(nameHeading);
      
      const levelBadge = document.createElement("div");
      levelBadge.style.display = "inline-flex";
      levelBadge.style.alignItems = "center";
      levelBadge.style.gap = "8px";
      levelBadge.style.background = "rgba(255,255,255,0.15)";
      levelBadge.style.padding = "6px 14px";
      levelBadge.style.borderRadius = "20px";
      levelBadge.style.marginTop = "8px";
      levelBadge.style.fontSize = "14px";
      // Use textContent instead of innerHTML to prevent XSS
      levelBadge.textContent = `✨ Level ${Number(level) || 0} • Stage ${Number(evolutionStage) || 1} Creative Soul`;
      infoDiv.appendChild(levelBadge);
      
      profileDiv.appendChild(infoDiv);
      container.appendChild(profileDiv);
      
      // Stats grid with new streak data
      const statsGrid = document.createElement("div");
      statsGrid.style.display = "grid";
      statsGrid.style.gridTemplateColumns = "repeat(4, 1fr)";
      statsGrid.style.gap = "12px";
      statsGrid.style.margin = "24px 0";
      
      const stats = [
        { value: totalOpinions, label: "Opinions", icon: "📝" },
        { value: likesReceived, label: "Likes", icon: "❤️" },
        { value: streakWeeks, label: "Week Streak", icon: "🔥" },
        { value: badgesCount, label: "Wisdom Keys", icon: "🏆" }
      ];
      
      stats.forEach(stat => {
        const statBox = document.createElement("div");
        statBox.style.background = "rgba(255,255,255,0.1)";
        statBox.style.padding = "16px 12px";
        statBox.style.borderRadius = "16px";
        statBox.style.backdropFilter = "blur(10px)";
        
        const iconText = document.createElement("p");
        iconText.textContent = stat.icon;
        iconText.style.fontSize = "24px";
        iconText.style.margin = "0 0 8px 0";
        statBox.appendChild(iconText);
        
        const valueText = document.createElement("p");
        valueText.textContent = String(stat.value);
        valueText.style.fontSize = "28px";
        valueText.style.margin = "0";
        valueText.style.fontWeight = "bold";
        statBox.appendChild(valueText);
        
        const labelText = document.createElement("p");
        labelText.textContent = stat.label;
        labelText.style.fontSize = "11px";
        labelText.style.margin = "4px 0 0 0";
        labelText.style.opacity = "0.8";
        labelText.style.textTransform = "uppercase";
        labelText.style.letterSpacing = "0.5px";
        statBox.appendChild(labelText);
        
        statsGrid.appendChild(statBox);
      });
      
      container.appendChild(statsGrid);

      // Additional streaks row
      const streaksRow = document.createElement("div");
      streaksRow.style.display = "flex";
      streaksRow.style.justifyContent = "center";
      streaksRow.style.gap = "16px";
      streaksRow.style.margin = "16px 0";

      const additionalStats = [
        { value: wisdomEnergy, label: "Wisdom Energy", icon: "💫" },
        { value: inphroSyncStreak, label: "InphroSync Days", icon: "⚡" }
      ];

      additionalStats.forEach(stat => {
        const badge = document.createElement("div");
        badge.style.background = "rgba(255,255,255,0.1)";
        badge.style.padding = "10px 20px";
        badge.style.borderRadius = "30px";
        badge.style.display = "flex";
        badge.style.alignItems = "center";
        badge.style.gap = "8px";
        badge.style.fontSize = "14px";
        
        // Create elements safely instead of using innerHTML to prevent XSS
        const iconSpan = document.createElement("span");
        iconSpan.textContent = stat.icon;
        badge.appendChild(iconSpan);
        
        const valueStrong = document.createElement("strong");
        valueStrong.textContent = String(Number(stat.value) || 0);
        badge.appendChild(valueStrong);
        
        const labelSpan = document.createElement("span");
        labelSpan.textContent = ` ${stat.label}`;
        badge.appendChild(labelSpan);
        
        streaksRow.appendChild(badge);
      });

      container.appendChild(streaksRow);
      
      // Footer
      const footer = document.createElement("p");
      footer.textContent = "Shaping the future of entertainment 🚀";
      footer.style.fontSize = "16px";
      footer.style.margin = "20px 0 0 0";
      footer.style.opacity = "0.9";
      container.appendChild(footer);
      
      shareCard.appendChild(container);
      document.body.appendChild(shareCard);
      
      const canvas = await html2canvas(shareCard, {
        backgroundColor: null,
        scale: 2
      });
      
      document.body.removeChild(shareCard);
      
      const link = document.createElement("a");
      link.download = "inphrone-profile.png";
      link.href = canvas.toDataURL();
      link.click();
      
      toast.success("Profile card downloaded!");
    } catch (error) {
      console.error("Error generating image:", error);
      toast.error("Failed to generate image");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        variant="outline"
        className="gap-2 hover-lift"
      >
        <Share2 className="w-4 h-4" />
        Share Profile
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Share Your Profile
            </DialogTitle>
            <DialogDescription>
              Let others know about your contributions!
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Preview Stats - Compact Grid */}
            <div className="grid grid-cols-2 gap-2">
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-secondary/50 p-3 rounded-lg border border-border"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Flame className="w-3 h-3 text-primary" />
                  <span className="text-xs text-muted-foreground">Wisdom Streak</span>
                </div>
                <p className="text-lg font-bold">{streakWeeks} weeks</p>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-secondary/50 p-3 rounded-lg border border-border"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="w-3 h-3 text-accent" />
                  <span className="text-xs text-muted-foreground">InphroSync</span>
                </div>
                <p className="text-lg font-bold">{inphroSyncStreak} days</p>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-secondary/50 p-3 rounded-lg border border-border"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-3 h-3 text-primary" />
                  <span className="text-xs text-muted-foreground">Creative Soul</span>
                </div>
                <p className="text-lg font-bold">Stage {evolutionStage}</p>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-secondary/50 p-3 rounded-lg border border-border"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Award className="w-3 h-3 text-accent" />
                  <span className="text-xs text-muted-foreground">Wisdom Keys</span>
                </div>
                <p className="text-lg font-bold">{badgesCount}</p>
              </motion.div>
            </div>

            {/* Share Text Preview */}
            <div className="bg-muted/50 p-4 rounded-xl border">
              <p className="text-sm whitespace-pre-wrap">{shareText}</p>
            </div>

            {/* Share Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={() => handleShare("twitter")}
                className="gap-2 hover-lift"
              >
                <Twitter className="w-4 h-4" />
                Twitter
              </Button>
              <Button
                variant="outline"
                onClick={() => handleShare("facebook")}
                className="gap-2 hover-lift"
              >
                <Facebook className="w-4 h-4" />
                Facebook
              </Button>
              <Button
                variant="outline"
                onClick={() => handleShare("whatsapp")}
                className="gap-2 hover-lift"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                WhatsApp
              </Button>
              <Button
                variant="outline"
                onClick={() => handleShare("copy")}
                className="gap-2 hover-lift"
              >
                <LinkIcon className="w-4 h-4" />
                Copy Link
              </Button>
            </div>

            <Button
              onClick={generateShareImage}
              disabled={generating}
              className="w-full gap-2 gradient-primary text-white"
            >
              <Download className="w-4 h-4" />
              {generating ? "Generating..." : "Download Profile Card"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
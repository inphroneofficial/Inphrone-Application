import { useState } from "react";
import { Copy, Share2, Users, Gift, Loader2, Trophy, Crown, Star, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useReferral } from "@/hooks/useReferral";
import { motion, AnimatePresence } from "framer-motion";

const REFERRAL_TIERS = [
  { threshold: 1, reward: "50 Bonus Points", icon: Star, color: "text-amber-500" },
  { threshold: 3, reward: "Premium Insights (1 Week)", icon: Zap, color: "text-purple-500" },
  { threshold: 5, reward: "Exclusive Badge", icon: Trophy, color: "text-blue-500" },
  { threshold: 10, reward: "VIP Status", icon: Crown, color: "text-yellow-500" },
];

export function EnhancedReferralCard() {
  const {
    referralCode,
    claims,
    loading,
    totalReferrals,
    generateReferralCode,
    copyCodeToClipboard,
    shareReferralCode,
  } = useReferral();
  const [generating, setGenerating] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  const handleGenerate = async () => {
    setGenerating(true);
    await generateReferralCode();
    setGenerating(false);
  };

  const getCurrentTier = () => {
    for (let i = REFERRAL_TIERS.length - 1; i >= 0; i--) {
      if (totalReferrals >= REFERRAL_TIERS[i].threshold) {
        return REFERRAL_TIERS[i];
      }
    }
    return null;
  };

  const getNextTier = () => {
    for (const tier of REFERRAL_TIERS) {
      if (totalReferrals < tier.threshold) {
        return tier;
      }
    }
    return null;
  };

  const currentTier = getCurrentTier();
  const nextTier = getNextTier();
  const progressToNext = nextTier
    ? (totalReferrals / nextTier.threshold) * 100
    : 100;

  if (loading) {
    return (
      <Card className="premium-card">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="premium-card overflow-hidden relative">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        
        <CardHeader className="relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20">
                <Gift className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">Referral Rewards</CardTitle>
                <CardDescription>Invite friends, unlock rewards</CardDescription>
              </div>
            </div>
            {currentTier && (
              <Badge variant="secondary" className="gap-1 text-sm py-1.5 px-3">
                <currentTier.icon className={`w-4 h-4 ${currentTier.color}`} />
                {currentTier.reward}
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="relative space-y-6">
          {referralCode ? (
            <>
              {/* Referral Code Section */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-muted-foreground">Your Referral Code</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      value={referralCode.code}
                      readOnly
                      className="font-mono text-xl font-bold tracking-[0.25em] bg-muted/30 text-center h-14 border-2 border-primary/20"
                    />
                    <motion.div
                      className="absolute inset-0 border-2 border-primary/50 rounded-md pointer-events-none"
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={copyCodeToClipboard}
                    className="h-14 w-14 shrink-0 hover:bg-primary/10 hover:border-primary"
                  >
                    <Copy className="w-5 h-5" />
                  </Button>
                </div>
                <Button
                  onClick={shareReferralCode}
                  className="w-full h-12 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white font-semibold shadow-lg"
                >
                  <Share2 className="w-5 h-5 mr-2" />
                  Share & Invite Friends
                </Button>
              </div>

              {/* Progress Section */}
              <div className="space-y-4 p-4 rounded-xl bg-muted/30 border border-border/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    <span className="font-semibold">Your Referrals</span>
                  </div>
                  <span className="text-2xl font-black text-primary">{totalReferrals}</span>
                </div>

                {nextTier && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {nextTier.threshold - totalReferrals} more to unlock:
                      </span>
                      <span className="font-medium flex items-center gap-1">
                        <nextTier.icon className={`w-4 h-4 ${nextTier.color}`} />
                        {nextTier.reward}
                      </span>
                    </div>
                    <Progress value={progressToNext} className="h-3" />
                  </div>
                )}
              </div>

              {/* Reward Tiers */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-primary" />
                  Reward Tiers
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {REFERRAL_TIERS.map((tier, index) => {
                    const unlocked = totalReferrals >= tier.threshold;
                    return (
                      <motion.div
                        key={tier.threshold}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className={`p-3 rounded-xl border-2 transition-all ${
                          unlocked
                            ? "bg-primary/10 border-primary/30"
                            : "bg-muted/20 border-border/50 opacity-60"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <tier.icon className={`w-4 h-4 ${unlocked ? tier.color : "text-muted-foreground"}`} />
                          <span className="text-xs font-medium text-muted-foreground">
                            {tier.threshold} referrals
                          </span>
                        </div>
                        <p className={`text-sm font-semibold ${unlocked ? "" : "text-muted-foreground"}`}>
                          {tier.reward}
                        </p>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Recent Referrals */}
              <AnimatePresence>
                {claims.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="space-y-3 pt-4 border-t border-border"
                  >
                    <h4 className="text-sm font-semibold">Recent Referrals</h4>
                    <div className="space-y-2">
                      {claims.slice(0, 5).map((claim, index) => (
                        <motion.div
                          key={claim.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                              <Users className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">New friend joined!</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(claim.claimed_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <Badge variant={claim.bonus_awarded ? "default" : "secondary"}>
                            {claim.bonus_awarded ? "+100 pts" : "Pending"}
                          </Badge>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          ) : (
            <div className="text-center py-8 space-y-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", damping: 15 }}
                className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center"
              >
                <Gift className="w-10 h-10 text-primary" />
              </motion.div>
              
              <div className="space-y-2">
                <h3 className="text-xl font-bold">Start Earning Rewards!</h3>
                <p className="text-muted-foreground max-w-xs mx-auto">
                  Generate your unique code and earn <span className="text-primary font-semibold">100 points</span> for each friend who joins!
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 max-w-xs mx-auto text-sm">
                {REFERRAL_TIERS.slice(0, 2).map((tier) => (
                  <div key={tier.threshold} className="p-3 rounded-lg bg-muted/30 border border-border/50">
                    <tier.icon className={`w-5 h-5 mx-auto mb-1 ${tier.color}`} />
                    <p className="font-medium">{tier.reward}</p>
                    <p className="text-xs text-muted-foreground">{tier.threshold} referrals</p>
                  </div>
                ))}
              </div>

              <Button
                onClick={handleGenerate}
                disabled={generating}
                className="h-12 px-8 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white font-semibold shadow-lg"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5 mr-2" />
                    Generate My Code
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

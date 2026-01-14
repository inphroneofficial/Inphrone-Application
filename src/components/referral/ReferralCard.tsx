import { useState } from 'react';
import { Copy, Share2, Users, Gift, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useReferral } from '@/hooks/useReferral';
import { useLanguage } from '@/components/SettingsDialog';
import { motion } from 'framer-motion';

export function ReferralCard() {
  const { t } = useLanguage();
  const {
    referralCode,
    claims,
    loading,
    totalReferrals,
    generateReferralCode,
    copyCodeToClipboard,
    shareReferralCode
  } = useReferral();
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async () => {
    setGenerating(true);
    await generateReferralCode();
    setGenerating(false);
  };

  if (loading) {
    return (
      <Card className="premium-card">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
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
      <Card className="premium-card overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <CardHeader className="relative">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">{t('referralProgram')}</CardTitle>
              <CardDescription>{t('shareWithFriends')}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="relative space-y-4">
          {referralCode ? (
            <>
              {/* Referral Code Display */}
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">{t('yourReferralCode')}</label>
                <div className="flex gap-2">
                  <Input
                    value={referralCode.code}
                    readOnly
                    className="font-mono text-lg font-bold tracking-wider bg-muted/50 text-center"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={copyCodeToClipboard}
                    className="shrink-0"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="default"
                    size="icon"
                    onClick={shareReferralCode}
                    className="shrink-0"
                  >
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="w-4 h-4 text-primary" />
                    <span className="text-sm text-muted-foreground">{t('totalReferrals')}</span>
                  </div>
                  <p className="text-2xl font-bold text-primary">{totalReferrals}</p>
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/20">
                  <div className="flex items-center gap-2 mb-1">
                    <Gift className="w-4 h-4 text-accent" />
                    <span className="text-sm text-muted-foreground">{t('earnPoints')}</span>
                  </div>
                  <p className="text-2xl font-bold text-accent">+100</p>
                </div>
              </div>

              {/* Recent Referrals */}
              {claims.length > 0 && (
                <div className="pt-4 border-t border-border">
                  <h4 className="text-sm font-medium mb-2">Recent Referrals</h4>
                  <div className="space-y-2">
                    {claims.slice(0, 3).map((claim) => (
                      <div
                        key={claim.id}
                        className="flex items-center justify-between p-2 rounded-lg bg-muted/30"
                      >
                        <span className="text-sm text-muted-foreground">
                          {new Date(claim.claimed_at).toLocaleDateString()}
                        </span>
                        <Badge variant={claim.bonus_awarded ? 'default' : 'secondary'}>
                          {claim.bonus_awarded ? '+100 pts' : 'Pending'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-6">
              <Gift className="w-12 h-12 mx-auto text-primary/50 mb-4" />
              <p className="text-muted-foreground mb-4">
                Generate your unique referral code and earn 100 points for each friend who joins!
              </p>
              <Button
                onClick={handleGenerate}
                disabled={generating}
                className="glow-button"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Gift className="w-4 h-4 mr-2" />
                    Generate Referral Code
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

import { EnhancedReferralCard } from '@/components/referral/EnhancedReferralCard';
import { CampusAmbassadorCard } from '@/components/ambassador/CampusAmbassadorCard';
import { ShareableDNACard } from '@/components/share/ShareableDNACard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, GraduationCap, Gift, ChevronRight, Dna } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';

interface ReferralSectionProps {
  userId: string;
  userType: string;
}

export function ReferralSection({ userId, userType }: ReferralSectionProps) {
  const [showReferral, setShowReferral] = useState(false);
  const [showAmbassador, setShowAmbassador] = useState(false);
  const [userName, setUserName] = useState("User");
  
  const isAudience = userType === 'audience';

  useEffect(() => {
    const fetchUserName = async () => {
      if (userId) {
        const { data } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", userId)
          .single();
        if (data?.full_name) {
          setUserName(data.full_name);
        }
      }
    };
    fetchUserName();
  }, [userId]);

  return (
    <div className="space-y-4">
      {/* Share Your DNA - for audience users */}
      {isAudience && (
        <Card className="shadow-elegant border-2 border-accent/10 hover:border-accent/20 transition-all bg-gradient-to-br from-primary/5 to-accent/5">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20">
                  <Dna className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Entertainment DNA</h3>
                  <p className="text-sm text-muted-foreground">Share your unique profile on social media</p>
                </div>
              </div>
              <ShareableDNACard userId={userId} userName={userName} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Referral Program Card */}
      <Card className="shadow-elegant border-2 border-primary/10 hover:border-primary/20 transition-all">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between text-lg">
            <div className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-primary" />
              Referral Rewards
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowReferral(!showReferral)}
              className="text-primary hover:bg-primary/10"
            >
              {showReferral ? 'Hide' : 'Earn Rewards'}
              <ChevronRight className={`w-4 h-4 ml-1 transition-transform ${showReferral ? 'rotate-90' : ''}`} />
            </Button>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Invite 3 friends to unlock Premium Insights!
          </p>
        </CardHeader>
        
        <AnimatePresence>
          {showReferral && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <CardContent className="pt-0">
                <EnhancedReferralCard />
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      {/* Campus Ambassador Program - Only for audience/students */}
      {isAudience && (
        <Card className="shadow-elegant border-2 border-accent/10 hover:border-accent/20 transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between text-lg">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-accent" />
                Campus Ambassador
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAmbassador(!showAmbassador)}
                className="text-accent hover:bg-accent/10"
              >
                {showAmbassador ? 'Hide' : 'Apply'}
                <ChevronRight className={`w-4 h-4 ml-1 transition-transform ${showAmbassador ? 'rotate-90' : ''}`} />
              </Button>
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Represent Inphrone at your college and earn exclusive rewards
            </p>
          </CardHeader>
          
          <AnimatePresence>
            {showAmbassador && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <CardContent className="pt-0">
                  <CampusAmbassadorCard />
                </CardContent>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      )}
    </div>
  );
}

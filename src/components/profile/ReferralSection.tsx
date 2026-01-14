import { ReferralCard } from '@/components/referral/ReferralCard';
import { CampusAmbassadorCard } from '@/components/ambassador/CampusAmbassadorCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, GraduationCap, Gift, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ReferralSectionProps {
  userId: string;
  userType: string;
}

export function ReferralSection({ userId, userType }: ReferralSectionProps) {
  const [showReferral, setShowReferral] = useState(false);
  const [showAmbassador, setShowAmbassador] = useState(false);
  
  const isAudience = userType === 'audience';

  return (
    <div className="space-y-4">
      {/* Referral Program Card */}
      <Card className="shadow-elegant border-2 border-primary/10 hover:border-primary/20 transition-all">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between text-lg">
            <div className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-primary" />
              Referral Program
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowReferral(!showReferral)}
              className="text-primary hover:bg-primary/10"
            >
              {showReferral ? 'Hide' : 'View'}
              <ChevronRight className={`w-4 h-4 ml-1 transition-transform ${showReferral ? 'rotate-90' : ''}`} />
            </Button>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Invite friends and earn rewards when they join
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
                <ReferralCard />
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

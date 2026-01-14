import { useState } from 'react';
import { GraduationCap, Award, Copy, CheckCircle, Loader2, Star, Users, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useCampusAmbassador } from '@/hooks/useCampusAmbassador';
import { useLanguage } from '@/components/SettingsDialog';
import { motion } from 'framer-motion';

export function CampusAmbassadorCard() {
  const { t } = useLanguage();
  const {
    ambassador,
    loading,
    isAmbassador,
    isApproved,
    applyAsAmbassador,
    copyAmbassadorCode,
    getStatusColor
  } = useCampusAmbassador();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    college_name: '',
    college_city: '',
    college_state: '',
    student_id: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.college_name || !formData.college_city || !formData.college_state) {
      return;
    }

    setSubmitting(true);
    const success = await applyAsAmbassador(formData);
    setSubmitting(false);

    if (success) {
      setDialogOpen(false);
    }
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
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <Card className="premium-card overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-primary/5" />
        <CardHeader className="relative">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-accent/10">
              <GraduationCap className="w-5 h-5 text-accent" />
            </div>
            <div>
              <CardTitle className="text-lg">{t('campusAmbassador')}</CardTitle>
              <CardDescription>Represent Inphrone at your college</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="relative space-y-4">
          {isAmbassador && ambassador ? (
            <>
              {/* Status Badge */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{t('applicationStatus')}</span>
                <Badge className={getStatusColor(ambassador.status)}>
                  {ambassador.status.charAt(0).toUpperCase() + ambassador.status.slice(1)}
                </Badge>
              </div>

              {/* College Info */}
              <div className="p-3 rounded-lg bg-muted/30 border border-border">
                <p className="font-medium">{ambassador.college_name}</p>
                <p className="text-sm text-muted-foreground">
                  {ambassador.college_city}, {ambassador.college_state}
                </p>
              </div>

              {/* Ambassador Code */}
              {isApproved && (
                <div className="space-y-2">
                  <Label>Your Ambassador Code</Label>
                  <div className="flex gap-2">
                    <Input
                      value={ambassador.ambassador_code}
                      readOnly
                      className="font-mono font-bold tracking-wider bg-muted/50"
                    />
                    <Button variant="outline" size="icon" onClick={copyAmbassadorCode}>
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Stats */}
              {isApproved && (
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="p-4 rounded-xl bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/20">
                    <div className="flex items-center gap-2 mb-1">
                      <Users className="w-4 h-4 text-accent" />
                      <span className="text-sm text-muted-foreground">Referrals</span>
                    </div>
                    <p className="text-2xl font-bold text-accent">{ambassador.total_referrals}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                    <div className="flex items-center gap-2 mb-1">
                      <Trophy className="w-4 h-4 text-primary" />
                      <span className="text-sm text-muted-foreground">Points</span>
                    </div>
                    <p className="text-2xl font-bold text-primary">{ambassador.total_points}</p>
                  </div>
                </div>
              )}

              {/* Benefits */}
              <div className="pt-4 border-t border-border">
                <h4 className="text-sm font-medium mb-3">{t('ambassadorBenefits')}</h4>
                <div className="grid grid-cols-3 gap-2">
                  <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-muted/30">
                    <Award className="w-5 h-5 text-primary" />
                    <span className="text-xs text-center">{t('exclusiveRewards')}</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-muted/30">
                    <Star className="w-5 h-5 text-accent" />
                    <span className="text-xs text-center">{t('earlyAccess')}</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-muted/30">
                    <CheckCircle className="w-5 h-5 text-success" />
                    <span className="text-xs text-center">{t('specialBadge')}</span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-6">
              <GraduationCap className="w-12 h-12 mx-auto text-accent/50 mb-4" />
              <p className="text-muted-foreground mb-4">
                Become a Campus Ambassador and earn exclusive rewards while promoting Inphrone at your college!
              </p>
              
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="glow-button">
                    <GraduationCap className="w-4 h-4 mr-2" />
                    {t('applyNow')}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Apply as Campus Ambassador</DialogTitle>
                    <DialogDescription>
                      Fill in your college details to apply for the ambassador program.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="college_name">{t('collegeName')} *</Label>
                      <Input
                        id="college_name"
                        placeholder="e.g., IIT Delhi"
                        value={formData.college_name}
                        onChange={(e) => setFormData(prev => ({ ...prev, college_name: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="college_city">{t('collegeCity')} *</Label>
                        <Input
                          id="college_city"
                          placeholder="e.g., New Delhi"
                          value={formData.college_city}
                          onChange={(e) => setFormData(prev => ({ ...prev, college_city: e.target.value }))}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="college_state">{t('collegeState')} *</Label>
                        <Input
                          id="college_state"
                          placeholder="e.g., Delhi"
                          value={formData.college_state}
                          onChange={(e) => setFormData(prev => ({ ...prev, college_state: e.target.value }))}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="student_id">{t('studentId')}</Label>
                      <Input
                        id="student_id"
                        placeholder="Optional"
                        value={formData.student_id}
                        onChange={(e) => setFormData(prev => ({ ...prev, student_id: e.target.value }))}
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={submitting}>
                      {submitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        'Submit Application'
                      )}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

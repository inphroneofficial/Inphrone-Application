import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { 
  Settings, Shield, Bell, Zap, Clock, Users, MessageSquare, 
  Gift, Sparkles, Trophy, Globe, Lock, AlertTriangle, 
  RefreshCw, Save, RotateCcw
} from "lucide-react";

interface PlatformConfig {
  // Feature Toggles
  enableInphroSync: boolean;
  enableYourTurn: boolean;
  enableRewards: boolean;
  enableCoupons: boolean;
  enableNotifications: boolean;
  enableChatbot: boolean;
  
  // Rate Limits
  opinionsPerHour: number;
  opinionsPerWeekPerCategory: number;
  maxDailyNotifications: number;
  
  // Engagement Settings
  streakRewardMultiplier: number;
  minOpinionsForCoupon: number;
  referralBonusPoints: number;
  
  // Moderation
  autoModerateContent: boolean;
  requireEmailVerification: boolean;
  
  // Maintenance
  maintenanceMode: boolean;
  maintenanceMessage: string;
}

const defaultConfig: PlatformConfig = {
  enableInphroSync: true,
  enableYourTurn: true,
  enableRewards: true,
  enableCoupons: true,
  enableNotifications: true,
  enableChatbot: true,
  opinionsPerHour: 5,
  opinionsPerWeekPerCategory: 1,
  maxDailyNotifications: 10,
  streakRewardMultiplier: 1.5,
  minOpinionsForCoupon: 3,
  referralBonusPoints: 50,
  autoModerateContent: true,
  requireEmailVerification: false,
  maintenanceMode: false,
  maintenanceMessage: "We're currently performing scheduled maintenance. Please check back soon!"
};

export function PlatformSettings() {
  const [config, setConfig] = useState<PlatformConfig>(defaultConfig);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    // Load config from localStorage (in production, this would be from database)
    const saved = localStorage.getItem('inphrone_platform_config');
    if (saved) {
      setConfig(JSON.parse(saved));
    }
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Save to localStorage (in production, save to database)
      localStorage.setItem('inphrone_platform_config', JSON.stringify(config));
      toast.success("Platform settings saved successfully");
      setHasChanges(false);
      
      // Broadcast event to notify app of config changes
      window.dispatchEvent(new CustomEvent('platform-config-updated', { detail: config }));
    } catch (error) {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setConfig(defaultConfig);
    setHasChanges(true);
    toast.info("Settings reset to defaults");
  };

  const updateConfig = <K extends keyof PlatformConfig>(key: K, value: PlatformConfig[K]) => {
    setConfig(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const FeatureToggle = ({ 
    label, 
    description, 
    checked, 
    onCheckedChange, 
    icon: Icon 
  }: {
    label: string;
    description: string;
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
    icon: typeof Sparkles;
  }) => (
    <motion.div
      whileHover={{ x: 4 }}
      className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
    >
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${checked ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
          <Icon className="w-4 h-4" />
        </div>
        <div>
          <p className="font-medium">{label}</p>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </motion.div>
  );

  return (
    <div className="space-y-6">
      {/* Header with Save/Reset */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Platform Configuration
          </h3>
          <p className="text-sm text-muted-foreground">Manage feature flags and platform settings</p>
        </div>
        <div className="flex items-center gap-2">
          {hasChanges && (
            <Badge variant="outline" className="text-amber-500 border-amber-500/50">
              Unsaved changes
            </Badge>
          )}
          <Button variant="outline" size="sm" onClick={handleReset}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
          <Button size="sm" onClick={handleSave} disabled={saving || !hasChanges}>
            {saving ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save Changes
          </Button>
        </div>
      </div>

      {/* Maintenance Mode Alert */}
      {config.maintenanceMode && (
        <Card className="border-amber-500/50 bg-amber-500/5">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <div>
                <p className="font-medium text-amber-500">Maintenance Mode Active</p>
                <p className="text-sm text-muted-foreground">Users will see the maintenance message</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Feature Toggles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            Feature Toggles
          </CardTitle>
          <CardDescription>Enable or disable platform features instantly</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <FeatureToggle
            label="InphroSync"
            description="Daily entertainment pulse questions"
            checked={config.enableInphroSync}
            onCheckedChange={(v) => updateConfig('enableInphroSync', v)}
            icon={Sparkles}
          />
          <FeatureToggle
            label="Your Turn"
            description="Community question slots"
            checked={config.enableYourTurn}
            onCheckedChange={(v) => updateConfig('enableYourTurn', v)}
            icon={Trophy}
          />
          <FeatureToggle
            label="Rewards System"
            description="Points and achievements"
            checked={config.enableRewards}
            onCheckedChange={(v) => updateConfig('enableRewards', v)}
            icon={Gift}
          />
          <FeatureToggle
            label="Coupon System"
            description="Reward coupons for users"
            checked={config.enableCoupons}
            onCheckedChange={(v) => updateConfig('enableCoupons', v)}
            icon={Gift}
          />
          <FeatureToggle
            label="Notifications"
            description="Push and in-app notifications"
            checked={config.enableNotifications}
            onCheckedChange={(v) => updateConfig('enableNotifications', v)}
            icon={Bell}
          />
          <FeatureToggle
            label="InphroneBot"
            description="AI-powered chatbot assistant"
            checked={config.enableChatbot}
            onCheckedChange={(v) => updateConfig('enableChatbot', v)}
            icon={MessageSquare}
          />
        </CardContent>
      </Card>

      {/* Rate Limits */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Rate Limits
          </CardTitle>
          <CardDescription>Control submission and activity limits</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Opinions per hour</Label>
              <Badge variant="secondary">{config.opinionsPerHour}</Badge>
            </div>
            <Slider
              value={[config.opinionsPerHour]}
              onValueChange={([v]) => updateConfig('opinionsPerHour', v)}
              min={1}
              max={20}
              step={1}
            />
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Opinions per week per category</Label>
              <Badge variant="secondary">{config.opinionsPerWeekPerCategory}</Badge>
            </div>
            <Slider
              value={[config.opinionsPerWeekPerCategory]}
              onValueChange={([v]) => updateConfig('opinionsPerWeekPerCategory', v)}
              min={1}
              max={5}
              step={1}
            />
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Max daily notifications per user</Label>
              <Badge variant="secondary">{config.maxDailyNotifications}</Badge>
            </div>
            <Slider
              value={[config.maxDailyNotifications]}
              onValueChange={([v]) => updateConfig('maxDailyNotifications', v)}
              min={1}
              max={50}
              step={1}
            />
          </div>
        </CardContent>
      </Card>

      {/* Engagement Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Engagement Settings
          </CardTitle>
          <CardDescription>Configure rewards and engagement parameters</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Streak reward multiplier</Label>
              <Badge variant="secondary">{config.streakRewardMultiplier}x</Badge>
            </div>
            <Slider
              value={[config.streakRewardMultiplier * 10]}
              onValueChange={([v]) => updateConfig('streakRewardMultiplier', v / 10)}
              min={10}
              max={30}
              step={1}
            />
          </div>

          <Separator />

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Min opinions for coupon</Label>
              <Input
                type="number"
                value={config.minOpinionsForCoupon}
                onChange={(e) => updateConfig('minOpinionsForCoupon', parseInt(e.target.value) || 1)}
                min={1}
                max={20}
              />
            </div>
            <div className="space-y-2">
              <Label>Referral bonus points</Label>
              <Input
                type="number"
                value={config.referralBonusPoints}
                onChange={(e) => updateConfig('referralBonusPoints', parseInt(e.target.value) || 0)}
                min={0}
                max={500}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security & Moderation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Security & Moderation
          </CardTitle>
          <CardDescription>Content moderation and security settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <FeatureToggle
            label="Auto-moderate Content"
            description="Automatically flag potentially inappropriate content"
            checked={config.autoModerateContent}
            onCheckedChange={(v) => updateConfig('autoModerateContent', v)}
            icon={Shield}
          />
          <FeatureToggle
            label="Require Email Verification"
            description="Users must verify email before submitting opinions"
            checked={config.requireEmailVerification}
            onCheckedChange={(v) => updateConfig('requireEmailVerification', v)}
            icon={Lock}
          />
        </CardContent>
      </Card>

      {/* Maintenance Mode */}
      <Card className={config.maintenanceMode ? 'border-amber-500/50' : ''}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className={`w-5 h-5 ${config.maintenanceMode ? 'text-amber-500' : 'text-primary'}`} />
            Maintenance Mode
          </CardTitle>
          <CardDescription>Put the platform in maintenance mode</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <FeatureToggle
            label="Enable Maintenance Mode"
            description="Display maintenance message to all users"
            checked={config.maintenanceMode}
            onCheckedChange={(v) => updateConfig('maintenanceMode', v)}
            icon={Globe}
          />
          
          {config.maintenanceMode && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-2"
            >
              <Label>Maintenance Message</Label>
              <Input
                value={config.maintenanceMessage}
                onChange={(e) => updateConfig('maintenanceMessage', e.target.value)}
                placeholder="Enter maintenance message..."
              />
            </motion.div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

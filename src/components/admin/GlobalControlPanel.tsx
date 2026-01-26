import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { 
  Settings, Shield, Zap, Bell, MessageSquare, Gift, 
  Trophy, Sparkles, Lock, Unlock, Save, RotateCcw,
  AlertTriangle, CheckCircle, Activity, Globe, Server,
  Database, Users, Eye, EyeOff, Gauge, Clock, Target
} from "lucide-react";

interface PlatformConfig {
  features: {
    inphrosync_enabled: boolean;
    yourturn_enabled: boolean;
    chatbot_enabled: boolean;
    coupons_enabled: boolean;
    referrals_enabled: boolean;
    opinions_enabled: boolean;
    push_notifications_enabled: boolean;
    email_notifications_enabled: boolean;
  };
  limits: {
    opinions_per_day: number;
    sync_streak_reset_hours: number;
    coupon_expiry_days: number;
    max_yourturn_questions: number;
  };
  moderation: {
    auto_flag_enabled: boolean;
    profanity_filter: boolean;
    require_approval: boolean;
    min_word_count: number;
  };
  maintenance: {
    enabled: boolean;
    message: string;
  };
}

const defaultConfig: PlatformConfig = {
  features: {
    inphrosync_enabled: true,
    yourturn_enabled: true,
    chatbot_enabled: true,
    coupons_enabled: true,
    referrals_enabled: true,
    opinions_enabled: true,
    push_notifications_enabled: true,
    email_notifications_enabled: true,
  },
  limits: {
    opinions_per_day: 10,
    sync_streak_reset_hours: 48,
    coupon_expiry_days: 30,
    max_yourturn_questions: 5,
  },
  moderation: {
    auto_flag_enabled: true,
    profanity_filter: true,
    require_approval: false,
    min_word_count: 10,
  },
  maintenance: {
    enabled: false,
    message: "We're performing scheduled maintenance. Please check back soon.",
  },
};

export function GlobalControlPanel() {
  const [config, setConfig] = useState<PlatformConfig>(defaultConfig);
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("features");

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = () => {
    try {
      const saved = localStorage.getItem('inphrone-platform-config');
      if (saved) {
        setConfig(JSON.parse(saved));
      }
    } catch (error) {
      console.error("Error loading config:", error);
    }
  };

  const saveConfig = async () => {
    setSaving(true);
    try {
      localStorage.setItem('inphrone-platform-config', JSON.stringify(config));
      
      // Dispatch event for other components to react
      window.dispatchEvent(new CustomEvent('platform-config-updated', { detail: config }));
      
      toast.success("Configuration saved successfully!");
      setHasChanges(false);
    } catch (error) {
      toast.error("Failed to save configuration");
    } finally {
      setSaving(false);
    }
  };

  const resetConfig = () => {
    if (confirm("Reset all settings to defaults?")) {
      setConfig(defaultConfig);
      setHasChanges(true);
      toast.info("Settings reset to defaults");
    }
  };

  const updateFeature = (key: keyof PlatformConfig['features'], value: boolean) => {
    setConfig(prev => ({
      ...prev,
      features: { ...prev.features, [key]: value }
    }));
    setHasChanges(true);
  };

  const updateLimit = (key: keyof PlatformConfig['limits'], value: number) => {
    setConfig(prev => ({
      ...prev,
      limits: { ...prev.limits, [key]: value }
    }));
    setHasChanges(true);
  };

  const updateModeration = (key: keyof PlatformConfig['moderation'], value: boolean | number) => {
    setConfig(prev => ({
      ...prev,
      moderation: { ...prev.moderation, [key]: value }
    }));
    setHasChanges(true);
  };

  const updateMaintenance = (enabled: boolean, message?: string) => {
    setConfig(prev => ({
      ...prev,
      maintenance: {
        enabled,
        message: message ?? prev.maintenance.message
      }
    }));
    setHasChanges(true);
  };

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader className="bg-gradient-to-r from-primary/5 via-background to-accent/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <Settings className="w-6 h-6 text-primary animate-spin-slow" />
            </div>
            <div>
              <CardTitle>Global Control Panel</CardTitle>
              <CardDescription>
                Master controls for all platform features and settings
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {hasChanges && (
              <Badge variant="outline" className="text-amber-500 border-amber-500/50 animate-pulse">
                Unsaved Changes
              </Badge>
            )}
            <Button variant="outline" size="sm" onClick={resetConfig}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
            <Button size="sm" onClick={saveConfig} disabled={!hasChanges || saving}>
              <Save className="w-4 h-4 mr-2" />
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {/* Maintenance Mode Alert */}
        {config.maintenance.enabled && (
          <div className="p-4 bg-destructive/10 border-b border-destructive/20">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              <div>
                <p className="font-medium text-destructive">Maintenance Mode Active</p>
                <p className="text-sm text-muted-foreground">{config.maintenance.message}</p>
              </div>
            </div>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full justify-start rounded-none border-b bg-muted/30 p-0 h-auto overflow-x-auto">
            <TabsTrigger 
              value="features" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary py-3 px-6"
            >
              <Zap className="w-4 h-4 mr-2" />
              Features
            </TabsTrigger>
            <TabsTrigger 
              value="limits"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary py-3 px-6"
            >
              <Gauge className="w-4 h-4 mr-2" />
              Limits
            </TabsTrigger>
            <TabsTrigger 
              value="moderation"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary py-3 px-6"
            >
              <Shield className="w-4 h-4 mr-2" />
              Moderation
            </TabsTrigger>
            <TabsTrigger 
              value="maintenance"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary py-3 px-6"
            >
              <Server className="w-4 h-4 mr-2" />
              Maintenance
            </TabsTrigger>
          </TabsList>

          <TabsContent value="features" className="p-6 mt-0">
            <div className="grid gap-4 md:grid-cols-2">
              <FeatureToggle
                icon={<Sparkles className="w-5 h-5" />}
                label="InphroSync"
                description="Daily sync questions and streak tracking"
                enabled={config.features.inphrosync_enabled}
                onToggle={(v) => updateFeature('inphrosync_enabled', v)}
                color="cyan"
              />
              <FeatureToggle
                icon={<Trophy className="w-5 h-5" />}
                label="Your Turn"
                description="Community question voting slots"
                enabled={config.features.yourturn_enabled}
                onToggle={(v) => updateFeature('yourturn_enabled', v)}
                color="amber"
              />
              <FeatureToggle
                icon={<MessageSquare className="w-5 h-5" />}
                label="AI Chatbot"
                description="InphroneBot AI assistant"
                enabled={config.features.chatbot_enabled}
                onToggle={(v) => updateFeature('chatbot_enabled', v)}
                color="purple"
              />
              <FeatureToggle
                icon={<Gift className="w-5 h-5" />}
                label="Coupons & Rewards"
                description="Reward system and coupon distribution"
                enabled={config.features.coupons_enabled}
                onToggle={(v) => updateFeature('coupons_enabled', v)}
                color="pink"
              />
              <FeatureToggle
                icon={<Users className="w-5 h-5" />}
                label="Referral Program"
                description="User referral and invite system"
                enabled={config.features.referrals_enabled}
                onToggle={(v) => updateFeature('referrals_enabled', v)}
                color="green"
              />
              <FeatureToggle
                icon={<Eye className="w-5 h-5" />}
                label="Opinion Submissions"
                description="Allow users to submit opinions"
                enabled={config.features.opinions_enabled}
                onToggle={(v) => updateFeature('opinions_enabled', v)}
                color="blue"
              />
              <FeatureToggle
                icon={<Bell className="w-5 h-5" />}
                label="Push Notifications"
                description="Browser push notifications"
                enabled={config.features.push_notifications_enabled}
                onToggle={(v) => updateFeature('push_notifications_enabled', v)}
                color="orange"
              />
              <FeatureToggle
                icon={<Activity className="w-5 h-5" />}
                label="Email Notifications"
                description="Email alerts and digests"
                enabled={config.features.email_notifications_enabled}
                onToggle={(v) => updateFeature('email_notifications_enabled', v)}
                color="indigo"
              />
            </div>
          </TabsContent>

          <TabsContent value="limits" className="p-6 mt-0 space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Opinions Per Day
                  </Label>
                  <Badge variant="secondary">{config.limits.opinions_per_day}</Badge>
                </div>
                <Slider
                  value={[config.limits.opinions_per_day]}
                  onValueChange={([v]) => updateLimit('opinions_per_day', v)}
                  min={1}
                  max={50}
                  step={1}
                />
                <p className="text-xs text-muted-foreground">
                  Maximum opinions a user can submit daily
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Streak Reset Hours
                  </Label>
                  <Badge variant="secondary">{config.limits.sync_streak_reset_hours}h</Badge>
                </div>
                <Slider
                  value={[config.limits.sync_streak_reset_hours]}
                  onValueChange={([v]) => updateLimit('sync_streak_reset_hours', v)}
                  min={12}
                  max={72}
                  step={6}
                />
                <p className="text-xs text-muted-foreground">
                  Hours before InphroSync streak resets
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    <Gift className="w-4 h-4" />
                    Coupon Expiry Days
                  </Label>
                  <Badge variant="secondary">{config.limits.coupon_expiry_days} days</Badge>
                </div>
                <Slider
                  value={[config.limits.coupon_expiry_days]}
                  onValueChange={([v]) => updateLimit('coupon_expiry_days', v)}
                  min={7}
                  max={90}
                  step={7}
                />
                <p className="text-xs text-muted-foreground">
                  Default coupon expiration period
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    <Trophy className="w-4 h-4" />
                    Max Your Turn Questions
                  </Label>
                  <Badge variant="secondary">{config.limits.max_yourturn_questions}</Badge>
                </div>
                <Slider
                  value={[config.limits.max_yourturn_questions]}
                  onValueChange={([v]) => updateLimit('max_yourturn_questions', v)}
                  min={1}
                  max={20}
                  step={1}
                />
                <p className="text-xs text-muted-foreground">
                  Maximum questions per Your Turn slot
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="moderation" className="p-6 mt-0">
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <FeatureToggle
                  icon={<Shield className="w-5 h-5" />}
                  label="Auto-Flag Content"
                  description="Automatically flag suspicious content"
                  enabled={config.moderation.auto_flag_enabled}
                  onToggle={(v) => updateModeration('auto_flag_enabled', v)}
                  color="red"
                />
                <FeatureToggle
                  icon={<EyeOff className="w-5 h-5" />}
                  label="Profanity Filter"
                  description="Filter profane language in submissions"
                  enabled={config.moderation.profanity_filter}
                  onToggle={(v) => updateModeration('profanity_filter', v)}
                  color="orange"
                />
                <FeatureToggle
                  icon={<Lock className="w-5 h-5" />}
                  label="Require Approval"
                  description="All content requires admin approval"
                  enabled={config.moderation.require_approval}
                  onToggle={(v) => updateModeration('require_approval', v)}
                  color="yellow"
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Minimum Word Count
                  </Label>
                  <Badge variant="secondary">{config.moderation.min_word_count} words</Badge>
                </div>
                <Slider
                  value={[config.moderation.min_word_count]}
                  onValueChange={([v]) => updateModeration('min_word_count', v)}
                  min={0}
                  max={100}
                  step={5}
                />
                <p className="text-xs text-muted-foreground">
                  Minimum words required for opinion submissions (0 = no limit)
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="maintenance" className="p-6 mt-0">
            <div className="space-y-6">
              <motion.div
                animate={{ 
                  borderColor: config.maintenance.enabled ? 'rgb(239 68 68 / 0.5)' : 'rgb(34 197 94 / 0.3)'
                }}
                className="p-6 rounded-xl border-2 bg-gradient-to-br from-muted/50 to-background"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-xl ${
                      config.maintenance.enabled ? 'bg-destructive/10' : 'bg-green-500/10'
                    }`}>
                      {config.maintenance.enabled 
                        ? <AlertTriangle className="w-6 h-6 text-destructive" />
                        : <CheckCircle className="w-6 h-6 text-green-500" />
                      }
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Maintenance Mode</h3>
                      <p className="text-sm text-muted-foreground">
                        {config.maintenance.enabled 
                          ? 'Platform is currently in maintenance mode'
                          : 'Platform is operating normally'
                        }
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={config.maintenance.enabled}
                    onCheckedChange={(v) => updateMaintenance(v)}
                  />
                </div>

                <Separator className="my-4" />

                <div className="space-y-2">
                  <Label>Maintenance Message</Label>
                  <Input
                    value={config.maintenance.message}
                    onChange={(e) => updateMaintenance(config.maintenance.enabled, e.target.value)}
                    placeholder="Enter message to display during maintenance"
                  />
                  <p className="text-xs text-muted-foreground">
                    This message will be shown to users during maintenance
                  </p>
                </div>
              </motion.div>

              <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-600">Warning</p>
                    <p className="text-sm text-muted-foreground">
                      Enabling maintenance mode will prevent all users from accessing the platform. 
                      Make sure to disable it once maintenance is complete.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

function FeatureToggle({ 
  icon, 
  label, 
  description, 
  enabled, 
  onToggle,
  color 
}: { 
  icon: React.ReactNode;
  label: string;
  description: string;
  enabled: boolean;
  onToggle: (value: boolean) => void;
  color: string;
}) {
  const colorClasses: Record<string, string> = {
    cyan: "from-cyan-500/10 border-cyan-500/30",
    amber: "from-amber-500/10 border-amber-500/30",
    purple: "from-purple-500/10 border-purple-500/30",
    pink: "from-pink-500/10 border-pink-500/30",
    green: "from-green-500/10 border-green-500/30",
    blue: "from-blue-500/10 border-blue-500/30",
    orange: "from-orange-500/10 border-orange-500/30",
    indigo: "from-indigo-500/10 border-indigo-500/30",
    red: "from-red-500/10 border-red-500/30",
    yellow: "from-yellow-500/10 border-yellow-500/30",
  };

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      className={`p-4 rounded-xl border-2 bg-gradient-to-br ${colorClasses[color]} to-background transition-all ${
        enabled ? 'opacity-100' : 'opacity-60'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg bg-${color}-500/20 text-${color}-500`}>
            {icon}
          </div>
          <div>
            <p className="font-medium">{label}</p>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
        <Switch checked={enabled} onCheckedChange={onToggle} />
      </div>
    </motion.div>
  );
}

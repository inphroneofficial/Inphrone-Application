import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bell, Mail, Send, Users, Sparkles, Film, Tv, Music, 
  Gamepad2, Loader2, History, CheckCircle, XCircle, 
  Clock, Target, Zap, BarChart3, MessageSquare, Megaphone,
  AlertTriangle, Calendar, Filter, Search, Eye
} from "lucide-react";

const userTypeOptions = [
  { value: "all", label: "All Users", icon: Users, color: "blue" },
  { value: "audience", label: "Audience Only", icon: Sparkles, color: "cyan" },
  { value: "creator", label: "Creators Only", icon: Film, color: "purple" },
  { value: "studio", label: "Studios/Production", icon: Tv, color: "green" },
  { value: "ott", label: "OTT Platforms", icon: Tv, color: "pink" },
  { value: "tv", label: "TV Networks", icon: Tv, color: "teal" },
  { value: "gaming", label: "Gaming Companies", icon: Gamepad2, color: "red" },
  { value: "music", label: "Music Labels", icon: Music, color: "amber" },
  { value: "non_audience", label: "All Business Users", icon: Film, color: "indigo" },
];

const notificationTypes = [
  { value: "announcement", label: "📢 Announcement", icon: Megaphone },
  { value: "update", label: "🆕 Platform Update", icon: Zap },
  { value: "reminder", label: "⏰ Reminder", icon: Clock },
  { value: "promotion", label: "🎁 Promotion", icon: Sparkles },
  { value: "milestone", label: "🏆 Milestone", icon: Target },
  { value: "alert", label: "⚠️ Alert", icon: AlertTriangle },
];

interface NotificationHistory {
  id: string;
  title: string;
  message: string;
  type: string;
  created_at: string;
  read: boolean;
}

interface ScheduledNotification {
  id: string;
  title: string;
  scheduled_for: string;
  target_type: string;
}

export function EnhancedNotificationBroadcast() {
  const [activeTab, setActiveTab] = useState("compose");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [targetUserType, setTargetUserType] = useState("all");
  const [notificationType, setNotificationType] = useState("announcement");
  const [sendAppNotification, setSendAppNotification] = useState(true);
  const [sendEmailNotification, setSendEmailNotification] = useState(false);
  const [sendPushNotification, setSendPushNotification] = useState(false);
  const [actionUrl, setActionUrl] = useState("");
  const [sending, setSending] = useState(false);
  const [userCounts, setUserCounts] = useState<Record<string, number>>({});
  const [loadingCounts, setLoadingCounts] = useState(false);
  const [notificationHistory, setNotificationHistory] = useState<NotificationHistory[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  useEffect(() => {
    fetchUserCounts();
    fetchNotificationHistory();
  }, []);

  const fetchUserCounts = async () => {
    setLoadingCounts(true);
    try {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_type');
      
      if (profiles) {
        const counts: Record<string, number> = { total_users: profiles.length };
        profiles.forEach((p: any) => {
          counts[p.user_type] = (counts[p.user_type] || 0) + 1;
        });
        setUserCounts(counts);
      }
    } catch (error) {
      console.error("Error fetching user counts:", error);
    } finally {
      setLoadingCounts(false);
    }
  };

  const fetchNotificationHistory = async () => {
    setHistoryLoading(true);
    try {
      // Get recent broadcast notifications (admin-sent)
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('type', 'announcement')
        .order('created_at', { ascending: false })
        .limit(20);
      
      setNotificationHistory(data || []);
    } catch (error) {
      console.error("Error fetching history:", error);
    } finally {
      setHistoryLoading(false);
    }
  };

  const getTargetCount = () => {
    if (targetUserType === "all") return userCounts.total_users || 0;
    if (targetUserType === "non_audience") {
      return (userCounts.total_users || 0) - (userCounts.audience || 0);
    }
    return userCounts[targetUserType] || 0;
  };

  const handleSendNotifications = async () => {
    if (!title.trim() || !message.trim()) {
      toast.error("Please enter both title and message");
      return;
    }

    if (!sendAppNotification && !sendEmailNotification && !sendPushNotification) {
      toast.error("Please select at least one notification method");
      return;
    }

    const targetCount = getTargetCount();
    const confirmMessage = `Send notifications to ${targetCount} users?`;
    
    if (!confirm(confirmMessage)) return;

    setSending(true);
    try {
      // Build user type filter
      let userTypeFilter: string[] = [];
      if (targetUserType === "all") {
        userTypeFilter = ['audience', 'creator', 'studio', 'production', 'ott', 'tv', 'gaming', 'music', 'developer'];
      } else if (targetUserType === "non_audience") {
        userTypeFilter = ['creator', 'studio', 'production', 'ott', 'tv', 'gaming', 'music', 'developer'];
      } else {
        userTypeFilter = [targetUserType];
      }

      // Fetch target users
      const { data: users, error: usersError } = await supabase
        .from('profiles')
        .select('id, email, full_name, user_type')
        .in('user_type', userTypeFilter);

      if (usersError) throw usersError;

      if (!users || users.length === 0) {
        toast.warning("No users found for the selected criteria");
        setSending(false);
        return;
      }

      let successCount = 0;

      // Send app notifications
      if (sendAppNotification) {
        const notifications = users.map(user => ({
          user_id: user.id,
          title,
          message,
          type: notificationType,
          action_url: actionUrl || null
        }));

        const { error: notifError } = await supabase
          .from('notifications')
          .insert(notifications);

        if (!notifError) {
          successCount = users.length;
        }
      }

      // Send email notifications
      if (sendEmailNotification) {
        try {
          await supabase.functions.invoke('send-push-notification', {
            body: {
              userIds: users.map(u => u.id),
              title,
              message,
              url: actionUrl || '/dashboard',
              type: notificationType,
              sendPush: sendPushNotification,
              sendEmail: true,
              sendInApp: false
            }
          });
        } catch (emailError) {
          console.error("Email send error:", emailError);
        }
      }

      toast.success(`Successfully sent to ${successCount} users!`);
      
      // Reset form
      setTitle("");
      setMessage("");
      setActionUrl("");
      setSelectedTemplate(null);
      
      // Refresh history
      fetchNotificationHistory();

    } catch (error) {
      console.error("Error sending notifications:", error);
      toast.error("Failed to send notifications");
    } finally {
      setSending(false);
    }
  };

  const applyTemplate = (template: typeof templates[0]) => {
    setTitle(template.title);
    setMessage(template.message);
    setActionUrl(template.actionUrl);
    if (template.targetType) setTargetUserType(template.targetType);
    setSelectedTemplate(template.id);
  };

  const templates = [
    {
      id: "weekly",
      name: "Weekly Kickoff",
      title: "🎯 New Week Started!",
      message: "A new week has begun! Share your opinions and complete InphroSync to maintain your streak. Your voice shapes entertainment!",
      actionUrl: "/dashboard",
      category: "engagement"
    },
    {
      id: "streak",
      name: "Streak Reminder",
      title: "⚡ Don't Lose Your Streak!",
      message: "Complete today's InphroSync to maintain your streak. It only takes 30 seconds!",
      actionUrl: "/inphrosync",
      category: "engagement"
    },
    {
      id: "insights",
      name: "Creator Insights",
      title: "📊 Fresh Insights Available!",
      message: "New audience opinions are waiting for you. Discover what content people want to see next.",
      actionUrl: "/insights",
      targetType: "non_audience",
      category: "business"
    },
    {
      id: "rewards",
      name: "Rewards Alert",
      title: "🎁 Check Your Rewards!",
      message: "You have new rewards waiting! Check your coupons and start saving today.",
      actionUrl: "/my-coupons",
      category: "rewards"
    },
    {
      id: "yourturn",
      name: "Your Turn Live",
      title: "🏆 Your Turn is LIVE!",
      message: "A new question slot is now active! Vote on the best questions and get featured.",
      actionUrl: "/yourturn",
      category: "engagement"
    },
    {
      id: "maintenance",
      name: "Maintenance Notice",
      title: "🔧 Scheduled Maintenance",
      message: "We're performing scheduled maintenance to improve your experience. The platform will be back shortly.",
      actionUrl: "/dashboard",
      category: "system"
    }
  ];

  return (
    <Card className="border-2 border-primary/20 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-primary/5 via-background to-accent/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <Megaphone className="w-6 h-6 text-primary" />
            </div>
            <div>
              <CardTitle>Notification Command Center</CardTitle>
              <CardDescription>
                Broadcast messages to your entire user base or specific segments
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1">
              <Users className="w-3 h-3" />
              {loadingCounts ? "..." : userCounts.total_users || 0} Total Users
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full justify-start rounded-none border-b bg-muted/30 p-0 h-auto">
            <TabsTrigger 
              value="compose" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3 px-6"
            >
              <Send className="w-4 h-4 mr-2" />
              Compose
            </TabsTrigger>
            <TabsTrigger 
              value="templates"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3 px-6"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Templates
            </TabsTrigger>
            <TabsTrigger 
              value="history"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3 px-6"
            >
              <History className="w-4 h-4 mr-2" />
              History
            </TabsTrigger>
            <TabsTrigger 
              value="analytics"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3 px-6"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="compose" className="p-6 space-y-6 mt-0">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Left Column - Form */}
              <div className="space-y-6">
                {/* Target Selection */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      Target Audience
                    </Label>
                    <Select value={targetUserType} onValueChange={setTargetUserType}>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Select target users" />
                      </SelectTrigger>
                      <SelectContent>
                        {userTypeOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            <div className="flex items-center gap-2">
                              <option.icon className="w-4 h-4" />
                              <span>{option.label}</span>
                              <Badge variant="secondary" className="ml-auto text-xs">
                                {option.value === 'all' 
                                  ? userCounts.total_users || 0
                                  : option.value === 'non_audience'
                                  ? (userCounts.total_users || 0) - (userCounts.audience || 0)
                                  : userCounts[option.value] || 0}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      Notification Type
                    </Label>
                    <Select value={notificationType} onValueChange={setNotificationType}>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {notificationTypes.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            <div className="flex items-center gap-2">
                              {type.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Notification Methods */}
                <div className="p-4 rounded-xl bg-muted/50 border">
                  <Label className="text-sm font-medium mb-3 block">Delivery Channels</Label>
                  <div className="grid grid-cols-3 gap-4">
                    <motion.div 
                      whileHover={{ scale: 1.02 }}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        sendAppNotification 
                          ? 'border-primary bg-primary/5' 
                          : 'border-muted hover:border-primary/50'
                      }`}
                      onClick={() => setSendAppNotification(!sendAppNotification)}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <Bell className={`w-6 h-6 ${sendAppNotification ? 'text-primary' : 'text-muted-foreground'}`} />
                        <span className="text-sm font-medium">In-App</span>
                        <Switch checked={sendAppNotification} onCheckedChange={setSendAppNotification} />
                      </div>
                    </motion.div>

                    <motion.div 
                      whileHover={{ scale: 1.02 }}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        sendEmailNotification 
                          ? 'border-blue-500 bg-blue-500/5' 
                          : 'border-muted hover:border-blue-500/50'
                      }`}
                      onClick={() => setSendEmailNotification(!sendEmailNotification)}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <Mail className={`w-6 h-6 ${sendEmailNotification ? 'text-blue-500' : 'text-muted-foreground'}`} />
                        <span className="text-sm font-medium">Email</span>
                        <Switch checked={sendEmailNotification} onCheckedChange={setSendEmailNotification} />
                      </div>
                    </motion.div>

                    <motion.div 
                      whileHover={{ scale: 1.02 }}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        sendPushNotification 
                          ? 'border-green-500 bg-green-500/5' 
                          : 'border-muted hover:border-green-500/50'
                      }`}
                      onClick={() => setSendPushNotification(!sendPushNotification)}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <Zap className={`w-6 h-6 ${sendPushNotification ? 'text-green-500' : 'text-muted-foreground'}`} />
                        <span className="text-sm font-medium">Push</span>
                        <Switch checked={sendPushNotification} onCheckedChange={setSendPushNotification} />
                      </div>
                    </motion.div>
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g., 🎉 New Feature Alert!"
                      maxLength={100}
                      className="h-12"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{title.length}/100 characters</span>
                      {title.length > 80 && <span className="text-amber-500">Getting long</span>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Write your notification message here..."
                      rows={4}
                      maxLength={500}
                      className="resize-none"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{message.length}/500 characters</span>
                      {message.length > 400 && <span className="text-amber-500">Getting long</span>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="action-url">Action URL (optional)</Label>
                    <Input
                      id="action-url"
                      value={actionUrl}
                      onChange={(e) => setActionUrl(e.target.value)}
                      placeholder="e.g., /dashboard or /inphrosync"
                      className="h-12"
                    />
                  </div>
                </div>
              </div>

              {/* Right Column - Preview */}
              <div className="space-y-4">
                <Label>Live Preview</Label>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${title}-${message}`}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="relative"
                  >
                    {/* Phone Frame */}
                    <div className="relative mx-auto w-72 h-[500px] rounded-[40px] bg-gradient-to-b from-gray-800 to-gray-900 p-2 shadow-xl">
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-900 rounded-b-2xl z-10" />
                      <div className="w-full h-full rounded-[32px] bg-background overflow-hidden">
                        {/* Status bar */}
                        <div className="h-10 bg-muted/50 flex items-center justify-between px-6 text-xs">
                          <span>9:41</span>
                          <div className="flex items-center gap-1">
                            <div className="w-4 h-2 bg-foreground/50 rounded-sm" />
                          </div>
                        </div>
                        
                        {/* Notification */}
                        <div className="p-4 pt-8">
                          <motion.div 
                            initial={{ y: -20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/5 border border-primary/20 shadow-lg"
                          >
                            <div className="flex items-start gap-3">
                              <div className="p-2 rounded-xl bg-primary/20">
                                <Bell className="w-5 h-5 text-primary" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold truncate">{title || "Notification Title"}</p>
                                <p className="text-sm text-muted-foreground line-clamp-3 mt-1">
                                  {message || "Your notification message will appear here..."}
                                </p>
                                <p className="text-xs text-muted-foreground mt-2">Just now</p>
                              </div>
                            </div>
                          </motion.div>

                          {/* Target Info */}
                          <div className="mt-6 p-4 rounded-xl bg-muted/50 border">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium">Sending to</span>
                              <Badge variant="secondary">
                                {getTargetCount()} users
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex -space-x-2">
                                {[...Array(Math.min(4, getTargetCount()))].map((_, i) => (
                                  <div key={i} className="w-8 h-8 rounded-full bg-primary/20 border-2 border-background" />
                                ))}
                              </div>
                              {getTargetCount() > 4 && (
                                <span className="text-xs text-muted-foreground">
                                  +{getTargetCount() - 4} more
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* Send Button */}
                <Button 
                  onClick={handleSendNotifications}
                  disabled={sending || (!title.trim() || !message.trim())}
                  className="w-full h-14 text-lg gap-3"
                  size="lg"
                >
                  {sending ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Sending to {getTargetCount()} users...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Send to {getTargetCount()} Users
                    </>
                  )}
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="templates" className="p-6 mt-0">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {templates.map((template) => (
                <motion.div
                  key={template.id}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card 
                    className={`cursor-pointer transition-all hover:shadow-lg ${
                      selectedTemplate === template.id 
                        ? 'ring-2 ring-primary border-primary' 
                        : 'hover:border-primary/50'
                    }`}
                    onClick={() => applyTemplate(template)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">{template.name}</CardTitle>
                        <Badge variant="outline" className="text-xs capitalize">
                          {template.category}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="font-medium text-sm mb-1">{template.title}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2">{template.message}</p>
                      {template.targetType && (
                        <Badge className="mt-2" variant="secondary">
                          {userTypeOptions.find(o => o.value === template.targetType)?.label}
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="history" className="p-6 mt-0">
            <ScrollArea className="h-[500px]">
              {historyLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />
                  ))}
                </div>
              ) : notificationHistory.length === 0 ? (
                <div className="text-center py-12">
                  <History className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No broadcast history yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {notificationHistory.map((notif) => (
                    <motion.div
                      key={notif.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium">{notif.title}</p>
                          <p className="text-sm text-muted-foreground line-clamp-2">{notif.message}</p>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {new Date(notif.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="analytics" className="p-6 mt-0">
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-primary">{notificationHistory.length}</div>
                    <p className="text-sm text-muted-foreground mt-1">Total Broadcasts</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-green-500">{userCounts.total_users || 0}</div>
                    <p className="text-sm text-muted-foreground mt-1">Total Reach</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-amber-500">
                      {Math.round((notificationHistory.filter(n => n.read).length / (notificationHistory.length || 1)) * 100)}%
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">Avg. Open Rate</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

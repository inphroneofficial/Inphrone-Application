import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Bell, Mail, Send, Users, Sparkles, Film, Tv, Music, Gamepad2, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

const userTypeOptions = [
  { value: "all", label: "All Users", icon: Users },
  { value: "audience", label: "Audience Only", icon: Sparkles },
  { value: "creator", label: "Creators Only", icon: Film },
  { value: "studio", label: "Studios/Production", icon: Tv },
  { value: "ott", label: "OTT Platforms", icon: Tv },
  { value: "tv", label: "TV Networks", icon: Tv },
  { value: "gaming", label: "Gaming Companies", icon: Gamepad2 },
  { value: "music", label: "Music Labels", icon: Music },
  { value: "non_audience", label: "All Non-Audience (Creators/Studios/etc)", icon: Film },
];

const notificationTypes = [
  { value: "announcement", label: "📢 Announcement" },
  { value: "update", label: "🆕 Platform Update" },
  { value: "reminder", label: "⏰ Reminder" },
  { value: "promotion", label: "🎁 Promotion" },
  { value: "milestone", label: "🏆 Milestone" },
];

export function NotificationBroadcast() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [targetUserType, setTargetUserType] = useState("all");
  const [notificationType, setNotificationType] = useState("announcement");
  const [sendAppNotification, setSendAppNotification] = useState(true);
  const [sendEmailNotification, setSendEmailNotification] = useState(false);
  const [actionUrl, setActionUrl] = useState("");
  const [sending, setSending] = useState(false);
  const [userCounts, setUserCounts] = useState<Record<string, number>>({});
  const [loadingCounts, setLoadingCounts] = useState(false);

  // Fetch user counts when component mounts or target changes
  const fetchUserCounts = async () => {
    setLoadingCounts(true);
    try {
      const { data, error } = await supabase.rpc('get_user_counts');
      if (error) throw error;
      if (data && data.length > 0) {
        setUserCounts(data[0]);
      }
    } catch (error) {
      console.error("Error fetching user counts:", error);
    } finally {
      setLoadingCounts(false);
    }
  };

  useState(() => {
    fetchUserCounts();
  });

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

    if (!sendAppNotification && !sendEmailNotification) {
      toast.error("Please select at least one notification method");
      return;
    }

    const confirmMessage = `Send ${sendAppNotification ? "app" : ""}${sendAppNotification && sendEmailNotification ? " and " : ""}${sendEmailNotification ? "email" : ""} notifications to ${getTargetCount()} users?`;
    
    if (!confirm(confirmMessage)) return;

    setSending(true);
    try {
      // Build user type filter
      let userTypeFilter: string[] = [];
      if (targetUserType === "all") {
        userTypeFilter = ['audience', 'creator', 'studio', 'production', 'ott', 'tv', 'gaming', 'music'];
      } else if (targetUserType === "non_audience") {
        userTypeFilter = ['creator', 'studio', 'production', 'ott', 'tv', 'gaming', 'music'];
      } else {
        userTypeFilter = [targetUserType];
      }

      // Fetch target users
      const { data: users, error: usersError } = await supabase
        .from('profiles')
        .select('id, email, full_name, user_type, settings')
        .in('user_type', userTypeFilter);

      if (usersError) throw usersError;

      if (!users || users.length === 0) {
        toast.warning("No users found for the selected criteria");
        setSending(false);
        return;
      }

      let appNotifsSent = 0;
      let emailsSent = 0;
      let emailsFailed = 0;

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

        if (notifError) {
          console.error("Error inserting notifications:", notifError);
          toast.error("Failed to send some app notifications");
        } else {
          appNotifsSent = users.length;
        }
      }

      // Send email notifications using the consolidated push notification function
      if (sendEmailNotification) {
        try {
          console.log("Sending email notifications to", users.length, "users");
          const { data: result, error: pushError } = await supabase.functions.invoke('send-push-notification', {
            body: {
              userIds: users.map(u => u.id),
              title,
              message,
              url: actionUrl || '/dashboard',
              type: notificationType,
              sendPush: false,
              sendEmail: true,
              sendInApp: false
            }
          });

          console.log("Email notification result:", result, "error:", pushError);

          if (pushError) {
            console.error("Error sending emails:", pushError);
            emailsFailed = users.length;
          } else if (result) {
            emailsSent = result.results?.emailSent || 0;
            emailsFailed = result.results?.emailFailed || 0;
            console.log(`Emails sent: ${emailsSent}, failed: ${emailsFailed}`);
          }
        } catch (emailError) {
          console.error("Failed to send emails:", emailError);
          emailsFailed = users.length;
        }
      }

      // Show success message
      let successMsg = "";
      if (appNotifsSent > 0) successMsg += `${appNotifsSent} app notifications sent. `;
      if (emailsSent > 0) successMsg += `${emailsSent} emails sent. `;
      if (emailsFailed > 0) successMsg += `${emailsFailed} emails failed.`;
      
      toast.success(successMsg || "Notifications sent successfully!");

      // Reset form
      setTitle("");
      setMessage("");
      setActionUrl("");

    } catch (error) {
      console.error("Error sending notifications:", error);
      toast.error("Failed to send notifications");
    } finally {
      setSending(false);
    }
  };

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-primary" />
          Broadcast Notifications
        </CardTitle>
        <CardDescription>
          Send notifications to all users or specific user types
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Target Selection */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Target Users</Label>
            <Select value={targetUserType} onValueChange={setTargetUserType}>
              <SelectTrigger>
                <SelectValue placeholder="Select target users" />
              </SelectTrigger>
              <SelectContent>
                {userTypeOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      <option.icon className="w-4 h-4" />
                      {option.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {loadingCounts ? "Loading..." : `${getTargetCount()} users will receive this notification`}
            </p>
          </div>

          <div className="space-y-2">
            <Label>Notification Type</Label>
            <Select value={notificationType} onValueChange={setNotificationType}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {notificationTypes.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Notification Methods */}
        <div className="flex flex-wrap gap-6 p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-3">
            <Switch 
              id="app-notif"
              checked={sendAppNotification}
              onCheckedChange={setSendAppNotification}
            />
            <Label htmlFor="app-notif" className="flex items-center gap-2 cursor-pointer">
              <Bell className="w-4 h-4 text-primary" />
              App Notification
            </Label>
          </div>
          
          <div className="flex items-center gap-3">
            <Switch 
              id="email-notif"
              checked={sendEmailNotification}
              onCheckedChange={setSendEmailNotification}
            />
            <Label htmlFor="email-notif" className="flex items-center gap-2 cursor-pointer">
              <Mail className="w-4 h-4 text-blue-500" />
              Email Notification
            </Label>
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
            />
            <p className="text-xs text-muted-foreground">{title.length}/100 characters</p>
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
            />
            <p className="text-xs text-muted-foreground">{message.length}/500 characters</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="action-url">Action URL (optional)</Label>
            <Input
              id="action-url"
              value={actionUrl}
              onChange={(e) => setActionUrl(e.target.value)}
              placeholder="e.g., /dashboard or /inphrosync"
            />
            <p className="text-xs text-muted-foreground">
              Where users will be directed when clicking the notification
            </p>
          </div>
        </div>

        {/* Preview */}
        {(title || message) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg border border-primary/20"
          >
            <p className="text-sm font-medium text-muted-foreground mb-2">Preview:</p>
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-full bg-primary/20">
                <Bell className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold">{title || "Title"}</h4>
                <p className="text-sm text-muted-foreground">{message || "Message content"}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Send Button */}
        <Button 
          onClick={handleSendNotifications}
          disabled={sending || (!title.trim() || !message.trim())}
          className="w-full gap-2"
          size="lg"
        >
          {sending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Send Notification to {getTargetCount()} Users
            </>
          )}
        </Button>

        {/* Quick Templates */}
        <div className="pt-4 border-t">
          <p className="text-sm font-medium mb-3">Quick Templates:</p>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setTitle("🎯 New Week Started!");
                setMessage("A new week has begun! Share your opinions and complete InphroSync to maintain your streak. Your voice shapes entertainment!");
                setActionUrl("/dashboard");
              }}
            >
              Weekly Start
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setTitle("⚡ Don't Lose Your Streak!");
                setMessage("Complete today's InphroSync to maintain your streak. It only takes 30 seconds!");
                setActionUrl("/inphrosync");
              }}
            >
              Streak Reminder
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setTitle("📊 Fresh Insights Available!");
                setMessage("New audience opinions are waiting for you. Discover what content people want to see next.");
                setActionUrl("/insights");
                setTargetUserType("non_audience");
              }}
            >
              Creator Insights
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setTitle("🎁 Check Your Rewards!");
                setMessage("You have new rewards waiting! Check your coupons and start saving today.");
                setActionUrl("/my-coupons");
              }}
            >
              Rewards Alert
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
import { useState, useEffect } from "react";
import { Bell, Trash2, X, Sparkles, Heart, Trophy, MessageCircle, Star, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  action_url: string | null;
  created_at: string;
}

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'like':
    case 'upvote':
      return <Heart className="h-4 w-4 text-pink-500" />;
    case 'achievement':
    case 'badge':
      return <Trophy className="h-4 w-4 text-yellow-500" />;
    case 'streak':
      return <Zap className="h-4 w-4 text-orange-500" />;
    case 'weekly_start':
    case 'milestone':
      return <Star className="h-4 w-4 text-purple-500" />;
    case 'inphrosync':
      return <Sparkles className="h-4 w-4 text-cyan-500" />;
    default:
      return <MessageCircle className="h-4 w-4 text-primary" />;
  }
};

const getNotificationGradient = (type: string) => {
  switch (type) {
    case 'like':
    case 'upvote':
      return 'from-pink-500/20 to-rose-500/10';
    case 'achievement':
    case 'badge':
      return 'from-yellow-500/20 to-amber-500/10';
    case 'streak':
      return 'from-orange-500/20 to-red-500/10';
    case 'weekly_start':
    case 'milestone':
      return 'from-purple-500/20 to-indigo-500/10';
    case 'inphrosync':
      return 'from-cyan-500/20 to-blue-500/10';
    default:
      return 'from-primary/20 to-accent/10';
  }
};

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [hasNewNotification, setHasNewNotification] = useState(false);

  useEffect(() => {
    fetchNotifications();

    // Subscribe to realtime notifications
    const channel = supabase
      .channel('notifications')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'notifications' },
        (payload) => {
          // Filter out coupon expiry notifications
          const newNotif = payload.new as Notification;
          if (newNotif.type !== 'coupon_expiry' && newNotif.type !== 'coupon') {
            setHasNewNotification(true);
            fetchNotifications();
            // Trigger bell animation
            setTimeout(() => setHasNewNotification(false), 2000);
          }
        }
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'notifications' },
        () => fetchNotifications()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchNotifications = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Fetch notifications EXCLUDING coupon-related types
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .not('type', 'in', '("coupon_expiry","coupon","coupon_reward")')
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Error fetching notifications:', error);
      return;
    }

    setNotifications(data || []);
    setUnreadCount(data?.filter(n => !n.read).length || 0);
  };

  const markAsRead = async (notificationId: string) => {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);

    if (error) {
      toast.error('Failed to mark notification as read');
      return;
    }

    fetchNotifications();
  };

  const markAllAsRead = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', user.id)
      .eq('read', false);

    if (error) {
      toast.error('Failed to mark all as read');
      return;
    }

    toast.success('All notifications marked as read');
    fetchNotifications();
  };

  const deleteNotification = async (notificationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId);

    if (error) {
      toast.error('Failed to delete notification');
      return;
    }

    toast.success('Notification deleted');
    fetchNotifications();
  };

  const clearAllNotifications = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('user_id', user.id)
      .not('type', 'in', '("coupon_expiry","coupon","coupon_reward")');

    if (error) {
      toast.error('Failed to clear notifications');
      return;
    }

    toast.success('All notifications cleared');
    fetchNotifications();
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative text-foreground hover:bg-muted group"
        >
          <motion.div
            animate={hasNewNotification ? {
              rotate: [0, -15, 15, -15, 15, 0],
              scale: [1, 1.2, 1.2, 1.2, 1.2, 1],
            } : {}}
            transition={{ duration: 0.5 }}
          >
            <Bell className="h-5 w-5 transition-transform group-hover:scale-110" />
          </motion.div>
          <AnimatePresence>
            {unreadCount > 0 && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              >
                <Badge 
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-gradient-to-r from-red-500 to-pink-500 text-white border-0 shadow-lg shadow-red-500/30"
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Badge>
              </motion.div>
            )}
          </AnimatePresence>
          {hasNewNotification && (
            <motion.div
              className="absolute inset-0 rounded-full bg-primary/20"
              initial={{ scale: 1, opacity: 1 }}
              animate={{ scale: 2, opacity: 0 }}
              transition={{ duration: 0.8, repeat: 2 }}
            />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-96 p-0 max-h-[70vh] overflow-hidden border-2 border-primary/20 shadow-2xl shadow-primary/10" 
        align="end"
        side="bottom"
        sideOffset={8}
        collisionPadding={16}
      >
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-primary/10 to-accent/10 sticky top-0 z-10">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <h3 className="font-bold text-base">Notifications</h3>
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <Button variant="ghost" size="sm" onClick={markAllAsRead} className="text-xs h-7 px-2 hover:bg-primary/10">
                  Mark all read
                </Button>
              )}
              {notifications.length > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={clearAllNotifications}
                  className="text-xs h-7 px-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  Clear all
                </Button>
              )}
            </div>
          </div>
          <ScrollArea className="h-[calc(70vh-80px)] max-h-[400px]">
            {notifications.length === 0 ? (
              <motion.div 
                className="p-8 text-center"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <div className="relative inline-block">
                  <Bell className="h-16 w-16 mx-auto mb-3 text-muted-foreground/30" />
                  <motion.div
                    className="absolute -top-1 -right-1"
                    animate={{ rotate: [0, 20, -20, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  >
                    <Sparkles className="h-6 w-6 text-primary/50" />
                  </motion.div>
                </div>
                <p className="text-muted-foreground font-medium">No notifications yet</p>
                <p className="text-xs text-muted-foreground/70 mt-1">We'll notify you when something happens!</p>
              </motion.div>
            ) : (
              <div className="divide-y divide-border/50">
                <AnimatePresence>
                  {notifications.map((notification, index) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20, height: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`p-4 hover:bg-muted/50 cursor-pointer transition-all relative group ${
                        !notification.read ? `bg-gradient-to-r ${getNotificationGradient(notification.type)}` : ''
                      }`}
                      onClick={() => !notification.read && markAsRead(notification.id)}
                    >
                      <div className="flex items-start gap-3">
                        <motion.div 
                          className={`p-2 rounded-full ${!notification.read ? 'bg-background shadow-md' : 'bg-muted'}`}
                          whileHover={{ scale: 1.1 }}
                        >
                          {getNotificationIcon(notification.type)}
                        </motion.div>
                        <div className="flex-1 space-y-1 pr-8 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-semibold truncate">{notification.title}</h4>
                            {!notification.read && (
                              <motion.span 
                                className="h-2 w-2 rounded-full bg-primary flex-shrink-0"
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                              />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">{notification.message}</p>
                          <p className="text-xs text-muted-foreground/70">
                            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                          </p>
                        </div>
                        <motion.div
                          initial={{ opacity: 0 }}
                          whileHover={{ opacity: 1 }}
                        >
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-2 top-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive"
                            onClick={(e) => deleteNotification(notification.id, e)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </motion.div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </ScrollArea>
        </motion.div>
      </PopoverContent>
    </Popover>
  );
}

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import { 
  History, Search, RefreshCw, User, Shield, Trash2, 
  Edit, Plus, Eye, Settings, Bell, Gift, Clock,
  Filter, Calendar, AlertTriangle, CheckCircle
} from "lucide-react";
import { toast } from "sonner";

interface AuditLog {
  id: string;
  action_type: string;
  action_description: string;
  performed_by: string;
  target_user?: string;
  target_resource?: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export function AdminActivityLog() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("7d");

  useEffect(() => {
    fetchLogs();
  }, [dateFilter]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      // Calculate date range
      const now = new Date();
      let startDate = new Date();
      switch (dateFilter) {
        case '1d': startDate.setDate(now.getDate() - 1); break;
        case '7d': startDate.setDate(now.getDate() - 7); break;
        case '30d': startDate.setDate(now.getDate() - 30); break;
        case 'all': startDate = new Date('2020-01-01'); break;
      }

      // Fetch various activity types to build audit log
      const [
        deletedUsers,
        contentFlags,
        notifications,
        couponActivity
      ] = await Promise.all([
        // Deleted accounts
        supabase.from("deleted_accounts_log")
          .select("*")
          .gte("deleted_at", startDate.toISOString())
          .order("deleted_at", { ascending: false })
          .limit(50),
        // Content moderation
        supabase.from("content_flags")
          .select("*, profiles!content_flags_reporter_id_fkey(full_name)")
          .gte("created_at", startDate.toISOString())
          .order("created_at", { ascending: false })
          .limit(50),
        // Admin notifications (broadcast type)
        supabase.from("notifications")
          .select("*")
          .eq("type", "announcement")
          .gte("created_at", startDate.toISOString())
          .order("created_at", { ascending: false })
          .limit(20),
        // Coupon claims
        supabase.from("coupons")
          .select("*, profiles(full_name)")
          .gte("created_at", startDate.toISOString())
          .order("created_at", { ascending: false })
          .limit(30)
      ]);

      const auditLogs: AuditLog[] = [];

      // Process deleted accounts
      deletedUsers.data?.forEach((item: any) => {
        auditLogs.push({
          id: `del-${item.id}`,
          action_type: 'user_deletion',
          action_description: `User account deleted: ${item.email || 'Unknown'}`,
          performed_by: 'System/Admin',
          target_user: item.email,
          timestamp: item.deleted_at,
          metadata: { reason: item.reason }
        });
      });

      // Process content flags
      contentFlags.data?.forEach((item: any) => {
        auditLogs.push({
          id: `flag-${item.id}`,
          action_type: 'content_flag',
          action_description: `Content flagged: ${item.reason}`,
          performed_by: item.profiles?.full_name || 'Anonymous',
          target_resource: item.content_type,
          timestamp: item.created_at,
          metadata: { status: item.status }
        });
      });

      // Process notifications
      notifications.data?.forEach((item: any) => {
        auditLogs.push({
          id: `notif-${item.id}`,
          action_type: 'notification_sent',
          action_description: `Broadcast: ${item.title}`,
          performed_by: 'Admin',
          timestamp: item.created_at,
          metadata: { message: item.message }
        });
      });

      // Process coupon activity
      couponActivity.data?.forEach((item: any) => {
        auditLogs.push({
          id: `coupon-${item.id}`,
          action_type: 'coupon_claimed',
          action_description: `Coupon claimed by ${item.profiles?.full_name || 'User'}`,
          performed_by: item.profiles?.full_name || 'User',
          target_resource: item.merchant_name,
          timestamp: item.created_at
        });
      });

      // Sort by timestamp
      auditLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      setLogs(auditLogs);
    } catch (error) {
      console.error("Error fetching audit logs:", error);
      toast.error("Failed to fetch activity logs");
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'user_deletion': return <Trash2 className="w-4 h-4 text-red-500" />;
      case 'content_flag': return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'notification_sent': return <Bell className="w-4 h-4 text-blue-500" />;
      case 'coupon_claimed': return <Gift className="w-4 h-4 text-pink-500" />;
      case 'role_change': return <Shield className="w-4 h-4 text-purple-500" />;
      case 'settings_update': return <Settings className="w-4 h-4 text-gray-500" />;
      default: return <History className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getActionColor = (type: string) => {
    switch (type) {
      case 'user_deletion': return 'bg-red-500/10 text-red-600 border-red-500/30';
      case 'content_flag': return 'bg-amber-500/10 text-amber-600 border-amber-500/30';
      case 'notification_sent': return 'bg-blue-500/10 text-blue-600 border-blue-500/30';
      case 'coupon_claimed': return 'bg-pink-500/10 text-pink-600 border-pink-500/30';
      case 'role_change': return 'bg-purple-500/10 text-purple-600 border-purple-500/30';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const seconds = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const actionTypes = [
    { value: 'all', label: 'All Actions' },
    { value: 'user_deletion', label: 'User Deletions' },
    { value: 'content_flag', label: 'Content Flags' },
    { value: 'notification_sent', label: 'Notifications' },
    { value: 'coupon_claimed', label: 'Coupon Claims' },
  ];

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.action_description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.performed_by.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.target_user?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    
    const matchesType = filterType === 'all' || log.action_type === filterType;
    
    return matchesSearch && matchesType;
  });

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader className="bg-gradient-to-r from-primary/5 via-background to-accent/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <History className="w-6 h-6 text-primary" />
            </div>
            <div>
              <CardTitle>Activity Audit Log</CardTitle>
              <CardDescription>
                Track all administrative actions and platform events
              </CardDescription>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={fetchLogs} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-6">
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search activity..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-48">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              {actionTypes.map(type => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-40">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1d">Last 24 hours</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <Card className="bg-muted/30">
            <CardContent className="pt-4 pb-4 text-center">
              <p className="text-2xl font-bold">{filteredLogs.length}</p>
              <p className="text-xs text-muted-foreground">Total Events</p>
            </CardContent>
          </Card>
          <Card className="bg-red-500/5 border-red-500/20">
            <CardContent className="pt-4 pb-4 text-center">
              <p className="text-2xl font-bold text-red-500">
                {filteredLogs.filter(l => l.action_type === 'user_deletion').length}
              </p>
              <p className="text-xs text-muted-foreground">Deletions</p>
            </CardContent>
          </Card>
          <Card className="bg-amber-500/5 border-amber-500/20">
            <CardContent className="pt-4 pb-4 text-center">
              <p className="text-2xl font-bold text-amber-500">
                {filteredLogs.filter(l => l.action_type === 'content_flag').length}
              </p>
              <p className="text-xs text-muted-foreground">Flags</p>
            </CardContent>
          </Card>
          <Card className="bg-blue-500/5 border-blue-500/20">
            <CardContent className="pt-4 pb-4 text-center">
              <p className="text-2xl font-bold text-blue-500">
                {filteredLogs.filter(l => l.action_type === 'notification_sent').length}
              </p>
              <p className="text-xs text-muted-foreground">Broadcasts</p>
            </CardContent>
          </Card>
        </div>

        {/* Activity Log */}
        <ScrollArea className="h-[500px] rounded-lg border">
          {loading ? (
            <div className="space-y-3 p-4">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-12">
              <History className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No activity found</p>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              <AnimatePresence>
                {filteredLogs.map((log, index) => (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: index * 0.02 }}
                    className="p-4 rounded-lg border bg-card hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-2 rounded-lg bg-muted">
                        {getActionIcon(log.action_type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium truncate">{log.action_description}</p>
                          <Badge className={`text-xs ${getActionColor(log.action_type)}`}>
                            {log.action_type.replace('_', ' ')}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {log.performed_by}
                          </span>
                          {log.target_user && (
                            <span>→ {log.target_user}</span>
                          )}
                          {log.target_resource && (
                            <span>• {log.target_resource}</span>
                          )}
                        </div>
                      </div>
                      <div className="text-right text-sm text-muted-foreground whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatTimeAgo(log.timestamp)}
                        </div>
                        <p className="text-xs mt-1">
                          {new Date(log.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

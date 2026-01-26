import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminCleanupTool } from "@/components/admin/AdminCleanupTool";
import { UserManagement } from "@/components/admin/UserManagement";
import { ContentModeration } from "@/components/admin/ContentModeration";
import { CouponManagement } from "@/components/admin/CouponManagement";
import { EnhancedNotificationBroadcast } from "@/components/admin/EnhancedNotificationBroadcast";
import { GlobalControlPanel } from "@/components/admin/GlobalControlPanel";
import { AdminCommandCenter } from "@/components/admin/AdminCommandCenter";
import { AnalyticsDashboard } from "@/components/admin/AnalyticsDashboard";
import { AdminRolesManagement } from "@/components/admin/AdminRolesManagement";
import { DatabaseHealth } from "@/components/admin/DatabaseHealth";
import { AdminActivityLog } from "@/components/admin/AdminActivityLog";
import { ReferralManagement } from "@/components/admin/ReferralManagement";
import { QuickActions } from "@/components/admin/QuickActions";
import { InphroSyncAdmin } from "@/components/inphrosync/InphroSyncAdmin";
import { InphroSyncAnalytics } from "@/components/inphrosync/InphroSyncAnalytics";
import { YourTurnManagement } from "@/components/admin/YourTurnManagement";
import { HypeItManagement } from "@/components/admin/HypeItManagement";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { 
  Shield, Trash2, BarChart3, Bell, Trophy, Settings, Zap, Users, 
  Eye, Database, History, Gift, Share2, Crown, Server, Flame, ChevronDown
} from "lucide-react";

export default function Admin() {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [clearingData, setClearingData] = useState(false);
  const [activeSection, setActiveSection] = useState("command");

  const handleClearInphroSyncData = async () => {
    if (!confirm("Are you sure you want to clear ALL InphroSync responses? This action cannot be undone.")) {
      return;
    }

    setClearingData(true);
    try {
      const { error: deleteError } = await supabase
        .from("inphrosync_responses")
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000");

      if (deleteError) throw deleteError;

      toast.success("All InphroSync responses cleared successfully");
    } catch (error) {
      console.error("Error clearing InphroSync data:", error);
      toast.error("Failed to clear InphroSync data");
    } finally {
      setClearingData(false);
    }
  };

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          navigate("/auth");
          return;
        }

        const { data: roles } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .eq("role", "admin")
          .maybeSingle();

        if (!roles) {
          toast.error("Access denied: Admin privileges required");
          navigate("/dashboard");
          return;
        }

        setIsAdmin(true);
      } catch (error) {
        console.error("Admin check error:", error);
        navigate("/dashboard");
      } finally {
        setLoading(false);
      }
    };

    checkAdmin();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
            <Shield className="w-8 h-8 text-primary animate-pulse" />
          </div>
          <p className="text-muted-foreground">Verifying admin access...</p>
        </motion.div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background pt-16">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-8"
        >
          <div className="p-3 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20">
            <Crown className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Admin Command Center
            </h1>
            <p className="text-muted-foreground">Complete control over the Inphrone platform</p>
          </div>
        </motion.div>

        <Tabs value={activeSection} onValueChange={setActiveSection} className="space-y-6">
          {/* Mobile dropdown selector */}
          <div className="block md:hidden mb-4">
            <Select value={activeSection} onValueChange={setActiveSection}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Section" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="command">
                  <div className="flex items-center gap-2"><Zap className="w-4 h-4" /> Command Center</div>
                </SelectItem>
                <SelectItem value="analytics">
                  <div className="flex items-center gap-2"><BarChart3 className="w-4 h-4" /> Analytics</div>
                </SelectItem>
                <SelectItem value="users">
                  <div className="flex items-center gap-2"><Users className="w-4 h-4" /> Users</div>
                </SelectItem>
                <SelectItem value="roles">
                  <div className="flex items-center gap-2"><Shield className="w-4 h-4" /> Roles</div>
                </SelectItem>
                <SelectItem value="broadcast">
                  <div className="flex items-center gap-2"><Bell className="w-4 h-4" /> Broadcast</div>
                </SelectItem>
                <SelectItem value="controls">
                  <div className="flex items-center gap-2"><Settings className="w-4 h-4" /> Controls</div>
                </SelectItem>
                <SelectItem value="content">
                  <div className="flex items-center gap-2"><Eye className="w-4 h-4" /> Content</div>
                </SelectItem>
                <SelectItem value="engagement">
                  <div className="flex items-center gap-2"><Trophy className="w-4 h-4" /> Engagement</div>
                </SelectItem>
                <SelectItem value="hype">
                  <div className="flex items-center gap-2"><Flame className="w-4 h-4 text-orange-500" /> Hype It</div>
                </SelectItem>
                <SelectItem value="rewards">
                  <div className="flex items-center gap-2"><Gift className="w-4 h-4" /> Rewards</div>
                </SelectItem>
                <SelectItem value="system">
                  <div className="flex items-center gap-2"><Server className="w-4 h-4" /> System</div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Desktop tabs - hidden on mobile */}
          <div className="hidden md:block overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0 pb-2">
            <TabsList className="inline-flex min-w-max gap-1 p-1.5 bg-muted/50 rounded-xl">
              <TabsTrigger value="command" className="gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg px-4">
                <Zap className="w-4 h-4" />
                <span>Command</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg px-4">
                <BarChart3 className="w-4 h-4" />
                <span>Analytics</span>
              </TabsTrigger>
              <TabsTrigger value="users" className="gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg px-4">
                <Users className="w-4 h-4" />
                <span>Users</span>
              </TabsTrigger>
              <TabsTrigger value="roles" className="gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg px-4">
                <Shield className="w-4 h-4" />
                <span>Roles</span>
              </TabsTrigger>
              <TabsTrigger value="broadcast" className="gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg px-4">
                <Bell className="w-4 h-4" />
                <span>Broadcast</span>
              </TabsTrigger>
              <TabsTrigger value="controls" className="gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg px-4">
                <Settings className="w-4 h-4" />
                <span>Controls</span>
              </TabsTrigger>
              <TabsTrigger value="content" className="gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg px-4">
                <Eye className="w-4 h-4" />
                <span>Content</span>
              </TabsTrigger>
              <TabsTrigger value="engagement" className="gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg px-4">
                <Trophy className="w-4 h-4" />
                <span>Engage</span>
              </TabsTrigger>
              <TabsTrigger value="hype" className="gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg px-4">
                <Flame className="w-4 h-4 text-orange-500" />
                <span>Hype It</span>
              </TabsTrigger>
              <TabsTrigger value="rewards" className="gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg px-4">
                <Gift className="w-4 h-4" />
                <span>Rewards</span>
              </TabsTrigger>
              <TabsTrigger value="system" className="gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg px-4">
                <Server className="w-4 h-4" />
                <span>System</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Command Center - Live Dashboard */}
          <TabsContent value="command" className="space-y-6">
            <AdminCommandCenter />
          </TabsContent>

          {/* Analytics Dashboard */}
          <TabsContent value="analytics" className="space-y-6">
            <AnalyticsDashboard />
          </TabsContent>

          {/* User Management */}
          <TabsContent value="users" className="space-y-6">
            <UserManagement />
          </TabsContent>

          {/* Role Management */}
          <TabsContent value="roles" className="space-y-6">
            <AdminRolesManagement />
          </TabsContent>

          {/* Notification Broadcast */}
          <TabsContent value="broadcast" className="space-y-6">
            <EnhancedNotificationBroadcast />
          </TabsContent>

          {/* Global Controls */}
          <TabsContent value="controls" className="space-y-6">
            <GlobalControlPanel />
          </TabsContent>

          {/* Content Moderation */}
          <TabsContent value="content" className="space-y-6">
            <ContentModeration />
          </TabsContent>

          {/* Engagement - InphroSync & YourTurn */}
          <TabsContent value="engagement" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-accent" />
                  InphroSync Analytics
                </CardTitle>
                <CardDescription>
                  View detailed analytics and participation data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <InphroSyncAnalytics />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>InphroSync Management</CardTitle>
                <CardDescription>
                  Manage daily questions and clear response data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <Button
                    variant="destructive"
                    onClick={handleClearInphroSyncData}
                    disabled={clearingData}
                    className="gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    {clearingData ? "Clearing..." : "Clear All Response Data"}
                  </Button>
                  <p className="text-sm text-muted-foreground mt-2">
                    This will permanently delete all user responses. Questions and options will remain intact.
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <InphroSyncAdmin onClose={() => {}} onRefresh={() => {}} />

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-500" />
                  Your Turn Management
                </CardTitle>
                <CardDescription>
                  Manage daily slots, questions, and view history
                </CardDescription>
              </CardHeader>
              <CardContent>
                <YourTurnManagement />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Hype It Management */}
          <TabsContent value="hype" className="space-y-6">
            <HypeItManagement />
          </TabsContent>

          {/* Rewards - Coupons & Referrals */}
          <TabsContent value="rewards" className="space-y-6">
            <CouponManagement />
            <ReferralManagement />
          </TabsContent>

          {/* System - Database, Logs, Cleanup */}
          <TabsContent value="system" className="space-y-6">
            <DatabaseHealth />
            <AdminActivityLog />
            <QuickActions />
            <AdminCleanupTool />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

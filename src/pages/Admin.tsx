import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminCleanupTool } from "@/components/admin/AdminCleanupTool";
import { UserManagement } from "@/components/admin/UserManagement";
import { SystemStats } from "@/components/admin/SystemStats";
import { ContentModeration } from "@/components/admin/ContentModeration";
import { CouponManagement } from "@/components/admin/CouponManagement";
import { NotificationBroadcast } from "@/components/admin/NotificationBroadcast";
import { InphroSyncAdmin } from "@/components/inphrosync/InphroSyncAdmin";
import { InphroSyncAnalytics } from "@/components/inphrosync/InphroSyncAnalytics";
import { YourTurnManagement } from "@/components/admin/YourTurnManagement";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Shield, Trash2, BarChart3, Bell, Trophy } from "lucide-react";

export default function Admin() {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [clearingData, setClearingData] = useState(false);

  const handleClearInphroSyncData = async () => {
    if (!confirm("Are you sure you want to clear ALL InphroSync responses? This action cannot be undone.")) {
      return;
    }

    setClearingData(true);
    try {
      // Delete all responses - use neq with an impossible value to delete all
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

        // Check if user has admin role
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
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
        <div className="flex items-center gap-3 mb-8">
          <Shield className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">Admin Panel</h1>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          {/* Mobile-friendly scrollable tabs */}
          <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
            <TabsList className="inline-flex min-w-max md:grid md:w-full md:grid-cols-8 gap-1 p-1">
              <TabsTrigger value="overview" className="text-xs md:text-sm whitespace-nowrap px-2 md:px-4">
                Overview
              </TabsTrigger>
              <TabsTrigger value="users" className="text-xs md:text-sm whitespace-nowrap px-2 md:px-4">
                Users
              </TabsTrigger>
              <TabsTrigger value="notifications" className="text-xs md:text-sm whitespace-nowrap px-2 md:px-4">
                Notifications
              </TabsTrigger>
              <TabsTrigger value="content" className="text-xs md:text-sm whitespace-nowrap px-2 md:px-4">
                Content
              </TabsTrigger>
              <TabsTrigger value="coupons" className="text-xs md:text-sm whitespace-nowrap px-2 md:px-4">
                Coupons
              </TabsTrigger>
              <TabsTrigger value="inphrosync" className="text-xs md:text-sm whitespace-nowrap px-2 md:px-4">
                InphroSync
              </TabsTrigger>
              <TabsTrigger value="yourturn" className="text-xs md:text-sm whitespace-nowrap px-2 md:px-4">
                Your Turn
              </TabsTrigger>
              <TabsTrigger value="system" className="text-xs md:text-sm whitespace-nowrap px-2 md:px-4">
                System
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>System Overview</CardTitle>
                <CardDescription>
                  Real-time statistics and platform health
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-6">
                  Monitor key metrics and system performance across the Inphrone platform.
                </p>
                <SystemStats />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <UserManagement />
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <NotificationBroadcast />
          </TabsContent>

          <TabsContent value="content">
            <ContentModeration />
          </TabsContent>

          <TabsContent value="coupons">
            <CouponManagement />
          </TabsContent>

          <TabsContent value="inphrosync" className="space-y-6">
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
          </TabsContent>

          <TabsContent value="yourturn" className="space-y-6">
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

          <TabsContent value="system" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>System Management</CardTitle>
                <CardDescription>
                  Administrative tools and data management
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Use these tools to manage the platform. All actions are permanent and should be used with caution.
                </p>
              </CardContent>
            </Card>
            
            <AdminCleanupTool />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

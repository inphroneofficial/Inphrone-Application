import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { 
  Trash2, RefreshCw, Download, Upload, Bell, Mail, 
  Database, Users, Shield, Zap, MessageSquare, Gift
} from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

export function QuickActions() {
  const [loading, setLoading] = useState<string | null>(null);

  const executeAction = async (actionId: string, action: () => Promise<void>) => {
    setLoading(actionId);
    try {
      await action();
    } catch (error: any) {
      console.error(`Error executing ${actionId}:`, error);
      toast.error(`Action failed: ${error.message}`);
    } finally {
      setLoading(null);
    }
  };

  const clearAllInphroSyncResponses = async () => {
    const { error } = await supabase
      .from("inphrosync_responses")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");
    
    if (error) throw error;
    toast.success("All InphroSync responses cleared");
  };

  const clearAllNotifications = async () => {
    const { error } = await supabase
      .from("notifications")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");
    
    if (error) throw error;
    toast.success("All notifications cleared");
  };

  const refreshCouponPool = async () => {
    const { error } = await supabase.functions.invoke('populate-coupon-pool');
    if (error) throw error;
    toast.success("Coupon pool refreshed");
  };

  const exportData = async (tableName: string) => {
    const { data, error } = await supabase.from(tableName as any).select("*");
    if (error) throw error;
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${tableName}_export_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`${tableName} data exported`);
  };

  const resetYourTurnSlots = async () => {
    const { error } = await supabase
      .from("your_turn_slots")
      .update({ winner_question_id: null, attempt_count: 0 })
      .neq("id", "00000000-0000-0000-0000-000000000000");
    
    if (error) throw error;
    toast.success("All Your Turn slots reset");
  };

  const actions = [
    {
      id: 'refresh-coupons',
      label: 'Refresh Coupon Pool',
      description: 'Fetch latest coupons from provider',
      icon: Gift,
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
      action: refreshCouponPool,
      requireConfirm: false
    },
    {
      id: 'export-opinions',
      label: 'Export Opinions',
      description: 'Download all opinions as JSON',
      icon: Download,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      action: () => exportData('opinions'),
      requireConfirm: false
    },
    {
      id: 'export-users',
      label: 'Export Users',
      description: 'Download all profiles as JSON',
      icon: Users,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      action: () => exportData('profiles'),
      requireConfirm: false
    },
    {
      id: 'clear-sync',
      label: 'Clear InphroSync Data',
      description: 'Delete all sync responses',
      icon: Zap,
      color: 'text-cyan-500',
      bgColor: 'bg-cyan-500/10',
      action: clearAllInphroSyncResponses,
      requireConfirm: true,
      confirmTitle: 'Clear InphroSync Data?',
      confirmDesc: 'This will permanently delete all InphroSync responses. This action cannot be undone.'
    },
    {
      id: 'clear-notifications',
      label: 'Clear All Notifications',
      description: 'Delete all user notifications',
      icon: Bell,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      action: clearAllNotifications,
      requireConfirm: true,
      confirmTitle: 'Clear All Notifications?',
      confirmDesc: 'This will delete all notifications for all users. This action cannot be undone.'
    },
    {
      id: 'reset-yourturn',
      label: 'Reset Your Turn Slots',
      description: 'Clear all slot winners and attempts',
      icon: RefreshCw,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
      action: resetYourTurnSlots,
      requireConfirm: true,
      confirmTitle: 'Reset Your Turn Slots?',
      confirmDesc: 'This will reset all Your Turn slots, clearing winners and attempt counts.'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-primary" />
          Quick Actions
        </CardTitle>
        <CardDescription>Common administrative tasks for fast execution</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {actions.map((action, index) => {
            const Icon = action.icon;
            const isLoading = loading === action.id;

            const ActionButton = (
              <motion.div
                key={action.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  variant="outline"
                  className="w-full h-auto p-4 flex flex-col items-start gap-2 hover:border-primary/50"
                  disabled={isLoading}
                  onClick={action.requireConfirm ? undefined : () => executeAction(action.id, action.action)}
                >
                  <div className="flex items-center gap-3 w-full">
                    <div className={`p-2 rounded-lg ${action.bgColor}`}>
                      {isLoading ? (
                        <RefreshCw className={`w-4 h-4 ${action.color} animate-spin`} />
                      ) : (
                        <Icon className={`w-4 h-4 ${action.color}`} />
                      )}
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-sm">{action.label}</p>
                      <p className="text-xs text-muted-foreground">{action.description}</p>
                    </div>
                  </div>
                </Button>
              </motion.div>
            );

            if (action.requireConfirm) {
              return (
                <AlertDialog key={action.id}>
                  <AlertDialogTrigger asChild>
                    {ActionButton}
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>{action.confirmTitle}</AlertDialogTitle>
                      <AlertDialogDescription>{action.confirmDesc}</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => executeAction(action.id, action.action)}
                        className="bg-destructive"
                      >
                        Confirm
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              );
            }

            return ActionButton;
          })}
        </div>
      </CardContent>
    </Card>
  );
}

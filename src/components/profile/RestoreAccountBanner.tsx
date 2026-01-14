import { useState, useEffect } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AlertCircle, RefreshCw, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const RestoreAccountBanner = () => {
  const [pendingDeletion, setPendingDeletion] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [restoring, setRestoring] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    checkPendingDeletion();
  }, []);

  const checkPendingDeletion = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('pending_account_deletions')
        .select('*')
        .eq('user_id', user.id)
        .is('restored_at', null)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking pending deletion:', error);
      }

      if (data && new Date(data.permanent_deletion_date) > new Date()) {
        setPendingDeletion(data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    try {
      setRestoring(true);
      
      const { data, error } = await supabase.rpc('restore_account');
      
      if (error) throw error;

      const result = data as { success: boolean; error?: string; message?: string } | null;

      if (result?.success) {
        toast({
          title: "Account Restored! 🎉",
          description: "Your account has been successfully restored. Welcome back!",
        });
        setPendingDeletion(null);
        navigate('/profile');
      } else {
        throw new Error(result?.error || 'Failed to restore account');
      }
    } catch (error: any) {
      console.error('Restore error:', error);
      toast({
        variant: "destructive",
        title: "Restore Failed",
        description: error.message || "Failed to restore account. Please try again.",
      });
    } finally {
      setRestoring(false);
    }
  };

  if (loading || !pendingDeletion) return null;

  const daysRemaining = Math.ceil(
    (new Date(pendingDeletion.permanent_deletion_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  return (
    <Alert variant="destructive" className="mb-6 border-2 border-destructive">
      <AlertCircle className="h-5 w-5" />
      <AlertTitle className="text-lg font-bold">Account Deletion Pending</AlertTitle>
      <AlertDescription className="mt-2 space-y-3">
        <p>
          Your account is scheduled for permanent deletion in <strong>{daysRemaining} days</strong>.
        </p>
        <p className="text-sm">
          Permanent deletion date: {new Date(pendingDeletion.permanent_deletion_date).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </p>
        <div className="pt-2">
          <Button 
            onClick={handleRestore}
            disabled={restoring}
            variant="default"
            className="gap-2"
          >
            {restoring ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Restoring...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                Restore My Account
              </>
            )}
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
};

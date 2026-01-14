import React, { useState } from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Trash2, Loader2 } from "lucide-react";

interface DeleteAccountDialogProps {
  trigger?: React.ReactNode;
}

const DeleteAccountDialog: React.FC<DeleteAccountDialogProps> = ({ trigger }) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (confirmText.toLowerCase() !== "delete") {
      toast({ variant: "destructive", title: "Confirmation failed", description: 'Please type "DELETE" to confirm' });
      return;
    }

    try {
      setDeleting(true);
      
      // Call backend function to soft delete with 30-day grace period
      const { data: fnData, error: fnError } = await supabase.functions.invoke('soft-delete-account', { body: {} });
      
      if (fnError) {
        console.error('Edge function error:', fnError);
        throw new Error(fnError.message || 'Failed to delete account');
      }

      if (fnData?.error) {
        console.error('Function response error:', fnData);
        throw new Error(fnData.error);
      }

      const deletionDate = new Date(fnData.permanent_deletion_date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      toast({ 
        title: "Account Deletion Scheduled", 
        description: `Your account will be permanently deleted on ${deletionDate}. You can restore it anytime before then.`,
        duration: 8000,
      });

      // Sign out and redirect
      await supabase.auth.signOut();
      navigate("/");
    } catch (e: any) {
      console.error('Delete account error:', e);
      const errorMessage = e.message || 'An unknown error occurred';
      toast({ variant: "destructive", title: "Delete failed", description: errorMessage });
    } finally {
      setDeleting(false);
      setOpen(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        {trigger || (
          <Button variant="destructive" size="sm">
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Account
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            <p className="text-amber-600 dark:text-amber-400 font-semibold">
              ⏰ 30-Day Grace Period: You can restore your account anytime within 30 days.
            </p>
            <p>After 30 days, your account and all associated data will be permanently deleted.</p>
            <p className="font-semibold">This includes:</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Your profile information</li>
              <li>All opinions and reviews</li>
              <li>Upvotes and interactions</li>
              <li>Rewards and coupons</li>
              <li>Activity history</li>
            </ul>
            <div className="pt-2">
              <label className="text-sm font-medium">Type <span className="font-bold">DELETE</span> to confirm:</label>
              <Input
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="DELETE"
                className="mt-2"
              />
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            disabled={deleting || confirmText.toLowerCase() !== "delete"}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Scheduling Deletion...
              </>
            ) : (
              "Schedule Deletion"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteAccountDialog;

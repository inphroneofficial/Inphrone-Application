import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Trash2, AlertTriangle } from "lucide-react";

export function AdminCleanupTool() {
  const [loading, setLoading] = useState(false);
  const [cleaningData, setCleaningData] = useState(false);
  const [cleaningDataOnly, setCleaningDataOnly] = useState(false);

  const handleDeleteAllData = async () => {
    setCleaningData(true);
    try {
      // First, delete all user data
      const { data: cleanupData, error: cleanupError } = await supabase.functions.invoke('cleanup-all-data');
      
      if (cleanupError) {
        throw cleanupError;
      }

      toast.success(`Successfully deleted ${cleanupData.totalDeleted} data rows`);

      // Then, delete all auth users
      const { data, error } = await supabase.functions.invoke('delete-all-auth-users');
      
      if (error) {
        throw error;
      }

      toast.success(`Successfully deleted ${data.deleted} auth users`);
    } catch (error: any) {
      console.error("Error during cleanup:", error);
      toast.error(`Cleanup failed: ${error.message}`);
    } finally {
      setCleaningData(false);
    }
  };

  const handleDeleteDataOnly = async () => {
    setCleaningDataOnly(true);
    try {
      const { data: cleanupData, error: cleanupError } = await supabase.functions.invoke('cleanup-all-data');
      
      if (cleanupError) {
        throw cleanupError;
      }

      toast.success(`Successfully deleted ${cleanupData.totalDeleted} data rows. User accounts preserved.`);
    } catch (error: any) {
      console.error("Error during data cleanup:", error);
      toast.error(`Data cleanup failed: ${error.message}`);
    } finally {
      setCleaningDataOnly(false);
    }
  };

  const handleDeleteAllAuthUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('delete-all-auth-users');
      
      if (error) {
        throw error;
      }

      toast.success(`Successfully deleted ${data.deleted} auth users`);
    } catch (error: any) {
      console.error("Error deleting auth users:", error);
      toast.error(`Failed to delete auth users: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-destructive/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <AlertTriangle className="w-5 h-5" />
          Admin Cleanup Tool
        </CardTitle>
        <CardDescription>
          Permanently delete all user data including opinions, coupons, and authentication accounts. This action cannot be undone.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" disabled={cleaningData} className="w-full">
              <Trash2 className="w-4 h-4 mr-2" />
              {cleaningData ? "Deleting All Data..." : "Delete All Data & Users"}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete:
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>All opinions and user submissions</li>
                  <li>All coupons and rewards</li>
                  <li>All user profiles and activity logs</li>
                  <li>All authentication accounts</li>
                </ul>
                <p className="mt-2 font-bold">This action cannot be undone!</p>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteAllData} className="bg-destructive">
                Yes, Delete Everything
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" disabled={cleaningDataOnly} className="w-full border-destructive/50 text-destructive hover:bg-destructive/10">
              <Trash2 className="w-4 h-4 mr-2" />
              {cleaningDataOnly ? "Deleting Data..." : "Delete Only User Data"}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete user data only?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete:
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>All opinions and user submissions</li>
                  <li>All coupons and rewards</li>
                  <li>All user profiles and activity logs</li>
                </ul>
                <p className="mt-2 font-bold text-primary">User authentication accounts will be preserved.</p>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteDataOnly} className="bg-destructive">
                Yes, Delete Data Only
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" disabled={loading} className="w-full border-destructive/50 text-destructive hover:bg-destructive/10">
              <Trash2 className="w-4 h-4 mr-2" />
              {loading ? "Deleting..." : "Delete Auth Users Only"}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete authentication users only?</AlertDialogTitle>
              <AlertDialogDescription>
                This will only delete authentication accounts, leaving data in the database.
                Use this if you've already cleared data separately.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteAllAuthUsers} className="bg-destructive">
                Yes, Delete Auth Users
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}

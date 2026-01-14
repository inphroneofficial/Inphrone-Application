import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Download, FileJson, FileText, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface DataExportProps {
  userId: string;
}

export const DataExport = ({ userId }: DataExportProps) => {
  const [exporting, setExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [completed, setCompleted] = useState(false);

  const exportData = async (format: "json" | "csv") => {
    setExporting(true);
    setProgress(0);
    setCompleted(false);

    try {
      // Fetch all user data
      setProgress(10);
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      setProgress(25);
      const { data: opinions } = await supabase
        .from("opinions")
        .select("*")
        .eq("user_id", userId);

      setProgress(40);
      const { data: upvotes } = await supabase
        .from("opinion_upvotes")
        .select("*")
        .eq("user_id", userId);

      setProgress(55);
      const { data: rewards } = await supabase
        .from("rewards")
        .select("*")
        .eq("user_id", userId)
        .single();

      setProgress(70);
      const { data: badges } = await supabase
        .from("user_badges")
        .select("*")
        .eq("user_id", userId);

      setProgress(85);
      const { data: inphrosyncResponses } = await supabase
        .from("inphrosync_responses")
        .select("*")
        .eq("user_id", userId);

      // Compile all data
      const exportData = {
        exported_at: new Date().toISOString(),
        profile: profile ? {
          full_name: profile.full_name,
          email: profile.email,
          country: profile.country,
          state_region: profile.state_region,
          city: profile.city,
          user_type: profile.user_type,
          created_at: profile.created_at
        } : null,
        opinions: opinions?.map(o => ({
          title: o.title,
          description: o.description,
          content_type: o.content_type,
          genre: o.genre,
          created_at: o.created_at,
          upvotes: o.upvotes
        })) || [],
        activity: {
          total_opinions: opinions?.length || 0,
          total_upvotes_given: upvotes?.length || 0,
          total_points: rewards?.points || 0,
          level: rewards?.level || 1
        },
        badges: badges?.map(b => ({
          name: b.badge_name,
          type: b.badge_type,
          earned_at: b.earned_at
        })) || [],
        inphrosync_responses: inphrosyncResponses?.map(r => ({
          question_type: r.question_type,
          selected_option: r.selected_option,
          response_date: r.response_date
        })) || []
      };

      setProgress(95);

      // Create and download file
      let content: string;
      let filename: string;
      let mimeType: string;

      if (format === "json") {
        content = JSON.stringify(exportData, null, 2);
        filename = `inphrone_data_${new Date().toISOString().split('T')[0]}.json`;
        mimeType = "application/json";
      } else {
        // Convert to CSV (simplified - just opinions)
        const headers = ["Title", "Description", "Type", "Genre", "Created At", "Upvotes"];
        const rows = exportData.opinions.map(o => [
          `"${o.title.replace(/"/g, '""')}"`,
          `"${o.description.replace(/"/g, '""')}"`,
          o.content_type,
          o.genre || "",
          o.created_at,
          o.upvotes.toString()
        ]);
        content = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
        filename = `inphrone_opinions_${new Date().toISOString().split('T')[0]}.csv`;
        mimeType = "text/csv";
      }

      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setProgress(100);
      setCompleted(true);
      toast.success("Data exported successfully!");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export data");
    } finally {
      setExporting(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Download className="w-5 h-5 text-primary" />
        <h3 className="font-semibold">Export Your Data</h3>
      </div>
      
      <p className="text-sm text-muted-foreground mb-4">
        Download all your data including opinions, activity, and badges.
      </p>

      {exporting && (
        <div className="mb-4">
          <Progress value={progress} className="h-2 mb-2" />
          <p className="text-xs text-muted-foreground text-center">
            {progress < 100 ? "Preparing your data..." : "Complete!"}
          </p>
        </div>
      )}

      {completed && (
        <div className="flex items-center gap-2 text-green-600 mb-4">
          <CheckCircle2 className="w-4 h-4" />
          <span className="text-sm">Download complete!</span>
        </div>
      )}

      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={() => exportData("json")}
          disabled={exporting}
          className="flex-1"
        >
          {exporting ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <FileJson className="w-4 h-4 mr-2" />
          )}
          Export JSON
        </Button>
        <Button
          variant="outline"
          onClick={() => exportData("csv")}
          disabled={exporting}
          className="flex-1"
        >
          {exporting ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <FileText className="w-4 h-4 mr-2" />
          )}
          Export CSV
        </Button>
      </div>
    </Card>
  );
};

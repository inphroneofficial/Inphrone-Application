import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Loader2 } from "lucide-react";
import { FilmOpinionForm } from "./FilmOpinionForm";
import { MusicOpinionForm } from "./MusicOpinionForm";
import { OTTOpinionForm } from "./OTTOpinionForm";
import { YouTubeOpinionForm } from "./YouTubeOpinionForm";
import { GamingOpinionForm } from "./GamingOpinionForm";
import { SocialMediaOpinionForm } from "./SocialMediaOpinionForm";
import { TVOpinionForm } from "./TVOpinionForm";
import { AppDevelopmentOpinionForm } from "./AppDevelopmentOpinionForm";
import { LocationInput } from "./LocationInput";
import { RewardCouponDialog } from "../rewards/RewardCouponDialog";

const opinionSchema = z.object({
  would_pay: z.boolean().nullable().default(false),
  preferences: z.record(z.any()).default({}),
  comments: z.string().optional(),
});

type OpinionFormData = z.infer<typeof opinionSchema>;

interface OpinionSubmissionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoryId: string;
  categoryName: string;
  onSuccess?: () => void;
}

export function OpinionSubmissionDialog({
  open,
  onOpenChange,
  categoryId,
  categoryName,
  onSuccess,
}: OpinionSubmissionDialogProps) {
  const [submitting, setSubmitting] = useState(false);
  const [showCouponDialog, setShowCouponDialog] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [userCity, setUserCity] = useState("");
  const [userCountry, setUserCountry] = useState("");

  const handleLocationChange = useCallback((city: string, country: string) => {
    setUserCity(city);
    setUserCountry(country);
  }, []);

  const form = useForm<OpinionFormData>({
    resolver: zodResolver(opinionSchema),
    defaultValues: {
      would_pay: false,
      preferences: {},
      comments: "",
    },
  });

  const onSubmit = async (data: OpinionFormData) => {
    try {
      // Validate that at least some preferences have been selected
      const prefs = data.preferences;
      
      // Count how many fields have actual selections
      let selectedFieldsCount = 0;
      if (prefs && typeof prefs === 'object') {
        Object.keys(prefs).forEach(key => {
          const val = prefs[key];
          if (Array.isArray(val) && val.length > 0) {
            selectedFieldsCount++;
          } else if (typeof val === 'string' && val.trim() !== '') {
            selectedFieldsCount++;
          } else if (typeof val === 'boolean') {
            selectedFieldsCount++;
          }
        });
      }

      // Require at least 3 fields to be filled
      if (selectedFieldsCount < 3) {
        toast.error("Please complete the form", {
          description: "Select at least 3 different preferences before submitting"
        });
        return;
      }

      setSubmitting(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("You must be logged in to submit an opinion");
        return;
      }

      // Validate location
      if (!userCity.trim() || !userCountry.trim()) {
        toast.error("Location required", {
          description: "Please provide your city and country to submit your opinion"
        });
        setSubmitting(false);
        return;
      }

      const { error } = await supabase.from("opinions").insert({
        user_id: user.id,
        category_id: categoryId,
        content_type: categoryName,
        title: "",
        description: "",
        genre: "",
        why_excited: "",
        would_pay: data.would_pay,
        estimated_budget: "",
        target_audience: "",
        similar_content: "",
        additional_notes: "",
        preferences: data.preferences,
        comments: data.comments || null,
        city: userCity,
        country: userCountry,
      });

      if (error) throw error;

      // Update rewards
      const { data: rewardData } = await supabase
        .from("rewards")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (rewardData) {
        await supabase
          .from("rewards")
          .update({
            points: rewardData.points + 10,
            total_opinions: rewardData.total_opinions + 1,
          })
          .eq("user_id", user.id);
      } else {
        await supabase.from("rewards").insert({
          user_id: user.id,
          points: 10,
          total_opinions: 1,
        });
      }

      toast.success("Opinion submitted successfully! +10 points");
      form.reset();
      onOpenChange(false);
      
      // Show coupon reward dialog
      setCurrentUserId(user.id);
      setShowCouponDialog(true);
      
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.message || "Failed to submit opinion");
    } finally {
      setSubmitting(false);
    }
  };

  const renderCategoryForm = () => {
    if (categoryName === "Film") {
      return <FilmOpinionForm control={form.control} />;
    } else if (categoryName === "Music") {
      return <MusicOpinionForm control={form.control} />;
    } else if (categoryName === "TV") {
      return <TVOpinionForm control={form.control} />;
    } else if (categoryName === "OTT") {
      return <OTTOpinionForm control={form.control} />;
    } else if (categoryName === "YouTube") {
      return <YouTubeOpinionForm control={form.control} />;
    } else if (categoryName === "Gaming") {
      return <GamingOpinionForm control={form.control} />;
    } else if (categoryName === "Social Media") {
      return <SocialMediaOpinionForm control={form.control} />;
    } else if (categoryName === "App Development") {
      return <AppDevelopmentOpinionForm control={form.control} />;
    }
    return null;
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl md:text-2xl">
            <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-primary animate-pulse" />
            Share Your {categoryName} Vision
          </DialogTitle>
          <DialogDescription className="text-sm">
            🎮 Quick selections only! Earn +10 points instantly. No typing required!
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Location Input */}
            <LocationInput onLocationChange={handleLocationChange} />
            
            {renderCategoryForm()}

            {/* Optional Comments Section */}
            <FormField
              control={form.control}
              name="comments"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Comments (Optional)</FormLabel>
                  <Textarea
                    {...field}
                    placeholder="Share your thoughts, ideas, or any additional context about your preferences..."
                    className="resize-none h-24"
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={submitting}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="flex-1 gradient-primary text-white border-0"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Submit Opinion
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>

    <RewardCouponDialog
      open={showCouponDialog}
      onOpenChange={setShowCouponDialog}
      userId={currentUserId}
    />
    </>
  );
}
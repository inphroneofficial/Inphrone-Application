import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

interface ProfileCompletionStep {
  id: string;
  label: string;
  completed: boolean;
  weight: number;
}

interface ProfileCompletionProgressProps {
  userId: string;
  userType: string;
}

export function ProfileCompletionProgress({ userId, userType }: ProfileCompletionProgressProps) {
  const [steps, setSteps] = useState<ProfileCompletionStep[]>([]);
  const [percentage, setPercentage] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      checkProfileCompletion();
    }
  }, [userId, userType]);

  const checkProfileCompletion = async () => {
    try {
      // Fetch main profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (!profile) return;

      const completionSteps: ProfileCompletionStep[] = [];

      // Basic profile checks
      completionSteps.push({
        id: "name",
        label: "Full Name",
        completed: !!profile.full_name && profile.full_name.length > 2,
        weight: 10
      });

      completionSteps.push({
        id: "email",
        label: "Email Verified",
        completed: true, // Assume verified if they can see this
        weight: 10
      });

      completionSteps.push({
        id: "country",
        label: "Country",
        completed: !!profile.country,
        weight: 10
      });

      completionSteps.push({
        id: "city",
        label: "City",
        completed: !!profile.city,
        weight: 5
      });

      completionSteps.push({
        id: "age",
        label: "Age Group",
        completed: !!profile.age_group,
        weight: 5
      });

      completionSteps.push({
        id: "gender",
        label: "Gender",
        completed: !!profile.gender,
        weight: 5
      });

      completionSteps.push({
        id: "picture",
        label: "Profile Picture",
        completed: !!profile.profile_picture,
        weight: 10
      });

      // Check for specific profile based on user type
      if (userType === "audience") {
        const { data: audienceProfile } = await supabase
          .from("audience_profiles")
          .select("*")
          .eq("user_id", userId)
          .maybeSingle();

        completionSteps.push({
          id: "preferences",
          label: "Entertainment Preferences",
          completed: !!audienceProfile?.entertainment_preferences?.length,
          weight: 15
        });

        completionSteps.push({
          id: "platforms",
          label: "Favorite Platforms",
          completed: !!audienceProfile?.favorite_platforms?.length,
          weight: 10
        });

        completionSteps.push({
          id: "genres",
          label: "Genre Interests",
          completed: !!audienceProfile?.genre_interests?.length,
          weight: 10
        });
      } else {
        // For creators/studios etc - use a simpler check
        completionSteps.push({
          id: "specific_profile",
          label: "Role Profile Complete",
          completed: true, // Assume complete if onboarding passed
          weight: 35
        });
      }

      // Check for activity
      const { data: opinions } = await supabase
        .from("opinions")
        .select("id")
        .eq("user_id", userId)
        .limit(1);

      completionSteps.push({
        id: "first_opinion",
        label: "First Opinion Shared",
        completed: !!opinions?.length,
        weight: 10
      });

      setSteps(completionSteps);

      // Calculate percentage
      const totalWeight = completionSteps.reduce((sum, step) => sum + step.weight, 0);
      const completedWeight = completionSteps
        .filter(step => step.completed)
        .reduce((sum, step) => sum + step.weight, 0);
      
      setPercentage(Math.round((completedWeight / totalWeight) * 100));
      setLoading(false);
    } catch (error) {
      console.error("Error checking profile completion:", error);
      setLoading(false);
    }
  };

  if (loading) return null;

  // Don't show if profile is 100% complete
  if (percentage === 100) return null;

  const getProgressColor = () => {
    if (percentage < 40) return "bg-destructive";
    if (percentage < 70) return "bg-warning";
    return "bg-success";
  };

  const incompleteSteps = steps.filter(s => !s.completed);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Profile Completion
            </CardTitle>
            <Badge 
              variant="outline" 
              className={`${percentage >= 70 ? 'border-success text-success' : 'border-primary text-primary'}`}
            >
              {percentage}%
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Progress 
              value={percentage} 
              className="h-2"
            />
            <p className="text-xs text-muted-foreground">
              Complete your profile to unlock all features and get personalized recommendations
            </p>
          </div>

          {incompleteSteps.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Missing:</p>
              <div className="flex flex-wrap gap-2">
                {incompleteSteps.slice(0, 4).map((step) => (
                  <Badge
                    key={step.id}
                    variant="outline"
                    className="text-xs flex items-center gap-1 bg-muted/50"
                  >
                    <Circle className="w-2 h-2" />
                    {step.label}
                  </Badge>
                ))}
                {incompleteSteps.length > 4 && (
                  <Badge variant="outline" className="text-xs bg-muted/50">
                    +{incompleteSteps.length - 4} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {steps.filter(s => s.completed).slice(0, 3).map((step) => (
              <Badge
                key={step.id}
                className="text-xs flex items-center gap-1 bg-success/10 text-success border-success/30"
              >
                <CheckCircle2 className="w-3 h-3" />
                {step.label}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

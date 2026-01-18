import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import StepOne from "@/components/onboarding/StepOne";
import StepTwoAudience from "@/components/onboarding/StepTwoAudience";
import StepTwoCreator from "@/components/onboarding/StepTwoCreator";
import StepTwoStudio from "@/components/onboarding/StepTwoStudio";
import StepTwoOTT from "@/components/onboarding/StepTwoOTT";
import StepTwoTV from "@/components/onboarding/StepTwoTV";
import StepTwoGaming from "@/components/onboarding/StepTwoGaming";
import StepTwoMusic from "@/components/onboarding/StepTwoMusic";
import StepTwoDeveloper from "@/components/onboarding/StepTwoDeveloper";

const Onboarding = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [userType, setUserType] = useState<"audience" | "creator" | "studio" | "production" | "ott" | "tv" | "gaming" | "music" | "developer">("audience");
  const [profileData, setProfileData] = useState<any>(null);

  useEffect(() => {
    // Check authentication and profile completion
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
        return;
      }

      // Check if email is confirmed
      if (!session.user.email_confirmed_at) {
        toast.error("Please confirm your email before continuing");
        navigate("/auth");
        return;
      }

      setUser(session.user);

      // Check if profile already exists
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .maybeSingle();

      if (profile?.onboarding_completed) {
        navigate("/dashboard");
      } else if (profile && profile.user_type !== 'pending') {
        setUserType(profile.user_type as "audience" | "creator" | "studio" | "production" | "ott" | "tv" | "gaming" | "music" | "developer");
        setCurrentStep(2);
      }

      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (!session) {
        navigate("/auth");
      } else if (event === 'SIGNED_IN' && !session.user.email_confirmed_at) {
        toast.error("Please confirm your email to continue");
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleStepOneComplete = (data: any) => {
    setProfileData(data);
    setUserType(data.userType);
    setCurrentStep(2);
  };

  const handleStepTwoComplete = async () => {
    try {
      // Mark onboarding as completed (tour_completed is NOT set - tour will show)
      const { error } = await supabase
        .from("profiles")
        .update({ 
          onboarding_completed: true,
          settings: { tour_completed: false } // Ensure tour shows for new users
        })
        .eq("id", user?.id);

      if (error) throw error;

      // Clear any existing tour completion flags for fresh start
      localStorage.removeItem('inphrone_tour_completed');
      
      toast.success("Welcome to INPHRONE! 🎉");
      navigate("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Failed to complete onboarding");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin text-primary">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  const progress = (currentStep / 2) * 100;

  return (
    <div className="min-h-screen gradient-hero py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-8 space-y-4">
          <div className="text-center">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Welcome to INPHRONE
            </h1>
            <p className="text-muted-foreground mt-2">
              Let's set up your profile
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Step {currentStep} of 2</span>
              <span>{progress}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>

        <div className="flex justify-between items-center mb-4">
          <Button variant="ghost" onClick={async () => { await supabase.auth.signOut(); navigate('/auth'); }}>
            Back
          </Button>
        </div>
        <Card className="p-8 shadow-elegant">
          {currentStep === 1 && (
            <StepOne 
              userId={user?.id!}
              onComplete={handleStepOneComplete}
            />
          )}

          {currentStep === 2 && userType === "audience" && (
            <StepTwoAudience
              userId={user?.id!}
              onComplete={handleStepTwoComplete}
            />
          )}

          {currentStep === 2 && userType === "creator" && (
            <StepTwoCreator
              userId={user?.id!}
              onComplete={handleStepTwoComplete}
            />
          )}

          {currentStep === 2 && userType === "studio" && (
            <StepTwoStudio
              userId={user?.id!}
              onComplete={handleStepTwoComplete}
            />
          )}

          {currentStep === 2 && userType === "production" && (
            <StepTwoStudio
              userId={user?.id!}
              onComplete={handleStepTwoComplete}
            />
          )}

          {currentStep === 2 && userType === "ott" && (
            <StepTwoOTT
              userId={user?.id!}
              onComplete={handleStepTwoComplete}
            />
          )}

          {currentStep === 2 && userType === "tv" && (
            <StepTwoTV
              userId={user?.id!}
              onComplete={handleStepTwoComplete}
            />
          )}

          {currentStep === 2 && userType === "gaming" && (
            <StepTwoGaming
              userId={user?.id!}
              onComplete={handleStepTwoComplete}
            />
          )}

          {currentStep === 2 && userType === "music" && (
            <StepTwoMusic
              userId={user?.id!}
              onComplete={handleStepTwoComplete}
            />
          )}

          {currentStep === 2 && userType === "developer" && (
            <StepTwoDeveloper
              userId={user?.id!}
              onComplete={handleStepTwoComplete}
            />
          )}
        </Card>
      </div>
    </div>
  );
};

export default Onboarding;
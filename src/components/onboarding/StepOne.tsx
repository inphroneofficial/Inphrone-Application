import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, MapPin } from "lucide-react";
import { useLocationDetection } from "@/hooks/useLocationDetection";

interface StepOneProps {
  userId: string;
  onComplete: (data: any) => void;
}

const StepOne = ({ userId, onComplete }: StepOneProps) => {
  const [loading, setLoading] = useState(false);
  const location = useLocationDetection();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    country: "",
    userType: "audience" as "audience" | "creator" | "studio" | "production" | "ott" | "tv" | "gaming" | "music" | "developer",
    gender: "",
    dateOfBirth: "",
    stateRegion: "",
    city: "",
    termsAccepted: false,
  });

  useEffect(() => {
    // Get user metadata from auth
    const getUserMetadata = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.user_metadata) {
        setFormData(prev => ({
          ...prev,
          fullName: user.user_metadata.full_name || "",
          email: user.email || "",
          country: user.user_metadata.country || "",
          userType: user.user_metadata.user_type || "audience"
        }));
      }
    };
    getUserMetadata();
  }, []);

  // Auto-fill location when detected
  useEffect(() => {
    if (!location.loading && !location.error) {
      setFormData(prev => ({
        ...prev,
        country: prev.country || location.country,
        stateRegion: prev.stateRegion || location.state,
        city: prev.city || location.city,
      }));
    }
  }, [location.loading, location.country, location.state, location.city]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.termsAccepted) {
      toast.error("Please accept the terms and conditions");
      return;
    }

    setLoading(true);

    try {
      // Ensure authenticated user id is used for FK
      const { data: { user }, error: userErr } = await supabase.auth.getUser();
      if (userErr || !user) {
        throw new Error("Session expired. Please sign in again.");
      }
      const uid = user.id;

      // Calculate age group from date of birth
      let ageGroup = null as string | null;
      if (formData.dateOfBirth) {
        const birthDate = new Date(formData.dateOfBirth);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }

        if (age < 18) ageGroup = "13-17";
        else if (age < 25) ageGroup = "18-24";
        else if (age < 35) ageGroup = "25-34";
        else if (age < 45) ageGroup = "35-44";
        else ageGroup = "45+";
      }

      const { error } = await supabase
        .from("profiles")
        .upsert({
          id: uid,
          full_name: formData.fullName,
          email: formData.email,
          gender: formData.gender || null,
          date_of_birth: formData.dateOfBirth || null,
          country: formData.country,
          state_region: formData.stateRegion || "",
          city: formData.city || null,
          user_type: formData.userType,
          age_group: ageGroup,
          onboarding_completed: false,
        }, { onConflict: 'id' });

      if (error) throw error;


      toast.success("Basic profile created!");
      onComplete(formData);
    } catch (error: any) {
      toast.error(error.message || "Failed to create profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Complete Your Profile</h2>
        <p className="text-muted-foreground">Let's add a few more details to personalize your experience</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name *</Label>
          <Input
            id="fullName"
            required
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            placeholder="John Doe"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email Address *</Label>
          <Input
            id="email"
            type="email"
            required
            disabled
            value={formData.email}
            className="bg-muted"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="country">Country *</Label>
          <Input
            id="country"
            required
            value={formData.country}
            onChange={(e) => setFormData({ ...formData, country: e.target.value })}
            placeholder="United States"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="gender">Gender</Label>
          <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent className="bg-popover z-50">
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="other">Other</SelectItem>
              <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="dateOfBirth">Date of Birth</Label>
          <Input
            id="dateOfBirth"
            type="date"
            value={formData.dateOfBirth}
            onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="stateRegion">State / Region</Label>
          <Input
            id="stateRegion"
            value={formData.stateRegion}
            onChange={(e) => setFormData({ ...formData, stateRegion: e.target.value })}
            placeholder="California"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            placeholder="Los Angeles"
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="terms"
          checked={formData.termsAccepted}
          onCheckedChange={(checked) =>
            setFormData({ ...formData, termsAccepted: checked as boolean })
          }
        />
        <Label htmlFor="terms" className="text-sm cursor-pointer">
          I accept the Terms & Conditions *
        </Label>
      </div>

      <Button
        type="submit"
        className="w-full gradient-primary text-white border-0"
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating Profile...
          </>
        ) : (
          "Continue to Next Step"
        )}
      </Button>
    </form>
  );
};

export default StepOne;

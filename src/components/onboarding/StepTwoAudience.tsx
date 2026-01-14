import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface StepTwoAudienceProps {
  userId: string;
  onComplete: () => void;
}

const entertainmentOptions = ["Films", "Music", "TV Shows", "YouTube", "OTT", "Gaming", "Podcasts"];
const languages = ["English", "Spanish", "French", "German", "Chinese", "Japanese", "Hindi", "Telugu", "Tamil", "Arabic", "Portuguese"];
const genres = ["Action", "Drama", "Comedy", "Romance", "Thriller", "Horror", "Sci-Fi", "Fantasy", "Documentary"];
const platforms = ["YouTube", "Netflix", "Prime Video", "Disney+", "Spotify", "Instagram", "TikTok", "Twitch"];

const StepTwoAudience = ({ userId, onComplete }: StepTwoAudienceProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    gender: "",
    ageGroup: "",
    entertainmentPreferences: [] as string[],
    languagePreferences: [] as string[],
    genreInterests: [] as string[],
    favoritePlatforms: [] as string[],
    preferredDevices: [] as string[],
    contentFrequency: "",
    motivation: "",
    willingnessToParticipate: "yes",
    notificationPreferences: ["email", "in_app"] as string[],
  });

  const toggleSelection = (field: keyof typeof formData, value: string) => {
    const current = formData[field] as string[];
    const updated = current.includes(value)
      ? current.filter((item) => item !== value)
      : [...current, value];
    setFormData({ ...formData, [field]: updated });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.gender) {
      toast.error("Please select your gender");
      return;
    }

    if (!formData.ageGroup) {
      toast.error("Please select your age group");
      return;
    }

    if (formData.entertainmentPreferences.length === 0) {
      toast.error("Please select at least one entertainment preference");
      return;
    }

    if (formData.languagePreferences.length === 0 || formData.languagePreferences.length > 3) {
      toast.error("Please select 1-3 language preferences");
      return;
    }

    if (formData.genreInterests.length === 0) {
      toast.error("Please select at least one genre interest");
      return;
    }

    if (formData.preferredDevices.length === 0) {
      toast.error("Please select at least one preferred device");
      return;
    }

    setLoading(true);

    try {
      console.log("StepTwoAudience - Starting save for userId:", userId);
      
      // Update main profile with gender and age group
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          gender: formData.gender,
          age_group: formData.ageGroup,
        })
        .eq("id", userId);

      if (profileError) {
        console.error("Profile update error:", profileError);
        throw profileError;
      }

      console.log("Profile updated, now saving audience profile using upsert");

      // Use INSERT with ON CONFLICT to handle race conditions atomically
      const { error: upsertError } = await supabase
        .from("audience_profiles")
        .upsert({
          user_id: userId,
          entertainment_preferences: formData.entertainmentPreferences,
          language_preferences: formData.languagePreferences,
          genre_interests: formData.genreInterests,
          favorite_platforms: formData.favoritePlatforms,
          preferred_devices: formData.preferredDevices,
          content_frequency: formData.contentFrequency,
          motivation: formData.motivation || null,
          willingness_to_participate: formData.willingnessToParticipate,
          notification_preferences: formData.notificationPreferences,
        }, {
          onConflict: 'user_id',
          ignoreDuplicates: false  // This will update if exists
        });

      if (upsertError) {
        console.error("Upsert error:", upsertError);
        
        // If it's STILL a duplicate key error, try deleting and re-inserting
        if (upsertError.code === '23505') {
          console.log("Duplicate key detected despite upsert, attempting cleanup and retry");
          
          // Delete existing record
          const { error: deleteError } = await supabase
            .from("audience_profiles")
            .delete()
            .eq("user_id", userId);
            
          if (deleteError) {
            console.error("Delete error:", deleteError);
          }
          
          // Try insert again
          const { error: retryError } = await supabase
            .from("audience_profiles")
            .insert({
              user_id: userId,
              entertainment_preferences: formData.entertainmentPreferences,
              language_preferences: formData.languagePreferences,
              genre_interests: formData.genreInterests,
              favorite_platforms: formData.favoritePlatforms,
              preferred_devices: formData.preferredDevices,
              content_frequency: formData.contentFrequency,
              motivation: formData.motivation || null,
              willingness_to_participate: formData.willingnessToParticipate,
              notification_preferences: formData.notificationPreferences,
            });
            
          if (retryError) {
            console.error("Retry insert error:", retryError);
            throw retryError;
          }
        } else {
          throw upsertError;
        }
      }

      console.log("Audience profile saved successfully");
      toast.success("Profile saved successfully!");
      onComplete();
    } catch (error: any) {
      console.error("Audience profile save error:", error);
      toast.error(error.message || "Failed to save audience profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">👥 Audience Profile</h2>
        <p className="text-muted-foreground">Help us understand your entertainment taste so we can personalize your experience!</p>
      </div>

      <div className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="gender">Gender *</Label>
            <Select
              value={formData.gender}
              onValueChange={(value) => setFormData({ ...formData, gender: value })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent className="bg-popover z-50">
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
                <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ageGroup">Age Group *</Label>
            <Select
              value={formData.ageGroup}
              onValueChange={(value) => setFormData({ ...formData, ageGroup: value })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select age group" />
              </SelectTrigger>
              <SelectContent className="bg-popover z-50">
                <SelectItem value="13-17">13-17</SelectItem>
                <SelectItem value="18-24">18-24</SelectItem>
                <SelectItem value="25-34">25-34</SelectItem>
                <SelectItem value="35-44">35-44</SelectItem>
                <SelectItem value="45+">45+</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-3">
          <Label>Entertainment Preferences * (Select all that apply)</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {entertainmentOptions.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <Checkbox
                  id={`entertainment-${option}`}
                  checked={formData.entertainmentPreferences.includes(option)}
                  onCheckedChange={() => toggleSelection("entertainmentPreferences", option)}
                />
                <Label htmlFor={`entertainment-${option}`} className="cursor-pointer">
                  {option}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <Label>Language Preferences * (Select up to 3)</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {languages.map((lang) => (
              <div key={lang} className="flex items-center space-x-2">
                <Checkbox
                  id={`language-${lang}`}
                  checked={formData.languagePreferences.includes(lang)}
                  onCheckedChange={() => toggleSelection("languagePreferences", lang)}
                  disabled={
                    formData.languagePreferences.length >= 3 &&
                    !formData.languagePreferences.includes(lang)
                  }
                />
                <Label htmlFor={`language-${lang}`} className="cursor-pointer">
                  {lang}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <Label>Genre Interests * (Select all that apply)</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {genres.map((genre) => (
              <div key={genre} className="flex items-center space-x-2">
                <Checkbox
                  id={`genre-${genre}`}
                  checked={formData.genreInterests.includes(genre)}
                  onCheckedChange={() => toggleSelection("genreInterests", genre)}
                />
                <Label htmlFor={`genre-${genre}`} className="cursor-pointer">
                  {genre}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <Label>Favorite Platforms * (Select all that apply)</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {platforms.map((platform) => (
              <div key={platform} className="flex items-center space-x-2">
                <Checkbox
                  id={`platform-${platform}`}
                  checked={formData.favoritePlatforms.includes(platform)}
                  onCheckedChange={() => toggleSelection("favoritePlatforms", platform)}
                />
                <Label htmlFor={`platform-${platform}`} className="cursor-pointer">
                  {platform}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <Label>Preferred Devices * (Select all that apply)</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {["Mobile", "TV", "Laptop", "Tablet", "Desktop"].map((device) => (
              <div key={device} className="flex items-center space-x-2">
                <Checkbox
                  id={`device-${device}`}
                  checked={formData.preferredDevices.includes(device)}
                  onCheckedChange={() => toggleSelection("preferredDevices", device)}
                />
                <Label htmlFor={`device-${device}`} className="cursor-pointer">
                  {device}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="contentFrequency">Content Frequency *</Label>
          <Select
            value={formData.contentFrequency}
            onValueChange={(value) => setFormData({ ...formData, contentFrequency: value })}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="How often do you consume content?" />
            </SelectTrigger>
            <SelectContent className="bg-popover z-50">
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="occasionally">Occasionally</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="motivation">Motivation for Using INPHRONE</Label>
          <Textarea
            id="motivation"
            value={formData.motivation}
            onChange={(e) => setFormData({ ...formData, motivation: e.target.value })}
            placeholder="Tell us why you want to join INPHRONE..."
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="willingnessToParticipate">Willingness to Participate in Feedback Polls *</Label>
          <Select
            value={formData.willingnessToParticipate}
            onValueChange={(value) => setFormData({ ...formData, willingnessToParticipate: value })}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Select your preference" />
            </SelectTrigger>
            <SelectContent className="bg-popover z-50">
              <SelectItem value="yes">Yes</SelectItem>
              <SelectItem value="maybe">Maybe</SelectItem>
              <SelectItem value="no">No</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button
        type="submit"
        className="w-full gradient-primary text-white border-0"
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Completing Registration...
          </>
        ) : (
          "Complete Registration"
        )}
      </Button>
    </form>
  );
};

export default StepTwoAudience;
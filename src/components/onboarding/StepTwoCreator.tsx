import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface StepTwoCreatorProps {
  userId: string;
  onComplete: () => void;
}

const categories = ["Film", "YouTube", "OTT", "Music", "Gaming", "Social Media"];
const platforms = ["YouTube", "Instagram", "Spotify", "TikTok", "Facebook", "Twitter", "Twitch"];
const insights = ["Genre Trends", "Audience Behavior", "Demographics", "Future Content Demand"];

const StepTwoCreator = ({ userId, onComplete }: StepTwoCreatorProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    creatorName: "",
    creatorType: "",
    primaryCategory: "",
    industrySegment: "",
    activePlatforms: [] as string[],
    regionOfOperation: "",
    contentLanguages: [] as string[],
    audienceTargetGroup: "",
    experienceLevel: "",
    portfolioLink: "",
    insightInterests: [] as string[],
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

    if (formData.activePlatforms.length === 0) {
      toast.error("Please select at least one active platform");
      return;
    }

    if (formData.contentLanguages.length === 0) {
      toast.error("Please specify at least one content language");
      return;
    }

    if (formData.insightInterests.length === 0) {
      toast.error("Please select at least one insight interest");
      return;
    }

    setLoading(true);

    try {
      // First check if profile already exists
      const { data: existing } = await supabase
        .from("creator_profiles")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle();

      if (existing) {
        // Update existing profile
        const { error } = await supabase
          .from("creator_profiles")
          .update({
            creator_name: formData.creatorName,
            creator_type: formData.creatorType,
            primary_category: formData.primaryCategory,
            industry_segment: formData.industrySegment,
            active_platforms: formData.activePlatforms,
            region_of_operation: formData.regionOfOperation,
            content_languages: formData.contentLanguages,
            audience_target_group: formData.audienceTargetGroup || null,
            experience_level: formData.experienceLevel,
            portfolio_link: formData.portfolioLink,
            insight_interests: formData.insightInterests,
          })
          .eq("user_id", userId);

        if (error) throw error;
      } else {
        // Insert new profile
        const { error } = await supabase.from("creator_profiles").insert({
          user_id: userId,
          creator_name: formData.creatorName,
          creator_type: formData.creatorType,
          primary_category: formData.primaryCategory,
          industry_segment: formData.industrySegment,
          active_platforms: formData.activePlatforms,
          region_of_operation: formData.regionOfOperation,
          content_languages: formData.contentLanguages,
          audience_target_group: formData.audienceTargetGroup || null,
          experience_level: formData.experienceLevel,
          portfolio_link: formData.portfolioLink,
          insight_interests: formData.insightInterests,
        });

        if (error) throw error;
      }

      toast.success("Profile saved successfully!");
      onComplete();
    } catch (error: any) {
      console.error("Creator profile error:", error);
      toast.error(error.message || "Failed to save creator profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">🎨 Creator Profile</h2>
        <p className="text-muted-foreground">We'll customize insights for your creative field</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="creatorName">Creator Name / Brand Name *</Label>
          <Input
            id="creatorName"
            required
            value={formData.creatorName}
            onChange={(e) => setFormData({ ...formData, creatorName: e.target.value })}
            placeholder="Your channel or brand name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="creatorType">Creator Type *</Label>
          <Input
            id="creatorType"
            required
            value={formData.creatorType}
            onChange={(e) => setFormData({ ...formData, creatorType: e.target.value })}
            placeholder="e.g., YouTuber, Filmmaker, Musician"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="primaryCategory">Primary Category *</Label>
          <Select
            value={formData.primaryCategory}
            onValueChange={(value) => setFormData({ ...formData, primaryCategory: value })}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent className="bg-popover z-50">
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat.toLowerCase()}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="industrySegment">Industry Segment *</Label>
          <Input
            id="industrySegment"
            required
            value={formData.industrySegment}
            onChange={(e) => setFormData({ ...formData, industrySegment: e.target.value })}
            placeholder="e.g., Independent, Studio-backed"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="regionOfOperation">Region of Operation *</Label>
          <Input
            id="regionOfOperation"
            required
            value={formData.regionOfOperation}
            onChange={(e) => setFormData({ ...formData, regionOfOperation: e.target.value })}
            placeholder="Country or region"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="experienceLevel">Experience Level *</Label>
          <Select
            value={formData.experienceLevel}
            onValueChange={(value) => setFormData({ ...formData, experienceLevel: value })}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Select experience level" />
            </SelectTrigger>
            <SelectContent className="bg-popover z-50">
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="professional">Professional</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="portfolioLink">Portfolio or Channel Link *</Label>
          <Input
            id="portfolioLink"
            required
            type="url"
            value={formData.portfolioLink}
            onChange={(e) => setFormData({ ...formData, portfolioLink: e.target.value })}
            placeholder="https://youtube.com/@yourchannel"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="audienceTargetGroup">Audience Target Group</Label>
          <Input
            id="audienceTargetGroup"
            value={formData.audienceTargetGroup}
            onChange={(e) => setFormData({ ...formData, audienceTargetGroup: e.target.value })}
            placeholder="e.g., Young adults, Global audience"
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-3">
          <Label>Active Platforms * (Select all that apply)</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {platforms.map((platform) => (
              <div key={platform} className="flex items-center space-x-2">
                <Checkbox
                  id={`platform-${platform}`}
                  checked={formData.activePlatforms.includes(platform)}
                  onCheckedChange={() => toggleSelection("activePlatforms", platform)}
                />
                <Label htmlFor={`platform-${platform}`} className="cursor-pointer">
                  {platform}
                </Label>
              </div>
            ))}
          </div>
        </div>

          <div className="space-y-3">
            <Label>Content Languages * (Select all that apply)</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {["English", "Spanish", "French", "Hindi", "Telugu", "Chinese", "Arabic"].map((lang) => (
                <div key={lang} className="flex items-center space-x-2">
                  <Checkbox
                    id={`lang-${lang}`}
                    checked={formData.contentLanguages.includes(lang)}
                    onCheckedChange={() => toggleSelection("contentLanguages", lang)}
                  />
                  <Label htmlFor={`lang-${lang}`} className="cursor-pointer">
                    {lang}
                  </Label>
                </div>
              ))}
            </div>
          </div>

        <div className="space-y-3">
          <Label>Interest in Insights * (Select all that apply)</Label>
          <div className="grid grid-cols-2 gap-3">
            {insights.map((insight) => (
              <div key={insight} className="flex items-center space-x-2">
                <Checkbox
                  id={`insight-${insight}`}
                  checked={formData.insightInterests.includes(insight)}
                  onCheckedChange={() => toggleSelection("insightInterests", insight)}
                />
                <Label htmlFor={`insight-${insight}`} className="cursor-pointer">
                  {insight}
                </Label>
              </div>
            ))}
          </div>
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

export default StepTwoCreator;
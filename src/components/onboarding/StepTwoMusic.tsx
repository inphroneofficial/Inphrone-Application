import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface StepTwoMusicProps {
  userId: string;
  onComplete: () => void;
}

const contentTypes = ["Albums", "Singles", "Music Videos", "Live Concerts", "Podcasts", "Audio Content"];
const insights = ["Listening Habits", "Genre Trends", "Regional Preferences", "Artist Popularity", "Platform Analytics"];

const StepTwoMusic = ({ userId, onComplete }: StepTwoMusicProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    organizationName: "",
    organizationType: "",
    officialContactEmail: "",
    headquartersLocation: "",
    operationRegions: [] as string[],
    teamSize: "",
    contentFocus: [] as string[],
    preferredInsights: [] as string[],
    dataAccessRole: "",
    websiteLink: "",
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

    if (formData.operationRegions.length === 0) {
      toast.error("Please specify at least one operation region");
      return;
    }

    if (formData.contentFocus.length === 0) {
      toast.error("Please select at least one content focus");
      return;
    }

    if (formData.preferredInsights.length === 0) {
      toast.error("Please select at least one preferred insight");
      return;
    }

    setLoading(true);

    try {
      // Verify user is authenticated
      const { data: { user }, error: userErr } = await supabase.auth.getUser();
      if (userErr || !user) {
        throw new Error("Session expired. Please sign in again.");
      }

      const { error } = await supabase.from("music_profiles").upsert({
        user_id: user.id,
        organization_name: formData.organizationName,
        organization_type: formData.organizationType,
        official_contact_email: formData.officialContactEmail,
        headquarters_location: formData.headquartersLocation,
        operation_regions: formData.operationRegions,
        team_size: formData.teamSize,
        content_focus: formData.contentFocus,
        preferred_insights: formData.preferredInsights,
        data_access_role: formData.dataAccessRole,
        website_link: formData.websiteLink,
      }, {
        onConflict: 'user_id'
      });

      if (error) {
        console.error("Music profile insert error:", error);
        throw error;
      }

      toast.success("Music profile created successfully!");
      onComplete();
    } catch (error: any) {
      console.error("Music profile error:", error);
      toast.error(error.message || "Failed to save music profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">🎵 Music Organization Profile</h2>
        <p className="text-muted-foreground">Tell us about your music organization to help you access relevant audience insights!</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="organizationName">Organization Name *</Label>
          <Input
            id="organizationName"
            value={formData.organizationName}
            onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
            placeholder="e.g., Universal Music, Sony Music"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="organizationType">Organization Type *</Label>
          <Select
            value={formData.organizationType}
            onValueChange={(value) => setFormData({ ...formData, organizationType: value })}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Select organization type" />
            </SelectTrigger>
            <SelectContent className="bg-popover z-50">
              <SelectItem value="label">Record Label</SelectItem>
              <SelectItem value="publisher">Music Publisher</SelectItem>
              <SelectItem value="distributor">Music Distributor</SelectItem>
              <SelectItem value="streaming">Streaming Platform</SelectItem>
              <SelectItem value="production">Music Production House</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="officialContactEmail">Official Contact Email *</Label>
          <Input
            id="officialContactEmail"
            type="email"
            value={formData.officialContactEmail}
            onChange={(e) => setFormData({ ...formData, officialContactEmail: e.target.value })}
            placeholder="contact@label.com"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="headquartersLocation">Headquarters Location *</Label>
          <Input
            id="headquartersLocation"
            value={formData.headquartersLocation}
            onChange={(e) => setFormData({ ...formData, headquartersLocation: e.target.value })}
            placeholder="e.g., Nashville, TN"
            required
          />
        </div>

        <div className="space-y-3">
          <Label>Operation Regions * (Select all that apply)</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {["North America", "Europe", "Asia", "Middle East", "Africa", "South America", "Australia"].map((region) => (
              <div key={region} className="flex items-center space-x-2">
                <Checkbox
                  id={`region-${region}`}
                  checked={formData.operationRegions.includes(region)}
                  onCheckedChange={() => toggleSelection("operationRegions", region)}
                />
                <Label htmlFor={`region-${region}`} className="cursor-pointer">
                  {region}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="teamSize">Team Size *</Label>
          <Select
            value={formData.teamSize}
            onValueChange={(value) => setFormData({ ...formData, teamSize: value })}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Select team size" />
            </SelectTrigger>
            <SelectContent className="bg-popover z-50">
              <SelectItem value="1-10">1-10</SelectItem>
              <SelectItem value="11-50">11-50</SelectItem>
              <SelectItem value="51-200">51-200</SelectItem>
              <SelectItem value="201-500">201-500</SelectItem>
              <SelectItem value="500+">500+</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <Label>Content Focus * (Select all that apply)</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {contentTypes.map((type) => (
              <div key={type} className="flex items-center space-x-2">
                <Checkbox
                  id={`content-${type}`}
                  checked={formData.contentFocus.includes(type)}
                  onCheckedChange={() => toggleSelection("contentFocus", type)}
                />
                <Label htmlFor={`content-${type}`} className="cursor-pointer">
                  {type}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <Label>Preferred Insights * (Select all that apply)</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {insights.map((insight) => (
              <div key={insight} className="flex items-center space-x-2">
                <Checkbox
                  id={`insight-${insight}`}
                  checked={formData.preferredInsights.includes(insight)}
                  onCheckedChange={() => toggleSelection("preferredInsights", insight)}
                />
                <Label htmlFor={`insight-${insight}`} className="cursor-pointer">
                  {insight}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="dataAccessRole">Your Role *</Label>
          <Select
            value={formData.dataAccessRole}
            onValueChange={(value) => setFormData({ ...formData, dataAccessRole: value })}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Select your role" />
            </SelectTrigger>
            <SelectContent className="bg-popover z-50">
              <SelectItem value="a&r-director">A&R Director</SelectItem>
              <SelectItem value="label-manager">Label Manager</SelectItem>
              <SelectItem value="data-analyst">Data Analyst</SelectItem>
              <SelectItem value="ceo-founder">CEO/Founder</SelectItem>
              <SelectItem value="marketing-head">Marketing Head</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="websiteLink">Organization Website *</Label>
          <Input
            id="websiteLink"
            type="url"
            value={formData.websiteLink}
            onChange={(e) => setFormData({ ...formData, websiteLink: e.target.value })}
            placeholder="https://yourlabel.com"
            required
          />
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

export default StepTwoMusic;

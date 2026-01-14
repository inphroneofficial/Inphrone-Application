import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface StepTwoStudioProps {
  userId: string;
  onComplete: () => void;
}

const contentTypes = ["Films", "Series", "Documentaries", "Music", "Gaming", "Mixed"];
const insights = ["Trend Forecasting", "Regional Preferences", "Genre Demand", "Audience Sentiment"];

const StepTwoStudio = ({ userId, onComplete }: StepTwoStudioProps) => {
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
      const { error } = await supabase.from("studio_profiles").upsert({
        user_id: userId,
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

      if (error) throw error;

      onComplete();
    } catch (error: any) {
      toast.error(error.message || "Failed to save studio profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">🎬 Studio / Platform Profile</h2>
        <p className="text-muted-foreground">Gain insights that can guide your next production</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="organizationName">Organization Name *</Label>
          <Input
            id="organizationName"
            required
            value={formData.organizationName}
            onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
            placeholder="Your studio or company name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="organizationType">Type *</Label>
          <Input
            id="organizationType"
            required
            value={formData.organizationType}
            onChange={(e) => setFormData({ ...formData, organizationType: e.target.value })}
            placeholder="e.g., Film Studio, OTT, Media House"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="officialContactEmail">Official Contact Email *</Label>
          <Input
            id="officialContactEmail"
            type="email"
            required
            value={formData.officialContactEmail}
            onChange={(e) => setFormData({ ...formData, officialContactEmail: e.target.value })}
            placeholder="contact@company.com"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="headquartersLocation">Country / Headquarters Location *</Label>
          <Input
            id="headquartersLocation"
            required
            value={formData.headquartersLocation}
            onChange={(e) => setFormData({ ...formData, headquartersLocation: e.target.value })}
            placeholder="e.g., United States"
          />
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
              <SelectItem value="10-50">10-50</SelectItem>
              <SelectItem value="50-200">50-200</SelectItem>
              <SelectItem value="200+">200+</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="dataAccessRole">Data Access Role *</Label>
          <Input
            id="dataAccessRole"
            required
            value={formData.dataAccessRole}
            onChange={(e) => setFormData({ ...formData, dataAccessRole: e.target.value })}
            placeholder="e.g., Admin, Analyst, Marketing"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="websiteLink">Website / Portfolio Link *</Label>
          <Input
            id="websiteLink"
            required
            type="url"
            value={formData.websiteLink}
            onChange={(e) => setFormData({ ...formData, websiteLink: e.target.value })}
            placeholder="https://yourcompany.com"
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-3">
          <Label>Operation Regions * (Enter manually)</Label>
          <Input
            placeholder="e.g., North America, Europe, Asia (comma separated)"
            value={formData.operationRegions.join(", ")}
            onChange={(e) =>
              setFormData({
                ...formData,
                operationRegions: e.target.value.split(",").map((r) => r.trim()),
              })
            }
          />
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
          <div className="grid grid-cols-2 gap-3">
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

export default StepTwoStudio;
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface StepTwoDeveloperProps {
  userId: string;
  onComplete: () => void;
}

const organizationTypes = [
  "Indie Developer",
  "Software Development Company",
  "Startup",
  "Enterprise",
  "Agency",
  "Consulting Firm",
  "Open Source Organization",
  "Freelancer/Solo Developer"
];

const teamSizes = [
  "Solo (1)",
  "Small (2-10)",
  "Medium (11-50)",
  "Large (51-200)",
  "Enterprise (200+)"
];

const contentFocusOptions = [
  "Mobile Apps (iOS/Android)",
  "Web Applications",
  "Desktop Applications",
  "Cross-Platform Apps",
  "SaaS Products",
  "Enterprise Software",
  "Consumer Apps",
  "B2B Solutions",
  "Games",
  "AI/ML Applications",
  "IoT & Embedded",
  "Blockchain/Web3"
];

const insightOptions = [
  "User needs and pain points",
  "Feature priorities",
  "Pricing preferences",
  "Platform preferences",
  "UX/UI expectations",
  "Market trends",
  "Competitor analysis",
  "Target demographics"
];

const regionOptions = [
  "North America",
  "Europe",
  "Asia Pacific",
  "Latin America",
  "Middle East",
  "Africa",
  "Global"
];

const dataAccessRoles = [
  "Product Manager",
  "Developer",
  "Designer",
  "Business Analyst",
  "Founder/CEO",
  "Marketing",
  "Research"
];

const StepTwoDeveloper = ({ userId, onComplete }: StepTwoDeveloperProps) => {
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

  const handleArrayToggle = (field: "operationRegions" | "contentFocus" | "preferredInsights", value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.organizationName || !formData.organizationType || !formData.officialContactEmail || 
        !formData.headquartersLocation || formData.operationRegions.length === 0 || !formData.teamSize ||
        formData.contentFocus.length === 0 || formData.preferredInsights.length === 0 || !formData.dataAccessRole) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!userId) {
      toast.error("User session not found. Please sign in again.");
      return;
    }

    setLoading(true);

    try {
      // First verify the profile exists
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", userId)
        .single();

      if (profileError || !profile) {
        throw new Error("Profile not found. Please complete the previous step first.");
      }

      const { error } = await supabase
        .from("developer_profiles")
        .upsert({
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
          website_link: formData.websiteLink || "",
        }, { onConflict: 'user_id' });

      if (error) {
        console.error("Developer profile insert error:", error);
        throw error;
      }

      toast.success("Developer profile created successfully!");
      onComplete();
    } catch (error: any) {
      console.error("Developer profile creation failed:", error);
      toast.error(error.message || "Failed to save profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Developer Profile Setup</h2>
        <p className="text-muted-foreground">Tell us about your development work to get relevant app development insights</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="organizationName">Organization / Developer Name *</Label>
          <Input
            id="organizationName"
            required
            value={formData.organizationName}
            onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
            placeholder="Your company or developer name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="organizationType">Organization Type *</Label>
          <Select value={formData.organizationType} onValueChange={(value) => setFormData({ ...formData, organizationType: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent className="bg-popover z-50">
              {organizationTypes.map(type => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Official Contact Email *</Label>
          <Input
            id="email"
            type="email"
            required
            value={formData.officialContactEmail}
            onChange={(e) => setFormData({ ...formData, officialContactEmail: e.target.value })}
            placeholder="contact@yourcompany.com"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="headquarters">Headquarters Location *</Label>
          <Input
            id="headquarters"
            required
            value={formData.headquartersLocation}
            onChange={(e) => setFormData({ ...formData, headquartersLocation: e.target.value })}
            placeholder="City, Country"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="teamSize">Team Size *</Label>
          <Select value={formData.teamSize} onValueChange={(value) => setFormData({ ...formData, teamSize: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select team size" />
            </SelectTrigger>
            <SelectContent className="bg-popover z-50">
              {teamSizes.map(size => (
                <SelectItem key={size} value={size}>{size}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="dataAccessRole">Your Role *</Label>
          <Select value={formData.dataAccessRole} onValueChange={(value) => setFormData({ ...formData, dataAccessRole: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select your role" />
            </SelectTrigger>
            <SelectContent className="bg-popover z-50">
              {dataAccessRoles.map(role => (
                <SelectItem key={role} value={role}>{role}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="website">Website (Optional)</Label>
        <Input
          id="website"
          type="url"
          value={formData.websiteLink}
          onChange={(e) => setFormData({ ...formData, websiteLink: e.target.value })}
          placeholder="https://yourcompany.com"
        />
      </div>

      <div className="space-y-3">
        <Label>Operation Regions *</Label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {regionOptions.map(region => (
            <div key={region} className="flex items-center space-x-2">
              <Checkbox
                id={`region-${region}`}
                checked={formData.operationRegions.includes(region)}
                onCheckedChange={() => handleArrayToggle("operationRegions", region)}
              />
              <Label htmlFor={`region-${region}`} className="text-sm cursor-pointer">{region}</Label>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <Label>Development Focus *</Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {contentFocusOptions.map(focus => (
            <div key={focus} className="flex items-center space-x-2">
              <Checkbox
                id={`focus-${focus}`}
                checked={formData.contentFocus.includes(focus)}
                onCheckedChange={() => handleArrayToggle("contentFocus", focus)}
              />
              <Label htmlFor={`focus-${focus}`} className="text-sm cursor-pointer">{focus}</Label>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <Label>What Insights Do You Want? *</Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {insightOptions.map(insight => (
            <div key={insight} className="flex items-center space-x-2">
              <Checkbox
                id={`insight-${insight}`}
                checked={formData.preferredInsights.includes(insight)}
                onCheckedChange={() => handleArrayToggle("preferredInsights", insight)}
              />
              <Label htmlFor={`insight-${insight}`} className="text-sm cursor-pointer">{insight}</Label>
            </div>
          ))}
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
            Creating Profile...
          </>
        ) : (
          "Complete Setup"
        )}
      </Button>
    </form>
  );
};

export default StepTwoDeveloper;
import { FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";
import { Control } from "react-hook-form";

interface AppDevelopmentOpinionFormProps {
  control: Control<any>;
}

// Types of apps users want
const appTypes = [
  "Productivity & Organization", "Health & Fitness", "Finance & Banking",
  "Social Networking", "Education & Learning", "Entertainment & Media",
  "Shopping & E-commerce", "Travel & Navigation", "Food & Delivery",
  "Communication & Messaging", "Utility Tools", "Smart Home & IoT",
  "Gaming", "Photography & Video", "Music & Audio", "News & Reading",
  "Business & Professional", "Lifestyle & Personal", "Parenting & Kids",
  "Dating & Relationships"
];

// Real-world problems users face
const realWorldProblems = [
  "Time management & scheduling", "Tracking expenses & budgeting",
  "Finding reliable local services", "Learning new skills effectively",
  "Managing health & wellness", "Staying connected with family/friends",
  "Finding best deals & discounts", "Home organization & maintenance",
  "Career development & job search", "Mental health & stress management",
  "Language barriers & translation", "Remembering important tasks/dates",
  "Finding trusted reviews/recommendations", "Managing subscriptions & bills",
  "Accessibility for disabilities", "Environmental sustainability",
  "Child safety & education", "Community building & volunteering",
  "Travel planning & booking", "Document management & paperwork"
];

// Features users expect
const expectedFeatures = [
  "Offline functionality", "Voice commands & AI assistant",
  "Cross-platform sync", "Dark mode", "Customizable notifications",
  "Data privacy & security", "Easy onboarding", "Widget support",
  "Social sharing", "Multi-language support", "Biometric authentication",
  "Smart recommendations", "Analytics & insights", "Cloud backup",
  "Minimalist design", "Gamification & rewards", "Family sharing",
  "Integration with other apps", "Quick actions & shortcuts",
  "Accessibility features", "Low battery usage", "Affordable pricing"
];

// Platforms users prefer
const platforms = [
  "iOS (iPhone/iPad)", "Android", "Web App", "Desktop (Windows/Mac)",
  "Cross-Platform (All devices)", "Wearables (Smartwatch)"
];

// Pricing preferences
const pricingPreferences = [
  "Free with ads", "Freemium (Basic free, Premium paid)",
  "One-time purchase", "Monthly subscription", "Annual subscription",
  "Pay-per-use", "No preference"
];

// Age groups the app should target
const targetAgeGroups = [
  "Kids (5-12)", "Teens (13-17)", "Young Adults (18-24)",
  "Adults (25-44)", "Middle-aged (45-64)", "Seniors (65+)", "All ages"
];

export function AppDevelopmentOpinionForm({ control }: AppDevelopmentOpinionFormProps) {
  return (
    <div className="space-y-6">
      <FormField
        control={control}
        name="preferences.appTypes"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-semibold">What Type of Apps Do You Want? *</FormLabel>
            <p className="text-sm text-muted-foreground mb-3">Select all categories that interest you</p>
            <div className="flex flex-wrap gap-2">
              {appTypes.map((type) => {
                const selected = Array.isArray(field.value) ? field.value.includes(type) : false;
                return (
                  <Badge
                    key={type}
                    onClick={() => {
                      const current = Array.isArray(field.value) ? field.value : [];
                      if (selected) {
                        field.onChange(current.filter((t: string) => t !== type));
                      } else {
                        field.onChange([...current, type]);
                      }
                    }}
                    className={`cursor-pointer transition-all py-1.5 px-3 ${
                      selected ? 'gradient-primary text-white border-0 shadow-md' : 'bg-muted hover:bg-muted/80 text-foreground border hover:border-primary/30'
                    }`}
                  >
                    {type}
                  </Badge>
                );
              })}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="preferences.realWorldProblems"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-semibold">What Problems Do You Face Daily? *</FormLabel>
            <p className="text-sm text-muted-foreground mb-3">Select problems you want apps to solve</p>
            <div className="flex flex-wrap gap-2">
              {realWorldProblems.map((problem) => {
                const selected = Array.isArray(field.value) ? field.value.includes(problem) : false;
                return (
                  <Badge
                    key={problem}
                    onClick={() => {
                      const current = Array.isArray(field.value) ? field.value : [];
                      if (selected) {
                        field.onChange(current.filter((p: string) => p !== problem));
                      } else {
                        field.onChange([...current, problem]);
                      }
                    }}
                    className={`cursor-pointer transition-all py-1.5 px-3 ${
                      selected ? 'gradient-accent text-white border-0 shadow-md' : 'bg-muted hover:bg-muted/80 text-foreground border hover:border-primary/30'
                    }`}
                  >
                    {problem}
                  </Badge>
                );
              })}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="preferences.expectedFeatures"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-semibold">What Features Do You Expect? *</FormLabel>
            <p className="text-sm text-muted-foreground mb-3">Select must-have features</p>
            <div className="flex flex-wrap gap-2">
              {expectedFeatures.map((feature) => {
                const selected = Array.isArray(field.value) ? field.value.includes(feature) : false;
                return (
                  <Badge
                    key={feature}
                    onClick={() => {
                      const current = Array.isArray(field.value) ? field.value : [];
                      if (selected) {
                        field.onChange(current.filter((f: string) => f !== feature));
                      } else {
                        field.onChange([...current, feature]);
                      }
                    }}
                    className={`cursor-pointer transition-all py-1.5 px-3 ${
                      selected ? 'gradient-primary text-white border-0 shadow-md' : 'bg-muted hover:bg-muted/80 text-foreground border hover:border-primary/30'
                    }`}
                  >
                    {feature}
                  </Badge>
                );
              })}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="preferences.platform"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-semibold">Preferred Platform *</FormLabel>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {platforms.map((platform) => {
                const selected = Array.isArray(field.value) ? field.value.includes(platform) : false;
                return (
                  <Card
                    key={platform}
                    onClick={() => {
                      const current = Array.isArray(field.value) ? field.value : [];
                      if (selected) {
                        field.onChange(current.filter((p: string) => p !== platform));
                      } else {
                        field.onChange([...current, platform]);
                      }
                    }}
                    className={`p-3 cursor-pointer transition-all text-center ${
                      selected ? 'border-primary bg-primary/5 shadow-md' : 'hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      {selected && <Check className="w-4 h-4 text-primary" />}
                      <span className="text-xs sm:text-sm font-medium">{platform}</span>
                    </div>
                  </Card>
                );
              })}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="preferences.pricingPreference"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-semibold">Pricing Preference *</FormLabel>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {pricingPreferences.map((pricing) => {
                const selected = field.value === pricing;
                return (
                  <Card
                    key={pricing}
                    onClick={() => field.onChange(selected ? "" : pricing)}
                    className={`p-3 cursor-pointer transition-all text-center ${
                      selected ? 'border-primary bg-primary/5 shadow-md' : 'hover:border-primary/50'
                    }`}
                  >
                    <span className="text-xs sm:text-sm font-medium">{pricing}</span>
                  </Card>
                );
              })}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="preferences.targetAgeGroup"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-semibold">Who Should the App Target? *</FormLabel>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {targetAgeGroups.map((age) => {
                const selected = Array.isArray(field.value) ? field.value.includes(age) : false;
                return (
                  <Card
                    key={age}
                    onClick={() => {
                      const current = Array.isArray(field.value) ? field.value : [];
                      if (selected) {
                        field.onChange(current.filter((a: string) => a !== age));
                      } else {
                        field.onChange([...current, age]);
                      }
                    }}
                    className={`p-3 cursor-pointer transition-all text-center ${
                      selected ? 'border-primary bg-primary/5 shadow-md' : 'hover:border-primary/50'
                    }`}
                  >
                    <span className="text-xs sm:text-sm font-medium">{age}</span>
                  </Card>
                );
              })}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="would_pay"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-semibold">Would You Pay for Quality Apps? *</FormLabel>
            <div className="grid grid-cols-3 gap-2">
              {["Yes, gladly", "Maybe, if worth it", "Prefer free only"].map((option) => {
                const value = option.startsWith("Yes") ? true : option.startsWith("Prefer") ? false : null;
                const selected = field.value === value;
                return (
                  <Card
                    key={option}
                    onClick={() => field.onChange(value)}
                    className={`p-3 cursor-pointer transition-all text-center ${
                      selected ? 'border-green-500 bg-green-500/5 shadow-md' : 'hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      {selected && <Check className="w-4 h-4 text-green-500" />}
                      <span className="text-xs sm:text-sm font-medium">{option}</span>
                    </div>
                  </Card>
                );
              })}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
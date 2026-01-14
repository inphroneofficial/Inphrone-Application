import { FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";
import { Control } from "react-hook-form";

interface YouTubeOpinionFormProps {
  control: Control<any>;
}

// Global video types covering all content categories
const videoTypes = [
  "Vlogs", "Educational", "Short Films", "Reviews", "Tech", "Lifestyle", 
  "Comedy", "Music", "Animation", "Gaming", "Reaction", "Motivational", 
  "Podcasts", "Tutorials", "Documentary", "Travel", "Food/Cooking", 
  "Fitness/Health", "Fashion/Beauty", "News/Commentary", "ASMR", 
  "DIY/Crafts", "Science", "Finance/Investing", "True Crime", 
  "Sports", "Kids Content", "Cars/Automotive", "Art/Creative"
];

// Video length preferences
const videoLengths = [
  "Shorts (<1 min)", 
  "Quick (1-5 min)", 
  "Medium (5-10 min)", 
  "Standard (10-20 min)", 
  "Long (20-40 min)", 
  "Extended (40+ min)"
];

// Global content tones
const tones = [
  "Informative", "Entertaining", "Emotional", "Cinematic", "Experimental", 
  "Casual", "Professional", "Humorous", "Inspirational", "Raw/Authentic", 
  "Dramatic", "Relaxing"
];

// Creator types
const creatorTypes = [
  "Solo Creator", "Duo/Partner", "Studio Channel", "Collaboration", 
  "Family Channel", "Celebrity/Influencer", "Expert/Professional", 
  "Brand Channel", "News Organization"
];

// Platform interaction preferences
const interactions = [
  "YouTube Videos", "YouTube Shorts", "Live Streams", "Premieres", 
  "Community Posts", "Stories", "Podcasts on YouTube"
];

// Viewing frequency
const frequencies = ["Multiple times daily", "Daily", "Weekly", "Monthly", "Occasional"];

// Viewing devices
const devices = ["Mobile Phone", "Tablet", "Smart TV", "Desktop/Laptop", "Gaming Console"];

// Global languages covering major YouTube markets
const languages = [
  "English", "Spanish", "Portuguese", "Hindi", "Arabic", "Russian", 
  "Japanese", "Korean", "French", "German", "Italian", "Turkish", 
  "Indonesian", "Vietnamese", "Thai", "Polish", "Dutch", "Swedish",
  "Tamil", "Telugu", "Bengali", "Marathi", "Punjabi", "Mandarin",
  "Cantonese", "Filipino", "Malay", "Persian"
];

// Content preferences
const contentPreferences = [
  "Trending/Viral", "Niche/Specialized", "Educational", "Pure Entertainment",
  "News/Current Events", "How-To/Practical", "Story-Based", "Challenge/Experiment"
];

// Ad preferences
const adPreferences = [
  "Don't mind ads", "Skip when possible", "Use YouTube Premium", 
  "Watch full ads if content is free", "Prefer ad-free content"
];

export function YouTubeOpinionForm({ control }: YouTubeOpinionFormProps) {
  return (
    <div className="space-y-6">
      <FormField
        control={control}
        name="preferences.videoType"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-semibold">Content Types You Enjoy *</FormLabel>
            <p className="text-sm text-muted-foreground mb-3">Select all that apply</p>
            <div className="flex flex-wrap gap-2">
              {videoTypes.map((type) => {
                const selected = Array.isArray(field.value) ? field.value.includes(type) : field.value === type;
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
        name="preferences.videoLength"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-semibold">Preferred Video Length *</FormLabel>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {videoLengths.map((length) => {
                const selected = field.value === length;
                return (
                  <Card
                    key={length}
                    onClick={() => field.onChange(selected ? "" : length)}
                    className={`p-3 cursor-pointer transition-all text-center ${
                      selected ? 'border-primary bg-primary/5 shadow-md' : 'hover:border-primary/50'
                    }`}
                  >
                    <span className="text-sm font-medium">{length}</span>
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
        name="preferences.tone"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-semibold">Content Tone Preference *</FormLabel>
            <div className="flex flex-wrap gap-2">
              {tones.map((tone) => {
                const selected = Array.isArray(field.value) ? field.value.includes(tone) : field.value === tone;
                return (
                  <Badge
                    key={tone}
                    onClick={() => {
                      const current = Array.isArray(field.value) ? field.value : [];
                      if (selected) {
                        field.onChange(current.filter((t: string) => t !== tone));
                      } else {
                        field.onChange([...current, tone]);
                      }
                    }}
                    className={`cursor-pointer transition-all py-1.5 px-3 ${
                      selected ? 'gradient-accent text-white border-0 shadow-md' : 'bg-muted hover:bg-muted/80 text-foreground border hover:border-primary/30'
                    }`}
                  >
                    {tone}
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
        name="preferences.creatorType"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-semibold">Preferred Creator Types *</FormLabel>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {creatorTypes.map((type) => {
                const selected = Array.isArray(field.value) ? field.value.includes(type) : field.value === type;
                return (
                  <Card
                    key={type}
                    onClick={() => {
                      const current = Array.isArray(field.value) ? field.value : [];
                      if (selected) {
                        field.onChange(current.filter((t: string) => t !== type));
                      } else {
                        field.onChange([...current, type]);
                      }
                    }}
                    className={`p-3 cursor-pointer transition-all text-center ${
                      selected ? 'border-primary bg-primary/5 shadow-md' : 'hover:border-primary/50'
                    }`}
                  >
                    <span className="text-sm font-medium">{type}</span>
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
        name="preferences.interaction"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-semibold">Platform Features You Use *</FormLabel>
            <div className="flex flex-wrap gap-2">
              {interactions.map((interaction) => {
                const selected = Array.isArray(field.value) ? field.value.includes(interaction) : field.value === interaction;
                return (
                  <Badge
                    key={interaction}
                    onClick={() => {
                      const current = Array.isArray(field.value) ? field.value : [];
                      if (selected) {
                        field.onChange(current.filter((i: string) => i !== interaction));
                      } else {
                        field.onChange([...current, interaction]);
                      }
                    }}
                    className={`cursor-pointer transition-all py-1.5 px-3 ${
                      selected ? 'gradient-primary text-white border-0 shadow-md' : 'bg-muted hover:bg-muted/80 text-foreground border hover:border-primary/30'
                    }`}
                  >
                    {interaction}
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
        name="preferences.contentPreference"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-semibold">Content Discovery Preference *</FormLabel>
            <div className="flex flex-wrap gap-2">
              {contentPreferences.map((pref) => {
                const selected = Array.isArray(field.value) ? field.value.includes(pref) : field.value === pref;
                return (
                  <Badge
                    key={pref}
                    onClick={() => {
                      const current = Array.isArray(field.value) ? field.value : [];
                      if (selected) {
                        field.onChange(current.filter((p: string) => p !== pref));
                      } else {
                        field.onChange([...current, pref]);
                      }
                    }}
                    className={`cursor-pointer transition-all py-1.5 px-3 ${
                      selected ? 'gradient-accent text-white border-0 shadow-md' : 'bg-muted hover:bg-muted/80 text-foreground border hover:border-primary/30'
                    }`}
                  >
                    {pref}
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
        name="preferences.frequency"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-semibold">Viewing Frequency *</FormLabel>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {frequencies.map((freq) => {
                const selected = field.value === freq;
                return (
                  <Card
                    key={freq}
                    onClick={() => field.onChange(selected ? "" : freq)}
                    className={`p-3 cursor-pointer transition-all text-center ${
                      selected ? 'border-primary bg-primary/5 shadow-md' : 'hover:border-primary/50'
                    }`}
                  >
                    <span className="text-sm font-medium">{freq}</span>
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
            <FormLabel className="text-base font-semibold">YouTube Premium / Creator Support *</FormLabel>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {["Yes, I'd subscribe", "No, prefer free", "Support via Patreon/Memberships"].map((option) => {
                const value = option.startsWith("Yes") ? true : option.startsWith("No") ? false : null;
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

      <FormField
        control={control}
        name="preferences.adPreference"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-semibold">Ad Preference *</FormLabel>
            <div className="grid grid-cols-2 gap-2">
              {adPreferences.map((pref) => {
                const selected = field.value === pref;
                return (
                  <Card
                    key={pref}
                    onClick={() => field.onChange(selected ? "" : pref)}
                    className={`p-3 cursor-pointer transition-all text-center ${
                      selected ? 'border-primary bg-primary/5 shadow-md' : 'hover:border-primary/50'
                    }`}
                  >
                    <span className="text-xs sm:text-sm font-medium">{pref}</span>
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
        name="preferences.device"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-semibold">Viewing Devices *</FormLabel>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {devices.map((device) => {
                const selected = Array.isArray(field.value) ? field.value.includes(device) : field.value === device;
                return (
                  <Card
                    key={device}
                    onClick={() => {
                      const current = Array.isArray(field.value) ? field.value : [];
                      if (selected) {
                        field.onChange(current.filter((d: string) => d !== device));
                      } else {
                        field.onChange([...current, device]);
                      }
                    }}
                    className={`p-3 cursor-pointer transition-all text-center ${
                      selected ? 'border-primary bg-primary/5 shadow-md' : 'hover:border-primary/50'
                    }`}
                  >
                    <span className="text-sm font-medium">{device}</span>
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
        name="preferences.language"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-semibold">Preferred Languages *</FormLabel>
            <p className="text-sm text-muted-foreground mb-3">Select all languages you watch content in</p>
            <div className="flex flex-wrap gap-2">
              {languages.map((lang) => {
                const selected = Array.isArray(field.value) ? field.value.includes(lang) : field.value === lang;
                return (
                  <Badge
                    key={lang}
                    onClick={() => {
                      const current = Array.isArray(field.value) ? field.value : [];
                      if (selected) {
                        field.onChange(current.filter((l: string) => l !== lang));
                      } else {
                        field.onChange([...current, lang]);
                      }
                    }}
                    className={`cursor-pointer transition-all py-1.5 px-3 ${
                      selected ? 'gradient-primary text-white border-0 shadow-md' : 'bg-muted hover:bg-muted/80 text-foreground border hover:border-primary/30'
                    }`}
                  >
                    {lang}
                  </Badge>
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
import { FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";
import { Control } from "react-hook-form";

interface SocialMediaOpinionFormProps {
  control: Control<any>;
}

// Global social media platforms
const platforms = [
  "Instagram", "TikTok", "X (Twitter)", "Facebook", "Threads", "Reddit", 
  "LinkedIn", "Pinterest", "Snapchat", "YouTube Shorts", "BeReal",
  "Bluesky", "Mastodon", "WeChat", "Weibo", "LINE", "KakaoTalk",
  "WhatsApp Status", "Telegram Channels", "Discord", "Twitch"
];

// Content types
const contentTypes = [
  "Reels/Short Videos", "Stories", "Static Posts", "Threads/Tweets", 
  "Memes", "Infographics", "Mini Vlogs", "Carousels", "Polls/Quizzes",
  "Live Streams", "Behind-the-Scenes", "UGC/Reviews", "Tutorials",
  "News Updates", "Personal Updates", "Artistic Content"
];

// Content tones
const tones = [
  "Funny/Humorous", "Relatable", "Emotional/Heartfelt", "Inspirational", 
  "Informative/Educational", "Sarcastic", "Motivational", "Controversial/Bold",
  "Aesthetic/Visual", "Raw/Authentic", "Professional", "Casual/Friendly"
];

// Video durations
const durations = [
  "<15 seconds", "15-30 seconds", "30-60 seconds", "1-3 minutes", 
  "3-10 minutes", "10+ minutes"
];

// Content themes
const themes = [
  "Lifestyle", "Motivation/Self-Help", "Relationships/Dating", "Travel", 
  "Art/Design", "Self-Growth/Mindset", "Social Commentary", "News/Current Events", 
  "Fashion/Beauty", "Food/Cooking", "Fitness/Health", "Tech/Gadgets",
  "Entertainment/Pop Culture", "Finance/Money", "Career/Business", "Parenting",
  "Sports", "Gaming", "Music", "Nature/Environment", "Spirituality", "Humor/Comedy"
];

// Engagement types
const engagementTypes = [
  "Pure Viewer/Consumer", "Occasional Commenter", "Active Engager (Likes/Shares)",
  "Part-time Creator", "Full-time Creator/Influencer", "Brand/Business Account"
];

// Ad preferences
const adPreferences = [
  "Prefer no ads", "Only relevant/personalized ads", "Don't mind ads",
  "Support creators by watching ads", "Use ad-free subscriptions"
];

// Active times
const activeTimes = [
  "Early Morning (5-8 AM)", "Morning (8-12 PM)", "Afternoon (12-5 PM)", 
  "Evening (5-9 PM)", "Night (9 PM-12 AM)", "Late Night (12-5 AM)"
];

// Following preferences
const followingPrefs = [
  "Friends & Family Only", "Celebrities/Influencers", "News/Information",
  "Niche Communities", "Brands/Products", "Educational Accounts",
  "Entertainment/Comedy", "Mix of Everything"
];

// Privacy preferences
const privacyPrefs = [
  "Public Profile", "Private Profile", "Anonymous/Pseudonymous",
  "Multiple Accounts (Personal/Professional)"
];

export function SocialMediaOpinionForm({ control }: SocialMediaOpinionFormProps) {
  return (
    <div className="space-y-6">
      <FormField
        control={control}
        name="preferences.platform"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-semibold">Platforms You Use *</FormLabel>
            <p className="text-sm text-muted-foreground mb-3">Select all platforms you're active on</p>
            <div className="flex flex-wrap gap-2">
              {platforms.map((platform) => {
                const selected = Array.isArray(field.value) ? field.value.includes(platform) : field.value === platform;
                return (
                  <Badge
                    key={platform}
                    onClick={() => {
                      const current = Array.isArray(field.value) ? field.value : [];
                      if (selected) {
                        field.onChange(current.filter((p: string) => p !== platform));
                      } else {
                        field.onChange([...current, platform]);
                      }
                    }}
                    className={`cursor-pointer transition-all py-1.5 px-3 ${
                      selected ? 'gradient-primary text-white border-0 shadow-md' : 'bg-muted hover:bg-muted/80 text-foreground border hover:border-primary/30'
                    }`}
                  >
                    {platform}
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
        name="preferences.contentType"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-semibold">Content Types You Enjoy *</FormLabel>
            <div className="flex flex-wrap gap-2">
              {contentTypes.map((type) => {
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
                      selected ? 'gradient-accent text-white border-0 shadow-md' : 'bg-muted hover:bg-muted/80 text-foreground border hover:border-primary/30'
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
                      selected ? 'gradient-primary text-white border-0 shadow-md' : 'bg-muted hover:bg-muted/80 text-foreground border hover:border-primary/30'
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
        name="preferences.duration"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-semibold">Preferred Video Duration *</FormLabel>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {durations.map((duration) => {
                const selected = field.value === duration;
                return (
                  <Card
                    key={duration}
                    onClick={() => field.onChange(selected ? "" : duration)}
                    className={`p-3 cursor-pointer transition-all text-center ${
                      selected ? 'border-primary bg-primary/5 shadow-md' : 'hover:border-primary/50'
                    }`}
                  >
                    <span className="text-xs sm:text-sm font-medium">{duration}</span>
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
        name="preferences.theme"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-semibold">Content Themes You Follow *</FormLabel>
            <p className="text-sm text-muted-foreground mb-3">Select all that interest you</p>
            <div className="flex flex-wrap gap-2">
              {themes.map((theme) => {
                const selected = Array.isArray(field.value) ? field.value.includes(theme) : field.value === theme;
                return (
                  <Badge
                    key={theme}
                    onClick={() => {
                      const current = Array.isArray(field.value) ? field.value : [];
                      if (selected) {
                        field.onChange(current.filter((t: string) => t !== theme));
                      } else {
                        field.onChange([...current, theme]);
                      }
                    }}
                    className={`cursor-pointer transition-all py-1.5 px-3 ${
                      selected ? 'gradient-accent text-white border-0 shadow-md' : 'bg-muted hover:bg-muted/80 text-foreground border hover:border-primary/30'
                    }`}
                  >
                    {theme}
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
        name="preferences.followingPref"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-semibold">Who Do You Follow? *</FormLabel>
            <div className="grid grid-cols-2 gap-2">
              {followingPrefs.map((pref) => {
                const selected = Array.isArray(field.value) ? field.value.includes(pref) : field.value === pref;
                return (
                  <Card
                    key={pref}
                    onClick={() => {
                      const current = Array.isArray(field.value) ? field.value : [];
                      if (selected) {
                        field.onChange(current.filter((p: string) => p !== pref));
                      } else {
                        field.onChange([...current, pref]);
                      }
                    }}
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
        name="preferences.engagement"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-semibold">Your Engagement Style *</FormLabel>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {engagementTypes.map((type) => {
                const selected = field.value === type;
                return (
                  <Card
                    key={type}
                    onClick={() => field.onChange(selected ? "" : type)}
                    className={`p-3 cursor-pointer transition-all text-center ${
                      selected ? 'border-primary bg-primary/5 shadow-md' : 'hover:border-primary/50'
                    }`}
                  >
                    <span className="text-xs sm:text-sm font-medium">{type}</span>
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
        name="preferences.privacyPref"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-semibold">Privacy Preference *</FormLabel>
            <div className="grid grid-cols-2 gap-2">
              {privacyPrefs.map((pref) => {
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
        name="preferences.ads"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-semibold">Ad Preference *</FormLabel>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
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
        name="preferences.activeTime"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-semibold">Most Active Time *</FormLabel>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {activeTimes.map((time) => {
                const selected = Array.isArray(field.value) ? field.value.includes(time) : field.value === time;
                return (
                  <Card
                    key={time}
                    onClick={() => {
                      const current = Array.isArray(field.value) ? field.value : [];
                      if (selected) {
                        field.onChange(current.filter((t: string) => t !== time));
                      } else {
                        field.onChange([...current, time]);
                      }
                    }}
                    className={`p-3 cursor-pointer transition-all text-center ${
                      selected ? 'border-primary bg-primary/5 shadow-md' : 'hover:border-primary/50'
                    }`}
                  >
                    <span className="text-xs sm:text-sm font-medium">{time}</span>
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
            <FormLabel className="text-base font-semibold">Interest in Creator Economy *</FormLabel>
            <div className="grid grid-cols-3 gap-2">
              {["Yes, interested", "Maybe someday", "No interest"].map((option) => {
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
    </div>
  );
}
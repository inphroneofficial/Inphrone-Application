import { useMemo } from "react";
import { FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";
import { Control, useWatch } from "react-hook-form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import countriesData from "world-countries";

interface TVOpinionFormProps {
  control: Control<any>;
}

// Global TV preferences (country-aware)
const genres = [
  "Drama/Soap Opera", "Comedy/Sitcom", "Crime & Investigation", "Reality & Talent",
  "News & Current Affairs", "Talk Show", "Kids & Animation", "Educational/Learning",
  "Travel & Food", "Documentary", "Sports", "Variety Show", "Game Show",
  "Lifestyle/Home Improvement", "Nature/Wildlife", "History", "Science & Technology",
  "Music/Concert", "Awards Show", "Debate/Panel", "Shopping/Infomercial",
  "Mythology/Religious", "Devotional", "Regional Entertainment", "Comedy Nights"
];

// Updated with Telugu and more Indian languages prominently
const defaultLanguages = [
  "English", "Hindi", "Telugu", "Tamil", "Kannada", "Malayalam", "Bengali", 
  "Marathi", "Gujarati", "Punjabi", "Odia", "Assamese", "Bhojpuri",
  "Spanish", "Mandarin", "Arabic", "French", "Portuguese", "Russian", 
  "German", "Japanese", "Korean", "Italian", "Turkish", "Vietnamese", 
  "Thai", "Indonesian", "Dutch", "Polish", "Swedish"
];

const timeSlots = [
  "Early Morning (5-8 AM)", "Morning (8-12 PM)", "Afternoon (12-5 PM)",
  "Early Evening (5-7 PM)", "Prime Time (7-10 PM)", "Late Night (10 PM-1 AM)",
  "Overnight (1-5 AM)", "Weekend Mornings", "Anytime (Recorded/DVR)"
];

const formats = [
  "Daily Series", "Weekly Series", "Live News", "Reality Competition",
  "Game Show", "Talk Show", "Sports (Live)", "Sports Highlights/Analysis",
  "Morning Show", "Cooking Show", "Home/Lifestyle", "Travel Documentary",
  "Educational Kids", "Teen Drama", "Soap Opera", "Miniseries/Limited",
  "Stand-up Comedy", "Sketch Comedy", "Music Reality", "Dance Reality"
];

const channelGroups = [
  "Public/National Broadcaster", "Regional/Local Channels", "International Networks",
  "Sports Channels", "News Channels (24/7)", "Kids/Family Channels",
  "Movie Channels", "Music Channels", "Educational Channels", "Religious/Faith",
  "Shopping Channels", "Premium Cable", "Streaming-first Channels",
  "Regional Language Channels", "Comedy Channels", "Lifestyle Channels"
];

// Content quality preferences
const videoQuality = ["SD (Standard)", "HD (720p/1080p)", "4K/UHD", "Don't Mind"];

// Ad preferences
const adTolerance = ["No Ads (Subscription)", "Minimal Ads", "Ads Acceptable", "Free with Ads"];

// Live vs On-Demand
const viewingStyle = ["Always Live", "Mix of Live & Recorded", "Mostly On-Demand/DVR", "Stream Only"];

// Viewing device preferences
const devicePreferences = ["TV/Smart TV", "Mobile Phone", "Tablet", "Laptop/PC", "Projector"];

// Time spent watching TV
const watchingHours = ["Less than 1 hour", "1-2 hours", "2-4 hours", "4-6 hours", "6+ hours"];

export function TVOpinionForm({ control }: TVOpinionFormProps) {
  // Build country list once
  const countries = useMemo(() => {
    return (countriesData as any[])
      .map((c) => ({ code: c.cca2, name: c.name?.common as string, languages: c.languages || {} }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  // Watch selected country to adapt languages
  const selectedCountry = useWatch({ control, name: "preferences.country" });
  const languagesForCountry = useMemo(() => {
    const match = countries.find((c) => c.code === selectedCountry || c.name === selectedCountry);
    if (match && match.languages) {
      const countryLangs = Object.values(match.languages) as string[];
      // Always include Telugu and major Indian languages if India is selected
      if (selectedCountry === 'IN' || selectedCountry === 'India') {
        const indianLangs = ["English", "Hindi", "Telugu", "Tamil", "Kannada", "Malayalam", "Bengali", "Marathi", "Gujarati", "Punjabi", "Odia", "Assamese", "Bhojpuri"];
        return [...new Set([...indianLangs, ...countryLangs])];
      }
      return countryLangs.length > 0 ? countryLangs : defaultLanguages;
    }
    return defaultLanguages;
  }, [countries, selectedCountry]);

  return (
    <div className="space-y-6">
      {/* Country */}
      <FormField
        control={control}
        name="preferences.country"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Country *</FormLabel>
            <Select onValueChange={field.onChange} value={field.value || undefined}>
              <SelectTrigger>
                <SelectValue placeholder="Select your country" />
              </SelectTrigger>
              <SelectContent className="max-h-72">
                {countries.map((c) => (
                  <SelectItem key={c.code} value={c.code}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Genres */}
      <FormField
        control={control}
        name="preferences.genre"
        render={({ field }) => (
          <FormItem>
            <FormLabel>TV Genre(s) *</FormLabel>
            <div className="flex flex-wrap gap-2">
              {genres.map((genre) => {
                const selected = Array.isArray(field.value) ? field.value.includes(genre) : field.value === genre;
                return (
                  <Badge
                    key={genre}
                    onClick={() => {
                      const current = Array.isArray(field.value) ? field.value : [];
                      if (selected) {
                        field.onChange(current.filter((g: string) => g !== genre));
                      } else {
                        field.onChange([...current, genre]);
                      }
                    }}
                    className={`cursor-pointer transition-all ${
                      selected ? 'gradient-primary text-white border-0' : 'bg-muted hover:bg-muted/80 text-foreground border'
                    }`}
                  >
                    {genre}
                  </Badge>
                );
              })}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Languages (country-aware with Telugu) */}
      <FormField
        control={control}
        name="preferences.language"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Preferred Language(s) *</FormLabel>
            <div className="flex flex-wrap gap-2">
              {languagesForCountry.map((lang) => {
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
                    className={`cursor-pointer transition-all ${
                      selected ? 'gradient-primary text-white border-0' : 'bg-muted hover:bg-muted/80 text-foreground border'
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

      {/* Format */}
      <FormField
        control={control}
        name="preferences.format"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Program Format *</FormLabel>
            <div className="grid grid-cols-2 gap-2">
              {formats.map((fmt) => {
                const selected = field.value === fmt;
                return (
                  <Card
                    key={fmt}
                    onClick={() => field.onChange(selected ? '' : fmt)}
                    className={`p-3 cursor-pointer transition-all text-center ${
                      selected ? 'border-primary bg-primary/5' : 'hover:border-primary/50'
                    }`}
                  >
                    <span className="text-sm font-medium">{fmt}</span>
                  </Card>
                );
              })}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Time slot */}
      <FormField
        control={control}
        name="preferences.timeSlot"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Preferred Time Slot *</FormLabel>
            <div className="grid grid-cols-2 gap-2">
              {timeSlots.map((slot) => {
                const selected = field.value === slot;
                return (
                  <Card
                    key={slot}
                    onClick={() => field.onChange(selected ? '' : slot)}
                    className={`p-3 cursor-pointer transition-all text-center ${
                      selected ? 'border-primary bg-primary/5' : 'hover:border-primary/50'
                    }`}
                  >
                    <span className="text-sm font-medium">{slot}</span>
                  </Card>
                );
              })}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Channel groups (global) */}
      <FormField
        control={control}
        name="preferences.channels"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Preferred Channel Types *</FormLabel>
            <div className="flex flex-wrap gap-2">
              {channelGroups.map((ch) => {
                const selected = Array.isArray(field.value) ? field.value.includes(ch) : field.value === ch;
                return (
                  <Badge
                    key={ch}
                    onClick={() => {
                      const current = Array.isArray(field.value) ? field.value : [];
                      if (selected) {
                        field.onChange(current.filter((c: string) => c !== ch));
                      } else {
                        field.onChange([...current, ch]);
                      }
                    }}
                    className={`cursor-pointer transition-all ${
                      selected ? 'gradient-accent text-white border-0' : 'bg-muted hover:bg-muted/80 text-foreground border'
                    }`}
                  >
                    {ch}
                  </Badge>
                );
              })}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Video Quality */}
      <FormField
        control={control}
        name="preferences.videoQuality"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Video Quality Preference *</FormLabel>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {videoQuality.map((quality) => {
                const selected = field.value === quality;
                return (
                  <Card
                    key={quality}
                    onClick={() => field.onChange(selected ? '' : quality)}
                    className={`p-3 cursor-pointer transition-all text-center ${
                      selected ? 'border-primary bg-primary/5' : 'hover:border-primary/50'
                    }`}
                  >
                    <span className="text-sm font-medium">{quality}</span>
                  </Card>
                );
              })}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Device Preference */}
      <FormField
        control={control}
        name="preferences.device"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Primary Viewing Device *</FormLabel>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {devicePreferences.map((device) => {
                const selected = field.value === device;
                return (
                  <Card
                    key={device}
                    onClick={() => field.onChange(selected ? '' : device)}
                    className={`p-3 cursor-pointer transition-all text-center ${
                      selected ? 'border-primary bg-primary/5' : 'hover:border-primary/50'
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

      {/* Daily Watching Hours */}
      <FormField
        control={control}
        name="preferences.watchingHours"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Daily TV Watching Time *</FormLabel>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {watchingHours.map((hours) => {
                const selected = field.value === hours;
                return (
                  <Card
                    key={hours}
                    onClick={() => field.onChange(selected ? '' : hours)}
                    className={`p-3 cursor-pointer transition-all text-center ${
                      selected ? 'border-primary bg-primary/5' : 'hover:border-primary/50'
                    }`}
                  >
                    <span className="text-sm font-medium">{hours}</span>
                  </Card>
                );
              })}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Ad Tolerance */}
      <FormField
        control={control}
        name="preferences.adTolerance"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Advertisement Preference *</FormLabel>
            <div className="grid grid-cols-2 gap-2">
              {adTolerance.map((ad) => {
                const selected = field.value === ad;
                return (
                  <Card
                    key={ad}
                    onClick={() => field.onChange(selected ? '' : ad)}
                    className={`p-3 cursor-pointer transition-all text-center ${
                      selected ? 'border-primary bg-primary/5' : 'hover:border-primary/50'
                    }`}
                  >
                    <span className="text-sm font-medium">{ad}</span>
                  </Card>
                );
              })}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Viewing Style */}
      <FormField
        control={control}
        name="preferences.viewingStyle"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Viewing Style *</FormLabel>
            <div className="grid grid-cols-2 gap-2">
              {viewingStyle.map((style) => {
                const selected = field.value === style;
                return (
                  <Card
                    key={style}
                    onClick={() => field.onChange(selected ? '' : style)}
                    className={`p-3 cursor-pointer transition-all text-center ${
                      selected ? 'border-primary bg-primary/5' : 'hover:border-primary/50'
                    }`}
                  >
                    <span className="text-sm font-medium">{style}</span>
                  </Card>
                );
              })}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Willingness to pay */}
      <FormField
        control={control}
        name="would_pay"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Willingness to Pay for TV Subscription *</FormLabel>
            <div className="grid grid-cols-3 gap-2">
              {["Yes", "Maybe", "No"].map((option) => {
                const value = option === "Yes" ? true : option === "No" ? false : null;
                const selected = field.value === value;
                return (
                  <Card
                    key={option}
                    onClick={() => field.onChange(value)}
                    className={`p-3 cursor-pointer transition-all text-center ${
                      selected ? 'border-green-500 bg-green-500/5' : 'hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      {selected && <Check className="w-4 h-4 text-green-500" />}
                      <span className="text-sm font-medium">{option}</span>
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

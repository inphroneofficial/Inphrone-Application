import { FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";
import { Control } from "react-hook-form";

interface FilmOpinionFormProps {
  control: Control<any>;
}

// Comprehensive film genres
const genres = [
  "Action", "Adventure", "Comedy", "Drama", "Thriller", "Mystery", 
  "Romance", "Sci-Fi", "Fantasy", "Horror", "Animation", "Biography", 
  "Historical/Period", "Crime", "Musical", "Sports", "Documentary", 
  "Social Issue", "Experimental/Art House", "Superhero", "Western", 
  "War", "Disaster", "Heist", "Coming-of-Age", "Family", "Psychological",
  "Film Noir", "Satire", "Parody", "Martial Arts", "Anthology", 
  "Silent/Classic", "Found Footage", "Mockumentary"
];

// Global languages
const languages = [
  "English", "Hindi", "Telugu", "Tamil", "Korean", "Spanish", "Japanese", 
  "French", "German", "Italian", "Portuguese", "Mandarin", "Cantonese", 
  "Arabic", "Russian", "Bengali", "Marathi", "Punjabi", "Malayalam", 
  "Kannada", "Thai", "Vietnamese", "Turkish", "Polish", "Dutch",
  "Swedish", "Danish", "Norwegian", "Greek", "Hebrew", "Persian",
  "Indonesian", "Tagalog", "Swahili"
];

// Global film industries
const industries = [
  "Hollywood (USA)", "Bollywood (Hindi)", "Tollywood (Telugu)", 
  "Kollywood (Tamil)", "K-Cinema (Korean)", "J-Cinema (Japanese)",
  "Chinese Cinema", "British Cinema", "French Cinema", "German Cinema",
  "Spanish Cinema", "Italian Cinema", "Nordic Cinema (Scandinavia)",
  "Latin American Cinema", "African Cinema (Nollywood+)", "Middle Eastern",
  "Southeast Asian", "Australian Cinema", "Canadian Cinema", "Independent/Indie"
];

// Budget preferences
const budgets = [
  "Indie / Low Budget", "Mid-Range Production", "High Budget / Blockbuster",
  "No Preference"
];

// Viewing preferences
const viewingPrefs = [
  "Movie Theaters/IMAX", "Premium Theaters (4DX, Dolby)", "OTT/Streaming at Home", 
  "Home Theater Setup", "Either Works"
];

// Duration preferences
const durations = [
  "Short (<90 mins)", "Standard (90-120 mins)", "Long (120-150 mins)", 
  "Epic (150+ mins)", "No Preference"
];

// Release type preferences
const releaseTypes = [
  "Franchise/Universe", "Sequel/Prequel", "Original Concept", 
  "Book/Comic Adaptation", "True Story/Biopic", "Remake/Reboot"
];

// Mood/Tone preferences
const moods = [
  "Inspirational", "Emotional/Tearjerker", "Realistic/Grounded", "Dark/Gritty", 
  "Hopeful/Uplifting", "Intense/Suspenseful", "Fun/Light-hearted", 
  "Melancholic", "Whimsical/Magical", "Nostalgic", "Provocative/Challenging", 
  "Romantic", "Thrilling", "Cerebral/Thought-provoking"
];

// Message/Content types
const messageTypes = [
  "Social Message/Commentary", "Pure Entertainment", "Thought-Provoking/Philosophical", 
  "Artistic/Visual Experience", "Educational/Informative", "Escapist Fantasy"
];

// Viewing contexts
const viewingContexts = [
  "Solo Viewing", "With Partner/Date", "Family Movie Night", 
  "With Friends", "Film Club/Community"
];

// Subtitle/Audio preferences
const subtitlePrefs = [
  "Original Audio with Subtitles", "Dubbed in My Language", 
  "Both (depends on mood)", "No Subtitles Needed"
];

export function FilmOpinionForm({ control }: FilmOpinionFormProps) {
  return (
    <div className="space-y-6">
      <FormField
        control={control}
        name="preferences.genre"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-semibold">Preferred Genres *</FormLabel>
            <p className="text-sm text-muted-foreground mb-3">Select all that you enjoy</p>
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
                    className={`cursor-pointer transition-all py-1.5 px-3 ${
                      selected ? 'gradient-primary text-white border-0 shadow-md' : 'bg-muted hover:bg-muted/80 text-foreground border hover:border-primary/30'
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

      <FormField
        control={control}
        name="preferences.language"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-semibold">Film Languages *</FormLabel>
            <p className="text-sm text-muted-foreground mb-3">Select all languages you watch</p>
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

      <FormField
        control={control}
        name="preferences.industry"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-semibold">Film Industries *</FormLabel>
            <p className="text-sm text-muted-foreground mb-3">Select industries you follow</p>
            <div className="flex flex-wrap gap-2">
              {industries.map((industry) => {
                const selected = Array.isArray(field.value) ? field.value.includes(industry) : field.value === industry;
                return (
                  <Badge
                    key={industry}
                    onClick={() => {
                      const current = Array.isArray(field.value) ? field.value : [];
                      if (selected) {
                        field.onChange(current.filter((i: string) => i !== industry));
                      } else {
                        field.onChange([...current, industry]);
                      }
                    }}
                    className={`cursor-pointer transition-all py-1.5 px-3 ${
                      selected ? 'gradient-accent text-white border-0 shadow-md' : 'bg-muted hover:bg-muted/80 text-foreground border hover:border-primary/30'
                    }`}
                  >
                    {industry}
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
        name="preferences.budget"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-semibold">Production Scale Preference *</FormLabel>
            <div className="grid grid-cols-2 gap-2">
              {budgets.map((budget) => {
                const selected = field.value === budget;
                return (
                  <Card
                    key={budget}
                    onClick={() => field.onChange(selected ? "" : budget)}
                    className={`p-3 cursor-pointer transition-all text-center ${
                      selected ? 'border-primary bg-primary/5 shadow-md' : 'hover:border-primary/50'
                    }`}
                  >
                    <span className="text-sm font-medium">{budget}</span>
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
        name="preferences.viewing"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-semibold">Viewing Preference *</FormLabel>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {viewingPrefs.map((pref) => {
                const selected = field.value === pref;
                return (
                  <Card
                    key={pref}
                    onClick={() => field.onChange(selected ? "" : pref)}
                    className={`p-3 cursor-pointer transition-all text-center ${
                      selected ? 'border-primary bg-primary/5 shadow-md' : 'hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      {selected && <Check className="w-4 h-4 text-primary" />}
                      <span className="text-xs sm:text-sm font-medium">{pref}</span>
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
        name="preferences.subtitlePref"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-semibold">Subtitle/Audio Preference *</FormLabel>
            <div className="grid grid-cols-2 gap-2">
              {subtitlePrefs.map((pref) => {
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
        name="preferences.viewingContext"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-semibold">How Do You Watch? *</FormLabel>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {viewingContexts.map((context) => {
                const selected = Array.isArray(field.value) ? field.value.includes(context) : field.value === context;
                return (
                  <Card
                    key={context}
                    onClick={() => {
                      const current = Array.isArray(field.value) ? field.value : [];
                      if (selected) {
                        field.onChange(current.filter((c: string) => c !== context));
                      } else {
                        field.onChange([...current, context]);
                      }
                    }}
                    className={`p-3 cursor-pointer transition-all text-center ${
                      selected ? 'border-primary bg-primary/5 shadow-md' : 'hover:border-primary/50'
                    }`}
                  >
                    <span className="text-xs sm:text-sm font-medium">{context}</span>
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
            <FormLabel className="text-base font-semibold">Willingness to Pay for Theater *</FormLabel>
            <div className="grid grid-cols-3 gap-2">
              {["Yes, regularly", "Occasionally", "Prefer free/OTT"].map((option) => {
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

      <FormField
        control={control}
        name="preferences.duration"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-semibold">Preferred Duration *</FormLabel>
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
        name="preferences.releaseType"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-semibold">Content Type Preference *</FormLabel>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {releaseTypes.map((type) => {
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
        name="preferences.mood"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-semibold">Mood/Tone Preferences *</FormLabel>
            <div className="flex flex-wrap gap-2">
              {moods.map((mood) => {
                const selected = Array.isArray(field.value) ? field.value.includes(mood) : field.value === mood;
                return (
                  <Badge
                    key={mood}
                    onClick={() => {
                      const current = Array.isArray(field.value) ? field.value : [];
                      if (selected) {
                        field.onChange(current.filter((m: string) => m !== mood));
                      } else {
                        field.onChange([...current, mood]);
                      }
                    }}
                    className={`cursor-pointer transition-all py-1.5 px-3 ${
                      selected ? 'gradient-primary text-white border-0 shadow-md' : 'bg-muted hover:bg-muted/80 text-foreground border hover:border-primary/30'
                    }`}
                  >
                    {mood}
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
        name="preferences.messageType"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-semibold">Content Purpose *</FormLabel>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {messageTypes.map((type) => {
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
                    <span className="text-xs sm:text-sm font-medium">{type}</span>
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
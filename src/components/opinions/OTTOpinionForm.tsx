import { FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Check, Film, Tv } from "lucide-react";
import { Control } from "react-hook-form";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface OTTOpinionFormProps {
  control: Control<any>;
}

// Content types
const contentTypes = [
  { id: "series", label: "Web Series", icon: Tv, description: "TV shows & episodic content" },
  { id: "movie", label: "Movies", icon: Film, description: "Feature films & documentaries" }
];

// Global OTT genres covering all regions
const genres = [
  "Crime", "Thriller", "Family Drama", "Sci-Fi", "Fantasy", "Comedy", 
  "Historical", "Romance", "Mystery", "Social Drama", "Reality", "Action", 
  "Horror", "Documentary", "Supernatural", "Political", "Medical", "Legal",
  "Teen Drama", "Slice of Life", "Western", "War", "Spy/Espionage", "Animation"
];

// Movie-specific options
const movieDurations = ["Under 90 min", "90-120 min", "120-150 min", "150+ min (Epic)"];
const releaseTypes = ["Theatrical Release", "Direct to OTT", "Hybrid Release", "Festival Premiere"];

// Series-specific options
const episodeLengths = ["<30 min", "30-50 min", "50-70 min", "1-2 hours", "Movie Length (2+ hours)"];
const seasonLengths = ["Mini-Series (1-3 eps)", "Short (4-6 eps)", "Medium (7-10)", "Long (10-16)", "Extended (16+)"];

// Global languages covering major OTT markets
const languages = [
  "English", "Spanish", "Mandarin", "Hindi", "Korean", "Japanese", 
  "French", "German", "Portuguese", "Italian", "Russian", "Arabic",
  "Turkish", "Thai", "Vietnamese", "Indonesian", "Tamil", "Telugu",
  "Bengali", "Punjabi", "Marathi", "Polish", "Dutch", "Swedish"
];

// Global OTT content origins
const industries = [
  "Hollywood/US", "Bollywood/Indian", "Korean Drama (K-Drama)", 
  "British Series", "European Cinema", "Latin American", "Japanese (Anime/Live)",
  "Chinese/Mandarin", "Turkish Drama", "Nordic Noir", "Middle Eastern",
  "Southeast Asian", "Australian", "Canadian", "African Cinema"
];

// All major OTT platforms globally
const platforms = [
  "Netflix", "Amazon Prime Video", "Disney+", "Apple TV+", "HBO Max", 
  "Hulu", "Paramount+", "Peacock", "Discovery+", "Zee5", "Hotstar (Disney+ Hotstar)",
  "Sony LIV", "Voot", "ALTBalaji", "MX Player", "Viki (Rakuten)", "iQIYI",
  "Tencent Video", "Youku", "MUBI", "Crunchyroll", "Funimation", "Starzplay",
  "Shahid", "OSN+", "Stan", "Binge", "Crave", "BluTV", "Others"
];

const tones = [
  "Realistic/Grounded", "Escapist/Fantasy", "Funny/Comedy", "Dark/Gritty", 
  "Uplifting/Feel-Good", "Suspenseful/Thriller", "Emotional/Melodrama",
  "Satirical", "Noir", "Campy/Over-the-top"
];

const watchPrefs = ["Binge all episodes at once", "One episode per day", "One per week", "Watch as released"];

// Content maturity ratings (global standard)
const maturityRatings = ["G (All Ages)", "PG (Parental Guidance)", "PG-13", "TV-14", "TV-MA (Mature)", "R-Rated"];

// Viewing preferences
const subtitlesPrefs = ["Original Language with Subtitles", "Dubbed in My Language", "Both (Depends on Mood)"];

// Content freshness
const contentAge = ["Brand New (This Year)", "Recent (1-2 years)", "Classic (3-5 years)", "Timeless (5+ years)", "Don't Mind"];

export function OTTOpinionForm({ control }: OTTOpinionFormProps) {
  const [contentType, setContentType] = useState<string>("series");

  return (
    <div className="space-y-8">
      {/* Content Type Selection */}
      <FormField
        control={control}
        name="preferences.contentType"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-semibold">What type of content? *</FormLabel>
            <div className="grid grid-cols-2 gap-4 mt-3">
              {contentTypes.map((type) => {
                const Icon = type.icon;
                const selected = field.value === type.id;
                return (
                  <motion.div
                    key={type.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card
                      onClick={() => {
                        field.onChange(type.id);
                        setContentType(type.id);
                      }}
                      className={`p-5 cursor-pointer transition-all relative overflow-hidden ${
                        selected 
                          ? 'border-primary bg-primary/5 shadow-elegant' 
                          : 'hover:border-primary/50 hover:bg-muted/30'
                      }`}
                    >
                      {selected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute top-2 right-2"
                        >
                          <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                            <Check className="w-4 h-4 text-primary-foreground" />
                          </div>
                        </motion.div>
                      )}
                      <Icon className={`w-8 h-8 mb-3 ${selected ? 'text-primary' : 'text-muted-foreground'}`} />
                      <p className="font-semibold">{type.label}</p>
                      <p className="text-xs text-muted-foreground mt-1">{type.description}</p>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Genre Selection */}
      <FormField
        control={control}
        name="preferences.genre"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-semibold">
              {contentType === "movie" ? "Movie Genres" : "Series Genres"} *
            </FormLabel>
            <p className="text-sm text-muted-foreground mb-3">Select all that interest you</p>
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
                      selected 
                        ? 'gradient-primary text-white border-0 shadow-md' 
                        : 'bg-muted hover:bg-muted/80 text-foreground border hover:border-primary/30'
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

      {/* Movie-specific: Duration */}
      <AnimatePresence mode="wait">
        {contentType === "movie" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <FormField
              control={control}
              name="preferences.movieDuration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-semibold">Preferred Movie Duration *</FormLabel>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                    {movieDurations.map((duration) => {
                      const selected = field.value === duration;
                      return (
                        <Card
                          key={duration}
                          onClick={() => field.onChange(selected ? "" : duration)}
                          className={`p-4 cursor-pointer transition-all text-center ${
                            selected ? 'border-primary bg-primary/5 shadow-md' : 'hover:border-primary/50'
                          }`}
                        >
                          <span className="text-sm font-medium">{duration}</span>
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
                <FormItem className="mt-6">
                  <FormLabel className="text-base font-semibold">Preferred Release Type *</FormLabel>
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    {releaseTypes.map((type) => {
                      const selected = field.value === type;
                      return (
                        <Card
                          key={type}
                          onClick={() => field.onChange(selected ? "" : type)}
                          className={`p-4 cursor-pointer transition-all text-center ${
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
          </motion.div>
        )}
      </AnimatePresence>

      {/* Series-specific: Episode & Season Length */}
      <AnimatePresence mode="wait">
        {contentType === "series" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-6"
          >
            <FormField
              control={control}
              name="preferences.episodeLength"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-semibold">Episode Length Preference *</FormLabel>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
                    {episodeLengths.map((length) => {
                      const selected = field.value === length;
                      return (
                        <Card
                          key={length}
                          onClick={() => field.onChange(selected ? "" : length)}
                          className={`p-4 cursor-pointer transition-all text-center ${
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
              name="preferences.seasonLength"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-semibold">Season Length Preference *</FormLabel>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
                    {seasonLengths.map((length) => {
                      const selected = field.value === length;
                      return (
                        <Card
                          key={length}
                          onClick={() => field.onChange(selected ? "" : length)}
                          className={`p-4 cursor-pointer transition-all text-center ${
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
              name="preferences.watchPref"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-semibold">Binge vs Weekly *</FormLabel>
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    {watchPrefs.map((pref) => {
                      const selected = field.value === pref;
                      return (
                        <Card
                          key={pref}
                          onClick={() => field.onChange(selected ? "" : pref)}
                          className={`p-4 cursor-pointer transition-all text-center ${
                            selected ? 'border-primary bg-primary/5 shadow-md' : 'hover:border-primary/50'
                          }`}
                        >
                          <span className="text-sm font-medium">{pref}</span>
                        </Card>
                      );
                    })}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Language Preference */}
      <FormField
        control={control}
        name="preferences.language"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-semibold">Preferred Languages *</FormLabel>
            <p className="text-sm text-muted-foreground mb-3">Select all languages you enjoy</p>
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
                      selected 
                        ? 'gradient-primary text-white border-0 shadow-md' 
                        : 'bg-muted hover:bg-muted/80 text-foreground border hover:border-primary/30'
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

      {/* Industry/Region */}
      <FormField
        control={control}
        name="preferences.industry"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-semibold">Content Origin/Industry *</FormLabel>
            <div className="flex flex-wrap gap-2 mt-3">
              {industries.map((industry) => {
                const selected = field.value === industry;
                return (
                  <Badge
                    key={industry}
                    onClick={() => field.onChange(selected ? "" : industry)}
                    className={`cursor-pointer transition-all py-1.5 px-3 ${
                      selected 
                        ? 'gradient-accent text-white border-0 shadow-md' 
                        : 'bg-muted hover:bg-muted/80 text-foreground border hover:border-primary/30'
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

      {/* Platform Preference */}
      <FormField
        control={control}
        name="preferences.platform"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-semibold">Preferred OTT Platforms *</FormLabel>
            <p className="text-sm text-muted-foreground mb-3">Select all platforms you use</p>
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
                      selected 
                        ? 'gradient-primary text-white border-0 shadow-md' 
                        : 'bg-muted hover:bg-muted/80 text-foreground border hover:border-primary/30'
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

      {/* Story Tone */}
      <FormField
        control={control}
        name="preferences.tone"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-semibold">Preferred Story Tone *</FormLabel>
            <div className="flex flex-wrap gap-2 mt-3">
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
                      selected 
                        ? 'gradient-accent text-white border-0 shadow-md' 
                        : 'bg-muted hover:bg-muted/80 text-foreground border hover:border-primary/30'
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

      {/* Maturity Rating */}
      <FormField
        control={control}
        name="preferences.maturityRating"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-semibold">Preferred Content Rating *</FormLabel>
            <div className="flex flex-wrap gap-2 mt-3">
              {maturityRatings.map((rating) => {
                const selected = Array.isArray(field.value) ? field.value.includes(rating) : field.value === rating;
                return (
                  <Badge
                    key={rating}
                    onClick={() => {
                      const current = Array.isArray(field.value) ? field.value : [];
                      if (selected) {
                        field.onChange(current.filter((r: string) => r !== rating));
                      } else {
                        field.onChange([...current, rating]);
                      }
                    }}
                    className={`cursor-pointer transition-all py-1.5 px-3 ${
                      selected 
                        ? 'gradient-primary text-white border-0 shadow-md' 
                        : 'bg-muted hover:bg-muted/80 text-foreground border hover:border-primary/30'
                    }`}
                  >
                    {rating}
                  </Badge>
                );
              })}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Subtitles/Dubbing */}
      <FormField
        control={control}
        name="preferences.subtitlesPref"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-semibold">Subtitles/Dubbing Preference *</FormLabel>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
              {subtitlesPrefs.map((pref) => {
                const selected = field.value === pref;
                return (
                  <Card
                    key={pref}
                    onClick={() => field.onChange(selected ? "" : pref)}
                    className={`p-4 cursor-pointer transition-all text-center ${
                      selected ? 'border-primary bg-primary/5 shadow-md' : 'hover:border-primary/50'
                    }`}
                  >
                    <span className="text-sm font-medium">{pref}</span>
                  </Card>
                );
              })}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Content Freshness */}
      <FormField
        control={control}
        name="preferences.contentAge"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-semibold">Content Freshness Preference *</FormLabel>
            <div className="flex flex-wrap gap-2 mt-3">
              {contentAge.map((age) => {
                const selected = field.value === age;
                return (
                  <Badge
                    key={age}
                    onClick={() => field.onChange(selected ? "" : age)}
                    className={`cursor-pointer transition-all py-1.5 px-3 ${
                      selected 
                        ? 'gradient-accent text-white border-0 shadow-md' 
                        : 'bg-muted hover:bg-muted/80 text-foreground border hover:border-primary/30'
                    }`}
                  >
                    {age}
                  </Badge>
                );
              })}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Willingness to Pay */}
      <FormField
        control={control}
        name="would_pay"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-semibold">Willingness to Pay / Subscribe *</FormLabel>
            <div className="grid grid-cols-3 gap-3 mt-3">
              {["Yes", "No", "Already Subscribed"].map((option) => {
                const value = option === "Yes" ? true : option === "No" ? false : null;
                const selected = field.value === value;
                return (
                  <Card
                    key={option}
                    onClick={() => field.onChange(value)}
                    className={`p-4 cursor-pointer transition-all text-center ${
                      selected ? 'border-green-500 bg-green-500/10 shadow-md' : 'hover:border-primary/50'
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
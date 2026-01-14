import { FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";
import { Control } from "react-hook-form";

interface MusicOpinionFormProps {
  control: Control<any>;
}

// Global music genres covering all major markets
const genres = [
  "Pop", "Rock", "Hip-Hop/Rap", "EDM/Electronic", "Classical", "Jazz", 
  "Country", "R&B/Soul", "Metal", "Lo-fi", "Indie", "Folk", "Reggae", 
  "Blues", "Techno", "House", "Trap", "K-Pop", "J-Pop", "Bollywood", 
  "Latin/Reggaeton", "Afrobeat", "Ambient", "Punk", "Gospel", "Opera",
  "World Music", "Fusion", "Disco", "Funk", "Ska", "Grunge", "Acoustic",
  "Synthwave", "Dubstep", "Drum & Bass", "Trance", "Alternative", 
  "Progressive", "Psychedelic", "Chillwave", "Bossa Nova", "Flamenco"
];

// Global languages for music
const languages = [
  "English", "Spanish", "Hindi", "Portuguese", "Korean", "Japanese", 
  "French", "German", "Italian", "Mandarin", "Arabic", "Russian",
  "Tamil", "Telugu", "Bengali", "Punjabi", "Marathi", "Turkish",
  "Vietnamese", "Thai", "Indonesian", "Tagalog", "Swedish", "Dutch",
  "Polish", "Greek", "Hebrew", "Persian", "Swahili", "Yoruba"
];

// Mood preferences
const moods = [
  "Energetic/Upbeat", "Chill/Relaxed", "Emotional/Sad", "Motivational", 
  "Romantic", "Focus/Study", "Party/Dance", "Uplifting", "Aggressive/Intense",
  "Melancholic", "Dreamy", "Nostalgic", "Empowering", "Meditative/Zen",
  "Happy/Joyful", "Dark/Moody", "Peaceful", "Workout/Gym"
];

// Global streaming platforms
const platforms = [
  "Spotify", "YouTube Music", "Apple Music", "Amazon Music", "SoundCloud", 
  "Gaana", "JioSaavn", "Tidal", "Deezer", "Pandora", "Anghami",
  "QQ Music", "NetEase Music", "Yandex Music", "VK Music", "Boomplay",
  "JOOX", "Wynk Music", "Hungama", "Others"
];

// Artist types
const artistTypes = [
  "Solo Artist", "Band/Group", "Collaboration/Duets", "DJ/Producer",
  "Orchestra/Ensemble", "Indie Artist", "Mainstream/Major Label",
  "Underground/Local", "Cover Artist", "Virtual/AI Artist"
];

// Music discovery methods
const discoveryMethods = [
  "YouTube", "TikTok/Reels", "Spotify/Streaming Recommendations", 
  "Instagram Reels", "Friends/Family", "Radio", "Music Blogs/Reviews",
  "Playlists", "Live Concerts", "Movies/TV Shows", "Shazam/Sound ID",
  "Social Media Trends", "Podcasts", "Music Charts"
];

// Listening contexts
const listeningContexts = [
  "Commute/Travel", "Working/Studying", "Exercise/Gym", "Relaxation",
  "Social Gatherings", "Before Sleep", "Morning Routine", "Cooking/Chores",
  "Gaming", "Reading"
];

// Audio quality preferences
const audioQuality = [
  "Standard (Good enough)", "High Quality (320kbps)", "Lossless/Hi-Fi",
  "Don't notice difference"
];

export function MusicOpinionForm({ control }: MusicOpinionFormProps) {
  return (
    <div className="space-y-6">
      <FormField
        control={control}
        name="preferences.genre"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-semibold">Music Genres You Enjoy *</FormLabel>
            <p className="text-sm text-muted-foreground mb-3">Select all that apply</p>
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
            <FormLabel className="text-base font-semibold">Music Languages *</FormLabel>
            <p className="text-sm text-muted-foreground mb-3">Select all languages you listen to</p>
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
        name="preferences.mood"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-semibold">Mood Preferences *</FormLabel>
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
                      selected ? 'gradient-accent text-white border-0 shadow-md' : 'bg-muted hover:bg-muted/80 text-foreground border hover:border-primary/30'
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
        name="preferences.platforms"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-semibold">Streaming Platforms *</FormLabel>
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
        name="preferences.artistType"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-semibold">Preferred Artist Types *</FormLabel>
            <div className="grid grid-cols-2 gap-2">
              {artistTypes.map((type) => {
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
        name="preferences.listeningContext"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-semibold">When Do You Listen? *</FormLabel>
            <div className="flex flex-wrap gap-2">
              {listeningContexts.map((context) => {
                const selected = Array.isArray(field.value) ? field.value.includes(context) : field.value === context;
                return (
                  <Badge
                    key={context}
                    onClick={() => {
                      const current = Array.isArray(field.value) ? field.value : [];
                      if (selected) {
                        field.onChange(current.filter((c: string) => c !== context));
                      } else {
                        field.onChange([...current, context]);
                      }
                    }}
                    className={`cursor-pointer transition-all py-1.5 px-3 ${
                      selected ? 'gradient-accent text-white border-0 shadow-md' : 'bg-muted hover:bg-muted/80 text-foreground border hover:border-primary/30'
                    }`}
                  >
                    {context}
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
        name="preferences.audioQuality"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-semibold">Audio Quality Preference *</FormLabel>
            <div className="grid grid-cols-2 gap-2">
              {audioQuality.map((quality) => {
                const selected = field.value === quality;
                return (
                  <Card
                    key={quality}
                    onClick={() => field.onChange(selected ? "" : quality)}
                    className={`p-3 cursor-pointer transition-all text-center ${
                      selected ? 'border-primary bg-primary/5 shadow-md' : 'hover:border-primary/50'
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

      <FormField
        control={control}
        name="would_pay"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-semibold">Premium Subscription Interest *</FormLabel>
            <div className="grid grid-cols-3 gap-2">
              {["Yes, I pay", "Considering", "No, free only"].map((option) => {
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
        name="preferences.liveEvents"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-semibold">Live Music Interest *</FormLabel>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {["Concerts/Festivals", "Club Shows", "Virtual/Livestream", "Not interested"].map((option) => {
                const selected = Array.isArray(field.value) ? field.value.includes(option) : field.value === option;
                return (
                  <Card
                    key={option}
                    onClick={() => {
                      const current = Array.isArray(field.value) ? field.value : [];
                      if (selected) {
                        field.onChange(current.filter((o: string) => o !== option));
                      } else {
                        field.onChange([...current, option]);
                      }
                    }}
                    className={`p-3 cursor-pointer transition-all text-center ${
                      selected ? 'border-primary bg-primary/5 shadow-md' : 'hover:border-primary/50'
                    }`}
                  >
                    <span className="text-xs sm:text-sm font-medium">{option}</span>
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
        name="preferences.discovery"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-semibold">Music Discovery Methods *</FormLabel>
            <div className="flex flex-wrap gap-2">
              {discoveryMethods.map((method) => {
                const selected = Array.isArray(field.value) ? field.value.includes(method) : field.value === method;
                return (
                  <Badge
                    key={method}
                    onClick={() => {
                      const current = Array.isArray(field.value) ? field.value : [];
                      if (selected) {
                        field.onChange(current.filter((m: string) => m !== method));
                      } else {
                        field.onChange([...current, method]);
                      }
                    }}
                    className={`cursor-pointer transition-all py-1.5 px-3 ${
                      selected ? 'gradient-accent text-white border-0 shadow-md' : 'bg-muted hover:bg-muted/80 text-foreground border hover:border-primary/30'
                    }`}
                  >
                    {method}
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
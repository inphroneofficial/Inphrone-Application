import { FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";
import { Control } from "react-hook-form";

interface GamingOpinionFormProps {
  control: Control<any>;
}

// Comprehensive gaming genres
const genres = [
  "Action", "RPG", "FPS/Shooter", "Battle Royale", "MMORPG", "Simulation", 
  "Strategy", "Racing", "Adventure", "Indie", "Sports", "Casual", 
  "Puzzle", "Horror", "Survival", "Sandbox/Open World", "Fighting", 
  "MOBA", "Card/Board Games", "Rhythm/Music", "Platformer", "Stealth",
  "Tower Defense", "Visual Novel", "Roguelike", "Metroidvania", 
  "City Builder", "Farming/Life Sim", "Educational", "Party Games"
];

// Gaming platforms
const platforms = [
  "PC (Steam)", "PC (Epic Games)", "PlayStation", "Xbox", "Nintendo Switch",
  "Mobile (iOS)", "Mobile (Android)", "Cloud Gaming (GeForce Now)", 
  "Cloud Gaming (Xbox Cloud)", "VR/AR Gaming", "Retro/Emulation"
];

// Gaming modes
const modes = [
  "Single Player/Story", "Local Co-op", "Online Multiplayer", 
  "Competitive/Ranked", "Casual/Unranked", "Battle Royale Squads",
  "MMO Guilds/Clans", "Speedrunning", "Creative/Building"
];

// Visual styles
const visualStyles = [
  "Realistic/Photorealistic", "Stylized/Artistic", "Cartoon/Cel-shaded", 
  "Pixel Art/Retro", "Anime/Japanese", "Minimalist", "Voxel",
  "Low-Poly", "Hand-drawn/Painted"
];

// Game perspectives
const perspectives = [
  "First-Person", "Third-Person", "Top-down", "Isometric", 
  "Side-scrolling", "VR/First-Person Immersive", "Mixed/Dynamic"
];

// Game duration preferences
const durations = [
  "Quick Sessions (<1 hr)", "Short Games (<10 hrs)", "Medium (10-30 hrs)", 
  "Long (30-60 hrs)", "Endless/Live Service", "Speedrun-friendly"
];

// Payment models
const paymentModels = [
  "Free-to-play (F2P)", "One-time Purchase", "Subscription (Game Pass, etc.)",
  "Microtransactions OK", "No Pay-to-Win", "Early Access Supporter"
];

// Global languages
const languages = [
  "English", "Spanish", "Portuguese", "Japanese", "Korean", "Chinese (Simplified)", 
  "Chinese (Traditional)", "French", "German", "Russian", "Italian", "Polish",
  "Turkish", "Thai", "Vietnamese", "Arabic", "Hindi", "Indonesian"
];

// Gaming contexts
const gamingContexts = [
  "After Work/School", "Weekends Only", "Late Night", "During Commute",
  "Social Gaming with Friends", "Competitive Sessions", "Relaxation/Stress Relief"
];

// Content interests
const contentInterests = [
  "Esports/Tournaments", "Twitch/YouTube Streams", "Game Reviews", 
  "Walkthroughs/Guides", "Speedrun Content", "Gaming News", 
  "Game Lore/Story Analysis", "Modding Community"
];

export function GamingOpinionForm({ control }: GamingOpinionFormProps) {
  return (
    <div className="space-y-6">
      <FormField
        control={control}
        name="preferences.genre"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-semibold">Game Genres You Enjoy *</FormLabel>
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
        name="preferences.platform"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-semibold">Gaming Platforms *</FormLabel>
            <p className="text-sm text-muted-foreground mb-3">Select all platforms you use</p>
            <div className="grid grid-cols-2 gap-2">
              {platforms.map((platform) => {
                const selected = Array.isArray(field.value) ? field.value.includes(platform) : field.value === platform;
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
                    <span className="text-xs sm:text-sm font-medium">{platform}</span>
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
        name="preferences.mode"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-semibold">Preferred Game Modes *</FormLabel>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {modes.map((mode) => {
                const selected = Array.isArray(field.value) ? field.value.includes(mode) : field.value === mode;
                return (
                  <Card
                    key={mode}
                    onClick={() => {
                      const current = Array.isArray(field.value) ? field.value : [];
                      if (selected) {
                        field.onChange(current.filter((m: string) => m !== mode));
                      } else {
                        field.onChange([...current, mode]);
                      }
                    }}
                    className={`p-3 cursor-pointer transition-all text-center ${
                      selected ? 'border-primary bg-primary/5 shadow-md' : 'hover:border-primary/50'
                    }`}
                  >
                    <span className="text-xs sm:text-sm font-medium">{mode}</span>
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
        name="preferences.visualStyle"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-semibold">Visual Style Preference *</FormLabel>
            <div className="flex flex-wrap gap-2">
              {visualStyles.map((style) => {
                const selected = Array.isArray(field.value) ? field.value.includes(style) : field.value === style;
                return (
                  <Badge
                    key={style}
                    onClick={() => {
                      const current = Array.isArray(field.value) ? field.value : [];
                      if (selected) {
                        field.onChange(current.filter((s: string) => s !== style));
                      } else {
                        field.onChange([...current, style]);
                      }
                    }}
                    className={`cursor-pointer transition-all py-1.5 px-3 ${
                      selected ? 'gradient-accent text-white border-0 shadow-md' : 'bg-muted hover:bg-muted/80 text-foreground border hover:border-primary/30'
                    }`}
                  >
                    {style}
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
        name="preferences.perspective"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-semibold">Camera Perspective *</FormLabel>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {perspectives.map((perspective) => {
                const selected = Array.isArray(field.value) ? field.value.includes(perspective) : field.value === perspective;
                return (
                  <Card
                    key={perspective}
                    onClick={() => {
                      const current = Array.isArray(field.value) ? field.value : [];
                      if (selected) {
                        field.onChange(current.filter((p: string) => p !== perspective));
                      } else {
                        field.onChange([...current, perspective]);
                      }
                    }}
                    className={`p-3 cursor-pointer transition-all text-center ${
                      selected ? 'border-primary bg-primary/5 shadow-md' : 'hover:border-primary/50'
                    }`}
                  >
                    <span className="text-xs sm:text-sm font-medium">{perspective}</span>
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
            <FormLabel className="text-base font-semibold">Game Length Preference *</FormLabel>
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
        name="preferences.gamingContext"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-semibold">When Do You Play? *</FormLabel>
            <div className="flex flex-wrap gap-2">
              {gamingContexts.map((context) => {
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
                      selected ? 'gradient-primary text-white border-0 shadow-md' : 'bg-muted hover:bg-muted/80 text-foreground border hover:border-primary/30'
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
        name="preferences.paymentModels"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-semibold">Payment Preference *</FormLabel>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {paymentModels.map((model) => {
                const selected = Array.isArray(field.value) ? field.value.includes(model) : field.value === model;
                return (
                  <Card
                    key={model}
                    onClick={() => {
                      const current = Array.isArray(field.value) ? field.value : [];
                      if (selected) {
                        field.onChange(current.filter((m: string) => m !== model));
                      } else {
                        field.onChange([...current, model]);
                      }
                    }}
                    className={`p-3 cursor-pointer transition-all text-center ${
                      selected ? 'border-green-500 bg-green-500/5 shadow-md' : 'hover:border-primary/50'
                    }`}
                  >
                    <span className="text-xs sm:text-sm font-medium">{model}</span>
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
        name="preferences.esports"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-semibold">Gaming Content Interests *</FormLabel>
            <div className="flex flex-wrap gap-2">
              {contentInterests.map((interest) => {
                const selected = Array.isArray(field.value) ? field.value.includes(interest) : field.value === interest;
                return (
                  <Badge
                    key={interest}
                    onClick={() => {
                      const current = Array.isArray(field.value) ? field.value : [];
                      if (selected) {
                        field.onChange(current.filter((i: string) => i !== interest));
                      } else {
                        field.onChange([...current, interest]);
                      }
                    }}
                    className={`cursor-pointer transition-all py-1.5 px-3 ${
                      selected ? 'gradient-accent text-white border-0 shadow-md' : 'bg-muted hover:bg-muted/80 text-foreground border hover:border-primary/30'
                    }`}
                  >
                    {interest}
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
            <FormLabel className="text-base font-semibold">Preferred Game Languages *</FormLabel>
            <p className="text-sm text-muted-foreground mb-3">Languages you prefer for game text/voice</p>
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
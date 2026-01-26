import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Rocket, Sparkles, AlertCircle, Check, Flame } from "lucide-react";
import { useHypeSignals } from "@/hooks/useHypeSignals";
import { cn } from "@/lib/utils";

interface HypeSubmitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (phrase: string, categoryId: string) => void;
  defaultCategoryId?: string;
}

export function HypeSubmitDialog({
  open,
  onOpenChange,
  onSuccess,
  defaultCategoryId,
}: HypeSubmitDialogProps) {
  const [phrase, setPhrase] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>(defaultCategoryId || "");
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const { categories, submitSignal, canSubmit, userSubmissionsToday } = useHypeSignals();

  const words = phrase.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const isValidWordCount = wordCount >= 2 && wordCount <= 3;
  const charCount = phrase.length;
  const isValidLength = charCount >= 2 && charCount <= 50;

  const handleSubmit = async () => {
    if (!isValidWordCount || !isValidLength || !selectedCategory) return;
    
    setSubmitting(true);
    const success = await submitSignal(phrase.trim(), selectedCategory);
    setSubmitting(false);
    
    if (success) {
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setPhrase("");
        setSelectedCategory(defaultCategoryId || "");
        onOpenChange(false);
        onSuccess?.(phrase.trim(), selectedCategory);
      }, 1500);
    }
  };

  const categoryIcons: Record<string, string> = {
    "Film": "🎬",
    "Music": "🎵",
    "OTT": "📺",
    "TV": "📡",
    "YouTube": "▶️",
    "Gaming": "🎮",
    "Social Media": "📱",
    "App Development": "💻",
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <AnimatePresence mode="wait">
          {showSuccess ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex flex-col items-center justify-center py-12"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.1 }}
                className="w-20 h-20 rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center mb-4"
              >
                <Rocket className="w-10 h-10 text-white" />
              </motion.div>
              <h3 className="text-2xl font-bold text-foreground">Signal Launched! 🚀</h3>
              <p className="text-muted-foreground mt-2">+5 points earned</p>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-xl">
                  <Flame className="w-6 h-6 text-orange-500" />
                  Launch a Hype Signal
                </DialogTitle>
                <DialogDescription>
                  Tell the industry what you want to see created next. Keep it short and punchy!
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-4">
                {/* Phrase Input */}
                <div className="space-y-2">
                  <Label htmlFor="phrase" className="flex items-center justify-between">
                    <span>What do you want?</span>
                    <span className={cn(
                      "text-xs",
                      isValidWordCount ? "text-green-500" : "text-muted-foreground"
                    )}>
                      {wordCount}/3 words
                    </span>
                  </Label>
                  <Input
                    id="phrase"
                    placeholder="e.g., 'Space Horror Film' or 'Indie Folk Album'"
                    value={phrase}
                    onChange={(e) => setPhrase(e.target.value)}
                    className={cn(
                      "text-lg font-medium",
                      phrase && !isValidWordCount && "border-destructive"
                    )}
                    maxLength={50}
                  />
                  <div className="flex items-center justify-between text-xs">
                    <span className={cn(
                      phrase && !isValidWordCount ? "text-destructive" : "text-muted-foreground"
                    )}>
                      {phrase && !isValidWordCount ? (
                        <span className="flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          Use 2-3 words only
                        </span>
                      ) : (
                        "2-3 words describing your vision"
                      )}
                    </span>
                    <span className="text-muted-foreground">{charCount}/50</span>
                  </div>
                </div>

                {/* Category Selection */}
                <div className="space-y-2">
                  <Label>Choose a Category</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {categories.map((cat) => (
                      <motion.button
                        key={cat.id}
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={cn(
                          "relative p-3 rounded-lg border-2 transition-all duration-200",
                          "flex flex-col items-center gap-1 text-center",
                          selectedCategory === cat.id
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary/50"
                        )}
                      >
                        {selectedCategory === cat.id && (
                          <motion.div
                            layoutId="selected-category"
                            className="absolute inset-0 bg-primary/10 rounded-lg"
                          />
                        )}
                        <span className="text-xl relative z-10">
                          {categoryIcons[cat.name] || "📌"}
                        </span>
                        <span className="text-xs font-medium relative z-10">
                          {cat.name}
                        </span>
                        {selectedCategory === cat.id && (
                          <Check className="absolute top-1 right-1 w-4 h-4 text-primary" />
                        )}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Daily Limit Info */}
                <div className="flex items-center justify-between text-sm p-3 rounded-lg bg-muted/50">
                  <span className="text-muted-foreground">Today's signals</span>
                  <Badge variant={canSubmit ? "secondary" : "destructive"}>
                    {userSubmissionsToday}/3 used
                  </Badge>
                </div>

                {/* Submit Button */}
                <Button
                  onClick={handleSubmit}
                  disabled={!isValidWordCount || !selectedCategory || !canSubmit || submitting}
                  className="w-full gap-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
                  size="lg"
                >
                  {submitting ? (
                    <>
                      <Sparkles className="w-5 h-5 animate-spin" />
                      Launching...
                    </>
                  ) : (
                    <>
                      <Rocket className="w-5 h-5" />
                      Launch Signal
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}

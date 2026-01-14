import { useState, useCallback, memo } from "react";
import { motion, PanInfo, useAnimation } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Check, Sparkles } from "lucide-react";
import confetti from "canvas-confetti";
import { useIsMobile } from "@/hooks/use-mobile";

interface Option {
  id: string;
  label: string;
}

interface SwipeableQuestionProps {
  questionText: string;
  options: Option[];
  questionNumber: number;
  totalQuestions: number;
  onSelect: (optionId: string) => void;
  disabled: boolean;
  selectedOption?: string | null;
}

// Memoized option icon function to prevent re-renders
const getOptionIcon = (label: string): string => {
  if (label.includes("Cinematic") || label.includes("Adventure")) return "🎬";
  if (label.includes("Fun") || label.includes("Comedy")) return "😄";
  if (label.includes("Emotional") || label.includes("Drama")) return "😢";
  if (label.includes("Dark") || label.includes("Intense")) return "🌑";
  if (label.includes("Chill") || label.includes("Relax")) return "😌";
  if (label.includes("Thriller") || label.includes("Excitement")) return "😱";
  if (label.includes("Sci-Fi") || label.includes("Curiosity")) return "🚀";
  if (label.includes("Mobile")) return "📱";
  if (label.includes("TV")) return "📺";
  if (label.includes("Laptop")) return "💻";
  if (label.includes("Tablet")) return "📱";
  if (label.includes("Smart Speaker")) return "🔊";
  if (label.includes("Netflix")) return "🎬";
  if (label.includes("Prime") || label.includes("Amazon")) return "📦";
  if (label.includes("YouTube")) return "▶️";
  if (label.includes("Instagram")) return "📷";
  if (label.includes("Hotstar")) return "⭐";
  if (label.includes("Spotify")) return "🎵";
  if (label.includes("JioCinema")) return "🎥";
  if (label.includes("Zee5")) return "📺";
  if (label.includes("Facebook")) return "👥";
  return "✨";
};

function SwipeableQuestionComponent({
  questionText,
  options,
  questionNumber,
  totalQuestions,
  onSelect,
  disabled,
  selectedOption,
}: SwipeableQuestionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const controls = useAnimation();
  const isMobile = useIsMobile();

  const handleDragEnd = useCallback(async (event: any, info: PanInfo) => {
    const threshold = 100;
    const velocity = info.velocity.x;
    
    // Check if this is actually a drag or just a click
    const isDrag = Math.abs(info.offset.x) > 10 || Math.abs(info.offset.y) > 10;
    
    if (!isDrag) {
      // This was a click, not a drag - don't do anything
      controls.start({ x: 0, rotate: 0 });
      return;
    }

    if (Math.abs(info.offset.x) > threshold || Math.abs(velocity) > 500) {
      // Swiped right - select this option
      if (info.offset.x > 0 && !disabled) {
        await controls.start({
          x: 500,
          rotate: 20,
          opacity: 0,
          transition: { duration: 0.3 },
        });
        
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.6 },
          colors: ["#19E3EC", "#C07CFF", "#6366f1"],
        });

        onSelect(options[currentIndex].id);
        
        // Move to next option
        if (currentIndex < options.length - 1) {
          setCurrentIndex(currentIndex + 1);
          controls.set({ x: 0, rotate: 0, opacity: 1 });
        }
      } else if (info.offset.x < 0) {
        // Swiped left - skip this option
        await controls.start({
          x: -500,
          rotate: -20,
          opacity: 0,
          transition: { duration: 0.3 },
        });
        
        if (currentIndex < options.length - 1) {
          setCurrentIndex(currentIndex + 1);
          controls.set({ x: 0, rotate: 0, opacity: 1 });
        } else {
          controls.set({ x: 0, rotate: 0, opacity: 1 });
        }
      }
    } else {
      // Return to center
      controls.start({ x: 0, rotate: 0 });
    }
  }, [controls, disabled, onSelect, options, currentIndex]);

  const handleOptionClick = useCallback((optionId: string) => {
    if (disabled) return;
    
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#19E3EC", "#C07CFF", "#6366f1"],
    });

    onSelect(optionId);
  }, [disabled, onSelect]);

  const currentOption = options[currentIndex];
  const isSelected = selectedOption === currentOption?.id;

  return (
    <div className="relative w-full h-[400px] md:h-[500px] flex items-center justify-center">
      {/* Background cards for depth effect - simplified on mobile */}
      {currentIndex < options.length - 1 && !isMobile && (
        <div className="absolute">
          <Card className="w-[340px] h-[450px] bg-gradient-to-br from-muted/50 to-muted/30 border-2 border-border/30 scale-95 translate-y-2 opacity-70" />
        </div>
      )}

      {/* Main swipeable card */}
      {currentOption && (
        <motion.div
          drag={!disabled ? "x" : false}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.1}
          onDragEnd={handleDragEnd}
          animate={controls}
          className="absolute cursor-pointer md:cursor-grab md:active:cursor-grabbing"
          style={{ touchAction: "pan-y", willChange: "transform" }}
        >
          <Card className={`
            w-[320px] h-[400px] md:w-[360px] md:h-[480px] bg-gradient-to-br from-background via-background to-muted/20 
            border-2 shadow-xl md:shadow-2xl relative overflow-hidden
            ${isSelected ? "border-primary" : "border-border"}
          `}>
            {/* Decorative elements - static on mobile */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
            {!isMobile && (
              <>
                <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-primary/10 blur-3xl" />
                <div className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full bg-accent/10 blur-3xl" />
              </>
            )}

            {/* Content */}
            <div className="relative h-full flex flex-col items-center justify-center p-6 md:p-8 gap-4 md:gap-6">
              {/* Question badge - no animation on mobile */}
              <div className="absolute top-4 md:top-6 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-primary/10 border border-primary/30 rounded-full">
                <span className="text-xs font-semibold text-primary">
                  Question {questionNumber} of {totalQuestions}
                </span>
              </div>

              {/* Large icon - reduced animation on mobile */}
              {isMobile ? (
                <div className="text-6xl md:text-8xl mb-2 md:mb-4">
                  {getOptionIcon(currentOption.label)}
                </div>
              ) : (
                <motion.div
                  className="text-8xl mb-4"
                  animate={{ 
                    rotate: [0, -10, 10, -10, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
                >
                  {getOptionIcon(currentOption.label)}
                </motion.div>
              )}

              {/* Option label */}
              <h3 className="text-xl md:text-2xl font-bold text-center mb-1 md:mb-2">
                {currentOption.label}
              </h3>

              {/* Question text */}
              <p className="text-xs md:text-sm text-muted-foreground text-center max-w-[260px] md:max-w-[280px]">
                {questionText}
              </p>

              {/* Tap to select button */}
              {!disabled && !isSelected && (
                <button
                  onClick={() => handleOptionClick(currentOption.id)}
                  className="absolute bottom-6 md:bottom-8 px-6 md:px-8 py-2.5 md:py-3 bg-gradient-to-r from-primary to-accent rounded-full text-white font-semibold shadow-lg active:scale-95 transition-transform"
                >
                  <span className="flex items-center gap-2">
                    Tap to Select
                    <Sparkles className="w-4 h-4" />
                  </span>
                </button>
              )}

              {isSelected && (
                <motion.div
                  className="absolute bottom-8 px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full text-white font-semibold shadow-lg"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <span className="flex items-center gap-2">
                    <Check className="w-5 h-5" />
                    Selected!
                  </span>
                </motion.div>
              )}

              {/* Swipe indicators - hide on mobile for cleaner UX */}
              {!disabled && !isSelected && !isMobile && (
                <div className="absolute bottom-24 left-0 right-0 flex justify-between px-8 text-xs text-muted-foreground">
                  <span>← Swipe to skip</span>
                  <span>Swipe to select →</span>
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      )}

      {/* Progress dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {options.map((_, index) => (
          <div
            key={index}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentIndex
                ? "w-8 bg-primary"
                : index < currentIndex
                ? "bg-primary/50"
                : "bg-muted"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

// Export memoized component for better performance
export const SwipeableQuestion = memo(SwipeableQuestionComponent);

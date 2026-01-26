import { useState, useRef } from "react";
import { motion, useMotionValue, useTransform, PanInfo, AnimatePresence } from "framer-motion";
import { Flame, ArrowRight, Clock, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { HypeSignal } from "@/hooks/useHypeSignals";

interface SwipeableHypeCardProps {
  signals: HypeSignal[];
  onVote: (signalId: string, voteType: 'hype' | 'pass') => Promise<boolean>;
  currentUserId: string | null;
}

export function SwipeableHypeCard({ signals, onVote, currentUserId }: SwipeableHypeCardProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [exitDirection, setExitDirection] = useState<'left' | 'right' | null>(null);
  const constraintsRef = useRef(null);
  
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 0, 200], [-15, 0, 15]);
  const hypeOpacity = useTransform(x, [0, 100], [0, 1]);
  const passOpacity = useTransform(x, [-100, 0], [1, 0]);
  
  const currentSignal = signals[currentIndex];
  
  if (!currentSignal) {
    return null;
  }
  
  const daysLeft = Math.max(0, Math.ceil((new Date(currentSignal.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
  
  const handleDragEnd = async (_: any, info: PanInfo) => {
    const threshold = 100;
    
    if (info.offset.x > threshold) {
      // Swiped right - Hype
      setExitDirection('right');
      triggerHaptic('medium');
      await onVote(currentSignal.id, 'hype');
      setTimeout(() => {
        setExitDirection(null);
        setCurrentIndex(prev => prev + 1);
        x.set(0);
      }, 300);
    } else if (info.offset.x < -threshold) {
      // Swiped left - Pass
      setExitDirection('left');
      triggerHaptic('light');
      await onVote(currentSignal.id, 'pass');
      setTimeout(() => {
        setExitDirection(null);
        setCurrentIndex(prev => prev + 1);
        x.set(0);
      }, 300);
    }
  };
  
  const triggerHaptic = (type: 'light' | 'medium' | 'heavy' = 'light') => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      const patterns = { light: 10, medium: 25, heavy: 50 };
      navigator.vibrate(patterns[type]);
    }
  };
  
  const handleButtonVote = async (voteType: 'hype' | 'pass') => {
    setExitDirection(voteType === 'hype' ? 'right' : 'left');
    triggerHaptic(voteType === 'hype' ? 'medium' : 'light');
    await onVote(currentSignal.id, voteType);
    setTimeout(() => {
      setExitDirection(null);
      setCurrentIndex(prev => prev + 1);
      x.set(0);
    }, 300);
  };
  
  return (
    <div className="space-y-4">
      {/* Progress indicator */}
      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <span>{currentIndex + 1} of {signals.length}</span>
      </div>
      
      <motion.div
        ref={constraintsRef}
        className="relative w-full max-w-sm mx-auto touch-none"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSignal.id}
            style={{ x, rotate }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.8}
            onDragEnd={handleDragEnd}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={exitDirection ? { 
              x: exitDirection === 'right' ? 500 : -500,
              opacity: 0,
              transition: { duration: 0.3 }
            } : { scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            whileTap={{ scale: 1.02 }}
            className="relative p-6 rounded-3xl bg-card border-2 border-border/50 shadow-xl cursor-grab active:cursor-grabbing"
          >
            {/* Hype indicator overlay */}
            <motion.div
              style={{ opacity: hypeOpacity }}
              className="absolute inset-0 rounded-3xl bg-gradient-to-r from-orange-500/20 to-red-500/20 pointer-events-none"
            />
            <motion.div
              style={{ opacity: hypeOpacity }}
              className="absolute top-4 right-4 px-4 py-2 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold text-lg shadow-lg"
            >
              🔥 HYPE
            </motion.div>
            
            {/* Pass indicator overlay */}
            <motion.div
              style={{ opacity: passOpacity }}
              className="absolute inset-0 rounded-3xl bg-muted/30 pointer-events-none"
            />
            <motion.div
              style={{ opacity: passOpacity }}
              className="absolute top-4 left-4 px-4 py-2 rounded-full bg-muted text-muted-foreground font-bold text-lg"
            >
              ➡️ PASS
            </motion.div>
            
            {/* Card content */}
            <div className="relative z-10 space-y-4">
              {/* Category & Time */}
              <div className="flex items-center justify-between">
                <Badge 
                  variant="outline" 
                  className="border-primary/30 bg-primary/5"
                  style={{ borderColor: `${currentSignal.category_color}40` }}
                >
                  <div 
                    className="w-2 h-2 rounded-full mr-1.5" 
                    style={{ backgroundColor: currentSignal.category_color }}
                  />
                  {currentSignal.category_name || "Unknown"}
                </Badge>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  {daysLeft}d left
                </div>
              </div>
              
              {/* Phrase */}
              <div className="py-6">
                <h3 className="text-2xl md:text-3xl font-bold text-center">
                  "{currentSignal.phrase}"
                </h3>
              </div>
              
              {/* Score */}
              <div className="flex items-center justify-center gap-6">
                <div className="text-center">
                  <div className="flex items-center gap-1 text-orange-500">
                    <Flame className="w-5 h-5" />
                    <span className="text-xl font-bold">{currentSignal.hype_count}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">Hypes</span>
                </div>
                
                <div className="w-px h-8 bg-border" />
                
                <div className="text-center">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <ArrowRight className="w-5 h-5" />
                    <span className="text-xl font-bold">{currentSignal.pass_count}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">Passes</span>
                </div>
              </div>
              
              {/* Signal Score */}
              <div className="flex items-center justify-center">
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="font-semibold">
                    Signal Score: <span className="text-primary">{currentSignal.signal_score}</span>
                  </span>
                </div>
              </div>
            </div>
            
            {/* Swipe hint */}
            <div className="mt-6 flex items-center justify-between text-xs text-muted-foreground">
              <span>← Pass</span>
              <span className="text-center">Swipe to vote</span>
              <span>Hype →</span>
            </div>
          </motion.div>
        </AnimatePresence>
      </motion.div>
      
      {/* Button controls for non-swipe users */}
      <div className="flex items-center justify-center gap-4 mt-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleButtonVote('pass')}
          className="w-14 h-14 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-muted/80 transition-colors shadow-md"
        >
          <ArrowRight className="w-6 h-6" />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleButtonVote('hype')}
          className="w-16 h-16 rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-shadow"
        >
          <Flame className="w-8 h-8" />
        </motion.button>
      </div>
    </div>
  );
}

import { useState, useEffect, useCallback, useRef } from "react";
import GuidedTour from "@/components/onboarding/GuidedTour";

// Global flag to prevent multiple tour instances across all wrapper instances
let globalTourActive = false;

export function GlobalTourWrapper() {
  const [showTour, setShowTour] = useState(false);
  const [tourKey, setTourKey] = useState(0);
  const isStartingRef = useRef(false);
  const scrollYRef = useRef(0);

  const handleStartTour = useCallback(() => {
    // Prevent duplicate triggers - check global flag AND local state
    if (isStartingRef.current || showTour || globalTourActive) {
      console.log('Tour already active, preventing duplicate');
      return;
    }
    
    isStartingRef.current = true;
    globalTourActive = true;
    
    // Store current scroll position
    scrollYRef.current = window.scrollY;
    
    // Lock body scroll when tour is active
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.top = `-${scrollYRef.current}px`;
    
    // Reset and show fresh tour instance
    setTourKey(prev => prev + 1);
    setShowTour(true);
    
    // Reset starting flag after a delay, but keep globalTourActive
    setTimeout(() => {
      isStartingRef.current = false;
    }, 1000);
  }, [showTour]);

  const handleCloseTour = useCallback(() => {
    // Immediately prevent any new tour from starting
    isStartingRef.current = true;
    
    // Clean up body styles completely
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.width = '';
    document.body.style.top = '';
    document.body.style.pointerEvents = '';
    
    // Restore scroll position
    window.scrollTo(0, scrollYRef.current);
    
    // Close tour and reset global flag
    setShowTour(false);
    globalTourActive = false;
    
    // Allow new tours to start after a delay
    setTimeout(() => {
      isStartingRef.current = false;
    }, 500);
  }, []);

  useEffect(() => {
    const startHandler = (e: Event) => {
      e.stopPropagation();
      handleStartTour();
    };
    
    window.addEventListener('start-guided-tour', startHandler);
    
    // Cleanup on unmount
    return () => {
      window.removeEventListener('start-guided-tour', startHandler);
      // Restore body styles on unmount
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.top = '';
      document.body.style.pointerEvents = '';
      // Reset global flag on unmount
      globalTourActive = false;
    };
  }, [handleStartTour]);

  // Don't render anything when tour is closed
  if (!showTour) return null;

  // Use key to force fresh mount each time tour opens - single wrapper div
  return (
    <div 
      className="fixed inset-0 z-[9999]" 
      onClick={(e) => e.stopPropagation()}
      style={{ isolation: 'isolate' }}
    >
      <GuidedTour key={tourKey} onComplete={handleCloseTour} />
    </div>
  );
}

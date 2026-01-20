import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useSpotlightTour } from '@/hooks/useSpotlightTour';
import GuidedTour from './GuidedTour';

// This component initializes and manages the spotlight tour
// It handles resuming the tour after navigation between pages
export function SpotlightTourProvider() {
  const location = useLocation();
  const { startTour, shouldShowTour, showQuickTour, closeQuickTour } = useSpotlightTour();

  // Re-check tour status on route changes
  useEffect(() => {
    const checkPendingTour = async () => {
      const pendingTour = localStorage.getItem('inphrone_tour_pending');
      
      // If tour is in progress and we navigated, the hook will handle resumption
      if (pendingTour === 'true') {
        // Tour resumption is handled in useSpotlightTour
        return;
      }
    };

    checkPendingTour();
  }, [location.pathname]);

  // Render the Quick Tour (GuidedTour component) when showQuickTour is true
  if (showQuickTour) {
    return <GuidedTour onComplete={closeQuickTour} />;
  }

  return null;
}

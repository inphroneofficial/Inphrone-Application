import { useEffect, useRef, useCallback, useState } from 'react';
import { driver, Driver, DriveStep, Config } from 'driver.js';
import 'driver.js/dist/driver.css';
import { supabase } from '@/integrations/supabase/client';

const TOUR_COMPLETED_KEY = 'inphrone_tour_completed';
const TOUR_PENDING_KEY = 'inphrone_tour_pending';
const TOUR_CURRENT_PHASE_KEY = 'inphrone_tour_phase';
const TOUR_TYPE_KEY = 'inphrone_tour_type';

export type TourType = 'full' | 'quick';

// Tour phases with navigation for FULL tour
interface TourPhase {
  route: string;
  steps: DriveStep[];
  delayMs?: number;
}

// Premium Full Tour - 9 phases with actual navigation
const getFullTourPhases = (): TourPhase[] => [
  // Phase 1: Home Page Welcome
  {
    route: '/',
    delayMs: 1000,
    steps: [
      {
        popover: {
          title: '🌟 Welcome to INPHRONE',
          description: 'The world\'s first Audience Intelligence Platform! Your voice shapes what entertainment gets created next. Let\'s explore every feature together.',
          side: 'over',
          align: 'center',
        },
      },
      {
        element: '#main-navigation',
        popover: {
          title: '🧭 Command Center',
          description: 'Your navigation hub to access Dashboard, Insights, InphroSync, YourTurn, Coupons, and more. Everything you need is just one click away.',
          side: 'bottom',
          align: 'start',
        },
      },
      {
        element: '#theme-toggle',
        popover: {
          title: '🎨 Theme Customization',
          description: 'Personalize your experience with Light, Dark, or System themes. Your preference syncs across all devices automatically.',
          side: 'bottom',
          align: 'center',
        },
      },
      {
        element: '#settings-button',
        popover: {
          title: '⚙️ Settings & Preferences',
          description: 'Control notifications, choose your language from 20+ options, manage privacy, and restart this tour anytime.',
          side: 'bottom',
          align: 'end',
        },
      },
      {
        element: '#notification-bell',
        popover: {
          title: '🔔 Smart Notifications',
          description: 'Real-time alerts for likes, trending topics, earned rewards, and platform updates. Never miss important activity!',
          side: 'bottom',
          align: 'center',
        },
      },
      {
        element: '#live-dashboard',
        popover: {
          title: '📊 Live Intelligence Feed',
          description: 'Watch real-time platform statistics: global users, opinions shared, trending categories, and live community engagement metrics.',
          side: 'top',
          align: 'center',
        },
      },
    ],
  },
  // Phase 2: About Page
  {
    route: '/about',
    delayMs: 800,
    steps: [
      {
        popover: {
          title: '📖 Our Mission & Story',
          description: 'Discover how INPHRONE democratizes entertainment intelligence, connecting audiences with creators worldwide. We\'re building the future of content creation together.',
          side: 'over',
          align: 'center',
        },
      },
    ],
  },
  // Phase 3: Dashboard
  {
    route: '/dashboard',
    delayMs: 900,
    steps: [
      {
        popover: {
          title: '📈 Your Personal Command Center',
          description: 'Track your contributions, monitor reward points, view personalized insights, submit opinions, and see your impact on the entertainment industry!',
          side: 'over',
          align: 'center',
        },
      },
    ],
  },
  // Phase 4: Insights
  {
    route: '/insights',
    delayMs: 800,
    steps: [
      {
        popover: {
          title: '💡 Entertainment Intelligence Hub',
          description: 'Explore aggregated insights from our global community. Deep-dive into Film, Music, Gaming, OTT, TV, YouTube, Social Media & App Development with demographics, trends, and sentiment analysis.',
          side: 'over',
          align: 'center',
        },
      },
    ],
  },
  // Phase 5: InphroSync
  {
    route: '/inphrosync',
    delayMs: 800,
    steps: [
      {
        popover: {
          title: '🔄 InphroSync Daily Pulse',
          description: 'Answer fun daily entertainment questions! Build participation streaks, unlock exclusive badges, and discover how your opinions align with the global community.',
          side: 'over',
          align: 'center',
        },
      },
    ],
  },
  // Phase 6: YourTurn
  {
    route: '/yourturn',
    delayMs: 800,
    steps: [
      {
        popover: {
          title: '🎯 YourTurn Community Arena',
          description: 'Create and vote on community-driven polls! Win time slots to host your own questions, see real-time voting, and engage with fellow entertainment enthusiasts.',
          side: 'over',
          align: 'center',
        },
      },
    ],
  },
  // Phase 7: Coupons
  {
    route: '/my-coupons',
    delayMs: 800,
    steps: [
      {
        popover: {
          title: '🎁 Exclusive Reward Coupons',
          description: 'Earn discount coupons from top brands as rewards for your valuable contributions! Track expiry dates, copy codes instantly, and save on purchases.',
          side: 'over',
          align: 'center',
        },
      },
    ],
  },
  // Phase 8: Profile
  {
    route: '/profile',
    delayMs: 800,
    steps: [
      {
        popover: {
          title: '👤 Your INPHRONE Identity',
          description: 'Manage your profile, view achievements, track earned badges and levels, see your complete contribution history, and showcase your entertainment expertise.',
          side: 'over',
          align: 'center',
        },
      },
    ],
  },
  // Phase 9: Final - Back to Dashboard
  {
    route: '/dashboard',
    delayMs: 700,
    steps: [
      {
        popover: {
          title: '🎊 You\'re All Set!',
          description: 'You\'ve explored all major features of INPHRONE! Start sharing your entertainment opinions to earn rewards, level up, and help shape what gets created next. Restart this tour anytime from Settings.',
          side: 'over',
          align: 'center',
        },
      },
    ],
  },
];

// Quick Info Tour - 14 steps, single page overview
const getQuickTourSteps = (): DriveStep[] => [
  {
    popover: {
      title: '✨ Quick Overview',
      description: 'Welcome to INPHRONE! This quick tour will introduce you to all features without navigating away. Perfect for a fast overview!',
      side: 'over',
      align: 'center',
    },
  },
  {
    element: '#main-navigation',
    popover: {
      title: '🧭 Navigation Menu',
      description: 'Access all platform sections: Dashboard for your activity, Insights for analytics, InphroSync for daily questions, YourTurn for polls, and Coupons for rewards.',
      side: 'bottom',
      align: 'start',
    },
  },
  {
    element: '#theme-toggle',
    popover: {
      title: '🎨 Theme Toggle',
      description: 'Switch between Light, Dark, or System themes. Your preference is saved automatically.',
      side: 'bottom',
      align: 'center',
    },
  },
  {
    element: '#notification-bell',
    popover: {
      title: '🔔 Notifications',
      description: 'Get real-time alerts for likes on your opinions, trending content, and reward updates.',
      side: 'bottom',
      align: 'center',
    },
  },
  {
    element: '#settings-button',
    popover: {
      title: '⚙️ Settings',
      description: 'Manage notifications, select language from 20+ options, and restart tours anytime.',
      side: 'bottom',
      align: 'end',
    },
  },
  {
    element: '#live-dashboard',
    popover: {
      title: '📊 Live Stats',
      description: 'Real-time platform metrics: total users, opinions shared, and community activity across all categories.',
      side: 'top',
      align: 'center',
    },
  },
  {
    popover: {
      title: '📈 Dashboard Features',
      description: 'Your personal hub to submit opinions, track contributions, view rewards, and monitor your impact on entertainment decisions.',
      side: 'over',
      align: 'center',
    },
  },
  {
    popover: {
      title: '💡 Insights Analytics',
      description: 'Deep-dive into 8 entertainment categories: Film, Music, OTT, TV, YouTube, Gaming, Social Media & App Development. View demographics, trends, and sentiment.',
      side: 'over',
      align: 'center',
    },
  },
  {
    popover: {
      title: '🔄 InphroSync Daily',
      description: 'Answer fun daily questions to build streaks, earn badges, and see how your opinions compare with the global community.',
      side: 'over',
      align: 'center',
    },
  },
  {
    popover: {
      title: '🎯 YourTurn Polls',
      description: 'Create community polls, vote on questions, and win time slots to host your own entertainment surveys.',
      side: 'over',
      align: 'center',
    },
  },
  {
    popover: {
      title: '🎁 Coupon Rewards',
      description: 'Earn exclusive discount coupons from brands as you contribute opinions. Track and use your earned rewards.',
      side: 'over',
      align: 'center',
    },
  },
  {
    popover: {
      title: '👤 Profile & Achievements',
      description: 'View your profile, earned badges, achievement levels, and complete contribution history.',
      side: 'over',
      align: 'center',
    },
  },
  {
    popover: {
      title: '📖 About & FAQ',
      description: 'Learn about INPHRONE\'s mission, team, and get answers to common questions in the Help Center.',
      side: 'over',
      align: 'center',
    },
  },
  {
    popover: {
      title: '🚀 Start Exploring!',
      description: 'You now know all the key features! Start sharing opinions to earn rewards, level up, and shape entertainment. Access full guided tour from Settings anytime!',
      side: 'over',
      align: 'center',
    },
  },
];

export function useSpotlightTour() {
  const driverRef = useRef<Driver | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const isNavigatingRef = useRef(false);
  const currentPhaseRef = useRef(0);
  const tourTypeRef = useRef<TourType>('full');

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const markTourCompleted = useCallback(async () => {
    localStorage.setItem(TOUR_COMPLETED_KEY, 'true');
    localStorage.removeItem(TOUR_PENDING_KEY);
    localStorage.removeItem(TOUR_CURRENT_PHASE_KEY);
    localStorage.removeItem(TOUR_TYPE_KEY);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('settings')
          .eq('id', user.id)
          .single();

        const currentSettings = (profile?.settings as Record<string, unknown>) || {};
        await supabase
          .from('profiles')
          .update({
            settings: { ...currentSettings, tour_completed: true }
          })
          .eq('id', user.id);
      }
    } catch (error) {
      console.error('Error updating tour status:', error);
    }
  }, []);

  const runFullTourPhase = useCallback((phaseIndex: number) => {
    const phases = getFullTourPhases();
    
    if (phaseIndex >= phases.length) {
      markTourCompleted();
      return;
    }

    const phase = phases[phaseIndex];
    const currentPath = window.location.pathname;
    currentPhaseRef.current = phaseIndex;

    // If we need to navigate to a different page
    if (currentPath !== phase.route) {
      isNavigatingRef.current = true;
      localStorage.setItem(TOUR_CURRENT_PHASE_KEY, phaseIndex.toString());
      localStorage.setItem(TOUR_PENDING_KEY, 'true');
      localStorage.setItem(TOUR_TYPE_KEY, 'full');
      
      window.location.href = phase.route;
      return;
    }

    isNavigatingRef.current = false;

    // Destroy any existing driver
    if (driverRef.current) {
      try {
        driverRef.current.destroy();
      } catch (e) {
        // Ignore cleanup errors
      }
    }

    // Wait for page to be ready
    setTimeout(() => {
      const isLastPhase = phaseIndex === phases.length - 1;

      const config: Config = {
        showProgress: true,
        showButtons: ['next', 'previous', 'close'],
        steps: phase.steps,
        nextBtnText: isLastPhase ? '🎉 Complete Tour' : 'Next →',
        prevBtnText: '← Back',
        doneBtnText: isLastPhase ? '✨ Finish Tour' : 'Continue →',
        progressText: `Section ${phaseIndex + 1} of ${phases.length}`,
        allowClose: true,
        overlayColor: 'rgba(0, 0, 0, 0.88)',
        stagePadding: 16,
        stageRadius: 16,
        animate: true,
        smoothScroll: true,
        allowKeyboardControl: true,
        popoverClass: 'inphrone-premium-tour',
        onHighlightStarted: (el) => {
          if (el) {
            (el as HTMLElement).scrollIntoView?.({ behavior: 'smooth', block: 'center' });
          }
        },
        onDestroyed: () => {
          if (!isNavigatingRef.current) {
            if (isLastPhase) {
              markTourCompleted();
            } else {
              runFullTourPhase(phaseIndex + 1);
            }
          }
        },
      };

      driverRef.current = driver(config);
      driverRef.current.drive();
    }, phase.delayMs || 800);
  }, [markTourCompleted]);

  const runQuickTour = useCallback(() => {
    tourTypeRef.current = 'quick';
    
    // Destroy any existing driver
    if (driverRef.current) {
      try {
        driverRef.current.destroy();
      } catch (e) {
        // Ignore cleanup errors
      }
    }

    setTimeout(() => {
      const steps = getQuickTourSteps();

      const config: Config = {
        showProgress: true,
        showButtons: ['next', 'previous', 'close'],
        steps: steps,
        nextBtnText: 'Next →',
        prevBtnText: '← Back',
        doneBtnText: '✨ Got It!',
        progressText: `Step {{current}} of {{total}}`,
        allowClose: true,
        overlayColor: 'rgba(0, 0, 0, 0.88)',
        stagePadding: 16,
        stageRadius: 16,
        animate: true,
        smoothScroll: true,
        allowKeyboardControl: true,
        popoverClass: 'inphrone-premium-tour',
        onHighlightStarted: (el) => {
          if (el) {
            (el as HTMLElement).scrollIntoView?.({ behavior: 'smooth', block: 'center' });
          }
        },
        onDestroyed: () => {
          markTourCompleted();
        },
      };

      driverRef.current = driver(config);
      driverRef.current.drive();
    }, 600);
  }, [markTourCompleted]);

  const startTour = useCallback((type: TourType = 'full') => {
    // Only allow tour for authenticated users
    if (!isAuthenticated) {
      console.log('Tour not available for unauthenticated users');
      return;
    }

    localStorage.removeItem(TOUR_COMPLETED_KEY);
    localStorage.removeItem(TOUR_PENDING_KEY);
    localStorage.removeItem(TOUR_CURRENT_PHASE_KEY);
    localStorage.removeItem(TOUR_TYPE_KEY);
    
    tourTypeRef.current = type;
    
    if (type === 'full') {
      runFullTourPhase(0);
    } else {
      runQuickTour();
    }
  }, [isAuthenticated, runFullTourPhase, runQuickTour]);

  const shouldShowTour = useCallback(async (): Promise<boolean> => {
    // Must be authenticated
    if (!isAuthenticated) return false;

    // Check localStorage
    const localCompleted = localStorage.getItem(TOUR_COMPLETED_KEY);
    if (localCompleted === 'true') return false;

    // Check database
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('settings')
          .eq('id', user.id)
          .single();

        const settings = profile?.settings as Record<string, unknown> | null;
        if (settings?.tour_completed) {
          localStorage.setItem(TOUR_COMPLETED_KEY, 'true');
          return false;
        }
      }
    } catch (error) {
      console.error('Error checking tour status:', error);
    }

    return true;
  }, [isAuthenticated]);

  // Listen for manual tour trigger (supports both types)
  useEffect(() => {
    const handleStartFullTour = () => {
      startTour('full');
    };
    
    const handleStartQuickTour = () => {
      startTour('quick');
    };

    window.addEventListener('start-guided-tour', handleStartFullTour);
    window.addEventListener('start-quick-tour', handleStartQuickTour);

    return () => {
      window.removeEventListener('start-guided-tour', handleStartFullTour);
      window.removeEventListener('start-quick-tour', handleStartQuickTour);
      if (driverRef.current) {
        try {
          driverRef.current.destroy();
        } catch (e) {
          // Ignore cleanup errors
        }
      }
    };
  }, [startTour]);

  // Resume full tour after navigation
  useEffect(() => {
    const pendingTour = localStorage.getItem(TOUR_PENDING_KEY);
    const savedPhase = localStorage.getItem(TOUR_CURRENT_PHASE_KEY);
    const savedType = localStorage.getItem(TOUR_TYPE_KEY);

    if (pendingTour === 'true' && savedPhase && isAuthenticated && savedType === 'full') {
      const phaseIndex = parseInt(savedPhase, 10);
      
      // Clear pending flag before running
      localStorage.removeItem(TOUR_PENDING_KEY);

      // Delay to ensure page is fully rendered
      setTimeout(() => {
        runFullTourPhase(phaseIndex);
      }, 1200);
    }
  }, [isAuthenticated, runFullTourPhase]);

  // Auto-start tour for first-time authenticated users
  useEffect(() => {
    const autoStartTour = async () => {
      if (!isAuthenticated) return;

      // Don't auto-start if there's a pending tour (resuming)
      const pendingTour = localStorage.getItem(TOUR_PENDING_KEY);
      if (pendingTour === 'true') return;

      // Check if tour should show
      const shouldShow = await shouldShowTour();
      if (!shouldShow) return;

      // Only auto-start on dashboard (after login/onboarding)
      if (window.location.pathname !== '/dashboard') return;

      // Auto-start with full tour
      setTimeout(() => {
        startTour('full');
      }, 2500);
    };

    autoStartTour();
  }, [isAuthenticated, shouldShowTour, startTour]);

  return {
    startTour,
    startFullTour: () => startTour('full'),
    startQuickTour: () => startTour('quick'),
    shouldShowTour,
  };
}

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

// Premium Full Tour - 9 phases with actual navigation and SKIP button
const getFullTourPhases = (): TourPhase[] => [
  // Phase 1: Home Page Welcome
  {
    route: '/',
    delayMs: 1000,
    steps: [
      {
        popover: {
          title: '<span class="tour-emoji">🌟</span> Welcome to INPHRONE',
          description: '<p>The world\'s first Audience Intelligence Platform!</p><p class="tour-highlight">Your voice shapes what entertainment gets created next.</p><p class="tour-small">Let\'s explore every feature together.</p>',
          side: 'over',
          align: 'center',
        },
      },
      {
        element: '#main-navigation',
        popover: {
          title: '<span class="tour-emoji">🧭</span> Command Center',
          description: '<p>Your navigation hub to access all features:</p><ul class="tour-list"><li>📊 Dashboard - Your activity center</li><li>💡 Insights - Industry analytics</li><li>⚡ InphroSync - Daily engagement</li><li>🎯 YourTurn - Community polls</li><li>🎁 Coupons - Your rewards</li></ul>',
          side: 'bottom',
          align: 'start',
        },
      },
      {
        element: '#theme-toggle',
        popover: {
          title: '<span class="tour-emoji">🎨</span> Theme Customization',
          description: '<p>Personalize your experience:</p><ul class="tour-list"><li>☀️ Light Mode</li><li>🌙 Dark Mode</li><li>💻 System Auto</li></ul><p class="tour-small">Syncs across all devices!</p>',
          side: 'bottom',
          align: 'center',
        },
      },
      {
        element: '#settings-button',
        popover: {
          title: '<span class="tour-emoji">⚙️</span> Settings & Preferences',
          description: '<p>Control your INPHRONE experience:</p><ul class="tour-list"><li>🔔 Notification preferences</li><li>🌐 20+ language options</li><li>🔒 Privacy settings</li><li>🔄 Restart this tour anytime</li></ul>',
          side: 'bottom',
          align: 'end',
        },
      },
      {
        element: '#notification-bell',
        popover: {
          title: '<span class="tour-emoji">🔔</span> Smart Notifications',
          description: '<p>Never miss important updates:</p><ul class="tour-list"><li>❤️ When someone likes your opinion</li><li>🔥 Trending topics in your categories</li><li>🎁 New rewards earned</li><li>📢 Platform announcements</li></ul>',
          side: 'bottom',
          align: 'center',
        },
      },
      {
        element: '#live-dashboard',
        popover: {
          title: '<span class="tour-emoji">📊</span> Live Intelligence Feed',
          description: '<p>Watch real-time platform activity:</p><ul class="tour-list"><li>👥 Global user count</li><li>💬 Opinions shared today</li><li>🔥 Trending categories</li><li>⚡ Live engagement metrics</li></ul>',
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
          title: '<span class="tour-emoji">📖</span> Our Mission & Story',
          description: '<p class="tour-highlight">Democratizing entertainment intelligence worldwide.</p><p>Discover how INPHRONE connects audiences with creators to build the future of content together.</p><ul class="tour-list"><li>🌍 Global reach</li><li>🤝 Creator partnerships</li><li>📈 Data-driven insights</li></ul>',
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
          title: '<span class="tour-emoji">📈</span> Your Personal Command Center',
          description: '<p class="tour-highlight">Everything you need in one place!</p><ul class="tour-list"><li>📝 Submit opinions across 8 categories</li><li>🏆 Track your level & XP progress</li><li>🎁 View earned rewards & coupons</li><li>📊 Personal analytics & insights</li><li>⏰ Weekly submission countdown</li></ul>',
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
          title: '<span class="tour-emoji">💡</span> Entertainment Intelligence Hub',
          description: '<p class="tour-highlight">Deep-dive into community trends!</p><p>Explore 8 entertainment categories:</p><ul class="tour-list"><li>🎬 Film & 📺 TV/OTT analytics</li><li>🎵 Music & 🎮 Gaming trends</li><li>▶️ YouTube & 📱 Social insights</li><li>💻 App Development data</li></ul><p class="tour-small">View demographics, sentiment, and regional trends!</p>',
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
          title: '<span class="tour-emoji">⚡</span> InphroSync Daily Pulse',
          description: '<p class="tour-highlight">Your daily entertainment check-in!</p><ul class="tour-list"><li>❓ Quick, fun daily questions</li><li>🔥 Build participation streaks</li><li>🏅 Unlock exclusive streak badges</li><li>📊 Compare with global community</li></ul><p class="tour-small">Don\'t break your streak!</p>',
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
          title: '<span class="tour-emoji">🎯</span> YourTurn Community Arena',
          description: '<p class="tour-highlight">Win the spotlight and ask your question!</p><ul class="tour-list"><li>⏰ 3 daily slots: 9 AM, 2 PM, 7 PM</li><li>⚡ 20-second countdown - fastest wins!</li><li>📊 Watch real-time votes roll in</li><li>🏆 See how many competed for your slot</li></ul>',
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
          title: '<span class="tour-emoji">🎁</span> Exclusive Reward Coupons',
          description: '<p class="tour-highlight">Your contributions earn real rewards!</p><ul class="tour-list"><li>💰 Discount coupons from top brands</li><li>📋 One-click copy coupon codes</li><li>⏳ Track expiry dates</li><li>🛒 Save on your purchases</li></ul>',
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
          title: '<span class="tour-emoji">👤</span> Your INPHRONE Identity',
          description: '<p class="tour-highlight">Showcase your entertainment expertise!</p><ul class="tour-list"><li>🏆 View all earned badges</li><li>📈 Complete activity history</li><li>⭐ Level & XP progression</li><li>🔗 Share profile with friends</li></ul>',
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
          title: '<span class="tour-emoji">🎊</span> You\'re All Set!',
          description: '<p class="tour-highlight">You\'ve explored all major features!</p><p>Start your INPHRONE journey now:</p><ul class="tour-list"><li>✨ Share your first opinion</li><li>⚡ Complete today\'s InphroSync</li><li>🎯 Try winning a YourTurn slot</li><li>🏆 Earn your first badge</li></ul><p class="tour-small">Restart this tour anytime from Settings!</p>',
          side: 'over',
          align: 'center',
        },
      },
    ],
  },
];

export function useSpotlightTour() {
  const driverRef = useRef<Driver | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showQuickTour, setShowQuickTour] = useState(false);
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

  const skipFullTour = useCallback(() => {
    if (driverRef.current) {
      try {
        driverRef.current.destroy();
      } catch (e) {
        // Ignore cleanup errors
      }
    }
    isNavigatingRef.current = false;
    markTourCompleted();
  }, [markTourCompleted]);

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
        nextBtnText: isLastPhase ? 'Complete →' : 'Next →',
        prevBtnText: '← Previous',
        doneBtnText: isLastPhase ? '✨ Finish' : 'Continue →',
        progressText: `${phaseIndex + 1} / ${phases.length}`,
        allowClose: true,
        overlayColor: 'rgba(0, 0, 0, 0.65)',
        stagePadding: 16,
        stageRadius: 20,
        animate: true,
        smoothScroll: true,
        allowKeyboardControl: true,
        popoverClass: 'inphrone-premium-tour',
        onHighlightStarted: (el) => {
          if (el) {
            (el as HTMLElement).scrollIntoView?.({ behavior: 'smooth', block: 'center' });
          }
        },
        onCloseClick: () => {
          skipFullTour();
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
  }, [markTourCompleted, skipFullTour]);

  const startQuickTour = useCallback(() => {
    if (!isAuthenticated) {
      console.log('Tour not available for unauthenticated users');
      return;
    }
    
    tourTypeRef.current = 'quick';
    setShowQuickTour(true);
  }, [isAuthenticated]);

  const closeQuickTour = useCallback(() => {
    setShowQuickTour(false);
    markTourCompleted();
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
      startQuickTour();
    }
  }, [isAuthenticated, runFullTourPhase, startQuickTour]);

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
    startQuickTourManual: startQuickTour,
    shouldShowTour,
    showQuickTour,
    closeQuickTour,
  };
}

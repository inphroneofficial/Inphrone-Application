import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "next-themes";
import { 
  Home, 
  Info, 
  BarChart3, 
  Zap, 
  LayoutDashboard, 
  X, 
  Menu,
  Sun,
  Moon,
  Settings,
  Trophy
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "./SettingsDialog";

interface MenuItem {
  label: string;
  path: string;
  icon: React.ElementType;
}

export function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { t } = useLanguage();

  const menuItems: MenuItem[] = [
    { label: t('home'), path: "/", icon: Home },
    { label: t('about'), path: "/about", icon: Info },
    { label: t('insights'), path: "/insights", icon: BarChart3 },
    { label: t('inphrosync'), path: "/inphrosync", icon: Zap },
    { label: t('yourTurn'), path: "/yourturn", icon: Trophy },
    { label: t('dashboard'), path: "/dashboard", icon: LayoutDashboard },
    { label: t('settings'), path: "/settings", icon: Settings },
  ];
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Lock body scroll when menu is open and notify chatbot
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Notify chatbot to hide
      window.dispatchEvent(new CustomEvent('mobile-menu-toggle', { detail: { isOpen: true } }));
    } else {
      document.body.style.overflow = '';
      // Notify chatbot it can show again
      window.dispatchEvent(new CustomEvent('mobile-menu-toggle', { detail: { isOpen: false } }));
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleNavigate = (path: string) => {
    const protectedPaths = ["/dashboard", "/insights", "/inphrosync", "/yourturn"];
    
    // Settings should open dialog, not navigate
    if (path === "/settings") {
      setIsOpen(false);
      // Dispatch event to open settings dialog
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('open-settings-dialog'));
      }, 100);
      return;
    }
    
    if (!isAuthenticated && protectedPaths.includes(path)) {
      navigate("/auth");
    } else {
      navigate(path);
    }
    setIsOpen(false);
  };

  const isActive = (path: string) => location.pathname === path;
  const isDark = resolvedTheme === 'dark';

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.05, delayChildren: 0.1 }
    },
    exit: { 
      opacity: 0,
      transition: { staggerChildren: 0.02, staggerDirection: -1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 }
  };

  return (
    <>
      {/* Hamburger Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className="md:hidden p-2 rounded-lg hover:bg-muted/50 transition-colors"
        whileTap={{ scale: 0.95 }}
        aria-label="Open menu"
      >
        <Menu className="w-6 h-6" />
      </motion.button>

      {/* Fullscreen Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 md:hidden"
          >
            {/* Full Screen Background - Less transparent */}
            <motion.div
              className="absolute inset-0 bg-background/95 backdrop-blur-xl"
              onClick={() => setIsOpen(false)}
            />

            {/* Menu Content - Full screen coverage */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="relative flex flex-col items-center justify-center min-h-screen w-full px-4"
            >
              {/* Full screen solid container */}
              <div className="absolute inset-0 bg-background border-0 shadow-2xl" />
              {/* Close Button */}
              <motion.button
                onClick={() => setIsOpen(false)}
                className="absolute top-6 right-6 p-2 rounded-full bg-muted/50 hover:bg-muted transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                aria-label="Close menu"
              >
                <X className="w-6 h-6" />
              </motion.button>

              {/* Menu Grid */}
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="grid grid-cols-2 gap-3 w-full max-w-[300px] px-2"
              >
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);
                  
                  return (
                    <motion.button
                      key={item.path}
                      variants={itemVariants}
                      onClick={() => handleNavigate(item.path)}
                      className={`relative flex items-center gap-2 p-3 rounded-xl transition-all duration-200 overflow-hidden ${
                        active 
                          ? 'bg-primary/15 text-primary' 
                          : 'bg-muted/30 hover:bg-muted/50 text-foreground'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className={`p-2 rounded-lg shrink-0 ${
                        active ? 'bg-primary/20' : 'bg-muted/50'
                      }`}>
                        <Icon className={`w-4 h-4 ${active ? 'text-primary' : ''}`} />
                      </div>
                      <span className={`text-xs font-medium truncate ${active ? 'text-primary' : ''}`}>
                        {item.label}
                      </span>
                      {active && (
                        <motion.span
                          layoutId="activeIndicator"
                          className="absolute right-2 w-1.5 h-1.5 rounded-full bg-primary shadow-lg shadow-primary/50"
                        />
                      )}
                    </motion.button>
                  );
                })}
              </motion.div>

              {/* Theme Toggle */}
              <motion.div
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                className="mt-8"
              >
                <motion.button
                  onClick={() => setTheme(isDark ? 'light' : 'dark')}
                  className="relative flex items-center gap-2 px-4 py-2 rounded-full bg-muted/30 border border-border/50"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="relative w-12 h-6 rounded-full bg-muted/50 overflow-hidden">
                    <motion.div
                      className="absolute top-0.5 w-5 h-5 rounded-full bg-primary flex items-center justify-center shadow-md"
                      animate={{ left: isDark ? 'calc(100% - 22px)' : '2px' }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    >
                      <AnimatePresence mode="wait">
                        {isDark ? (
                          <motion.div
                            key="moon"
                            initial={{ rotate: -90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: 90, opacity: 0 }}
                            transition={{ duration: 0.15 }}
                          >
                            <Moon className="w-3 h-3 text-primary-foreground" />
                          </motion.div>
                        ) : (
                          <motion.div
                            key="sun"
                            initial={{ rotate: 90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: -90, opacity: 0 }}
                            transition={{ duration: 0.15 }}
                          >
                            <Sun className="w-3 h-3 text-primary-foreground" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {isDark ? 'Dark' : 'Light'}
                  </span>
                </motion.button>
              </motion.div>

              {/* Get Started Button (if not authenticated) */}
              {!isAuthenticated && (
                <motion.button
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  onClick={() => {
                    navigate("/auth");
                    setIsOpen(false);
                  }}
                  className="mt-6 px-8 py-3 rounded-xl gradient-primary text-white font-semibold shadow-lg shadow-primary/30"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {t('getStarted')}
                </motion.button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
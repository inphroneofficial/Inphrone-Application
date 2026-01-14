import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { Globe, BarChart3, ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { ThemeToggle } from "./ThemeToggle";
import { NotificationBell } from "./NotificationBell";
import { SettingsDialog, useLanguage } from "./SettingsDialog";
import { MobileMenu } from "./MobileMenu";
import { supabase } from "@/integrations/supabase/client";
import { useNavigationHandler } from "@/hooks/useNavigationHandler";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { goBack, goHome } = useNavigationHandler();
  const { t } = useLanguage();
  
  // Determine if we should show back button (not on landing or dashboard)
  const showBackButton = !["/", "/dashboard"].includes(location.pathname);

  useEffect(() => {
    // Check initial auth state
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const isActive = (path: string) => location.pathname === path;


  const go = (path: string) => {
    const protectedPaths = ["/dashboard", "/insights", "/coupon-analytics", "/coupon-wishlist", "/inphrosync", "/yourturn"];
    if (!isAuthenticated && protectedPaths.includes(path)) {
      navigate("/auth");
      return;
    }
    navigate(path);
  };

  const navItems = [
    { label: t('home'), path: "/" },
    { label: t('about'), path: "/about" },
    { label: t('insights'), path: "/insights", icon: BarChart3 },
    { label: t('inphrosync'), path: "/inphrosync" },
    { label: t('yourTurn'), path: "/yourturn" },
    { label: t('dashboard'), path: "/dashboard" }
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 w-full border-b border-border/50 bg-background/95 dark:bg-black/90 backdrop-blur-xl shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Mobile Navigation Controls + Logo */}
          <div className="flex items-center gap-2">
            {/* Back Button (Mobile & Desktop) */}
            {showBackButton && (
              <Button
                variant="ghost"
                size="icon"
                onClick={goBack}
                className="shrink-0 text-foreground hover:text-foreground hover:bg-muted"
                aria-label="Go back"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
            )}
            
            {/* Logo - clicking always goes to home page */}
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 group transition-all duration-300 hover:scale-105 cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                <Globe className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-foreground drop-shadow-lg">
                INPHRONE<sup className="text-[10px] font-normal ml-0.5 align-super">™</sup>
              </span>
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
          {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.path}
                  variant={isActive(item.path) ? "default" : "ghost"}
                  onClick={() => go(item.path)}
                  className={`transition-all duration-300 ${
                    isActive(item.path) 
                      ? "" 
                      : "text-foreground/80 hover:text-foreground hover:bg-muted"
                  }`}
                >
                  {Icon && <Icon className="w-4 h-4 mr-2" />}
                  {item.label}
                </Button>
              );
            })}
            {isAuthenticated && (
              <>
                <NotificationBell />
                <SettingsDialog />
              </>
            )}
            <ThemeToggle />
            {!isAuthenticated && (
              <Button
                onClick={() => navigate("/auth")}
                className="bg-white text-gray-900 hover:bg-white/90 border-0 shadow-elegant hover:shadow-xl transition-all duration-300"
              >
                {t('getStarted')}
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            {isAuthenticated && <NotificationBell />}
            <MobileMenu />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

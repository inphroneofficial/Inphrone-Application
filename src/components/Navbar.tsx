import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { Globe, BarChart3, ArrowLeft, Flame, ChevronDown, Home, Info, LayoutDashboard, Zap, Clock, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { ThemeToggle } from "./ThemeToggle";
import { NotificationBell } from "./NotificationBell";
import { SettingsDialog, useLanguage } from "./SettingsDialog";
import { MobileMenu } from "./MobileMenu";
import { supabase } from "@/integrations/supabase/client";
import { useNavigationHandler } from "@/hooks/useNavigationHandler";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

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
    const protectedPaths = ["/dashboard", "/insights", "/coupon-analytics", "/coupon-wishlist", "/inphrosync", "/yourturn", "/hype"];
    if (!isAuthenticated && protectedPaths.includes(path)) {
      navigate("/auth");
      return;
    }
    navigate(path);
  };

  // Grouped navigation items for cleaner UI
  const engageItems = [
    { label: t('inphrosync'), path: "/inphrosync", icon: Zap, description: "Daily pulse questions" },
    { label: t('yourTurn'), path: "/yourturn", icon: Clock, description: "Compete for spotlight" },
    { label: "Hype It", path: "/hype", icon: Flame, description: "Signal what you want" },
  ];

  const isEngageActive = engageItems.some(item => isActive(item.path));

  return (
    <nav id="main-navigation" className="fixed top-0 left-0 right-0 z-50 w-full border-b border-border/50 bg-background/95 dark:bg-black/90 backdrop-blur-xl shadow-sm">
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

          {/* Desktop Navigation - Cleaner Grouped Layout */}
          <div className="hidden md:flex items-center gap-2">
            {/* Primary Nav Items */}
            <Button
              variant={isActive("/") ? "default" : "ghost"}
              size="sm"
              onClick={() => go("/")}
              className={cn(
                "transition-all duration-300",
                isActive("/") ? "" : "text-foreground/80 hover:text-foreground hover:bg-muted"
              )}
            >
              <Home className="w-4 h-4 mr-1.5" />
              {t('home')}
            </Button>

            <Button
              variant={isActive("/about") ? "default" : "ghost"}
              size="sm"
              onClick={() => go("/about")}
              className={cn(
                "transition-all duration-300",
                isActive("/about") ? "" : "text-foreground/80 hover:text-foreground hover:bg-muted"
              )}
            >
              <Info className="w-4 h-4 mr-1.5" />
              {t('about')}
            </Button>

            <Button
              variant={isActive("/insights") ? "default" : "ghost"}
              size="sm"
              onClick={() => go("/insights")}
              className={cn(
                "transition-all duration-300",
                isActive("/insights") ? "" : "text-foreground/80 hover:text-foreground hover:bg-muted"
              )}
            >
              <BarChart3 className="w-4 h-4 mr-1.5" />
              {t('insights')}
            </Button>

            {/* Engage Dropdown - Groups InphroSync, YourTurn, HypeIt */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant={isEngageActive ? "default" : "ghost"}
                  size="sm"
                  className={cn(
                    "transition-all duration-300 gap-1",
                    isEngageActive ? "" : "text-foreground/80 hover:text-foreground hover:bg-muted"
                  )}
                >
                  <Sparkles className="w-4 h-4" />
                  Engage
                  <ChevronDown className="w-3 h-3 ml-0.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-56">
                <DropdownMenuLabel className="text-xs text-muted-foreground">
                  Interactive Features
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {engageItems.map((item) => (
                  <DropdownMenuItem
                    key={item.path}
                    onClick={() => go(item.path)}
                    className={cn(
                      "cursor-pointer flex items-start gap-3 py-2.5",
                      isActive(item.path) && "bg-primary/10"
                    )}
                  >
                    <item.icon className={cn(
                      "w-4 h-4 mt-0.5",
                      item.path === "/hype" && "text-orange-500"
                    )} />
                    <div className="flex flex-col">
                      <span className="font-medium">{item.label}</span>
                      <span className="text-xs text-muted-foreground">{item.description}</span>
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant={isActive("/dashboard") ? "default" : "ghost"}
              size="sm"
              onClick={() => go("/dashboard")}
              className={cn(
                "transition-all duration-300",
                isActive("/dashboard") ? "" : "text-foreground/80 hover:text-foreground hover:bg-muted"
              )}
            >
              <LayoutDashboard className="w-4 h-4 mr-1.5" />
              {t('dashboard')}
            </Button>

            {/* Divider */}
            <div className="h-6 w-px bg-border/50 mx-1" />

            {/* Utility Items - Only show settings for authenticated users */}
            {isAuthenticated && (
              <>
                <NotificationBell />
                <div id="settings-button">
                  <SettingsDialog />
                </div>
              </>
            )}
            <div id="theme-toggle">
              <ThemeToggle />
            </div>
            {!isAuthenticated && (
              <Button
                id="primary-cta-button"
                onClick={() => navigate("/auth")}
                size="sm"
                className="bg-white text-gray-900 hover:bg-white/90 border-0 shadow-elegant hover:shadow-xl transition-all duration-300 ml-1"
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

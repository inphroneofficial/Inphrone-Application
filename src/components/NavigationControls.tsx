import { Button } from "@/components/ui/button";
import { ArrowLeft, Home } from "lucide-react";
import { useNavigationHandler } from "@/hooks/useNavigationHandler";
import { useLocation } from "react-router-dom";

interface NavigationControlsProps {
  showHome?: boolean;
  showBack?: boolean;
  className?: string;
}

/**
 * Reusable navigation controls for mobile and desktop
 * Provides back and home buttons with proper keyboard and mobile support
 */
export const NavigationControls = ({ 
  showHome = true, 
  showBack = true,
  className = ""
}: NavigationControlsProps) => {
  const { goBack, goHome } = useNavigationHandler();
  const location = useLocation();
  
  // Don't show controls on landing or dashboard
  const isLanding = location.pathname === "/";
  const isDashboard = location.pathname === "/dashboard";
  
  if (isLanding) return null;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {showBack && !isLanding && (
        <Button
          variant="ghost"
          size="icon"
          onClick={goBack}
          aria-label="Go back"
          className="shrink-0"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
      )}
      
      {showHome && !isDashboard && (
        <Button
          variant="ghost"
          size="icon"
          onClick={goHome}
          aria-label="Go to dashboard"
          className="shrink-0"
        >
          <Home className="w-5 h-5" />
        </Button>
      )}
    </div>
  );
};

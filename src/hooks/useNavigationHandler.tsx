import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

/**
 * Hook to handle browser navigation events (back button, etc.)
 * Ensures proper navigation behavior on both desktop and mobile
 */
export const useNavigationHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Handle popstate (browser back/forward buttons)
    const handlePopState = () => {
      // React Router already handles this, but we can add custom logic if needed
      console.log("Navigation detected:", location.pathname);
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [location]);

  const goBack = () => {
    // Check if there's history to go back to
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      // Fallback to dashboard if no history
      navigate("/dashboard");
    }
  };

  const goHome = () => {
    navigate("/dashboard");
  };

  return {
    goBack,
    goHome,
  };
};

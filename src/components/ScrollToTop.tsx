import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;
      
      // Show button when user is at least 500px from top and near bottom (within 200px of bottom)
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 200;
      const hasScrolled = scrollTop > 500;
      
      setIsVisible(hasScrolled && isNearBottom);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.2 }}
          onClick={scrollToTop}
          className="fixed bottom-6 left-6 z-[99999] h-12 w-12 rounded-full bg-primary text-primary-foreground shadow-xl hover:bg-primary/90 flex items-center justify-center border-2 border-primary-foreground/20"
          style={{ 
            isolation: 'isolate',
            transform: 'translateZ(0)',
            willChange: 'transform, opacity'
          }}
          aria-label="Scroll to top"
        >
          <ArrowUp className="h-6 w-6" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

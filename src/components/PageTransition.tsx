import { motion, Variants, AnimatePresence } from "framer-motion";
import { ReactNode } from "react";

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

// Ultra-premium page transition with silk-smooth motion
const pageVariants: Variants = {
  initial: {
    opacity: 0,
    y: 24,
    scale: 0.985,
    filter: "blur(6px)",
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: {
      duration: 0.55,
      ease: [0.16, 1, 0.3, 1], // Custom easeOutExpo for luxury feel
      staggerChildren: 0.08,
    },
  },
  exit: {
    opacity: 0,
    y: -16,
    scale: 0.99,
    filter: "blur(3px)",
    transition: {
      duration: 0.35,
      ease: [0.4, 0, 1, 1], // easeIn for quick exit
    },
  },
};

// Slide from right for secondary pages - Glass-like smoothness
export const slideRightVariants: Variants = {
  initial: {
    opacity: 0,
    x: 50,
    scale: 0.99,
    filter: "blur(4px)",
  },
  animate: {
    opacity: 1,
    x: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1],
    },
  },
  exit: {
    opacity: 0,
    x: -25,
    scale: 0.99,
    filter: "blur(2px)",
    transition: {
      duration: 0.28,
      ease: [0.4, 0, 1, 1],
    },
  },
};

// Fade with elegant scale for modals/overlays
export const modalVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 0.94,
    y: 16,
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.38,
      ease: [0.16, 1, 0.3, 1],
    },
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    y: 8,
    transition: {
      duration: 0.22,
      ease: [0.4, 0, 1, 1],
    },
  },
};

export function PageTransition({ children, className = "" }: PageTransitionProps) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      className={className}
      style={{ willChange: "opacity, transform, filter" }}
    >
      {children}
    </motion.div>
  );
}

// Staggered children animation for lists - Silky smooth cascade
export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
};

export const staggerItem: Variants = {
  initial: { 
    opacity: 0, 
    y: 20,
    scale: 0.97,
  },
  animate: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: {
      duration: 0.45,
      ease: [0.16, 1, 0.3, 1],
    }
  },
};

// Fade in animation with subtle blur - Premium feel
export const fadeIn: Variants = {
  initial: { 
    opacity: 0,
    filter: "blur(3px)",
  },
  animate: { 
    opacity: 1,
    filter: "blur(0px)",
    transition: { 
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1],
    }
  },
};

// Slide up animation - Elevated and smooth
export const slideUp: Variants = {
  initial: { 
    opacity: 0, 
    y: 32,
    filter: "blur(3px)",
  },
  animate: { 
    opacity: 1, 
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1],
    }
  },
};

// Scale in animation with spring - Bouncy luxury
export const scaleIn: Variants = {
  initial: { 
    opacity: 0, 
    scale: 0.88,
    filter: "blur(6px)",
  },
  animate: { 
    opacity: 1, 
    scale: 1,
    filter: "blur(0px)",
    transition: {
      type: "spring",
      stiffness: 180,
      damping: 22,
    }
  },
};

// Reveal from left - Sleek horizontal entrance
export const revealLeft: Variants = {
  initial: {
    opacity: 0,
    x: -40,
    rotateY: -6,
  },
  animate: {
    opacity: 1,
    x: 0,
    rotateY: 0,
    transition: {
      duration: 0.55,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

// Reveal from right - Mirror sleek entrance
export const revealRight: Variants = {
  initial: {
    opacity: 0,
    x: 40,
    rotateY: 6,
  },
  animate: {
    opacity: 1,
    x: 0,
    rotateY: 0,
    transition: {
      duration: 0.55,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

// Float animation for cards - Weightless elegance
export const floatUp: Variants = {
  initial: {
    opacity: 0,
    y: 48,
    scale: 0.92,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 120,
      damping: 18,
    },
  },
};

// Cascade animation for grid items - Waterfall effect
export const cascadeItem: Variants = {
  initial: {
    opacity: 0,
    y: 24,
    scale: 0.96,
    filter: "blur(3px)",
  },
  animate: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: {
      delay: i * 0.08,
      duration: 0.45,
      ease: [0.16, 1, 0.3, 1],
    },
  }),
};

// Section transition wrapper - For in-page sections
interface SectionTransitionProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function SectionTransition({ children, className = "", delay = 0 }: SectionTransitionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, filter: "blur(3px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{
        duration: 0.55,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={className}
      style={{ willChange: "opacity, transform, filter" }}
    >
      {children}
    </motion.div>
  );
}

// Card hover animation - Subtle lift with glow
export const cardHoverVariants: Variants = {
  initial: {
    y: 0,
    scale: 1,
    boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)",
  },
  hover: {
    y: -4,
    scale: 1.01,
    boxShadow: "0 12px 32px rgba(0, 0, 0, 0.12)",
    transition: {
      duration: 0.3,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

// Button press animation - Satisfying tactile feel
export const buttonPressVariants: Variants = {
  initial: {
    scale: 1,
  },
  tap: {
    scale: 0.97,
    transition: {
      duration: 0.1,
      ease: "easeOut",
    },
  },
  hover: {
    scale: 1.02,
    transition: {
      duration: 0.2,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

// Smooth fade transition for content swaps
export const contentSwapVariants: Variants = {
  initial: {
    opacity: 0,
    y: 10,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.35,
      ease: [0.16, 1, 0.3, 1],
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 1, 1],
    },
  },
};

// Skeleton loading pulse - Subtle breathing
export const skeletonPulse: Variants = {
  initial: {
    opacity: 0.5,
  },
  animate: {
    opacity: 1,
    transition: {
      repeat: Infinity,
      repeatType: "reverse",
      duration: 1.2,
      ease: "easeInOut",
    },
  },
};

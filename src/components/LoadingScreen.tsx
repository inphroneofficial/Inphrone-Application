"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";

/**
 * INPHRONE Ultra-Premium Loading Screen
 * Million-dollar cinematic experience
 * Supports both light and dark mode
 */

const LoadingScreen = ({ 
  onComplete = () => {}, 
  duration = 4500 
}: { 
  onComplete?: () => void; 
  duration?: number;
}) => {
  const [phase, setPhase] = useState(0);
  const [isExiting, setIsExiting] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  // Particle animation on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: { x: number; y: number; vx: number; vy: number; size: number; alpha: number; targetX: number; targetY: number }[] = [];
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2 - 50;

    // Create particles
    for (let i = 0; i < 100; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = 300 + Math.random() * 400;
      particles.push({
        x: centerX + Math.cos(angle) * distance,
        y: centerY + Math.sin(angle) * distance,
        vx: 0,
        vy: 0,
        size: Math.random() * 2 + 0.5,
        alpha: Math.random() * 0.5 + 0.3,
        targetX: centerX + (Math.random() - 0.5) * 60,
        targetY: centerY + (Math.random() - 0.5) * 60,
      });
    }

    let animationId: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach((p) => {
        const dx = p.targetX - p.x;
        const dy = p.targetY - p.y;
        p.vx += dx * 0.008;
        p.vy += dy * 0.008;
        p.vx *= 0.96;
        p.vy *= 0.96;
        p.x += p.vx;
        p.y += p.vy;

        // Use different colors for light vs dark mode
        const particleColor = isDark 
          ? `rgba(53, 87, 125, ${p.alpha})`
          : `rgba(107, 30, 35, ${p.alpha})`; // Crimson for light mode

        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3);
        gradient.addColorStop(0, particleColor);
        gradient.addColorStop(1, isDark ? 'rgba(53, 87, 125, 0)' : 'rgba(107, 30, 35, 0)');
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      });

      animationId = requestAnimationFrame(animate);
    };
    animate();

    return () => cancelAnimationFrame(animationId);
  }, [isDark]);

  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];
    
    timers.push(setTimeout(() => setPhase(1), 400));  // Globe appears
    timers.push(setTimeout(() => setPhase(2), 1200)); // Globe starts rotating faster
    timers.push(setTimeout(() => setPhase(3), 2000)); // Title appears
    timers.push(setTimeout(() => setPhase(4), 3200)); // Tagline appears
    timers.push(setTimeout(() => {
      setPhase(5);
      setIsExiting(true);
    }, duration - 500));
    timers.push(setTimeout(() => {
      onComplete();
      window.scrollTo(0, 0); // Scroll to top after loading
    }, duration));

    return () => timers.forEach(clearTimeout);
  }, [duration, onComplete]);

  return (
    <AnimatePresence mode="wait">
      {!isExiting && (
        <motion.div
          className="fixed inset-0 z-[99999] flex flex-col items-center justify-center overflow-hidden"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          style={{
            background: isDark 
              ? "linear-gradient(180deg, #0a0d14 0%, #141E30 50%, #0d1117 100%)"
              : "linear-gradient(180deg, #fafafa 0%, #f0f0f0 50%, #e8e8e8 100%)",
          }}
        >
          {/* Particle canvas */}
          <canvas
            ref={canvasRef}
            className="absolute inset-0 pointer-events-none"
            style={{ opacity: phase >= 1 ? 0.6 : 0 }}
          />

          {/* Ambient glow */}
          <motion.div
            className="absolute w-[500px] h-[500px] rounded-full"
            style={{
              background: isDark
                ? "radial-gradient(circle, rgba(53, 87, 125, 0.15) 0%, transparent 60%)"
                : "radial-gradient(circle, rgba(107, 30, 35, 0.12) 0%, transparent 60%)",
              left: "50%",
              top: "40%",
              transform: "translate(-50%, -50%)",
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Main content */}
          <div className="relative z-10 flex flex-col items-center">
            {/* Globe */}
            <motion.div
              className="relative"
              initial={{ scale: 0, opacity: 0, y: 0 }}
              animate={
                phase >= 3 
                  ? { scale: 0.6, opacity: 1, y: -20, x: 0 } 
                  : phase >= 1 
                    ? { scale: 1, opacity: 1, y: 0 } 
                    : { scale: 0, opacity: 0 }
              }
              transition={{ 
                duration: 0.8, 
                ease: [0.22, 1, 0.36, 1],
                scale: { duration: phase >= 3 ? 1 : 0.8 }
              }}
            >
              {/* Outer energy ring */}
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                  width: 160,
                  height: 160,
                  margin: "-30px",
                  border: isDark ? "1px solid rgba(53, 87, 125, 0.3)" : "1px solid rgba(107, 30, 35, 0.25)",
                }}
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              />
              
              {/* Second ring */}
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                  width: 140,
                  height: 140,
                  margin: "-20px",
                  border: isDark ? "1px solid rgba(53, 87, 125, 0.2)" : "1px solid rgba(107, 30, 35, 0.15)",
                }}
                animate={{ rotate: -360 }}
                transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
              />

              {/* Core globe */}
              <motion.div
                className="relative w-[100px] h-[100px] rounded-full overflow-hidden"
                style={{
                  background: isDark 
                    ? "linear-gradient(135deg, #1a2a3a 0%, #35577D 40%, #1e3a5f 100%)"
                    : "linear-gradient(135deg, #2C0F12 0%, #6B1E23 40%, #4a1419 100%)",
                  boxShadow: isDark
                    ? "0 0 60px rgba(53, 87, 125, 0.4), inset -8px -8px 30px rgba(0,0,0,0.4), inset 8px 8px 30px rgba(255,255,255,0.05)"
                    : "0 0 60px rgba(107, 30, 35, 0.3), inset -8px -8px 30px rgba(0,0,0,0.3), inset 8px 8px 30px rgba(255,255,255,0.1)",
                }}
                animate={{ 
                  rotate: phase >= 2 ? 360 : 0,
                }}
                transition={{ 
                  duration: phase >= 2 ? 3 : 20, 
                  repeat: Infinity, 
                  ease: "linear" 
                }}
              >
                {/* Globe meridian lines */}
                <svg className="absolute inset-0 w-full h-full opacity-40" viewBox="0 0 100 100">
                  {[20, 35, 50, 65, 80].map((y) => (
                    <ellipse
                      key={`lat-${y}`}
                      cx="50"
                      cy={y}
                      rx={Math.sin((y / 100) * Math.PI) * 45}
                      ry="4"
                      fill="none"
                      stroke={isDark ? "rgba(168, 200, 232, 0.4)" : "rgba(255, 255, 255, 0.5)"}
                      strokeWidth="0.5"
                    />
                  ))}
                  {[0, 45, 90, 135].map((angle) => (
                    <ellipse
                      key={`long-${angle}`}
                      cx="50"
                      cy="50"
                      rx="4"
                      ry="45"
                      fill="none"
                      stroke={isDark ? "rgba(168, 200, 232, 0.3)" : "rgba(255, 255, 255, 0.4)"}
                      strokeWidth="0.5"
                      transform={`rotate(${angle} 50 50)`}
                    />
                  ))}
                </svg>
                
                {/* Highlight reflection */}
                <div
                  className="absolute w-6 h-6 rounded-full"
                  style={{
                    background: "radial-gradient(circle, rgba(255,255,255,0.35) 0%, transparent 70%)",
                    top: "18%",
                    left: "22%",
                  }}
                />
              </motion.div>

              {/* Orbiting dot */}
              <motion.div
                className="absolute w-2 h-2 rounded-full"
                style={{
                  background: isDark ? "#a8c8e8" : "#6B1E23",
                  boxShadow: isDark ? "0 0 10px #a8c8e8" : "0 0 10px #6B1E23",
                  left: "50%",
                  top: "50%",
                  marginLeft: "-4px",
                  marginTop: "-4px",
                }}
                animate={{
                  x: [50, 0, -50, 0, 50],
                  y: [0, -50, 0, 50, 0],
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              />
            </motion.div>

            {/* INPHRONE Title */}
            <motion.div
              className="relative mt-8"
              initial={{ opacity: 0 }}
              animate={phase >= 3 ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1
                className="text-5xl md:text-7xl font-black tracking-[0.15em] flex items-center"
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                }}
              >
                {["I", "N", "P", "H", "R", "O", "N", "E"].map((letter, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
                    animate={
                      phase >= 3
                        ? { opacity: 1, y: 0, filter: "blur(0px)" }
                        : {}
                    }
                    transition={{
                      duration: 0.4,
                      delay: i * 0.06,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    style={{
                      background: letter === "O" 
                        ? "transparent" 
                        : isDark
                          ? "linear-gradient(180deg, #ffffff 0%, #a8c8e8 50%, #5a7a9a 100%)"
                          : "linear-gradient(180deg, #2C0F12 0%, #6B1E23 50%, #4a1419 100%)",
                      WebkitBackgroundClip: letter === "O" ? "unset" : "text",
                      backgroundClip: letter === "O" ? "unset" : "text",
                      color: letter === "O" ? "transparent" : "transparent",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: letter === "O" ? "0.8em" : "auto",
                    }}
                  >
                    {letter === "O" ? (
                      <motion.span
                        className="inline-block w-[0.7em] h-[0.7em] rounded-full"
                        style={{
                          background: isDark 
                            ? "linear-gradient(135deg, #1a2a3a 0%, #35577D 50%, #1e3a5f 100%)"
                            : "linear-gradient(135deg, #2C0F12 0%, #6B1E23 50%, #4a1419 100%)",
                          boxShadow: isDark
                            ? "0 0 20px rgba(53, 87, 125, 0.5), inset -2px -2px 8px rgba(0,0,0,0.3), inset 2px 2px 8px rgba(255,255,255,0.1)"
                            : "0 0 20px rgba(107, 30, 35, 0.4), inset -2px -2px 8px rgba(0,0,0,0.2), inset 2px 2px 8px rgba(255,255,255,0.15)",
                        }}
                        animate={{ rotate: 360 }}
                        transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                      />
                    ) : letter}
                  </motion.span>
                ))}
              </h1>

              {/* Subtle underline */}
              <motion.div
                className="mt-4 mx-auto h-[2px] rounded-full"
                style={{
                  background: isDark 
                    ? "linear-gradient(90deg, transparent, rgba(168, 200, 232, 0.6), transparent)"
                    : "linear-gradient(90deg, transparent, rgba(107, 30, 35, 0.5), transparent)",
                }}
                initial={{ width: 0, opacity: 0 }}
                animate={phase >= 3 ? { width: "100%", opacity: 1 } : {}}
                transition={{ duration: 0.8, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
              />
            </motion.div>

            {/* Tagline */}
            <motion.p
              className="mt-8 text-base md:text-lg font-medium tracking-[0.35em] uppercase"
              style={{
                color: isDark ? "rgba(168, 200, 232, 0.85)" : "rgba(44, 15, 18, 0.85)",
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={phase >= 4 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              People Powered Intelligence
            </motion.p>
          </div>

          {/* Minimal loading indicator */}
          <motion.div
            className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: phase >= 1 ? 1 : 0 }}
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: isDark ? "rgba(168, 200, 232, 0.6)" : "rgba(107, 30, 35, 0.5)" }}
                animate={{
                  opacity: [0.3, 1, 0.3],
                  scale: [0.8, 1.2, 0.8],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: "easeInOut",
                }}
              />
            ))}
          </motion.div>

          {/* Vignette */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: isDark 
                ? "radial-gradient(ellipse at center, transparent 30%, rgba(10, 13, 20, 0.7) 100%)"
                : "radial-gradient(ellipse at center, transparent 40%, rgba(245, 245, 245, 0.8) 100%)",
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoadingScreen;
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Github,
  Instagram,
  Linkedin,
  Mail,
  Globe,
  Twitter,
  X,
  Sparkles,
  Zap,
  Users,
  Brain,
  Lightbulb,
  Target,
} from "lucide-react";

export interface DeveloperModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeveloperModal({ open, onOpenChange }: DeveloperModalProps) {
  const [imageOpen, setImageOpen] = React.useState(false);

  const developerLinks = [
    { icon: <Instagram className="w-5 h-5" />, label: "Instagram", url: "https://www.instagram.com/g_thangella_k/#", color: "hover:text-pink-500" },
    { icon: <Github className="w-5 h-5" />, label: "GitHub", url: "https://github.com", color: "hover:text-foreground" },
    { icon: <Linkedin className="w-5 h-5" />, label: "LinkedIn", url: "https://www.linkedin.com/in/gthangella/", color: "hover:text-blue-600" },
    { icon: <Twitter className="w-5 h-5" />, label: "Twitter", url: "https://twitter.com/g_thangella", color: "hover:text-blue-400" },
    { icon: <Mail className="w-5 h-5" />, label: "Email", url: "mailto:thangella@inphrone.com", color: "hover:text-red-500" },
    { icon: <Globe className="w-5 h-5" />, label: "Portfolio", url: "https://thangella-creaftech-solutions.vercel.app/", color: "hover:text-green-500" },
  ];

  const features = [
    { icon: Users, label: "Audiences", desc: "Real opinions that matter" },
    { icon: Zap, label: "Creators", desc: "Authentic feedback loop" },
    { icon: Brain, label: "AI Insights", desc: "Cultural intelligence" },
    { icon: Target, label: "Studios", desc: "Data-driven decisions" },
  ];

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-hidden p-0 gap-0 bg-gradient-to-br from-background via-background to-muted/20 border-border/50">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            {/* Premium Header */}
            <DialogHeader className="p-6 pb-4 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/5 border-b border-border/50">
              <div className="flex items-center gap-3">
                <motion.div
                  initial={{ scale: 0.8, rotate: -10 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className="relative"
                >
                  <Sparkles className="w-8 h-8 text-primary" />
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 rounded-full bg-primary/20 blur-lg"
                  />
                </motion.div>
                <div>
                  <DialogTitle className="text-2xl font-bold">
                    🎬 Inphrone
                  </DialogTitle>
                  <DialogDescription className="text-sm">
                    People-Powered Entertainment Intelligence
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <ScrollArea className="h-[55vh] overflow-y-auto">
              <div className="px-6 py-4">
                <div className="grid lg:grid-cols-2 gap-8">
                {/* Left - Founder Card */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex flex-col items-center text-center"
                >
                  {/* Profile Image with Premium Effects */}
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    onClick={() => setImageOpen(true)}
                    className="group relative w-40 h-40 mb-6 rounded-2xl overflow-hidden cursor-pointer"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-transparent to-accent/30 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                      className="absolute -inset-1 bg-gradient-conic from-primary via-accent to-primary opacity-50 blur-sm"
                    />
                    <img
                      src="/GTK1.png"
                      alt="G.Thangella"
                      className="w-full h-full object-contain rounded-2xl relative z-[1] shadow-2xl"
                    />
                    <div className="absolute inset-0 rounded-2xl ring-2 ring-white/20 z-20" />
                  </motion.div>

                  <motion.h3
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-xl font-bold mb-1"
                  >
                    G.Thangella
                  </motion.h3>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="flex flex-wrap justify-center gap-2 mb-4"
                  >
                    <Badge variant="outline" className="text-xs">Founder</Badge>
                    <Badge variant="outline" className="text-xs">Product Thinker</Badge>
                    <Badge variant="outline" className="text-xs">System Designer</Badge>
                  </motion.div>

                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-sm text-muted-foreground mb-6 max-w-xs"
                  >
                    I build products at the intersection of human behavior, technology, and
                    design — with a deep focus on clarity, purpose, and long-term impact.
                  </motion.p>

                  {/* Social Links with Stagger Animation */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="flex flex-wrap justify-center gap-2"
                  >
                    {developerLinks.map((link, i) => (
                      <motion.a
                        key={link.label}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.6 + i * 0.1 }}
                        whileHover={{ scale: 1.1, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        className={`p-2.5 rounded-xl bg-muted/50 border border-border/50 text-muted-foreground transition-all duration-300 ${link.color}`}
                        title={link.label}
                      >
                        {link.icon}
                      </motion.a>
                    ))}
                  </motion.div>
                </motion.div>

                {/* Right - Product Story */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="space-y-5"
                >
                  {/* What is Inphrone */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-primary" />
                      <h4 className="font-semibold text-sm">What is Inphrone?</h4>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Inphrone is a people-powered entertainment intelligence platform.
                      It captures real audience behavior — what people actually watch, listen to,
                      and engage with — and turns it into clear, actionable insights.
                    </p>
                  </div>

                  <Separator className="opacity-50" />

                  {/* Why Inphrone Exists */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-accent" />
                      <h4 className="font-semibold text-sm">Why Inphrone Exists</h4>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      The entertainment industry often relies on delayed or biased data.
                      Inphrone closes this gap by giving audiences a direct voice and providing
                      creators with authentic, real-time cultural intelligence.
                    </p>
                  </div>

                  <Separator className="opacity-50" />

                  {/* The Meaning Behind the Name */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Brain className="w-4 h-4 text-primary" />
                      <h4 className="font-semibold text-sm">The Name</h4>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      <strong className="text-foreground">IN</strong> = Insights.{" "}
                      <strong className="text-foreground">PHRONE</strong> = Phronesis (Greek for practical wisdom).
                      Together: human-driven intelligence guided by real behavior.
                    </p>
                  </div>

                  <Separator className="opacity-50" />

                  {/* Who It's For - Feature Grid */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm">Who It's For</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {features.map((feature, i) => (
                        <motion.div
                          key={feature.label}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.5 + i * 0.1 }}
                          className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/30 border border-border/30"
                        >
                          <feature.icon className="w-4 h-4 text-primary" />
                          <div>
                            <p className="text-xs font-medium">{feature.label}</p>
                            <p className="text-[10px] text-muted-foreground">{feature.desc}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </div>
              </div>
            </ScrollArea>

            <Separator />

            {/* Footer */}
            <DialogFooter className="p-4 bg-muted/20">
              <div className="flex w-full justify-between items-center">
                <p className="text-xs text-muted-foreground">
                  © 2026 Inphrone™ • All Rights Reserved
                </p>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
                    Close
                  </Button>
                  <Button size="sm" asChild className="bg-gradient-to-r from-primary to-accent hover:opacity-90">
                    <a href="mailto:thangella@inphrone.com" target="_blank" rel="noopener noreferrer">
                      Contact Founder
                    </a>
                  </Button>
                </div>
              </div>
            </DialogFooter>
          </motion.div>
        </DialogContent>
      </Dialog>

      {/* Full Image Preview */}
      <AnimatePresence>
        {imageOpen && (
          <Dialog open={imageOpen} onOpenChange={setImageOpen}>
            <DialogContent className="max-w-2xl p-2 bg-black/95 border-none">
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={() => setImageOpen(false)}
                className="absolute right-4 top-4 z-10 rounded-full bg-black/70 p-2 text-white hover:bg-black transition-colors"
                aria-label="Close image"
              >
                <X className="w-5 h-5" />
              </motion.button>
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: "spring", damping: 25 }}
                className="flex items-center justify-center p-4"
              >
                <img
                  src="/GTK1.png"
                  alt="G. Thangella - Founder of Inphrone"
                  className="max-h-[70vh] w-auto rounded-xl shadow-2xl"
                />
              </motion.div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </>
  );
}

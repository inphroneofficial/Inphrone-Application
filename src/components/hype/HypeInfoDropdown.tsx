import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Rocket, Flame, Users, Clock, Trophy, Zap, Info, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

interface HypeInfoDropdownProps {
  className?: string;
  compact?: boolean;
}

export function HypeInfoDropdown({ className, compact = false }: HypeInfoDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  const steps = [
    {
      icon: Rocket,
      title: "Launch a Signal",
      description: "Describe what you want in 2-3 words. Simple, clear, powerful.",
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
    {
      icon: Flame,
      title: "Hype or Pass",
      description: "Vote on signals you love. Skip what doesn't excite you.",
      color: "text-red-500",
      bgColor: "bg-red-500/10",
    },
    {
      icon: Trophy,
      title: "Shape the Future",
      description: "Top signals inform real decisions by studios and creators.",
      color: "text-pink-500",
      bgColor: "bg-pink-500/10",
    },
  ];

  const rules = [
    { icon: Clock, text: "Signals expire after 7 days", color: "text-blue-500" },
    { icon: Users, text: "Max 3 signals per day", color: "text-green-500" },
    { icon: Zap, text: "+5 points per signal, +1 per vote", color: "text-yellow-500" },
    { icon: Trophy, text: "Score = Hype votes - Pass votes", color: "text-purple-500" },
  ];

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className={cn("w-full", className)}>
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "w-full flex items-center justify-between gap-2 px-4 py-3",
            "rounded-xl border border-border/50 bg-card/50 hover:bg-muted/50",
            "transition-all duration-300",
            compact && "py-2 text-sm"
          )}
        >
          <div className="flex items-center gap-2">
            <HelpCircle className={cn("text-muted-foreground", compact ? "w-4 h-4" : "w-5 h-5")} />
            <span className="font-medium">How Hype It Works</span>
            <Badge variant="secondary" className="text-xs">
              {isOpen ? "Hide" : "Learn"}
            </Badge>
          </div>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-5 h-5 text-muted-foreground" />
          </motion.div>
        </Button>
      </CollapsibleTrigger>
      
      <AnimatePresence>
        {isOpen && (
          <CollapsibleContent forceMount>
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="pt-4 space-y-4">
                {/* How It Works Steps */}
                <div className="grid md:grid-cols-3 gap-3">
                  {steps.map((step, index) => (
                    <motion.div
                      key={step.title}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 rounded-xl bg-card border border-border/50 hover:border-primary/30 transition-colors"
                    >
                      <div className={cn("w-10 h-10 rounded-full flex items-center justify-center mb-3", step.bgColor)}>
                        <step.icon className={cn("w-5 h-5", step.color)} />
                      </div>
                      <h4 className="font-semibold text-sm mb-1">{index + 1}. {step.title}</h4>
                      <p className="text-xs text-muted-foreground">{step.description}</p>
                    </motion.div>
                  ))}
                </div>

                {/* Rules & Scoring */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="flex flex-wrap gap-2"
                >
                  {rules.map((rule, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 border border-border/50 text-xs"
                    >
                      <rule.icon className={cn("w-3.5 h-3.5", rule.color)} />
                      <span className="text-muted-foreground">{rule.text}</span>
                    </div>
                  ))}
                </motion.div>

                {/* Pro Tip */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="p-3 rounded-lg bg-gradient-to-r from-primary/10 via-transparent to-accent/10 border border-primary/20"
                >
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-primary mt-0.5" />
                    <p className="text-xs text-muted-foreground">
                      <strong className="text-foreground">Pro Tip:</strong> Signals with high Hype scores get featured on the landing page 
                      and are shared directly with entertainment industry professionals.
                    </p>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </CollapsibleContent>
        )}
      </AnimatePresence>
    </Collapsible>
  );
}

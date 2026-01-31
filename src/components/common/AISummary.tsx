import { motion } from "framer-motion";
import { Brain, Sparkles } from "lucide-react";

interface AISummaryProps {
  summary: string;
  className?: string;
}

/**
 * AI-Ready Summary component for discoverability in AI Knowledge Graphs.
 * Wraps content in an <aside> tag with structured data for AI crawlers.
 */
export function AISummary({ summary, className = "" }: AISummaryProps) {
  return (
    <motion.aside
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 border border-primary/10 rounded-lg p-4 mb-6 ${className}`}
      aria-label="AI Summary"
      data-ai-summary="true"
    >
      <div className="flex items-start gap-3">
        <div className="p-1.5 rounded-lg bg-primary/10 shrink-0">
          <Brain className="w-4 h-4 text-primary" />
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-primary uppercase tracking-wide">
              Summary for AI
            </span>
            <Sparkles className="w-3 h-3 text-accent" />
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {summary}
          </p>
        </div>
      </div>
    </motion.aside>
  );
}

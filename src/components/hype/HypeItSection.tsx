import { useState } from "react";
import { motion } from "framer-motion";
import { Flame, Rocket, Plus, TrendingUp, Users, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HypeSignalFeed } from "./HypeSignalFeed";
import { HypeSubmitDialog } from "./HypeSubmitDialog";
import { useHypeSignals } from "@/hooks/useHypeSignals";
import { cn } from "@/lib/utils";

interface HypeItSectionProps {
  showHeader?: boolean;
  compact?: boolean;
  categoryId?: string;
  className?: string;
}

export function HypeItSection({
  showHeader = true,
  compact = false,
  categoryId,
  className,
}: HypeItSectionProps) {
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const { signals, canSubmit, currentUserId, isViewOnly } = useHypeSignals(categoryId);

  // Calculate some stats
  const totalSignals = signals.length;
  const totalHype = signals.reduce((sum, s) => sum + s.hype_count, 0);

  return (
    <div className={cn("space-y-6", className)}>
      {showHeader && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-2"
        >
          <div className="flex items-center justify-center gap-2">
            <Flame className="w-8 h-8 text-orange-500" />
            <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
              Hype It
            </h2>
            {isViewOnly && (
              <Badge variant="secondary" className="gap-1">
                <Eye className="w-3 h-3" />
                Industry View
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground max-w-md mx-auto">
            {isViewOnly 
              ? "View what audiences want to see created next. Real-time demand signals." 
              : "Signal what you want to see created next. Your voice shapes entertainment."}
          </p>
        </motion.div>
      )}

      {/* Stats Bar */}
      {!compact && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-3 gap-4"
        >
          <Card className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/20">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-full bg-orange-500/20">
                <TrendingUp className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{totalSignals}</p>
                <p className="text-xs text-muted-foreground">Active Signals</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-full bg-primary/20">
                <Flame className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{totalHype}</p>
                <p className="text-xs text-muted-foreground">Total Hype</p>
              </div>
            </CardContent>
          </Card>

          <Card className="hidden md:block">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-full bg-muted">
                <Users className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">7 days</p>
                <p className="text-xs text-muted-foreground">Signal Lifespan</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Submit Button - Only for audience users */}
      {currentUserId && !isViewOnly && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="flex justify-center"
        >
          <Button
            onClick={() => setShowSubmitDialog(true)}
            disabled={!canSubmit}
            size={compact ? "default" : "lg"}
            className={cn(
              "gap-2 shadow-lg",
              "bg-gradient-to-r from-orange-500 to-red-500",
              "hover:from-orange-600 hover:to-red-600",
              "text-white border-0",
              "shadow-orange-500/30"
            )}
          >
            {canSubmit ? (
              <>
                <Rocket className="w-5 h-5" />
                Launch a Signal
              </>
            ) : (
              <>
                <Plus className="w-5 h-5" />
                Daily Limit Reached (3/3)
              </>
            )}
          </Button>
        </motion.div>
      )}

      {/* Feed */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <HypeSignalFeed 
          categoryId={categoryId}
          showCategoryFilter={!categoryId}
          compact={compact}
          limit={compact ? 5 : undefined}
        />
      </motion.div>

      {/* Submit Dialog */}
      <HypeSubmitDialog
        open={showSubmitDialog}
        onOpenChange={setShowSubmitDialog}
        defaultCategoryId={categoryId}
      />
    </div>
  );
}

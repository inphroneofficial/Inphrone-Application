import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Plus, Trash2, Send, AlertTriangle, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface YourTurnQuestionFormProps {
  slotId: string;
  onSubmit: (
    slotId: string,
    questionText: string,
    options: Array<{ id: string; label: string }>
  ) => Promise<boolean>;
}

export const YourTurnQuestionForm = ({ slotId, onSubmit }: YourTurnQuestionFormProps) => {
  const [questionText, setQuestionText] = useState("");
  const [options, setOptions] = useState<Array<{ id: string; label: string }>>([
    { id: "opt_1", label: "" },
    { id: "opt_2", label: "" }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showGuidelines, setShowGuidelines] = useState(true);

  const addOption = () => {
    if (options.length >= 4) {
      toast.error("Maximum 4 options allowed");
      return;
    }
    setOptions([...options, { id: `opt_${options.length + 1}`, label: "" }]);
  };

  const removeOption = (index: number) => {
    if (options.length <= 2) {
      toast.error("Minimum 2 options required");
      return;
    }
    setOptions(options.filter((_, i) => i !== index));
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index].label = value;
    setOptions(newOptions);
  };

  const handleSubmit = async () => {
    // Validation
    if (!questionText.trim()) {
      toast.error("Please enter a question");
      return;
    }

    if (questionText.length > 200) {
      toast.error("Question is too long (max 200 characters)");
      return;
    }

    const filledOptions = options.filter(opt => opt.label.trim());
    if (filledOptions.length < 2) {
      toast.error("Please provide at least 2 options");
      return;
    }

    const validOptions = filledOptions.map((opt, idx) => ({
      id: `opt_${idx + 1}`,
      label: opt.label.trim()
    }));

    setIsSubmitting(true);
    const success = await onSubmit(slotId, questionText.trim(), validOptions);
    setIsSubmitting(false);

    if (success) {
      setQuestionText("");
      setOptions([{ id: "opt_1", label: "" }, { id: "opt_2", label: "" }]);
    }
  };

  const exampleQuestions = [
    "What's your most anticipated movie of 2024?",
    "Which OTT platform do you use the most?",
    "Best gaming genre for relaxation?",
    "Your favorite music artist right now?"
  ];

  return (
    <motion.div
      className="p-6 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-2xl border-2 border-amber-500/30"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <motion.div
          className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md"
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <Sparkles className="w-6 h-6 text-white" />
        </motion.div>
        <div>
          <h3 className="font-bold text-lg">Submit Your Question</h3>
          <p className="text-xs text-muted-foreground">
            Ask an entertainment-related question for the community
          </p>
        </div>
      </div>

      {/* Guidelines */}
      {showGuidelines && (
        <motion.div
          className="mb-4 p-4 bg-amber-500/10 rounded-xl border border-amber-500/20"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
        >
          <div className="flex items-start gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-600 dark:text-amber-400">
                Guidelines
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Ask only entertainment-related questions. Irrelevant or inappropriate 
                questions will be removed.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-2">
            <Lightbulb className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-medium text-foreground mb-1">Example Questions:</p>
              <ul className="text-xs text-muted-foreground space-y-0.5">
                {exampleQuestions.map((q, i) => (
                  <li key={i}>• {q}</li>
                ))}
              </ul>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            className="mt-2 h-7 text-xs"
            onClick={() => setShowGuidelines(false)}
          >
            Got it ✓
          </Button>
        </motion.div>
      )}

      {/* Question Input */}
      <div className="mb-4">
        <label className="text-sm font-medium mb-2 block">Your Question</label>
        <Textarea
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          placeholder="Ask an entertainment question..."
          className="min-h-[80px] resize-none bg-background/50"
          maxLength={200}
        />
        <div className="flex justify-between mt-1">
          <span className="text-xs text-muted-foreground">
            Entertainment topics only
          </span>
          <span className={`text-xs ${questionText.length > 180 ? 'text-amber-500' : 'text-muted-foreground'}`}>
            {questionText.length}/200
          </span>
        </div>
      </div>

      {/* Options */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium">Answer Options (2-4)</label>
          {options.length < 4 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={addOption}
              className="h-7 text-xs"
            >
              <Plus className="w-3 h-3 mr-1" />
              Add Option
            </Button>
          )}
        </div>
        
        <div className="space-y-2">
          {options.map((option, index) => (
            <motion.div
              key={option.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2"
            >
              <span className="text-xs text-muted-foreground w-5">
                {String.fromCharCode(65 + index)}.
              </span>
              <Input
                value={option.label}
                onChange={(e) => updateOption(index, e.target.value)}
                placeholder={`Option ${index + 1}`}
                className="flex-1 bg-background/50"
                maxLength={100}
              />
              {options.length > 2 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => removeOption(index)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Submit Button */}
      <Button
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="w-full h-12 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-xl shadow-md"
      >
        {isSubmitting ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
            Submitting...
          </>
        ) : (
          <>
            <Send className="w-5 h-5 mr-2" />
            Submit Question
          </>
        )}
      </Button>
    </motion.div>
  );
};

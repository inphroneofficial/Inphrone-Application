import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, 
  PlusCircle, 
  X, 
  Check,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface PollOption {
  id: string;
  text: string;
  votes: number;
}

interface Poll {
  question: string;
  options: PollOption[];
  totalVotes: number;
  userVoted?: string;
  expiresAt?: Date;
}

interface PollCreatorProps {
  onPollCreate: (poll: Omit<Poll, 'totalVotes' | 'userVoted'>) => void;
  maxOptions?: number;
}

export const PollCreator = ({ onPollCreate, maxOptions = 4 }: PollCreatorProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState<string[]>(["", ""]);

  const addOption = () => {
    if (options.length < maxOptions) {
      setOptions([...options, ""]);
    }
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleCreate = () => {
    if (!question.trim() || options.filter(o => o.trim()).length < 2) {
      return;
    }

    onPollCreate({
      question: question.trim(),
      options: options
        .filter(o => o.trim())
        .map((text, i) => ({
          id: `option_${i}`,
          text: text.trim(),
          votes: 0
        }))
    });

    // Reset form
    setQuestion("");
    setOptions(["", ""]);
    setIsExpanded(false);
  };

  return (
    <Card className="p-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-primary" />
          <span className="font-medium text-sm">Add a Poll</span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        )}
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pt-4 space-y-3">
              <Input
                placeholder="Ask a question..."
                value={question}
                onChange={e => setQuestion(e.target.value)}
              />

              <div className="space-y-2">
                {options.map((option, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder={`Option ${index + 1}`}
                      value={option}
                      onChange={e => updateOption(index, e.target.value)}
                    />
                    {options.length > 2 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeOption(index)}
                        className="shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              {options.length < maxOptions && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addOption}
                  className="w-full"
                >
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Add Option
                </Button>
              )}

              <Button
                onClick={handleCreate}
                disabled={!question.trim() || options.filter(o => o.trim()).length < 2}
                className="w-full"
              >
                <Check className="w-4 h-4 mr-2" />
                Create Poll
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};

interface PollDisplayProps {
  poll: Poll;
  onVote: (optionId: string) => void;
  disabled?: boolean;
}

export const PollDisplay = ({ poll, onVote, disabled = false }: PollDisplayProps) => {
  const hasVoted = !!poll.userVoted;

  return (
    <Card className="p-4">
      <h4 className="font-medium mb-3">{poll.question}</h4>
      
      <div className="space-y-2">
        {poll.options.map(option => {
          const percentage = poll.totalVotes > 0 
            ? Math.round((option.votes / poll.totalVotes) * 100) 
            : 0;
          const isSelected = poll.userVoted === option.id;

          return (
            <button
              key={option.id}
              onClick={() => !hasVoted && !disabled && onVote(option.id)}
              disabled={hasVoted || disabled}
              className={`w-full text-left p-3 rounded-lg border transition-colors relative overflow-hidden ${
                isSelected 
                  ? "border-primary bg-primary/10" 
                  : "border-border hover:border-primary/50"
              } ${hasVoted || disabled ? "cursor-default" : "cursor-pointer"}`}
            >
              {hasVoted && (
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className={`absolute inset-y-0 left-0 ${
                    isSelected ? "bg-primary/20" : "bg-muted/50"
                  }`}
                />
              )}
              <div className="relative flex items-center justify-between">
                <span className="text-sm font-medium">{option.text}</span>
                {hasVoted && (
                  <span className="text-sm text-muted-foreground">
                    {percentage}%
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
        <span>{poll.totalVotes} vote{poll.totalVotes !== 1 ? "s" : ""}</span>
        {poll.expiresAt && (
          <span>
            Ends {new Date(poll.expiresAt).toLocaleDateString()}
          </span>
        )}
      </div>
    </Card>
  );
};

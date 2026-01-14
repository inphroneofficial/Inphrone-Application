import { motion } from "framer-motion";
import { Trophy, Clock, Users, Check, X } from "lucide-react";

interface YourTurnResultsProps {
  slots: Array<{
    id: string;
    slot_time: string;
    status: string;
    winner_id: string | null;
    attempt_count: number;
  }>;
  questions: Array<{
    id: string;
    slot_id: string;
    question_text: string;
    total_votes: number;
    winner_name?: string;
  }>;
  getSlotLabel: (time: string) => string;
}

export const YourTurnResults = ({ slots, questions, getSlotLabel }: YourTurnResultsProps) => {
  if (slots.length === 0) return null;

  const getSlotStatus = (slot: typeof slots[0]) => {
    const question = questions.find(q => q.slot_id === slot.id);
    
    if (slot.winner_id && question) {
      return {
        status: 'completed',
        icon: <Check className="w-4 h-4 text-green-500" />,
        label: 'Question Submitted',
        color: 'text-green-500',
        bgColor: 'bg-green-500/10'
      };
    }
    
    if (slot.winner_id && !question) {
      return {
        status: 'winner_pending',
        icon: <Clock className="w-4 h-4 text-amber-500 animate-pulse" />,
        label: 'Awaiting Question',
        color: 'text-amber-500',
        bgColor: 'bg-amber-500/10'
      };
    }
    
    if (slot.status === 'expired') {
      return {
        status: 'expired',
        icon: <X className="w-4 h-4 text-muted-foreground" />,
        label: 'No Winner',
        color: 'text-muted-foreground',
        bgColor: 'bg-muted/50'
      };
    }
    
    return {
      status: 'pending',
      icon: <Clock className="w-4 h-4 text-primary" />,
      label: 'Upcoming',
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    };
  };

  // Sort slots by time
  const sortedSlots = [...slots].sort((a, b) => a.slot_time.localeCompare(b.slot_time));

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Trophy className="w-4 h-4 text-amber-500" />
        <h4 className="font-semibold text-sm">Today's Slot Status</h4>
      </div>
      
      <div className="grid grid-cols-3 gap-3">
        {['09:00', '14:00', '19:00'].map((slotTime) => {
          const slot = sortedSlots.find(s => s.slot_time === slotTime);
          const slotStatus = slot ? getSlotStatus(slot) : {
            status: 'pending',
            icon: <Clock className="w-4 h-4 text-muted-foreground" />,
            label: 'Upcoming',
            color: 'text-muted-foreground',
            bgColor: 'bg-muted/50'
          };
          const question = slot ? questions.find(q => q.slot_id === slot.id) : null;

          return (
            <motion.div
              key={slotTime}
              className={`p-3 rounded-xl ${slotStatus.bgColor} border border-border/50`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="text-center">
                <p className="text-xs font-bold text-foreground mb-1">
                  {getSlotLabel(slotTime)}
                </p>
                
                <div className={`flex items-center justify-center gap-1 text-[10px] ${slotStatus.color} mb-2`}>
                  {slotStatus.icon}
                  <span>{slotStatus.label}</span>
                </div>

                {slot && slot.attempt_count > 0 && (
                  <div className="flex items-center justify-center gap-1 text-[10px] text-muted-foreground">
                    <Users className="w-3 h-3" />
                    <span>{slot.attempt_count} tried</span>
                  </div>
                )}

                {question && (
                  <div className="mt-2 pt-2 border-t border-border/50">
                    <p className="text-[10px] text-muted-foreground line-clamp-2">
                      "{question.question_text}"
                    </p>
                    <p className="text-[10px] font-medium text-primary mt-1">
                      {question.total_votes} votes
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

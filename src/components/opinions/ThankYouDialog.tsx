import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Heart, Send } from "lucide-react";

interface ThankYouDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  likerUserId: string;
  likerName: string;
  opinionTitle: string;
}

export function ThankYouDialog({ 
  open, 
  onOpenChange, 
  likerUserId, 
  likerName,
  opinionTitle 
}: ThankYouDialogProps) {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const handleSendThankYou = async () => {
    if (!message.trim()) {
      toast.error("Please write a thank you message");
      return;
    }

    setSending(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please sign in to send thank you messages");
        return;
      }

      // Get sender's name
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();

      const senderName = profile?.full_name || 'Someone';

      // Create notification for the liker
      const { error } = await supabase
        .from('notifications')
        .insert({
          user_id: likerUserId,
          title: `💌 Thank You from ${senderName}`,
          message: `${senderName} sent you a thank you message for liking "${opinionTitle}": "${message}"`,
          type: 'thank_you',
          action_url: '/profile'
        });

      if (error) throw error;

      toast.success(`Thank you message sent to ${likerName}! 💌`);
      setMessage("");
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error sending thank you:', error);
      toast.error("Failed to send thank you message");
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-accent fill-accent" />
            Send Thank You to {likerName}
          </DialogTitle>
          <DialogDescription>
            Express your gratitude for their support on "{opinionTitle}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Textarea
            placeholder="Write your thank you message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="min-h-[150px] resize-none"
            maxLength={500}
          />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{message.length}/500 characters</span>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={sending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSendThankYou}
            disabled={sending || !message.trim()}
            className="gap-2"
          >
            <Send className="w-4 h-4" />
            {sending ? "Sending..." : "Send Thank You"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

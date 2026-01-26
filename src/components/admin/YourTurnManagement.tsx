import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { 
  Trophy, 
  Clock, 
  Users, 
  Trash2, 
  RefreshCw, 
  Calendar,
  MessageSquare,
  BarChart3,
  CheckCircle,
  XCircle,
  Eye,
  AlertTriangle,
  Ban,
  Flag
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { format, parseISO } from "date-fns";

interface YourTurnSlot {
  id: string;
  slot_date: string;
  slot_time: string;
  status: string;
  winner_id: string | null;
  attempt_count: number;
  created_at: string;
}

interface YourTurnQuestion {
  id: string;
  slot_id: string;
  user_id: string;
  question_text: string;
  options: { id: string; label: string }[];
  total_votes: number | null;
  is_approved: boolean;
  is_deleted: boolean;
  created_at: string;
  profiles?: {
    full_name: string;
    email: string;
  };
}

interface YourTurnHistory {
  id: string;
  slot_date: string;
  slot_time: string;
  winner_name: string | null;
  question_text: string | null;
  total_votes: number;
  attempt_count: number;
  archived_at: string;
}

export function YourTurnManagement() {
  const [slots, setSlots] = useState<YourTurnSlot[]>([]);
  const [questions, setQuestions] = useState<YourTurnQuestion[]>([]);
  const [history, setHistory] = useState<YourTurnHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'slots' | 'questions' | 'history'>('slots');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<YourTurnQuestion | null>(null);
  const [violationReason, setViolationReason] = useState<string>('');
  const [customReason, setCustomReason] = useState<string>('');

  const violationReasons = [
    { id: 'non_entertainment', label: 'Non-entertainment content', icon: Ban },
    { id: 'personal', label: 'Personal/private question', icon: AlertTriangle },
    { id: 'spam', label: 'Spam or promotional content', icon: Flag },
    { id: 'inappropriate', label: 'Inappropriate or offensive', icon: XCircle },
    { id: 'duplicate', label: 'Duplicate question', icon: MessageSquare },
    { id: 'other', label: 'Other reason', icon: AlertTriangle }
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch today's slots
      const today = new Date().toISOString().split('T')[0];
      const { data: slotsData } = await supabase
        .from("your_turn_slots")
        .select("*")
        .gte("slot_date", today)
        .order("slot_date", { ascending: true })
        .order("slot_time", { ascending: true });

      // Fetch all questions with user profiles
      const { data: questionsData } = await supabase
        .from("your_turn_questions")
        .select(`
          *,
          profiles:user_id (full_name, email)
        `)
        .eq("is_deleted", false)
        .order("created_at", { ascending: false });

      // Map questions with proper type casting
      const mappedQuestions = (questionsData || []).map(q => ({
        ...q,
        options: (q.options as { id: string; label: string }[]) || [],
        profiles: q.profiles as { full_name: string; email: string } | null
      }));

      setQuestions(mappedQuestions);

      // Fetch history
      const { data: historyData } = await supabase
        .from("your_turn_history")
        .select("*")
        .order("archived_at", { ascending: false })
        .limit(50);

      setSlots(slotsData || []);
      setHistory(historyData || []);
    } catch (error) {
      console.error("Error fetching Your Turn data:", error);
      toast.error("Failed to load Your Turn data");
    } finally {
      setLoading(false);
    }
  };

  const openDeleteDialog = (question: YourTurnQuestion) => {
    setSelectedQuestion(question);
    setViolationReason('');
    setCustomReason('');
    setDeleteDialogOpen(true);
  };

  const handleDeleteQuestion = async () => {
    if (!selectedQuestion) return;
    if (!violationReason) {
      toast.error("Please select a violation reason");
      return;
    }
    
    const finalReason = violationReason === 'other' ? customReason : 
      violationReasons.find(r => r.id === violationReason)?.label || violationReason;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("You must be logged in");
        return;
      }
      
      const { error } = await supabase
        .from("your_turn_questions")
        .update({ 
          is_deleted: true, 
          deleted_by: user.id,
          deleted_at: new Date().toISOString(),
          deletion_reason: finalReason
        })
        .eq("id", selectedQuestion.id);

      if (error) {
        console.error("Update error:", error);
        throw error;
      }

      // Send notification to the question owner about removal
      await supabase.from("notifications").insert({
        user_id: selectedQuestion.user_id,
        title: "Your Turn Question Removed",
        message: `Your question "${selectedQuestion.question_text.substring(0, 50)}..." was removed. Reason: ${finalReason}`,
        type: "question_removed",
        action_url: "/yourturn"
      });

      // Try to send email notification
      try {
        const { data: userProfile } = await supabase
          .from("profiles")
          .select("email, full_name, settings")
          .eq("id", selectedQuestion.user_id)
          .single();
        
        if (userProfile) {
          const settings = userProfile.settings as any;
          if (settings?.email_notifications !== false) {
            await supabase.functions.invoke('send-notification-email', {
              body: {
                type: 'broadcast',
                to: userProfile.email,
                name: userProfile.full_name || 'User',
                data: {
                  title: 'Your Turn Question Removed',
                  message: `Your question was removed from Your Turn.\n\nReason: ${finalReason}\n\nPlease review our content guidelines to ensure your future questions comply with our community standards.`,
                  actionUrl: 'https://inphrone.com/yourturn'
                }
              }
            });
          }
        }
      } catch (emailErr) {
        console.error("Failed to send email notification:", emailErr);
      }

      toast.success(`Question removed: ${finalReason}`);
      setDeleteDialogOpen(false);
      setSelectedQuestion(null);
      setViolationReason('');
      setCustomReason('');
      fetchData();
    } catch (error: any) {
      console.error("Error deleting question:", error);
      toast.error(`Failed to delete question: ${error.message || 'Unknown error'}`);
    }
  };

  const handleResetSlot = async (slotId: string) => {
    if (!confirm("Are you sure you want to reset this slot? This will clear the winner and allow new attempts.")) return;

    try {
      const { error } = await supabase
        .from("your_turn_slots")
        .update({ 
          winner_id: null,
          status: 'pending',
          attempt_count: 0
        })
        .eq("id", slotId);

      if (error) throw error;

      toast.success("Slot reset successfully");
      fetchData();
    } catch (error) {
      console.error("Error resetting slot:", error);
      toast.error("Failed to reset slot");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'active':
        return <Badge className="bg-amber-500">Active</Badge>;
      case 'completed':
        return <Badge className="bg-green-500">Completed</Badge>;
      case 'expired':
        return <Badge variant="destructive">Expired</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatSlotTime = (time: string) => {
    const hour = parseInt(time.split(':')[0]);
    if (hour === 9) return "9:00 AM";
    if (hour === 14) return "2:00 PM";
    if (hour === 19) return "7:00 PM";
    return time;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Today's Slots</p>
                <p className="text-2xl font-bold">{slots.filter(s => s.slot_date === new Date().toISOString().split('T')[0]).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <MessageSquare className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Questions</p>
                <p className="text-2xl font-bold">{questions.filter(q => q.is_approved && !q.is_deleted).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/10 rounded-lg">
                <Users className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Attempts Today</p>
                <p className="text-2xl font-bold">
                  {slots.filter(s => s.slot_date === new Date().toISOString().split('T')[0]).reduce((acc, s) => acc + (s.attempt_count || 0), 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <BarChart3 className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Votes</p>
                <p className="text-2xl font-bold">{questions.reduce((acc, q) => acc + (q.total_votes || 0), 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border pb-2">
        <Button
          variant={activeTab === 'slots' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('slots')}
        >
          <Clock className="w-4 h-4 mr-2" />
          Slots
        </Button>
        <Button
          variant={activeTab === 'questions' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('questions')}
        >
          <MessageSquare className="w-4 h-4 mr-2" />
          Questions
        </Button>
        <Button
          variant={activeTab === 'history' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('history')}
        >
          <Calendar className="w-4 h-4 mr-2" />
          History
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchData}
          className="ml-auto"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Slots Tab */}
      {activeTab === 'slots' && (
        <Card>
          <CardHeader>
            <CardTitle>Time Slots</CardTitle>
            <CardDescription>Manage Your Turn time slots (9 AM, 2 PM, 7 PM)</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <div className="space-y-3">
                {slots.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No slots found</p>
                ) : (
                  slots.map((slot) => (
                    <div
                      key={slot.id}
                      className="flex items-center justify-between p-4 border border-border rounded-lg bg-card"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Clock className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">
                            {format(parseISO(slot.slot_date), 'MMM d, yyyy')} - {formatSlotTime(slot.slot_time)}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            {getStatusBadge(slot.status)}
                            <span className="text-sm text-muted-foreground">
                              {slot.attempt_count || 0} attempts
                            </span>
                            {slot.winner_id && (
                              <Badge className="bg-green-500 gap-1">
                                <Trophy className="w-3 h-3" />
                                Winner Selected
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleResetSlot(slot.id)}
                        className="gap-1"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Reset
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Questions Tab */}
      {activeTab === 'questions' && (
        <Card>
          <CardHeader>
            <CardTitle>User Questions</CardTitle>
            <CardDescription>Moderate and manage user-submitted questions</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <div className="space-y-3">
                {questions.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No questions found</p>
                ) : (
                  questions.map((question) => (
                    <div
                      key={question.id}
                      className="p-4 border border-border rounded-lg bg-card space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-lg">{question.question_text}</p>
                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            <Badge variant="outline" className="gap-1">
                              <Users className="w-3 h-3" />
                              {question.profiles?.full_name || 'Unknown User'}
                            </Badge>
                            {question.is_approved ? (
                              <Badge className="bg-green-500 gap-1">
                                <CheckCircle className="w-3 h-3" />
                                Approved
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="gap-1">
                                <Eye className="w-3 h-3" />
                                Pending Review
                              </Badge>
                            )}
                            <span className="text-sm text-muted-foreground">
                              {question.total_votes || 0} votes
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {format(parseISO(question.created_at), 'MMM d, h:mm a')}
                            </span>
                          </div>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => openDeleteDialog(question)}
                          className="gap-1"
                        >
                          <Flag className="w-4 h-4" />
                          Report & Remove
                        </Button>
                      </div>
                      
                      {/* Options */}
                      <div className="grid grid-cols-2 gap-2">
                        {(question.options as any[]).map((option: any, idx: number) => (
                          <div
                            key={option.id || idx}
                            className="p-2 bg-muted/50 rounded-lg text-sm"
                          >
                            {option.label || option.text}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <Card>
          <CardHeader>
            <CardTitle>Past Sessions</CardTitle>
            <CardDescription>View archived Your Turn sessions and results</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <div className="space-y-3">
                {history.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No history found</p>
                ) : (
                  history.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 border border-border rounded-lg bg-card"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium">
                          {format(parseISO(item.slot_date), 'MMM d, yyyy')} - {formatSlotTime(item.slot_time)}
                        </p>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{item.attempt_count || 0} attempts</Badge>
                          <Badge className="bg-primary">{item.total_votes || 0} votes</Badge>
                        </div>
                      </div>
                      {item.winner_name && (
                        <div className="flex items-center gap-2 mb-2">
                          <Trophy className="w-4 h-4 text-amber-500" />
                          <span className="text-sm font-medium">{item.winner_name}</span>
                        </div>
                      )}
                      {item.question_text && (
                        <p className="text-sm text-muted-foreground">{item.question_text}</p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Delete Question Dialog with Violation Reason */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              Remove Question for Rule Violation
            </DialogTitle>
            <DialogDescription>
              Select the reason for removing this question. This helps maintain community guidelines.
            </DialogDescription>
          </DialogHeader>
          
          {selectedQuestion && (
            <div className="p-3 bg-muted/50 rounded-lg mb-4">
              <p className="font-medium text-sm">{selectedQuestion.question_text}</p>
            </div>
          )}

          <RadioGroup value={violationReason} onValueChange={setViolationReason} className="space-y-3">
            {violationReasons.map((reason) => {
              const IconComponent = reason.icon;
              return (
                <div key={reason.id} className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                  <RadioGroupItem value={reason.id} id={reason.id} />
                  <IconComponent className="w-4 h-4 text-muted-foreground" />
                  <Label htmlFor={reason.id} className="flex-1 cursor-pointer">
                    {reason.label}
                  </Label>
                </div>
              );
            })}
          </RadioGroup>

          {violationReason === 'other' && (
            <Textarea
              placeholder="Please specify the reason..."
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              className="mt-3"
            />
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteQuestion}
              disabled={!violationReason || (violationReason === 'other' && !customReason.trim())}
              className="gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Remove Question
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

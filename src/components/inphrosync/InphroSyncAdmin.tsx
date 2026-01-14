import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { X, Plus, Trash2, Save, BarChart3, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface Question {
  id: string;
  question_type: string;
  question_text: string;
  options: Array<{ id: string; label: string }>;
  is_active: boolean;
}

interface InphroSyncAdminProps {
  onClose: () => void;
  onRefresh: () => void;
}

export function InphroSyncAdmin({ onClose, onRefresh }: InphroSyncAdminProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const { data, error } = await supabase
        .from("inphrosync_questions")
        .select("*")
        .order("question_type");

      if (error) throw error;

      setQuestions(
        (data || []).map((q) => ({
          id: q.id,
          question_type: q.question_type,
          question_text: q.question_text,
          options: q.options as Array<{ id: string; label: string }>,
          is_active: q.is_active ?? true,
        }))
      );
    } catch (error) {
      console.error("Error fetching questions:", error);
      toast.error("Failed to load questions");
    } finally {
      setLoading(false);
    }
  };

  const updateQuestion = async (questionId: string, updates: Partial<Question>) => {
    try {
      setSaving(true);

      // Prepare updates - ensure options are properly formatted
      const updateData: any = {
        updated_at: new Date().toISOString()
      };
      if (updates.question_text !== undefined) {
        updateData.question_text = updates.question_text;
      }
      if (updates.options !== undefined) {
        updateData.options = updates.options;
      }
      if (updates.is_active !== undefined) {
        updateData.is_active = updates.is_active;
      }

      const { error } = await supabase
        .from("inphrosync_questions")
        .update(updateData)
        .eq("id", questionId);

      if (error) throw error;

      toast.success("✅ Question updated successfully!", {
        description: "Changes are now live in the application.",
        duration: 4000,
        action: {
          label: "Dismiss",
          onClick: () => {}
        }
      });
      
      // Refetch to ensure consistency
      await fetchQuestions();
      onRefresh();
      
      // Broadcast event to notify InphroSync page
      window.dispatchEvent(new CustomEvent('inphrosync-questions-updated'));
    } catch (error) {
      console.error("Error updating question:", error);
      toast.error("Failed to update question", {
        action: {
          label: "Retry",
          onClick: () => updateQuestion(questionId, updates)
        }
      });
      // Revert on error by refetching
      await fetchQuestions();
    } finally {
      setSaving(false);
    }
  };

  const updateQuestionText = (questionId: string, newText: string) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === questionId ? { ...q, question_text: newText } : q))
    );
  };

  const updateOptionLabel = (questionId: string, optionId: string, newLabel: string) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === questionId
          ? {
              ...q,
              options: q.options.map((opt) =>
                opt.id === optionId ? { ...opt, label: newLabel } : opt
              ),
            }
          : q
      )
    );
  };

  const addOption = (questionId: string) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === questionId
          ? {
              ...q,
              options: [
                ...q.options,
                { id: `option_${Date.now()}`, label: "New Option" },
              ],
            }
          : q
      )
    );
  };

  const removeOption = (questionId: string, optionId: string) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === questionId
          ? {
              ...q,
              options: q.options.filter((opt) => opt.id !== optionId),
            }
          : q
      )
    );
  };

  const toggleActive = async (questionId: string, isActive: boolean) => {
    await updateQuestion(questionId, { is_active: isActive });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container max-w-6xl mx-auto px-4 py-8">
        <motion.div
          className="flex items-center justify-between mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">InphroSync Admin</h1>
            <p className="text-muted-foreground">Manage daily questions and options</p>
          </div>
          <Button
            variant="outline"
            onClick={onClose}
          >
            <X className="w-4 h-4 mr-2" />
            Close
          </Button>
        </motion.div>

        <Tabs defaultValue="questions" className="space-y-6">
          <TabsList className="bg-muted">
            <TabsTrigger value="questions">Manage Questions</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="questions" className="space-y-6">
            {questions.map((question, index) => (
              <motion.div
                key={question.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-card border-border">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-foreground">
                        {question.question_type}
                      </CardTitle>
                      <Button
                        size="sm"
                        variant={question.is_active ? "default" : "outline"}
                        onClick={() => toggleActive(question.id, !question.is_active)}
                      >
                        {question.is_active ? "Active" : "Inactive"}
                      </Button>
                    </div>
                    <CardDescription>
                      Question ID: {question.id}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Question Text</Label>
                      <Textarea
                        value={question.question_text}
                        onChange={(e) => updateQuestionText(question.id, e.target.value)}
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label>Options</Label>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => addOption(question.id)}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Option
                        </Button>
                      </div>

                      <div className="space-y-2">
                        {question.options.map((option) => (
                          <div key={option.id} className="flex gap-2">
                            <Input
                              value={option.label}
                              onChange={(e) =>
                                updateOptionLabel(question.id, option.id, e.target.value)
                              }
                              className="flex-1"
                            />
                            <Button
                              size="icon"
                              variant="outline"
                              onClick={() => removeOption(question.id, option.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Button
                      onClick={() =>
                        updateQuestion(question.id, {
                          question_text: question.question_text,
                          options: question.options,
                        })
                      }
                      disabled={saving}
                      className="w-full"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {saving ? "Saving..." : "Save Changes"}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </TabsContent>

          <TabsContent value="analytics">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  InphroSync Analytics
                </CardTitle>
                <CardDescription>
                  View detailed analytics and insights
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Analytics dashboard coming soon. Will include:
                </p>
                <ul className="list-disc list-inside space-y-2 mt-4 text-muted-foreground">
                  <li>Total responses per day</li>
                  <li>Most popular options over time</li>
                  <li>Demographic breakdowns</li>
                  <li>Engagement trends</li>
                  <li>User participation rates</li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

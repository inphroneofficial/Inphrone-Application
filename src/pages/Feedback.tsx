import { useState } from "react";
import Navbar from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MessageSquare, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function Feedback() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('send-feedback', {
        body: {
          type: 'feedback',
          name: formData.name,
          email: formData.email,
          message: formData.message
        }
      });

      if (error) throw error;

      toast.success("Feedback sent successfully! Thank you for your input.");
      setFormData({ name: "", email: "", message: "" });
    } catch (error) {
      console.error('Error sending feedback:', error);
      toast.error("Failed to send feedback. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col pt-16">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <MessageSquare className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold">Send Feedback</h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Help us improve Inphrone! Share your thoughts about our 8 entertainment categories, InphroSync daily pulse, 
              Your Turn feature, insights dashboard, or report any issues you've encountered.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Your Feedback Matters</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Your name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="your.email@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Feedback</Label>
                  <Textarea
                    id="message"
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Share your thoughts, suggestions, or report issues..."
                    rows={8}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  <Send className="w-4 h-4 mr-2" />
                  {loading ? "Submitting..." : "Submit Feedback"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="bg-muted/50 rounded-lg p-6 space-y-3">
            <h3 className="font-semibold text-lg">What happens next?</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Your feedback is sent directly to our team at inphrone@gmail.com</li>
              <li>• We review all feedback carefully to improve the platform</li>
              <li>• For urgent issues, please use the Contact page</li>
              <li>• Looking to share your experience? Visit our Reviews page instead</li>
            </ul>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

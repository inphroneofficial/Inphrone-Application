import Navbar from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, AlertCircle, CheckCircle, XCircle, Scale } from "lucide-react";

export default function Terms() {
  return (
    <div className="min-h-screen flex flex-col pt-16">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <FileText className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold">Terms & Conditions</h1>
            <p className="text-muted-foreground text-lg">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="w-5 h-5" />
                Agreement to Terms
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                By accessing or using Inphrone, you agree to be bound by these Terms and Conditions. 
                If you disagree with any part of these terms, you may not access the platform.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                User Accounts & Eligibility
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>You must be at least 13 years old to use Inphrone</li>
                <li>You must provide accurate and complete registration information</li>
                <li>You are responsible for maintaining the confidentiality of your account</li>
                <li>One person may not maintain more than one account</li>
                <li>Accounts registered by bots or automated methods are prohibited</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>User Content & Conduct</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Content Guidelines</h3>
                <p className="text-muted-foreground mb-2">
                  When sharing opinions and content on Inphrone, you agree to:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li>Provide honest and authentic feedback</li>
                  <li>Respect intellectual property rights</li>
                  <li>Refrain from sharing harmful, offensive, or illegal content</li>
                  <li>Not engage in spam, manipulation, or fraudulent activities</li>
                  <li>Not impersonate others or misrepresent your affiliation</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Content Ownership</h3>
                <p className="text-muted-foreground">
                  You retain ownership of content you submit. By posting on Inphrone, you grant us 
                  a worldwide, non-exclusive license to use, display, and distribute your content 
                  for platform operations and insights generation.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <XCircle className="w-5 h-5" />
                Prohibited Activities
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Attempting to gain unauthorized access to the platform</li>
                <li>Interfering with or disrupting platform services</li>
                <li>Collecting user information without consent</li>
                <li>Using the platform for commercial purposes without authorization</li>
                <li>Reverse engineering or copying platform features</li>
                <li>Manipulating votes, reviews, or engagement metrics</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Rewards, Gamification & Features</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Inphrone offers rewards, Wisdom Badges, InphroSync streaks, Your Turn competitions, and other gamification features. These features:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Have no cash value unless explicitly stated</li>
                <li>Cannot be transferred or sold</li>
                <li>May be modified or discontinued at any time</li>
                <li>Are subject to platform rules and fair use policies</li>
                <li>Your Turn slot wins are first-come-first-served during the 20-second window</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Disclaimer & Limitation of Liability
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Inphrone is provided "as is" without warranties of any kind. We do not guarantee 
                that the platform will be uninterrupted, secure, or error-free. We are not liable 
                for any indirect, incidental, or consequential damages arising from your use of 
                the platform.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account Termination</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                We reserve the right to suspend or terminate accounts that violate these terms. 
                You may delete your account at any time through your profile settings. Upon deletion, 
                your personal data will be removed as described in our Privacy Policy.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Changes to Terms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                We may modify these terms at any time. Continued use of Inphrone after changes 
                constitutes acceptance of the new terms. We will notify users of significant changes 
                via email or platform notification.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                For questions about these Terms, contact us at{" "}
                <a href="mailto:inphrone@gmail.com" className="text-primary hover:underline">
                  inphrone@gmail.com
                </a>
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}

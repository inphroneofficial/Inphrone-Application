import Navbar from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Briefcase, Heart, Rocket, Users, Globe, Zap } from "lucide-react";

export default function Careers() {
  const values = [
    {
      icon: Heart,
      title: "People-First",
      description: "We believe in the power of human connection and authentic voices"
    },
    {
      icon: Rocket,
      title: "Innovation",
      description: "Pioneering the future of entertainment intelligence"
    },
    {
      icon: Users,
      title: "Collaboration",
      description: "Building bridges between audiences and creators worldwide"
    },
    {
      icon: Globe,
      title: "Global Impact",
      description: "Shaping entertainment for cultures across the planet"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col pt-16">
      <Navbar />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 bg-gradient-to-br from-primary/10 via-background to-background">
          <div className="container mx-auto px-4 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
              <Briefcase className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Join the Inphrone Team
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Help us build the world's first Audience-Intelligence Platform serving 8 entertainment categories 
              and transforming how content is created globally
            </p>
            <Button size="lg">
              <Zap className="w-4 h-4 mr-2" />
              View Open Positions
            </Button>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-16 container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold">Our Mission</h2>
            <p className="text-lg text-muted-foreground">
              We're on a mission to democratize entertainment insights and create a platform 
              where audience voices shape the stories of tomorrow. Inphrone serves 8 entertainment categories — 
              Film, Music, OTT, TV, YouTube, Gaming, Social Media, and App Development — with 8 user types.
              Founded by{" "}
              <span className="font-semibold text-foreground">Thangella Gadidamalla</span>, 
              a visionary entrepreneur passionate about bridging the gap between creators and audiences globally.
            </p>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Our Values</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {values.map((value, index) => (
                <Card key={index} className="text-center">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <value.icon className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{value.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{value.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Career Tracks Coming Soon */}
        <section className="py-16 container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-8">Career Tracks</h2>
          <p className="text-center text-muted-foreground max-w-2xl mx-auto mb-12">
            We will be opening roles across these tracks on Inphrone soon.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 max-w-6xl mx-auto">
            {[
              { title: 'AI/ML', desc: 'Applied AI for entertainment intelligence' },
              { title: 'UI/UX', desc: 'Design world‑class audience experiences' },
              { title: 'Full‑Stack', desc: 'Build scalable, beautiful products' },
              { title: 'Cloud', desc: 'Reliability and performance at scale' },
              { title: 'Data Analyst', desc: 'Turn signals into strategy' },
            ].map((track) => (
              <Card key={track.title}>
                <CardHeader>
                  <div className="flex flex-col gap-2">
                    <CardTitle className="text-base">{track.title}</CardTitle>
                    <Badge variant="secondary" className="w-fit text-xs">Coming soon</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{track.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Why Inphrone?</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Remote-First Culture</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Work from anywhere in the world. We value output over hours and trust our team members.
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Growth Opportunities</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Learn, grow, and shape your career in a fast-paced startup environment.
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Meaningful Impact</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Your work directly influences how entertainment is created worldwide.
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Collaborative Team</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Join a passionate team dedicated to innovation and excellence.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 container mx-auto px-4 text-center">
          <Card className="max-w-2xl mx-auto p-8 bg-gradient-to-br from-primary/10 to-background">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Don't See a Perfect Fit?</h2>
            <p className="text-muted-foreground mb-6">
              We're always looking for talented people. Send us your resume and tell us how 
              you'd like to contribute to Inphrone's mission.
            </p>
            <Button size="lg" asChild>
              <a href="mailto:inphrone@gmail.com">Get in Touch</a>
            </Button>
          </Card>
        </section>
      </main>
      <Footer />
    </div>
  );
}

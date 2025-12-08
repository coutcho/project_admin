import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { checkSession } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { Vote, Shield, BarChart3, Users, ChevronRight } from "lucide-react";
import { User } from "@/types/user";

export default function Index() {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const sessionUser = await checkSession();
      setUser(sessionUser);
    };
    checkAuth();
  }, []);

  const features = [
    {
      icon: Shield,
      title: "Secure & Encrypted",
      description: "Military-grade encryption protects your vote from submission to storage.",
    },
    {
      icon: Users,
      title: "One Vote Per User",
      description: "Advanced duplicate detection ensures fair and accurate elections.",
    },
    {
      icon: BarChart3,
      title: "Real-time Results",
      description: "Watch results update live as votes are counted securely.",
    },
  ];

  return (
    <div className="min-h-screen gradient-hero">
      <Header user={user} />
      
      <main className="pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-5xl">
          {/* Hero Section */}
          <section className="text-center py-16 md:py-24 animate-fade-in">
            <div className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-6 shadow-card animate-pulse-glow">
              <Vote className="w-10 h-10 text-primary-foreground" />
            </div>
            
            <h1 className="font-display text-4xl md:text-6xl font-bold text-foreground mb-4 tracking-tight">
              Your Voice,
              <br />
              <span className="text-secondary">Securely Counted</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              A distributed online voting system designed for security, transparency, and accessibility. 
              Every vote is encrypted, verified, and counted.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <>
                  <Link to="/vote">
                    <Button variant="vote" size="xl" className="w-full sm:w-auto">
                      Cast Your Vote
                      <ChevronRight className="w-5 h-5" />
                    </Button>
                  </Link>
                  <Link to="/results">
                    <Button variant="outline" size="xl" className="w-full sm:w-auto">
                      View Results
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/auth">
                    <Button variant="hero" size="xl" className="w-full sm:w-auto">
                      Get Started
                      <ChevronRight className="w-5 h-5" />
                    </Button>
                  </Link>
                  <Link to="/auth">
                    <Button variant="outline" size="xl" className="w-full sm:w-auto">
                      Sign In
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </section>

          {/* Features Section */}
          <section className="py-16">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <div
                  key={feature.title}
                  className="bg-card rounded-xl p-6 shadow-card animate-slide-up"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-secondary" />
                  </div>
                  <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Stats Section */}
          <section className="py-16 text-center">
            <div className="bg-card rounded-2xl p-8 md:p-12 shadow-card animate-fade-in">
              <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-8">
                Trusted by Organizations Worldwide
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {[
                  { value: "99.9%", label: "Uptime" },
                  { value: "256-bit", label: "Encryption" },
                  { value: "0", label: "Data Breaches" },
                  { value: "24/7", label: "Support" },
                ].map((stat) => (
                  <div key={stat.label}>
                    <p className="font-display text-2xl md:text-3xl font-bold text-secondary">
                      {stat.value}
                    </p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-card/50 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            © 2024 SecureVote. All rights reserved. Built for secure, transparent elections.
          </p>
        </div>
      </footer>
    </div>
  );
}

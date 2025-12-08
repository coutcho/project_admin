import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getResults, checkSession, VoteResult } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/Header";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Trophy, Users } from "lucide-react";
import { User } from "@/types/user";



export default function Results() {
  const [results, setResults] = useState<VoteResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      const sessionUser = await checkSession();
      setUser(sessionUser);
      if (!sessionUser) {
        navigate("/auth");
      }
    };
    checkAuth();
  }, [navigate]);

  useEffect(() => {
    if (user) {
      fetchResults();
    }
  }, [user]);

  const fetchResults = async () => {
    try {
      const data = await getResults();
      setResults(data || []);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error loading results",
        description: error instanceof Error ? error.message : "An unknown error occurred.",
      });
    } finally {
      setLoading(false);
    }
  };

  const totalVotes = results.reduce((sum, r) => sum + Number(r.vote_count), 0);
  const maxVotes = Math.max(...results.map((r) => Number(r.vote_count)), 1);

  const getPartyColor = (party: string | null): { bg: string; bar: string } => {
    const colors: Record<string, { bg: string; bar: string }> = {
      "Progressive Alliance": { bg: "bg-blue-100", bar: "bg-blue-500" },
      "Green Future": { bg: "bg-emerald-100", bar: "bg-emerald-500" },
      "Unity Party": { bg: "bg-purple-100", bar: "bg-purple-500" },
      "Conservative Coalition": { bg: "bg-red-100", bar: "bg-red-500" },
    };
    return colors[party || ""] || { bg: "bg-muted", bar: "bg-primary" };
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-hero">
        <Header user={user} />
        <main className="pt-24 pb-12 px-4">
          <div className="container mx-auto max-w-4xl flex items-center justify-center min-h-[60vh]">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-hero">
      <Header user={user} />
      <main className="pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-8 animate-fade-in">
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
              Election Results
            </h1>
            <p className="text-muted-foreground">Live voting statistics</p>
          </div>

          <Card className="mb-8 animate-scale-in shadow-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center gap-8">
                <div className="text-center">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Users className="w-4 h-4" />
                    <span className="text-sm">Total Votes</span>
                  </div>
                  <p className="font-display text-4xl font-bold text-foreground">{totalVotes}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {results.map((result, index) => {
              const percentage = totalVotes > 0 ? (Number(result.vote_count) / totalVotes) * 100 : 0;
              const colors = getPartyColor(result.candidate_party);
              const isLeader = index === 0 && Number(result.vote_count) > 0;

              return (
                <Card
                  key={result.candidate_id}
                  className="overflow-hidden animate-slide-up shadow-card"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {isLeader && (
                          <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                            <Trophy className="w-4 h-4 text-amber-600" />
                          </div>
                        )}
                        <div>
                          <CardTitle className="text-lg">{result.candidate_name}</CardTitle>
                          {result.candidate_party && (
                            <span className="text-sm text-muted-foreground">
                              {result.candidate_party}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-display text-2xl font-bold text-foreground">
                          {result.vote_count}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {percentage.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0 pb-4">
                    <div className="w-full h-3 rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ease-out ${colors.bar}`}
                        style={{
                          width: `${(Number(result.vote_count) / maxVotes) * 100}%`,
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {results.length === 0 && (
            <Card className="animate-fade-in">
              <CardContent className="pt-8 pb-8 text-center">
                <p className="text-muted-foreground">No votes have been cast yet.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}

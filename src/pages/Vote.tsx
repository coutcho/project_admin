import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCandidates, submitVote, checkSession, Candidate } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/Header";
import { useToast } from "@/hooks/use-toast";
import { Check, Vote as VoteIcon, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { User } from "@/types/user";



export default function Vote() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [votedFor, setVotedFor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
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
      fetchCandidates();
      // Assuming the backend handles the one-vote-per-user logic and returns an error on duplicate vote.
      // The original checkExistingVote logic is removed as it relied on a direct DB query.
    }
  }, [user]);

  const fetchCandidates = async () => {
    try {
      const data = await getCandidates();
      setCandidates(data || []);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error loading candidates",
        description: error instanceof Error ? error.message : "An unknown error occurred.",
      });
    } finally {
      setLoading(false);
    }
  };

  // checkExistingVote logic removed. We will rely on the backend to enforce one vote per user.

  const handleVote = async () => {
    if (!selectedCandidate || !user) return;

    setSubmitting(true);

    try {
      await submitVote(selectedCandidate);
      setHasVoted(true);
      setVotedFor(selectedCandidate);
      toast({
        title: "Vote submitted!",
        description: "Your vote has been recorded securely.",
      });
    } catch (error) {
      // Assuming the backend returns a specific error message for duplicate vote
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      if (errorMessage.toLowerCase().includes("already voted")) {
        toast({
          variant: "destructive",
          title: "Already voted",
          description: "You have already cast your vote in this election.",
        });
        setHasVoted(true);
      } else {
        toast({
          variant: "destructive",
          title: "Vote failed",
          description: errorMessage,
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const getPartyColor = (party: string | null) => {
    const colors: Record<string, string> = {
      "Progressive Alliance": "bg-blue-100 text-blue-700 border-blue-200",
      "Green Future": "bg-emerald-100 text-emerald-700 border-emerald-200",
      "Unity Party": "bg-purple-100 text-purple-700 border-purple-200",
      "Conservative Coalition": "bg-red-100 text-red-700 border-red-200",
    };
    return colors[party || ""] || "bg-muted text-muted-foreground border-border";
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
              {hasVoted ? "Vote Confirmed" : "Cast Your Vote"}
            </h1>
            <p className="text-muted-foreground">
              {hasVoted
                ? "Thank you for participating in the election"
                : "Select your preferred candidate below"}
            </p>
          </div>

          {hasVoted ? (
            <Card className="max-w-md mx-auto animate-scale-in shadow-card-hover">
              <CardContent className="pt-8 pb-8 text-center">
                <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-success" />
                </div>
                <h2 className="font-display text-xl font-semibold mb-2">Vote Recorded</h2>
                <p className="text-muted-foreground mb-4">
                  Your vote for{" "}
                  <span className="font-medium text-foreground">
                    {candidates.find((c) => c.id === votedFor)?.name}
                  </span>{" "}
                  has been securely recorded.
                </p>
                <Button variant="outline" onClick={() => navigate("/results")}>
                  View Results
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {candidates.map((candidate, index) => (
                  <Card
                    key={candidate.id}
                    variant={selectedCandidate === candidate.id ? "selected" : "vote"}
                    onClick={() => setSelectedCandidate(candidate.id)}
                    className="animate-slide-up"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{candidate.name}</CardTitle>
                          {candidate.party && (
                            <span
                              className={`inline-block mt-2 px-2 py-1 text-xs font-medium rounded-full border ${getPartyColor(
                                candidate.party
                              )}`}
                            >
                              {candidate.party}
                            </span>
                          )}
                        </div>
                        <div
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                            selectedCandidate === candidate.id
                              ? "bg-secondary border-secondary"
                              : "border-border"
                          }`}
                        >
                          {selectedCandidate === candidate.id && (
                            <Check className="w-4 h-4 text-secondary-foreground" />
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription>{candidate.description}</CardDescription>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="flex flex-col items-center gap-4 animate-fade-in" style={{ animationDelay: "400ms" }}>
                <Button
                  variant="vote"
                  size="xl"
                  onClick={handleVote}
                  disabled={!selectedCandidate || submitting}
                  className="min-w-[200px]"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <VoteIcon className="w-5 h-5" />
                      Confirm Vote
                    </>
                  )}
                </Button>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <AlertCircle className="w-4 h-4" />
                  <span>You can only vote once. This action cannot be undone.</span>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Vote, BarChart3, LogOut, User } from "lucide-react";
import { logout } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface HeaderProps {
  user: { email?: string } | null;
  onLogout?: () => void;
}

export function Header({ user, onLogout }: HeaderProps) {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    logout();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
    onLogout?.();
    navigate("/auth");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
            <Vote className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-display font-semibold text-lg text-foreground">SecureVote</span>
        </Link>

        <nav className="flex items-center gap-2">
          {user ? (
            <>
              <Link to="/vote">
                <Button variant="ghost" size="sm" className="gap-2">
                  <Vote className="w-4 h-4" />
                  Vote
                </Button>
              </Link>
              <Link to="/results">
                <Button variant="ghost" size="sm" className="gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Results
                </Button>
              </Link>
              <div className="w-px h-6 bg-border mx-2" />
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="w-4 h-4" />
                <span className="hidden sm:inline max-w-[150px] truncate">{user.email}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <Link to="/auth">
              <Button variant="hero" size="sm">
                Sign In
              </Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}

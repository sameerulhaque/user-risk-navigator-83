
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User } from "lucide-react";

const MainNavbar = () => {
  const location = useLocation();
  const [userType, setUserType] = useState<"company" | "user">("company");
  const { user, isAuthenticated, isAdmin, logout } = useAuth();

  // Toggle between company and user views (only for admins)
  const toggleUserType = () => {
    if (isAdmin) {
      setUserType(userType === "company" ? "user" : "company");
    }
  };

  // Update user type based on role when authentication status changes
  useEffect(() => {
    if (isAdmin) {
      setUserType("company");
    } else if (isAuthenticated) {
      setUserType("user");
    }
  }, [isAdmin, isAuthenticated]);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header className="border-b">
      <div className="container flex h-16 items-center justify-between py-4">
        <div className="flex items-center gap-2">
          <Link to="/" className="font-bold text-xl">
            Risk<span className="text-primary">Score</span>
          </Link>
          
          {isAdmin && (
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleUserType}
              className="ml-8"
            >
              View as {userType === "company" ? "User" : "Company"}
            </Button>
          )}
        </div>

        <div className="flex items-center gap-6">
          <nav className="flex items-center gap-6 mr-4">
            {isAuthenticated ? (
              userType === "company" && isAdmin ? (
                <>
                  <Link
                    to="/company/dashboard"
                    className={cn(
                      "text-sm font-medium transition-colors hover:text-primary",
                      isActive("/company/dashboard") || isActive("/") ? "text-primary" : "text-muted-foreground"
                    )}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/company/configuration"
                    className={cn(
                      "text-sm font-medium transition-colors hover:text-primary",
                      isActive("/company/configuration") ? "text-primary" : "text-muted-foreground"
                    )}
                  >
                    Configuration
                  </Link>
                  <Link
                    to="/company/users"
                    className={cn(
                      "text-sm font-medium transition-colors hover:text-primary",
                      isActive("/company/users") ? "text-primary" : "text-muted-foreground"
                    )}
                  >
                    Users
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/user/dashboard"
                    className={cn(
                      "text-sm font-medium transition-colors hover:text-primary",
                      isActive("/user/dashboard") ? "text-primary" : "text-muted-foreground"
                    )}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/user/submission"
                    className={cn(
                      "text-sm font-medium transition-colors hover:text-primary",
                      isActive("/user/submission") ? "text-primary" : "text-muted-foreground"
                    )}
                  >
                    Apply
                  </Link>
                </>
              )
            ) : (
              <>
                <Link
                  to="/login"
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-primary",
                    isActive("/login") ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-primary",
                    isActive("/register") ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  Register
                </Link>
              </>
            )}
          </nav>

          {isAuthenticated && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="rounded-full h-9 w-9 border-blue-200">
                  <User className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span>{user?.fullName}</span>
                    <span className="text-xs text-muted-foreground">{user?.email}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="cursor-pointer text-destructive">
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
};

export default MainNavbar;

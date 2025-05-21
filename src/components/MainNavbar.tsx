
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const MainNavbar = () => {
  const location = useLocation();
  const [userType, setUserType] = useState<"company" | "user">("company");

  // Toggle between company and user views
  const toggleUserType = () => {
    setUserType(userType === "company" ? "user" : "company");
  };

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
          
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleUserType}
            className="ml-8"
          >
            View as {userType === "company" ? "User" : "Company"}
          </Button>
        </div>

        <nav className="flex items-center gap-6">
          {userType === "company" ? (
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
          )}
        </nav>
      </div>
    </header>
  );
};

export default MainNavbar;

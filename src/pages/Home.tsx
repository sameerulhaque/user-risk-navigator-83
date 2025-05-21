
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const Home = () => {
  return (
    <div className="min-h-[80vh] flex flex-col">
      <div className="py-24 text-center">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-6">
          Risk Scoring <span className="text-primary">Platform</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-xl mx-auto mb-10">
          Define, manage, and apply custom risk scoring rules to evaluate users with our powerful and flexible platform.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Button asChild size="lg">
            <Link to="/company/dashboard">Company Dashboard</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link to="/user/dashboard">User Dashboard</Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Configurable Risk Matrix</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Create custom risk scoring matrices with section weightages, field rules, and complex conditions.
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Dynamic Form Generation</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Forms are generated dynamically based on your risk configuration with real-time field value fetching.
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Comprehensive Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              View detailed risk scoring breakdowns, filter users by risk level, and approve or reject applications.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Home;

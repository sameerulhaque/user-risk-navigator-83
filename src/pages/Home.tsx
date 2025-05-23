
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowRight, Database, LineChart, Shield, Brain, Layers, Zap } from "lucide-react";

const Home = () => {
  const [isDemo, setIsDemo] = useState(false);
  
  const startDemo = () => {
    setIsDemo(true);
    setTimeout(() => {
      window.location.href = "/company/configuration";
    }, 2000);
  };
  
  return (
    <div className="min-h-[80vh] flex flex-col">
      {isDemo ? (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-8 max-w-lg w-full animate-scale-in">
            <h2 className="text-2xl font-bold mb-4">Initializing Demo...</h2>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-4">
              <div className="h-full bg-blue-600 animate-[pulse_2s_infinite]"></div>
            </div>
            <p className="text-gray-600">Loading AI-powered risk assessment modules...</p>
          </div>
        </div>
      ) : null}
      
      <div className="py-24 text-center">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-6 animate-fade-in">
          AI-Powered Risk <span className="text-primary">Scoring Platform</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-xl mx-auto mb-10 animate-fade-in">
          Define, manage, and apply custom risk scoring rules with advanced AI analytics to evaluate users with our powerful and flexible platform.
        </p>
        <div className="flex flex-wrap gap-4 justify-center animate-fade-in">
          <Button onClick={startDemo} size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 gap-2">
            Start Demo <Zap size={18} />
          </Button>
          <Button asChild size="lg" variant="outline" className="hover-scale">
            <Link to="/company/configuration">Company Configuration</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="hover-scale">
            <Link to="/user/submission">User Submission</Link>
          </Button>
        </div>
        
        <div className="flex flex-wrap gap-4 justify-center mt-4">
          <Button asChild size="sm" variant="ghost" className="story-link">
            <Link to="/versioning">
              <span>View Version History</span>
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <Card className="hover-scale border-blue-100 shadow-md animate-fade-in">
          <CardHeader className="space-y-1">
            <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center mb-2">
              <Shield className="h-6 w-6 text-blue-600" />
            </div>
            <CardTitle>Configurable Risk Matrix</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Create custom risk scoring matrices with section weightages, field rules, and complex conditions with AI-assisted recommendations.
            </p>
          </CardContent>
        </Card>
        
        <Card className="hover-scale border-blue-100 shadow-md animate-fade-in delay-100">
          <CardHeader className="space-y-1">
            <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center mb-2">
              <Brain className="h-6 w-6 text-blue-600" />
            </div>
            <CardTitle>AI-Powered Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Leverage machine learning algorithms to detect patterns, predict risk factors, and optimize your risk assessment models.
            </p>
          </CardContent>
        </Card>
        
        <Card className="hover-scale border-blue-100 shadow-md animate-fade-in delay-200">
          <CardHeader className="space-y-1">
            <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center mb-2">
              <Database className="h-6 w-6 text-blue-600" />
            </div>
            <CardTitle>Version Control</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Track and manage all changes to your risk configuration with full version history and rollback capabilities.
            </p>
          </CardContent>
        </Card>

        <Card className="hover-scale border-blue-100 shadow-md animate-fade-in delay-300">
          <CardHeader className="space-y-1">
            <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center mb-2">
              <Layers className="h-6 w-6 text-blue-600" />
            </div>
            <CardTitle>Dynamic Form Generation</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Forms are generated dynamically based on your risk configuration with real-time field value fetching from multiple data sources.
            </p>
          </CardContent>
        </Card>
        
        <Card className="hover-scale border-blue-100 shadow-md animate-fade-in delay-400">
          <CardHeader className="space-y-1">
            <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center mb-2">
              <LineChart className="h-6 w-6 text-blue-600" />
            </div>
            <CardTitle>Comprehensive Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              View detailed risk scoring breakdowns, filter users by risk level, and approve or reject applications with AI-assisted recommendations.
            </p>
          </CardContent>
        </Card>
        
        <Card className="hover-scale border-blue-100 shadow-md animate-fade-in delay-500">
          <CardHeader className="space-y-1">
            <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center mb-2">
              <Zap className="h-6 w-6 text-blue-600" />
            </div>
            <CardTitle>Real-time Processing</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Process risk assessments in real-time with immediate feedback and scoring calculations for faster decision making.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Home;

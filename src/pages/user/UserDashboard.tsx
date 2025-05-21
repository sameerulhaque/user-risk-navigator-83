
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import PageHeader from "@/components/PageHeader";
import LoadingSpinner from "@/components/LoadingSpinner";
import { getUserRiskScore } from "@/services/api";
import { RiskScore } from "@/types/risk";
import { getRiskLevel, getRiskColor } from "@/utils/riskCalculator";

const UserDashboard = () => {
  const [riskScore, setRiskScore] = useState<RiskScore | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const userId = 1; // Mock user ID, would come from auth context in a real app

  useEffect(() => {
    const fetchRiskScore = async () => {
      setLoading(true);
      try {
        const response = await getUserRiskScore(userId);
        if (response.isSuccess && response.value) {
          setRiskScore(response.value);
        }
      } catch (error) {
        console.error("Error fetching risk score:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRiskScore();
  }, [userId]);

  const getStatusInfo = () => {
    if (!riskScore) return { color: "", message: "" };

    switch (riskScore.status) {
      case "Approved":
        return {
          color: "text-green-600",
          message:
            "Your application has been approved! You can proceed with the next steps.",
        };
      case "Rejected":
        return {
          color: "text-red-600",
          message:
            "Your application has been rejected. Please review the feedback below.",
        };
      default:
        return {
          color: "text-yellow-600",
          message:
            "Your application is currently under review. We will notify you when a decision has been made.",
        };
    }
  };

  const statusInfo = getStatusInfo();
  const riskLevel = riskScore ? getRiskLevel(riskScore.totalScore) : "medium";
  const riskColor = getRiskColor(riskLevel);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!riskScore) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">No Risk Assessment Found</h2>
        <p className="text-muted-foreground mb-8">
          It looks like you haven't submitted your information yet for risk assessment.
        </p>
        <Button asChild>
          <Link to="/user/submission">Submit Your Information</Link>
        </Button>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Your Risk Dashboard"
        description="View your risk assessment details and status"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Risk Assessment</CardTitle>
            <CardDescription>Last updated: {new Date(riskScore.updatedAt).toLocaleDateString()}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center mb-6">
              <div className={`text-6xl font-bold ${riskColor} mb-2`}>
                {riskScore.totalScore}%
              </div>
              <div className={`text-xl font-medium ${riskColor}`}>
                {riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1)} Risk
              </div>
            </div>

            <div className="rounded-lg border p-4 mb-6">
              <div className={`font-medium mb-2 ${statusInfo.color}`}>
                Status: {riskScore.status}
              </div>
              <p>{statusInfo.message}</p>
            </div>

            <div>
              <h3 className="font-medium mb-4">Score Breakdown</h3>
              {riskScore.sectionScores.map((section) => (
                <div key={section.sectionId} className="mb-4">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium">{section.sectionName}</span>
                    <span className="text-sm">
                      {section.score}/{section.maxPossible} pts
                    </span>
                  </div>
                  <Progress 
                    value={(section.score / section.maxPossible) * 100} 
                    className="h-2" 
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button className="w-full" asChild>
                <Link to="/user/submission">Update Information</Link>
              </Button>
              
              {riskScore.status === 'Rejected' && (
                <Button variant="outline" className="w-full">
                  Request Review
                </Button>
              )}
              
              <Button variant="outline" className="w-full">
                Download Report
              </Button>
            </div>

            <div className="mt-8 p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">Improve Your Score</h4>
              <ul className="text-sm space-y-2">
                <li>• Verify your income sources</li>
                <li>• Provide additional documentation</li>
                <li>• Update credit history</li>
                <li>• Resolve outstanding issues</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Assessment History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Date</th>
                  <th className="text-left py-3 px-4 font-medium">Score</th>
                  <th className="text-left py-3 px-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b hover:bg-muted/50">
                  <td className="py-3 px-4">{new Date(riskScore.createdAt).toLocaleDateString()}</td>
                  <td className="py-3 px-4">{riskScore.totalScore}%</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      riskScore.status === 'Approved' ? 'bg-green-100 text-green-800' :
                      riskScore.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {riskScore.status}
                    </span>
                  </td>
                </tr>
                {/* Sample previous entries */}
                <tr className="border-b hover:bg-muted/50">
                  <td className="py-3 px-4">{new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}</td>
                  <td className="py-3 px-4">{riskScore.totalScore - 5}%</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Pending
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserDashboard;

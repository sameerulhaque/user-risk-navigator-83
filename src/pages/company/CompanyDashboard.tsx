
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PageHeader from "@/components/PageHeader";
import { getUserProfiles } from "@/services/api";
import { PaginatedResponse } from "@/types/api";
import { UserProfile } from "@/types/risk";
import RiskScoreBadge from "@/components/RiskScoreBadge";
import LoadingSpinner from "@/components/LoadingSpinner";

const CompanyDashboard = () => {
  const [userData, setUserData] = useState<PaginatedResponse<UserProfile> | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await getUserProfiles(1, 5);
        if (response.isSuccess && response.value) {
          setUserData(response.value);
        } else {
          setError("Failed to load user data");
        }
      } catch (err) {
        setError("An error occurred while fetching data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate risk distribution
  const calculateRiskDistribution = () => {
    if (!userData) return { low: 0, medium: 0, high: 0 };
    
    const users = userData.data;
    return {
      low: users.filter(u => (u.riskScore || 0) < 50).length,
      medium: users.filter(u => (u.riskScore || 0) >= 50 && (u.riskScore || 0) < 70).length,
      high: users.filter(u => (u.riskScore || 0) >= 70).length
    };
  };

  const riskDistribution = calculateRiskDistribution();

  return (
    <div>
      <PageHeader
        title="Company Dashboard"
        description="Overview of risk assessment data and metrics"
      />

      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <div className="text-center text-red-500 py-8">{error}</div>
      ) : (
        <>
          {/* Risk Distribution Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Low Risk</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-3xl font-bold text-risk-low">{riskDistribution.low}</div>
                  <div className="text-sm text-muted-foreground">Users &lt; 50%</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Medium Risk</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-3xl font-bold text-risk-medium">{riskDistribution.medium}</div>
                  <div className="text-sm text-muted-foreground">Users 50-70%</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">High Risk</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-3xl font-bold text-risk-high">{riskDistribution.high}</div>
                  <div className="text-sm text-muted-foreground">Users &gt; 70%</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Users */}
          <Card>
            <CardHeader>
              <CardTitle>Recent User Submissions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium">User</th>
                      <th className="text-left py-3 px-4 font-medium">Submission Date</th>
                      <th className="text-left py-3 px-4 font-medium">Risk Score</th>
                      <th className="text-left py-3 px-4 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userData && userData.data.map((user) => (
                      <tr key={user.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4">
                          <div>
                            <div className="font-medium">{user.name}</div>
                            <div className="text-xs text-muted-foreground">{user.email}</div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {user.submissionDate ? new Date(user.submissionDate).toLocaleDateString() : '-'}
                        </td>
                        <td className="py-3 px-4">
                          {user.riskScore !== undefined ? (
                            <RiskScoreBadge score={user.riskScore} />
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.status === 'Approved' ? 'bg-green-100 text-green-800' :
                            user.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {user.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default CompanyDashboard;

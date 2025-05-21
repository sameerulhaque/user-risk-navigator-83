import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PageHeader from "@/components/PageHeader";
import RiskScoreBadge from "@/components/RiskScoreBadge";
import LoadingSpinner from "@/components/LoadingSpinner";
import { getUserProfiles, updateUserStatus } from "@/services/api";
import { PaginatedResponse } from "@/types/api";
import { UserProfile } from "@/types/risk";
import { Search, Filter, Check, X } from "lucide-react";

const CompanyUsers = () => {
  const [users, setUsers] = useState<PaginatedResponse<UserProfile> | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [scoreRangeFilter, setScoreRangeFilter] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [processing, setProcessing] = useState<Record<number, boolean>>({});
  const pageSize = 10;
  
  const { toast } = useToast();

  const fetchUsers = async (page: number = currentPage) => {
    setLoading(true);
    try {
      const searchQuery: Record<string, string> = {};
      if (statusFilter) searchQuery.status = statusFilter;
      if (scoreRangeFilter) searchQuery.scoreRange = scoreRangeFilter;
      if (searchTerm) searchQuery.search = searchTerm;

      const response = await getUserProfiles(page, pageSize, searchQuery);
      if (response.isSuccess && response.value) {
        setUsers(response.value);
      } else {
        toast({
          title: "Error",
          description: "Failed to load users",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "An error occurred while fetching users",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [statusFilter, scoreRangeFilter]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchUsers(page);
  };

  const handleUpdateStatus = async (userId: number, status: 'Approved' | 'Rejected' | 'Pending') => {
    setProcessing(prev => ({ ...prev, [userId]: true }));
    try {
      const response = await updateUserStatus(userId, status);
      if (response.isSuccess) {
        // Update local state to reflect the change
        if (users) {
          const updatedUsers = users.data.map(user => 
            user.id === userId ? { ...user, status } : user
          );
          setUsers({
            ...users,
            data: updatedUsers
          });
        }
        
        toast({
          title: "Success",
          description: `User status updated to ${status}`,
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to update user status",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "An error occurred while updating status",
        variant: "destructive"
      });
    } finally {
      setProcessing(prev => ({ ...prev, [userId]: false }));
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchUsers(1);
  };

  const renderPagination = () => {
    if (!users || users.totalPages <= 1) return null;

    const pages = [];
    for (let i = 1; i <= Math.min(users.totalPages, 5); i++) {
      pages.push(
        <Button
          key={i}
          variant={currentPage === i ? "default" : "outline"}
          size="sm"
          onClick={() => handlePageChange(i)}
          className={currentPage === i ? "bg-blue-600 hover:bg-blue-700" : "hover:bg-blue-50"}
        >
          {i}
        </Button>
      );
    }

    return (
      <div className="flex justify-center gap-2 mt-6 animate-fade-in">
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage === 1}
          onClick={() => handlePageChange(currentPage - 1)}
          className="hover:bg-blue-50"
        >
          Previous
        </Button>
        {pages}
        {users.totalPages > 5 && (
          <span className="flex items-center text-sm px-2">...</span>
        )}
        {users.totalPages > 5 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(users.totalPages)}
            className="hover:bg-blue-50"
          >
            {users.totalPages}
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage === users.totalPages}
          onClick={() => handlePageChange(currentPage + 1)}
          className="hover:bg-blue-50"
        >
          Next
        </Button>
      </div>
    );
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="User Management"
        description="View and manage all user risk assessments"
      />

      <Card className="mb-6 card-elevated">
        <CardHeader>
          <CardTitle className="text-blue-800">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="border-blue-200">
                  <div className="flex items-center">
                    <Filter className="w-4 h-4 mr-2 text-blue-600" />
                    <SelectValue placeholder="Filter by Status" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all_statuses">All Statuses</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select value={scoreRangeFilter} onValueChange={setScoreRangeFilter}>
                <SelectTrigger className="border-blue-200">
                  <div className="flex items-center">
                    <Filter className="w-4 h-4 mr-2 text-blue-600" />
                    <SelectValue placeholder="Filter by Score Range" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all_scores">All Scores</SelectItem>
                  <SelectItem value="low">Low Risk (0-49%)</SelectItem>
                  <SelectItem value="medium">Medium Risk (50-69%)</SelectItem>
                  <SelectItem value="high">High Risk (70-100%)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  placeholder="Search by name or email"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 border-blue-200"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-600" />
              </div>
              <Button 
                onClick={handleSearch}
                className="bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                Search
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <Card className="card-elevated">
          <CardContent className="pt-6">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-blue-100">
                    <th className="text-left py-3 px-4 font-medium text-blue-800">User</th>
                    <th className="text-left py-3 px-4 font-medium text-blue-800">Submission Date</th>
                    <th className="text-left py-3 px-4 font-medium text-blue-800">Risk Score</th>
                    <th className="text-left py-3 px-4 font-medium text-blue-800">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-blue-800">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users && users.data.length > 0 ? (
                    users.data.map((user) => (
                      <tr key={user.id} className="border-b hover:bg-blue-50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="animate-fade-in">
                            <div className="font-medium">{user.name}</div>
                            <div className="text-xs text-muted-foreground">{user.email}</div>
                          </div>
                        </td>
                        <td className="py-3 px-4 animate-fade-in">
                          {user.submissionDate ? new Date(user.submissionDate).toLocaleDateString() : '-'}
                        </td>
                        <td className="py-3 px-4 animate-fade-in">
                          {user.riskScore !== undefined ? (
                            <RiskScoreBadge score={user.riskScore} />
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="py-3 px-4 animate-fade-in">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.status === 'Approved' ? 'bg-green-100 text-green-800' :
                            user.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {user.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2 animate-fade-in">
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={user.status === 'Approved' || processing[user.id]}
                              onClick={() => handleUpdateStatus(user.id, 'Approved')}
                              className="flex items-center border-green-200 text-green-700 hover:bg-green-50"
                            >
                              <Check className="w-3 h-3 mr-1" /> Approve
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={user.status === 'Rejected' || processing[user.id]}
                              onClick={() => handleUpdateStatus(user.id, 'Rejected')}
                              className="flex items-center border-red-200 text-red-700 hover:bg-red-50"
                            >
                              <X className="w-3 h-3 mr-1" /> Reject
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-muted-foreground">
                        No users found matching the filters
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {renderPagination()}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CompanyUsers;


import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { History, FileText, Settings } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import LoadingSpinner from "@/components/LoadingSpinner";
import { getVersionHistory } from "@/services/api";
import { VersionHistory as VersionHistoryType } from "@/types/risk";

const VersionHistory = () => {
  const [activeTab, setActiveTab] = useState<string>("configuration");
  const [versions, setVersions] = useState<VersionHistoryType[]>([]);
  const [filteredVersions, setFilteredVersions] = useState<VersionHistoryType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [entityFilter, setEntityFilter] = useState<string>("all");
  const { toast } = useToast();

  useEffect(() => {
    const fetchVersionHistory = async () => {
      setLoading(true);
      try {
        const response = await getVersionHistory();
        if (response.isSuccess && response.value) {
          setVersions(response.value);
          filterVersions(response.value, activeTab, entityFilter);
        } else {
          toast({
            title: "Error",
            description: "Failed to fetch version history",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error('Failed to fetch version history:', error);
        toast({
          title: "Error",
          description: "An error occurred while fetching version history",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchVersionHistory();
  }, [toast]);

  const filterVersions = (versions: VersionHistoryType[], tab: string, entityId: string) => {
    let filtered = versions.filter(v => v.entityType === tab);
    
    if (entityId !== "all") {
      filtered = filtered.filter(v => v.entityId === parseInt(entityId));
    }
    
    setFilteredVersions(filtered);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setEntityFilter("all");
    filterVersions(versions, tab, "all");
  };

  const handleEntityFilterChange = (value: string) => {
    setEntityFilter(value);
    filterVersions(versions, activeTab, value);
  };

  // Get unique entity IDs for filtering
  const getUniqueEntityIds = () => {
    return Array.from(new Set(versions.filter(v => v.entityType === activeTab).map(v => v.entityId)));
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Version History"
        description="Track and view the history of all configurations and user submissions"
        icon={<History className="h-6 w-6" />}
      />

      <Card className="shadow-md mb-6">
        <CardHeader className="pb-4">
          <CardTitle>Version Timeline</CardTitle>
          <CardDescription>
            View the complete history of changes made to configurations and submissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
            <div className="flex items-center justify-between">
              <TabsList>
                <TabsTrigger value="configuration" className="flex items-center">
                  <Settings className="mr-2 h-4 w-4" />
                  Configurations
                </TabsTrigger>
                <TabsTrigger value="submission" className="flex items-center">
                  <FileText className="mr-2 h-4 w-4" />
                  Submissions
                </TabsTrigger>
              </TabsList>

              <Select value={entityFilter} onValueChange={handleEntityFilterChange}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filter by ID" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="all">All {activeTab === "configuration" ? "Configurations" : "Submissions"}</SelectItem>
                    {getUniqueEntityIds().map(id => (
                      <SelectItem key={id} value={id.toString()}>
                        {activeTab === "configuration" ? "Config" : "Submission"} #{id}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <TabsContent value="configuration" className="mt-0 p-0">
              {loading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner size="lg" />
                </div>
              ) : filteredVersions.length > 0 ? (
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Config ID</TableHead>
                        <TableHead>Version</TableHead>
                        <TableHead>Changes</TableHead>
                        <TableHead>Modified By</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredVersions.map((item) => (
                        <TableRow key={item.id} className="hover:bg-blue-50/50">
                          <TableCell className="font-medium">{item.entityId}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-blue-50">v{item.version}</Badge>
                          </TableCell>
                          <TableCell className="max-w-xs truncate">{item.changes}</TableCell>
                          <TableCell>{item.userName}</TableCell>
                          <TableCell>{new Date(item.timestamp).toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8 border rounded-md bg-gray-50">
                  <p className="text-gray-500">No configuration versions found</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="submission" className="mt-0 p-0">
              {loading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner size="lg" />
                </div>
              ) : filteredVersions.length > 0 ? (
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Submission ID</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Version</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredVersions.map((item) => (
                        <TableRow key={item.id} className="hover:bg-blue-50/50">
                          <TableCell className="font-medium">{item.entityId}</TableCell>
                          <TableCell>{item.userName}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-blue-50">v{item.version}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={item.changes.includes("Approved") ? "success" : 
                                     item.changes.includes("Rejected") ? "destructive" : "default"}
                              className="capitalize"
                            >
                              {item.changes.includes("Approved") ? "Approved" : 
                               item.changes.includes("Rejected") ? "Rejected" : "Pending"}
                            </Badge>
                          </TableCell>
                          <TableCell>{new Date(item.timestamp).toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8 border rounded-md bg-gray-50">
                  <p className="text-gray-500">No submission versions found</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default VersionHistory;

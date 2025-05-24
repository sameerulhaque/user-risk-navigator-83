
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, Plus, Edit, Trash2 } from "lucide-react";
import { getVersionHistoryDetails } from "@/services/api";
import LoadingSpinner from "@/components/LoadingSpinner";

interface VersionDetailsModalProps {
  versionId: number;
  version: string;
  entityType: string;
  children: React.ReactNode;
}

const VersionDetailsModal = ({ versionId, version, entityType, children }: VersionDetailsModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [details, setDetails] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && !details) {
      fetchVersionDetails();
    }
  }, [isOpen]);

  const fetchVersionDetails = async () => {
    setLoading(true);
    try {
      const response = await getVersionHistoryDetails(versionId);
      if (response.isSuccess && response.value) {
        setDetails(response.value);
      }
    } catch (error) {
      console.error('Failed to fetch version details:', error);
    } finally {
      setLoading(false);
    }
  };

  const ChangeItem = ({ icon: Icon, label, items, type }: any) => (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4" />
        <span className="font-medium">{label}</span>
        <Badge variant="outline">{items.length}</Badge>
      </div>
      {items.length > 0 && (
        <div className="ml-6 space-y-1">
          {items.map((item: any, index: number) => (
            <div key={index} className="text-sm text-gray-600">
              <span className="font-medium">{item.name}</span>
              {item.changes && (
                <div className="ml-2 text-xs text-gray-500">
                  {item.changes.map((change: string, i: number) => (
                    <div key={i}>• {change}</div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Version Details - v{version}
          </DialogTitle>
          <DialogDescription>
            Detailed changes made in this {entityType} version
          </DialogDescription>
        </DialogHeader>
        
        {loading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner size="lg" />
          </div>
        ) : details ? (
          <Tabs defaultValue="sections" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="sections">Sections</TabsTrigger>
              <TabsTrigger value="fields">Fields</TabsTrigger>
            </TabsList>
            
            <TabsContent value="sections" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Section Changes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ChangeItem
                    icon={Plus}
                    label="Added Sections"
                    items={details.changes.sections.added}
                    type="added"
                  />
                  <ChangeItem
                    icon={Edit}
                    label="Modified Sections"
                    items={details.changes.sections.modified}
                    type="modified"
                  />
                  <ChangeItem
                    icon={Trash2}
                    label="Removed Sections"
                    items={details.changes.sections.removed}
                    type="removed"
                  />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="fields" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Field Changes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ChangeItem
                    icon={Plus}
                    label="Added Fields"
                    items={details.changes.fields.added}
                    type="added"
                  />
                  <ChangeItem
                    icon={Edit}
                    label="Modified Fields"
                    items={details.changes.fields.modified}
                    type="modified"
                  />
                  <ChangeItem
                    icon={Trash2}
                    label="Removed Fields"
                    items={details.changes.fields.removed}
                    type="removed"
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No detailed information available for this version.
          </div>
        )}
        
        <div className="flex justify-end">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VersionDetailsModal;

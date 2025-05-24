
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Shield, Plus, Edit, Trash2, Upload, Search, RefreshCw } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import LoadingSpinner from "@/components/LoadingSpinner";
import ExcelImportModal from "@/components/ExcelImportModal";
import { 
  getSanctionList, 
  addSanctionEntry, 
  updateSanctionEntry, 
  deleteSanctionEntry, 
  importSanctionListFromFile 
} from "@/services/api";

const SanctionList = () => {
  const [sanctions, setSanctions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState({ name: "", type: "", country: "" });
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<any>(null);
  const [formData, setFormData] = useState({ name: "", type: "Individual", country: "", status: "Active" });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { toast } = useToast();

  useEffect(() => {
    fetchSanctions();
  }, [currentPage, searchQuery]);

  const fetchSanctions = async () => {
    setLoading(true);
    try {
      const response = await getSanctionList(currentPage, 10, searchQuery);
      if (response.isSuccess && response.value) {
        setSanctions(response.value.data);
        setTotalPages(response.value.totalPages);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch sanction list",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    try {
      const response = await addSanctionEntry(formData);
      if (response.isSuccess) {
        toast({
          title: "Success",
          description: "Sanction entry added successfully"
        });
        setIsAddModalOpen(false);
        setFormData({ name: "", type: "Individual", country: "", status: "Active" });
        fetchSanctions();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add sanction entry",
        variant: "destructive"
      });
    }
  };

  const handleEdit = async () => {
    if (!editingEntry) return;
    
    try {
      const response = await updateSanctionEntry(editingEntry.id, formData);
      if (response.isSuccess) {
        toast({
          title: "Success",
          description: "Sanction entry updated successfully"
        });
        setEditingEntry(null);
        setFormData({ name: "", type: "Individual", country: "", status: "Active" });
        fetchSanctions();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update sanction entry",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await deleteSanctionEntry(id);
      if (response.isSuccess) {
        toast({
          title: "Success",
          description: "Sanction entry deleted successfully"
        });
        fetchSanctions();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete sanction entry",
        variant: "destructive"
      });
    }
  };

  const handleImport = async (file: File) => {
    try {
      const response = await importSanctionListFromFile(file);
      if (response.isSuccess) {
        toast({
          title: "Success",
          description: `Imported ${response.value?.length || 0} entries successfully`
        });
        fetchSanctions();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to import sanction list",
        variant: "destructive"
      });
    }
  };

  const openEditModal = (entry: any) => {
    setEditingEntry(entry);
    setFormData({ ...entry });
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Sanction List Management"
        description="Manage and monitor sanction list entries for compliance"
        icon={<Shield className="h-6 w-6" />}
      />

      <Card className="shadow-md mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Sanction Entries</span>
            <div className="flex gap-2">
              <ExcelImportModal
                title="Import Sanction List"
                description="Upload an Excel or CSV file to import sanction entries"
                onImport={handleImport}
              >
                <Button variant="outline" size="sm">
                  <Upload className="mr-2 h-4 w-4" />
                  Import
                </Button>
              </ExcelImportModal>
              
              <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Entry
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Sanction Entry</DialogTitle>
                    <DialogDescription>
                      Add a new entry to the sanction list
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Enter name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="type">Type</Label>
                      <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Individual">Individual</SelectItem>
                          <SelectItem value="Entity">Entity</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="country">Country</Label>
                      <Input
                        id="country"
                        value={formData.country}
                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                        placeholder="Country code (e.g., US, RU)"
                      />
                    </div>
                    <div>
                      <Label htmlFor="status">Status</Label>
                      <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Active">Active</SelectItem>
                          <SelectItem value="Inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                    <Button onClick={handleAdd}>Add Entry</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardTitle>
          <CardDescription>
            Search and filter sanction list entries
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <Input
                placeholder="Search by name..."
                value={searchQuery.name}
                onChange={(e) => setSearchQuery({ ...searchQuery, name: e.target.value })}
              />
            </div>
            <Select value={searchQuery.type} onValueChange={(value) => setSearchQuery({ ...searchQuery, type: value })}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Types</SelectItem>
                <SelectItem value="Individual">Individual</SelectItem>
                <SelectItem value="Entity">Entity</SelectItem>
              </SelectContent>
            </Select>
            <Input
              placeholder="Country"
              className="w-32"
              value={searchQuery.country}
              onChange={(e) => setSearchQuery({ ...searchQuery, country: e.target.value })}
            />
            <Button variant="outline" onClick={fetchSanctions}>
              <Search className="h-4 w-4" />
            </Button>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Country</TableHead>
                    <TableHead>Date Added</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sanctions.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="font-medium">{entry.name}</TableCell>
                      <TableCell>{entry.type}</TableCell>
                      <TableCell>{entry.country}</TableCell>
                      <TableCell>{entry.dateAdded}</TableCell>
                      <TableCell>
                        <Badge variant={entry.status === "Active" ? "default" : "secondary"}>
                          {entry.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Dialog open={editingEntry?.id === entry.id} onOpenChange={(open) => !open && setEditingEntry(null)}>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" onClick={() => openEditModal(entry)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Edit Sanction Entry</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label htmlFor="edit-name">Name</Label>
                                  <Input
                                    id="edit-name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="edit-type">Type</Label>
                                  <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="Individual">Individual</SelectItem>
                                      <SelectItem value="Entity">Entity</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div>
                                  <Label htmlFor="edit-country">Country</Label>
                                  <Input
                                    id="edit-country"
                                    value={formData.country}
                                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="edit-status">Status</Label>
                                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="Active">Active</SelectItem>
                                      <SelectItem value="Inactive">Inactive</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                              <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={() => setEditingEntry(null)}>Cancel</Button>
                                <Button onClick={handleEdit}>Update</Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                          
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Sanction Entry</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this sanction entry? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(entry.id)}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SanctionList;

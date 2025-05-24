import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Edit, Trash2, Upload, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ExcelImportModal from "@/components/ExcelImportModal";
import PageHeader from "@/components/PageHeader";
import { getSanctionList, addSanctionEntry, updateSanctionEntry, deleteSanctionEntry, importSanctionListFromFile } from "@/services/api";

interface SanctionEntry {
  id: number;
  name: string;
  type: string;
  country: string;
  dateAdded: string;
  status: string;
}

const SanctionListManagement = () => {
  const [page, setPage] = useState(1);
  const [searchName, setSearchName] = useState("");
  const [searchType, setSearchType] = useState("");
  const [searchCountry, setSearchCountry] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<SanctionEntry | null>(null);
  const [newEntry, setNewEntry] = useState({
    name: "",
    type: "",
    country: "",
    status: "Active"
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const pageSize = 10;

  const searchQuery = {
    name: searchName || undefined,
    type: (searchType && searchType !== "all") ? searchType : undefined,
    country: searchCountry || undefined
  };

  const { data: sanctionData, isLoading } = useQuery({
    queryKey: ['sanctions', page, pageSize, searchQuery],
    queryFn: () => getSanctionList(page, pageSize, searchQuery),
  });

  const addMutation = useMutation({
    mutationFn: addSanctionEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sanctions'] });
      toast({ title: "Success", description: "Sanction entry added successfully" });
      setIsAddModalOpen(false);
      setNewEntry({ name: "", type: "", country: "", status: "Active" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to add sanction entry", variant: "destructive" });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, entry }: { id: number; entry: any }) => updateSanctionEntry(id, entry),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sanctions'] });
      toast({ title: "Success", description: "Sanction entry updated successfully" });
      setIsEditModalOpen(false);
      setEditingEntry(null);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update sanction entry", variant: "destructive" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteSanctionEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sanctions'] });
      toast({ title: "Success", description: "Sanction entry deleted successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete sanction entry", variant: "destructive" });
    }
  });

  const handleImport = async (file: File) => {
    try {
      const response = await importSanctionListFromFile(file);
      if (response.isSuccess) {
        queryClient.invalidateQueries({ queryKey: ['sanctions'] });
        toast({ title: "Success", description: `Imported ${response.value?.length || 0} entries successfully` });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to import sanction list", variant: "destructive" });
    }
  };

  const handleEdit = (entry: SanctionEntry) => {
    setEditingEntry(entry);
    setIsEditModalOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this entry?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleAddSubmit = () => {
    addMutation.mutate(newEntry);
  };

  const handleUpdateSubmit = () => {
    if (editingEntry) {
      updateMutation.mutate({ id: editingEntry.id, entry: editingEntry });
    }
  };

  const sanctions = sanctionData?.value?.data || [];
  const totalCount = sanctionData?.value?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Sanction List Management"
        description="Manage and monitor sanction lists for compliance"
      />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Sanction Entries</CardTitle>
              <CardDescription>Search, add, edit, and import sanction list entries</CardDescription>
            </div>
            <div className="flex gap-2">
              <ExcelImportModal
                title="Import Sanction List"
                description="Import sanction entries from Excel or CSV file"
                onImport={handleImport}
                acceptedFileTypes=".xlsx,.xls,.csv"
              >
                <Button variant="outline" size="sm">
                  <Upload className="h-4 w-4 mr-2" />
                  Import
                </Button>
              </ExcelImportModal>
              
              <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Entry
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Sanction Entry</DialogTitle>
                    <DialogDescription>Add a new entry to the sanction list</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        value={newEntry.name}
                        onChange={(e) => setNewEntry({ ...newEntry, name: e.target.value })}
                        placeholder="Enter name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="type">Type</Label>
                      <Select value={newEntry.type} onValueChange={(value) => setNewEntry({ ...newEntry, type: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
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
                        value={newEntry.country}
                        onChange={(e) => setNewEntry({ ...newEntry, country: e.target.value })}
                        placeholder="Country code (e.g., US, RU)"
                      />
                    </div>
                    <div>
                      <Label htmlFor="status">Status</Label>
                      <Select value={newEntry.status} onValueChange={(value) => setNewEntry({ ...newEntry, status: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Active">Active</SelectItem>
                          <SelectItem value="Inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                      <Button onClick={handleAddSubmit} disabled={addMutation.isPending}>
                        {addMutation.isPending ? "Adding..." : "Add Entry"}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search-name">Name</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="search-name"
                  placeholder="Search by name"
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="search-type">Type</Label>
              <Select value={searchType} onValueChange={setSearchType}>
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  <SelectItem value="Individual">Individual</SelectItem>
                  <SelectItem value="Entity">Entity</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="search-country">Country</Label>
              <Input
                id="search-country"
                placeholder="Country code"
                value={searchCountry}
                onChange={(e) => setSearchCountry(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchName("");
                  setSearchType("");
                  setSearchCountry("");
                }}
              >
                Clear Filters
              </Button>
            </div>
          </div>

          {/* Table */}
          <div className="border rounded-lg">
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
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4">Loading...</TableCell>
                  </TableRow>
                ) : sanctions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4">No sanction entries found</TableCell>
                  </TableRow>
                ) : (
                  sanctions.map((entry: SanctionEntry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="font-medium">{entry.name}</TableCell>
                      <TableCell>{entry.type}</TableCell>
                      <TableCell>{entry.country}</TableCell>
                      <TableCell>{entry.dateAdded}</TableCell>
                      <TableCell>
                        <Badge variant={entry.status === 'Active' ? 'default' : 'secondary'}>
                          {entry.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(entry)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(entry.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-700">
                Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, totalCount)} of {totalCount} entries
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Sanction Entry</DialogTitle>
            <DialogDescription>Update the sanction entry details</DialogDescription>
          </DialogHeader>
          {editingEntry && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  value={editingEntry.name}
                  onChange={(e) => setEditingEntry({ ...editingEntry, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-type">Type</Label>
                <Select value={editingEntry.type} onValueChange={(value) => setEditingEntry({ ...editingEntry, type: value })}>
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
                  value={editingEntry.country}
                  onChange={(e) => setEditingEntry({ ...editingEntry, country: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-status">Status</Label>
                <Select value={editingEntry.status} onValueChange={(value) => setEditingEntry({ ...editingEntry, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
                <Button onClick={handleUpdateSubmit} disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? "Updating..." : "Update Entry"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SanctionListManagement;

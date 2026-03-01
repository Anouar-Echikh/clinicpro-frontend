import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Plus,
  Filter,
  MoreVertical,
  Settings,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  Eye,
  Copy,
  RefreshCw,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import AddMethodologyModal from "@/components/modals/AddMethodologyModal";
import ViewMethodologyModal from "@/components/modals/ViewMethodologyModal";
import EditMethodologyModal from "@/components/modals/EditMethodologyModal";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import api from "@/services/api";
import { TestMethodology } from "@/types";

interface MethodologyStats {
  totalMethodologies: number;
  activeMethodologies: number;
  inactiveMethodologies: number;
  categoriesCount: number;
  categoryStats: Array<{
    _id: string;
    count: number;
    activeCount: number;
  }>;
}

const Methodology = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [methodologies, setMethodologies] = useState<TestMethodology[]>([]);
  const [stats, setStats] = useState<MethodologyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Modal states
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedMethodologyId, setSelectedMethodologyId] = useState<string | null>(null);
  const [selectedMethodologyName, setSelectedMethodologyName] = useState<string>("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [duplicateLoading, setDuplicateLoading] = useState<string | null>(null);

  // Fetch methodologies data
  const fetchMethodologies = async () => {
    try {
      setLoading(true);
      const params: any = {
        page,
        limit: 20,
      };

      if (searchTerm) params.search = searchTerm;
      if (selectedCategory !== "all") params.category = selectedCategory;
      if (selectedStatus !== "all") params.status = selectedStatus;

      const response = await api.getTestMethodologies(params);
      setMethodologies(response.data.methodologies);
      setTotalPages(response.data.pagination.pages);
    } catch (error) {
      console.error("Error fetching methodologies:", error);
      toast({
        title: "Error",
        description: "Failed to load methodologies. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch stats
  const fetchStats = async () => {
    try {
      const statsData = await api.getTestMethodologyStats();
      setStats(statsData);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setPage(1); // Reset to first page when search changes
      fetchMethodologies();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, selectedCategory, selectedStatus]);

  useEffect(() => {
    fetchMethodologies();
  }, [page]);

  useEffect(() => {
    fetchStats();
  }, []);

  const categories = [
    "all",
    ...Array.from(new Set(methodologies.map((method) => method.category))),
  ];

  const handleViewMethodology = (methodId: string) => {
    setSelectedMethodologyId(methodId);
    setViewModalOpen(true);
  };

  const handleEditMethodology = (methodId: string) => {
    setSelectedMethodologyId(methodId);
    setEditModalOpen(true);
  };

  const handleDuplicateMethodology = async (methodId: string) => {
    try {
      setDuplicateLoading(methodId);
      const duplicated = await api.duplicateTestMethodology(methodId);
      toast({
        title: "Success",
        description: `Methodology "${duplicated.name}" has been duplicated successfully`,
      });
      fetchMethodologies();
      fetchStats();
    } catch (error) {
      console.error("Error duplicating methodology:", error);
      toast({
        title: "Error",
        description: "Failed to duplicate methodology. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDuplicateLoading(null);
    }
  };

  const handleDeleteMethodology = (methodId: string, methodName: string) => {
    setSelectedMethodologyId(methodId);
    setSelectedMethodologyName(methodName);
    setDeleteConfirmOpen(true);
  };

  const confirmDeleteMethodology = async () => {
    if (!selectedMethodologyId) return;

    try {
      setDeleteLoading(true);
      await api.deleteTestMethodology(selectedMethodologyId);
      toast({
        title: "Success",
        description: `Methodology "${selectedMethodologyName}" has been deleted successfully`,
      });
      fetchMethodologies();
      fetchStats();
      setDeleteConfirmOpen(false);
    } catch (error) {
      console.error("Error deleting methodology:", error);
      toast({
        title: "Error",
        description: "Failed to delete methodology. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleToggleStatus = async (methodId: string) => {
    try {
      await api.toggleTestMethodologyStatus(methodId);
      toast({
        title: "Success",
        description: "Methodology status has been updated successfully",
      });
      fetchMethodologies();
      fetchStats();
    } catch (error) {
      console.error("Error toggling methodology status:", error);
      toast({
        title: "Error",
        description: "Failed to update methodology status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRefresh = () => {
    fetchMethodologies();
    fetchStats();
  };

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight truncate">Test Methodologies</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Manage laboratory test methodologies and their configurations
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={loading}
            className="h-9"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          <AddMethodologyModal 
            trigger={
              <Button size="sm" className="h-9">
                <Plus className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Add Methodology</span>
                <span className="sm:hidden">Add</span>
              </Button>
            }
            onMethodologyAdded={() => {
              fetchMethodologies();
              fetchStats();
            }}
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Methodologies</CardTitle>
            <Settings className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{stats?.totalMethodologies || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.activeMethodologies || 0} active
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Active</CardTitle>
            <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{stats?.activeMethodologies || 0}</div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Categories</CardTitle>
            <Filter className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{stats?.categoriesCount || 0}</div>
            <p className="text-xs text-muted-foreground">Different categories</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Inactive</CardTitle>
            <XCircle className="h-3 w-3 sm:h-4 sm:w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{stats?.inactiveMethodologies || 0}</div>
            <p className="text-xs text-muted-foreground">Currently inactive</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4 sm:pt-6">
          <div className="space-y-3 sm:space-y-0 sm:flex sm:gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search methodologies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 h-9 sm:h-10"
                />
              </div>
            </div>
            <div className="flex flex-col xs:flex-row gap-2">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full xs:w-[160px] sm:w-[180px] h-9 sm:h-10">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.slice(1).map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-full xs:w-[100px] sm:w-[120px] h-9 sm:h-10">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Methodologies Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Methodologies ({stats?.totalMethodologies || 0})</CardTitle>
          <CardDescription className="text-sm">
            Manage your laboratory test methodologies and their properties.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              <span className="ml-2">Loading methodologies...</span>
            </div>
          ) : methodologies.length === 0 ? (
            <div className="text-center py-12">
              <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">
                {searchTerm || selectedCategory !== "all" || selectedStatus !== "all" 
                  ? "No methodologies found matching your filters." 
                  : "No methodologies found. Add your first methodology to get started."}
              </p>
                             <AddMethodologyModal 
                 trigger={
                   <Button>
                     <Plus className="h-4 w-4 mr-2" />
                     Add Your First Methodology
                   </Button>
                 }
               />
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="min-w-[200px]">Methodology Details</TableHead>
                  <TableHead className="min-w-[120px] hidden sm:table-cell">Category</TableHead>
                  <TableHead className="min-w-[100px] hidden md:table-cell">Equipment</TableHead>
                  <TableHead className="min-w-[80px] hidden lg:table-cell">Sample Volume</TableHead>
                  <TableHead className="min-w-[80px]">Status</TableHead>
                  <TableHead className="text-right min-w-[70px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <div className="space-y-2">
                          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                          <div className="h-3 bg-gray-100 rounded animate-pulse w-3/4"></div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <div className="h-6 bg-gray-100 rounded animate-pulse w-20"></div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="h-3 bg-gray-100 rounded animate-pulse w-16"></div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="h-3 bg-gray-100 rounded animate-pulse w-12"></div>
                      </TableCell>
                      <TableCell>
                        <div className="h-6 bg-gray-100 rounded animate-pulse w-16"></div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="h-8 w-8 bg-gray-100 rounded animate-pulse ml-auto"></div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : methodologies.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="text-muted-foreground">
                        No methodologies found. {searchTerm || selectedCategory !== "all" || selectedStatus !== "all" 
                          ? "Try adjusting your filters." 
                          : "Add your first methodology to get started."}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  methodologies.map((methodology) => (
                    <TableRow key={methodology._id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium text-sm sm:text-base">{methodology.name}</div>
                          <div className="text-xs sm:text-sm text-muted-foreground">
                            Code: {methodology.code}
                          </div>
                          {methodology.description && (
                            <div className="text-xs text-muted-foreground max-w-[180px] truncate">
                              {methodology.description}
                            </div>
                          )}
                          {/* Mobile-only additional info */}
                          <div className="sm:hidden space-y-1 pt-1 border-t border-muted">
                            <div className="text-xs text-muted-foreground">
                              Category: {methodology.category}
                            </div>
                            {methodology.equipment && (
                              <div className="text-xs text-muted-foreground">
                                Equipment: {methodology.equipment}
                              </div>
                            )}
                            {methodology.principles && (
                              <div className="text-xs text-muted-foreground">
                                Principles: {methodology.principles.substring(0, 30)}...
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge variant="outline" className="text-xs">
                          {methodology.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <span className="text-sm">{methodology.equipment || "N/A"}</span>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <span className="text-sm">{methodology.sampleVolume || "N/A"}</span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={methodology.isActive ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {methodology.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="h-8">
                              <MoreVertical className="h-4 w-4 mr-1" />
                              Actions
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewMethodology(methodology._id)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditMethodology(methodology._id)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Methodology
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDuplicateMethodology(methodology._id)}
                              disabled={duplicateLoading === methodology._id}
                            >
                              <Copy className="h-4 w-4 mr-2" />
                              {duplicateLoading === methodology._id ? "Duplicating..." : "Duplicate"}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleStatus(methodology._id)}>
                              {methodology.isActive ? "Deactivate" : "Activate"}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteMethodology(methodology._id, methodology.name)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4 p-4">
            {methodologies.map((methodology) => (
              <div
                key={methodology._id}
                className="border rounded-lg p-4 space-y-3 bg-white shadow-sm"
              >
                {/* Header with Methodology Name and Status */}
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-sm truncate">
                      {methodology.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Code: {methodology.code}
                    </div>
                  </div>
                  <Badge
                    variant={methodology.isActive ? "default" : "secondary"}
                    className="text-xs ml-2"
                  >
                    {methodology.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>

                {/* Description */}
                {methodology.description && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                      Description
                    </div>
                    <div className="text-sm text-gray-900">
                      {methodology.description}
                    </div>
                  </div>
                )}

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <div className="text-xs text-gray-500 uppercase tracking-wide">
                      Category
                    </div>
                    <Badge variant="outline" className="text-xs w-fit">
                      {methodology.category}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-gray-500 uppercase tracking-wide">
                      Equipment
                    </div>
                    <div className="text-sm text-gray-900">
                      {methodology.equipment || "N/A"}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <div className="text-xs text-gray-500 uppercase tracking-wide">
                      Principles
                    </div>
                    <div className="text-sm text-gray-900">
                      {methodology.principles ? methodology.principles.substring(0, 50) + "..." : "N/A"}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-gray-500 uppercase tracking-wide">
                      Status
                    </div>
                    <div className="flex items-center space-x-2">
                      {methodology.isActive ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                      <span className="text-sm text-gray-900">
                        {methodology.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="text-xs text-gray-400">
                    ID: {methodology._id.slice(-8)}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <MoreVertical className="h-4 w-4 mr-1" />
                        Actions
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleViewMethodology(methodology._id)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEditMethodology(methodology._id)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Methodology
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDuplicateMethodology(methodology._id)}
                        disabled={duplicateLoading === methodology._id}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        {duplicateLoading === methodology._id ? "Duplicating..." : "Duplicate"}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleToggleStatus(methodology._id)}>
                        {methodology.isActive ? "Deactivate" : "Activate"}
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDeleteMethodology(methodology._id, methodology.name)}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <Card>
          <CardContent className="pt-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs sm:text-sm text-muted-foreground order-2 sm:order-1">
                Showing {((page - 1) * 20) + 1} to {Math.min(page * 20, methodologies.length)} methodologies
              </div>
              <div className="flex items-center space-x-2 order-1 sm:order-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="h-8"
                >
                  Previous
                </Button>
                <div className="text-xs sm:text-sm px-2">
                  Page {page} of {totalPages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages}
                  className="h-8"
                >
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modals */}
      <ViewMethodologyModal
        open={viewModalOpen}
        onOpenChange={setViewModalOpen}
        methodologyId={selectedMethodologyId}
      />

      <EditMethodologyModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        methodologyId={selectedMethodologyId}
        onMethodologyUpdated={() => {
          fetchMethodologies();
          fetchStats();
        }}
      />

      <ConfirmationDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Delete Methodology"
        description={`Are you sure you want to delete "${selectedMethodologyName}"? This action cannot be undone.`}
        onConfirm={confirmDeleteMethodology}
        loading={deleteLoading}
        destructive
      />
    </div>
  );
};

export default Methodology;

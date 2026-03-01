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
  MoreVertical,
  TestTube,
  Droplets,
  FlaskConical,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  Eye,
  AlertTriangle,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import AddSampleTypeModal from "@/components/modals/AddSampleTypeModal";
import { SampleType as ISampleType } from "@/types";
import { 
  useSampleTypes, 
  useSampleTypeStats, 
  useDeleteSampleType, 
  useToggleSampleTypeStatus 
} from "@/hooks/useApi";

const SampleType = () => {
  // State management
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSampleType, setEditingSampleType] = useState<ISampleType | null>(null);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1); // Reset to first page when searching
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // API parameters
  const getApiParams = () => ({
    page: currentPage,
    limit: pageSize,
    ...(debouncedSearch && { search: debouncedSearch }),
    ...(selectedCategory !== 'all' && { category: selectedCategory }),
    ...(selectedStatus !== 'all' && { status: selectedStatus }),
  });

  // API Hooks
  const { 
    data: sampleTypesResponse, 
    isLoading, 
    error,
    refetch 
  } = useSampleTypes(getApiParams());

  const { 
    data: stats,
    isLoading: statsLoading
  } = useSampleTypeStats();

  const deleteMutation = useDeleteSampleType();
  const toggleStatusMutation = useToggleSampleTypeStatus();

  // Extract data from API response
  const sampleTypes = sampleTypesResponse?.data?.sampleTypes || [];
  const pagination = sampleTypesResponse?.data?.pagination;
  const totalPages = pagination?.pages || 1;

  // Available categories for filter
  const categories = [
    "all",
    "blood",
    "urine", 
    "body_fluid",
    "tissue",
    "swab",
    "other"
  ];

  // Helper functions
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "blood":
        return <Droplets className="h-4 w-4 text-red-600" />;
      case "urine":
        return <TestTube className="h-4 w-4 text-yellow-600" />;
      case "body_fluid":
        return <FlaskConical className="h-4 w-4 text-blue-600" />;
      case "tissue":
        return <TestTube className="h-4 w-4 text-green-600" />;
      case "swab":
        return <TestTube className="h-4 w-4 text-purple-600" />;
      default:
        return <TestTube className="h-4 w-4 text-gray-600" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "blood":
        return "bg-red-100 text-red-800";
      case "urine":
        return "bg-yellow-100 text-yellow-800";
      case "body_fluid":
        return "bg-blue-100 text-blue-800";
      case "tissue":
        return "bg-green-100 text-green-800";
      case "swab":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "body_fluid":
        return "Body Fluid";
      case "swab":
        return "Swab";
      default:
        return category.charAt(0).toUpperCase() + category.slice(1);
    }
  };

  // CRUD operations
  const handleEdit = (sampleType: ISampleType) => {
    setEditingSampleType(sampleType);
    setIsModalOpen(true);
  };

  const handleDelete = async (sampleId: string) => {
    if (!confirm('Are you sure you want to delete this sample type?')) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(sampleId);
      toast({
        title: "Success",
        description: "Sample type deleted successfully",
      });
      refetch();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to delete sample type",
        variant: "destructive",
      });
    }
  };

  const handleToggleStatus = async (sampleId: string) => {
    try {
      await toggleStatusMutation.mutateAsync(sampleId);
      toast({
        title: "Success",
        description: "Sample type status updated successfully",
      });
      refetch();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to update sample type status",
        variant: "destructive",
      });
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingSampleType(null);
    refetch(); // Refresh data when modal closes
  };

  const handleModalSuccess = () => {
    refetch();
    handleModalClose();
  };

  const handleRefresh = () => {
    refetch();
  };

  // Handle loading and error states
  if (error && sampleTypes.length === 0) {
    return (
      <div className="space-y-6">
        <div className="text-center py-10">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Error Loading Sample Types
          </h2>
          <p className="text-gray-600 mb-4">
            Failed to load sample type data. Please try again.
          </p>
          <Button onClick={() => refetch()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight truncate">Sample Types</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Manage laboratory sample types and their configurations
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={isLoading}
            className="h-9"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          <AddSampleTypeModal 
            trigger={
              <Button size="sm" className="h-9">
                <Plus className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Add Sample Type</span>
                <span className="sm:hidden">Add</span>
              </Button>
            }
            onSuccess={handleModalSuccess}
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Sample Types</CardTitle>
            <TestTube className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{stats?.totalSampleTypes || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.activeSampleTypes || 0} active
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Active</CardTitle>
            <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{stats?.activeSampleTypes || 0}</div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Blood Samples</CardTitle>
            <Droplets className="h-3 w-3 sm:h-4 sm:w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{sampleTypes.filter(st => st.category === 'blood').length}</div>
            <p className="text-xs text-muted-foreground">Blood-based</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Other Types</CardTitle>
            <FlaskConical className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{sampleTypes.filter(st => st.category !== 'blood').length}</div>
            <p className="text-xs text-muted-foreground">Non-blood</p>
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
                  placeholder="Search sample types..."
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
                      {getCategoryLabel(category)}
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

      {/* Sample Types Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Sample Types ({stats?.totalSampleTypes || 0})</CardTitle>
          <CardDescription className="text-sm">
            Manage your laboratory sample types and their properties.
          </CardDescription>
        </CardHeader>
                  <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Loading sample types...</span>
            </div>
          ) : sampleTypes.length === 0 ? (
            <div className="text-center py-12">
              <TestTube className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">
                {debouncedSearch || selectedCategory !== "all" || selectedStatus !== "all" 
                  ? "No sample types found matching your filters." 
                  : "No sample types found. Add your first sample type to get started."}
              </p>
              <AddSampleTypeModal 
                trigger={
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Sample Type
                  </Button>
                }
                onSuccess={handleModalSuccess}
              />
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="min-w-[200px]">Sample Type Details</TableHead>
                  <TableHead className="min-w-[120px] hidden sm:table-cell">Category</TableHead>
                  <TableHead className="min-w-[100px] hidden md:table-cell">Collection</TableHead>
                  <TableHead className="min-w-[80px] hidden lg:table-cell">Storage</TableHead>
                  <TableHead className="min-w-[80px]">Status</TableHead>
                  <TableHead className="text-right min-w-[70px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
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
                ) : sampleTypes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="text-muted-foreground">
                        No sample types found. {debouncedSearch || selectedCategory !== "all" || selectedStatus !== "all" 
                          ? "Try adjusting your filters." 
                          : "Add your first sample type to get started."}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  sampleTypes.map((sampleType) => (
                    <TableRow key={sampleType._id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium text-sm sm:text-base">{sampleType.name}</div>
                          <div className="text-xs sm:text-sm text-muted-foreground">
                            Code: {sampleType.code}
                          </div>
                          {sampleType.description && (
                            <div className="text-xs text-muted-foreground max-w-[180px] truncate">
                              {sampleType.description}
                            </div>
                          )}
                          {/* Mobile-only additional info */}
                          <div className="sm:hidden space-y-1 pt-1 border-t border-muted">
                            <div className="flex items-center space-x-2 text-xs">
                              {getCategoryIcon(sampleType.category)}
                              <span>{getCategoryLabel(sampleType.category)}</span>
                            </div>
                            {sampleType.collectionMethod && (
                              <div className="text-xs text-muted-foreground">
                                Collection: {sampleType.collectionMethod}
                              </div>
                            )}
                                        {sampleType.storageTemp && (
              <div className="text-xs text-muted-foreground">
                Storage: {sampleType.storageTemp}
              </div>
            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <div className="flex items-center space-x-2">
                          {getCategoryIcon(sampleType.category)}
                          <Badge variant="outline" className={`text-xs ${getCategoryColor(sampleType.category)}`}>
                            {getCategoryLabel(sampleType.category)}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <span className="text-sm">{sampleType.collectionMethod || "N/A"}</span>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <span className="text-sm">{sampleType.storageTemp || "N/A"}</span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={sampleType.isActive ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {sampleType.isActive ? "Active" : "Inactive"}
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
                            <DropdownMenuItem onClick={() => handleEdit(sampleType)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Sample Type
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleStatus(sampleType._id)}>
                              {sampleType.isActive ? "Deactivate" : "Activate"}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDelete(sampleType._id)}
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
            {sampleTypes.map((sampleType) => (
              <div
                key={sampleType._id}
                className="border rounded-lg p-4 space-y-3 bg-white shadow-sm"
              >
                {/* Header with Sample Type Name and Status */}
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-sm truncate">
                      {sampleType.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Code: {sampleType.code}
                    </div>
                  </div>
                  <Badge
                    variant={sampleType.isActive ? "default" : "secondary"}
                    className="text-xs ml-2"
                  >
                    {sampleType.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>

                {/* Description */}
                {sampleType.description && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                      Description
                    </div>
                    <div className="text-sm text-gray-900">
                      {sampleType.description}
                    </div>
                  </div>
                )}

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <div className="text-xs text-gray-500 uppercase tracking-wide">
                      Category
                    </div>
                    <div className="flex items-center space-x-2">
                      {getCategoryIcon(sampleType.category)}
                      <Badge variant="outline" className={`text-xs ${getCategoryColor(sampleType.category)}`}>
                        {getCategoryLabel(sampleType.category)}
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-gray-500 uppercase tracking-wide">
                      Collection Method
                    </div>
                    <div className="text-sm text-gray-900">
                      {sampleType.collectionMethod || "N/A"}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <div className="text-xs text-gray-500 uppercase tracking-wide">
                      Container
                    </div>
                    <div className="text-sm text-gray-900">
                      {sampleType.container || "N/A"}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-gray-500 uppercase tracking-wide">
                      Storage
                    </div>
                    <div className="text-sm text-gray-900">
                      {sampleType.storageTemp || "N/A"}
                    </div>
                  </div>
                </div>

                {/* Volume and Status */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <div className="text-xs text-gray-500 uppercase tracking-wide">
                      Volume
                    </div>
                    <div className="text-sm text-gray-900">
                      {sampleType.volume || "N/A"}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-gray-500 uppercase tracking-wide">
                      Status
                    </div>
                    <div className="flex items-center space-x-2">
                      {sampleType.isActive ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                      <span className="text-sm text-gray-900">
                        {sampleType.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="text-xs text-gray-400">
                    ID: {sampleType._id.slice(-8)}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <MoreVertical className="h-4 w-4 mr-1" />
                        Actions
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(sampleType)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Sample Type
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleToggleStatus(sampleType._id)}>
                        {sampleType.isActive ? "Deactivate" : "Activate"}
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDelete(sampleType._id)}
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
                Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, sampleTypes.length)} sample types
              </div>
              <div className="flex items-center space-x-2 order-1 sm:order-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="h-8"
                >
                  Previous
                </Button>
                <div className="text-xs sm:text-sm px-2">
                  Page {currentPage} of {totalPages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="h-8"
                >
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modal for Add/Edit */}
      <AddSampleTypeModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        sampleType={editingSampleType}
      />
    </div>
  );
};

export default SampleType;

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Search,
  Plus,
  Filter,
  MoreVertical,
  Beaker,
  TestTube2,
  Heart,
  Zap,
  Microscope,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  Eye,
  Folder,
  BarChart3,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import AddCategoryModal from "@/components/modals/AddCategoryModal";
import EditCategoryModal from "@/components/modals/EditCategoryModal";
import ViewCategoryModal from "@/components/modals/ViewCategoryModal";
import {
  useTestCategories,
  useTestCategoryStats,
  useDeleteTestCategory,
  useToggleTestCategoryStatus,
} from "@/hooks/useApi";
import { TestCategory } from "@/types";

const Category = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  // Modal states
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");

  // API Hooks
  const {
    data: categoriesResponse,
    isLoading: categoriesLoading,
    error: categoriesError,
    refetch: refetchCategories,
  } = useTestCategories({
    page,
    limit,
    search: searchTerm || undefined,
    department: selectedDepartment !== "all" ? selectedDepartment : undefined,
    status: selectedStatus !== "all" ? selectedStatus : undefined,
  });

  const {
    data: statsData,
    isLoading: statsLoading,
    error: statsError,
    refetch: refetchStats,
  } = useTestCategoryStats();

  const deleteCategory = useDeleteTestCategory();
  const toggleStatus = useToggleTestCategoryStatus();

  // Extract data from API response
  const categories = categoriesResponse?.data?.categories || [];
  const pagination = categoriesResponse?.data?.pagination;
  const stats = statsData || {
    totalCategories: 0,
    activeCategories: 0,
    totalTests: 0,
    departmentsCount: 0,
  };

  // Get unique departments from categories for filter
  const departments = ["all", ...Array.from(new Set(categories.map((cat) => cat.department)))];

  const getCategoryIcon = (iconName: string, color: string) => {
    const iconProps = { className: "h-4 w-4", style: { color } };
    switch (iconName) {
      case "beaker":
        return <Beaker {...iconProps} />;
      case "test-tube":
        return <TestTube2 {...iconProps} />;
      case "heart":
        return <Heart {...iconProps} />;
      case "zap":
        return <Zap {...iconProps} />;
      case "microscope":
        return <Microscope {...iconProps} />;
      default:
        return <Folder {...iconProps} />;
    }
  };

  const handleView = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setViewModalOpen(true);
  };

  const handleEdit = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setEditModalOpen(true);
  };

  const handleViewTests = (categoryId: string) => {
    // Navigate to tests page with category filter
    navigate(`/dashboard/tests?category=${categoryId}`);
  };

  const handleDelete = async (categoryId: string) => {
    try {
      await deleteCategory.mutateAsync(categoryId);
      toast({
        title: "Category Deleted",
        description: "Category has been successfully deleted",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete category",
        variant: "destructive",
      });
    }
  };

  const handleToggleStatus = async (categoryId: string) => {
    try {
      await toggleStatus.mutateAsync(categoryId);
      toast({
        title: "Status Updated",
        description: "Category status has been updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update category status",
        variant: "destructive",
      });
    }
  };

  const handleRefresh = () => {
    refetchCategories();
    refetchStats();
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  if (categoriesLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading categories...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight truncate">Test Categories</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Manage laboratory test categories and their configurations
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={categoriesLoading}
            className="h-9"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${categoriesLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          <AddCategoryModal 
            trigger={
              <Button size="sm" className="h-9">
                <Plus className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Add Category</span>
                <span className="sm:hidden">Add</span>
              </Button>
            }

          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Categories</CardTitle>
            <Folder className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{stats.totalCategories}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeCategories} active
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Active Categories</CardTitle>
            <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{stats.activeCategories}</div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Tests</CardTitle>
            <TestTube2 className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{stats.totalTests}</div>
            <p className="text-xs text-muted-foreground">Across all categories</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Departments</CardTitle>
            <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{stats.departmentsCount}</div>
            <p className="text-xs text-muted-foreground">Different departments</p>
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
                  placeholder="Search categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 h-9 sm:h-10"
                />
              </div>
            </div>
            <div className="flex flex-col xs:flex-row gap-2">
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger className="w-full xs:w-[160px] sm:w-[180px] h-9 sm:h-10">
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.slice(1).map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
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

      {/* Categories Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Categories ({stats.totalCategories})</CardTitle>
          <CardDescription className="text-sm">
            Manage your laboratory test categories and their properties.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {categoriesLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Loading categories...</span>
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-12">
              <Folder className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">
                {searchTerm || selectedDepartment !== "all" || selectedStatus !== "all" 
                  ? "No categories found matching your filters." 
                  : "No categories found. Add your first category to get started."}
              </p>
              <AddCategoryModal 
                trigger={
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Category
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
                  <TableHead className="min-w-[200px]">Category Details</TableHead>
                  <TableHead className="min-w-[120px] hidden sm:table-cell">Department</TableHead>
                  <TableHead className="min-w-[100px] hidden md:table-cell">Icon</TableHead>
                  <TableHead className="min-w-[80px] hidden lg:table-cell">Tests Count</TableHead>
                  <TableHead className="min-w-[80px]">Status</TableHead>
                  <TableHead className="text-right min-w-[70px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category._id}>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium text-sm sm:text-base">{category.name}</div>
                        <div className="text-xs sm:text-sm text-muted-foreground">
                          Code: {category.code}
                        </div>
                        {category.description && (
                          <div className="text-xs text-muted-foreground max-w-[180px] truncate">
                            {category.description}
                          </div>
                        )}
                        {/* Mobile-only additional info */}
                        <div className="sm:hidden space-y-1 pt-1 border-t border-muted">
                          <div className="text-xs text-muted-foreground">
                            Department: {category.department}
                          </div>
                          <div className="flex items-center space-x-2 text-xs">
                            {getCategoryIcon(category.icon, category.color)}
                            <span>Icon: {category.icon}</span>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge variant="outline" className="text-xs">
                        {category.department}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex items-center space-x-2">
                        {getCategoryIcon(category.icon, category.color)}
                        <span className="text-sm">{category.icon}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <span className="text-sm">{category.testCount || 0}</span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={category.isActive ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {category.isActive ? "Active" : "Inactive"}
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
                          <DropdownMenuItem onClick={() => handleView(category._id)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEdit(category._id)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Category
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleViewTests(category._id)}>
                            <TestTube2 className="h-4 w-4 mr-2" />
                            View Tests
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleStatus(category._id)}>
                            {category.isActive ? "Deactivate" : "Activate"}
                          </DropdownMenuItem>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <div className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent focus:bg-accent focus:text-accent-foreground text-red-600">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </div>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Category</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this category? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleDelete(category._id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {categories.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="text-muted-foreground">
                        No categories found. {searchTerm || selectedDepartment !== "all" || selectedStatus !== "all" 
                          ? "Try adjusting your filters." 
                          : "Add your first category to get started."}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4 p-4">
            {categories.map((category) => (
              <div
                key={category._id}
                className="border rounded-lg p-4 space-y-3 bg-white shadow-sm"
              >
                {/* Header with Category Name and Status */}
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-sm truncate">
                      {category.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Code: {category.code}
                    </div>
                  </div>
                  <Badge
                    variant={category.isActive ? "default" : "secondary"}
                    className="text-xs ml-2"
                  >
                    {category.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>

                {/* Description */}
                {category.description && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                      Description
                    </div>
                    <div className="text-sm text-gray-900">
                      {category.description}
                    </div>
                  </div>
                )}

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <div className="text-xs text-gray-500 uppercase tracking-wide">
                      Department
                    </div>
                    <Badge variant="outline" className="text-xs w-fit">
                      {category.department}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-gray-500 uppercase tracking-wide">
                      Icon
                    </div>
                    <div className="flex items-center space-x-2">
                      {getCategoryIcon(category.icon, category.color)}
                      <span className="text-sm text-gray-900">{category.icon}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <div className="text-xs text-gray-500 uppercase tracking-wide">
                      Tests Count
                    </div>
                    <div className="text-sm text-gray-900">
                      {category.testCount || 0} tests
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-gray-500 uppercase tracking-wide">
                      Status
                    </div>
                    <div className="flex items-center space-x-2">
                      {category.isActive ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                      <span className="text-sm text-gray-900">
                        {category.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="text-xs text-gray-400">
                    ID: {category._id.slice(-8)}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <MoreVertical className="h-4 w-4 mr-1" />
                        Actions
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleView(category._id)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEdit(category._id)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Category
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleViewTests(category._id)}>
                        <TestTube2 className="h-4 w-4 mr-2" />
                        View Tests
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleToggleStatus(category._id)}>
                        {category.isActive ? "Deactivate" : "Activate"}
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDelete(category._id)}
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
      {pagination && pagination.pages > 1 && (
        <Card>
          <CardContent className="pt-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs sm:text-sm text-muted-foreground order-2 sm:order-1">
                Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, pagination.total)} of {pagination.total} categories
              </div>
              <div className="flex items-center space-x-2 order-1 sm:order-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className="h-8"
                >
                  Previous
                </Button>
                <div className="text-xs sm:text-sm px-2">
                  Page {page} of {pagination.pages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === pagination.pages}
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
      <ViewCategoryModal
        open={viewModalOpen}
        onOpenChange={setViewModalOpen}
        categoryId={selectedCategoryId}
      />

      <EditCategoryModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        categoryId={selectedCategoryId}

      />
    </div>
  );
};

export default Category;

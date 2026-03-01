import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { useSearchParams } from "react-router-dom";
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
  TestTube2,
  Beaker,
  Heart,
  Zap,
  Microscope,
  Clock,
  Edit,
  Trash2,
  Eye,
  Copy,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Test, TestCategory, SampleType, TestMethodology, TurnaroundTime } from "@/types";
import { apiService } from "@/services/api";
import AddTestModal from "@/components/modals/AddTestModal";
import ViewTestModal from "@/components/modals/ViewTestModal";
import EditTestModal from "@/components/modals/EditTestModal";

const Tests = () => {
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTestId, setSelectedTestId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Data states
  const [tests, setTests] = useState<Test[]>([]);
  const [categories, setCategories] = useState<TestCategory[]>([]);
  const [sampleTypes, setSampleTypes] = useState<SampleType[]>([]);
  const [methodologies, setMethodologies] = useState<TestMethodology[]>([]);
  const [turnaroundTimes, setTurnaroundTimes] = useState<TurnaroundTime[]>([]);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const pageSize = 10;

  // Memoized fetch data function to prevent unnecessary re-renders
  const fetchData = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      setError(null);

      // Build API parameters
      const apiParams = {
        page: currentPage,
        limit: pageSize,
        search: searchTerm || undefined,
        category: selectedCategory !== "all" ? selectedCategory : undefined,
        status: selectedStatus !== "all" ? selectedStatus : undefined,
      };

      // Debug logging
      console.log('Tests API Parameters:', apiParams);
      console.log('Selected Category:', selectedCategory);
      console.log('Available Categories Count:', categories.length);

      // Fetch tests with current filters
      const testsResponse = await apiService.getTests(apiParams);

      // Only fetch supporting data on first load or when not initialized
      if (!isInitialized) {
        const [categoriesResponse, sampleTypesResponse, methodologiesResponse, turnaroundResponse] = await Promise.all([
          apiService.getTestCategories({ limit: 100, status: 'active' }),
          apiService.getSampleTypes({ limit: 100, status: 'active' }),
          apiService.getTestMethodologies({ limit: 100, status: 'active' }),
          apiService.getTurnaroundTimes({ limit: 100, status: 'active' }),
        ]);

        setCategories(categoriesResponse.data?.categories || []);
        setSampleTypes(sampleTypesResponse.data?.sampleTypes || []);
        setMethodologies(methodologiesResponse.data?.methodologies || []);
        setTurnaroundTimes(turnaroundResponse.data?.turnaroundTimes || []);
      }

      setTests(testsResponse.data?.items || []);
      setTotalPages(testsResponse.data?.pagination?.pages || 1);
      setTotalItems(testsResponse.data?.pagination?.total || 0);
    } catch (err: any) {
      console.error('Error fetching tests data:', err);
      setError(err.response?.data?.message || 'Failed to fetch tests data');
      // Reset states to prevent render errors
      setTests([]);
      if (!isInitialized) {
        setCategories([]);
        setSampleTypes([]);
        setMethodologies([]);
        setTurnaroundTimes([]);
      }
      setTotalPages(1);
      setTotalItems(0);
      toast({
        title: "Error",
        description: "Failed to fetch tests data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [currentPage, selectedCategory, selectedStatus, searchTerm, isInitialized]);

  // Handle URL parameter changes
  useEffect(() => {
    const categoryParam = searchParams.get("category");
    if (categoryParam && categoryParam !== selectedCategory) {
      setSelectedCategory(categoryParam);
    }
  }, [searchParams, selectedCategory]);

  // Single effect for data fetching - handles initial load and all changes
  useEffect(() => {
    // Mark as initialized on first run
    if (!isInitialized) {
      setIsInitialized(true);
    }
    
    // Debounce search term changes
    if (searchTerm.trim()) {
      const timeoutId = setTimeout(() => {
        if (currentPage !== 1) {
          setCurrentPage(1);
          return; // Exit early, the currentPage change will trigger this effect again
        }
        fetchData();
      }, 500);

      return () => clearTimeout(timeoutId);
    } else {
      // For non-search changes, fetch immediately
      fetchData();
    }
  }, [currentPage, selectedCategory, selectedStatus, searchTerm, fetchData]);

  // Reset page when filters change
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [selectedCategory, selectedStatus]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData(false);
  }, [fetchData]);

  const getCategoryName = (categoryId: string) => {
    if (typeof categoryId === 'object' && categoryId !== null) {
      return (categoryId as TestCategory).name;
    }
    const category = (categories || []).find(c => c._id === categoryId);
    return category?.name || categoryId;
  };

  const getSampleTypeName = (sampleTypeId: string | SampleType | undefined): string => {
    if (!sampleTypeId) return 'N/A';
    if (typeof sampleTypeId === 'object' && sampleTypeId !== null) {
      return (sampleTypeId as SampleType).name;
    }
    const sampleType = (sampleTypes || []).find(st => st._id === sampleTypeId);
    return sampleType?.name || String(sampleTypeId);
  };

  const getMethodologyName = (methodologyId: string | TestMethodology | undefined): string => {
    if (!methodologyId) return 'N/A';
    if (typeof methodologyId === 'object' && methodologyId !== null) {
      return (methodologyId as TestMethodology).name;
    }
    const methodology = (methodologies || []).find(m => m._id === methodologyId);
    return methodology?.name || String(methodologyId);
  };

  const getTurnaroundTimeName = (turnaroundId: string | TurnaroundTime): string => {
    if (typeof turnaroundId === 'object' && turnaroundId !== null) {
      const tat = turnaroundId as TurnaroundTime;
      return `${tat.name} (${Math.round(tat.durationMinutes / 60)}h)`;
    }
    const turnaround = (turnaroundTimes || []).find(t => t._id === turnaroundId);
    return turnaround ? `${turnaround.name} (${Math.round(turnaround.durationMinutes / 60)}h)` : String(turnaroundId);
  };

  const getCategoryIcon = (categoryName: string) => {
    switch (categoryName.toLowerCase()) {
      case "hematology":
        return <Beaker className="h-4 w-4 text-red-600" />;
      case "clinical chemistry":
        return <TestTube2 className="h-4 w-4 text-blue-600" />;
      case "cardiology":
        return <Heart className="h-4 w-4 text-pink-600" />;
      case "endocrinology":
        return <Zap className="h-4 w-4 text-purple-600" />;
      default:
        return <Microscope className="h-4 w-4 text-green-600" />;
    }
  };

  const handleViewTest = (testId: string) => {
    setSelectedTestId(testId);
    setIsViewModalOpen(true);
  };

  const handleEditTest = (testId: string) => {
    setSelectedTestId(testId);
    setIsEditModalOpen(true);
  };

  const handleDeleteTest = async (testId: string) => {
    if (!confirm("Are you sure you want to delete this test?")) return;

    try {
      await apiService.deleteTest(testId);
      toast({
        title: "Success",
        description: "Test deleted successfully.",
      });
      fetchData(false);
    } catch (err: any) {
      console.error('Error deleting test:', err);
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to delete test.",
        variant: "destructive",
      });
    }
  };

  const handleToggleStatus = async (testId: string) => {
    try {
      const test = (tests || []).find(t => t._id === testId);
      if (!test) return;

      await apiService.toggleTestStatus(testId);
      toast({
        title: "Success",
        description: `Test ${test.isActive ? 'deactivated' : 'activated'} successfully.`,
      });
      fetchData(false);
    } catch (err: any) {
      console.error('Error toggling test status:', err);
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to update test status.",
        variant: "destructive",
      });
    }
  };

  const handleDuplicateTest = async (testId: string) => {
    try {
      const test = (tests || []).find(t => t._id === testId);
      if (!test) return;

      const duplicateData = {
        name: `${test.name} (Copy)`,
        code: `${test.code}_COPY`,
        category: typeof test.category === 'string' ? test.category : test.category._id,
        sampleType: typeof test.sampleType === 'string' ? test.sampleType : test.sampleType?._id,
        methodology: typeof test.methodology === 'string' ? test.methodology : test.methodology?._id,
        turnaroundTime: typeof test.turnaroundTime === 'string' ? test.turnaroundTime : test.turnaroundTime._id,
        description: test.description || "",
        normalRange: test.normalRange || "",
        units: test.units || "",
      };

      await apiService.createTest(duplicateData);
      toast({
        title: "Success",
        description: "Test duplicated successfully.",
      });
      fetchData(false);
    } catch (err: any) {
      console.error('Error duplicating test:', err);
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to duplicate test.",
        variant: "destructive",
      });
    }
  };

  const handleAddTest = () => {
    setIsAddModalOpen(true);
  };

  const handleTestAdded = useCallback(() => {
    fetchData(false);
  }, [fetchData]);

  const handleTestUpdated = useCallback(() => {
    fetchData(false);
  }, [fetchData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading tests...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Error Loading Tests</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => fetchData()} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
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
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight truncate">Laboratory Tests</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Manage your laboratory test catalog and configurations
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={refreshing}
            className="h-9"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          <Button onClick={handleAddTest} size="sm" className="h-9">
            <Plus className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Add New Test</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Tests</CardTitle>
            <TestTube2 className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{totalItems}</div>
            <p className="text-xs text-muted-foreground">
              {(tests || []).filter(t => t.isActive).length} active
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Categories</CardTitle>
            <Beaker className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{(categories || []).length}</div>
            <p className="text-xs text-muted-foreground">Test categories</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Sample Types</CardTitle>
            <Microscope className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{(sampleTypes || []).length}</div>
            <p className="text-xs text-muted-foreground">Different sample types</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Methodologies</CardTitle>
            <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{(methodologies || []).length}</div>
            <p className="text-xs text-muted-foreground">Test methodologies</p>
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
                  placeholder="Search tests..."
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
                  {(categories || []).map((category) => (
                    <SelectItem key={category._id} value={category._id}>
                      {category.name}
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

      {/* Tests Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Tests ({totalItems})</CardTitle>
          <CardDescription className="text-sm">
            A list of all laboratory tests in your catalog.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="min-w-[200px]">Test Details</TableHead>
                  <TableHead className="min-w-[120px]">Category</TableHead>
                  <TableHead className="min-w-[100px] hidden lg:table-cell">Sample Type</TableHead>
                  <TableHead className="min-w-[120px] hidden lg:table-cell">Methodology</TableHead>
                  <TableHead className="min-w-[140px] hidden lg:table-cell">Turnaround Time</TableHead>
                  <TableHead className="min-w-[80px] hidden xl:table-cell">Price</TableHead>
                  <TableHead className="min-w-[80px]">Status</TableHead>
                  <TableHead className="text-right min-w-[70px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(tests || []).map((test) => (
                  <TableRow key={test._id}>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium text-sm sm:text-base">{test.name}</div>
                        <div className="text-xs sm:text-sm text-muted-foreground">
                          Code: {test.code}
                        </div>
                        {test.description && (
                          <div className="text-xs text-muted-foreground max-w-[180px] truncate">
                            {test.description}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getCategoryIcon(getCategoryName(test.category as string))}
                        <span className="text-sm">{getCategoryName(test.category as string)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <span className="text-sm">{getSampleTypeName(test.sampleType)}</span>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <span className="text-sm">{getMethodologyName(test.methodology)}</span>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{getTurnaroundTimeName(test.turnaroundTime)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden xl:table-cell">
                      <span className="text-sm text-muted-foreground">-</span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={test.isActive ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {test.isActive ? "Active" : "Inactive"}
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
                          <DropdownMenuItem onClick={() => handleViewTest(test._id)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditTest(test._id)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Test
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDuplicateTest(test._id)}>
                            <Copy className="h-4 w-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleStatus(test._id)}>
                            {test.isActive ? "Deactivate" : "Activate"}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteTest(test._id)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {(tests || []).length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="text-muted-foreground">
                        No tests found. {searchTerm || selectedCategory !== "all" || selectedStatus !== "all" 
                          ? "Try adjusting your filters." 
                          : "Add your first test to get started."}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-3 p-4">
            {(tests || []).length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <TestTube2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm font-medium">No tests found</p>
                {searchTerm || selectedCategory !== "all" || selectedStatus !== "all" ? (
                  <p className="text-xs mt-1">Try adjusting your filters</p>
                ) : (
                  <p className="text-xs mt-1">Add your first test to get started</p>
                )}
              </div>
            ) : (
              (tests || []).map((test) => (
                <Card key={test._id} className="p-4 space-y-3 bg-white shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                  {/* Header with test name and status */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 flex-1 min-w-0">
                      <TestTube2 className="h-5 w-5 text-blue-600 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-sm truncate">{test.name}</div>
                        <div className="text-xs text-gray-500">Code: {test.code}</div>
                      </div>
                    </div>
                    <Badge
                      variant={test.isActive ? "default" : "secondary"}
                      className="text-xs flex-shrink-0"
                    >
                      {test.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>

                  {/* Description */}
                  {test.description && (
                    <div className="text-xs text-gray-600 p-2 bg-gray-50 rounded">
                      {test.description}
                    </div>
                  )}

                  {/* Test details */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        {getCategoryIcon(getCategoryName(test.category as string))}
                        <span className="font-medium text-gray-500">Category</span>
                      </div>
                      <span className="text-gray-900 font-medium">
                        {getCategoryName(test.category as string)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <Microscope className="h-4 w-4 text-purple-600" />
                        <span className="font-medium text-gray-500">Sample</span>
                      </div>
                      <span className="text-gray-900">
                        {getSampleTypeName(test.sampleType)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <Beaker className="h-4 w-4 text-green-600" />
                        <span className="font-medium text-gray-500">Method</span>
                      </div>
                      <span className="text-gray-900">
                        {getMethodologyName(test.methodology)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-orange-600" />
                        <span className="font-medium text-gray-500">TAT</span>
                      </div>
                      <span className="text-gray-900">
                        {getTurnaroundTimeName(test.turnaroundTime)}
                      </span>
                    </div>
                  </div>

                  {/* Units and normal range */}
                  <div className="flex items-center justify-between text-xs bg-blue-50 p-2 rounded">
                    <div>
                      <span className="font-medium text-gray-500">Units: </span>
                      <span className="text-gray-900">{test.units || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-500">Range: </span>
                      <span className="text-gray-900">{test.normalRange || 'N/A'}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end pt-2 border-t">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="h-8">
                          <MoreVertical className="h-4 w-4 mr-1" />
                          Actions
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewTest(test._id)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditTest(test._id)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Test
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicateTest(test._id)}>
                          <Copy className="h-4 w-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggleStatus(test._id)}>
                          {test.isActive ? "Deactivate" : "Activate"}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDeleteTest(test._id)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <Card>
          <CardContent className="pt-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs sm:text-sm text-muted-foreground order-2 sm:order-1">
                Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalItems)} of {totalItems} tests
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

      {/* Add Test Modal */}
      <AddTestModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        onTestAdded={handleTestAdded}
      />

      {/* View Test Modal */}
      <ViewTestModal
        open={isViewModalOpen}
        onOpenChange={(open) => {
          setIsViewModalOpen(open);
          if (!open) setSelectedTestId(null);
        }}
        testId={selectedTestId}
      />

      {/* Edit Test Modal */}
      <EditTestModal
        open={isEditModalOpen}
        onOpenChange={(open) => {
          setIsEditModalOpen(open);
          if (!open) setSelectedTestId(null);
        }}
        testId={selectedTestId}
        onTestUpdated={handleTestUpdated}
      />
    </div>
  );
};

export default Tests;

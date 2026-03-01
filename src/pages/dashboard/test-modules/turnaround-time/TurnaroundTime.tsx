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
  Clock,
  Zap,
  AlertTriangle,
  CheckCircle,
  Edit,
  Trash2,
  Eye,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import AddTurnaroundTimeModal from "@/components/modals/AddTurnaroundTimeModal";
import ViewTurnaroundTimeModal from "@/components/modals/ViewTurnaroundTimeModal";
import EditTurnaroundTimeModal from "@/components/modals/EditTurnaroundTimeModal";
import { 
  useTurnaroundTimes, 
  useTurnaroundTimeStats, 
  useDeleteTurnaroundTime, 
  useToggleTurnaroundTimeStatus 
} from "@/hooks/useApi";
import { TurnaroundTime as TurnaroundTimeType } from "@/types";

// Remove the local interface since we're using the one from types

const TurnaroundTimePage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedPriority, setSelectedPriority] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageLimit] = useState(10);
  
  // Modal states
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedTurnaroundTimeId, setSelectedTurnaroundTimeId] = useState<string | null>(null);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1); // Reset to first page when searching
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // API Hooks
  const { data: turnaroundData, isLoading, error, refetch } = useTurnaroundTimes({
    page: currentPage,
    limit: pageLimit,
    search: debouncedSearch || undefined,
    priority: selectedPriority !== "all" ? selectedPriority : undefined,
    status: selectedStatus !== "all" ? selectedStatus : undefined,
  });

  const { data: statsData, isLoading: statsLoading } = useTurnaroundTimeStats();
  
  const deleteMutation = useDeleteTurnaroundTime();
  const toggleStatusMutation = useToggleTurnaroundTimeStatus();

  // Extract data from API response
  const turnaroundTimes = turnaroundData?.data?.turnaroundTimes || [];
  const pagination = turnaroundData?.data?.pagination;

  const priorities = ["all", "stat", "urgent", "routine", "extended"];

  // All filtering is now handled by the API

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "stat":
        return <Zap className="h-4 w-4 text-red-600" />;
      case "urgent":
        return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case "routine":
        return <Clock className="h-4 w-4 text-blue-600" />;
      case "extended":
        return <Clock className="h-4 w-4 text-purple-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "stat":
        return "bg-red-100 text-red-800 border-red-200";
      case "urgent":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "routine":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "extended":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`;
    if (minutes < 1440) return `${Math.round(minutes / 60)} hrs`;
    return `${Math.round(minutes / 1440)} days`;
  };

  const handleView = (timeId: string) => {
    setSelectedTurnaroundTimeId(timeId);
    setViewModalOpen(true);
  };

  const handleEdit = (timeId: string) => {
    setSelectedTurnaroundTimeId(timeId);
    setEditModalOpen(true);
  };

  const handleDelete = async (timeId: string) => {
    try {
      await deleteMutation.mutateAsync(timeId);
      toast({
        title: "Success",
        description: "Turnaround time deleted successfully",
      });
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete turnaround time",
        variant: "destructive",
      });
    }
  };

  const handleToggleStatus = async (timeId: string) => {
    try {
      await toggleStatusMutation.mutateAsync(timeId);
      toast({
        title: "Success",
        description: "Turnaround time status updated successfully",
      });
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update turnaround time status",
        variant: "destructive",
      });
    }
  };

  // Use stats from API
  const totalTimes = statsData?.totalTimes || 0;
  const activeTimes = statsData?.activeTimes || 0;
  const statTimes = statsData?.statTimes || 0;
  const averageMinutes = statsData?.averageMinutes || 0;

  // Handle loading and error states
  if (error) {
    return (
      <div className="space-y-6">
        <div className="text-center py-10">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Error Loading Turnaround Times
          </h2>
          <p className="text-gray-600 mb-4">
            Failed to load turnaround time data. Please try again.
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
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight truncate">Turnaround Times</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Manage laboratory test turnaround times and priorities
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => refetch()}
            disabled={isLoading}
            className="h-9"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          <AddTurnaroundTimeModal 
            trigger={
              <Button size="sm" className="h-9">
                <Plus className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Add Turnaround Time</span>
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
            <CardTitle className="text-xs sm:text-sm font-medium">Total Times</CardTitle>
            <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{totalTimes}</div>
            <p className="text-xs text-muted-foreground">
              {activeTimes} active
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">STAT Tests</CardTitle>
            <Zap className="h-3 w-3 sm:h-4 sm:w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{statTimes}</div>
            <p className="text-xs text-muted-foreground">Emergency priority</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Average Time</CardTitle>
            <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{formatDuration(averageMinutes)}</div>
            <p className="text-xs text-muted-foreground">Across all tests</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Active Times</CardTitle>
            <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{activeTimes}</div>
            <p className="text-xs text-muted-foreground">Currently active</p>
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
                  placeholder="Search turnaround times..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 h-9 sm:h-10"
                />
              </div>
            </div>
            <div className="flex flex-col xs:flex-row gap-2">
              <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                <SelectTrigger className="w-full xs:w-[160px] sm:w-[180px] h-9 sm:h-10">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  {priorities.slice(1).map((priority) => (
                    <SelectItem key={priority} value={priority}>
                      {priority.charAt(0).toUpperCase() + priority.slice(1)}
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

      {/* Turnaround Times Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Turnaround Times ({totalTimes})</CardTitle>
          <CardDescription className="text-sm">
            Manage your laboratory test turnaround times and their priorities.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Loading turnaround times...</span>
            </div>
          ) : turnaroundTimes.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">
                {searchTerm || selectedPriority !== "all" || selectedStatus !== "all" 
                  ? "No turnaround times found matching your filters." 
                  : "No turnaround times found. Add your first turnaround time to get started."}
              </p>
              <AddTurnaroundTimeModal 
                trigger={
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Turnaround Time
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
                  <TableHead className="min-w-[200px]">Time Details</TableHead>
                  <TableHead className="min-w-[120px] hidden sm:table-cell">Priority</TableHead>
                  <TableHead className="min-w-[100px] hidden md:table-cell">Duration</TableHead>
                  <TableHead className="min-w-[80px] hidden lg:table-cell">Category</TableHead>
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
                ) : turnaroundTimes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="text-muted-foreground">
                        No turnaround times found. {searchTerm || selectedPriority !== "all" || selectedStatus !== "all" 
                          ? "Try adjusting your filters." 
                          : "Add your first turnaround time to get started."}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  turnaroundTimes.map((time) => (
                    <TableRow key={time._id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium text-sm sm:text-base">{time.name}</div>
                          <div className="text-xs sm:text-sm text-muted-foreground">
                            Code: {time.code}
                          </div>
                          {time.description && (
                            <div className="text-xs text-muted-foreground max-w-[180px] truncate">
                              {time.description}
                            </div>
                          )}
                          {/* Mobile-only additional info */}
                          <div className="sm:hidden space-y-1 pt-1 border-t border-muted">
                            <div className="flex items-center space-x-2 text-xs">
                              {getPriorityIcon(time.priority)}
                              <span className={`px-2 py-1 rounded-full ${getPriorityColor(time.priority)}`}>
                                {time.priority.charAt(0).toUpperCase() + time.priority.slice(1)}
                              </span>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Duration: {formatDuration(time.durationMinutes)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Category: {time.category}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <div className="flex items-center space-x-2">
                          {getPriorityIcon(time.priority)}
                          <Badge variant="outline" className={`text-xs ${getPriorityColor(time.priority)}`}>
                            {time.priority.charAt(0).toUpperCase() + time.priority.slice(1)}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <span className="text-sm">{formatDuration(time.durationMinutes)}</span>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <span className="text-sm">{time.category}</span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={time.isActive ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {time.isActive ? "Active" : "Inactive"}
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
                            <DropdownMenuItem onClick={() => handleView(time._id)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(time._id)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Time
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleStatus(time._id)}>
                              {time.isActive ? "Deactivate" : "Activate"}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDelete(time._id)}
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
            {turnaroundTimes.map((time) => (
              <div
                key={time._id}
                className="border rounded-lg p-4 space-y-3 bg-white shadow-sm"
              >
                {/* Header with Name and Status */}
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-sm truncate">
                      {time.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Code: {time.code}
                    </div>
                  </div>
                  <Badge
                    variant={time.isActive ? "default" : "secondary"}
                    className="text-xs ml-2"
                  >
                    {time.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>

                {/* Description */}
                {time.description && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                      Description
                    </div>
                    <div className="text-sm text-gray-900">
                      {time.description}
                    </div>
                  </div>
                )}

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <div className="text-xs text-gray-500 uppercase tracking-wide">
                      Priority
                    </div>
                    <div className="flex items-center space-x-2">
                      {getPriorityIcon(time.priority)}
                      <Badge variant="outline" className={`text-xs ${getPriorityColor(time.priority)}`}>
                        {time.priority.charAt(0).toUpperCase() + time.priority.slice(1)}
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-gray-500 uppercase tracking-wide">
                      Duration
                    </div>
                    <div className="text-sm text-gray-900">
                      {formatDuration(time.durationMinutes)}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <div className="text-xs text-gray-500 uppercase tracking-wide">
                      Category
                    </div>
                    <div className="text-sm text-gray-900">
                      {time.category}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-gray-500 uppercase tracking-wide">
                      Status
                    </div>
                    <div className="flex items-center space-x-2">
                      {time.isActive ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <CheckCircle className="h-4 w-4 text-gray-400" />
                      )}
                      <span className="text-sm text-gray-900">
                        {time.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="text-xs text-gray-400">
                    ID: {time._id.slice(-8)}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <MoreVertical className="h-4 w-4 mr-1" />
                        Actions
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleView(time._id)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEdit(time._id)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Time
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleToggleStatus(time._id)}>
                        {time.isActive ? "Deactivate" : "Activate"}
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDelete(time._id)}
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
                Showing {((currentPage - 1) * pageLimit) + 1} to {Math.min(currentPage * pageLimit, pagination.total)} of {pagination.total} turnaround times
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
                  Page {currentPage} of {pagination.pages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === pagination.pages}
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
      <ViewTurnaroundTimeModal
        open={viewModalOpen}
        onOpenChange={setViewModalOpen}
        turnaroundTimeId={selectedTurnaroundTimeId}
      />

      <EditTurnaroundTimeModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        turnaroundTimeId={selectedTurnaroundTimeId}

      />
    </div>
  );
};

export default TurnaroundTimePage;

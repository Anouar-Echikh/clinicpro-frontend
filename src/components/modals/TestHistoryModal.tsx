import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  TestTube2,
  Calendar,
  Search,
  Filter,
  CheckCircle,
  Clock,
  AlertTriangle,
  X,
  User,
  FileText,
  DollarSign,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { labVendorApi, TestRecord } from "@/services/api/labVendorApi";

interface TestHistoryModalProps {
  vendorId: string | null;
  vendorName?: string;
  isOpen: boolean;
  onClose: () => void;
}

const TestHistoryModal: React.FC<TestHistoryModalProps> = ({
  vendorId,
  vendorName,
  isOpen,
  onClose,
}) => {
  const [tests, setTests] = useState<TestRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFromFilter, setDateFromFilter] = useState("");
  const [dateToFilter, setDateToFilter] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  // Mock data for demonstration
  const mockTests: TestRecord[] = [
    {
      id: "T-001",
      testId: "LAB001",
      patientId: "P-12345",
      patientName: "John Doe",
      testType: "Complete Blood Count",
      orderDate: new Date("2024-01-20"),
      completionDate: new Date("2024-01-21"),
      status: "completed",
      cost: 45.00,
      results: "Normal values within range",
      notes: "Fasting sample collected",
    },
    {
      id: "T-002",
      testId: "LAB002",
      patientId: "P-12346",
      patientName: "Jane Smith",
      testType: "Lipid Panel",
      orderDate: new Date("2024-01-19"),
      completionDate: new Date("2024-01-20"),
      status: "completed",
      cost: 78.50,
      results: "Elevated cholesterol levels",
      notes: "12-hour fasting required",
    },
    {
      id: "T-003",
      testId: "LAB003",
      patientId: "P-12347",
      patientName: "Mike Johnson",
      testType: "Thyroid Function",
      orderDate: new Date("2024-01-18"),
      status: "in_progress",
      cost: 120.00,
      notes: "Follow-up test",
    },
    {
      id: "T-004",
      testId: "LAB004",
      patientId: "P-12348",
      patientName: "Sarah Wilson",
      testType: "HbA1c",
      orderDate: new Date("2024-01-17"),
      status: "pending",
      cost: 65.00,
      notes: "Diabetes monitoring",
    },
    {
      id: "T-005",
      testId: "LAB005",
      patientId: "P-12349",
      patientName: "Robert Brown",
      testType: "Liver Function Panel",
      orderDate: new Date("2024-01-16"),
      completionDate: new Date("2024-01-17"),
      status: "completed",
      cost: 95.75,
      results: "Slightly elevated ALT",
      notes: "Recheck in 3 months",
    },
  ];

  useEffect(() => {
    if (vendorId && isOpen) {
      fetchTestHistory();
    }
  }, [vendorId, isOpen, pagination.page, statusFilter, dateFromFilter, dateToFilter]);

  const fetchTestHistory = async () => {
    if (!vendorId) return;
    
    try {
      setIsLoading(true);
      const filters = {
        page: pagination.page,
        limit: pagination.limit,
        dateFrom: dateFromFilter || undefined,
        dateTo: dateToFilter || undefined,
      };
      
      const response = await labVendorApi.getTestHistory(vendorId, filters);
      setTests(response.tests);
      setPagination(response.pagination);
    } catch (error) {
      console.error("Error fetching test history:", error);
      toast({
        title: "Error",
        description: "Failed to load test history. Showing sample data.",
        variant: "destructive",
      });
      // Fallback to mock data
      setTests(mockTests);
      setPagination({
        page: 1,
        limit: 10,
        total: mockTests.length,
        pages: 1,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-orange-100 text-orange-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "in_progress":
        return <Clock className="h-4 w-4 text-blue-600" />;
      case "pending":
        return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case "cancelled":
        return <X className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const filteredTests = tests.filter((test) => {
    const matchesSearch =
      test.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      test.testType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      test.testId.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || test.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalCost = filteredTests.reduce((sum, test) => sum + test.cost, 0);
  const completedTests = filteredTests.filter((test) => test.status === "completed").length;
  const pendingTests = filteredTests.filter((test) => test.status === "pending").length;
  const inProgressTests = filteredTests.filter((test) => test.status === "in_progress").length;

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold">
              Test History - {vendorName || "Vendor"}
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Tests</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {filteredTests.length}
                    </p>
                  </div>
                  <TestTube2 className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Completed</p>
                    <p className="text-2xl font-bold text-green-600">
                      {completedTests}
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">In Progress</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {inProgressTests}
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Value</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(totalCost)}
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:flex-wrap">
                {/* Search */}
                <div className="relative flex-1 min-w-0 sm:min-w-[250px]">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by patient name, test type, or test ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Status Filter */}
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>

                {/* Date Filters */}
                <div className="flex gap-2">
                  <Input
                    type="date"
                    value={dateFromFilter}
                    onChange={(e) => setDateFromFilter(e.target.value)}
                    className="w-full sm:w-auto"
                    placeholder="From date"
                  />
                  <Input
                    type="date"
                    value={dateToFilter}
                    onChange={(e) => setDateToFilter(e.target.value)}
                    className="w-full sm:w-auto"
                    placeholder="To date"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Test History Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TestTube2 className="h-5 w-5 mr-2" />
                Test Records
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading test history...</p>
                  </div>
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Test ID</TableHead>
                        <TableHead>Patient</TableHead>
                        <TableHead>Test Type</TableHead>
                        <TableHead>Order Date</TableHead>
                        <TableHead>Completion Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Cost</TableHead>
                        <TableHead>Results</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTests.map((test) => (
                        <TableRow key={test.id}>
                          <TableCell className="font-mono font-medium">
                            {test.testId}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <User className="h-4 w-4 mr-2 text-gray-400" />
                              <div>
                                <div className="font-medium">{test.patientName}</div>
                                <div className="text-sm text-gray-500">
                                  ID: {test.patientId}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">
                            {test.testType}
                          </TableCell>
                          <TableCell>{formatDate(test.orderDate)}</TableCell>
                          <TableCell>
                            {test.completionDate
                              ? formatDate(test.completionDate)
                              : "-"}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              {getStatusIcon(test.status)}
                              <Badge className={getStatusColor(test.status)}>
                                {test.status.replace("_", " ").toUpperCase()}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">
                            {formatCurrency(test.cost)}
                          </TableCell>
                          <TableCell>
                            {test.results ? (
                              <div className="max-w-xs">
                                <p className="text-sm truncate" title={test.results}>
                                  {test.results}
                                </p>
                                {test.notes && (
                                  <p className="text-xs text-gray-500 truncate" title={test.notes}>
                                    {test.notes}
                                  </p>
                                )}
                              </div>
                            ) : (
                              <span className="text-gray-400">Pending</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {filteredTests.length === 0 && (
                    <div className="text-center py-8">
                      <TestTube2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No test records found</p>
                      <p className="text-sm text-gray-500">
                        Try adjusting your search criteria
                      </p>
                    </div>
                  )}

                  {/* Pagination */}
                  {pagination.pages > 1 && (
                    <div className="flex items-center justify-between mt-6">
                      <p className="text-sm text-gray-600">
                        Showing {((pagination.page - 1) * pagination.limit) + 1} to{" "}
                        {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
                        {pagination.total} results
                      </p>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(pagination.page - 1)}
                          disabled={pagination.page <= 1}
                        >
                          Previous
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(pagination.page + 1)}
                          disabled={pagination.page >= pagination.pages}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TestHistoryModal; 
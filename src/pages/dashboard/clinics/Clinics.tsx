import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Building2,
  Plus,
  Search,
  Edit,
  Trash2,
  MoreHorizontal,
  Users,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Activity,
  AlertCircle,
  CheckCircle,
  Settings,
  MoreVertical,
  Loader2,
  Globe,
  Clock,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useCurrency } from "@/contexts/CurrencyContext";
import { apiService } from "@/services/api";
import AddClinicModal from "@/components/modals/AddClinicModal";
import EditClinicModal from "@/components/modals/EditClinicModal";
import ViewClinicModal from "@/components/modals/ViewClinicModal";

// Clinic interface based on backend model
interface Clinic {
  id: string;
  name: string;
  code: string;
  description?: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  contact: {
    phone: string;
    email: string;
    website?: string;
  };
  settings: {
    timezone: string;
    currency: string;
    language: string;
    working_hours: {
      monday: { start: string; end: string; isWorking: boolean };
      tuesday: { start: string; end: string; isWorking: boolean };
      wednesday: { start: string; end: string; isWorking: boolean };
      thursday: { start: string; end: string; isWorking: boolean };
      friday: { start: string; end: string; isWorking: boolean };
      saturday: { start: string; end: string; isWorking: boolean };
      sunday: { start: string; end: string; isWorking: boolean };
    };
  };
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
}

const Clinics = () => {
  const { t } = useTranslation();
  const { formatAmount } = useCurrency();

  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [filteredClinics, setFilteredClinics] = useState<Clinic[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  // Transform API clinic to local clinic interface
  const transformClinic = (userClinicData: any): Clinic => {
    const clinicData = userClinicData.clinic_id;
    if (!clinicData) {
      throw new Error('Invalid clinic data: clinic_id is missing');
    }
    
    return {
      id: clinicData._id,
      name: clinicData.name || '',
      code: clinicData.code || '',
      description: clinicData.description || '',
      address: clinicData.address || {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: ''
      },
      contact: clinicData.contact || {
        phone: '',
        email: '',
        website: ''
      },
      settings: clinicData.settings || {
        timezone: 'America/New_York',
        currency: 'USD',
        language: 'en',
        working_hours: {
          monday: { start: "09:00", end: "17:00", isWorking: true },
          tuesday: { start: "09:00", end: "17:00", isWorking: true },
          wednesday: { start: "09:00", end: "17:00", isWorking: true },
          thursday: { start: "09:00", end: "17:00", isWorking: true },
          friday: { start: "09:00", end: "17:00", isWorking: true },
          saturday: { start: "09:00", end: "13:00", isWorking: false },
          sunday: { start: "00:00", end: "00:00", isWorking: false },
        }
      },
      is_active: clinicData.is_active !== undefined ? clinicData.is_active : true,
      createdAt: clinicData.created_at || new Date().toISOString(),
      updatedAt: clinicData.updated_at || clinicData.created_at || new Date().toISOString(),
    };
  };

  // Fetch clinics from API
  const fetchClinics = async () => {
    try {
      setLoading(true);
      // Force tenant-scoped filtering to show only tenant-related clinics
      const response = await apiService.getClinics({ tenantScoped: true });
      
      // Filter out any entries where clinic_id might be null and transform the data
      const validClinics = response.data.filter((userClinic: any) => userClinic.clinic_id);
      const transformedClinics = validClinics.map(transformClinic);
      
      // Remove duplicates based on clinic ID (in case a clinic appears multiple times for different users)
      const uniqueClinics = transformedClinics.reduce((acc: Clinic[], current: Clinic) => {
        const existingClinic = acc.find(clinic => clinic.id === current.id);
        if (!existingClinic) {
          acc.push(current);
        }
        return acc;
      }, []);
      
      setClinics(uniqueClinics);
    } catch (error) {
      console.error('Error fetching clinics:', error);
      toast({
        title: t("Error"),
        description: t("Failed to load clinics. Please try again."),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchClinics();
  }, []);

  // Filter clinics based on search term
  useEffect(() => {
    const filtered = clinics.filter(
      (clinic) =>
        (clinic.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (clinic.code || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (clinic.address?.city || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (clinic.address?.state || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (clinic.description && clinic.description.toLowerCase().includes(searchTerm.toLowerCase())),
    );
    setFilteredClinics(filtered);
  }, [searchTerm, clinics]);

  const handleAddClinic = async (clinicData: Omit<Clinic, "id" | "createdAt" | "updatedAt">) => {
    try {
      // Clean up contact data - only include website if it has a value
      const contactData = {
        phone: clinicData.contact.phone,
        email: clinicData.contact.email,
        ...(clinicData.contact.website && clinicData.contact.website.trim() && {
          website: clinicData.contact.website.trim()
        })
      };

      const createRequest = {
        name: clinicData.name,
        code: clinicData.code,
        description: clinicData.description,
        address: clinicData.address,
        contact: contactData,
        settings: clinicData.settings,
        is_active: clinicData.is_active,
      };

      const response = await apiService.createClinic(createRequest);
      
      // The create endpoint returns the clinic data nested under 'data' property
      const responseData = response.data;
      const newClinic: Clinic = {
        id: responseData._id,
        name: responseData.name,
        code: responseData.code,
        description: responseData.description || '',
        address: responseData.address,
        contact: responseData.contact,
        settings: responseData.settings,
        is_active: responseData.is_active,
        createdAt: responseData.created_at,
        updatedAt: responseData.updated_at || responseData.created_at,
      };
      
      setClinics([...clinics, newClinic]);
      setIsAddModalOpen(false);
      
      toast({
        title: t("Clinic Added"),
        description: `${clinicData.name} ${t('has been successfully added.')}`,
      });
    } catch (error: any) {
      console.error('Error adding clinic:', error);
      
      // Handle validation errors from backend
      if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        const validationErrors = error.response.data.errors;
        const errorMessages = validationErrors.map((err: any) => `${err.path}: ${err.msg}`).join(', ');
        toast({
          title: t("Validation Error"),
          description: errorMessages,
          variant: "destructive",
        });
      } else {
        toast({
          title: t("Error"),
          description: error.response?.data?.message || t("Failed to add clinic. Please try again."),
          variant: "destructive",
        });
      }
    }
  };

  const handleEditClinic = async (clinicData: Omit<Clinic, "id" | "createdAt" | "updatedAt">) => {
    if (!selectedClinic) return;

    try {
      // Clean up contact data - only include website if it has a value
      const contactData = {
        phone: clinicData.contact.phone,
        email: clinicData.contact.email,
        ...(clinicData.contact.website && clinicData.contact.website.trim() && {
          website: clinicData.contact.website.trim()
        })
      };

      const updateRequest = {
        name: clinicData.name,
        code: clinicData.code,
        description: clinicData.description,
        address: clinicData.address,
        contact: contactData,
        settings: clinicData.settings,
        is_active: clinicData.is_active,
      };

      const response = await apiService.updateClinic(selectedClinic.id, updateRequest);

      // The update endpoint returns the clinic data nested under 'data' property
      const responseData = response.data;
      const updatedClinic: Clinic = {
        id: responseData._id,
        name: responseData.name,
        code: responseData.code,
        description: responseData.description || '',
        address: responseData.address,
        contact: responseData.contact,
        settings: responseData.settings,
        is_active: responseData.is_active,
        createdAt: responseData.created_at,
        updatedAt: responseData.updated_at || responseData.created_at,
      };

      setClinics(
        clinics.map((clinic) =>
          clinic.id === selectedClinic.id ? updatedClinic : clinic,
        ),
      );
      setIsEditModalOpen(false);
      setSelectedClinic(null);

      toast({
        title: t("Clinic Updated"),
        description: `${clinicData.name} ${t('has been successfully updated.')}`,
      });
    } catch (error: any) {
      console.error('Error updating clinic:', error);
      
      // Handle validation errors from backend
      if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        const validationErrors = error.response.data.errors;
        const errorMessages = validationErrors.map((err: any) => `${err.path}: ${err.msg}`).join(', ');
        toast({
          title: t("Validation Error"),
          description: errorMessages,
          variant: "destructive",
        });
      } else {
        toast({
          title: t("Error"),
          description: error.response?.data?.message || t("Failed to update clinic. Please try again."),
          variant: "destructive",
        });
      }
    }
  };



  const handleToggleStatus = async (id: string, newStatus: boolean) => {
    const clinic = clinics.find((c) => c.id === id);
    if (!clinic) return;

    try {
      // Clean up contact data - only include website if it has a value
      const contactData = {
        phone: clinic.contact?.phone || '',
        email: clinic.contact?.email || '',
        ...(clinic.contact?.website && clinic.contact.website.trim() && {
          website: clinic.contact.website.trim()
        })
      };

      const updateRequest = {
        name: clinic.name,
        code: clinic.code,
        description: clinic.description,
        address: clinic.address,
        contact: contactData,
        settings: clinic.settings,
        is_active: newStatus,
      };

      const response = await apiService.updateClinic(id, updateRequest);

      const responseData = response.data;
      const updatedClinic: Clinic = {
        id: responseData._id,
        name: responseData.name,
        code: responseData.code,
        description: responseData.description || '',
        address: responseData.address,
        contact: responseData.contact,
        settings: responseData.settings,
        is_active: responseData.is_active,
        createdAt: responseData.created_at,
        updatedAt: responseData.updated_at || responseData.created_at,
      };

      setClinics(
        clinics.map((c) =>
          c.id === id ? updatedClinic : c,
        ),
      );

      toast({
        title: newStatus ? t("Clinic Enabled") : t("Clinic Disabled"),
        description: `${clinic.name} ${t('has been')} ${newStatus ? t("enabled") : t("disabled")}.`,
      });
    } catch (error: any) {
      console.error('Error updating clinic status:', error);
      
      // Handle validation errors from backend
      if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        const validationErrors = error.response.data.errors;
        const errorMessages = validationErrors.map((err: any) => `${err.path}: ${err.msg}`).join(', ');
        toast({
          title: t("Validation Error"),
          description: errorMessages,
          variant: "destructive",
        });
      } else {
        toast({
          title: t("Error"),
          description: error.response?.data?.message || t("Failed to update clinic status. Please try again."),
          variant: "destructive",
        });
      }
    }
  };

  const handleViewClinic = (clinic: Clinic) => {
    setSelectedClinic(clinic);
    setIsViewModalOpen(true);
  };

  const handleEditClick = (clinic: Clinic) => {
    setSelectedClinic(clinic);
    setIsEditModalOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadge = (status: boolean) => {
    return status ? (
      <Badge className="bg-green-100 text-green-800">
        <CheckCircle className="h-3 w-3 mr-1" />
        {t('Active')}
      </Badge>
    ) : (
      <Badge className="bg-red-100 text-red-800">
        <AlertCircle className="h-3 w-3 mr-1" />
        {t('Inactive')}
      </Badge>
    );
  };

  // Statistics
  const totalClinics = clinics.length;
  const activeClinics = clinics.filter((clinic) => clinic.is_active).length;
  const inactiveClinics = totalClinics - activeClinics;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            {t('Clinics')}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t('Manage clinic locations and their settings')}
          </p>
        </div>
        <div className="flex-shrink-0">
          <Button onClick={() => setIsAddModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            {t('Add Clinic')}
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {t('Total Clinics')}
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {totalClinics}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Activity className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {t('Active Clinics')}
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {activeClinics}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-red-100 rounded-lg">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {t('Inactive Clinics')}
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {inactiveClinics}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:flex-wrap">
            {/* Search Bar */}
            <div className="relative flex-1 min-w-0 sm:min-w-[250px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('Search clinics...')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Clinics Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>{t('Clinic Directory')}</CardTitle>
            <CardDescription>
              {t('Complete list of clinic locations with their details and settings')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2">{t('Loading clinics...')}</span>
              </div>
            ) : (
              <>
                {/* Desktop Table View */}
                <div className="hidden md:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[200px]">{t('Clinic')}</TableHead>
                        <TableHead className="min-w-[200px]">{t('Contact')}</TableHead>
                        <TableHead className="min-w-[180px]">{t('Address')}</TableHead>
                        <TableHead className="min-w-[140px]">{t('Settings')}</TableHead>
                        <TableHead className="min-w-[100px]">{t('Status')}</TableHead>
                        <TableHead className="min-w-[100px]">{t('Created')}</TableHead>
                        <TableHead className="text-right min-w-[120px]">
                          {t('Actions')}
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredClinics.map((clinic) => (
                        <TableRow key={clinic.id}>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="font-medium flex items-center">
                                <Building2 className="h-4 w-4 mr-2 text-primary" />
                                {clinic.name}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {clinic.code}
                                {clinic.description && ` • ${clinic.description}`}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center text-sm">
                                <Mail className="h-3 w-3 mr-1 text-muted-foreground" />
                                {clinic.contact?.email || ''}
                              </div>
                              <div className="flex items-center text-sm">
                                <Phone className="h-3 w-3 mr-1 text-muted-foreground" />
                                {clinic.contact?.phone || ''}
                              </div>
                              {clinic.contact?.website && (
                                <div className="flex items-center text-sm">
                                  <Globe className="h-3 w-3 mr-1 text-gray-400" />
                                  {clinic.contact.website}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center text-sm">
                                <MapPin className="h-3 w-3 mr-1 text-gray-400" />
                                {clinic.address?.street || ''}
                              </div>
                                                          <div className="text-sm text-muted-foreground">
                              {clinic.address?.city || ''}, {clinic.address?.state || ''} {clinic.address?.zipCode || ''}
                            </div>
                            <div className="text-sm text-gray-500">
                              {clinic.address?.country || ''}
                            </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="text-sm">
                                <Badge variant="outline">{clinic.settings?.currency || ''}</Badge>
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {clinic.settings?.timezone || ''}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {t('Lang:')} {clinic.settings?.language?.toUpperCase() || ''}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(clinic.is_active)}</TableCell>
                          <TableCell>{formatDate(clinic.createdAt)}</TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="h-8">
                                  <MoreVertical className="h-4 w-4 mr-1" />
                                  {t('Actions')}
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => handleViewClinic(clinic)}
                                >
                                  {t('View Details')}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleEditClick(clinic)}
                                >
                                  {t('Edit Clinic')}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleToggleStatus(clinic.id, !clinic.is_active)}
                                >
                                  {clinic.is_active ? t("Disable") : t("Enable")} {t('Clinic')}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-4">
                  {filteredClinics.map((clinic) => (
                    <div
                      key={clinic.id}
                      className="border rounded-lg p-4 space-y-3 bg-white shadow-sm"
                    >
                      {/* Header with Clinic Name and Status */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Building2 className="h-5 w-5 text-blue-600" />
                          <div>
                            <div className="font-semibold text-lg">
                              {clinic.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {clinic.code}
                            </div>
                          </div>
                        </div>
                        {getStatusBadge(clinic.is_active)}
                      </div>

                      {/* Description */}
                      {clinic.description && (
                        <div className="text-sm text-gray-600 p-2 bg-gray-50 rounded">
                          {clinic.description}
                        </div>
                      )}

                      {/* Contact Information */}
                      <div className="space-y-2 p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center text-sm">
                          <Mail className="h-4 w-4 mr-2 text-gray-400" />
                          <span className="text-gray-900">{clinic.contact?.email || ''}</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <Phone className="h-4 w-4 mr-2 text-gray-400" />
                          <span className="text-gray-900">{clinic.contact?.phone || ''}</span>
                        </div>
                        {clinic.contact?.website && (
                          <div className="flex items-center text-sm">
                            <Globe className="h-4 w-4 mr-2 text-gray-400" />
                            <span className="text-gray-900">{clinic.contact.website}</span>
                          </div>
                        )}
                      </div>

                      {/* Address */}
                      <div className="space-y-1 p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center text-sm">
                          <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                          <span className="text-gray-900">{clinic.address?.street || ''}</span>
                        </div>
                        <div className="text-sm text-gray-600 ml-6">
                          {clinic.address?.city || ''}, {clinic.address?.state || ''} {clinic.address?.zipCode || ''}
                        </div>
                        <div className="text-sm text-gray-600 ml-6">
                          {clinic.address?.country || ''}
                        </div>
                      </div>

                      {/* Settings Grid */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <div className="text-xs text-gray-500 uppercase tracking-wide">
                            {t('Currency')}
                          </div>
                          <div className="text-sm font-medium">
                            {clinic.settings?.currency || ''}
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-xs text-gray-500 uppercase tracking-wide">
                            {t('Language')}
                          </div>
                          <div className="text-sm font-medium">
                            {clinic.settings?.language?.toUpperCase() || ''}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <div className="text-xs text-gray-500 uppercase tracking-wide">
                            {t('Timezone')}
                          </div>
                          <div className="text-sm font-medium">
                            {clinic.settings?.timezone || ''}
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-xs text-gray-500 uppercase tracking-wide">
                            {t('Created')}
                          </div>
                          <div className="text-sm">
                            {formatDate(clinic.createdAt)}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between pt-2 border-t">
                        <div className="text-xs text-gray-500">
                          {t('ID:')} {clinic.code}
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              <MoreVertical className="h-4 w-4 mr-1" />
                              {t('Actions')}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleViewClinic(clinic)}
                            >
                              {t('View Details')}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleEditClick(clinic)}
                            >
                              {t('Edit Clinic')}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleToggleStatus(clinic.id, !clinic.is_active)}
                            >
                              {clinic.is_active ? t("Disable") : t("Enable")} {t('Clinic')}
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
      </motion.div>

      {/* Modals */}
      <AddClinicModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddClinic}
      />
      
      {selectedClinic && (
        <>
          <EditClinicModal
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setSelectedClinic(null);
            }}
            onSubmit={handleEditClinic}
            clinic={selectedClinic}
          />
          <ViewClinicModal
            isOpen={isViewModalOpen}
            onClose={() => {
              setIsViewModalOpen(false);
              setSelectedClinic(null);
            }}
            clinic={selectedClinic}
          />
        </>
      )}
    </div>
  );
};

export default Clinics; 
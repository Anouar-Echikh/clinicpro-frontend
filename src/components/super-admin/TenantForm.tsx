import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Building2, AlertCircle } from "lucide-react";

import { Tenant } from "@/services/api/tenantApi";

interface TenantFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tenantData: any) => Promise<void>;
  tenant?: Tenant | null;
}

const TenantForm: React.FC<TenantFormProps> = ({
  isOpen,
  onClose,
  onSave,
  tenant
}) => {
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    email: '',
    phone: '',
    subdomain: '',
    logo_url: '',
    status: 'pending' as const
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-generate slug from name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .trim()
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  };

  // Reset form when dialog opens/closes or tenant changes
  useEffect(() => {
    if (isOpen) {
      if (tenant) {
        // Edit mode
        setFormData({
          name: tenant.name,
          slug: tenant.slug,
          email: tenant.email,
          phone: tenant.phone || '',
          subdomain: tenant.subdomain || '',
          logo_url: tenant.logo_url || '',
          status: tenant.status
        });
      } else {
        // Create mode
        setFormData({
          name: '',
          slug: '',
          email: '',
          phone: '',
          subdomain: '',
          logo_url: '',
          status: 'pending'
        });
      }
      setErrors({});
    }
  }, [isOpen, tenant]);

  // Auto-generate slug when name changes (only in create mode)
  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: !tenant ? generateSlug(name) : prev.slug // Only auto-generate for new tenants
    }));
  };

  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Organization name is required';
    }

    if (!formData.slug.trim()) {
      newErrors.slug = 'Slug is required';
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      newErrors.slug = 'Slug can only contain lowercase letters, numbers, and hyphens';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (formData.subdomain && !/^[a-z0-9-]+$/.test(formData.subdomain)) {
      newErrors.subdomain = 'Subdomain can only contain lowercase letters, numbers, and hyphens';
    }

    if (formData.logo_url && !/^https?:\/\/.+\.(jpg|jpeg|png|gif|svg)$/i.test(formData.logo_url)) {
      newErrors.logo_url = 'Please enter a valid image URL';
    }

    if (formData.phone && !/^\+?[\d\s\-\(\)]{10,}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onSave(formData);
      onClose();
    } catch (error: any) {
      console.error('Error saving tenant:', error);
      // Handle validation errors from API
      if (error.message?.includes('slug')) {
        setErrors({ slug: 'This slug is already taken' });
      } else if (error.message?.includes('subdomain')) {
        setErrors({ subdomain: 'This subdomain is already taken' });
      } else if (error.message?.includes('email')) {
        setErrors({ email: 'This email is already in use' });
      } else {
        setErrors({ general: error.message || 'An error occurred while saving' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center space-x-2">
            <Building2 className="h-5 w-5 text-blue-600" />
            <DialogTitle>
              {tenant ? `Edit ${tenant.name}` : 'Create New Tenant'}
            </DialogTitle>
          </div>
          <DialogDescription>
            {tenant 
              ? 'Update the tenant organization information below.'
              : 'Enter the details for the new tenant organization.'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Organization Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Acme Medical Center"
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && (
                  <p className="text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">URL Slug *</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => handleInputChange('slug', e.target.value)}
                  placeholder="acme-medical"
                  className={errors.slug ? "border-red-500" : ""}
                />
                {errors.slug && (
                  <p className="text-sm text-red-600">{errors.slug}</p>
                )}
                <p className="text-xs text-slate-500">
                  Will be used in URLs: clinicpro.com/{formData.slug}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Admin Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="admin@acmemedical.com"
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && (
                  <p className="text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  className={errors.phone ? "border-red-500" : ""}
                />
                {errors.phone && (
                  <p className="text-sm text-red-600">{errors.phone}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="subdomain">Sub Domain Name</Label>
                <div className="flex">
                  <Input
                    id="subdomain"
                    value={formData.subdomain}
                    onChange={(e) => handleInputChange('subdomain', e.target.value)}
                    placeholder="acme-medical"
                    className={`rounded-r-none ${errors.subdomain ? "border-red-500" : ""}`}
                  />
                  <span className="inline-flex items-center px-3 py-2 border border-l-0 border-slate-200 rounded-r bg-slate-50 text-slate-500 text-sm">
                    .clinicpro.com
                  </span>
                </div>
                {errors.subdomain && (
                  <p className="text-sm text-red-600">{errors.subdomain}</p>
                )}
                <p className="text-xs text-slate-500">
                  Optional subdomain for tenant access (e.g., acme-medical.clinicpro.com)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleInputChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="logo_url">Logo URL</Label>
              <Input
                id="logo_url"
                type="url"
                value={formData.logo_url}
                onChange={(e) => handleInputChange('logo_url', e.target.value)}
                placeholder="https://example.com/logo.png"
                className={errors.logo_url ? "border-red-500" : ""}
              />
              {errors.logo_url && (
                <p className="text-sm text-red-600">{errors.logo_url}</p>
              )}
              <p className="text-xs text-slate-500">
                URL to the organization's logo image
              </p>
            </div>
          </div>

          {/* Status Information */}
          {tenant && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Status Information:</strong> This tenant was created on{' '}
                {new Date(tenant.created_at).toLocaleDateString()} and last updated on{' '}
                {new Date(tenant.updated_at).toLocaleDateString()}.
              </AlertDescription>
            </Alert>
          )}
        </form>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                {tenant ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              tenant ? 'Update Tenant' : 'Create Tenant'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TenantForm;

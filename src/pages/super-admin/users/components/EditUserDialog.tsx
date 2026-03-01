import React, { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { 
  User, 
  Mail, 
  Phone, 
  Building2, 
  Shield, 
  Edit,
  Info,
  Crown,
  AlertTriangle
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface User {
  _id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  role: string;
  tenant_id: string | { _id: string; name: string; subdomain: string; status: string };
  tenant_id_string?: string; // The actual ID string for operations
  tenant_name?: string;
  is_active: boolean;
  created_at: string;
}

interface Tenant {
  _id?: string;
  id: string;
  name: string;
  slug: string;
  email: string;
  phone?: string;
  subdomain?: string;
  logo_url?: string;
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  created_by?: any;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

interface EditUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => Promise<void>;
  user: User;
  tenants: Tenant[];
}

// Form validation schema
const editUserSchema = z.object({
  first_name: z.string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must be less than 50 characters'),
  last_name: z.string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must be less than 50 characters'),
  email: z.string()
    .email('Please enter a valid email address')
    .min(1, 'Email is required'),
  phone: z.string()
    .optional()
    .refine((val) => !val || /^\+?[\d\s\-\(\)]+$/.test(val), 'Please enter a valid phone number'),
  tenant_id: z.string()
    .min(1, 'Please select an organization'),
  role: z.string()
    .min(1, 'Please select a role'),
  is_active: z.boolean(),
});

type EditUserFormData = z.infer<typeof editUserSchema>;

const EditUserDialog: React.FC<EditUserDialogProps> = ({
  open,
  onOpenChange,
  onSubmit,
  user,
  tenants
}) => {
  const [loading, setLoading] = useState(false);

  const getTenantId = (user: User): string => {
    if (user.tenant_id_string) return user.tenant_id_string;
    if (typeof user.tenant_id === 'object') return user.tenant_id._id;
    return user.tenant_id as string;
  };

  const form = useForm<EditUserFormData>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      phone: user.phone || '',
      tenant_id: getTenantId(user),
      role: user.role,
      is_active: user.is_active,
    },
  });

  // Update form values when user prop changes
  useEffect(() => {
    if (user) {
      form.reset({
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        phone: user.phone || '',
        tenant_id: getTenantId(user),
        role: user.role,
        is_active: user.is_active,
      });
    }
  }, [user, form]);

  const handleSubmit = async (data: EditUserFormData) => {
    try {
      setLoading(true);
      await onSubmit(data);
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: 'Error',
        description: 'Failed to update user',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.reset();
    onOpenChange(false);
  };

  const selectedTenant = tenants.find(t => (t._id || t.id) === form.watch('tenant_id'));
  const hasChanges = form.formState.isDirty;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Edit User: {user.first_name} {user.last_name}
          </DialogTitle>
          <DialogDescription>
            Update user information and organization assignment.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* User Info */}
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription className="text-sm">
                <strong>User ID:</strong> {user._id}
                <br />
                <strong>Created:</strong> {new Date(user.created_at).toLocaleDateString()}
              </AlertDescription>
            </Alert>

            {/* Personal Information */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="first_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="John" 
                        {...field} 
                        disabled={loading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="last_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Doe" 
                        {...field} 
                        disabled={loading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Contact Information */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input 
                        placeholder="john.doe@example.com" 
                        className="pl-10"
                        {...field} 
                        disabled={loading}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input 
                        placeholder="+1 (555) 123-4567" 
                        className="pl-10"
                        {...field} 
                        disabled={loading}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Organization Assignment */}
            <FormField
              control={form.control}
              name="tenant_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Organization</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    value={field.value}
                    disabled={loading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an organization" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {tenants.filter(t => t.status === 'active').map((tenant) => (
                        <SelectItem key={tenant._id || tenant.id} value={tenant._id || tenant.id}>
                          <div className="flex items-center space-x-2">
                            <Building2 className="h-4 w-4" />
                            <span>{tenant.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {tenant.subdomain || tenant.slug}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Changing organization will affect user's access permissions.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Role Selection */}
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    value={field.value}
                    disabled={loading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="super_admin">
                        <div className="flex items-center space-x-2">
                          <Crown className="h-4 w-4" />
                          <span>Super Admin</span>
                          <Badge className="bg-purple-100 text-purple-800 border-purple-200 text-xs">
                            Full Access
                          </Badge>
                        </div>
                      </SelectItem>
                      <SelectItem value="admin">
                        <div className="flex items-center space-x-2">
                          <Shield className="h-4 w-4" />
                          <span>Admin</span>
                          <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs">
                            Organization Admin
                          </Badge>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Status Toggles */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Active Status</FormLabel>
                      <FormDescription>
                        When disabled, user cannot log in to the system
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={loading}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

            </div>

            {/* Warning for tenant changes */}
            {form.watch('tenant_id') !== getTenantId(user) && (
              <Alert className="border-orange-200 bg-orange-50">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-orange-800">
                  <strong>Warning:</strong> Changing the organization will affect this user's access to clinics and data.
                  Make sure this change is intentional.
                </AlertDescription>
              </Alert>
            )}

            {/* Selected Organization Info */}
            {selectedTenant && (
              <Alert className="border-blue-200 bg-blue-50">
                <Building2 className="h-4 w-4" />
                <AlertDescription className="text-blue-800">
                  <strong>Organization:</strong> {selectedTenant.name}
                  <br />
                  <span className="text-sm">
                    Subdomain: <code className="bg-blue-100 px-1 rounded">{selectedTenant.subdomain || selectedTenant.slug}</code>
                  </span>
                </AlertDescription>
              </Alert>
            )}

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleCancel}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={loading || !hasChanges || !form.formState.isValid}
                className="min-w-[100px]"
              >
                {loading ? 'Updating...' : 'Update User'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditUserDialog;

import React, { useState } from 'react';
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
import { 
  User, 
  Mail, 
  Phone, 
  Building2, 
  Shield, 
  Eye, 
  EyeOff,
  Info,
  Crown
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

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

interface CreateUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => Promise<void>;
  tenants: Tenant[];
}

// Form validation schema
const createUserSchema = z.object({
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
  is_active: z.boolean().default(true),
});

type CreateUserFormData = z.infer<typeof createUserSchema>;

const DEFAULT_PASSWORD = 'password123'; // From userSeeder.ts

const CreateUserDialog: React.FC<CreateUserDialogProps> = ({
  open,
  onOpenChange,
  onSubmit,
  tenants
}) => {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      tenant_id: '',
      role: 'super_admin',
      is_active: true,
    },
  });

  const handleSubmit = async (data: CreateUserFormData) => {
    try {
      setLoading(true);
      
      // Add default password from seeder
      const submitData = {
        ...data,
        password: DEFAULT_PASSWORD, // Auto-filled password
        password_hash: DEFAULT_PASSWORD, // Will be hashed by backend
      };

      await onSubmit(submitData);
      
      // Reset form
      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating user:', error);
      toast({
        title: 'Error',
        description: 'Failed to create user',
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

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'super_admin':
        return <Crown className="h-4 w-4" />;
      case 'admin':
        return <Shield className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const selectedTenant = tenants.find(t => (t._id || t.id) === form.watch('tenant_id'));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Create Super Admin User
          </DialogTitle>
          <DialogDescription>
            Create a new super admin user and assign them to an organization.
            The password will be set to the default value automatically.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Default Password Info */}
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription className="text-sm">
                <strong>Default Password:</strong> The user will be created with password <code className="bg-gray-100 px-1 rounded">{DEFAULT_PASSWORD}</code>
                <br />
                <span className="text-muted-foreground">
                  Users should change this password after their first login.
                </span>
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
                  <FormLabel>Phone Number (Optional)</FormLabel>
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
                    defaultValue={field.value}
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
                    The organization this user will have super admin access to.
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
                    defaultValue={field.value}
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
                  <FormDescription>
                    Super Admin has full system access across all organizations.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Selected Organization Info */}
            {selectedTenant && (
              <Alert className="border-blue-200 bg-blue-50">
                <Building2 className="h-4 w-4" />
                <AlertDescription className="text-blue-800">
                  <strong>Selected Organization:</strong> {selectedTenant.name}
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
                disabled={loading || !form.formState.isValid}
                className="min-w-[100px]"
              >
                {loading ? 'Creating...' : 'Create User'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateUserDialog;

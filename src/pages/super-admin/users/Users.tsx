import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Users as UsersIcon, 
  Plus, 
  Search, 
  MoreVertical,
  Edit3,
  Trash2,
  Shield,
  Eye,
  EyeOff,
  Building2,
  Mail,
  Phone,
  Calendar,
  RefreshCw,
  UserCheck,
  UserX,
  Crown
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { superAdminUserApiService } from '@/services/api/superAdminUserApi';
import { tenantApiService } from '@/services/api/tenantApi';
import CreateUserDialog from './components/CreateUserDialog';
import EditUserDialog from './components/EditUserDialog';
import DeleteUserDialog from './components/DeleteUserDialog';

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
  avatar?: string;
  created_at: string;
  updated_at: string;
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

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Fetch users and tenants
  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch users and tenants in parallel
      const [usersResponse, tenantsResponse] = await Promise.all([
        superAdminUserApiService.getAllUsers(),
        tenantApiService.getAllTenants(1, 100) // Get up to 100 tenants
      ]);
      
      if (usersResponse.success && tenantsResponse) {
        // Extract tenant name from already populated tenant_id field
        const usersWithTenantNames = usersResponse.data.users.map(user => ({
          ...user,
          tenant_name: (user.tenant_id as any)?.name || 'Unknown',
          tenant_id_string: (user.tenant_id as any)?._id || user.tenant_id // Keep the original ID for operations
        }));
        
        setUsers(usersWithTenantNames);
        setTenants(tenantsResponse.tenants || []);
      } else {
        throw new Error('Failed to fetch data');
      }
    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load users data',
        variant: 'destructive',
      });
      
      // Set empty arrays on error
      setUsers([]);
      setTenants([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter users based on search term
  const filteredUsers = users.filter(user => 
    user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.tenant_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateUser = async (userData: any) => {
    try {
      const response = await superAdminUserApiService.createUser(userData);
      
      if (response.success) {
        toast({
          title: 'Success',
          description: response.message || 'User created successfully',
        });
        
        // Refresh data
        fetchData();
        setIsCreateDialogOpen(false);
      } else {
        throw new Error(response.message || 'Failed to create user');
      }
    } catch (error: any) {
      console.error('Error creating user:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create user',
        variant: 'destructive',
      });
    }
  };

  const handleEditUser = async (userData: any) => {
    try {
      if (!selectedUser) return;
      
      const response = await superAdminUserApiService.updateUser(selectedUser._id, userData);
      
      if (response.success) {
        toast({
          title: 'Success',
          description: response.message || 'User updated successfully',
        });
        
        // Refresh data
        fetchData();
        setIsEditDialogOpen(false);
        setSelectedUser(null);
      } else {
        throw new Error(response.message || 'Failed to update user');
      }
    } catch (error: any) {
      console.error('Error updating user:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update user',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteUser = async () => {
    try {
      if (!selectedUser) return;
      
      const response = await superAdminUserApiService.deleteUser(selectedUser._id);
      
      if (response.success) {
        toast({
          title: 'Success',
          description: response.message || 'User deleted successfully',
        });
        
        // Refresh data
        fetchData();
        setIsDeleteDialogOpen(false);
        setSelectedUser(null);
      } else {
        throw new Error(response.message || 'Failed to delete user');
      }
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete user',
        variant: 'destructive',
      });
    }
  };

  const toggleUserStatus = async (user: User) => {
    try {
      const response = await superAdminUserApiService.toggleUserStatus(user._id);
      
      if (response.success) {
        toast({
          title: 'Success',
          description: response.message || `User ${user.is_active ? 'deactivated' : 'activated'} successfully`,
        });
        
        // Refresh data
        fetchData();
      } else {
        throw new Error(response.message || 'Failed to update user status');
      }
    } catch (error: any) {
      console.error('Error toggling user status:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update user status',
        variant: 'destructive',
      });
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'super_admin':
        return <Crown className="h-4 w-4" />;
      case 'admin':
        return <Shield className="h-4 w-4" />;
      default:
        return <UsersIcon className="h-4 w-4" />;
    }
  };

  const getRoleBadge = (role: string) => {
    const variants = {
      super_admin: 'bg-purple-100 text-purple-800 border-purple-200',
      admin: 'bg-blue-100 text-blue-800 border-blue-200',
      doctor: 'bg-green-100 text-green-800 border-green-200',
      nurse: 'bg-cyan-100 text-cyan-800 border-cyan-200',
      staff: 'bg-gray-100 text-gray-800 border-gray-200'
    };

    return (
      <Badge className={`${variants[role as keyof typeof variants]} text-xs flex items-center gap-1`}>
        {getRoleIcon(role)}
        {role.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  const getStatusBadge = (user: User) => {
    if (!user.is_active) {
      return <Badge variant="destructive" className="text-xs">Inactive</Badge>;
    }
    return <Badge variant="default" className="text-xs bg-green-500">Active</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Super Admin Users</h1>
          <p className="text-muted-foreground">
            Manage super admin users across all tenant organizations
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            onClick={() => setIsCreateDialogOpen(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add User
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <UsersIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
            <p className="text-xs text-muted-foreground">
              Super admin users
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.filter(u => u.is_active).length}</div>
            <p className="text-xs text-muted-foreground">
              Currently active
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Super Admins</CardTitle>
            <Crown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.filter(u => u.role === 'super_admin').length}</div>
            <p className="text-xs text-muted-foreground">
              Super admin users
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Organizations</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tenants.length}</div>
            <p className="text-xs text-muted-foreground">
              Available tenants
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Users Management</CardTitle>
              <CardDescription>
                View and manage all super admin users in the system
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-[250px]"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
              <span className="ml-3 text-muted-foreground">Loading users...</span>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <UsersIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground font-medium">
                {searchTerm ? 'No users found matching your search' : 'No users found'}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {searchTerm ? 'Try adjusting your search terms' : 'Get started by adding your first user'}
              </p>
              {!searchTerm && (
                <Button
                  onClick={() => setIsCreateDialogOpen(true)}
                  className="mt-4"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add User
                </Button>
              )}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Organization</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user._id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-blue-600">
                            <span className="text-sm font-medium text-white">
                              {user.first_name.charAt(0)}{user.last_name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium">
                              {user.first_name} {user.last_name}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center text-sm">
                            <Mail className="h-3 w-3 mr-2 text-muted-foreground" />
                            {user.email}
                          </div>
                          {user.phone && (
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Phone className="h-3 w-3 mr-2" />
                              {user.phone}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        {getRoleBadge(user.role)}
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center text-sm">
                          <Building2 className="h-3 w-3 mr-2 text-muted-foreground" />
                          {user.tenant_name || 'Unknown'}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        {getStatusBadge(user)}
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3 mr-2" />
                          {new Date(user.created_at).toLocaleDateString()}
                        </div>
                      </TableCell>
                      
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 px-3 text-xs">
                              <MoreVertical className="h-4 w-4 mr-1" />
                              Actions
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedUser(user);
                                setIsEditDialogOpen(true);
                              }}
                            >
                              <Edit3 className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => toggleUserStatus(user)}
                            >
                              {user.is_active ? (
                                <>
                                  <UserX className="mr-2 h-4 w-4" />
                                  Deactivate
                                </>
                              ) : (
                                <>
                                  <UserCheck className="mr-2 h-4 w-4" />
                                  Activate
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedUser(user);
                                setIsDeleteDialogOpen(true);
                              }}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <CreateUserDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={handleCreateUser}
        tenants={tenants}
      />
      
      {selectedUser && (
        <>
          <EditUserDialog
            open={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
            onSubmit={handleEditUser}
            user={selectedUser}
            tenants={tenants}
          />
          
          <DeleteUserDialog
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
            onConfirm={handleDeleteUser}
            user={selectedUser}
          />
        </>
      )}
    </div>
  );
};

export default Users;

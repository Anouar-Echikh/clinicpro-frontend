import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  AlertTriangle, 
  Trash2, 
  User, 
  Building2, 
  Crown,
  Shield
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

interface DeleteUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
  user: User;
}

const DeleteUserDialog: React.FC<DeleteUserDialogProps> = ({
  open,
  onOpenChange,
  onConfirm,
  user
}) => {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    try {
      setLoading(true);
      await onConfirm();
      onOpenChange(false);
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete user',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <Trash2 className="h-5 w-5" />
            Delete User
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete the user account and remove all associated data.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Warning Alert */}
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>Warning:</strong> This action is irreversible. The user will lose access to all systems and their data will be permanently removed.
            </AlertDescription>
          </Alert>

          {/* User Information */}
          <div className="p-4 border rounded-lg bg-gray-50">
            <h4 className="font-medium text-gray-900 mb-3">User to be deleted:</h4>
            
            <div className="space-y-3">
              {/* User Details */}
              <div className="flex items-center space-x-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-blue-600">
                  <span className="text-sm font-medium text-white">
                    {user.first_name.charAt(0)}{user.last_name.charAt(0)}
                  </span>
                </div>
                <div>
                  <div className="font-medium text-gray-900">
                    {user.first_name} {user.last_name}
                  </div>
                  <div className="text-sm text-gray-600">
                    {user.email}
                  </div>
                  {user.phone && (
                    <div className="text-sm text-gray-600">
                      {user.phone}
                    </div>
                  )}
                </div>
              </div>

              {/* Role and Organization */}
              <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-1">Role</div>
                  {getRoleBadge(user.role)}
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-1">Organization</div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Building2 className="h-3 w-3 mr-1" />
                    {user.tenant_name || 'Unknown'}
                  </div>
                </div>
              </div>

              {/* Status and Creation Date */}
              <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-1">Status</div>
                  <div className="flex gap-2">
                    <Badge 
                      variant={user.is_active ? 'default' : 'destructive'} 
                      className="text-xs"
                    >
                      {user.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-1">Created</div>
                  <div className="text-sm text-gray-600">
                    {new Date(user.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Consequences */}
          <div className="text-sm text-gray-600">
            <p className="font-medium mb-2">This action will:</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Permanently delete the user account</li>
              <li>Revoke all access permissions</li>
              <li>Remove user from all clinic relationships</li>
              <li>Delete associated user data (non-recoverable)</li>
            </ul>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleCancel}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={loading}
            className="min-w-[100px]"
          >
            {loading ? 'Deleting...' : 'Delete User'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteUserDialog;

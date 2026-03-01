import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Search, Save, Building2, Users, CheckSquare, Square } from 'lucide-react';
import apiService from '@/services/api';
import { useClinic } from '@/contexts/ClinicContext';
import { useAuth } from '@/contexts/AuthContext';

type RoleSummary = {
  _id: string;
  name: string;
  display_name?: string;
  is_system_role: boolean;
  permissions: string[]; // permission names
};

type PermissionItem = {
  name: string;
  display_name: string;
  category?: string;
};

type User = {
  _id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: 'super_admin' | 'admin' | 'doctor' | 'nurse' | 'receptionist' | 'accountant' | 'staff';
  is_active: boolean;
};

type UserClinicAccess = {
  _id: string;
  user: User;
  clinics: {
    _id: string;
    name: string;
    code?: string;
    is_active: boolean;
  }[];
};

const Permissions: React.FC = () => {
  const { t } = useTranslation();
  const { currentClinic } = useClinic();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('role-permissions');
  
  // Role Permissions State
  const [roles, setRoles] = useState<RoleSummary[]>([]);
  const [permissions, setPermissions] = useState<PermissionItem[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('');
  const [saving, setSaving] = useState<boolean>(false);
  
  // Clinic Permissions State
  const [users, setUsers] = useState<User[]>([]);
  const [clinics, setClinics] = useState<any[]>([]);
  const [userClinicAccess, setUserClinicAccess] = useState<UserClinicAccess[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [clinicFilter, setClinicFilter] = useState<string>('');
  const [savingClinicAccess, setSavingClinicAccess] = useState<boolean>(false);
  const [loadingClinicPermissions, setLoadingClinicPermissions] = useState<boolean>(false);
  const [loadingUserClinicAccess, setLoadingUserClinicAccess] = useState<boolean>(false);
  const [refreshingAccessList, setRefreshingAccessList] = useState<boolean>(false);
  const [clinicPermissionsError, setClinicPermissionsError] = useState<string | null>(null);
  const [userClinicAccessCache, setUserClinicAccessCache] = useState<Map<string, any[]>>(new Map());

  const selectedRole = useMemo(() => roles.find(r => r._id === selectedRoleId) || null, [roles, selectedRoleId]);

  useEffect(() => {
    if (activeTab === 'role-permissions') {
      loadRolePermissions();
    } else if (activeTab === 'clinic-permissions') {
      loadClinicPermissions();
    }
  }, [activeTab]);

  const loadRolePermissions = async () => {
    try {
      // Backend endpoints assumed: /permissions (list) and /roles (list with permissions)
      const [permRes, roleRes] = await Promise.all([
        apiService.get<{ success: boolean; data: { permissions: PermissionItem[] } }>(`/permissions`),
        apiService.get<{ success: boolean; data: { roles: Array<{ _id: string; name: string; display_name?: string; is_system_role: boolean; effective_permissions?: string[] }> } }>(`/roles`),
      ]);

      const perms = permRes.data?.permissions || [];
      setPermissions(perms);

      const mappedRoles: RoleSummary[] = (roleRes.data?.roles || [])
        .filter(r => r.name !== 'super_admin') // Filter out super_admin role from display
        .map(r => ({
          _id: r._id,
          name: r.name,
          display_name: r.display_name,
          is_system_role: r.is_system_role,
          permissions: r.effective_permissions || [],
        }));
      setRoles(mappedRoles);
      if (mappedRoles.length > 0) setSelectedRoleId(mappedRoles[0]._id);
    } catch (error) {
      console.error('Error loading role permissions:', error);
    }
  };

  const loadClinicPermissions = async () => {
    setLoadingClinicPermissions(true);
    setClinicPermissionsError(null);
    
    try {
      // Load users and clinics for admin management
      const [usersRes, clinicsRes] = await Promise.all([
        apiService.getAllUsersForAdmin(),
        apiService.getAllClinicsForAdmin(),
      ]);

      const usersData = usersRes.data?.users || [];
      const clinicsData = clinicsRes.data?.clinics || [];
      
      setUsers(usersData);
      setClinics(clinicsData);
      
      // Initialize user clinic access with empty arrays - will be loaded when user is selected
      const initialUserAccess: UserClinicAccess[] = usersData.map(user => ({
        _id: user._id,
        user,
        clinics: []
      }));
      setUserClinicAccess(initialUserAccess);
      
      // Automatically load the first user's clinic access if users exist and no user is already selected
      if (usersData.length > 0 && !selectedUserId) {
        const firstUserId = usersData[0]._id;
        setSelectedUserId(firstUserId);
        // Load the first user's clinic access data without setting separate loading state
        // since we're still within the main loading operation
        try {
          const response = await apiService.get<{ success: boolean; data: { clinics: any[] } }>(`/clinics/user/${firstUserId}/access`);
          const clinicData = response.data?.clinics || [];
          
          // Cache the result
          setUserClinicAccessCache(prev => new Map(prev).set(firstUserId, clinicData));
          
          // Update the user clinic access
          setUserClinicAccess(prev => prev.map(ua => 
            ua._id === firstUserId ? { ...ua, clinics: clinicData } : ua
          ));
        } catch (error) {
          console.error(`Error loading clinic access for first user ${firstUserId}:`, error);
        }
      }
    } catch (error: any) {
      console.error('Error loading clinic permissions:', error);
      
      // Set appropriate error message
      if (error.response?.status === 403) {
        setClinicPermissionsError('Admin access required for clinic permissions management');
      } else if (error.response?.status === 401) {
        setClinicPermissionsError('Authentication required. Please log in again.');
      } else {
        setClinicPermissionsError('Failed to load clinic permissions. Please try again.');
      }
    } finally {
      setLoadingClinicPermissions(false);
    }
  };

  const loadUserClinicAccess = async (userId: string) => {
    // Check cache first
    if (userClinicAccessCache.has(userId)) {
      const cachedClinics = userClinicAccessCache.get(userId)!;
      setUserClinicAccess(prev => prev.map(ua => 
        ua._id === userId ? { ...ua, clinics: cachedClinics } : ua
      ));
      return;
    }

    setLoadingUserClinicAccess(true);
    try {
      const response = await apiService.get<{ success: boolean; data: { clinics: any[] } }>(`/clinics/user/${userId}/access`);
      const clinicData = response.data?.clinics || [];
      
      // Cache the result
      setUserClinicAccessCache(prev => new Map(prev).set(userId, clinicData));
      
      // Update the user clinic access
      setUserClinicAccess(prev => prev.map(ua => 
        ua._id === userId ? { ...ua, clinics: clinicData } : ua
      ));
    } catch (error) {
      console.error(`Error loading clinic access for user ${userId}:`, error);
    } finally {
      setLoadingUserClinicAccess(false);
    }
  };

  const handleUserSelection = async (userId: string) => {
    setSelectedUserId(userId);
    await loadUserClinicAccess(userId);
  };

  const togglePermission = (perm: string) => {
    if (!selectedRole) return;
    setRoles(prev => prev.map(r => r._id === selectedRole._id ? {
      ...r,
      permissions: r.permissions.includes(perm)
        ? r.permissions.filter(p => p !== perm)
        : [...r.permissions, perm]
    } : r));
  };

  const saveChanges = async () => {
    if (!selectedRole) return;
    setSaving(true);
    try {
      // Backend endpoint assumed: PUT /roles/:id/permissions { permissions: string[] }
      await apiService.put(`/roles/${selectedRole._id}/permissions`, {
        permissions: selectedRole.permissions
      });
    } finally {
      setSaving(false);
    }
  };

  const selectAllPermissions = () => {
    if (!selectedRole) return;
    const filteredPermissionNames = filteredPermissions.map(p => p.name);
    setRoles(prev => prev.map(r => r._id === selectedRole._id ? {
      ...r,
      permissions: [...new Set([...r.permissions, ...filteredPermissionNames])]
    } : r));
  };

  const deselectAllPermissions = () => {
    if (!selectedRole) return;
    const filteredPermissionNames = filteredPermissions.map(p => p.name);
    setRoles(prev => prev.map(r => r._id === selectedRole._id ? {
      ...r,
      permissions: r.permissions.filter(p => !filteredPermissionNames.includes(p))
    } : r));
  };

  const refreshAllUserClinicAccess = async () => {
    setRefreshingAccessList(true);
    try {
      // Clear all cache and reload all user clinic access data
      setUserClinicAccessCache(new Map());
      
      // Reload all users' clinic access data
      const updatedUserAccess = await Promise.all(
        users.map(async (user) => {
          try {
            const response = await apiService.get<{ success: boolean; data: { clinics: any[] } }>(`/clinics/user/${user._id}/access`);
            const clinicData = response.data?.clinics || [];
            
            // Update cache
            setUserClinicAccessCache(prev => new Map(prev).set(user._id, clinicData));
            
            return {
              _id: user._id,
              user,
              clinics: clinicData
            };
          } catch (error) {
            console.error(`Error loading clinic access for user ${user._id}:`, error);
            return {
              _id: user._id,
              user,
              clinics: []
            };
          }
        })
      );
      
      setUserClinicAccess(updatedUserAccess);
    } finally {
      setRefreshingAccessList(false);
    }
  };

  const toggleClinicAccess = async (userId: string, clinicId: string) => {
    const userAccess = userClinicAccess.find(ua => ua._id === userId);
    if (!userAccess) return;
    
    const hasAccess = userAccess.clinics.some(c => c._id === clinicId);
    
    // Optimistic update - update UI immediately for better UX
    const targetClinic = clinics.find(c => c._id === clinicId);
    if (!targetClinic) return;
    
    const updatedClinics = hasAccess 
      ? userAccess.clinics.filter(c => c._id !== clinicId)
      : [...userAccess.clinics, targetClinic];
    
    // Update UI state immediately
    setUserClinicAccess(prev => prev.map(ua => 
      ua._id === userId ? { ...ua, clinics: updatedClinics } : ua
    ));
    
    try {
      if (hasAccess) {
        // Remove access
        await apiService.delete(`/clinics/${clinicId}/users/${userId}`);
      } else {
        // Grant access  
        await apiService.post(`/clinics/${clinicId}/users`, {
          user_id: userId,
          role: 'staff', // Default role
          permissions: ['read_patients', 'read_appointments'] // Basic permissions
        });
      }
      
      // Refresh the entire access list after successful API call
      await refreshAllUserClinicAccess();
      
    } catch (error) {
      console.error('Error toggling clinic access:', error);
      
      // Refresh the entire access list on error to ensure consistency
      await refreshAllUserClinicAccess();
    }
  };

  const saveClinicPermissions = async () => {
    if (!selectedUserId) return;
    
    setSavingClinicAccess(true);
    try {
      // Refresh the entire access list to ensure all data is up to date
      await refreshAllUserClinicAccess();
    } finally {
      setSavingClinicAccess(false);
    }
  };

  const filteredPermissions = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return permissions;
    return permissions.filter(p => p.name.toLowerCase().includes(q) || p.display_name.toLowerCase().includes(q));
  }, [permissions, filter]);

  const filteredUsers = useMemo(() => {
    const q = clinicFilter.trim().toLowerCase();
    if (!q) return userClinicAccess;
    return userClinicAccess.filter(ua => 
      ua.user.first_name.toLowerCase().includes(q) || 
      ua.user.last_name.toLowerCase().includes(q) || 
      ua.user.email.toLowerCase().includes(q)
    );
  }, [userClinicAccess, clinicFilter]);

  const selectedUser = useMemo(() => {
    return userClinicAccess.find(ua => ua._id === selectedUserId) || null;
  }, [userClinicAccess, selectedUserId]);

  const allPermissionsSelected = useMemo(() => {
    if (!selectedRole || filteredPermissions.length === 0) return false;
    const filteredPermissionNames = filteredPermissions.map(p => p.name);
    return filteredPermissionNames.every(permName => selectedRole.permissions.includes(permName));
  }, [selectedRole, filteredPermissions]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Shield className="h-6 w-6"/> {t('Permissions')}</h1>
          <p className="text-muted-foreground">{t('Manage role and clinic permissions')} {currentClinic ? `${t('for')} ${currentClinic.name}` : ''}</p>
        </div>
      </div>

      {/* Super Admin Unrestricted Access Banner */}
      {user?.role === 'super_admin' && (
        <Card className="border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20">
          <CardContent className="flex items-center gap-4 py-4">
            <div className="flex items-center justify-center w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-full">
              <Shield className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700">
                  {t('Super Administrator')}
                </Badge>
              </div>
              <h3 className="font-semibold text-amber-900 dark:text-amber-100">
                {t('Unrestricted System Access')}
              </h3>
              <p className="text-sm text-amber-700 dark:text-amber-200">
                {t('As a Super Admin, you have unrestricted access to all features, permissions, and clinics. All permission checks are bypassed for your account.')}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-[400px] grid-cols-2">
          <TabsTrigger value="role-permissions" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            {t('Role Permissions')}
          </TabsTrigger>
          <TabsTrigger value="clinic-permissions" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            {t('Clinic Access')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="role-permissions" className="space-y-6">
          
          {/* Super Admin Note for Role Permissions */}
          {user?.role === 'super_admin' && (
            <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>{t('Note')}:</strong> {t('These role permissions do not apply to your Super Admin account. You automatically have access to all features regardless of role-based restrictions.')}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Roles list */}
            <Card>
              <CardHeader>
                <CardTitle>{t('Roles')}</CardTitle>
                <CardDescription>{t('Select a role to manage permissions')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {roles.map(role => (
                  <button
                    key={role._id}
                    onClick={() => setSelectedRoleId(role._id)}
                    className={`w-full flex items-center justify-between p-3 rounded-md border ${selectedRoleId === role._id ? 'bg-primary/5 border-primary' : 'border-muted'}`}
                  >
                    <div className="flex items-center gap-2">
                      <Badge variant={role.is_system_role ? 'default' : 'secondary'} className="capitalize">{role.name}</Badge>
                      {role.display_name && <span className="text-sm text-muted-foreground">{role.display_name}</span>}
                    </div>
                    <span className="text-xs text-muted-foreground">{role.permissions.length} {t('perms')}</span>
                  </button>
                ))}
              </CardContent>
            </Card>

            {/* Permissions matrix */}
            <Card className="lg:col-span-2">
              <CardHeader className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <CardTitle>{t('Permissions')}</CardTitle>
                  <Button size="sm" onClick={saveChanges} disabled={!selectedRole || saving}>
                    <Save className="h-4 w-4 mr-2"/>
                    {saving ? t('Saving...') : t('Save Changes')}
                  </Button>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder={t('Search permissions...')} className="pl-9" value={filter} onChange={e => setFilter(e.target.value)} />
                </div>
                {selectedRole && filteredPermissions.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={allPermissionsSelected ? deselectAllPermissions : selectAllPermissions}
                      className="flex items-center gap-2"
                    >
                      {allPermissionsSelected ? (
                        <>
                          <Square className="h-4 w-4" />
                          {t('Deselect All')}
                        </>
                      ) : (
                        <>
                          <CheckSquare className="h-4 w-4" />
                          {t('Select All')}
                        </>
                      )}
                    </Button>
                    <span className="text-xs text-muted-foreground">
                      {selectedRole.permissions.filter(p => filteredPermissions.some(fp => fp.name === p)).length} 
                      {t(' of ')} 
                      {filteredPermissions.length} 
                      {t(' selected')}
                    </span>
                  </div>
                )}
              </CardHeader>
              <Separator />
              <CardContent>
                {!selectedRole ? (
                  <div className="text-sm text-muted-foreground">{t('Select a role to view and update its permissions.')}</div>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-2 max-h-[60vh] overflow-auto pr-1">
                    {filteredPermissions.map(perm => {
                      const checked = selectedRole.permissions.includes(perm.name);
                      return (
                        <label key={perm.name} className={`flex items-center gap-3 p-2 rounded-md border ${checked ? 'bg-primary/5 border-primary' : 'border-muted'}`}>
                          <input type="checkbox" checked={checked} onChange={() => togglePermission(perm.name)} />
                          <div>
                            <div className="font-medium text-sm">{perm.display_name || perm.name}</div>
                            <div className="text-xs text-muted-foreground">{perm.name}</div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="clinic-permissions" className="space-y-6">
          
          {/* Super Admin Note for Clinic Permissions */}
          {user?.role === 'super_admin' && (
            <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
              <Building2 className="h-5 w-5 text-green-600 dark:text-green-400" />
              <p className="text-sm text-green-800 dark:text-green-200">
                <strong>{t('Note')}:</strong> {t('As Super Admin, you have unrestricted access to all clinics automatically. These clinic access controls do not affect your account.')}
              </p>
            </div>
          )}

          {clinicPermissionsError && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="text-red-800 text-sm">{clinicPermissionsError}</div>
              <button 
                onClick={() => loadClinicPermissions()} 
                className="mt-2 text-red-600 hover:text-red-800 text-sm underline"
              >
                Try Again
              </button>
            </div>
          )}
          
          {loadingClinicPermissions ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <div className="text-muted-foreground">Loading clinic permissions...</div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Users list */}
              <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  {t('Users')}
                </CardTitle>
                <CardDescription>{t('Select a user to manage clinic access')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder={t('Search users...')} 
                    className="pl-9" 
                    value={clinicFilter} 
                    onChange={e => setClinicFilter(e.target.value)} 
                  />
                </div>
                <div className="space-y-2 max-h-[60vh] overflow-auto pr-1">
                  {filteredUsers.map(userAccess => (
                    <button
                      key={userAccess._id}
                      onClick={() => handleUserSelection(userAccess._id)}
                      disabled={loadingUserClinicAccess && selectedUserId === userAccess._id}
                      className={`w-full flex items-center justify-between p-3 rounded-md border text-left ${selectedUserId === userAccess._id ? 'bg-primary/5 border-primary' : 'border-muted'} ${loadingUserClinicAccess && selectedUserId === userAccess._id ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">{userAccess.user.first_name} {userAccess.user.last_name}</span>
                        <span className="text-xs text-muted-foreground">{userAccess.user.email}</span>
                        <span className="text-xs font-medium text-blue-600 capitalize">{userAccess.user.role}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${userAccess.user.is_active ? 'bg-green-500' : 'bg-gray-400'}`} />
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Clinic Access Matrix */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    {t('Clinic Access')}
                  </CardTitle>
                  <Button size="sm" onClick={saveClinicPermissions} disabled={!selectedUser || savingClinicAccess || refreshingAccessList}>
                    <Save className="h-4 w-4 mr-2"/>
                    {savingClinicAccess || refreshingAccessList ? t('Refreshing...') : t('Refresh')}
                  </Button>
                </div>
                {selectedUser && (
                  <CardDescription>
                    {t('Managing clinic access for')} <strong>{selectedUser.user.first_name} {selectedUser.user.last_name}</strong>
                  </CardDescription>
                )}
              </CardHeader>
              <Separator />
              <CardContent>
                {!selectedUser ? (
                  <div className="text-sm text-muted-foreground">{t('Select a user to view and manage their clinic access.')}</div>
                ) : loadingUserClinicAccess ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
                      <div className="text-sm text-muted-foreground">Loading user clinic access...</div>
                    </div>
                  </div>
                ) : refreshingAccessList ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
                      <div className="text-sm text-muted-foreground">Refreshing access list...</div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[60vh] overflow-auto pr-1">
                    {clinics.map(clinic => {
                      const hasAccess = selectedUser.clinics.some(c => c._id === clinic._id);
                      return (
                        <label 
                          key={clinic._id} 
                          className={`flex items-center justify-between p-3 rounded-md border transition-colors ${
                            refreshingAccessList 
                              ? 'opacity-50 cursor-not-allowed border-muted' 
                              : hasAccess 
                              ? 'bg-primary/5 border-primary cursor-pointer' 
                              : 'border-muted hover:bg-muted/50 cursor-pointer'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <input 
                              type="checkbox" 
                              checked={hasAccess} 
                              disabled={refreshingAccessList}
                              onChange={() => toggleClinicAccess(selectedUser._id, clinic._id)}
                              className={refreshingAccessList ? 'cursor-not-allowed' : 'cursor-pointer'}
                            />
                            <div>
                              <div className="font-medium text-sm">{clinic.name}</div>
                              {clinic.code && (
                                <div className="text-xs text-muted-foreground">{t('Code')}: {clinic.code}</div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={hasAccess ? 'default' : 'secondary'} className="text-xs">
                              {hasAccess ? t('Access Granted') : t('No Access')}
                            </Badge>
                            <div className={`w-2 h-2 rounded-full ${clinic.is_active ? 'bg-green-500' : 'bg-gray-400'}`} />
                          </div>
                        </label>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Permissions;



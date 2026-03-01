import React, { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { apiService } from "@/services/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Save,
  Edit,
  Camera,
  Shield,
  Clock,
  Building,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isAvatarUploading, setIsAvatarUploading] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phone: user?.phone || "",
    address: user?.address || "",
    bio: user?.bio || "",
    dateOfBirth: user?.dateOfBirth ? (user.dateOfBirth.includes('T') ? user.dateOfBirth.split('T')[0] : user.dateOfBirth) : "",
    specialization: user?.specialization || "",
    licenseNumber: user?.licenseNumber || "",
    department: user?.department || "",
  });

  // Password change state
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Prepare the data for API
      const updateData: any = {
        first_name: profileData.firstName,
        last_name: profileData.lastName,
        phone: profileData.phone,
        address: profileData.address,
        bio: profileData.bio,
        specialization: profileData.specialization,
        license_number: profileData.licenseNumber,
        department: profileData.department,
      };

      // Handle date of birth separately - only include if provided and format correctly
      if (profileData.dateOfBirth) {
        // Ensure the date is in YYYY-MM-DD format for the API
        const dateValue = profileData.dateOfBirth;
        if (dateValue.includes('T')) {
          // If it's an ISO string, extract just the date part
          updateData.date_of_birth = dateValue.split('T')[0];
        } else {
          // If it's already in YYYY-MM-DD format, use as is
          updateData.date_of_birth = dateValue;
        }
      }

      // Remove empty fields
      Object.keys(updateData).forEach(key => {
        if (!updateData[key as keyof typeof updateData]) {
          delete updateData[key as keyof typeof updateData];
        }
      });

      const updatedUser = await apiService.updateProfile(updateData);
      
      if (updateUser) {
        updateUser(updatedUser);
      }
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
      setIsEditing(false);
    } catch (error: any) {
      console.error('Profile update error:', error);
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setProfileData({
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      phone: user?.phone || "",
      address: user?.address || "",
      bio: user?.bio || "",
      dateOfBirth: user?.dateOfBirth ? (user.dateOfBirth.includes('T') ? user.dateOfBirth.split('T')[0] : user.dateOfBirth) : "",
      specialization: user?.specialization || "",
      licenseNumber: user?.licenseNumber || "",
      department: user?.department || "",
    });
    setIsEditing(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const getRoleDisplayName = (role: string) => {
    const roleMap: { [key: string]: string } = {
      admin: "Administrator",
      doctor: "Doctor",
      nurse: "Nurse",
      receptionist: "Receptionist",
      accountant: "Accountant",
    };
    return roleMap[role] || role;
  };

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
  };

  const handleChangePassword = async () => {
    // Validation
    if (!passwordData.currentPassword) {
      toast({
        title: "Error",
        description: "Please enter your current password.",
        variant: "destructive",
      });
      return;
    }

    if (!passwordData.newPassword) {
      toast({
        title: "Error",
        description: "Please enter a new password.",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        title: "Error",
        description: "New password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(passwordData.newPassword)) {
      toast({
        title: "Error",
        description: "New password must contain at least one uppercase letter, one lowercase letter, and one number.",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Error",
        description: "New password and confirmation do not match.",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.currentPassword === passwordData.newPassword) {
      toast({
        title: "Error",
        description: "New password must be different from current password.",
        variant: "destructive",
      });
      return;
    }

    setIsPasswordLoading(true);
    try {
      await apiService.changePassword(passwordData.currentPassword, passwordData.newPassword);
      
      toast({
        title: "Success",
        description: "Password changed successfully.",
      });
      
      // Reset form and close modal
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setIsPasswordModalOpen(false);
    } catch (error: any) {
      console.error('Password change error:', error);
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Failed to change password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsPasswordLoading(false);
    }
  };

  const handlePasswordModalClose = () => {
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setIsPasswordModalOpen(false);
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Error",
        description: "Please select a valid image file (JPEG, PNG, WebP).",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "File size must be less than 5MB.",
        variant: "destructive",
      });
      return;
    }

    setIsAvatarUploading(true);
    try {
      const result = await apiService.uploadAvatar(file);
      
      console.log('🎉 Avatar upload successful!');
      console.log('New avatar URL:', result.avatar);
      console.log('Current user avatar before update:', user?.avatar);
      
      // Add timestamp to prevent caching issues
      const avatarUrlWithTimestamp = `${result.avatar}?t=${Date.now()}`;
      updateUser({ avatar: avatarUrlWithTimestamp });
      
      console.log('User context updated with new avatar:', avatarUrlWithTimestamp);
      toast({
        title: "Success",
        description: "Profile picture updated successfully.",
      });
    } catch (error: any) {
      console.error('Avatar upload error:', error);
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Failed to upload profile picture. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAvatarUploading(false);
      // Reset the input
      event.target.value = '';
    }
  };

  const handleRemoveAvatar = async () => {
    setIsAvatarUploading(true);
    try {
      await apiService.removeAvatar();
      
      console.log('🗑️ Avatar removed successfully');
      updateUser({ avatar: undefined });
      toast({
        title: "Success",
        description: "Profile picture removed successfully.",
      });
    } catch (error: any) {
      console.error('Avatar removal error:', error);
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Failed to remove profile picture. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAvatarUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            My Profile
          </h1>
          <p className="text-gray-600 mt-1">
            Manage your personal information and account settings
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isLoading}>
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Overview Card */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center">
                <div className="relative">
                  <Avatar className="h-24 w-24">
                    <AvatarImage 
                      src={user?.avatar} 
                      alt={user?.firstName}
                      className="object-cover"
                      onLoad={() => console.log('✅ Avatar image loaded successfully:', user?.avatar)}
                      onError={(e) => console.log('❌ Avatar image failed to load:', user?.avatar, e)}
                    />
                    <AvatarFallback className="text-2xl">
                      {user?.firstName?.charAt(0)}
                      {user?.lastName?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-2 -right-2 flex space-x-1">
                    {user?.avatar && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-6 w-6 rounded-full p-0"
                        onClick={handleRemoveAvatar}
                        disabled={isAvatarUploading}
                        title="Remove avatar"
                      >
                        <span className="text-xs">×</span>
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 w-8 rounded-full p-0"
                      disabled={isAvatarUploading}
                      onClick={() => document.getElementById('avatar-upload')?.click()}
                      title="Change avatar"
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                  </div>
                  {isAvatarUploading && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>
                <div className="mt-4 space-y-2">
                  <h3 className="text-xl font-semibold">
                    {user?.firstName} {user?.lastName}
                  </h3>
                  <Badge variant="secondary" className="capitalize">
                    {getRoleDisplayName(user?.role || "")}
                  </Badge>
                  {user?.specialization && (
                    <p className="text-sm text-gray-600">{user.specialization}</p>
                  )}
                </div>
                <Separator className="my-4" />
                <div className="space-y-3 w-full">
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="truncate">{user?.email}</span>
                  </div>
                  {user?.phone && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span>{user.phone}</span>
                    </div>
                  )}
                  {user?.department && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Building className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span>{user.department}</span>
                    </div>
                  )}
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span>Joined {new Date(user?.createdAt || Date.now()).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Profile Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Personal Information
              </CardTitle>
              <CardDescription>
                Update your personal details and contact information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  {isEditing ? (
                    <Input
                      id="firstName"
                      value={profileData.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                    />
                  ) : (
                    <div className="text-sm p-3 bg-gray-50 rounded-md">
                      {profileData.firstName || "Not provided"}
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  {isEditing ? (
                    <Input
                      id="lastName"
                      value={profileData.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                    />
                  ) : (
                    <div className="text-sm p-3 bg-gray-50 rounded-md">
                      {profileData.lastName || "Not provided"}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  {isEditing ? (
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                    />
                  ) : (
                    <div className="text-sm p-3 bg-gray-50 rounded-md">
                      {profileData.email || "Not provided"}
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  {isEditing ? (
                    <Input
                      id="phone"
                      value={profileData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                    />
                  ) : (
                    <div className="text-sm p-3 bg-gray-50 rounded-md">
                      {profileData.phone || "Not provided"}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                {isEditing ? (
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={profileData.dateOfBirth ? new Date(profileData.dateOfBirth).toISOString().split('T')[0] : ''}
                    onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                  />
                ) : (
                  <div className="text-sm p-3 bg-gray-50 rounded-md">
                    {profileData.dateOfBirth 
                      ? new Date(profileData.dateOfBirth).toLocaleDateString()
                      : "Not provided"
                    }
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                {isEditing ? (
                  <Textarea
                    id="address"
                    value={profileData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    rows={3}
                  />
                ) : (
                  <div className="text-sm p-3 bg-gray-50 rounded-md min-h-[80px]">
                    {profileData.address || "Not provided"}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                {isEditing ? (
                  <Textarea
                    id="bio"
                    value={profileData.bio}
                    onChange={(e) => handleInputChange("bio", e.target.value)}
                    rows={4}
                    placeholder="Tell us about yourself..."
                  />
                ) : (
                  <div className="text-sm p-3 bg-gray-50 rounded-md min-h-[100px]">
                    {profileData.bio || "No bio provided"}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Professional Information */}
          {(user?.role === "doctor" || user?.role === "nurse") && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Professional Information
                </CardTitle>
                <CardDescription>
                  Update your professional credentials and specialization
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="specialization">Specialization</Label>
                    {isEditing ? (
                      <Input
                        id="specialization"
                        value={profileData.specialization}
                        onChange={(e) => handleInputChange("specialization", e.target.value)}
                      />
                    ) : (
                      <div className="text-sm p-3 bg-gray-50 rounded-md">
                        {profileData.specialization || "Not specified"}
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="licenseNumber">License Number</Label>
                    {isEditing ? (
                      <Input
                        id="licenseNumber"
                        value={profileData.licenseNumber}
                        onChange={(e) => handleInputChange("licenseNumber", e.target.value)}
                      />
                    ) : (
                      <div className="text-sm p-3 bg-gray-50 rounded-md">
                        {profileData.licenseNumber || "Not provided"}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  {isEditing ? (
                    <Select
                      value={profileData.department}
                      onValueChange={(value) => handleInputChange("department", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cardiology">Cardiology</SelectItem>
                        <SelectItem value="dermatology">Dermatology</SelectItem>
                        <SelectItem value="emergency">Emergency Medicine</SelectItem>
                        <SelectItem value="general">General Medicine</SelectItem>
                        <SelectItem value="neurology">Neurology</SelectItem>
                        <SelectItem value="orthopedics">Orthopedics</SelectItem>
                        <SelectItem value="pediatrics">Pediatrics</SelectItem>
                        <SelectItem value="psychiatry">Psychiatry</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="text-sm p-3 bg-gray-50 rounded-md">
                      {profileData.department || "Not assigned"}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Account Security */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Account Security
              </CardTitle>
              <CardDescription>
                Manage your account security settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">Password</h4>
                  <p className="text-sm text-gray-600">
                    Last updated {new Date(user?.updatedAt || Date.now()).toLocaleDateString()}
                  </p>
                </div>
                <Dialog open={isPasswordModalOpen} onOpenChange={setIsPasswordModalOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Lock className="h-4 w-4 mr-2" />
                      Change Password
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Change Password</DialogTitle>
                      <DialogDescription>
                        Enter your current password and choose a new secure password.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      {/* Current Password */}
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword">Current Password</Label>
                        <div className="relative">
                          <Input
                            id="currentPassword"
                            type={showCurrentPassword ? "text" : "password"}
                            value={passwordData.currentPassword}
                            onChange={(e) => handlePasswordChange("currentPassword", e.target.value)}
                            placeholder="Enter current password"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          >
                            {showCurrentPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>

                      {/* New Password */}
                      <div className="space-y-2">
                        <Label htmlFor="newPassword">New Password</Label>
                        <div className="relative">
                          <Input
                            id="newPassword"
                            type={showNewPassword ? "text" : "password"}
                            value={passwordData.newPassword}
                            onChange={(e) => handlePasswordChange("newPassword", e.target.value)}
                            placeholder="Enter new password"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                          >
                            {showNewPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                        <p className="text-xs text-gray-500">
                          Password must be at least 6 characters with uppercase, lowercase, and numbers.
                        </p>
                      </div>

                      {/* Confirm Password */}
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                        <div className="relative">
                          <Input
                            id="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            value={passwordData.confirmPassword}
                            onChange={(e) => handlePasswordChange("confirmPassword", e.target.value)}
                            placeholder="Confirm new password"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center justify-end space-x-2 pt-4">
                        <Button variant="outline" onClick={handlePasswordModalClose}>
                          Cancel
                        </Button>
                        <Button
                          onClick={handleChangePassword}
                          disabled={isPasswordLoading}
                        >
                          {isPasswordLoading ? "Changing..." : "Change Password"}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile; 
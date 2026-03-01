import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Eye, EyeOff, Crown } from "lucide-react";
import { superAdminApiService } from "@/services/api/superAdminApi";
import { toast } from "@/hooks/use-toast";

const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;

const AdminChangePassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!passwordData.currentPassword) {
      toast({
        title: "Error",
        description: "Current password is required.",
        variant: "destructive",
      });
      return;
    }

    if (!passwordData.newPassword) {
      toast({
        title: "Error",
        description: "New password is required.",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast({
        title: "Error",
        description: "New password must be at least 8 characters.",
        variant: "destructive",
      });
      return;
    }

    if (!PASSWORD_REGEX.test(passwordData.newPassword)) {
      toast({
        title: "Error",
        description:
          "New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&).",
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

    setIsLoading(true);
    try {
      await superAdminApiService.changePassword({
        current_password: passwordData.currentPassword,
        new_password: passwordData.newPassword,
      });

      toast({
        title: "Success",
        description: "Password changed successfully.",
      });

      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: unknown) {
      console.error("Password change error:", error);
      const message =
        error instanceof Error ? error.message : "Failed to change password. Please try again.";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center space-x-2">
        <Crown className="h-8 w-8 text-purple-600" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Change Password
          </h1>
          <p className="text-slate-600 mt-1">
            Update your Super Admin account password
          </p>
        </div>
      </div>

      {/* Change Password Card */}
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Lock className="h-5 w-5 mr-2" />
            Account Security
          </CardTitle>
          <CardDescription>
            Enter your current password and choose a new secure password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Current Password */}
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showCurrentPassword ? "text" : "password"}
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    handlePasswordChange("currentPassword", e.target.value)
                  }
                  placeholder="Enter current password"
                  className="pr-10"
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
                  onChange={(e) =>
                    handlePasswordChange("newPassword", e.target.value)
                  }
                  placeholder="Enter new password"
                  className="pr-10"
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
              <p className="text-xs text-slate-500">
                Password must be at least 8 characters with uppercase, lowercase,
                number, and special character (@$!%*?&).
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
                  onChange={(e) =>
                    handlePasswordChange("confirmPassword", e.target.value)
                  }
                  placeholder="Confirm new password"
                  className="pr-10"
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

            {/* Submit Button */}
            <div className="pt-4">
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                {isLoading ? "Changing..." : "Change Password"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminChangePassword;

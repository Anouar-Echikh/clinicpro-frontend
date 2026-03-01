import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Menu,
  LogOut,
  User,
  X,
  Plus,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { CurrencySelector } from "@/components/ui/CurrencySelector";
import { TimezoneSelector } from "@/components/ui/TimezoneSelector";
import { CurrencyDisplay } from "@/components/ui/CurrencyDisplay";
import ErrorBoundary from "@/components/ui/ErrorBoundary";
import ClinicSwitcher from "@/components/ClinicSwitcher";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { LanguageSelector } from "@/components/ui/LanguageSelector";
import { useTranslation } from "react-i18next";

interface TopBarProps {
  onMenuClick: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
  };

  const handleProfileClick = () => {
    navigate("/dashboard/profile");
  };

  return (
    <header className="bg-background border-b border-border">
      <div className="px-2 xs:px-3 sm:px-4 lg:px-6 py-2 sm:py-3">
        <div className="flex items-center justify-between">
          {/* Left side - Menu */}
          <div className="flex items-center space-x-1 xs:space-x-2 sm:space-x-4 flex-1">
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onMenuClick}
              className="lg:hidden p-2 h-9 w-9 touch-manipulation"
            >
              <Menu className="h-5 w-5" />
            </Button>
            
            {/* Clinic Switcher - Always visible and prominent */}
            <div className="flex-1 max-w-xs">
              <ErrorBoundary>
                <ClinicSwitcher />
              </ErrorBoundary>
            </div>
          </div>

          {/* Right side - Actions and User Menu */}
          <div className="flex items-center space-x-1 xs:space-x-2 sm:space-x-3">
            {/* Theme Toggle */}
            <ThemeToggle className="h-9 w-9 sm:h-10 sm:w-10" />
            {/* Language Selector */}
            <LanguageSelector />
            
            {/* Timezone Selector - Hidden on small screens */}
            <div className="hidden md:block">
              <TimezoneSelector variant="compact" showLabel={false} />
            </div>
            {/* Currency Selector - Hidden on small screens */}
            <div className="hidden md:block">
              <CurrencySelector variant="compact" showLabel={false} />
            </div>

            {/* User menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-9 w-9 sm:h-10 sm:w-10 rounded-full p-0 touch-manipulation"
                >
                  <Avatar className="h-9 w-9 sm:h-10 sm:w-10">
                    <AvatarImage src={user?.avatar} alt={user?.firstName} />
                    <AvatarFallback className="text-xs sm:text-sm">
                      {user?.firstName?.charAt(0)}
                      {user?.lastName?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-64 max-w-[calc(100vw-2rem)]"
                align="end"
                forceMount
              >
                <DropdownMenuLabel className="font-normal p-3">
                  <div className="flex flex-col space-y-2">
                    <p className="text-sm font-medium leading-none truncate">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground truncate">
                      {user?.email}
                    </p>
                    <Badge
                      variant="secondary"
                      className="w-fit text-xs mt-1 capitalize"
                    >
                      {user?.role}
                    </Badge>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                {/* Mobile-only utility items - Removed ClinicSwitcher since it's now always visible */}
                
                <div className="md:hidden">
                  <DropdownMenuItem className="py-3">
                    <ErrorBoundary>
                      <div className="flex items-center space-x-2 w-full">
                        <span className="text-sm">{t("Timezone:")}</span>
                        <TimezoneSelector variant="compact" showLabel={false} />
                      </div>
                    </ErrorBoundary>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="py-3">
                    <ErrorBoundary>
                      <div className="flex items-center space-x-2 w-full">
                        <span className="text-sm">{t("Currency:")}</span>
                        <CurrencySelector variant="compact" showLabel={false} />
                      </div>
                    </ErrorBoundary>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </div>

                <DropdownMenuItem onClick={handleProfileClick} className="py-3">
                  <User className="mr-2 h-4 w-4" />
                  <span>{t("Profile")}</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="py-3">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>{t("Log out")}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;

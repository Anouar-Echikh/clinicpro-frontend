import React, { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import SuperAdminSidebar from "./SuperAdminSidebar";
import { Button } from "@/components/ui/button";
import { Menu, Crown } from "lucide-react";
import { superAdminApiService } from "@/services/api/superAdminApi";
import { Badge } from "@/components/ui/badge";

const SuperAdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();

  // Check if super admin is authenticated
  useEffect(() => {
    if (!superAdminApiService.isAuthenticated()) {
      navigate("/admin");
      return;
    }
  }, [navigate]);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024);
      // Auto-close sidebar on mobile when screen size changes
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false);
      }
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const closeSidebar = () => setSidebarOpen(false);
  const openSidebar = () => setSidebarOpen(true);

  // Get current super admin info
  const currentSuperAdmin = superAdminApiService.getCurrentSuperAdmin();

  if (!superAdminApiService.isAuthenticated()) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-slate-50 flex overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block lg:fixed lg:inset-y-0 lg:w-72 lg:z-50">
        <SuperAdminSidebar isOpen={true} onClose={() => {}} />
      </div>

      {/* Mobile Sidebar */}
      {isMobile && (
        <>
          <div
            className={`fixed inset-0 z-50 lg:hidden transition-opacity duration-300 ${
              sidebarOpen
                ? "opacity-100 pointer-events-auto"
                : "opacity-0 pointer-events-none"
            }`}
          >
            <div
              className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
              onClick={closeSidebar}
            />
            <div
              className={`absolute left-0 top-0 h-full w-72 transform transition-transform duration-300 ease-in-out ${
                sidebarOpen ? "translate-x-0" : "-translate-x-full"
              }`}
            >
              <SuperAdminSidebar isOpen={sidebarOpen} onClose={closeSidebar} />
            </div>
          </div>
        </>
      )}

      {/* Main Content */}
      <div className="flex-1 lg:pl-72">
        {/* Top Bar */}
        <header className="sticky top-0 z-40 flex h-16 items-center gap-x-4 border-b border-slate-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={openSidebar}
            className="lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Breadcrumb / Page Title */}
          <div className="flex-1 flex items-center">
            <div className="flex items-center space-x-2">
              <Crown className="h-5 w-5 text-purple-600" />
              <h1 className="text-lg font-semibold text-slate-900">Super Admin Dashboard</h1>
              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                System Management
              </Badge>
            </div>
          </div>

          {/* User Info */}
          <div className="hidden sm:flex items-center space-x-3">
            <div className="text-right">
              <div className="text-sm font-medium text-slate-900">
                {currentSuperAdmin ? `${currentSuperAdmin.first_name} ${currentSuperAdmin.last_name}` : 'Super Admin'}
              </div>
              <div className="text-xs text-slate-500">
                System Administrator
              </div>
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-blue-600">
              <Crown className="h-4 w-4 text-white" />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1">
          <div className="p-4 sm:p-6 lg:p-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              <Outlet />
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SuperAdminLayout;

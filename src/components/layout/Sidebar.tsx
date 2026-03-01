/**
 * Sidebar Navigation Component with Tenant-Based Permission System
 * 
 * This component implements a tenant-aware navigation system where:
 * - All permissions are scoped to the current user's tenant
 * - Super Admin and Admin roles bypass all permission checks
 * - Regular users only see navigation items they have permissions for
 * - The hasPermission() function automatically filters by tenant context
 * - Navigation visibility is determined by both role and tenant-specific permissions
 */
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useClinic } from "@/contexts/ClinicContext";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
  Home,
  Users,
  Calendar,
  UserPlus,
  DollarSign,
  Package,
  UserCheck,
  Receipt,
  Stethoscope,
  CalendarDays,
  BarChart3,
  Settings,
  X,
  Shield,
  CreditCard,
  FileText,
  Briefcase,
  TestTube2,
  Building,
  ChevronDown,
  ChevronRight,
  Clock,
  Droplets,
  Folder,
  Activity,
  Building2,
  Brain,
  Zap,
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  permission?: string;
  permissions?: string[]; // Multiple permissions (OR logic)
  requiresAnyPermission?: boolean; // If true, user needs any of the permissions; if false, user needs all permissions
}

interface NavigationSection {
  title: string;
  items: NavigationItem[];
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { t } = useTranslation();
  const { user } = useAuth();
  const { hasPermission } = useClinic();
  const [isTestModulesOpen, setIsTestModulesOpen] = useState(false);

  // Permission-based navigation configuration
  const navigationSections: NavigationSection[] = [
    {
      title: t("Overview"),
      items: [
        {
          name: t("Dashboard"),
          href: "/dashboard",
          icon: Home,
          // Dashboard should be accessible to all authenticated users
        },
        {
          name: t("Dental AI X-ray Analysis"),
          href: "/dashboard/xray-analysis",
          icon: Brain,
          badge: "AI",
          permission: "xray_analysis.view",
        },
        {
          name: t("AI Test Report Analysis"),
          href: "/dashboard/ai-test-analysis",
          icon: TestTube2,
          badge: "AI",
          permission: "test_reports.view",
        },
        {
          name: t("Compare Test Reports using AI"),
          href: "/dashboard/ai-test-comparison",
          icon: BarChart3,
          badge: "AI",
          permission: "test_reports.view",
        },
      ],
    },
    {
      title: t("Patient Management"),
      items: [
        {
          name: t("Patients"),
          href: "/dashboard/patients",
          icon: Users,
          permission: "patients.view",
        },
        {
          name: t("Appointments"),
          href: "/dashboard/appointments",
          icon: Calendar,
          permission: "appointments.view",
        },
        {
          name: t("Leads"),
          href: "/dashboard/leads",
          icon: UserPlus,
          // Updated to use correct permission name
          permissions: ["patients.create", "leads.view"],
          requiresAnyPermission: true,
        },
        {
          name: t("Prescriptions"),
          href: "/dashboard/prescriptions",
          icon: Stethoscope,
          permission: "prescriptions.view",
        },
        {
          name: t("Odontogram"),
          href: "/dashboard/odontograms",
          icon: Zap,
          badge: "Dental",
          permission: "odontogram.view",
        },
        {
          name: t("Test Reports"),
          href: "/dashboard/test-reports",
          icon: FileText,
          permission: "test_reports.view",
        },
      ],
    },
    {
      title: t("Financial Management"),
      items: [
        {
          name: t("Billing"),
          href: "/dashboard/billing",
          icon: DollarSign,
          permissions: ["invoices.view", "payments.view"],
          requiresAnyPermission: true,
        },
        {
          name: t("Invoices"),
          href: "/dashboard/invoices",
          icon: Receipt,
          permission: "invoices.view",
        },
        {
          name: t("Payments"),
          href: "/dashboard/payments",
          icon: CreditCard,
          permission: "payments.view",
        },
        {
          name: t("Payroll"),
          href: "/dashboard/payroll",
          icon: Briefcase,
          permission: "payroll.view",
        },
        {
          name: t("Expenses"),
          href: "/dashboard/expenses",
          icon: FileText,
          permission: "expenses.view",
        },
        {
          name: t("Performance"),
          href: "/dashboard/performance",
          icon: BarChart3,
          permission: "analytics.reports",
        },
      ],
    },
    {
      title: t("Operations"),
      items: [
        {
          name: t("Services"),
          href: "/dashboard/services",
          icon: Activity,
          permission: "services.view",
        },
        {
          name: t("Departments"),
          href: "/dashboard/departments",
          icon: Building2,
          permission: "departments.view",
        },
        {
          name: t("Clinics"),
          href: "/dashboard/clinics",
          icon: Building2,
          permission: "clinics.view",
        },
        {
          name: t("Permissions"),
          href: "/dashboard/permissions",
          icon: Shield,
          permission: "permissions.view",
        },
        {
          name: t("Inventory"),
          href: "/dashboard/inventory",
          icon: Package,
          permission: "inventory.view",
        },
        {
          name: t("Staff"),
          href: "/dashboard/staff",
          icon: UserCheck,
          permission: "users.view",
        },
        {
          name: t("Lab Vendors"),
          href: "/dashboard/lab-vendors",
          icon: Building,
          permission: "lab_vendors.view",
        },
      ],
    },
    {
      title: t("Analytics & Reports"),
      items: [
        {
          name: t("Calendar"),
          href: "/dashboard/calendar",
          icon: CalendarDays,
          permission: "appointments.view",
        },
        {
          name: t("Reports"),
          href: "/dashboard/reports",
          icon: BarChart3,
          permissions: ["analytics.reports", "analytics.dashboard"],
          requiresAnyPermission: true,
        },
      ],
    },

  ];

  // Always use the main navigation sections - permissions will filter what's shown
  const sectionsToShow = navigationSections;

  const isActiveLink = (href: string) => {
    if (href === "/dashboard") {
      return location.pathname === "/dashboard";
    }
    return location.pathname.startsWith(href);
  };

  const canAccessItem = (item: NavigationItem) => {
    // Super Admin and Admin users have access to everything - bypass all permission checks
    // These roles have unrestricted access and don't need tenant-specific permission validation
    if (user?.role === 'super_admin' || user?.role === 'admin') {
      return true;
    }

    // Dashboard should be accessible to all authenticated users
    if (item.href === "/dashboard") return true;

    // Check single permission - this will be tenant-scoped by the backend
    if (item.permission) {
      return hasPermission(item.permission);
    }

    // Check multiple permissions - all tenant-scoped
    if (item.permissions && item.permissions.length > 0) {
      if (item.requiresAnyPermission) {
        // User needs ANY of the permissions (OR logic) - tenant-scoped
        return item.permissions.some(permission => hasPermission(permission));
      } else {
        // User needs ALL of the permissions (AND logic) - tenant-scoped
        return item.permissions.every(permission => hasPermission(permission));
      }
    }

    // If no permissions are defined, allow access (fallback for legacy items)
    return true;
  };

  return (
    <>
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 max-w-[16rem] bg-sidebar border-r border-sidebar-border transform transition-transform duration-200 ease-in-out lg:translate-x-0 overflow-x-hidden dashboard-sidebar",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-sidebar-border">
          <Link to="/dashboard" className="flex items-center space-x-2">
            <Heart className="h-8 w-8 text-sidebar-primary" />
            <span className="text-xl font-bold text-sidebar-foreground">ClinicPro</span>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="lg:hidden"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <ScrollArea className="flex-1 px-3 py-4 h-[calc(100vh-80px)]">
          <div className="space-y-6 pb-8">
            {/* User info */}
            <div className="px-3">
              <div className="flex items-center space-x-3 p-3 bg-sidebar-accent rounded-lg">
                <div className="w-8 h-8 bg-sidebar-primary rounded-full flex items-center justify-center">
                  <span className="text-sm font-semibold text-sidebar-primary-foreground">
                    {user?.firstName?.charAt(0)}
                    {user?.lastName?.charAt(0)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-sidebar-foreground truncate">
                    {user?.firstName} {user?.lastName}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className="text-xs capitalize">
                      {user?.role}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Role indicator for admins and super admins */}
            {(user?.role === "super_admin" || user?.role === "admin") && (
              <div className="px-3">
                <div className="flex items-center space-x-2 p-2 bg-sidebar-accent rounded-lg">
                  <Shield className="h-4 w-4 text-sidebar-primary" />
                  <span className="text-sm text-sidebar-foreground font-medium">
                    {user?.role === "super_admin" 
                      ? t("Unrestricted Access") 
                      : t("Full Tenant Access")
                    }
                  </span>
                </div>
              </div>
            )}

            {/* Navigation */}
            {sectionsToShow.map((section, sectionIndex) => (
              <div key={section.title}>
                <div className="px-3 mb-2">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {section.title}
                  </h3>
                </div>
                <div className="space-y-1">
                  {section.items.filter(canAccessItem).map((item) => {
                    const isActive = isActiveLink(item.href);

                    // Special handling for Test Reports with dropdown
                    if (
                      item.name === "Test Reports" &&
                      section.title === "Patient Management"
                    ) {
                      return (
                        <div key={item.name}>
                          <button
                            onClick={() =>
                              setIsTestModulesOpen(!isTestModulesOpen)
                            }
                            className={cn(
                              "flex items-center w-full px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                              isActive ||
                                location.pathname.includes("/test-modules/")
                                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                                : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                            )}
                          >
                            <item.icon className="h-5 w-5 mr-3 flex-shrink-0" />
                            <span className="flex-1 text-left">{item.name}</span>
                            {isTestModulesOpen ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </button>

                          {/* Test Reports submenu - all permissions are tenant-scoped */}
                          {isTestModulesOpen && (
                            <div className="ml-6 mt-1 space-y-1">
                              {(user?.role === 'super_admin' || user?.role === 'admin' || hasPermission("tests.view")) && (
                                <Link
                                  to="/dashboard/tests"
                                  onClick={onClose}
                                  className={cn(
                                    "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                                    location.pathname === "/dashboard/tests"
                                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                                      : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                                  )}
                                >
                                  <TestTube2 className="h-5 w-5 mr-3 flex-shrink-0" />
                                  Tests
                                </Link>
                              )}

                              {(user?.role === 'super_admin' || user?.role === 'admin' || hasPermission("test_reports.view")) && (
                                <Link
                                  to="/dashboard/test-reports"
                                  onClick={onClose}
                                  className={cn(
                                    "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                                    location.pathname ===
                                      "/dashboard/test-reports"
                                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                                      : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                                  )}
                                >
                                  <FileText className="h-5 w-5 mr-3 flex-shrink-0" />
                                  {t("Test Reports")}
                                </Link>
                              )}

                              {(user?.role === 'super_admin' || user?.role === 'admin' || hasPermission("tests.view")) && (
                                <Link
                                  to="/dashboard/test-modules/methodology"
                                  onClick={onClose}
                                  className={cn(
                                    "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                                    location.pathname ===
                                      "/dashboard/test-modules/methodology"
                                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                                      : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                                  )}
                                >
                                  <Settings className="h-5 w-5 mr-3 flex-shrink-0" />
                                  Methodology
                                </Link>
                              )}

                              {(user?.role === 'super_admin' || user?.role === 'admin' || hasPermission("tests.view")) && (
                                <Link
                                  to="/dashboard/test-modules/turnaround-time"
                                  onClick={onClose}
                                  className={cn(
                                    "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                                    location.pathname ===
                                      "/dashboard/test-modules/turnaround-time"
                                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                                      : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                                  )}
                                >
                                  <Clock className="h-5 w-5 mr-3 flex-shrink-0" />
                                  Turnaround Time
                                </Link>
                              )}

                              {(user?.role === 'super_admin' || user?.role === 'admin' || hasPermission("tests.view")) && (
                                <Link
                                  to="/dashboard/test-modules/sample-type"
                                  onClick={onClose}
                                  className={cn(
                                    "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                                    location.pathname ===
                                      "/dashboard/test-modules/sample-type"
                                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                                      : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                                  )}
                                >
                                  <Droplets className="h-5 w-5 mr-3 flex-shrink-0" />
                                  {t("Sample Type")}
                                </Link>
                              )}

                              {(user?.role === 'super_admin' || user?.role === 'admin' || hasPermission("tests.view")) && (
                                <Link
                                  to="/dashboard/test-modules/category"
                                  onClick={onClose}
                                  className={cn(
                                    "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                                    location.pathname ===
                                      "/dashboard/test-modules/category"
                                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                                      : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                                  )}
                                >
                                  <Folder className="h-5 w-5 mr-3 flex-shrink-0" />
                                  {t("Category")}
                                </Link>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    }

                    // Regular navigation items
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        onClick={onClose}
                        className={cn(
                          "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                          isActive
                            ? "bg-sidebar-accent text-sidebar-accent-foreground border-r-2 border-sidebar-primary"
                            : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                        )}
                      >
                        <item.icon className="h-5 w-5 mr-3 flex-shrink-0" />
                        <span className="flex-1">{item.name}</span>
                        {item.badge && (
                          <Badge variant="secondary" className="text-xs">
                            {item.badge}
                          </Badge>
                        )}
                      </Link>
                    );
                  })}
                </div>
                {sectionIndex < sectionsToShow.length - 1 && (
                  <Separator className="my-4" />
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </>
  );
};

export default Sidebar;

import React from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { superAdminApiService } from "@/services/api/superAdminApi";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Crown,
  LayoutDashboard,
  Building2,
  X,
  LogOut,
  Shield,
  UserCog,
  Users,
  CreditCard,
  Receipt,
  DollarSign,
  Lock
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

interface SuperAdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  description?: string;
}

interface NavigationSection {
  title: string;
  items: NavigationItem[];
}

const SuperAdminSidebar: React.FC<SuperAdminSidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Get current super admin info
  const currentSuperAdmin = superAdminApiService.getCurrentSuperAdmin();

  // Super Admin navigation configuration
  const navigationSections: NavigationSection[] = [
    {
      title: "Main",
      items: [
        {
          name: "Dashboard",
          href: "/admin/dashboard",
          icon: LayoutDashboard,
          description: "System overview and metrics"
        },
        {
          name: "Tenants",
          href: "/admin/tenants",
          icon: Building2,
          description: "Manage all tenant organizations"
        },
        {
          name: "Users",
          href: "/admin/users",
          icon: Users,
          description: "Manage super admin users"
        }
      ]
    },
      {
        title: "Billing & Subscriptions",
        items: [
          {
            name: "Plans",
            href: "/admin/plans",
            icon: CreditCard,
            description: "Manage subscription plans"
          },
          {
            name: "Subscriptions",
            href: "/admin/subscriptions",
            icon: Receipt,
            description: "Active tenant subscriptions"
          },
          {
            name: "Transactions",
            href: "/admin/transactions",
            icon: DollarSign,
            description: "Stripe transaction history"
          },
          {
            name: "Payment Methods",
            href: "/admin/payment-methods",
            icon: CreditCard,
            description: "Admin payment methods"
          }
        ]
      },
    {
      title: "Account",
      items: [
        {
          name: "Change Password",
          href: "/admin/change-password",
          icon: Lock,
          description: "Update your account password"
        }
      ]
    }
  ];

  const handleLogout = async () => {
    try {
      await superAdminApiService.logout();
      toast({
        title: "Logged out successfully",
        description: "You have been securely logged out from Super Admin panel.",
      });
      navigate("/admin");
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Logout Error",
        description: "There was an issue logging out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const isActive = (href: string) => {
    if (href === "/admin/dashboard") {
      return location.pathname === href;
    }
    return location.pathname.startsWith(href);
  };

  return (
    <div className="flex h-full flex-col bg-gradient-to-b from-slate-900 to-slate-800 text-white border-r border-slate-700">
      {/* Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-slate-700">
        <Link to="/admin/dashboard" className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-purple-600 to-blue-600">
            <Crown className="h-5 w-5 text-white" />
          </div>
          <div>
            <span className="text-lg font-bold">ClinicPro</span>
            <div className="text-xs text-slate-400">Super Admin</div>
          </div>
        </Link>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="text-slate-400 hover:text-white hover:bg-slate-700 lg:hidden"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* User Info */}
      <div className="px-4 py-4 border-b border-slate-700">
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-blue-600">
            <UserCog className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-white truncate">
              {currentSuperAdmin ? `${currentSuperAdmin.first_name} ${currentSuperAdmin.last_name}` : 'Super Admin'}
            </div>
            <div className="text-xs text-slate-400 truncate">
              {currentSuperAdmin?.email || 'super.admin@clinicpro.com'}
            </div>
          </div>
        </div>
        <Badge variant="secondary" className="mt-2 bg-green-500/20 text-green-400 border-green-500/30">
          <Shield className="h-3 w-3 mr-1" />
          Super Admin
        </Badge>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-2">
        <div className="space-y-6 py-4">
          {navigationSections.map((section, sectionIndex) => (
            <div key={sectionIndex}>
              <h2 className="mb-3 px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {section.title}
              </h2>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      onClick={() => onClose()}
                      className={cn(
                        "flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors group",
                        active
                          ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg"
                          : "text-slate-300 hover:bg-slate-700 hover:text-white"
                      )}
                    >
                      <item.icon 
                        className={cn(
                          "h-4 w-4 flex-shrink-0",
                          active ? "text-white" : "text-slate-400 group-hover:text-white"
                        )} 
                      />
                      <div className="flex-1 min-w-0">
                        <div className="truncate">{item.name}</div>
                        {item.description && !active && (
                          <div className="text-xs text-slate-500 group-hover:text-slate-400 truncate">
                            {item.description}
                          </div>
                        )}
                      </div>
                      {item.badge && (
                        <Badge variant="secondary" className="text-xs">
                          {item.badge}
                        </Badge>
                      )}
                    </Link>
                  );
                })}
              </div>
              {sectionIndex < navigationSections.length - 1 && (
                <Separator className="mt-6 bg-slate-700" />
              )}
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="border-t border-slate-700 p-4">
        <Button
          onClick={handleLogout}
          variant="ghost"
          className="w-full justify-start text-slate-300 hover:bg-red-600/20 hover:text-red-400"
        >
          <LogOut className="h-4 w-4 mr-3" />
          Logout
        </Button>
        
        <div className="mt-4 text-center">
          <div className="text-xs text-slate-500">
            © 2024 ClinicPro
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminSidebar;

import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Heart, ArrowLeft, Building2 } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";

interface PublicHeaderProps {
  showBackToHome?: boolean;
  showActions?: boolean;
  variant?: "default" | "auth";
}

const PublicHeader: React.FC<PublicHeaderProps> = ({ 
  showBackToHome = false, 
  showActions = true,
  variant = "default"
}) => {
  // Check if we're on a subdomain
  const isSubdomain = () => {
    const hostname = window.location.hostname;
    const parts = hostname.split('.');
    
    // Special handling for localhost development
    if (parts.includes('localhost')) {
      // For localhost, any prefix is considered a subdomain (e.g., tenant.localhost)
      return parts.length > 1 && parts[0] !== 'localhost';
    }
    
    // For production domains, consider it a subdomain if there are more than 2 parts (e.g., subdomain.example.com)
    return parts.length > 2 && !hostname.startsWith('www.');
  };

  // Get main domain URL (remove subdomain)
  const getMainDomainUrl = () => {
    const hostname = window.location.hostname;
    const parts = hostname.split('.');
    const protocol = window.location.protocol;
    const port = window.location.port ? `:${window.location.port}` : '';
    
    // Special handling for localhost development
    if (parts.includes('localhost')) {
      return `${protocol}//localhost${port}`;
    }
    
    // For production domains
    if (parts.length > 2) {
      // Remove the first part (subdomain) and reconstruct the URL
      const mainDomain = parts.slice(1).join('.');
      return `${protocol}//${mainDomain}${port}`;
    }
    return window.location.origin;
  };

  const handleOrganizationsClick = () => {
    window.location.href = getMainDomainUrl();
  };
  return (
    <nav className="border-b bg-background/95 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <Heart className="h-8 w-8 text-primary" />
            <span className="font-bold text-xl text-foreground">ClinicPro</span>
          </Link>

          {/* Navigation Actions */}
          <div className="flex items-center space-x-4">
            {showBackToHome && (
              <Link to="/">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
            )}
            
            {/* Organizations link - only show on subdomain */}
            {isSubdomain() && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleOrganizationsClick}
                className="flex items-center"
              >
                <Building2 className="w-4 h-4 mr-2" />
                Organizations
              </Button>
            )}

            {/* Theme Toggle */}
            <ThemeToggle />
            
            {showActions && variant === "default" && (
              <>
                <Link to="/login">
                  <Button variant="outline" size="sm">
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
            
            {showActions && variant === "auth" && (
              <Link to="/login">
                <Button size="sm">Try Demo</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default PublicHeader;


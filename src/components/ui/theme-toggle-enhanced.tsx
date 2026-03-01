import React from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface EnhancedThemeToggleProps {
  variant?: "default" | "ghost" | "outline";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  showText?: boolean;
}

export const EnhancedThemeToggle: React.FC<EnhancedThemeToggleProps> = ({
  variant = "ghost",
  size = "icon",
  className = "",
  showText = false,
}) => {
  const { theme, toggleTheme } = useTheme();

  const handleToggle = () => {
    // Add a subtle animation class to body during theme switch
    document.body.classList.add('theme-switching');
    toggleTheme();
    
    // Remove the animation class after transition
    setTimeout(() => {
      document.body.classList.remove('theme-switching');
    }, 300);
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant={variant}
          size={size}
          onClick={handleToggle}
          className={`transition-all duration-200 hover:scale-105 relative overflow-hidden ${className}`}
          aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
        >
          <div className="relative">
            <Sun className={`h-4 w-4 transition-all duration-300 ${
              theme === "light" 
                ? "rotate-0 scale-100 opacity-100" 
                : "rotate-90 scale-0 opacity-0"
            }`} />
            <Moon className={`h-4 w-4 absolute inset-0 transition-all duration-300 ${
              theme === "dark" 
                ? "rotate-0 scale-100 opacity-100" 
                : "-rotate-90 scale-0 opacity-0"
            }`} />
          </div>
          {showText && (
            <span className="ml-2 text-sm font-medium">
              {theme === "light" ? "Dark" : "Light"} Mode
            </span>
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>Toggle {theme === "light" ? "dark" : "light"} mode</p>
      </TooltipContent>
    </Tooltip>
  );
};


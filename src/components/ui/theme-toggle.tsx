import React from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ThemeToggleProps {
  variant?: "default" | "ghost" | "outline";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  variant = "ghost",
  size = "icon",
  className = "",
}) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant={variant}
          size={size}
          onClick={toggleTheme}
          className={`transition-all duration-200 hover:scale-105 ${className}`}
          aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
        >
          {theme === "light" ? (
            <Moon className="h-4 w-4 transition-transform duration-200 rotate-0 scale-100 dark:rotate-90 dark:scale-0" />
          ) : (
            <Sun className="h-4 w-4 transition-transform duration-200 rotate-90 scale-0 dark:rotate-0 dark:scale-100" />
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>Toggle {theme === "light" ? "dark" : "light"} mode</p>
      </TooltipContent>
    </Tooltip>
  );
};


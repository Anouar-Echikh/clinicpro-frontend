import React from "react";
import { cn } from "@/lib/utils";

interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg" | "xl";
  maxWidth?: "none" | "sm" | "md" | "lg" | "xl" | "2xl" | "full";
}

export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  className,
  padding = "md",
  maxWidth = "full",
}) => {
  const paddingClasses = {
    none: "",
    sm: "p-2 xs:p-3 sm:p-4",
    md: "p-2 xs:p-3 sm:p-4 md:p-5 lg:p-6 xl:p-8",
    lg: "p-3 xs:p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12",
    xl: "p-4 xs:p-6 sm:p-8 md:p-10 lg:p-12 xl:p-16",
  };

  const maxWidthClasses = {
    none: "",
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    full: "w-full",
  };

  return (
    <div
      className={cn(
        "w-full",
        paddingClasses[padding],
        maxWidthClasses[maxWidth],
        className
      )}
    >
      {children}
    </div>
  );
};

interface ResponsiveGridProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4 | 5 | 6;
  gap?: "sm" | "md" | "lg";
  className?: string;
}

export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  columns = 1,
  gap = "md",
  className,
}) => {
  const columnClasses = {
    1: "grid-cols-1",
    2: "grid-cols-1 lg:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 xl:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
    5: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5",
    6: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6",
  };

  const gapClasses = {
    sm: "gap-2 xs:gap-3",
    md: "gap-3 xs:gap-4 sm:gap-6",
    lg: "gap-4 xs:gap-6 sm:gap-8",
  };

  return (
    <div
      className={cn(
        "grid",
        columnClasses[columns],
        gapClasses[gap],
        className
      )}
    >
      {children}
    </div>
  );
};

interface ResponsiveFlexProps {
  children: React.ReactNode;
  direction?: "row" | "col";
  wrap?: boolean;
  align?: "start" | "center" | "end" | "stretch";
  justify?: "start" | "center" | "end" | "between" | "around" | "evenly";
  gap?: "sm" | "md" | "lg";
  className?: string;
}

export const ResponsiveFlex: React.FC<ResponsiveFlexProps> = ({
  children,
  direction = "row",
  wrap = false,
  align = "start",
  justify = "start",
  gap = "md",
  className,
}) => {
  const directionClasses = {
    row: "flex-col xs:flex-row",
    col: "flex-col",
  };

  const alignClasses = {
    start: "items-start",
    center: "items-center",
    end: "items-end",
    stretch: "items-stretch",
  };

  const justifyClasses = {
    start: "justify-start",
    center: "justify-center",
    end: "justify-end",
    between: "justify-between",
    around: "justify-around",
    evenly: "justify-evenly",
  };

  const gapClasses = {
    sm: "gap-2 xs:gap-3",
    md: "gap-3 xs:gap-4 sm:gap-6",
    lg: "gap-4 xs:gap-6 sm:gap-8",
  };

  return (
    <div
      className={cn(
        "flex",
        directionClasses[direction],
        wrap && "flex-wrap",
        alignClasses[align],
        justifyClasses[justify],
        gapClasses[gap],
        className
      )}
    >
      {children}
    </div>
  );
};

interface ResponsiveCardProps {
  children: React.ReactNode;
  padding?: "sm" | "md" | "lg";
  className?: string;
}

export const ResponsiveCard: React.FC<ResponsiveCardProps> = ({
  children,
  padding = "md",
  className,
}) => {
  const paddingClasses = {
    sm: "p-3 xs:p-4",
    md: "p-3 xs:p-4 sm:p-6",
    lg: "p-4 xs:p-6 sm:p-8",
  };

  return (
    <div
      className={cn(
        "bg-card border rounded-lg shadow-sm",
        paddingClasses[padding],
        className
      )}
    >
      {children}
    </div>
  );
};

interface ResponsiveHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
}

export const ResponsiveHeader: React.FC<ResponsiveHeaderProps> = ({
  title,
  subtitle,
  actions,
  className,
}) => {
  return (
    <div className={cn("mb-4 xs:mb-6", className)}>
      <div className="flex flex-col xs:flex-row xs:items-start xs:justify-between gap-3 xs:gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="responsive-text-xl font-bold text-foreground truncate">
            {title}
          </h1>
          {subtitle && (
            <p className="responsive-text-sm text-muted-foreground mt-1 xs:mt-2">
              {subtitle}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex-shrink-0 flex flex-col xs:flex-row gap-2 xs:gap-3">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

interface ResponsiveStatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ComponentType<{ className?: string }>;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export const ResponsiveStatsCard: React.FC<ResponsiveStatsCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  className,
}) => {
  return (
    <ResponsiveCard className={cn("stats-card", className)}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="responsive-text-sm text-muted-foreground font-medium">
            {title}
          </p>
          <p className="text-xl xs:text-2xl sm:text-3xl font-bold text-foreground mt-1">
            {value}
          </p>
          {subtitle && (
            <p className="responsive-text-sm text-muted-foreground mt-1">
              {subtitle}
            </p>
          )}
          {trend && (
            <div className="flex items-center mt-2">
              <span
                className={cn(
                  "responsive-text-sm font-medium",
                  trend.isPositive ? "text-green-600" : "text-red-600"
                )}
              >
                {trend.isPositive ? "+" : ""}
                {trend.value}%
              </span>
              <span className="responsive-text-sm text-muted-foreground ml-1">
                vs last month
              </span>
            </div>
          )}
        </div>
        {Icon && (
          <div className="flex-shrink-0 p-2 xs:p-3 bg-primary/10 rounded-lg">
            <Icon className="icon-lg text-primary" />
          </div>
        )}
      </div>
    </ResponsiveCard>
  );
};

interface ResponsiveButtonGroupProps {
  buttons: Array<{
    label: string;
    onClick: () => void;
    variant?: "default" | "secondary" | "outline" | "ghost" | "destructive";
    icon?: React.ComponentType<{ className?: string }>;
    disabled?: boolean;
  }>;
  orientation?: "horizontal" | "vertical";
  className?: string;
}

export const ResponsiveButtonGroup: React.FC<ResponsiveButtonGroupProps> = ({
  buttons,
  orientation = "horizontal",
  className,
}) => {
  const containerClass = orientation === "horizontal" 
    ? "flex flex-col xs:flex-row gap-2 xs:gap-3"
    : "flex flex-col gap-2";

  return (
    <div className={cn(containerClass, className)}>
      {buttons.map((button, index) => (
        <button
          key={index}
          onClick={button.onClick}
          disabled={button.disabled}
          className={cn(
            "btn-responsive flex items-center justify-center gap-2",
            "bg-primary text-primary-foreground hover:bg-primary/90",
            button.variant === "secondary" && "bg-secondary text-secondary-foreground hover:bg-secondary/80",
            button.variant === "outline" && "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
            button.variant === "ghost" && "hover:bg-accent hover:text-accent-foreground",
            button.variant === "destructive" && "bg-destructive text-destructive-foreground hover:bg-destructive/90",
            button.disabled && "opacity-50 cursor-not-allowed",
            "transition-colors rounded-md font-medium"
          )}
        >
          {button.icon && <button.icon className="icon-sm" />}
          <span className="truncate">{button.label}</span>
        </button>
      ))}
    </div>
  );
};

// Export all components
export {
  ResponsiveContainer as default,
}; 
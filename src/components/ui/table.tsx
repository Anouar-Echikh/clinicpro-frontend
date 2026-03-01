import * as React from "react";
import { cn } from "@/lib/utils";
import { Card } from "./card";
import { Badge } from "./badge";
import { Button } from "./button";
import { MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./dropdown-menu";

const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
  <div className="relative w-full overflow-auto">
    <table
      ref={ref}
      className={cn("w-full caption-bottom text-sm", className)}
      {...props}
    />
  </div>
));
Table.displayName = "Table";

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn("[&_tr]:border-b", className)} {...props} />
));
TableHeader.displayName = "TableHeader";

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn("[&_tr:last-child]:border-0", className)}
    {...props}
  />
));
TableBody.displayName = "TableBody";

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn(
      "border-t bg-muted/50 font-medium [&>tr]:last:border-b-0",
      className,
    )}
    {...props}
  />
));
TableFooter.displayName = "TableFooter";

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
      className,
    )}
    {...props}
  />
));
TableRow.displayName = "TableRow";

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      "h-10 px-2 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 xs:h-12 xs:px-4",
      className,
    )}
    {...props}
  />
));
TableHead.displayName = "TableHead";

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn("p-2 align-middle [&:has([role=checkbox])]:pr-0 xs:p-4", className)}
    {...props}
  />
));
TableCell.displayName = "TableCell";

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn("mt-4 text-sm text-muted-foreground", className)}
    {...props}
  />
));
TableCaption.displayName = "TableCaption";

// New ResponsiveTable component for mobile-first design
interface ResponsiveTableProps<T> {
  data: T[];
  columns: {
    key: string;
    label: string;
    className?: string;
    render?: (item: T) => React.ReactNode;
  }[];
  mobileCard?: {
    title: (item: T) => React.ReactNode;
    subtitle?: (item: T) => React.ReactNode;
    content: (item: T) => React.ReactNode;
    actions?: (item: T) => React.ReactNode;
  };
  actions?: (item: T) => React.ReactNode;
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
}

// Add nested components for compatibility
const ResponsiveTableWithSubComponents = Object.assign(ResponsiveTable, {
  Header: TableHeader,
  Body: TableBody,
  Row: TableRow,
  Head: TableHead,
  Cell: TableCell,
  Caption: TableCaption,
});

function ResponsiveTable<T extends Record<string, any>>({
  data,
  columns,
  mobileCard,
  actions,
  loading,
  emptyMessage = "No data available",
  className,
}: ResponsiveTableProps<T>) {
  if (loading) {
    return (
      <div className={cn("w-full", className)}>
        {/* Desktop loading */}
        <div className="hidden lg:block">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((column) => (
                  <TableHead key={column.key} className={column.className}>
                    {column.label}
                  </TableHead>
                ))}
                {actions && <TableHead className="text-right w-24">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  {columns.map((column) => (
                    <TableCell key={column.key}>
                      <div className="h-4 bg-muted animate-pulse rounded"></div>
                    </TableCell>
                  ))}
                  {actions && (
                    <TableCell>
                      <div className="h-8 w-8 bg-muted animate-pulse rounded ml-auto"></div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Mobile loading */}
        <div className="lg:hidden space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Card key={index} className="p-4">
              <div className="p-4-header">
                <div className="h-5 bg-muted animate-pulse rounded w-32"></div>
                <div className="h-8 w-8 bg-muted animate-pulse rounded"></div>
              </div>
              <div className="mt-2">
                <div className="h-3 bg-muted animate-pulse rounded w-full mb-2"></div>
                <div className="h-3 bg-muted animate-pulse rounded w-3/4"></div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={cn("w-full", className)}>
      {/* Desktop Table */}
      <div className="hidden lg:block">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.key} className={column.className}>
                  {column.label}
                </TableHead>
              ))}
              {actions && <TableHead className="text-right w-24">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item, index) => (
              <TableRow key={index}>
                {columns.map((column) => (
                  <TableCell key={column.key} className={column.className}>
                    {column.render ? column.render(item) : item[column.key]}
                  </TableCell>
                ))}
                {actions && (
                  <TableCell className="text-right">
                    {actions(item)}
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden space-y-4">
        {data.map((item, index) => (
          <Card key={index} className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                {mobileCard?.title ? mobileCard.title(item) : (
                  <div className="font-medium text-sm xs:text-base">
                    {item[columns[0]?.key] || "Item"}
                  </div>
                )}
                {mobileCard?.subtitle && (
                  <div className="text-xs xs:text-sm text-muted-foreground mt-1">
                    {mobileCard.subtitle(item)}
                  </div>
                )}
              </div>
              {(actions || mobileCard?.actions) && (
                <div className="flex-shrink-0">
                  {mobileCard?.actions ? mobileCard.actions(item) : actions?.(item)}
                </div>
              )}
            </div>
            <div className="mt-2">
              {mobileCard?.content ? mobileCard.content(item) : (
                <div className="grid grid-cols-1 xs:grid-cols-2 gap-2">
                  {columns.slice(1).map((column) => (
                    <div key={column.key} className="flex justify-between">
                      <span className="text-muted-foreground text-xs xs:text-sm">
                        {column.label}:
                      </span>
                      <span className="text-xs xs:text-sm font-medium ml-2">
                        {column.render ? column.render(item) : item[column.key]}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Mobile Action Dropdown component for consistent mobile actions
interface MobileActionDropdownProps {
  actions: Array<{
    label: string;
    icon?: React.ComponentType<{ className?: string }>;
    onClick: () => void;
    variant?: "default" | "destructive";
  }>;
}

const MobileActionDropdown: React.FC<MobileActionDropdownProps> = ({ actions }) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
        <MoreVertical className="h-4 w-4" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" className="w-48">
      {actions.map((action, index) => (
        <DropdownMenuItem
          key={index}
          onClick={action.onClick}
          className={action.variant === "destructive" ? "text-destructive" : ""}
        >
          {action.icon && <action.icon className="mr-2 h-4 w-4" />}
          {action.label}
        </DropdownMenuItem>
      ))}
    </DropdownMenuContent>
  </DropdownMenu>
);

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
  ResponsiveTableWithSubComponents as ResponsiveTable,
  MobileActionDropdown,
};

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface TableSkeletonProps {
  columns?: number;
  rows?: number;
  showSearch?: boolean;
  showFilters?: boolean;
  showExport?: boolean;
  showPagination?: boolean;
  className?: string;
}

export function TableSkeleton({
  columns = 5,
  rows = 10,
  showSearch = true,
  showFilters = true,
  showExport = true,
  showPagination = true,
  className,
}: TableSkeletonProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {/* Search and Filter Controls Skeleton */}
      {(showSearch || showFilters || showExport) && (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {showSearch && (
              <Skeleton className="h-10 w-[250px]" />
            )}
            {showFilters && (
              <>
                <Skeleton className="h-10 w-[150px]" />
                <Skeleton className="h-10 w-[150px]" />
              </>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {showExport && (
              <>
                <Skeleton className="h-10 w-[120px]" />
                <Skeleton className="h-10 w-[100px]" />
              </>
            )}
          </div>
        </div>
      )}

      {/* Table Skeleton */}
      <div className="rounded-md border">
        <Table>
          {/* Table Header Skeleton */}
          <TableHeader>
            <TableRow>
              {Array.from({ length: columns }).map((_, index) => (
                <TableHead key={index} className="h-12">
                  <Skeleton className="h-4 w-full" />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          
          {/* Table Body Skeleton */}
          <TableBody>
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <TableRow key={rowIndex}>
                {Array.from({ length: columns }).map((_, colIndex) => (
                  <TableCell key={colIndex} className="h-16">
                    <Skeleton 
                      className={cn(
                        "h-4",
                        // Vary the width for more realistic appearance
                        colIndex === 0 ? "w-8" : // First column (usually checkbox)
                        colIndex === 1 ? "w-24" : // Second column (usually ID or name)
                        colIndex === columns - 1 ? "w-16" : // Last column (usually actions)
                        "w-full" // Other columns
                      )} 
                    />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Skeleton */}
      {showPagination && (
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center space-x-2">
            <Skeleton className="h-4 w-[100px]" />
          </div>
          <div className="flex items-center space-x-6 lg:space-x-8">
            <div className="flex items-center space-x-2">
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-8 w-[70px]" />
            </div>
            <div className="flex items-center space-x-2">
              <Skeleton className="h-4 w-[100px]" />
            </div>
            <div className="flex items-center space-x-2">
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-8" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Compact version for smaller spaces
export function CompactTableSkeleton({
  columns = 3,
  rows = 5,
  className,
}: Pick<TableSkeletonProps, 'columns' | 'rows' | 'className'>) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {Array.from({ length: columns }).map((_, index) => (
                <TableHead key={index} className="h-10">
                  <Skeleton className="h-3 w-full" />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <TableRow key={rowIndex}>
                {Array.from({ length: columns }).map((_, colIndex) => (
                  <TableCell key={colIndex} className="h-12">
                    <Skeleton className="h-3 w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
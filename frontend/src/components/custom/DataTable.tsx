import type {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
} from "@tanstack/react-table";
import {
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  CalendarIcon,
  Download,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  X,
  Columns3,
  RotateCcw,
} from "lucide-react";
import Papa from "papaparse"; // For CSV export (install papaparse)
import * as XLSX from "xlsx"; // For Excel export (install xlsx)
import jsPDF from "jspdf"; // For PDF export (install jspdf)
import autoTable from "jspdf-autotable"; // For PDF tables (install jspdf-autotable)
import { TableSkeleton } from "./TableSkeleton";
import { useEffect, useMemo, useState } from "react";

// Filter configuration interface
interface FilterConfig {
  id: string;
  label: string;
  options: { value: string; label: string }[];
}

// DataTable props interface
interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  filters?: FilterConfig[];
  enableDateFilter?: boolean;
  dateFilterColumn?: string;
  enableGlobalSearch?: boolean;
  enableExport?: boolean;
  enableColumnVisibility?: boolean;
  enableRowSelection?: boolean;
  onRowSelect?: (selectedRows: T[]) => void;
  loading?: boolean;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  filters = [],
  enableDateFilter = false,
  dateFilterColumn = "createdAt",
  enableGlobalSearch = true,
  enableExport = true,
  enableColumnVisibility = true,
  enableRowSelection = true,
  onRowSelect,
  loading = false,
}: DataTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState("");

  // Dynamic filter states
  const [filterValues, setFilterValues] = useState<
    Record<string, string | undefined>
  >(filters.reduce((acc, filter) => ({ ...acc, [filter.id]: undefined }), {}));

  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });

  const [datePopoverOpen, setDatePopoverOpen] = useState(false);

  // Add select column if row selection is enabled
  const tableColumns = useMemo(() => {
    if (!enableRowSelection) return columns;

    const selectColumn: ColumnDef<T> = {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    };

    return [selectColumn, ...columns];
  }, [columns, enableRowSelection]);

  const table = useReactTable({
    data,
    columns: tableColumns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: "includesString",
    // Custom filtering for date range
    filterFns: {
      dateRange: (row, id, filterValue) => {
        const rowValue = row.getValue(id) as Date;
        const { from, to } = filterValue;
        if (!from && !to) return true;
        if (from && rowValue < from) return false;
        if (to && rowValue > to) return false;
        return true;
      },
    },
  });

  // Apply custom filters
  useEffect(() => {
    table.setColumnFilters((prev) => {
      // Remove existing custom filters
      const filterIds = [...filters.map((f) => f.id), dateFilterColumn];
      const newFilters = prev.filter((f) => !filterIds.includes(f.id));

      // Add dynamic filters
      filters.forEach((filter) => {
        const value = filterValues[filter.id];
        if (value) {
          newFilters.push({ id: filter.id, value });
        }
      });

      // Add date range filter if enabled
      if (enableDateFilter && (dateRange.from || dateRange.to)) {
        newFilters.push({ id: dateFilterColumn, value: dateRange });
      }

      return newFilters;
    });
  }, [filterValues, dateRange, filters, dateFilterColumn, enableDateFilter]);

  // Handle row selection callback - only trigger when rowSelection changes
  useEffect(() => {
    if (onRowSelect && enableRowSelection) {
      const selectedRows = data.filter(
        (_, index) => rowSelection[index as keyof typeof rowSelection]
      );
      // Only call onRowSelect if there are actual changes in selection
      const hasSelection = Object.keys(rowSelection).length > 0;
      if (hasSelection || selectedRows.length > 0) {
        onRowSelect(selectedRows);
      }
    }
  }, [rowSelection]);

  // Export functions
  const exportToCSV = () => {
    const csv = Papa.unparse(
      table.getFilteredRowModel().rows.map((row) => row.original)
    );
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "data.csv";
    link.click();
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(
      table.getFilteredRowModel().rows.map((row) => row.original)
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    XLSX.writeFile(wb, "data.xlsx");
  };

  const exportToPDF = () => {
    const doc = new jsPDF();

    // Get visible columns (excluding select column)
    const visibleColumns = table
      .getVisibleLeafColumns()
      .filter((col) => col.id !== "select");

    // Create headers
    const headers = visibleColumns.map((col) => {
      const header = col.columnDef.header;
      return typeof header === "string" ? header : col.id;
    });

    // Create body data by extracting actual values
    const bodyData = table.getFilteredRowModel().rows.map((row) => {
      return visibleColumns.map((col) => {
        const cellValue = row.getValue(col.id);
        // Handle different data types
        if (cellValue instanceof Date) {
          return format(cellValue, "PPP");
        }
        return String(cellValue || "");
      });
    });

    autoTable(doc, {
      head: [headers],
      body: bodyData,
    });
    doc.save("data.pdf");
  };

  // Show skeleton when loading
  if (loading) {
    return (
      <TableSkeleton
        columns={columns.length + (enableRowSelection ? 1 : 0)}
        rows={10}
        showSearch={enableGlobalSearch}
        showFilters={filters.length > 0 || enableDateFilter}
        showExport={enableExport}
        showPagination={true}
      />
    );
  }

  return (
    <div className="space-y-4 p-4">
      {/* Filters */}
      <div className="flex items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-2">
          {/* Global Search */}
          {enableGlobalSearch && (
            <div className="relative">
              <Input
                placeholder="Search..."
                value={globalFilter ?? ""}
                onChange={(event) => setGlobalFilter(event.target.value)}
                className="grow pr-8"
              />
              {globalFilter && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0 hover:bg-gray-100 rounded-full"
                  onClick={() => setGlobalFilter("")}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          )}

          {/* Dynamic Filters */}
          {filters.map((filter) => (
            <div key={filter.id} className="relative">
              <Select
                key={filterValues[filter.id] || 'empty'}
                value={filterValues[filter.id] || ""}
                onValueChange={(value) =>
                  setFilterValues((prev) => ({ ...prev, [filter.id]: value }))
                }
              >
                <SelectTrigger className="min-w-[150px]">
                  <SelectValue placeholder={filter.label} />
                </SelectTrigger>
                <SelectContent>
                  {filter.options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {filterValues[filter.id] && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 p-0 bg-background hover:bg-muted rounded-full z-10"
                  onClick={() =>
                    setFilterValues((prev) => ({ ...prev, [filter.id]: undefined }))
                  }
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {/* Date Range Filter */}
          {enableDateFilter && (
            <div className="relative">
              <Popover open={datePopoverOpen} onOpenChange={setDatePopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "justify-start text-left font-normal pr-10!",
                      !dateRange && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "LLL dd, y")} -{" "}
                          {format(dateRange.to, "LLL dd, y")}
                        </>
                      ) : (
                        format(dateRange.from, "LLL dd, y")
                      )
                    ) : (
                      <span>Pick a date range</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={{ from: dateRange.from, to: dateRange.to }}
                    onSelect={(range) => {
                      setDateRange({
                        from: range?.from,
                        to: range?.to,
                      });
                      // Auto-close when both dates are selected
                      if (range?.from && range?.to) {
                        setDatePopoverOpen(false);
                      }
                    }}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
              {(dateRange?.from || dateRange?.to) && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-5 w-5 p-0 hover:bg-gray-100 rounded-full z-10"
                  onClick={() => setDateRange({ from: undefined, to: undefined })}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          )}

          {/* Column Visibility */}
          {enableColumnVisibility && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Columns3 className="h-4 w-4" />
                  Columns
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="flex items-center justify-between px-2 py-1.5 text-sm font-medium">
                  <span>Toggle columns</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => {
                      table.getAllColumns().forEach((column) => {
                        if (column.getCanHide()) {
                          column.toggleVisibility(true);
                        }
                      });
                    }}
                  >
                    <RotateCcw className="h-3 w-3" />
                  </Button>
                </div>
                <div className="border-t">
                  {table
                    .getAllColumns()
                    .filter((column) => column.getCanHide())
                    .map((column) => (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize flex items-center gap-2 px-2 py-2"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) =>
                          column.toggleVisibility(!!value)
                        }
                      >
                        <span className="ml-6 flex-1">{column.id}</span>
                      </DropdownMenuCheckboxItem>
                    ))}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Export */}
          {enableExport && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" /> Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={exportToCSV}>
                  <Download className="mr-2 h-4 w-4" /> Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={exportToExcel}>
                  <Download className="mr-2 h-4 w-4" /> Export as Excel
                </DropdownMenuItem>
                <DropdownMenuItem onClick={exportToPDF}>
                  <Download className="mr-2 h-4 w-4" /> Export as PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  const sortDirection = header.column.getIsSorted();
                  
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : (
                        <div
                          className={cn(
                            "flex items-center space-x-2",
                            canSort && "cursor-pointer select-none hover:bg-accent hover:text-accent-foreground rounded-md px-2 py-1 -mx-2 -my-1 transition-colors"
                          )}
                          onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                        >
                          <span>
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                          </span>
                          {canSort && (
                            <span className="ml-2">
                              {sortDirection === "asc" ? (
                                <ArrowUp className="h-4 w-4" />
                              ) : sortDirection === "desc" ? (
                                <ArrowDown className="h-4 w-4" />
                              ) : (
                                <ArrowUpDown className="h-4 w-4 opacity-50" />
                              )}
                            </span>
                          )}
                        </div>
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={tableColumns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Advanced Pagination */}
      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="flex items-center space-x-2">
          {enableRowSelection && (
            <div className="text-sm text-muted-foreground">
              {table.getFilteredSelectedRowModel().rows.length} of{" "}
              {table.getFilteredRowModel().rows.length} row(s) selected.
            </div>
          )}
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">Rows per page</p>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => {
                table.setPageSize(Number(value));
              }}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue
                  placeholder={table.getState().pagination.pageSize}
                />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 20, 30, 40, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center space-x-6 lg:space-x-8">
          <div className="flex w-[100px] items-center justify-center text-sm font-medium">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to first page</span>
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to previous page</span>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to next page</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to last page</span>
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

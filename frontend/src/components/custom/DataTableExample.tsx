"use client";

import React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "./DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

// Example 1: User Management Data
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  createdAt: Date;
}

const userData: User[] = [
  {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    role: "Admin",
    department: "IT",
    createdAt: new Date("2023-01-15"),
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane@example.com",
    role: "User",
    department: "HR",
    createdAt: new Date("2023-02-20"),
  },
  {
    id: "3",
    name: "Bob Johnson",
    email: "bob@example.com",
    role: "Manager",
    department: "Sales",
    createdAt: new Date("2023-03-10"),
  },
  {
    id: "10",
    name: "Alice Wilson",
    email: "alice@example.com",
    role: "User",
    department: "IT",
    createdAt: new Date("2023-01-05"),
  },
  {
    id: "4",
    name: "Charlie Brown",
    email: "charlie@example.com",
    role: "Admin",
    department: "HR",
    createdAt: new Date("2023-04-12"),
  },
];

const userColumns: ColumnDef<User>[] = [
  {
    accessorKey: "id",
    header: "ID",
    enableSorting: true,
    sortingFn: "alphanumeric",
  },
  {
    accessorKey: "name",
    header: "Name",
    enableSorting: true,
    sortingFn: "text",
  },
  {
    accessorKey: "email",
    header: "Email",
    enableSorting: true,
    sortingFn: "text",
  },
  {
    accessorKey: "role",
    header: "Role",
    enableSorting: true,
    sortingFn: "text",
  },
  {
    accessorKey: "department",
    header: "Department",
    enableSorting: true,
    sortingFn: "text",
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    enableSorting: true,
    sortingFn: "datetime",
    cell: ({ row }) => format(row.original.createdAt, "PPP"),
  },
];

const userFilters = [
  {
    id: "role",
    label: "Filter by Role",
    options: [
      { value: "Admin", label: "Admin" },
      { value: "User", label: "User" },
      { value: "Manager", label: "Manager" },
    ],
  },
  {
    id: "department",
    label: "Filter by Department",
    options: [
      { value: "IT", label: "IT" },
      { value: "HR", label: "HR" },
      { value: "Sales", label: "Sales" },
    ],
  },
];

// Example 2: Product Management Data
interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  status: string;
  supplier: string;
  createdAt: Date;
}

const productData: Product[] = [
  {
    id: "1",
    name: "Laptop",
    category: "Electronics",
    price: 999.99,
    status: "Active",
    supplier: "TechCorp",
    createdAt: new Date("2023-01-15"),
  },
  {
    id: "2",
    name: "Office Chair",
    category: "Furniture",
    price: 299.99,
    status: "Inactive",
    supplier: "FurniturePlus",
    createdAt: new Date("2023-02-20"),
  },
  {
    id: "10",
    name: "Smartphone",
    category: "Electronics",
    price: 599.99,
    status: "Active",
    supplier: "TechCorp",
    createdAt: new Date("2023-03-05"),
  },
  {
    id: "3",
    name: "Desk Lamp",
    category: "Furniture",
    price: 89.99,
    status: "Active",
    supplier: "FurniturePlus",
    createdAt: new Date("2023-01-25"),
  },
  {
    id: "4",
    name: "Wireless Mouse",
    category: "Electronics",
    price: 29.99,
    status: "Active",
    supplier: "TechCorp",
    createdAt: new Date("2023-04-10"),
  },
];

const productColumns: ColumnDef<Product>[] = [
  {
    accessorKey: "id",
    header: "ID",
    enableSorting: true,
    sortingFn: "alphanumeric",
  },
  {
    accessorKey: "name",
    header: "Product Name",
    enableSorting: true,
    sortingFn: "text",
  },
  {
    accessorKey: "category",
    header: "Category",
    enableSorting: true,
    sortingFn: "text",
  },
  {
    accessorKey: "price",
    header: "Price",
    enableSorting: true,
    sortingFn: "basic",
    cell: ({ row }) => `$${row.original.price.toFixed(2)}`,
  },
  {
    accessorKey: "status",
    header: "Status",
    enableSorting: true,
    sortingFn: "text",
  },
  {
    accessorKey: "supplier",
    header: "Supplier",
    enableSorting: true,
    sortingFn: "text",
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    enableSorting: true,
    sortingFn: "datetime",
    cell: ({ row }) => format(row.original.createdAt, "PPP"),
  },
];

const productFilters = [
  {
    id: "category",
    label: "Filter by Category",
    options: [
      { value: "Electronics", label: "Electronics" },
      { value: "Furniture", label: "Furniture" },
      { value: "Books", label: "Books" },
    ],
  },
  {
    id: "status",
    label: "Filter by Status",
    options: [
      { value: "Active", label: "Active" },
      { value: "Inactive", label: "Inactive" },
    ],
  },
  {
    id: "supplier",
    label: "Filter by Supplier",
    options: [
      { value: "TechCorp", label: "TechCorp" },
      { value: "FurniturePlus", label: "FurniturePlus" },
    ],
  },
];

export function UserDataTableExample() {
  const [selectedUsers, setSelectedUsers] = React.useState<User[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleUserSelection = (users: User[]) => {
    setSelectedUsers(users);
    console.log("Selected users:", users);
  };

  const toggleLoading = () => {
    setIsLoading(!isLoading);
  };

  const simulateDataLoad = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 3000); // Simulate 3 second loading
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">User Management</h2>
        <div className="flex gap-2">
          <Button 
            onClick={toggleLoading} 
            variant={isLoading ? "destructive" : "outline"}
            size="sm"
          >
            {isLoading ? "Stop Loading" : "Toggle Loading"}
          </Button>
          <Button 
            onClick={simulateDataLoad} 
            variant="secondary"
            size="sm"
            disabled={isLoading}
          >
            Simulate Load (3s)
          </Button>
        </div>
      </div>
      {selectedUsers.length > 0 && (
        <div className="mb-4 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm font-medium text-blue-900">
            {selectedUsers.length} user(s) selected:
          </p>
          <div className="flex flex-wrap gap-2 mt-2">
            {selectedUsers.map((user) => (
              <Badge key={user.id} variant="secondary">
                {user.name}
              </Badge>
            ))}
          </div>
        </div>
      )}
      <DataTable
        data={userData}
        columns={userColumns}
        filters={userFilters}
        enableDateFilter={true}
        dateFilterColumn="createdAt"
        enableGlobalSearch={true}
        enableExport={true}
        enableColumnVisibility={true}
        enableRowSelection={true}
        onRowSelect={handleUserSelection}
        loading={isLoading}
      />
    </div>
  );
}

export function ProductDataTableExample() {
  const [selectedProducts, setSelectedProducts] = React.useState<Product[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleProductSelection = (products: Product[]) => {
    setSelectedProducts(products);
    console.log("Selected products:", products);
  };

  const toggleLoading = () => {
    setIsLoading(!isLoading);
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Product Management</h2>
        <Button 
          onClick={toggleLoading} 
          variant={isLoading ? "destructive" : "outline"}
          size="sm"
        >
          {isLoading ? "Stop Loading" : "Toggle Loading"}
        </Button>
      </div>
      {selectedProducts.length > 0 && (
        <div className="mb-4 p-4 bg-green-50 rounded-lg">
          <p className="text-sm font-medium text-green-900">
            {selectedProducts.length} product(s) selected:
          </p>
          <div className="flex flex-wrap gap-2 mt-2">
            {selectedProducts.map((product) => (
              <Badge key={product.id} variant="secondary">
                {product.name}
              </Badge>
            ))}
          </div>
        </div>
      )}
      <DataTable
        data={productData}
        columns={productColumns}
        filters={productFilters}
        enableDateFilter={true}
        dateFilterColumn="createdAt"
        enableGlobalSearch={true}
        enableExport={true}
        enableColumnVisibility={true}
        enableRowSelection={true}
        onRowSelect={handleProductSelection}
        loading={isLoading}
      />
    </div>
  );
}

// Simple example without filters
export function SimpleDataTableExample() {
  return (
    <div className="container mx-auto py-10">
      <h2 className="text-2xl font-bold mb-4">Simple Table</h2>
      <DataTable
        data={userData}
        columns={userColumns}
        enableGlobalSearch={true}
        enableExport={false}
        enableColumnVisibility={false}
        enableDateFilter={false}
      />
    </div>
  );
}
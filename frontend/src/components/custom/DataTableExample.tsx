"use client";

import React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "./DataTable";
import { Badge } from "@/components/ui/badge";
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
    createdAt: new Date("2023-01-01"),
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane@example.com",
    role: "User",
    department: "HR",
    createdAt: new Date("2023-02-15"),
  },
  {
    id: "3",
    name: "Bob Johnson",
    email: "bob@example.com",
    role: "Manager",
    department: "Sales",
    createdAt: new Date("2023-03-10"),
  },
];

const userColumns: ColumnDef<User>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "role",
    header: "Role",
  },
  {
    accessorKey: "department",
    header: "Department",
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
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
];

const productColumns: ColumnDef<Product>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "name",
    header: "Product Name",
  },
  {
    accessorKey: "category",
    header: "Category",
  },
  {
    accessorKey: "price",
    header: "Price",
    cell: ({ row }) => `$${row.original.price.toFixed(2)}`,
  },
  {
    accessorKey: "status",
    header: "Status",
  },
  {
    accessorKey: "supplier",
    header: "Supplier",
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
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

  const handleUserSelection = (users: User[]) => {
    setSelectedUsers(users);
    console.log("Selected users:", users);
  };

  return (
    <div className="container mx-auto py-10">
      <h2 className="text-2xl font-bold mb-4">User Management</h2>
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
      />
    </div>
  );
}

export function ProductDataTableExample() {
  const [selectedProducts, setSelectedProducts] = React.useState<Product[]>([]);

  const handleProductSelection = (products: Product[]) => {
    setSelectedProducts(products);
    console.log("Selected products:", products);
  };

  return (
    <div className="container mx-auto py-10">
      <h2 className="text-2xl font-bold mb-4">Product Management</h2>
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
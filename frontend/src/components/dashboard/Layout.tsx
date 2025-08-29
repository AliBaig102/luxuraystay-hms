import type React from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { SidebarInset, SidebarProvider } from "@/components/ui";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <SidebarProvider>
      <Sidebar />
      <SidebarInset>
        <Header />
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}

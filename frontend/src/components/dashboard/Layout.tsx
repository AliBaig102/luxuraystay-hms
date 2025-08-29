import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { SidebarInset, SidebarProvider } from "@/components/ui";
import { Outlet } from "react-router-dom";
export function Layout() {
  return (
    <SidebarProvider>
      <Sidebar />
      <SidebarInset>
        <Header />
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  );
}

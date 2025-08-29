import * as React from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Layers } from "lucide-react"; // Declared Layers here

import { type MenuItem, menuItems } from "@/constants/navigation";
import {
  Sidebar as SidebarPrimitive,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { Link, useLocation } from "react-router-dom";

export const Sidebar = () => {
  const location = useLocation();

  return (
    <SidebarPrimitive>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-2">
          <Layers className="h-6 w-6" />
          <span className="text-lg font-bold">Admin Panel</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarNavItem
                key={item.title}
                item={item}
                pathname={location.pathname}
              />
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="px-4 py-2 text-xs text-muted-foreground">
          © 2024 Company Name
        </div>
      </SidebarFooter>
    </SidebarPrimitive>
  );
};

function SidebarNavItem({
  item,
  pathname,
}: {
  item: MenuItem;
  pathname: string;
}) {
  const [isOpen, setIsOpen] = React.useState(() => {
    // Open submenu if current path is in submenu
    if (item.submenu) {
      return item.submenu.some((subItem) => pathname.startsWith(subItem.href));
    }
    return false;
  });

  const isActive = pathname === item.href;
  const hasActiveChild = item.submenu?.some(
    (subItem) => pathname === subItem.href
  );

  // If there's a submenu, toggle it on click
  const handleClick = () => {
    if (item.submenu) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild={!item.submenu}
        isActive={isActive || hasActiveChild}
        onClick={item.submenu ? handleClick : undefined}
      >
        {item.submenu ? (
          <div className="flex w-full items-center">
            <item.icon className="mr-2 h-4 w-4" />
            <span>{item.title}</span>
            {isOpen ? (
              <ChevronDown className="ml-auto h-4 w-4" />
            ) : (
              <ChevronRight className="ml-auto h-4 w-4" />
            )}
          </div>
        ) : (
          <Link to={item.href}>
            <item.icon className="mr-2 h-4 w-4" />
            <span>{item.title}</span>
          </Link>
        )}
      </SidebarMenuButton>
      {item.submenu && isOpen && (
        <SidebarMenuSub>
          {item.submenu.map((subItem) => (
            <SidebarMenuSubItem key={subItem.title}>
              <SidebarMenuSubButton
                asChild
                isActive={pathname === subItem.href}
              >
                <Link to={subItem.href}>{subItem.title}</Link>
              </SidebarMenuSubButton>
            </SidebarMenuSubItem>
          ))}
        </SidebarMenuSub>
      )}
    </SidebarMenuItem>
  );
}

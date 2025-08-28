import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import {
  BarChart3,
  Bell,
  Building,
  Calendar,
  CheckSquare,
  CreditCard,
  LayoutDashboard,
  LogIn,
  LogOut,
  MessageSquare,
  Package,
  Settings,
  Sparkles,
  User,
  UserCheck,
  Users,
  Wrench,
  X,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { getNavigationForRole } from '../../utils/permissions';

interface SidebarProps {
  open: boolean;
  collapsed: boolean;
  onClose: () => void;
  onToggleCollapse: () => void;
}

const iconMap = {
  LayoutDashboard,
  Users,
  Building,
  Calendar,
  CreditCard,
  Sparkles,
  Wrench,
  Package,
  BarChart3,
  Bell,
  Settings,
  CheckSquare,
  LogIn,
  LogOut,
  User,
  Concierge: UserCheck,
  MessageSquare,
  UserCheck,
};

export const Sidebar: React.FC<SidebarProps> = ({
  open,
  collapsed,
  onClose,
}) => {
  const { user } = useAuth();
  const location = useLocation();

  const navigationItems = user ? getNavigationForRole(user.role) : [];

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const getIcon = (iconName: string) => {
    const IconComponent = iconMap[iconName as keyof typeof iconMap];
    return IconComponent ? <IconComponent className="h-5 w-5" /> : <LayoutDashboard className="h-5 w-5" />;
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <div
        className={cn(
          'fixed left-0 top-0 z-50 h-full bg-white border-r border-gray-200 transition-all duration-300 hidden lg:flex lg:flex-col',
          collapsed ? 'w-16' : 'w-64'
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center border-b px-4">
          {collapsed ? (
            <div className="flex h-8 w-8 items-center justify-center rounded bg-blue-600 text-white font-bold">
              H
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-blue-600 text-white font-bold">
                H
              </div>
              <span className="text-lg font-semibold text-gray-900">
                LuxurayStay
              </span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 px-3 py-4">
          <nav className="space-y-1">
            {navigationItems.map((item) => {
              const active = isActive(item.path);
              return (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant={active ? 'default' : 'ghost'}
                    className={cn(
                      'w-full justify-start gap-3 h-10',
                      collapsed && 'px-2',
                      active && 'bg-blue-600 text-white hover:bg-blue-700'
                    )}
                  >
                    {getIcon(item.icon)}
                    {!collapsed && (
                      <span className="truncate">{item.label}</span>
                    )}
                  </Button>
                </Link>
              );
            })}
          </nav>
        </ScrollArea>

        {/* User info (when not collapsed) */}
        {!collapsed && user && (
          <div className="border-t p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-sm font-medium">
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user.name}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user.role}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Sidebar */}
      <div
        className={cn(
          'fixed left-0 top-0 z-50 h-full w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 lg:hidden',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between border-b px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-blue-600 text-white font-bold">
              H
            </div>
            <span className="text-lg font-semibold text-gray-900">
              LuxurayStay
            </span>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 px-3 py-4">
          <nav className="space-y-1">
            {navigationItems.map((item) => {
              const active = isActive(item.path);
              return (
                <Link key={item.path} to={item.path} onClick={onClose}>
                  <Button
                    variant={active ? 'default' : 'ghost'}
                    className={cn(
                      'w-full justify-start gap-3 h-10',
                      active && 'bg-blue-600 text-white hover:bg-blue-700'
                    )}
                  >
                    {getIcon(item.icon)}
                    <span className="truncate">{item.label}</span>
                  </Button>
                </Link>
              );
            })}
          </nav>
        </ScrollArea>

        {/* User info */}
        {user && (
          <div className="border-t p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-sm font-medium">
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user.name}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user.role}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
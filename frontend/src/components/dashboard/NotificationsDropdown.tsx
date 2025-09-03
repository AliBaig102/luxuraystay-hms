import { useState } from 'react';
import { Bell, X, Clock, Check, Trash2, MoreVertical, ExternalLink } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  Button,
  Badge,
  ScrollArea,
} from '@/components/ui';
import { cn } from '@/lib/utils';
import { useApi } from '@/hooks/useApi';
import { ENDPOINT_URLS } from '@/constants/endpoints';
import type { Notification } from '@/types/models';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const formatTimestamp = (timestamp: Date) => {
  const now = new Date();
  const diff = now.getTime() - timestamp.getTime();
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
};

// Notification type colors
const notificationTypeColors: Record<string, string> = {
  booking: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  maintenance: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  housekeeping: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  billing: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  system: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  reminder: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
};

// Priority colors
const priorityColors: Record<string, string> = {
  low: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
  medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  high: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  urgent: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

export function NotificationsDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  
  // Fetch notifications for the current user
  const notificationsUrl = currentUser 
    ? `${ENDPOINT_URLS.NOTIFICATIONS.ALL}?recipientId=${currentUser._id}`
    : '';
  const { data: notificationsData, isLoading, invalidate,patch } = useApi<{notifications: Notification[]}>(
    notificationsUrl,{
      auth: true,
      swrConfig:{
        refreshInterval: 1000 * 60 * 1, // Refresh notifications every 1 minutes
      }
    }
  );

  const notifications = notificationsData?.notifications || [];
  const unreadCount = notifications.filter(n => !n.isRead).length;

  // API hooks for notification actions
  const { put: markAsReadApi } = useApi(ENDPOINT_URLS.NOTIFICATIONS.UPDATE(''), { immediate: false });
  const { delete: deleteNotificationApi } = useApi(ENDPOINT_URLS.NOTIFICATIONS.DELETE(''), { immediate: false });
  const { post: bulkDeleteApi } = useApi(ENDPOINT_URLS.NOTIFICATIONS.BULK_DELETE, { immediate: false });

  const markAsRead = async (id: string) => {
    try {
      await markAsReadApi(ENDPOINT_URLS.NOTIFICATIONS.UPDATE(id), {
        isRead: true,
        readDate: new Date()
      },{silent: true});
      await invalidate(ENDPOINT_URLS.NOTIFICATIONS.ALL);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!currentUser) return;
    try {
      await patch(ENDPOINT_URLS.NOTIFICATIONS.MARK_ALL_READ(currentUser._id),{});
      await invalidate(ENDPOINT_URLS.NOTIFICATIONS.ALL);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const removeNotification = async (id: string) => {
    try {
      await deleteNotificationApi(ENDPOINT_URLS.NOTIFICATIONS.DELETE(id));
      await invalidate();
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const clearAllNotifications = async () => {
    try {
      const notificationIds = notifications.map(n => n._id);
      await bulkDeleteApi(ENDPOINT_URLS.NOTIFICATIONS.BULK_DELETE, {
        notificationIds
      },{silent: true});
      await invalidate(ENDPOINT_URLS.NOTIFICATIONS.ALL);
    } catch (error) {
      console.error('Error clearing all notifications:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    return priorityColors[priority] || 'bg-muted text-muted-foreground';
  };

  const getTypeColor = (type: string) => {
    return notificationTypeColors[type] || 'bg-muted text-muted-foreground';
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-4 w-4 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="p-3 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium text-foreground">Notifications</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                navigate('/dashboard/notifications');
                setIsOpen(false);
              }}
              className="text-xs h-6 w-6 p-0"
            >
              <ExternalLink className="h-3 w-3" />
            </Button>
          </div>
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="text-xs h-7 px-2"
              >
                <Check className="h-3 w-3 mr-1" />
                Mark all read
              </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={clearAllNotifications}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear all
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        <ScrollArea className="max-h-[400px]">
          {isLoading ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Loading notifications...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No notifications
            </div>
          ) : (
            <div>
              {notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={cn(
                    "p-3 hover:bg-accent cursor-pointer border-b border-border last:border-b-0",
                    !notification.isRead && "bg-accent/50"
                  )}
                  onClick={() => markAsRead(notification._id)}
                >
                  <div className="flex justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium">{notification.title}</p>
                        <span className={cn("text-xs px-2 py-0.5 rounded-full", getTypeColor(notification.type))}>
                          {notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}
                        </span>
                        <span className={cn("text-xs px-2 py-0.5 rounded-full", getPriorityColor(notification.priority))}>
                          {notification.priority.charAt(0).toUpperCase() + notification.priority.slice(1)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{notification.message}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeNotification(notification._id);
                      }}
                      className="h-6 w-6 p-0 opacity-0 hover:opacity-100"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {formatTimestamp(new Date(notification.createdAt))}
                      </span>
                    </div>
                    {!notification.isRead && (
                      <Badge variant="secondary" className="text-xs">New</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        
        {notifications.length > 0 && (
          <div className="p-3 border-t border-border">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                navigate('/dashboard/notifications');
                setIsOpen(false);
              }}
              className="w-full text-xs h-8"
            >
              <ExternalLink className="h-3 w-3 mr-2" />
              View All Notifications
            </Button>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
import { logger } from '../utils/logger';
import { NotificationModel } from '../models/Notification.model';
import { NotificationType, Priority, UserRole } from '../types/models';

export interface NotificationPayload {
  recipientId: string;
  recipientType: 'user' | 'guest';
  title: string;
  message: string;
  type: NotificationType;
  priority: Priority;
  actionUrl?: string;
  metadata?: Record<string, any>;
}

export class NotificationIntegrationService {
  private webSocketService: any;

  constructor() {
    // Get the global WebSocket service instance
    this.webSocketService = (global as any).webSocketService;
  }

  /**
   * Send notification and persist to database
   */
  async sendNotification(payload: NotificationPayload): Promise<string | null> {
    try {
      // Create notification in database
      const notification = new NotificationModel(payload);
      const savedNotification = await notification.save();

      // Send real-time notification if WebSocket service is available
      if (this.webSocketService) {
        try {
          await this.webSocketService.sendNotificationToUser(
            payload.recipientId,
            payload
          );
        } catch (wsError: any) {
          logger.warn(
            'WebSocket notification failed, but database notification saved',
            {
              error: wsError.message,
              notificationId: (savedNotification as any)._id,
            }
          );
        }
      }

      logger.info('Notification sent successfully', {
        notificationId: (savedNotification as any)._id,
        recipientId: payload.recipientId,
        type: payload.type,
        priority: payload.priority,
      });

      return (savedNotification as any)._id.toString();
    } catch (error: any) {
      logger.error('Failed to send notification', {
        error: error.message,
        payload,
      });
      return null;
    }
  }

  /**
   * Send notification to multiple users
   */
  async sendNotificationToUsers(
    userIds: string[],
    payload: Omit<NotificationPayload, 'recipientId'>
  ): Promise<string[]> {
    try {
      const notificationPromises = userIds.map(userId =>
        this.sendNotification({
          ...payload,
          recipientId: userId,
        })
      );

      const results = await Promise.all(notificationPromises);
      const successfulIds = results.filter(id => id !== null);

      logger.info('Bulk notifications sent', {
        totalUsers: userIds.length,
        successfulCount: successfulIds.length,
        failedCount: userIds.length - successfulIds.length,
      });

      return successfulIds;
    } catch (error: any) {
      logger.error('Failed to send bulk notifications', {
        error: error.message,
        userIds,
        payload,
      });
      return [];
    }
  }

  /**
   * Send notification to users by role
   */
  async sendNotificationToRole(
    role: UserRole,
    payload: Omit<NotificationPayload, 'recipientId' | 'recipientType'>
  ): Promise<string[]> {
    try {
      if (!this.webSocketService) {
        logger.warn(
          'WebSocket service not available for role-based notifications'
        );
        return [];
      }

      // Use WebSocket service to send to role (it will handle database persistence)
      await this.webSocketService.sendNotificationToRole(role, {
        ...payload,
        recipientId: 'role_broadcast', // Will be replaced for each user
        recipientType: 'user',
      });

      logger.info('Role-based notification sent', {
        role,
        type: payload.type,
        priority: payload.priority,
      });

      return ['role_broadcast_success']; // Placeholder for success
    } catch (error: any) {
      logger.error('Failed to send role-based notification', {
        error: error.message,
        role,
        payload,
      });
      return [];
    }
  }

  /**
   * Send system-wide notification
   */
  async sendSystemNotification(
    title: string,
    message: string,
    priority: Priority = Priority.MEDIUM
  ): Promise<boolean> {
    try {
      if (!this.webSocketService) {
        logger.warn('WebSocket service not available for system notification');
        return false;
      }

      await this.webSocketService.sendSystemUpdate({
        type: 'system_announcement',
        message,
        data: { title, priority },
      });

      logger.info('System notification sent', {
        title,
        priority,
      });

      return true;
    } catch (error: any) {
      logger.error('Failed to send system notification', {
        error: error.message,
        title,
        message,
      });
      return false;
    }
  }

  /**
   * Send maintenance alert
   */
  async sendMaintenanceAlert(alert: {
    roomId: string;
    issue: string;
    priority: string;
    reportedBy: string;
  }): Promise<boolean> {
    try {
      if (!this.webSocketService) {
        logger.warn('WebSocket service not available for maintenance alert');
        return false;
      }

      await this.webSocketService.sendMaintenanceAlert(alert);

      logger.info('Maintenance alert sent', {
        roomId: alert.roomId,
        priority: alert.priority,
        reportedBy: alert.reportedBy,
      });

      return true;
    } catch (error: any) {
      logger.error('Failed to send maintenance alert', {
        error: error.message,
        alert,
      });
      return false;
    }
  }

  /**
   * Send housekeeping notification
   */
  async sendHousekeepingNotification(task: {
    roomId: string;
    taskType: string;
    priority: string;
    assignedTo: string;
  }): Promise<boolean> {
    try {
      if (!this.webSocketService) {
        logger.warn(
          'WebSocket service not available for housekeeping notification'
        );
        return false;
      }

      await this.webSocketService.sendHousekeepingNotification(task);

      logger.info('Housekeeping notification sent', {
        roomId: task.roomId,
        taskType: task.taskType,
        assignedTo: task.assignedTo,
      });

      return true;
    } catch (error: any) {
      logger.error('Failed to send housekeeping notification', {
        error: error.message,
        task,
      });
      return false;
    }
  }

  /**
   * Send booking confirmation
   */
  async sendBookingConfirmation(
    userId: string,
    booking: {
      reservationId: string;
      roomNumber: string;
      checkInDate: string;
      checkOutDate: string;
    }
  ): Promise<boolean> {
    try {
      if (!this.webSocketService) {
        logger.warn('WebSocket service not available for booking confirmation');
        return false;
      }

      await this.webSocketService.sendBookingConfirmation(userId, booking);

      logger.info('Booking confirmation sent', {
        userId,
        reservationId: booking.reservationId,
        roomNumber: booking.roomNumber,
      });

      return true;
    } catch (error: any) {
      logger.error('Failed to send booking confirmation', {
        error: error.message,
        userId,
        booking,
      });
      return false;
    }
  }

  /**
   * Get user's unread notifications count
   */
  async getUserUnreadCount(userId: string): Promise<number> {
    try {
      const count = await NotificationModel.countDocuments({
        recipientId: userId,
        isRead: false,
      });
      return count;
    } catch (error: any) {
      logger.error('Failed to get user unread count', {
        error: error.message,
        userId,
      });
      return 0;
    }
  }

  /**
   * Mark notification as read
   */
  async markNotificationAsRead(notificationId: string): Promise<boolean> {
    try {
      const result = await NotificationModel.findByIdAndUpdate(
        notificationId,
        { isRead: true, readDate: new Date() },
        { new: true }
      );
      return !!result;
    } catch (error: any) {
      logger.error('Failed to mark notification as read', {
        error: error.message,
        notificationId,
      });
      return false;
    }
  }

  /**
   * Mark multiple notifications as read
   */
  async markNotificationsAsRead(notificationIds: string[]): Promise<number> {
    try {
      const result = await NotificationModel.updateMany(
        { _id: { $in: notificationIds } },
        { isRead: true, readDate: new Date() }
      );
      return result.modifiedCount;
    } catch (error: any) {
      logger.error('Failed to mark notifications as read', {
        error: error.message,
        notificationIds,
      });
      return 0;
    }
  }

  /**
   * Get user's recent notifications
   */
  async getUserNotifications(
    userId: string,
    limit: number = 10,
    skip: number = 0
  ): Promise<any[]> {
    try {
      const notifications = await NotificationModel.find({
        recipientId: userId,
      })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      return notifications;
    } catch (error: any) {
      logger.error('Failed to get user notifications', {
        error: error.message,
        userId,
      });
      return [];
    }
  }
}

// Export singleton instance
export const notificationIntegrationService =
  new NotificationIntegrationService();

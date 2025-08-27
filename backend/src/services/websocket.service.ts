import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { logger } from '../utils/logger';
import { UserRole } from '../types/models';
import { NotificationModel } from '../models/Notification.model';
import { NotificationType, Priority } from '../types/models';

export interface SocketUser {
  userId: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  socketId: string;
}

export interface NotificationData {
  recipientId: string;
  recipientType: 'user' | 'guest';
  title: string;
  message: string;
  type: NotificationType;
  priority: Priority;
  actionUrl?: string;
}

export class WebSocketService {
  private io: SocketIOServer;
  private connectedUsers: Map<string, SocketUser> = new Map();
  private userSockets: Map<string, string[]> = new Map(); // userId -> socketIds[]

  constructor(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true,
      },
    });

    this.setupEventHandlers();
    logger.info('WebSocket service initialized');
  }

  private setupEventHandlers(): void {
    this.io.on('connection', socket => {
      logger.info('Client connected', { socketId: socket.id });

      // Handle user authentication
      socket.on('authenticate', (userData: Omit<SocketUser, 'socketId'>) => {
        this.handleUserAuthentication(socket, userData);
      });

      // Handle user disconnection
      socket.on('disconnect', () => {
        this.handleUserDisconnection(socket);
      });

      // Handle join room (for role-based notifications)
      socket.on('join-room', (room: string) => {
        void socket.join(room);
        logger.info('User joined room', { socketId: socket.id, room });
      });

      // Handle leave room
      socket.on('leave-room', (room: string) => {
        void socket.leave(room);
        logger.info('User left room', { socketId: socket.id, room });
      });

      // Handle typing indicators
      socket.on('typing-start', (data: { roomId: string; userId: string }) => {
        socket.to(data.roomId).emit('typing-start', data);
      });

      socket.on('typing-stop', (data: { roomId: string; userId: string }) => {
        socket.to(data.roomId).emit('typing-stop', data);
      });

      // Handle custom events
      socket.on('custom-event', (data: any) => {
        logger.info('Custom event received', { socketId: socket.id, data });
        // Handle custom events as needed
      });
    });
  }

  private handleUserAuthentication(
    socket: any,
    userData: Omit<SocketUser, 'socketId'>
  ): void {
    const socketUser: SocketUser = {
      ...userData,
      socketId: socket.id,
    };

    // Store user connection
    this.connectedUsers.set(socket.id, socketUser);

    // Store socket ID for user
    if (!this.userSockets.has(userData.userId)) {
      this.userSockets.set(userData.userId, []);
    }
    this.userSockets.get(userData.userId)!.push(socket.id);

    // Join role-based room
    socket.join(`role:${userData.role}`);

    // Join user-specific room
    socket.join(`user:${userData.userId}`);

    logger.info('User authenticated via WebSocket', {
      userId: userData.userId,
      email: userData.email,
      role: userData.role,
      socketId: socket.id,
    });

    // Send connection confirmation
    socket.emit('authenticated', {
      message: 'Successfully connected to notification service',
      userId: userData.userId,
      role: userData.role,
    });
  }

  private handleUserDisconnection(socket: any): void {
    const user = this.connectedUsers.get(socket.id);

    if (user) {
      // Remove socket from user's socket list
      const userSockets = this.userSockets.get(user.userId);
      if (userSockets) {
        const index = userSockets.indexOf(socket.id);
        if (index > -1) {
          userSockets.splice(index, 1);
        }

        // Remove user entry if no more sockets
        if (userSockets.length === 0) {
          this.userSockets.delete(user.userId);
        }
      }

      // Remove from connected users
      this.connectedUsers.delete(socket.id);

      logger.info('User disconnected from WebSocket', {
        userId: user.userId,
        email: user.email,
        socketId: socket.id,
      });
    } else {
      logger.info('Unknown client disconnected', { socketId: socket.id });
    }
  }

  /**
   * Create and send notification to specific user
   */
  public async sendNotificationToUser(
    userId: string,
    notification: NotificationData
  ): Promise<void> {
    try {
      // Save notification to database
      const savedNotification = await NotificationModel.create({
        ...notification,
        recipientId: userId,
        recipientType: 'user',
      });

      // Send real-time notification if user is connected
      const userSockets = this.userSockets.get(userId);
      if (userSockets && userSockets.length > 0) {
        userSockets.forEach(socketId => {
          void this.io.to(socketId).emit('notification', {
            ...savedNotification.toJSON(),
            socketId,
          });
        });

        logger.info('Real-time notification sent to user', {
          userId,
          notificationId: savedNotification._id,
          socketCount: userSockets.length,
        });
      } else {
        logger.info('User not connected, notification saved to database', {
          userId,
        });
      }

      logger.info('Notification created and sent successfully', {
        notificationId: savedNotification._id,
        userId,
        type: notification.type,
        priority: notification.priority,
      });
    } catch (error: any) {
      logger.error('Failed to send notification to user', {
        error: error.message,
        userId,
        notification,
      });
    }
  }

  /**
   * Create and send notification to all users with specific role
   */
  public async sendNotificationToRole(
    role: UserRole,
    notification: NotificationData
  ): Promise<void> {
    try {
      // Get all connected users with the specified role
      const roleUsers = Array.from(this.connectedUsers.values()).filter(
        user => user.role === role
      );

      // Create notifications for each user
      const notificationPromises = roleUsers.map(user =>
        NotificationModel.create({
          ...notification,
          recipientId: user.userId,
          recipientType: 'user',
        })
      );

      const savedNotifications = await Promise.all(notificationPromises);

      // Send real-time notifications
      void this.io.to(`role:${role}`).emit('notification', {
        ...notification,
        type: 'role_broadcast',
        role,
        timestamp: new Date(),
      });

      logger.info('Notifications sent to role', {
        role,
        notificationCount: savedNotifications.length,
        type: notification.type,
        priority: notification.priority,
      });
    } catch (error: any) {
      logger.error('Failed to send notifications to role', {
        error: error.message,
        role,
        notification,
      });
    }
  }

  /**
   * Create and send notification to all connected users
   */
  public async sendNotificationToAll(
    notification: NotificationData
  ): Promise<void> {
    try {
      // Get all connected users
      const connectedUserIds = Array.from(this.userSockets.keys());

      // Create notifications for each user
      const notificationPromises = connectedUserIds.map(userId =>
        NotificationModel.create({
          ...notification,
          recipientId: userId,
          recipientType: 'user',
        })
      );

      const savedNotifications = await Promise.all(notificationPromises);

      // Send real-time notifications
      this.io.emit('notification', {
        ...notification,
        type: 'system_broadcast',
        timestamp: new Date(),
      });

      logger.info('Notifications sent to all users', {
        notificationCount: savedNotifications.length,
        type: notification.type,
        priority: notification.priority,
      });
    } catch (error: any) {
      logger.error('Failed to send notifications to all users', {
        error: error.message,
        notification,
      });
    }
  }

  /**
   * Create and send notification to specific room
   */
  public async sendNotificationToRoom(
    room: string,
    notification: NotificationData
  ): Promise<void> {
    try {
      // Get all users in the room
      const roomSockets = await this.io.in(room).fetchSockets();
      const roomUserIds = roomSockets.map(socket => socket.id);

      // Find users by socket IDs
      const roomUsers = Array.from(this.connectedUsers.values()).filter(user =>
        roomUserIds.includes(user.socketId)
      );

      // Create notifications for each user in the room
      const notificationPromises = roomUsers.map(user =>
        NotificationModel.create({
          ...notification,
          recipientId: user.userId,
          recipientType: 'user',
        })
      );

      const savedNotifications = await Promise.all(notificationPromises);

      // Send real-time notifications to the room
      this.io.to(room).emit('notification', {
        ...notification,
        type: 'room_broadcast',
        room,
        timestamp: new Date(),
      });

      logger.info('Notifications sent to room', {
        room,
        notificationCount: savedNotifications.length,
        type: notification.type,
        priority: notification.priority,
      });
    } catch (error: any) {
      logger.error('Failed to send notifications to room', {
        error: error.message,
        room,
        notification,
      });
    }
  }

  /**
   * Send system update to all users
   */
  public async sendSystemUpdate(update: {
    type: string;
    message: string;
    data?: any;
  }): Promise<void> {
    try {
      const notification: NotificationData = {
        recipientId: 'system', // Will be replaced for each user
        recipientType: 'user',
        title: 'System Update',
        message: update.message,
        type: NotificationType.SYSTEM,
        priority: Priority.MEDIUM,
      };

      await this.sendNotificationToAll(notification);

      // Also emit system-update event for backward compatibility
      this.io.emit('system-update', {
        ...update,
        timestamp: new Date(),
      });

      logger.info('System update sent to all users', {
        updateType: update.type,
        message: update.message,
      });
    } catch (error: any) {
      logger.error('Failed to send system update', {
        error: error.message,
        update,
      });
    }
  }

  /**
   * Send maintenance alert to maintenance staff
   */
  public async sendMaintenanceAlert(alert: {
    roomId: string;
    issue: string;
    priority: string;
    reportedBy: string;
  }): Promise<void> {
    try {
      const notification: NotificationData = {
        recipientId: 'maintenance-staff', // Will be replaced for each user
        recipientType: 'user',
        title: 'Maintenance Alert',
        message: `Room ${alert.roomId}: ${alert.issue} (Priority: ${alert.priority})`,
        type: NotificationType.MAINTENANCE,
        priority: alert.priority as Priority,
        actionUrl: `/maintenance/requests`,
      };

      await this.sendNotificationToRole(UserRole.MAINTENANCE, notification);

      logger.info('Maintenance alert sent', {
        roomId: alert.roomId,
        priority: alert.priority,
        reportedBy: alert.reportedBy,
      });
    } catch (error: any) {
      logger.error('Failed to send maintenance alert', {
        error: error.message,
        alert,
      });
    }
  }

  /**
   * Send housekeeping task notification
   */
  public async sendHousekeepingNotification(task: {
    roomId: string;
    taskType: string;
    priority: string;
    assignedTo: string;
  }): Promise<void> {
    try {
      const notification: NotificationData = {
        recipientId: task.assignedTo,
        recipientType: 'user',
        title: 'Housekeeping Task Assigned',
        message: `Room ${task.roomId}: ${task.taskType} (Priority: ${task.priority})`,
        type: NotificationType.HOUSEKEEPING,
        priority: task.priority as Priority,
        actionUrl: `/housekeeping/tasks`,
      };

      await this.sendNotificationToUser(task.assignedTo, notification);

      logger.info('Housekeeping notification sent', {
        roomId: task.roomId,
        taskType: task.taskType,
        assignedTo: task.assignedTo,
        priority: task.priority,
      });
    } catch (error: any) {
      logger.error('Failed to send housekeeping notification', {
        error: error.message,
        task,
      });
    }
  }

  /**
   * Send booking confirmation to guest
   */
  public async sendBookingConfirmation(
    userId: string,
    booking: {
      reservationId: string;
      roomNumber: string;
      checkInDate: string;
      checkOutDate: string;
    }
  ): Promise<void> {
    try {
      const notification: NotificationData = {
        recipientId: userId,
        recipientType: 'user',
        title: 'Booking Confirmed',
        message: `Your booking for Room ${booking.roomNumber} from ${booking.checkInDate} to ${booking.checkOutDate} has been confirmed.`,
        type: NotificationType.BOOKING,
        priority: Priority.MEDIUM,
        actionUrl: `/reservations/${booking.reservationId}`,
      };

      await this.sendNotificationToUser(userId, notification);

      logger.info('Booking confirmation sent', {
        userId,
        reservationId: booking.reservationId,
        roomNumber: booking.roomNumber,
      });
    } catch (error: any) {
      logger.error('Failed to send booking confirmation', {
        error: error.message,
        userId,
        booking,
      });
    }
  }

  /**
   * Get user's unread notifications count
   */
  public async getUserUnreadCount(userId: string): Promise<number> {
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
  public async markNotificationAsRead(
    notificationId: string
  ): Promise<boolean> {
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
   * Get connected users count
   */
  public getConnectedUsersCount(): number {
    return this.connectedUsers.size;
  }

  /**
   * Get connected users by role
   */
  public getConnectedUsersByRole(role: UserRole): SocketUser[] {
    return Array.from(this.connectedUsers.values()).filter(
      user => user.role === role
    );
  }

  /**
   * Check if user is connected
   */
  public isUserConnected(userId: string): boolean {
    return this.userSockets.has(userId);
  }

  /**
   * Get user's active socket count
   */
  public getUserSocketCount(userId: string): number {
    const userSockets = this.userSockets.get(userId);
    return userSockets ? userSockets.length : 0;
  }
}

// Export the class for instantiation
export default WebSocketService;

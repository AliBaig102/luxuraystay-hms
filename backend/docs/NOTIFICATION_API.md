# Notification Management API

A comprehensive notification system for the Luxury Stay Hotel Management System that supports real-time notifications, filtering, bulk operations, and detailed analytics.

## Overview

The Notification Management API provides a complete solution for handling notifications across different user types and scenarios in a hotel management system. It supports various notification types including booking confirmations, maintenance alerts, housekeeping updates, billing notifications, system messages, and reminders.

## Features

- ✅ **CRUD Operations**: Create, read, update, and delete notifications
- ✅ **Advanced Filtering**: Filter by recipient, type, priority, and read status
- ✅ **Bulk Operations**: Mark multiple notifications as read or delete in bulk
- ✅ **Search Functionality**: Full-text search across notification titles and messages
- ✅ **Statistics & Analytics**: Comprehensive notification statistics and counts
- ✅ **Pagination**: Efficient pagination for large datasets
- ✅ **Real-time Ready**: Designed for real-time notification systems
- ✅ **Type Safety**: Full TypeScript support with Zod validation

## Base URL

```
http://localhost:4000/api/v1/notifications
```

## Data Models

### Notification Schema

```typescript
interface Notification {
  _id: string;
  recipientId: string | null;
  recipientType: 'user' | 'staff' | 'admin';
  title: string;
  message: string;
  type: 'booking' | 'maintenance' | 'housekeeping' | 'billing' | 'system' | 'reminder';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  isRead: boolean;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  readAt?: Date;
}
```

### Notification Types

- **booking**: Booking confirmations, modifications, cancellations
- **maintenance**: Maintenance schedules, completion notifications
- **housekeeping**: Room cleaning status, inventory updates
- **billing**: Payment confirmations, invoice notifications
- **system**: System maintenance, updates, announcements
- **reminder**: Upcoming events, deadlines, follow-ups

### Priority Levels

- **low**: General information, non-urgent updates
- **medium**: Standard notifications requiring attention
- **high**: Important notifications requiring prompt action
- **urgent**: Critical notifications requiring immediate attention

## API Endpoints

### 1. Create Notification

**POST** `/notifications`

Create a new notification for a specific recipient.

**Request Body:**
```json
{
  "recipientId": "507f1f77bcf86cd799439011",
  "recipientType": "user",
  "title": "Booking Confirmation",
  "message": "Your booking has been confirmed for Room 101",
  "type": "booking",
  "priority": "medium",
  "metadata": {
    "bookingId": "BK123456",
    "roomNumber": "101"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Notification created successfully",
  "data": {
    "_id": "68aef8f1b55c206aa34fdb1c",
    "recipientId": "507f1f77bcf86cd799439011",
    "recipientType": "user",
    "title": "Booking Confirmation",
    "message": "Your booking has been confirmed for Room 101",
    "type": "booking",
    "priority": "medium",
    "isRead": false,
    "metadata": {
      "bookingId": "BK123456",
      "roomNumber": "101"
    },
    "createdAt": "2025-08-27T12:00:00.000Z",
    "updatedAt": "2025-08-27T12:00:00.000Z"
  }
}
```

### 2. Get All Notifications

**GET** `/notifications`

Retrieve notifications with optional filtering and pagination.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10, max: 100)
- `recipientId` (string): Filter by recipient ID
- `recipientType` (string): Filter by recipient type
- `type` (string): Filter by notification type
- `priority` (string): Filter by priority level
- `isRead` (boolean): Filter by read status

**Example:**
```
GET /notifications?recipientType=user&type=booking&page=1&limit=10
```

### 3. Get Notification by ID

**GET** `/notifications/:id`

Retrieve a specific notification by its ID.

### 4. Update Notification

**PUT** `/notifications/:id`

Update an existing notification. Only certain fields can be updated.

**Updatable Fields:**
- `title`
- `message`
- `priority`
- `metadata`

### 5. Delete Notification

**DELETE** `/notifications/:id`

Delete a specific notification.

### 6. Mark as Read/Unread

**PATCH** `/notifications/mark-as-read`
**PATCH** `/notifications/mark-as-unread`

Mark a specific notification as read or unread.

**Request Body:**
```json
{
  "notificationId": "68aef8f1b55c206aa34fdb1c"
}
```

### 7. Mark All as Read

**PATCH** `/notifications/mark-all-read`

Mark all notifications as read for a specific recipient.

**Request Body:**
```json
{
  "recipientId": "507f1f77bcf86cd799439011",
  "recipientType": "user"
}
```

### 8. Bulk Delete

**DELETE** `/notifications/bulk-delete`

Delete multiple notifications by their IDs.

**Request Body:**
```json
{
  "notificationIds": [
    "68aef8f1b55c206aa34fdb1c",
    "68aef8f1b55c206aa34fdb1d"
  ]
}
```

### 9. Get Statistics

**GET** `/notifications/statistics`

Get comprehensive notification statistics.

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 150,
    "byType": {
      "booking": 45,
      "maintenance": 20,
      "housekeeping": 30,
      "billing": 25,
      "system": 15,
      "reminder": 15
    },
    "byPriority": {
      "low": 40,
      "medium": 60,
      "high": 35,
      "urgent": 15
    },
    "readStatus": {
      "read": 120,
      "unread": 30
    }
  }
}
```

### 10. Get Unread Count

**GET** `/notifications/unread-count/:recipientId`

Get the count of unread notifications for a specific recipient.

### 11. Search Notifications

**GET** `/notifications/search`

Search notifications by title and message content.

**Query Parameters:**
- `query` (string, required): Search term
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)

## Error Handling

The API uses consistent error response format:

```json
{
  "success": false,
  "message": "Error description",
  "data": null,
  "errors": [
    {
      "field": "fieldName",
      "message": "Validation error message",
      "code": "error_code"
    }
  ],
  "timestamp": "2025-08-27T12:00:00.000Z"
}
```

### Common HTTP Status Codes

- `200 OK`: Successful GET, PUT, PATCH operations
- `201 Created`: Successful POST operations
- `400 Bad Request`: Validation errors, invalid input
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server errors

## Validation Rules

### Required Fields (Create)
- `recipientType`: Must be 'user', 'staff', or 'admin'
- `title`: String, 1-200 characters
- `message`: String, 1-1000 characters
- `type`: Must be one of the defined notification types
- `priority`: Must be one of the defined priority levels

### Optional Fields
- `recipientId`: String (ObjectId format when provided)
- `metadata`: Object with additional data

### Update Restrictions
- Cannot update: `recipientId`, `recipientType`, `type`, `isRead`, `createdAt`
- Can update: `title`, `message`, `priority`, `metadata`

## Usage Examples

### Creating a Booking Confirmation

```javascript
const response = await fetch('/api/v1/notifications', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    recipientId: '507f1f77bcf86cd799439011',
    recipientType: 'user',
    title: 'Booking Confirmed',
    message: 'Your reservation for Room 101 has been confirmed.',
    type: 'booking',
    priority: 'medium',
    metadata: {
      bookingId: 'BK123456',
      roomNumber: '101',
      checkIn: '2025-09-01',
      checkOut: '2025-09-05'
    }
  })
});
```

### Getting Unread Notifications for a User

```javascript
const response = await fetch('/api/v1/notifications?recipientId=507f1f77bcf86cd799439011&isRead=false&page=1&limit=20');
const data = await response.json();
```

### Marking All Notifications as Read

```javascript
const response = await fetch('/api/v1/notifications/mark-all-read', {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    recipientId: '507f1f77bcf86cd799439011',
    recipientType: 'user'
  })
});
```

## Integration with Frontend

### Real-time Notifications

The API is designed to work with WebSocket or Server-Sent Events for real-time notifications:

```javascript
// Example WebSocket integration
const ws = new WebSocket('ws://localhost:4000/notifications');

ws.onmessage = (event) => {
  const notification = JSON.parse(event.data);
  // Handle new notification
  displayNotification(notification);
};
```

### Notification Badge

```javascript
// Get unread count for badge
const getUnreadCount = async (userId) => {
  const response = await fetch(`/api/v1/notifications/unread-count/${userId}`);
  const data = await response.json();
  return data.data.count;
};
```

## Testing

Use the provided Postman collection (`notification-api.postman.json`) to test all endpoints. The collection includes:

- Pre-configured requests for all endpoints
- Example payloads
- Environment variables for easy testing
- Comprehensive test scenarios

## Performance Considerations

- **Pagination**: Always use pagination for large datasets
- **Indexing**: Database indexes are optimized for common query patterns
- **Bulk Operations**: Use bulk endpoints for multiple operations
- **Caching**: Consider implementing caching for frequently accessed data

## Security

- Input validation using Zod schemas
- Rate limiting implemented
- CORS protection enabled
- Helmet security headers applied
- MongoDB injection protection

## Future Enhancements

- [ ] WebSocket integration for real-time notifications
- [ ] Email/SMS notification delivery
- [ ] Notification templates
- [ ] Scheduled notifications
- [ ] Notification preferences per user
- [ ] Push notification support
- [ ] Notification analytics dashboard

---

**Last Updated**: August 27, 2025  
**API Version**: 1.0.0  
**Documentation Version**: 1.0.0
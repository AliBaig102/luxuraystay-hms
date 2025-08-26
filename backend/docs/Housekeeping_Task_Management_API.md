# Housekeeping Task Management API Documentation

## Overview
The Housekeeping Task Management API provides comprehensive endpoints for managing housekeeping tasks in the hotel management system. This includes CRUD operations, task assignment, status management, completion workflows, and analytics.

## Base URL
```
http://localhost:4000/api/v1/housekeeping-tasks
```

## Authentication
All endpoints require proper authentication headers (implementation depends on your auth system).

## Endpoints

### 1. Create Housekeeping Task
**POST** `/api/v1/housekeeping-tasks`

Creates a new housekeeping task.

**Request Body:**
```json
{
  "roomId": "507f1f77bcf86cd799439011",
  "assignedStaffId": "507f1f77bcf86cd799439012",
  "taskType": "daily_cleaning",
  "priority": "medium",
  "scheduledDate": "2025-01-27T10:00:00.000Z",
  "notes": "Regular room cleaning"
}
```

**Task Types:**
- `daily_cleaning`
- `deep_cleaning`
- `linen_change`
- `amenity_restock`
- `inspection`

**Priority Levels:**
- `low`
- `medium`
- `high`
- `urgent`

**Response:**
```json
{
  "success": true,
  "message": "Housekeeping task created successfully",
  "data": {
    "_id": "68ade55d21066f781fc64a33",
    "roomId": "507f1f77bcf86cd799439011",
    "assignedStaffId": "507f1f77bcf86cd799439012",
    "taskType": "daily_cleaning",
    "status": "pending",
    "priority": "medium",
    "scheduledDate": "2025-01-27T10:00:00.000Z",
    "notes": "Regular room cleaning",
    "createdAt": "2025-08-26T16:48:29.512Z",
    "updatedAt": "2025-08-26T16:48:29.512Z"
  },
  "timestamp": "2025-08-26T16:48:29.512Z"
}
```

### 2. Get All Housekeeping Tasks
**GET** `/api/v1/housekeeping-tasks`

Retrieves all housekeeping tasks with optional filtering and pagination.

**Query Parameters:**
- `page` (number): Page number for pagination (default: 1)
- `limit` (number): Number of items per page (default: 10)
- `status` (string): Filter by task status
- `priority` (string): Filter by priority level
- `taskType` (string): Filter by task type
- `assignedStaffId` (string): Filter by assigned staff
- `roomId` (string): Filter by room
- `search` (string): Search in task notes

**Example:**
```
GET /api/v1/housekeeping-tasks?status=completed&priority=high&page=1&limit=5
```

**Response:**
```json
{
  "success": true,
  "message": "Housekeeping tasks fetched successfully",
  "data": [
    {
      "_id": "68ade55d21066f781fc64a33",
      "roomId": "507f1f77bcf86cd799439011",
      "assignedStaffId": "507f1f77bcf86cd799439012",
      "taskType": "daily_cleaning",
      "status": "completed",
      "priority": "medium",
      "scheduledDate": "2025-01-27T10:00:00.000Z",
      "notes": "Regular room cleaning",
      "createdAt": "2025-08-26T16:48:29.512Z",
      "updatedAt": "2025-08-26T16:49:26.757Z",
      "completedDate": "2025-08-26T16:49:26.757Z"
    }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "pages": 1
    }
  },
  "timestamp": "2025-08-26T16:50:38.320Z"
}
```

### 3. Get Housekeeping Task by ID
**GET** `/api/v1/housekeeping-tasks/{id}`

Retrieves a specific housekeeping task by its ID.

**Response:**
```json
{
  "success": true,
  "message": "Housekeeping task fetched successfully",
  "data": {
    "_id": "68ade55d21066f781fc64a33",
    "roomId": "507f1f77bcf86cd799439011",
    "assignedStaffId": "507f1f77bcf86cd799439012",
    "taskType": "daily_cleaning",
    "status": "completed",
    "priority": "medium",
    "scheduledDate": "2025-01-27T10:00:00.000Z",
    "notes": "Regular room cleaning",
    "createdAt": "2025-08-26T16:48:29.512Z",
    "updatedAt": "2025-08-26T16:49:26.757Z"
  },
  "timestamp": "2025-08-26T16:50:12.671Z"
}
```

### 4. Update Housekeeping Task
**PUT** `/api/v1/housekeeping-tasks/{id}`

Updates an existing housekeeping task.

**Request Body:**
```json
{
  "notes": "Updated: Room cleaned thoroughly with extra attention to bathroom",
  "priority": "high"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Housekeeping task updated successfully",
  "data": {
    "_id": "68ade55d21066f781fc64a33",
    "roomId": "507f1f77bcf86cd799439011",
    "assignedStaffId": "507f1f77bcf86cd799439012",
    "taskType": "daily_cleaning",
    "status": "completed",
    "priority": "high",
    "scheduledDate": "2025-01-27T10:00:00.000Z",
    "notes": "Updated: Room cleaned thoroughly with extra attention to bathroom",
    "createdAt": "2025-08-26T16:48:29.512Z",
    "updatedAt": "2025-08-26T16:51:02.123Z"
  },
  "timestamp": "2025-08-26T16:51:02.123Z"
}
```

### 5. Delete Housekeeping Task
**DELETE** `/api/v1/housekeeping-tasks/{id}`

Deletes a housekeeping task.

**Response:**
```json
{
  "success": true,
  "message": "Housekeeping task deleted successfully",
  "data": null,
  "timestamp": "2025-08-26T16:51:15.456Z"
}
```

### 6. Assign Task to Staff
**POST** `/api/v1/housekeeping-tasks/{id}/assign`

Assigns a housekeeping task to a staff member.

**Request Body:**
```json
{
  "assignedStaffId": "507f1f77bcf86cd799439013"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Housekeeping task assigned successfully",
  "data": {
    "_id": "68ade55d21066f781fc64a33",
    "roomId": "507f1f77bcf86cd799439011",
    "assignedStaffId": "507f1f77bcf86cd799439013",
    "taskType": "daily_cleaning",
    "status": "in_progress",
    "priority": "medium",
    "scheduledDate": "2025-01-27T10:00:00.000Z",
    "notes": "Regular room cleaning",
    "createdAt": "2025-08-26T16:48:29.512Z",
    "updatedAt": "2025-08-26T16:49:15.234Z"
  },
  "timestamp": "2025-08-26T16:49:15.234Z"
}
```

### 7. Update Task Status
**PATCH** `/api/v1/housekeeping-tasks/{id}/status`

Updates the status of a housekeeping task.

**Request Body:**
```json
{
  "status": "completed"
}
```

**Status Options:**
- `pending`
- `in_progress`
- `completed`
- `cancelled`

**Response:**
```json
{
  "success": true,
  "message": "Housekeeping task status updated successfully",
  "data": {
    "_id": "68ade55d21066f781fc64a33",
    "roomId": "507f1f77bcf86cd799439011",
    "assignedStaffId": "507f1f77bcf86cd799439013",
    "taskType": "daily_cleaning",
    "status": "completed",
    "priority": "medium",
    "scheduledDate": "2025-01-27T10:00:00.000Z",
    "notes": "Regular room cleaning",
    "createdAt": "2025-08-26T16:48:29.512Z",
    "updatedAt": "2025-08-26T16:49:26.757Z",
    "completedDate": "2025-08-26T16:49:26.757Z"
  },
  "timestamp": "2025-08-26T16:49:26.757Z"
}
```

### 8. Complete Task
**POST** `/api/v1/housekeeping-tasks/{id}/complete`

Marks a task as completed with completion details.

**Request Body:**
```json
{
  "completionNotes": "Room cleaned thoroughly, all amenities restocked",
  "completedAt": "2025-01-27T14:30:00.000Z"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Housekeeping task completed successfully",
  "data": {
    "_id": "68ade55d21066f781fc64a33",
    "roomId": "507f1f77bcf86cd799439011",
    "assignedStaffId": "507f1f77bcf86cd799439013",
    "taskType": "daily_cleaning",
    "status": "completed",
    "priority": "medium",
    "scheduledDate": "2025-01-27T10:00:00.000Z",
    "notes": "Regular room cleaning",
    "completionNotes": "Room cleaned thoroughly, all amenities restocked",
    "completedAt": "2025-01-27T14:30:00.000Z",
    "createdAt": "2025-08-26T16:48:29.512Z",
    "updatedAt": "2025-08-26T16:49:26.757Z"
  },
  "timestamp": "2025-08-26T16:49:26.757Z"
}
```

**Error Response (if already completed):**
```json
{
  "success": false,
  "message": "Housekeeping task is already completed",
  "data": null,
  "errors": [],
  "timestamp": "2025-08-26T16:49:48.281Z"
}
```

### 9. Get Tasks by Room
**GET** `/api/v1/housekeeping-tasks/room/{roomId}`

Retrieves all housekeeping tasks for a specific room.

**Response:**
```json
{
  "success": true,
  "message": "Housekeeping tasks for room fetched successfully",
  "data": [
    {
      "_id": "68ade55d21066f781fc64a33",
      "roomId": "507f1f77bcf86cd799439011",
      "assignedStaffId": "507f1f77bcf86cd799439012",
      "taskType": "daily_cleaning",
      "status": "completed",
      "priority": "medium",
      "scheduledDate": "2025-01-27T10:00:00.000Z",
      "notes": "Regular room cleaning"
    }
  ],
  "timestamp": "2025-08-26T16:52:00.000Z"
}
```

### 10. Get Tasks by Staff
**GET** `/api/v1/housekeeping-tasks/staff/{staffId}`

Retrieves all housekeeping tasks assigned to a specific staff member.

**Response:**
```json
{
  "success": true,
  "message": "Housekeeping tasks for staff fetched successfully",
  "data": [
    {
      "_id": "68ade55d21066f781fc64a33",
      "roomId": "507f1f77bcf86cd799439011",
      "assignedStaffId": "507f1f77bcf86cd799439012",
      "taskType": "daily_cleaning",
      "status": "completed",
      "priority": "medium",
      "scheduledDate": "2025-01-27T10:00:00.000Z",
      "notes": "Regular room cleaning"
    }
  ],
  "timestamp": "2025-08-26T16:52:30.000Z"
}
```

### 11. Get Overdue Tasks
**GET** `/api/v1/housekeeping-tasks/overdue`

Retrieves all overdue housekeeping tasks.

**Response:**
```json
{
  "success": true,
  "message": "Overdue housekeeping tasks fetched successfully",
  "data": [],
  "timestamp": "2025-08-26T16:50:12.671Z"
}
```

### 12. Get Task Statistics
**GET** `/api/v1/housekeeping-tasks/statistics`

Retrieves comprehensive statistics about housekeeping tasks.

**Response:**
```json
{
  "success": true,
  "message": "Housekeeping task statistics fetched successfully",
  "data": {
    "total": 1,
    "completed": 1,
    "overdue": 0,
    "completionRate": 100,
    "byStatus": [
      {
        "_id": "completed",
        "count": 1
      }
    ],
    "byPriority": [
      {
        "_id": "medium",
        "count": 1
      }
    ],
    "byTaskType": [
      {
        "_id": "daily_cleaning",
        "count": 1
      }
    ]
  },
  "timestamp": "2025-08-26T16:50:00.000Z"
}
```

## Error Responses

### Validation Error
```json
{
  "success": false,
  "message": "Validation failed",
  "data": null,
  "errors": [
    {
      "field": "taskType",
      "message": "`cleaning` is not a valid enum value for path `taskType`."
    },
    {
      "field": "assignedStaffId",
      "message": "Path `assignedStaffId` is required."
    }
  ],
  "timestamp": "2025-08-26T16:48:06.000Z"
}
```

### Not Found Error
```json
{
  "success": false,
  "message": "Housekeeping task not found",
  "data": null,
  "errors": [],
  "timestamp": "2025-08-26T16:52:00.000Z"
}
```

### Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error",
  "data": null,
  "errors": [],
  "timestamp": "2025-08-26T16:52:00.000Z"
}
```

## Postman Collection

To import this API into Postman:

1. Create a new collection named "Housekeeping Task Management API"
2. Set the base URL as an environment variable: `{{baseUrl}} = http://localhost:4000`
3. Add each endpoint as a separate request
4. Configure proper headers and request bodies as shown above
5. Set up tests to validate responses

## Testing Notes

- Ensure MongoDB is running and connected
- Start the backend server on port 4000
- Use valid ObjectId formats for roomId and assignedStaffId
- Test error scenarios by providing invalid data
- Verify pagination works correctly with large datasets
- Test filtering combinations to ensure they work as expected

## Rate Limiting

The API may implement rate limiting. Check response headers for rate limit information:
- `X-RateLimit-Limit`: Maximum requests per time window
- `X-RateLimit-Remaining`: Remaining requests in current window
- `X-RateLimit-Reset`: Time when the rate limit resets

## Changelog

### Version 1.0.0 (2025-08-26)
- Initial release of Housekeeping Task Management API
- Complete CRUD operations
- Task assignment and status management
- Filtering and search capabilities
- Statistics and analytics endpoints
- Comprehensive error handling
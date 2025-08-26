# LuxuryStay HMS - Postman API Documentation

This document provides comprehensive API documentation for the LuxuryStay Hotel Management System. Each module includes detailed endpoint descriptions, request/response examples, and usage instructions.

## Table of Contents

1. [Environment Setup](#environment-setup)
2. [Authentication](#authentication)
3. [User Management API](#user-management-api)
4. [Room Management API](#room-management-api)
5. [Reservation Management API](#reservation-management-api)
6. [Check-in Management API](#check-in-management-api)
7. [Check-out Management API](#check-out-management-api)
8. [Service Request Management API](#service-request-management-api)
9. [Billing Management API](#billing-management-api)
10. [Error Handling](#error-handling)

## Environment Setup

Before using the API collections, set up the following environment variables in Postman:

```json
{
  "BASE_URL": "http://localhost:3000",
  "USER_ID": "507f1f77bcf86cd799439010",
  "ROOM_ID": "507f1f77bcf86cd799439011",
  "RESERVATION_ID": "507f1f77bcf86cd799439012",
  "CHECKIN_ID": "507f1f77bcf86cd799439013",
  "CHECKOUT_ID": "507f1f77bcf86cd799439014",
  "SERVICE_REQUEST_ID": "507f1f77bcf86cd799439015",
  "BILL_ID": "507f1f77bcf86cd799439016"
}
```

## Authentication

All API endpoints require proper authentication. Include the following headers in your requests:

```
Content-Type: application/json
Authorization: Bearer <your-jwt-token>
```

## User Management API

### Base URL: `/api/v1/users`

#### Get All Users
```http
GET {{BASE_URL}}/api/v1/users?page=1&limit=10&query=john&sortBy=firstName&sortOrder=asc
```

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10, max: 100)
- `query` (string): Search by firstName, lastName, or email
- `sortBy` (string): Sort field (firstName, lastName, email, createdAt)
- `sortOrder` (string): Sort order (asc, desc)
- `role` (string): Filter by user role
- `status` (string): Filter by user status

#### Create User
```http
POST {{BASE_URL}}/api/v1/users
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "phone": "+1234567890",
  "role": "guest",
  "status": "active"
}
```

## Room Management API

### Base URL: `/api/v1/rooms`

#### Get All Rooms
```http
GET {{BASE_URL}}/api/v1/rooms?page=1&limit=10&roomType=deluxe&status=available
```

**Query Parameters:**
- `page` (number): Page number
- `limit` (number): Items per page
- `roomType` (string): Filter by room type
- `status` (string): Filter by room status
- `floor` (number): Filter by floor number
- `priceMin` (number): Minimum price filter
- `priceMax` (number): Maximum price filter

#### Create Room
```http
POST {{BASE_URL}}/api/v1/rooms
Content-Type: application/json

{
  "roomNumber": "101",
  "roomType": "deluxe",
  "floor": 1,
  "price": 200,
  "capacity": 2,
  "amenities": ["WiFi", "TV", "AC"],
  "status": "available"
}
```

## Reservation Management API

### Base URL: `/api/v1/reservations`

#### Get All Reservations
```http
GET {{BASE_URL}}/api/v1/reservations?page=1&limit=10&status=confirmed
```

#### Create Reservation
```http
POST {{BASE_URL}}/api/v1/reservations
Content-Type: application/json

{
  "guestId": "{{USER_ID}}",
  "roomId": "{{ROOM_ID}}",
  "checkInDate": "2024-01-15T00:00:00.000Z",
  "checkOutDate": "2024-01-18T00:00:00.000Z",
  "numberOfGuests": 2,
  "specialRequests": "Late check-in",
  "totalAmount": 1200
}
```

## Check-in Management API

### Base URL: `/api/v1/checkins`

The Check-in Management API handles guest check-in processes, room assignments, and check-in status tracking.

#### Get All Check-ins
```http
GET {{BASE_URL}}/api/v1/checkins?page=1&limit=10&status=pending&sortBy=checkInTime&sortOrder=desc
```

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10, max: 100)
- `query` (string): Search by assignedRoomNumber or specialInstructions
- `sortBy` (string): Sort field (checkInTime, assignedRoomNumber, createdAt)
- `sortOrder` (string): Sort order (asc, desc)
- `status` (string): Filter by status (pending, completed, cancelled)
- `roomId` (string): Filter by room ID
- `guestId` (string): Filter by guest ID
- `dateFrom` (string): Filter check-ins from date (YYYY-MM-DD)
- `dateTo` (string): Filter check-ins to date (YYYY-MM-DD)

**Example Response:**
```json
{
  "success": true,
  "message": "Check-ins fetched successfully",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439013",
      "reservationId": {
        "_id": "507f1f77bcf86cd799439012",
        "guestName": "John Doe",
        "checkInDate": "2024-01-15T00:00:00.000Z"
      },
      "roomId": {
        "_id": "507f1f77bcf86cd799439011",
        "roomNumber": "101",
        "roomType": "deluxe"
      },
      "guestId": {
        "_id": "507f1f77bcf86cd799439010",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john.doe@example.com"
      },
      "checkInTime": "2024-01-15T14:00:00.000Z",
      "assignedRoomNumber": "101",
      "keyIssued": true,
      "welcomePackDelivered": true,
      "specialInstructions": "Guest prefers high floor",
      "status": "completed"
    }
  ],
  "meta": {
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 50,
      "itemsPerPage": 10
    }
  }
}
```

#### Get Check-in by ID
```http
GET {{BASE_URL}}/api/v1/checkins/{{CHECKIN_ID}}
```

#### Create Check-in
```http
POST {{BASE_URL}}/api/v1/checkins
Content-Type: application/json

{
  "reservationId": "{{RESERVATION_ID}}",
  "roomId": "{{ROOM_ID}}",
  "guestId": "{{USER_ID}}",
  "checkInTime": "2024-01-15T14:00:00.000Z",
  "assignedRoomNumber": "101",
  "specialInstructions": "Guest prefers high floor"
}
```

**Example Response:**
```json
{
  "success": true,
  "message": "Check-in created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439013",
    "reservationId": "507f1f77bcf86cd799439012",
    "roomId": "507f1f77bcf86cd799439011",
    "guestId": "507f1f77bcf86cd799439010",
    "checkInTime": "2024-01-15T14:00:00.000Z",
    "assignedRoomNumber": "101",
    "keyIssued": false,
    "welcomePackDelivered": false,
    "specialInstructions": "Guest prefers high floor",
    "status": "pending",
    "createdAt": "2024-01-15T13:00:00.000Z"
  }
}
```

#### Update Check-in
```http
PUT {{BASE_URL}}/api/v1/checkins/{{CHECKIN_ID}}
Content-Type: application/json

{
  "assignedRoomNumber": "102",
  "keyIssued": true,
  "welcomePackDelivered": true,
  "specialInstructions": "Room changed due to guest preference"
}
```

#### Complete Check-in
```http
POST {{BASE_URL}}/api/v1/checkins/{{CHECKIN_ID}}/complete
Content-Type: application/json

{
  "keyIssued": true,
  "welcomePackDelivered": true,
  "checkInTime": "2024-01-15T14:00:00.000Z"
}
```

**Example Response:**
```json
{
  "success": true,
  "message": "Check-in completed successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439013",
    "reservationId": "507f1f77bcf86cd799439012",
    "roomId": "507f1f77bcf86cd799439011",
    "guestId": "507f1f77bcf86cd799439010",
    "checkInTime": "2024-01-15T14:00:00.000Z",
    "assignedRoomNumber": "101",
    "keyIssued": true,
    "welcomePackDelivered": true,
    "status": "completed",
    "updatedAt": "2024-01-15T14:00:00.000Z"
  }
}
```

#### Get Check-in Statistics
```http
GET {{BASE_URL}}/api/v1/checkins/stats
```

**Example Response:**
```json
{
  "success": true,
  "message": "Check-in statistics fetched successfully",
  "data": {
    "totalCheckIns": 150,
    "todayCheckIns": 12,
    "pendingCheckIns": 3,
    "completedCheckIns": 147
  }
}
```

#### Get Active Check-ins
```http
GET {{BASE_URL}}/api/v1/checkins/active
```

#### Delete Check-in
```http
DELETE {{BASE_URL}}/api/v1/checkins/{{CHECKIN_ID}}
```

## Check-out Management API

### Base URL: `/api/v1/checkouts`

The Check-out Management API handles guest check-out processes, final billing, payment processing, and guest feedback collection.

#### Get All Check-outs
```http
GET {{BASE_URL}}/api/v1/checkouts?page=1&limit=10&status=pending&sortBy=expectedCheckOutTime&sortOrder=desc
```

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10, max: 100)
- `query` (string): Search by feedback content
- `sortBy` (string): Sort field (expectedCheckOutTime, checkOutTime, finalBillAmount, createdAt)
- `sortOrder` (string): Sort order (asc, desc)
- `status` (string): Filter by status (pending, completed, cancelled)
- `roomId` (string): Filter by room ID
- `guestId` (string): Filter by guest ID
- `dateFrom` (string): Filter check-outs from date (YYYY-MM-DD)
- `dateTo` (string): Filter check-outs to date (YYYY-MM-DD)

**Example Response:**
```json
{
  "success": true,
  "message": "Check-outs fetched successfully",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439014",
      "checkInId": {
        "_id": "507f1f77bcf86cd799439013",
        "assignedRoomNumber": "101",
        "checkInTime": "2024-01-15T14:00:00.000Z"
      },
      "reservationId": {
        "_id": "507f1f77bcf86cd799439012",
        "guestName": "John Doe",
        "checkInDate": "2024-01-15T00:00:00.000Z",
        "checkOutDate": "2024-01-18T00:00:00.000Z"
      },
      "roomId": {
        "_id": "507f1f77bcf86cd799439011",
        "roomNumber": "101",
        "roomType": "deluxe"
      },
      "guestId": {
        "_id": "507f1f77bcf86cd799439010",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john.doe@example.com"
      },
      "expectedCheckOutTime": "2024-01-18T11:00:00.000Z",
      "checkOutTime": "2024-01-18T10:30:00.000Z",
      "finalBillAmount": 1200,
      "paymentStatus": "paid",
      "feedback": "Excellent service and comfortable stay",
      "rating": 5,
      "status": "completed"
    }
  ]
}
```

#### Get Check-out by ID
```http
GET {{BASE_URL}}/api/v1/checkouts/{{CHECKOUT_ID}}
```

#### Create Check-out
```http
POST {{BASE_URL}}/api/v1/checkouts
Content-Type: application/json

{
  "checkInId": "{{CHECKIN_ID}}",
  "reservationId": "{{RESERVATION_ID}}",
  "roomId": "{{ROOM_ID}}",
  "guestId": "{{USER_ID}}",
  "expectedCheckOutTime": "2024-01-18T11:00:00.000Z",
  "finalBillAmount": 1200,
  "paymentStatus": "pending"
}
```

**Example Response:**
```json
{
  "success": true,
  "message": "Check-out created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439014",
    "checkInId": "507f1f77bcf86cd799439013",
    "reservationId": "507f1f77bcf86cd799439012",
    "roomId": "507f1f77bcf86cd799439011",
    "guestId": "507f1f77bcf86cd799439010",
    "expectedCheckOutTime": "2024-01-18T11:00:00.000Z",
    "finalBillAmount": 1200,
    "paymentStatus": "pending",
    "status": "pending",
    "createdAt": "2024-01-18T08:00:00.000Z"
  }
}
```

#### Update Check-out
```http
PUT {{BASE_URL}}/api/v1/checkouts/{{CHECKOUT_ID}}
Content-Type: application/json

{
  "expectedCheckOutTime": "2024-01-18T12:00:00.000Z",
  "finalBillAmount": 1250,
  "paymentStatus": "paid",
  "feedback": "Great stay, will come back again",
  "rating": 5
}
```

#### Complete Check-out
```http
POST {{BASE_URL}}/api/v1/checkouts/{{CHECKOUT_ID}}/complete
Content-Type: application/json

{
  "checkOutTime": "2024-01-18T10:30:00.000Z",
  "finalBillAmount": 1200,
  "paymentStatus": "paid",
  "feedback": "Excellent service and comfortable stay",
  "rating": 5
}
```

**Example Response:**
```json
{
  "success": true,
  "message": "Check-out completed successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439014",
    "checkInId": {
      "_id": "507f1f77bcf86cd799439013",
      "checkOutTime": "2024-01-18T10:30:00.000Z"
    },
    "expectedCheckOutTime": "2024-01-18T11:00:00.000Z",
    "checkOutTime": "2024-01-18T10:30:00.000Z",
    "finalBillAmount": 1200,
    "paymentStatus": "paid",
    "feedback": "Excellent service and comfortable stay",
    "rating": 5,
    "status": "completed",
    "updatedAt": "2024-01-18T10:30:00.000Z"
  }
}
```

#### Process Late Fee
```http
POST {{BASE_URL}}/api/v1/checkouts/{{CHECKOUT_ID}}/late-fee
Content-Type: application/json

{
  "lateFeeAmount": 50,
  "reason": "Late check-out beyond grace period"
}
```

**Example Response:**
```json
{
  "success": true,
  "message": "Late fee processed successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439014",
    "finalBillAmount": 1250,
    "lateFee": {
      "amount": 50,
      "reason": "Late check-out beyond grace period",
      "appliedAt": "2024-01-18T12:30:00.000Z"
    },
    "updatedAt": "2024-01-18T12:30:00.000Z"
  }
}
```

#### Get Check-out Statistics
```http
GET {{BASE_URL}}/api/v1/checkouts/stats
```

**Example Response:**
```json
{
  "success": true,
  "message": "Check-out statistics fetched successfully",
  "data": {
    "totalCheckOuts": 120,
    "todayCheckOuts": 8,
    "pendingCheckOuts": 5,
    "completedCheckOuts": 115,
    "averageRating": 4.6
  }
}
```

#### Get Pending Check-outs
```http
GET {{BASE_URL}}/api/v1/checkouts/pending
```

**Example Response:**
```json
{
  "success": true,
  "message": "Pending check-outs fetched successfully",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439014",
      "checkInId": {
        "assignedRoomNumber": "101"
      },
      "guestId": {
        "firstName": "John",
        "lastName": "Doe"
      },
      "expectedCheckOutTime": "2024-01-18T11:00:00.000Z",
      "finalBillAmount": 1200,
      "paymentStatus": "pending",
      "status": "pending"
    }
  ]
}
```

#### Delete Check-out
```http
DELETE {{BASE_URL}}/api/v1/checkouts/{{CHECKOUT_ID}}
```

## Service Request Management API

### Base URL: `/api/v1/service-requests`

The Service Request Management API handles guest service requests, staff assignments, request tracking, and completion workflows.

#### Get All Service Requests
```http
GET {{BASE_URL}}/api/v1/service-requests?page=1&limit=10&status=pending&priority=high&serviceType=housekeeping
```

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10, max: 100)
- `query` (string): Search by service type or description
- `sortBy` (string): Sort field (requestedDate, priority, status, createdAt)
- `sortOrder` (string): Sort order (asc, desc)
- `status` (string): Filter by status (pending, in_progress, completed, cancelled)
- `priority` (string): Filter by priority (low, medium, high, urgent)
- `serviceType` (string): Filter by service type (housekeeping, maintenance, room_service, concierge, laundry, spa)
- `guestId` (string): Filter by guest ID
- `roomId` (string): Filter by room ID
- `assignedStaffId` (string): Filter by assigned staff ID
- `dateFrom` (string): Filter requests from date (YYYY-MM-DD)
- `dateTo` (string): Filter requests to date (YYYY-MM-DD)

**Example Response:**
```json
{
  "success": true,
  "message": "Service requests fetched successfully",
  "data": {
    "serviceRequests": [
      {
        "_id": "507f1f77bcf86cd799439015",
        "guestId": {
          "_id": "507f1f77bcf86cd799439010",
          "firstName": "John",
          "lastName": "Doe",
          "email": "john.doe@example.com",
          "phone": "+1234567890"
        },
        "roomId": {
          "_id": "507f1f77bcf86cd799439011",
          "roomNumber": "101",
          "roomType": "deluxe"
        },
        "serviceType": "housekeeping",
        "description": "Extra towels and toiletries needed",
        "priority": "medium",
        "status": "pending",
        "requestedDate": "2024-01-15T10:30:00.000Z",
        "assignedStaffId": null,
        "completedDate": null,
        "cost": 0,
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-15T10:30:00.000Z",
        "age": 2,
        "isOverdue": false,
        "urgencyScore": 5
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 45,
      "itemsPerPage": 10
    }
  }
}
```

#### Search Service Requests
```http
GET {{BASE_URL}}/api/v1/service-requests/search?q=housekeeping&page=1&limit=10
```

**Query Parameters:**
- `q` (string): Search query for service type or description
- `page` (number): Page number for pagination
- `limit` (number): Number of items per page

#### Get Service Request Statistics
```http
GET {{BASE_URL}}/api/v1/service-requests/statistics
```

**Example Response:**
```json
{
  "success": true,
  "message": "Service request statistics fetched successfully",
  "data": {
    "total": 150,
    "completed": 120,
    "overdue": 5,
    "completionRate": 80.0,
    "byStatus": [
      { "_id": "pending", "count": 20 },
      { "_id": "in_progress", "count": 10 },
      { "_id": "completed", "count": 120 }
    ],
    "byPriority": [
      { "_id": "low", "count": 50 },
      { "_id": "medium", "count": 60 },
      { "_id": "high", "count": 30 },
      { "_id": "urgent", "count": 10 }
    ],
    "byServiceType": [
      { "_id": "housekeeping", "count": 80, "avgCompletionTime": 45 },
      { "_id": "maintenance", "count": 40, "avgCompletionTime": 120 },
      { "_id": "room_service", "count": 30, "avgCompletionTime": 30 }
    ]
  }
}
```

#### Get Overdue Service Requests
```http
GET {{BASE_URL}}/api/v1/service-requests/overdue
```

#### Get Service Requests by Guest
```http
GET {{BASE_URL}}/api/v1/service-requests/guest/{{USER_ID}}
```

#### Get Service Requests by Room
```http
GET {{BASE_URL}}/api/v1/service-requests/room/{{ROOM_ID}}
```

#### Get Service Requests by Staff
```http
GET {{BASE_URL}}/api/v1/service-requests/staff/{{STAFF_ID}}
```

#### Get Service Request by ID
```http
GET {{BASE_URL}}/api/v1/service-requests/{{SERVICE_REQUEST_ID}}
```

**Example Response:**
```json
{
  "success": true,
  "message": "Service request fetched successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439015",
    "guestId": {
      "_id": "507f1f77bcf86cd799439010",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "phone": "+1234567890"
    },
    "roomId": {
      "_id": "507f1f77bcf86cd799439011",
      "roomNumber": "101",
      "roomType": "deluxe"
    },
    "serviceType": "housekeeping",
    "description": "Extra towels and toiletries needed",
    "priority": "medium",
    "status": "pending",
    "requestedDate": "2024-01-15T10:30:00.000Z",
    "assignedStaffId": null,
    "completedDate": null,
    "cost": 0,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z",
    "age": 2,
    "isOverdue": false,
    "urgencyScore": 5
  }
}
```

#### Create Service Request
```http
POST {{BASE_URL}}/api/v1/service-requests
Content-Type: application/json

{
  "guestId": "{{USER_ID}}",
  "roomId": "{{ROOM_ID}}",
  "serviceType": "housekeeping",
  "description": "Extra towels and toiletries needed",
  "priority": "medium",
  "requestedDate": "2024-01-15T14:00:00.000Z",
  "specialInstructions": "Please deliver between 2-4 PM"
}
```

**Example Response:**
```json
{
  "success": true,
  "message": "Service request created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439015",
    "guestId": "507f1f77bcf86cd799439010",
    "roomId": "507f1f77bcf86cd799439011",
    "serviceType": "housekeeping",
    "description": "Extra towels and toiletries needed",
    "priority": "medium",
    "status": "pending",
    "requestedDate": "2024-01-15T14:00:00.000Z",
    "assignedStaffId": null,
    "completedDate": null,
    "cost": 0,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

#### Update Service Request
```http
PUT {{BASE_URL}}/api/v1/service-requests/{{SERVICE_REQUEST_ID}}
Content-Type: application/json

{
  "description": "Extra towels, toiletries, and fresh linens needed",
  "priority": "high",
  "requestedDate": "2024-01-15T16:00:00.000Z",
  "specialInstructions": "Please deliver ASAP - VIP guest"
}
```

#### Assign Staff to Service Request
```http
POST {{BASE_URL}}/api/v1/service-requests/{{SERVICE_REQUEST_ID}}/assign
Content-Type: application/json

{
  "assignedStaffId": "507f1f77bcf86cd799439020",
  "assignmentNotes": "Assigned to senior housekeeping staff for VIP guest"
}
```

**Example Response:**
```json
{
  "success": true,
  "message": "Service request assigned successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439015",
    "guestId": {
      "_id": "507f1f77bcf86cd799439010",
      "firstName": "John",
      "lastName": "Doe"
    },
    "roomId": {
      "_id": "507f1f77bcf86cd799439011",
      "roomNumber": "101"
    },
    "assignedStaffId": {
      "_id": "507f1f77bcf86cd799439020",
      "firstName": "Jane",
      "lastName": "Smith",
      "email": "jane.smith@hotel.com"
    },
    "serviceType": "housekeeping",
    "status": "in_progress",
    "priority": "medium"
  }
}
```

#### Update Service Request Status
```http
PATCH {{BASE_URL}}/api/v1/service-requests/{{SERVICE_REQUEST_ID}}/status
Content-Type: application/json

{
  "status": "in_progress",
  "statusNotes": "Staff member has started working on the request"
}
```

#### Complete Service Request
```http
POST {{BASE_URL}}/api/v1/service-requests/{{SERVICE_REQUEST_ID}}/complete
Content-Type: application/json

{
  "actualCost": 25.00,
  "completionNotes": "Service completed successfully. Guest was satisfied.",
  "actualEndTime": "2024-01-15T15:30:00.000Z"
}
```

**Example Response:**
```json
{
  "success": true,
  "message": "Service request completed successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439015",
    "guestId": {
      "_id": "507f1f77bcf86cd799439010",
      "firstName": "John",
      "lastName": "Doe"
    },
    "roomId": {
      "_id": "507f1f77bcf86cd799439011",
      "roomNumber": "101"
    },
    "assignedStaffId": {
      "_id": "507f1f77bcf86cd799439020",
      "firstName": "Jane",
      "lastName": "Smith"
    },
    "serviceType": "housekeeping",
    "status": "completed",
    "priority": "medium",
    "cost": 25.00,
    "completedDate": "2024-01-15T15:30:00.000Z"
  }
}
```

#### Delete Service Request
```http
DELETE {{BASE_URL}}/api/v1/service-requests/{{SERVICE_REQUEST_ID}}
```

**Example Response:**
```json
{
  "success": true,
  "message": "Service request deleted successfully"
}
```

## Billing Management API

### Base URL: `/api/v1/bills`

#### Get All Bills
```http
GET {{BASE_URL}}/api/v1/bills?page=1&limit=10&status=pending
```

#### Create Bill
```http
POST {{BASE_URL}}/api/v1/bills
Content-Type: application/json

{
  "reservationId": "{{RESERVATION_ID}}",
  "guestId": "{{USER_ID}}",
  "roomCharges": 1000,
  "serviceCharges": 150,
  "taxes": 50,
  "totalAmount": 1200,
  "dueDate": "2024-01-20T00:00:00.000Z"
}
```

## Error Handling

All API endpoints follow a consistent error response format:

```json
{
  "success": false,
  "message": "Error description",
  "error": {
    "code": "ERROR_CODE",
    "details": "Detailed error information"
  }
}
```

### Common HTTP Status Codes

- `200 OK`: Request successful
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Access denied
- `404 Not Found`: Resource not found
- `422 Unprocessable Entity`: Validation errors
- `500 Internal Server Error`: Server error

### Validation Error Example

```json
{
  "success": false,
  "message": "Validation failed",
  "error": {
    "code": "VALIDATION_ERROR",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      },
      {
        "field": "phone",
        "message": "Phone number is required"
      }
    ]
  }
}
```

## Collection Import Instructions

1. Open Postman
2. Click "Import" button
3. Select "File" tab
4. Choose the collection JSON files:
   - `user.collection.json`
   - `room.collection.json`
   - `reservation.collection.json`
   - `checkin.collection.json`
   - `checkout.collection.json`
   - `bill.collection.json`
5. Set up environment variables as described in the [Environment Setup](#environment-setup) section
6. Start testing the APIs

## Notes

- All timestamps are in ISO 8601 format (UTC)
- MongoDB ObjectIds are used for all entity references
- Pagination is available for all list endpoints
- Search and filtering options are provided where applicable
- All endpoints support proper error handling and validation
- Rate limiting may apply to prevent abuse

For additional support or questions, please refer to the API source code or contact the development team.
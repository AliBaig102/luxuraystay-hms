# LuxuryStay HMS - Postman API Documentation

This document provides comprehensive documentation for testing the LuxuryStay Hotel Management System APIs using Postman.

## Table of Contents

1. [Setup Instructions](#setup-instructions)
2. [Environment Variables](#environment-variables)
3. [Room Management API](#room-management-api)
4. [Common Response Formats](#common-response-formats)
5. [Error Handling](#error-handling)
6. [Testing Guidelines](#testing-guidelines)

## Setup Instructions

### 1. Import Postman Collections

1. Open Postman
2. Click "Import" button
3. Select the collection files from `backend/postman/` directory:
   - `room.collection.json` - Room Management API endpoints
   - `user.collection.json` - User Management API endpoints (if available)

### 2. Set Up Environment

1. Create a new environment in Postman named "LuxuryStay HMS Development"
2. Add the following variables:

```json
{
  "BASE_URL": "http://localhost:3000",
  "ROOM_ID": "507f1f77bcf86cd799439011",
  "ROOM_NUMBER": "101",
  "AUTH_TOKEN": ""
}
```

### 3. Start the Development Server

Before testing APIs, ensure the backend server is running:

```bash
cd backend
pnpm run dev
```

The server should be accessible at `http://localhost:3000`

## Environment Variables

| Variable | Description | Example Value |
|----------|-------------|---------------|
| `BASE_URL` | Backend server URL | `http://localhost:3000` |
| `ROOM_ID` | Sample MongoDB ObjectId for room | `507f1f77bcf86cd799439011` |
| `ROOM_NUMBER` | Sample room number | `101` |
| `AUTH_TOKEN` | JWT token for authenticated requests | `Bearer eyJhbGciOiJIUzI1NiIs...` |

## Room Management API

### Base URL
```
GET/POST/PUT/PATCH/DELETE {{BASE_URL}}/api/v1/rooms
```

### 1. Get All Rooms

**Endpoint:** `GET /api/v1/rooms`

**Description:** Retrieve all rooms with pagination, search, and filtering options.

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | number | No | 1 | Page number |
| `limit` | number | No | 10 | Items per page (max: 100) |
| `search` | string | No | - | Search in room number or description |
| `sortBy` | string | No | createdAt | Sort field (roomNumber, pricePerNight, floor, capacity, createdAt) |
| `sortOrder` | string | No | desc | Sort order (asc, desc) |
| `roomType` | string | No | - | Filter by room type (standard, deluxe, suite, presidential) |
| `status` | string | No | - | Filter by status (available, occupied, cleaning, maintenance, reserved, out_of_service) |
| `floor` | number | No | - | Filter by floor number |
| `minPrice` | number | No | - | Minimum price filter |
| `maxPrice` | number | No | - | Maximum price filter |
| `isActive` | boolean | No | - | Filter by active status |

**Example Request:**
```
GET {{BASE_URL}}/api/v1/rooms?page=1&limit=10&roomType=deluxe&status=available&minPrice=100&maxPrice=500
```

**Example Response:**
```json
{
  "success": true,
  "message": "Rooms retrieved successfully",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "roomNumber": "101",
      "roomType": "deluxe",
      "floor": 1,
      "capacity": 2,
      "pricePerNight": 200,
      "status": "available",
      "amenities": ["wifi", "tv", "ac", "minibar"],
      "description": "Comfortable deluxe room",
      "images": ["https://example.com/room1.jpg"],
      "isActive": true,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "meta": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 50,
    "itemsPerPage": 10
  }
}
```

### 2. Get Room by ID

**Endpoint:** `GET /api/v1/rooms/:id`

**Description:** Retrieve a specific room by its MongoDB ObjectId.

**Path Parameters:**
- `id` (string, required): MongoDB ObjectId of the room

**Example Request:**
```
GET {{BASE_URL}}/api/v1/rooms/{{ROOM_ID}}
```

**Example Response:**
```json
{
  "success": true,
  "message": "Room retrieved successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "roomNumber": "101",
    "roomType": "standard",
    "floor": 1,
    "capacity": 2,
    "pricePerNight": 150,
    "status": "available",
    "amenities": ["wifi", "tv", "ac"],
    "description": "Comfortable standard room",
    "images": [],
    "isActive": true,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### 3. Get Room by Room Number

**Endpoint:** `GET /api/v1/rooms/number/:roomNumber`

**Description:** Retrieve a specific room by its room number.

**Path Parameters:**
- `roomNumber` (string, required): Room number

**Example Request:**
```
GET {{BASE_URL}}/api/v1/rooms/number/{{ROOM_NUMBER}}
```

### 4. Check Room Availability

**Endpoint:** `GET /api/v1/rooms/availability`

**Description:** Check room availability for specific dates with optional filters.

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `checkInDate` | string | Yes | Check-in date (YYYY-MM-DD format) |
| `checkOutDate` | string | Yes | Check-out date (YYYY-MM-DD format) |
| `roomType` | string | No | Filter by room type |
| `minCapacity` | number | No | Minimum capacity required |
| `maxPrice` | number | No | Maximum price per night |
| `amenities` | array | No | Required amenities |

**Example Request:**
```
GET {{BASE_URL}}/api/v1/rooms/availability?checkInDate=2024-02-01&checkOutDate=2024-02-05&roomType=deluxe&minCapacity=2
```

### 5. Create Room

**Endpoint:** `POST /api/v1/rooms`

**Description:** Create a new room with all required and optional fields.

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "roomNumber": "101",
  "roomType": "standard",
  "floor": 1,
  "capacity": 2,
  "pricePerNight": 150,
  "status": "available",
  "amenities": ["wifi", "tv", "ac", "minibar"],
  "description": "Comfortable standard room with modern amenities",
  "images": ["https://example.com/room1.jpg", "https://example.com/room2.jpg"],
  "isActive": true
}
```

**Required Fields:**
- `roomNumber` (string): Unique room identifier
- `roomType` (enum): standard, deluxe, suite, presidential
- `floor` (number): Floor number (1-100)
- `capacity` (number): Room capacity (1-10)
- `pricePerNight` (number): Price per night (0-10000)

**Optional Fields:**
- `status` (enum): available, occupied, cleaning, maintenance, reserved, out_of_service (default: available)
- `amenities` (array): List of amenities
- `description` (string): Room description (max 500 chars)
- `images` (array): Array of image URLs
- `isActive` (boolean): Active status (default: true)

**Example Response:**
```json
{
  "success": true,
  "message": "Room created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "roomNumber": "101",
    "roomType": "standard",
    "floor": 1,
    "capacity": 2,
    "pricePerNight": 150,
    "status": "available",
    "amenities": ["wifi", "tv", "ac", "minibar"],
    "description": "Comfortable standard room with modern amenities",
    "images": ["https://example.com/room1.jpg", "https://example.com/room2.jpg"],
    "isActive": true,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### 6. Update Room

**Endpoint:** `PUT /api/v1/rooms/:id`

**Description:** Update room details by ID. All fields are optional.

**Path Parameters:**
- `id` (string, required): MongoDB ObjectId of the room

**Request Headers:**
```
Content-Type: application/json
```

**Request Body (all fields optional):**
```json
{
  "roomType": "deluxe",
  "pricePerNight": 200,
  "amenities": ["wifi", "tv", "ac", "minibar", "balcony"],
  "description": "Upgraded deluxe room with balcony view"
}
```

**Example Request:**
```
PUT {{BASE_URL}}/api/v1/rooms/{{ROOM_ID}}
```

### 7. Update Room Status

**Endpoint:** `PATCH /api/v1/rooms/:id/status`

**Description:** Update only the status of a specific room with optional notes.

**Path Parameters:**
- `id` (string, required): MongoDB ObjectId of the room

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "status": "cleaning",
  "notes": "Room needs deep cleaning after checkout"
}
```

**Available Status Values:**
- `available`
- `occupied`
- `cleaning`
- `maintenance`
- `reserved`
- `out_of_service`

**Example Request:**
```
PATCH {{BASE_URL}}/api/v1/rooms/{{ROOM_ID}}/status
```

### 8. Delete Room

**Endpoint:** `DELETE /api/v1/rooms/:id`

**Description:** Soft delete a room by ID (sets isActive to false).

**Path Parameters:**
- `id` (string, required): MongoDB ObjectId of the room

**Example Request:**
```
DELETE {{BASE_URL}}/api/v1/rooms/{{ROOM_ID}}
```

**Example Response:**
```json
{
  "success": true,
  "message": "Room deleted successfully",
  "data": null
}
```

## Common Response Formats

### Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {}, // or [] for arrays
  "meta": {    // Only for paginated responses
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 50,
    "itemsPerPage": 10
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "roomNumber",
      "message": "Room number is required",
      "code": "VALIDATION_ERROR"
    }
  ]
}
```

## Error Handling

### HTTP Status Codes

| Status Code | Description |
|-------------|-------------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid request data |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Resource already exists |
| 422 | Unprocessable Entity - Validation errors |
| 500 | Internal Server Error - Server error |

### Common Error Scenarios

1. **Validation Errors (422)**
   - Missing required fields
   - Invalid data types
   - Value out of range

2. **Not Found Errors (404)**
   - Room ID doesn't exist
   - Invalid MongoDB ObjectId format

3. **Conflict Errors (409)**
   - Duplicate room number
   - Room already in requested status

## Testing Guidelines

### 1. Test Sequence

Recommended testing order:

1. **Create Room** - Test room creation with valid data
2. **Get All Rooms** - Verify the created room appears in the list
3. **Get Room by ID** - Retrieve the specific room
4. **Get Room by Number** - Test room number lookup
5. **Update Room** - Modify room details
6. **Update Room Status** - Change room status
7. **Check Availability** - Test availability checking
8. **Delete Room** - Soft delete the room

### 2. Test Data

**Valid Room Data:**
```json
{
  "roomNumber": "TEST001",
  "roomType": "standard",
  "floor": 1,
  "capacity": 2,
  "pricePerNight": 150,
  "amenities": ["wifi", "tv", "ac"],
  "description": "Test room for API validation"
}
```

**Invalid Room Data (for error testing):**
```json
{
  "roomNumber": "",           // Empty room number
  "roomType": "invalid",      // Invalid room type
  "floor": 0,                 // Floor below minimum
  "capacity": 15,             // Capacity above maximum
  "pricePerNight": -50        // Negative price
}
```

### 3. Automated Testing

The Postman collection includes automated tests that:

- Verify response times (< 2000ms)
- Check response content type
- Validate response structure
- Store room IDs for subsequent requests
- Test error scenarios

### 4. Environment Setup for Different Stages

**Development:**
```json
{
  "BASE_URL": "http://localhost:3000"
}
```

**Staging:**
```json
{
  "BASE_URL": "https://staging-api.luxuraystay.com"
}
```

**Production:**
```json
{
  "BASE_URL": "https://api.luxuraystay.com"
}
```

## Additional Notes

1. **Authentication**: Currently, the Room API endpoints are public. When authentication is implemented, add the `Authorization` header with JWT token.

2. **Rate Limiting**: Be mindful of rate limits when running automated tests.

3. **Data Persistence**: The development database may be reset periodically. Always use test data that can be recreated.

4. **Image URLs**: When testing with image URLs, ensure they are valid and accessible.

5. **Date Formats**: Use ISO 8601 date format (YYYY-MM-DD) for date parameters.

---

# Reservation Management API

The Reservation Management API provides comprehensive functionality for managing hotel reservations, including booking, availability checking, confirmation, cancellation, and status management.

## Base URL
```
{{BASE_URL}}/api/v1/reservations
```

## Environment Variables

Ensure the following environment variables are set in your Postman environment:

| Variable | Description | Example |
|----------|-------------|----------|
| `BASE_URL` | API base URL | `http://localhost:3000` |
| `RESERVATION_ID` | Sample reservation ID for testing | `507f1f77bcf86cd799439011` |
| `GUEST_ID` | Sample guest ID for testing | `507f1f77bcf86cd799439012` |
| `ROOM_ID` | Sample room ID for testing | `507f1f77bcf86cd799439013` |

## Endpoints Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/reservations` | Get all reservations with pagination, search, and filtering |
| GET | `/api/v1/reservations/:id` | Get reservation by ID |
| GET | `/api/v1/reservations/availability` | Check room availability for specific dates |
| POST | `/api/v1/reservations` | Create a new reservation |
| PUT | `/api/v1/reservations/:id` | Update reservation details |
| PATCH | `/api/v1/reservations/:id/confirm` | Confirm a reservation |
| PATCH | `/api/v1/reservations/:id/cancel` | Cancel a reservation |
| DELETE | `/api/v1/reservations/:id` | Delete a reservation |

## Detailed Endpoint Documentation

### 1. Get All Reservations

**Endpoint:** `GET /api/v1/reservations`

**Description:** Retrieve all reservations with support for pagination, search, and filtering.

**Query Parameters:**

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|----------|
| `page` | number | No | Page number (default: 1) | `1` |
| `limit` | number | No | Items per page (default: 10, max: 100) | `20` |
| `search` | string | No | Search in guest name, email, phone | `john` |
| `status` | string | No | Filter by reservation status | `confirmed` |
| `roomType` | string | No | Filter by room type | `deluxe` |
| `checkInDate` | string | No | Filter by check-in date (YYYY-MM-DD) | `2024-01-15` |
| `checkOutDate` | string | No | Filter by check-out date (YYYY-MM-DD) | `2024-01-20` |
| `guestId` | string | No | Filter by guest ID | `507f1f77bcf86cd799439012` |
| `sortBy` | string | No | Sort field | `checkInDate` |
| `sortOrder` | string | No | Sort order (asc/desc) | `desc` |

**Example Request:**
```
GET {{BASE_URL}}/api/v1/reservations?page=1&limit=10&status=confirmed&sortBy=checkInDate&sortOrder=desc
```

**Example Response:**
```json
{
  "success": true,
  "message": "Reservations retrieved successfully",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "guestId": "507f1f77bcf86cd799439012",
      "roomId": "507f1f77bcf86cd799439013",
      "checkInDate": "2024-01-15T00:00:00.000Z",
      "checkOutDate": "2024-01-20T00:00:00.000Z",
      "numberOfGuests": 2,
      "status": "confirmed",
      "totalAmount": 750,
      "depositAmount": 150,
      "specialRequests": "Late check-in",
      "source": "website",
      "createdAt": "2024-01-10T10:30:00.000Z",
      "updatedAt": "2024-01-12T14:20:00.000Z"
    }
  ],
  "meta": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 50,
    "itemsPerPage": 10
  }
}
```

### 2. Get Reservation by ID

**Endpoint:** `GET /api/v1/reservations/:id`

**Description:** Retrieve a specific reservation by its ID.

**Path Parameters:**
- `id` (string, required): MongoDB ObjectId of the reservation

**Example Request:**
```
GET {{BASE_URL}}/api/v1/reservations/{{RESERVATION_ID}}
```

**Example Response:**
```json
{
  "success": true,
  "message": "Reservation retrieved successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "guestId": "507f1f77bcf86cd799439012",
    "roomId": "507f1f77bcf86cd799439013",
    "checkInDate": "2024-01-15T00:00:00.000Z",
    "checkOutDate": "2024-01-20T00:00:00.000Z",
    "numberOfGuests": 2,
    "status": "confirmed",
    "totalAmount": 750,
    "depositAmount": 150,
    "specialRequests": "Late check-in",
    "source": "website",
    "assignedRoomId": "507f1f77bcf86cd799439013",
    "duration": 5,
    "remainingBalance": 600,
    "createdAt": "2024-01-10T10:30:00.000Z",
    "updatedAt": "2024-01-12T14:20:00.000Z"
  }
}
```

### 3. Check Availability

**Endpoint:** `GET /api/v1/reservations/availability`

**Description:** Check room availability for specific dates and criteria.

**Query Parameters:**

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|----------|
| `checkInDate` | string | Yes | Check-in date (YYYY-MM-DD) | `2024-01-15` |
| `checkOutDate` | string | Yes | Check-out date (YYYY-MM-DD) | `2024-01-20` |
| `roomType` | string | No | Specific room type | `deluxe` |
| `numberOfGuests` | number | No | Number of guests | `2` |
| `minPrice` | number | No | Minimum price per night | `100` |
| `maxPrice` | number | No | Maximum price per night | `300` |

**Example Request:**
```
GET {{BASE_URL}}/api/v1/reservations/availability?checkInDate=2024-01-15&checkOutDate=2024-01-20&roomType=deluxe&numberOfGuests=2
```

**Example Response:**
```json
{
  "success": true,
  "message": "Available rooms found",
  "data": {
    "availableRooms": [
      {
        "_id": "507f1f77bcf86cd799439013",
        "roomNumber": "201",
        "roomType": "deluxe",
        "capacity": 2,
        "pricePerNight": 200,
        "amenities": ["wifi", "tv", "ac", "minibar", "balcony"]
      }
    ],
    "totalAvailable": 1,
    "checkInDate": "2024-01-15",
    "checkOutDate": "2024-01-20",
    "nights": 5
  }
}
```

### 4. Create Reservation

**Endpoint:** `POST /api/v1/reservations`

**Description:** Create a new reservation with all required and optional fields.

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "guestId": "507f1f77bcf86cd799439012",
  "roomId": "507f1f77bcf86cd799439013",
  "checkInDate": "2024-01-15",
  "checkOutDate": "2024-01-20",
  "numberOfGuests": 2,
  "totalAmount": 750,
  "depositAmount": 150,
  "specialRequests": "Late check-in requested",
  "source": "website"
}
```

**Required Fields:**
- `guestId` (string): MongoDB ObjectId of the guest
- `roomId` (string): MongoDB ObjectId of the room
- `checkInDate` (string): Check-in date (YYYY-MM-DD)
- `checkOutDate` (string): Check-out date (YYYY-MM-DD)
- `numberOfGuests` (number): Number of guests (1-10)
- `totalAmount` (number): Total reservation amount

**Optional Fields:**
- `depositAmount` (number): Deposit amount (default: 0)
- `specialRequests` (string): Special requests (max 500 chars)
- `source` (enum): website, phone, email, walk_in, agent (default: website)
- `assignedRoomId` (string): Specific room assignment

**Example Response:**
```json
{
  "success": true,
  "message": "Reservation created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "guestId": "507f1f77bcf86cd799439012",
    "roomId": "507f1f77bcf86cd799439013",
    "checkInDate": "2024-01-15T00:00:00.000Z",
    "checkOutDate": "2024-01-20T00:00:00.000Z",
    "numberOfGuests": 2,
    "status": "pending",
    "totalAmount": 750,
    "depositAmount": 150,
    "specialRequests": "Late check-in requested",
    "source": "website",
    "createdAt": "2024-01-10T10:30:00.000Z",
    "updatedAt": "2024-01-10T10:30:00.000Z"
  }
}
```

### 5. Update Reservation

**Endpoint:** `PUT /api/v1/reservations/:id`

**Description:** Update reservation details by ID. All fields are optional.

**Path Parameters:**
- `id` (string, required): MongoDB ObjectId of the reservation

**Request Headers:**
```
Content-Type: application/json
```

**Request Body (all fields optional):**
```json
{
  "checkInDate": "2024-01-16",
  "checkOutDate": "2024-01-21",
  "numberOfGuests": 3,
  "specialRequests": "Updated: Late check-in and extra bed",
  "totalAmount": 850
}
```

**Example Request:**
```
PUT {{BASE_URL}}/api/v1/reservations/{{RESERVATION_ID}}
```

### 6. Confirm Reservation

**Endpoint:** `PATCH /api/v1/reservations/:id/confirm`

**Description:** Confirm a pending reservation and optionally assign a specific room.

**Path Parameters:**
- `id` (string, required): MongoDB ObjectId of the reservation

**Request Headers:**
```
Content-Type: application/json
```

**Request Body (optional):**
```json
{
  "assignedRoomId": "507f1f77bcf86cd799439013",
  "notes": "Confirmed with deposit payment"
}
```

**Example Request:**
```
PATCH {{BASE_URL}}/api/v1/reservations/{{RESERVATION_ID}}/confirm
```

**Example Response:**
```json
{
  "success": true,
  "message": "Reservation confirmed successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "status": "confirmed",
    "assignedRoomId": "507f1f77bcf86cd799439013",
    "updatedAt": "2024-01-12T14:20:00.000Z"
  }
}
```

### 7. Cancel Reservation

**Endpoint:** `PATCH /api/v1/reservations/:id/cancel`

**Description:** Cancel a reservation with optional cancellation reason.

**Path Parameters:**
- `id` (string, required): MongoDB ObjectId of the reservation

**Request Headers:**
```
Content-Type: application/json
```

**Request Body (optional):**
```json
{
  "reason": "Guest requested cancellation",
  "refundAmount": 100
}
```

**Example Request:**
```
PATCH {{BASE_URL}}/api/v1/reservations/{{RESERVATION_ID}}/cancel
```

**Example Response:**
```json
{
  "success": true,
  "message": "Reservation cancelled successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "status": "cancelled",
    "cancellationReason": "Guest requested cancellation",
    "refundAmount": 100,
    "updatedAt": "2024-01-12T16:45:00.000Z"
  }
}
```

### 8. Delete Reservation

**Endpoint:** `DELETE /api/v1/reservations/:id`

**Description:** Permanently delete a reservation by ID.

**Path Parameters:**
- `id` (string, required): MongoDB ObjectId of the reservation

**Example Request:**
```
DELETE {{BASE_URL}}/api/v1/reservations/{{RESERVATION_ID}}
```

**Example Response:**
```json
{
  "success": true,
  "message": "Reservation deleted successfully",
  "data": null
}
```

## Reservation Status Values

| Status | Description |
|--------|-------------|
| `pending` | Reservation created but not confirmed |
| `confirmed` | Reservation confirmed and room assigned |
| `checked_in` | Guest has checked in |
| `checked_out` | Guest has checked out |
| `cancelled` | Reservation cancelled |
| `no_show` | Guest did not show up |

## Reservation Source Values

| Source | Description |
|--------|-------------|
| `website` | Online booking through website |
| `phone` | Booking made via phone call |
| `email` | Booking made via email |
| `walk_in` | Walk-in guest booking |
| `agent` | Booking made through travel agent |

## Validation Rules

### Date Validation
- Check-in date must be today or in the future
- Check-out date must be after check-in date
- Maximum reservation duration: 30 days

### Guest Validation
- Number of guests must be between 1 and room capacity
- Guest ID must exist in the system

### Room Validation
- Room ID must exist and be active
- Room must be available for the requested dates
- Room status must be 'available' for new reservations

### Amount Validation
- Total amount must be positive
- Deposit amount cannot exceed total amount
- Amounts must be in valid currency format

## Error Scenarios

### Common Validation Errors (422)

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "checkInDate",
      "message": "Check-in date must be today or in the future",
      "code": "INVALID_DATE"
    },
    {
      "field": "numberOfGuests",
      "message": "Number of guests exceeds room capacity",
      "code": "CAPACITY_EXCEEDED"
    }
  ]
}
```

### Room Unavailable Error (409)

```json
{
  "success": false,
  "message": "Room is not available for the selected dates",
  "errors": [
    {
      "field": "roomId",
      "message": "Room 201 is already booked from 2024-01-15 to 2024-01-18",
      "code": "ROOM_UNAVAILABLE"
    }
  ]
}
```

## Testing Guidelines

### 1. Test Sequence for Reservations

Recommended testing order:

1. **Check Availability** - Verify room availability for test dates
2. **Create Reservation** - Create a new reservation with valid data
3. **Get All Reservations** - Verify the created reservation appears
4. **Get Reservation by ID** - Retrieve the specific reservation
5. **Update Reservation** - Modify reservation details
6. **Confirm Reservation** - Confirm the reservation
7. **Cancel Reservation** - Test cancellation (create another reservation first)
8. **Delete Reservation** - Permanently delete a test reservation

### 2. Test Data

**Valid Reservation Data:**
```json
{
  "guestId": "{{GUEST_ID}}",
  "roomId": "{{ROOM_ID}}",
  "checkInDate": "2024-02-15",
  "checkOutDate": "2024-02-20",
  "numberOfGuests": 2,
  "totalAmount": 750,
  "depositAmount": 150,
  "specialRequests": "Test reservation for API validation",
  "source": "website"
}
```

**Invalid Reservation Data (for error testing):**
```json
{
  "guestId": "invalid_id",
  "roomId": "invalid_id",
  "checkInDate": "2023-01-01",
  "checkOutDate": "2023-01-01",
  "numberOfGuests": 0,
  "totalAmount": -100
}
```

### 3. Automated Testing

The Postman collection includes automated tests that:

- Verify response times (< 3000ms for complex queries)
- Check response content type and structure
- Validate reservation status transitions
- Test date range validations
- Store reservation IDs for subsequent requests
- Test error scenarios and edge cases

---

# Billing Management API

The Billing Management API provides comprehensive functionality for managing hotel bills, including creation, payment processing, refunds, and financial reporting.

## Base URL
```
{{BASE_URL}}/api/v1/bills
```

## Environment Variables

Ensure the following environment variables are set in your Postman environment:

| Variable | Description | Example |
|----------|-------------|----------|
| `BASE_URL` | API base URL | `http://localhost:3000` |
| `BILL_ID` | Sample bill ID for testing | `507f1f77bcf86cd799439011` |
| `RESERVATION_ID` | Sample reservation ID for testing | `507f1f77bcf86cd799439012` |
| `GUEST_ID` | Sample guest ID for testing | `507f1f77bcf86cd799439013` |
| `ROOM_ID` | Sample room ID for testing | `507f1f77bcf86cd799439014` |
| `CHECKIN_ID` | Sample check-in ID for testing | `507f1f77bcf86cd799439015` |
| `CHECKOUT_ID` | Sample check-out ID for testing | `507f1f77bcf86cd799439016` |

## Endpoints Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/bills` | Get all bills with pagination, search, and filtering |
| GET | `/api/v1/bills/:id` | Get bill by ID |
| GET | `/api/v1/bills/stats` | Get billing statistics and reports |
| POST | `/api/v1/bills` | Create a new bill |
| PUT | `/api/v1/bills/:id` | Update bill details |
| PATCH | `/api/v1/bills/:id/payment` | Process payment for a bill |
| PATCH | `/api/v1/bills/:id/refund` | Process refund for a bill |
| DELETE | `/api/v1/bills/:id` | Delete a bill |

## Detailed Endpoint Documentation

### 1. Get All Bills

**Endpoint:** `GET /api/v1/bills`

**Description:** Retrieve all bills with support for pagination, search, and filtering.

**Query Parameters:**

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|----------|
| `page` | number | No | Page number (default: 1) | `1` |
| `limit` | number | No | Items per page (default: 10, max: 100) | `20` |
| `search` | string | No | Search in bill ID, guest name, room number | `john` |
| `status` | string | No | Filter by bill status | `paid` |
| `paymentMethod` | string | No | Filter by payment method | `credit_card` |
| `startDate` | string | No | Filter bills from date (YYYY-MM-DD) | `2024-01-01` |
| `endDate` | string | No | Filter bills to date (YYYY-MM-DD) | `2024-01-31` |
| `guestId` | string | No | Filter by guest ID | `507f1f77bcf86cd799439013` |
| `roomId` | string | No | Filter by room ID | `507f1f77bcf86cd799439014` |
| `minAmount` | number | No | Filter by minimum total amount | `100` |
| `maxAmount` | number | No | Filter by maximum total amount | `1000` |
| `sortBy` | string | No | Sort field | `createdAt` |
| `sortOrder` | string | No | Sort order (asc/desc) | `desc` |

**Example Request:**
```
GET {{BASE_URL}}/api/v1/bills?page=1&limit=10&status=paid&sortBy=createdAt&sortOrder=desc
```

**Example Response:**
```json
{
  "success": true,
  "message": "Bills retrieved successfully",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "reservationId": "507f1f77bcf86cd799439012",
      "guestId": "507f1f77bcf86cd799439013",
      "roomId": "507f1f77bcf86cd799439014",
      "checkInId": "507f1f77bcf86cd799439015",
      "checkOutId": "507f1f77bcf86cd799439016",
      "baseAmount": 500,
      "taxAmount": 50,
      "serviceCharges": 25,
      "additionalServices": [
        {
          "name": "Room Service",
          "amount": 75,
          "quantity": 1,
          "date": "2024-01-15T18:30:00.000Z"
        }
      ],
      "totalAmount": 650,
      "status": "paid",
      "dueDate": "2024-01-20T00:00:00.000Z",
      "paidDate": "2024-01-18T14:30:00.000Z",
      "paymentMethod": "credit_card",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-18T14:30:00.000Z"
    }
  ],
  "meta": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 50,
    "itemsPerPage": 10
  }
}
```

### 2. Get Bill by ID

**Endpoint:** `GET /api/v1/bills/:id`

**Description:** Retrieve a specific bill by its ID.

**Path Parameters:**
- `id` (string, required): MongoDB ObjectId of the bill

**Example Request:**
```
GET {{BASE_URL}}/api/v1/bills/{{BILL_ID}}
```

**Example Response:**
```json
{
  "success": true,
  "message": "Bill retrieved successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "reservationId": "507f1f77bcf86cd799439012",
    "guestId": "507f1f77bcf86cd799439013",
    "roomId": "507f1f77bcf86cd799439014",
    "checkInId": "507f1f77bcf86cd799439015",
    "checkOutId": "507f1f77bcf86cd799439016",
    "baseAmount": 500,
    "taxAmount": 50,
    "serviceCharges": 25,
    "additionalServices": [
      {
        "name": "Room Service",
        "amount": 75,
        "quantity": 1,
        "date": "2024-01-15T18:30:00.000Z"
      },
      {
        "name": "Laundry Service",
        "amount": 30,
        "quantity": 2,
        "date": "2024-01-16T09:15:00.000Z"
      }
    ],
    "totalAmount": 680,
    "status": "paid",
    "dueDate": "2024-01-20T00:00:00.000Z",
    "paidDate": "2024-01-18T14:30:00.000Z",
    "paymentMethod": "credit_card",
    "additionalServicesTotal": 105,
    "subtotal": 630,
    "grandTotal": 680,
    "isOverdue": false,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-18T14:30:00.000Z"
  }
}
```

### 3. Get Bill Statistics

**Endpoint:** `GET /api/v1/bills/stats`

**Description:** Retrieve billing statistics and financial reports.

**Query Parameters:**

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|----------|
| `startDate` | string | No | Start date for statistics (YYYY-MM-DD) | `2024-01-01` |
| `endDate` | string | No | End date for statistics (YYYY-MM-DD) | `2024-01-31` |
| `groupBy` | string | No | Group statistics by (day/week/month) | `month` |

**Example Request:**
```
GET {{BASE_URL}}/api/v1/bills/stats?startDate=2024-01-01&endDate=2024-01-31&groupBy=month
```

**Example Response:**
```json
{
  "success": true,
  "message": "Bill statistics retrieved successfully",
  "data": {
    "totalRevenue": 15750,
    "totalBills": 25,
    "paidBills": 20,
    "pendingBills": 3,
    "overdueBills": 2,
    "averageBillAmount": 630,
    "totalTaxCollected": 1575,
    "totalServiceCharges": 625,
    "paymentMethodBreakdown": {
      "credit_card": 12,
      "cash": 5,
      "bank_transfer": 3
    },
    "monthlyTrends": [
      {
        "month": "2024-01",
        "revenue": 15750,
        "billCount": 25
      }
    ]
  }
}
```

### 4. Create Bill

**Endpoint:** `POST /api/v1/bills`

**Description:** Create a new bill with all required and optional fields.

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "reservationId": "507f1f77bcf86cd799439012",
  "guestId": "507f1f77bcf86cd799439013",
  "roomId": "507f1f77bcf86cd799439014",
  "checkInId": "507f1f77bcf86cd799439015",
  "checkOutId": "507f1f77bcf86cd799439016",
  "baseAmount": 500,
  "taxAmount": 50,
  "serviceCharges": 25,
  "additionalServices": [
    {
      "name": "Room Service",
      "amount": 75,
      "quantity": 1,
      "date": "2024-01-15T18:30:00.000Z"
    }
  ],
  "totalAmount": 650,
  "dueDate": "2024-01-20T00:00:00.000Z"
}
```

**Required Fields:**
- `reservationId` (string): Associated reservation ID
- `guestId` (string): Guest ID
- `roomId` (string): Room ID
- `baseAmount` (number): Base room charges
- `totalAmount` (number): Total bill amount

**Optional Fields:**
- `checkInId` (string): Check-in record ID
- `checkOutId` (string): Check-out record ID
- `taxAmount` (number): Tax amount (default: 0)
- `serviceCharges` (number): Service charges (default: 0)
- `additionalServices` (array): Additional services with details
- `dueDate` (date): Payment due date
- `status` (enum): pending, paid, partially_paid, overdue, cancelled (default: pending)
- `paymentMethod` (enum): Payment method when paid

**Example Response:**
```json
{
  "success": true,
  "message": "Bill created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "reservationId": "507f1f77bcf86cd799439012",
    "guestId": "507f1f77bcf86cd799439013",
    "roomId": "507f1f77bcf86cd799439014",
    "checkInId": "507f1f77bcf86cd799439015",
    "checkOutId": "507f1f77bcf86cd799439016",
    "baseAmount": 500,
    "taxAmount": 50,
    "serviceCharges": 25,
    "additionalServices": [
      {
        "name": "Room Service",
        "amount": 75,
        "quantity": 1,
        "date": "2024-01-15T18:30:00.000Z"
      }
    ],
    "totalAmount": 650,
    "status": "pending",
    "dueDate": "2024-01-20T00:00:00.000Z",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### 5. Update Bill

**Endpoint:** `PUT /api/v1/bills/:id`

**Description:** Update bill details by ID. All fields are optional.

**Path Parameters:**
- `id` (string, required): MongoDB ObjectId of the bill

**Request Headers:**
```
Content-Type: application/json
```

**Request Body (all fields optional):**
```json
{
  "taxAmount": 60,
  "serviceCharges": 30,
  "additionalServices": [
    {
      "name": "Room Service",
      "amount": 75,
      "quantity": 1,
      "date": "2024-01-15T18:30:00.000Z"
    },
    {
      "name": "Laundry Service",
      "amount": 30,
      "quantity": 2,
      "date": "2024-01-16T09:15:00.000Z"
    }
  ],
  "totalAmount": 695,
  "dueDate": "2024-01-22T00:00:00.000Z"
}
```

**Example Request:**
```
PUT {{BASE_URL}}/api/v1/bills/{{BILL_ID}}
```

### 6. Process Payment

**Endpoint:** `PATCH /api/v1/bills/:id/payment`

**Description:** Process payment for a bill, updating status and payment details.

**Path Parameters:**
- `id` (string, required): MongoDB ObjectId of the bill

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "paymentMethod": "credit_card",
  "amountPaid": 650,
  "transactionId": "TXN123456789",
  "notes": "Payment processed successfully"
}
```

**Required Fields:**
- `paymentMethod` (enum): cash, credit_card, debit_card, bank_transfer, digital_wallet
- `amountPaid` (number): Amount being paid

**Optional Fields:**
- `transactionId` (string): Payment transaction reference
- `notes` (string): Payment notes

**Example Request:**
```
PATCH {{BASE_URL}}/api/v1/bills/{{BILL_ID}}/payment
```

**Example Response:**
```json
{
  "success": true,
  "message": "Payment processed successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "status": "paid",
    "paymentMethod": "credit_card",
    "paidDate": "2024-01-18T14:30:00.000Z",
    "transactionId": "TXN123456789",
    "totalAmount": 650,
    "amountPaid": 650,
    "remainingBalance": 0,
    "updatedAt": "2024-01-18T14:30:00.000Z"
  }
}
```

### 7. Process Refund

**Endpoint:** `PATCH /api/v1/bills/:id/refund`

**Description:** Process refund for a bill, updating status and refund details.

**Path Parameters:**
- `id` (string, required): MongoDB ObjectId of the bill

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "refundAmount": 100,
  "reason": "Guest cancelled early",
  "refundMethod": "credit_card",
  "transactionId": "REF123456789"
}
```

**Required Fields:**
- `refundAmount` (number): Amount to be refunded
- `reason` (string): Reason for refund

**Optional Fields:**
- `refundMethod` (enum): cash, credit_card, debit_card, bank_transfer, digital_wallet
- `transactionId` (string): Refund transaction reference

**Example Request:**
```
PATCH {{BASE_URL}}/api/v1/bills/{{BILL_ID}}/refund
```

**Example Response:**
```json
{
  "success": true,
  "message": "Refund processed successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "status": "partially_paid",
    "refundAmount": 100,
    "refundReason": "Guest cancelled early",
    "refundMethod": "credit_card",
    "refundDate": "2024-01-19T10:15:00.000Z",
    "refundTransactionId": "REF123456789",
    "totalAmount": 650,
    "amountPaid": 650,
    "netAmount": 550,
    "updatedAt": "2024-01-19T10:15:00.000Z"
  }
}
```

### 8. Delete Bill

**Endpoint:** `DELETE /api/v1/bills/:id`

**Description:** Permanently delete a bill by ID.

**Path Parameters:**
- `id` (string, required): MongoDB ObjectId of the bill

**Example Request:**
```
DELETE {{BASE_URL}}/api/v1/bills/{{BILL_ID}}
```

**Example Response:**
```json
{
  "success": true,
  "message": "Bill deleted successfully",
  "data": null
}
```

## Bill Status Values

| Status | Description |
|--------|-------------|
| `pending` | Bill created but payment not received |
| `paid` | Bill fully paid |
| `partially_paid` | Bill partially paid or refunded |
| `overdue` | Bill past due date and unpaid |
| `cancelled` | Bill cancelled |

## Payment Method Values

| Method | Description |
|--------|-------------|
| `cash` | Cash payment |
| `credit_card` | Credit card payment |
| `debit_card` | Debit card payment |
| `bank_transfer` | Bank transfer payment |
| `digital_wallet` | Digital wallet payment |

## Validation Rules

### Amount Validation
- All amounts must be positive numbers
- Total amount must equal base + tax + service charges + additional services
- Refund amount cannot exceed paid amount
- Payment amount must be positive

### Date Validation
- Due date must be in the future when creating bills
- Payment date is automatically set when processing payments
- Refund date is automatically set when processing refunds

### Reference Validation
- Reservation ID, Guest ID, Room ID must exist in the system
- Check-in and Check-out IDs must exist if provided
- Transaction IDs should be unique for tracking

### Additional Services Validation
- Service name is required
- Service amount must be positive
- Service quantity must be positive integer
- Service date must be valid

## Error Scenarios

### Common Validation Errors (422)

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "totalAmount",
      "message": "Total amount must be positive",
      "code": "INVALID_AMOUNT"
    },
    {
      "field": "paymentMethod",
      "message": "Invalid payment method",
      "code": "INVALID_PAYMENT_METHOD"
    }
  ]
}
```

### Payment Processing Errors (400)

```json
{
  "success": false,
  "message": "Payment processing failed",
  "errors": [
    {
      "field": "amountPaid",
      "message": "Payment amount exceeds bill total",
      "code": "PAYMENT_EXCEEDS_TOTAL"
    }
  ]
}
```

### Refund Processing Errors (400)

```json
{
  "success": false,
  "message": "Refund processing failed",
  "errors": [
    {
      "field": "refundAmount",
      "message": "Refund amount exceeds paid amount",
      "code": "REFUND_EXCEEDS_PAID"
    }
  ]
}
```

## Testing Guidelines

### 1. Test Sequence for Bills

Recommended testing order:

1. **Create Bill** - Create a new bill with valid data
2. **Get All Bills** - Verify the created bill appears in the list
3. **Get Bill by ID** - Retrieve the specific bill
4. **Update Bill** - Modify bill details (add additional services)
5. **Process Payment** - Process full or partial payment
6. **Get Bill Statistics** - Verify statistics are updated
7. **Process Refund** - Test refund processing (if applicable)
8. **Delete Bill** - Permanently delete a test bill

### 2. Test Data

**Valid Bill Data:**
```json
{
  "reservationId": "{{RESERVATION_ID}}",
  "guestId": "{{GUEST_ID}}",
  "roomId": "{{ROOM_ID}}",
  "checkInId": "{{CHECKIN_ID}}",
  "checkOutId": "{{CHECKOUT_ID}}",
  "baseAmount": 500,
  "taxAmount": 50,
  "serviceCharges": 25,
  "additionalServices": [
    {
      "name": "Test Service",
      "amount": 75,
      "quantity": 1,
      "date": "2024-01-15T18:30:00.000Z"
    }
  ],
  "totalAmount": 650,
  "dueDate": "2024-02-20T00:00:00.000Z"
}
```

**Valid Payment Data:**
```json
{
  "paymentMethod": "credit_card",
  "amountPaid": 650,
  "transactionId": "TEST_TXN_123",
  "notes": "Test payment for API validation"
}
```

**Valid Refund Data:**
```json
{
  "refundAmount": 100,
  "reason": "Test refund for API validation",
  "refundMethod": "credit_card",
  "transactionId": "TEST_REF_123"
}
```

**Invalid Bill Data (for error testing):**
```json
{
  "reservationId": "invalid_id",
  "guestId": "invalid_id",
  "roomId": "invalid_id",
  "baseAmount": -100,
  "totalAmount": -50,
  "dueDate": "2023-01-01"
}
```

### 3. Automated Testing

The Postman collection includes automated tests that:

- Verify response times (< 2000ms for simple operations, < 5000ms for statistics)
- Check response content type and structure
- Validate bill status transitions
- Test amount calculations and validations
- Store bill IDs for subsequent requests
- Test payment and refund processing
- Verify error scenarios and edge cases
- Test financial calculations and reporting

---

**Last Updated:** January 2024  
**API Version:** v1  
**Postman Collection Version:** 1.0
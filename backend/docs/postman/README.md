# Feedback Management API - Postman Documentation

This directory contains comprehensive Postman documentation for the Feedback Management API of the Luxuray Stay Hotel Management System.

## Files

- `Feedback_Management_API.postman_collection.json` - Complete Postman collection with all API endpoints

## How to Import the Collection

1. Open Postman
2. Click on "Import" button
3. Select "File" tab
4. Choose the `Feedback_Management_API.postman_collection.json` file
5. Click "Import"

## Environment Variables

The collection uses the following environment variable:

- `base_url` - Base URL for the API server (default: `http://localhost:4000`)

To set up the environment:
1. In Postman, click on "Environments" in the left sidebar
2. Click "Create Environment"
3. Name it "Luxuray Stay HMS - Local"
4. Add the variable:
   - Variable: `base_url`
   - Initial Value: `http://localhost:4000`
   - Current Value: `http://localhost:4000`
5. Save the environment
6. Select this environment before running the requests

## API Endpoints Overview

### Health Check
- **GET** `/health` - Check if the API server is running

### Feedback Management

#### Create & Read
- **POST** `/api/v1/feedback` - Create new feedback
- **GET** `/api/v1/feedback` - Get all feedback with pagination and filtering
- **GET** `/api/v1/feedback/:id` - Get specific feedback by ID

#### Update & Delete
- **PUT** `/api/v1/feedback/:id` - Update existing feedback
- **DELETE** `/api/v1/feedback/:id` - Delete feedback (admin only)

#### Search & Filter
- **GET** `/api/v1/feedback/search` - Search feedback by text query
- **GET** `/api/v1/feedback?category=service` - Filter by category
- **GET** `/api/v1/feedback?rating=5` - Filter by rating

#### Statistics & Response
- **GET** `/api/v1/feedback/statistics` - Get feedback statistics
- **POST** `/api/v1/feedback/:id/respond` - Add management response to feedback

## Request Examples

### Create Feedback
```json
{
  "guestId": "507f1f77bcf86cd799439011",
  "reservationId": "507f1f77bcf86cd799439012",
  "roomId": "507f1f77bcf86cd799439013",
  "rating": 5,
  "category": "service",
  "comment": "Excellent service and clean room. Staff was very helpful and friendly.",
  "isAnonymous": false
}
```

### Update Feedback
```json
{
  "rating": 4,
  "comment": "Updated: Very good service and clean room. Staff was helpful.",
  "category": "service"
}
```

### Add Response to Feedback
```json
{
  "feedbackId": "68adfaf5e167ffedfd7309ab",
  "response": "Thank you for your excellent feedback! We are delighted to hear about your positive experience.",
  "responseBy": "507f1f77bcf86cd799439011"
}
```

## Validation Rules

### Feedback Categories
- `room_quality`
- `service`
- `cleanliness`
- `food`
- `staff`
- `facilities`
- `value`
- `overall`

### Rating Scale
- Range: 1-5 (integer)
- 1 = Very Poor
- 2 = Poor
- 3 = Average
- 4 = Good
- 5 = Excellent

### Required Fields for Creation
- `guestId` (string)
- `reservationId` (string)
- `roomId` (string)
- `rating` (1-5)
- `category` (from enum above)

### Optional Fields
- `comment` (max 2000 characters)
- `isAnonymous` (boolean, default: false)

## Query Parameters

### Pagination
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 100)

### Sorting
- `sortBy` - Sort field (`createdAt`, `rating`, `category`)
- `sortOrder` - Sort order (`asc`, `desc`)

### Filtering
- `category` - Filter by feedback category
- `rating` - Filter by rating (1-5)
- `guestId` - Filter by guest ID
- `roomId` - Filter by room ID
- `reservationId` - Filter by reservation ID
- `dateFrom` - Filter from date
- `dateTo` - Filter to date
- `isAnonymous` - Filter by anonymous status
- `hasResponse` - Filter by response status

### Search
- `query` - Search text (required for search endpoint)
- Additional filters can be combined with search

## Response Format

All API responses follow this standard format:

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    // Response data here
  },
  "errors": [],
  "timestamp": "2025-08-26T18:21:25.888Z"
}
```

### Pagination Response
```json
{
  "success": true,
  "message": "Feedback retrieved successfully",
  "data": {
    "feedback": [...],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 50,
      "itemsPerPage": 10,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

## Error Handling

### Common HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `404` - Not Found
- `500` - Internal Server Error

### Error Response Format
```json
{
  "success": false,
  "message": "Validation failed",
  "data": null,
  "errors": [
    {
      "field": "rating",
      "message": "Rating must be between 1 and 5"
    }
  ],
  "timestamp": "2025-08-26T18:21:25.888Z"
}
```

## Testing Workflow

1. **Health Check** - Verify API is running
2. **Create Feedback** - Add sample feedback entries
3. **Get All Feedback** - Verify creation and test pagination
4. **Filter by Category** - Test category filtering
5. **Filter by Rating** - Test rating filtering
6. **Search Feedback** - Test text search functionality
7. **Get Statistics** - View aggregated data
8. **Get by ID** - Test individual feedback retrieval
9. **Update Feedback** - Test modification
10. **Add Response** - Test management response feature
11. **Delete Feedback** - Test deletion (if needed)

## Notes

- Replace `:id` parameters with actual feedback IDs from your database
- Ensure the development server is running before testing
- Use valid MongoDB ObjectIDs for `guestId`, `reservationId`, and `roomId`
- The collection includes sample data that may need to be adjusted for your environment

## Support

For issues or questions regarding the API:
1. Check the server logs for detailed error messages
2. Verify all required fields are provided
3. Ensure data types match the validation schema
4. Confirm the server is running and accessible
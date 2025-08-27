# Report Management API - Postman Documentation

This document provides comprehensive documentation for the Report Management API endpoints in the Luxuray Stay Hotel Management System.

## Table of Contents
- [Getting Started](#getting-started)
- [Environment Setup](#environment-setup)
- [Authentication](#authentication)
- [API Endpoints Overview](#api-endpoints-overview)
- [Report Types and Formats](#report-types-and-formats)
- [Request Examples](#request-examples)
- [Query Parameters](#query-parameters)
- [Response Format](#response-format)
- [Error Handling](#error-handling)
- [Testing Workflow](#testing-workflow)

## Getting Started

### Import the Postman Collection

1. Open Postman
2. Click "Import" in the top left
3. Select "File" tab
4. Choose the `Report_Management_API.postman_collection.json` file
5. Click "Import"

### Environment Setup

Create a new environment in Postman with the following variables:

| Variable | Value | Description |
|----------|-------|-------------|
| `base_url` | `http://localhost:4000` | API base URL |
| `auth_token` | `your_jwt_token_here` | JWT authentication token |

## Authentication

All endpoints (except health check) require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer {{auth_token}}
```

### Getting an Authentication Token

1. Register a new user or use existing credentials
2. Login using the authentication endpoint
3. Copy the returned JWT token
4. Set it as the `auth_token` environment variable

## API Endpoints Overview

### Health Check
- **GET** `/api/v1/reports/health`
- **Description**: Check if the Report API is running
- **Authentication**: Not required

### Report Generation
- **POST** `/api/v1/reports/generate`
- **Description**: Generate a new report with specified parameters
- **Authentication**: Required
- **Body**: JSON with reportType, format, and parameters

### Report Retrieval
- **GET** `/api/v1/reports`
- **Description**: Get all reports with pagination and filtering
- **Authentication**: Required
- **Query Parameters**: page, limit, sortBy, sortOrder, reportType, format

### Report Statistics
- **GET** `/api/v1/reports/statistics`
- **Description**: Get comprehensive report statistics
- **Authentication**: Required
- **Query Parameters**: startDate, endDate (optional)

### Individual Report Operations
- **GET** `/api/v1/reports/:id` - Get specific report
- **GET** `/api/v1/reports/:id/download` - Download report file
- **PUT** `/api/v1/reports/:id` - Update report metadata
- **DELETE** `/api/v1/reports/:id` - Delete report (admin only)

### Bulk Operations
- **POST** `/api/v1/reports/cleanup` - Clean up old reports (admin only)
- **DELETE** `/api/v1/reports/bulk-delete` - Delete multiple reports (admin only)

## Report Types and Formats

### Available Report Types
- `occupancy` - Room occupancy analysis
- `revenue` - Revenue and financial reports
- `guest` - Guest information and analytics
- `maintenance` - Maintenance and facility reports
- `financial` - Financial summaries and analysis

### Available Formats
- `json` - JSON data format
- `pdf` - PDF document
- `excel` - Excel spreadsheet
- `csv` - Comma-separated values

### Report Parameters by Type

#### Occupancy Report Parameters
```json
{
  "startDate": "2025-01-01T00:00:00.000Z",
  "endDate": "2025-01-31T23:59:59.999Z",
  "roomType": "all", // or specific room type
  "includeProjections": true
}
```

#### Revenue Report Parameters
```json
{
  "startDate": "2025-01-01T00:00:00.000Z",
  "endDate": "2025-01-31T23:59:59.999Z",
  "groupBy": "daily", // daily, weekly, monthly
  "includeBreakdown": true,
  "currency": "USD"
}
```

#### Guest Report Parameters
```json
{
  "startDate": "2025-01-01T00:00:00.000Z",
  "endDate": "2025-01-31T23:59:59.999Z",
  "includeContactInfo": true,
  "includePreferences": false,
  "guestType": "all" // all, vip, regular
}
```

## Request Examples

### Generate Occupancy Report
```bash
POST /api/v1/reports/generate
Content-Type: application/json
Authorization: Bearer {{auth_token}}

{
  "reportType": "occupancy",
  "format": "json",
  "parameters": {
    "startDate": "2025-01-01T00:00:00.000Z",
    "endDate": "2025-01-31T23:59:59.999Z",
    "roomType": "all",
    "includeProjections": true
  }
}
```

### Get Reports with Filtering
```bash
GET /api/v1/reports?reportType=revenue&format=pdf&page=1&limit=10&sortBy=generatedDate&sortOrder=desc
Authorization: Bearer {{auth_token}}
```

### Get Report Statistics
```bash
GET /api/v1/reports/statistics?startDate=2025-01-01&endDate=2025-01-31
Authorization: Bearer {{auth_token}}
```

### Update Report Metadata
```bash
PUT /api/v1/reports/68af10f570daf6981da9d00f
Content-Type: application/json
Authorization: Bearer {{auth_token}}

{
  "title": "Updated Monthly Revenue Report",
  "description": "Updated comprehensive revenue analysis for January 2025",
  "tags": ["revenue", "monthly", "2025", "updated"]
}
```

## Query Parameters

### Pagination
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10, max: 100)

### Sorting
- `sortBy` (string): Sort field (generatedDate, reportType, format, title)
- `sortOrder` (string): Sort order (asc, desc)

### Filtering
- `reportType` (string): Filter by report type
- `format` (string): Filter by format
- `generatedBy` (string): Filter by user ID
- `startDate` (string): Filter reports generated after this date
- `endDate` (string): Filter reports generated before this date

### Search
- `search` (string): Search in title and description
- `tags` (string): Filter by tags (comma-separated)

## Response Format

### Success Response
```json
{
  "success": true,
  "message": "Success",
  "data": {
    // Response data
  },
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
```

### Report Object Structure
```json
{
  "_id": "68af10f570daf6981da9d00f",
  "title": "Monthly Occupancy Report",
  "description": "Comprehensive occupancy analysis for January 2025",
  "reportType": "occupancy",
  "format": "json",
  "parameters": {
    "startDate": "2025-01-01T00:00:00.000Z",
    "endDate": "2025-01-31T23:59:59.999Z",
    "roomType": "all",
    "includeProjections": true
  },
  "data": {
    // Report data based on type and format
  },
  "generatedBy": "68af10f570daf6981da9d001",
  "generatedDate": "2025-01-15T10:30:00.000Z",
  "fileSize": 2048,
  "tags": ["occupancy", "monthly", "2025"],
  "status": "completed",
  "downloadCount": 5,
  "lastDownloaded": "2025-01-16T14:20:00.000Z"
}
```

### Statistics Response
```json
{
  "success": true,
  "data": {
    "totalReports": 150,
    "reportsByType": [
      { "_id": "occupancy", "count": 45 },
      { "_id": "revenue", "count": 38 }
    ],
    "reportsByFormat": [
      { "_id": "pdf", "count": 60 },
      { "_id": "json", "count": 45 }
    ],
    "reportsByUser": [
      { "_id": "68af10f570daf6981da9d001", "count": 25 }
    ],
    "recentActivity": [
      {
        "date": "2025-01-15",
        "count": 8
      }
    ],
    "storageUsage": {
      "totalSize": 52428800,
      "avgSize": 349525,
      "maxSize": 2097152
    }
  }
}
```

## Error Handling

### Common Error Codes
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid or missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (report not found)
- `422` - Unprocessable Entity (validation errors)
- `500` - Internal Server Error

### Error Response Format
```json
{
  "success": false,
  "message": "Error description",
  "error": {
    "code": "VALIDATION_ERROR",
    "details": [
      {
        "field": "reportType",
        "message": "Invalid report type"
      }
    ]
  }
}
```

### Validation Rules

#### Report Generation
- `reportType`: Required, must be one of: occupancy, revenue, guest, maintenance, financial
- `format`: Required, must be one of: json, pdf, excel, csv
- `parameters`: Required object with type-specific fields
- `parameters.startDate`: Required ISO 8601 datetime
- `parameters.endDate`: Required ISO 8601 datetime, must be after startDate

#### Report Update
- `title`: Optional string, 1-200 characters
- `description`: Optional string, max 1000 characters
- `tags`: Optional array of strings, max 10 tags

#### Cleanup Operation
- `olderThan`: Required ISO 8601 datetime
- `reportType`: Optional filter
- `format`: Optional filter
- `dryRun`: Optional boolean (default: false)

## Testing Workflow

### 1. Setup Environment
1. Import the Postman collection
2. Set up environment variables
3. Obtain authentication token

### 2. Basic Testing
1. **Health Check**: Verify API is running
2. **Generate Report**: Create a test report
3. **Get All Reports**: Verify
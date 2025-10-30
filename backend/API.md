# MillPoint NC Backend API Documentation

**Version**: 1.0.0  
**Base URL**: `http://localhost:3001`  
**Content-Type**: `application/json`

## Table of Contents

- [Overview](#overview)
- [Response Format](#response-format)
- [Error Handling](#error-handling)
- [Health Check](#health-check)
- [Programs API](#programs-api)
- [Machines API](#machines-api)
- [Setup Sheets API](#setup-sheets-api)

---

## Overview

The MillPoint NC Backend API provides endpoints for managing NC programs, machines, and setup sheets. All endpoints follow RESTful conventions and return JSON responses.

### Authentication

⚠️ **Phase 1**: No authentication required. All endpoints are publicly accessible in development mode.

### Rate Limiting

No rate limiting implemented in Phase 1.

---

## Response Format

All API responses follow a consistent format:

### Success Response

```json
{
  "success": true,
  "data": { /* response data */ },
  "meta": { /* optional pagination metadata */ }
}
```

### Error Response

```json
{
  "success": false,
  "error": "Error message",
  "details": [ /* optional validation details */ ]
}
```

### Pagination Metadata

```json
{
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

---

## Error Handling

### HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 404 | Not Found |
| 500 | Internal Server Error |

### Validation Errors

Validation errors include detailed information:

```json
{
  "success": false,
  "error": "Validation failed",
  "details": [
    {
      "path": "partNumber",
      "message": "Part number is required"
    }
  ]
}
```

---

## Health Check

### GET /health

Check server status and availability.

**Request:**
```http
GET /health HTTP/1.1
```

**Response (200):**
```json
{
  "success": true,
  "message": "MillPoint NC API is running",
  "timestamp": "2025-10-30T12:34:56.789Z",
  "environment": "development"
}
```

---

## Programs API

Manage NC programs, versions, and approvals.

### GET /api/programs

Get list of programs with filtering, search, and pagination.

**Query Parameters:**

| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| `search` | string | Full-text search across name, part number, customer, description | - |
| `status` | string | Filter by status: `Draft`, `In Review`, `Approved`, `Released`, `Obsolete` | - |
| `machineId` | uuid | Filter by machine ID | - |
| `customer` | string | Filter by customer name (partial match) | - |
| `partNumber` | string | Filter by part number (partial match) | - |
| `page` | number | Page number | 1 |
| `limit` | number | Items per page (max 100) | 20 |
| `sortBy` | string | Sort field: `name`, `partNumber`, `lastModified`, `customer` | `lastModified` |
| `sortOrder` | string | Sort order: `asc`, `desc` | `desc` |

**Example Request:**
```http
GET /api/programs?search=flange&status=Released&page=1&limit=10 HTTP/1.1
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Flange_Face_Mill",
      "partNumber": "P-2024-001",
      "revision": "A",
      "machineId": "uuid",
      "operation": "Froning af flange",
      "material": "Aluminium 6061",
      "status": "Released",
      "customer": "Vestas Wind Systems",
      "workOrder": "WO-2024-156",
      "description": "CNC program til froning af vindmølle flange komponent",
      "hasCAD": true,
      "hasDXF": true,
      "hasSetupSheet": true,
      "lastModified": "2025-10-30T12:00:00Z",
      "author": {
        "id": "uuid",
        "name": "Hans Jensen",
        "email": "programmer@millpoint.com"
      },
      "machine": {
        "id": "uuid",
        "name": "DMG Mori DMU 50",
        "type": "Fræsemaskine"
      }
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1
  }
}
```

---

### GET /api/programs/:id

Get a single program with full details including setup sheets and version history.

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | uuid | Program ID |

**Example Request:**
```http
GET /api/programs/123e4567-e89b-12d3-a456-426614174000 HTTP/1.1
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Flange_Face_Mill",
    "partNumber": "P-2024-001",
    /* ... all program fields ... */
    "setupSheets": [
      {
        "id": "uuid",
        "machineType": "Fræsemaskine",
        "tools": [ /* tool list */ ],
        "originOffsets": [ /* offsets */ ],
        "fixtures": [ /* fixtures */ ],
        "media": [ /* images/videos */ ]
      }
    ],
    "versions": [
      {
        "id": "uuid",
        "versionNumber": 1,
        "revision": "A",
        "createdAt": "2025-10-30T12:00:00Z",
        "createdBy": { /* user */ }
      }
    ]
  }
}
```

**Error Response (404):**
```json
{
  "success": false,
  "error": "Program not found"
}
```

---

### POST /api/programs

Create a new program.

**Request Body:**
```json
{
  "name": "New_Program",
  "partNumber": "P-2024-002",
  "revision": "A",
  "machineId": "uuid",
  "operation": "Operation description",
  "material": "Steel 4140",
  "customer": "Customer Name",
  "workOrder": "WO-2024-157",
  "description": "Optional description",
  "status": "Draft"
}
```

**Required Fields:**
- `name`, `partNumber`, `revision`, `machineId`, `operation`, `material`, `customer`

**Response (201):**
```json
{
  "success": true,
  "data": { /* created program */ }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "error": "Validation failed",
  "details": [
    {
      "path": "machineId",
      "message": "Invalid machine ID"
    }
  ]
}
```

---

### PUT /api/programs/:id

Update an existing program.

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | uuid | Program ID |

**Request Body:**

All fields are optional. Only provided fields will be updated.

```json
{
  "name": "Updated_Program_Name",
  "status": "In Review",
  "description": "Updated description"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": { /* updated program */ }
}
```

---

### DELETE /api/programs/:id

Delete a program and all related data (setup sheets, versions).

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | uuid | Program ID |

**Response (200):**
```json
{
  "success": true,
  "message": "Program deleted successfully"
}
```

---

### POST /api/programs/:id/approve

Change program status (approval workflow).

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | uuid | Program ID |

**Request Body:**
```json
{
  "status": "Approved",
  "comments": "Optional approval comments"
}
```

**Valid Status Values:**
- `In Review`
- `Approved`
- `Released`

**Response (200):**
```json
{
  "success": true,
  "data": { /* updated program with approval info */ }
}
```

---

### GET /api/programs/:id/versions

Get version history for a program.

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | uuid | Program ID |

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "versionNumber": 2,
      "revision": "B",
      "filePath": "/storage/versions/v2-program.nc",
      "changeLog": "Updated feed rates",
      "createdAt": "2025-10-30T14:00:00Z",
      "createdBy": {
        "id": "uuid",
        "name": "Hans Jensen",
        "email": "programmer@millpoint.com"
      }
    }
  ]
}
```

---

## Machines API

Manage CNC machines.

### GET /api/machines

Get list of all machines with program counts.

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `type` | string | Filter by machine type |
| `status` | string | Filter by status: `Online`, `Offline`, `Maintenance` |
| `search` | string | Search in name, manufacturer, model |

**Example Request:**
```http
GET /api/machines?status=Online HTTP/1.1
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "DMG Mori DMU 50",
      "type": "Fræsemaskine",
      "manufacturer": "DMG Mori",
      "model": "DMU 50",
      "status": "Online",
      "ipAddress": "192.168.1.101",
      "programCount": 15
    }
  ]
}
```

---

### GET /api/machines/:id

Get a single machine with associated programs.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "DMG Mori DMU 50",
    /* ... machine fields ... */
    "programs": [
      {
        "id": "uuid",
        "name": "Program_Name",
        "partNumber": "P-2024-001",
        "status": "Released"
      }
    ]
  }
}
```

---

### POST /api/machines

Create a new machine.

**Request Body:**
```json
{
  "name": "New Machine",
  "type": "Fræsemaskine",
  "manufacturer": "Haas",
  "model": "VF-3",
  "status": "Offline",
  "ipAddress": "192.168.1.105",
  "serialPort": "COM3",
  "capabilities": {
    "axes": 3,
    "maxRPM": 8000
  }
}
```

**Required Fields:**
- `name`, `type`

**Response (201):**
```json
{
  "success": true,
  "data": { /* created machine */ }
}
```

---

### PUT /api/machines/:id

Update machine details.

**Request Body:** (all fields optional)
```json
{
  "name": "Updated Name",
  "status": "Maintenance"
}
```

---

### DELETE /api/machines/:id

Delete a machine (only if no programs associated).

**Error Response (400):**
```json
{
  "success": false,
  "error": "Cannot delete machine with 15 associated programs"
}
```

---

### PATCH /api/machines/:id/status

Update machine status only.

**Request Body:**
```json
{
  "status": "Online"
}
```

**Valid Status Values:**
- `Online`
- `Offline`
- `Maintenance`

---

## Setup Sheets API

Manage setup sheets with tools, offsets, fixtures, and media.

### GET /api/setup-sheets

Get setup sheets for a program.

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `programId` | uuid | Yes | Program ID |

**Example Request:**
```http
GET /api/setup-sheets?programId=123e4567-e89b-12d3-a456-426614174000 HTTP/1.1
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "programId": "uuid",
      "machineType": "Fræsemaskine",
      "tools": [
        {
          "toolNumber": 1,
          "toolName": "Face Mill Ø100mm",
          "length": 150.5,
          "offsetH": 1,
          "offsetD": 1,
          "comment": "Sandvik Coromant"
        }
      ],
      "originOffsets": [
        {
          "name": "G54",
          "x": 0.0,
          "y": 0.0,
          "z": 50.0,
          "a": 0.0,
          "b": 0.0,
          "c": 0.0
        }
      ],
      "fixtures": [
        {
          "fixtureId": "FIX-001",
          "quantity": 1,
          "setupDescription": "Montér emne i maskinklemme"
        }
      ],
      "media": [
        {
          "type": "image",
          "url": "/media/setup-1.jpg",
          "caption": "Værktøjsopsætning",
          "order": 0
        }
      ],
      "safetyChecklist": [
        "Kontroller sikkerhedsbriller",
        "Verificer spindelhastighed"
      ],
      "createdBy": { /* user */ },
      "approvedBy": { /* user or null */ }
    }
  ]
}
```

---

### GET /api/setup-sheets/:id

Get a single setup sheet with full details.

---

### POST /api/setup-sheets

Create a new setup sheet.

**Request Body:**
```json
{
  "programId": "uuid",
  "machineId": "uuid",
  "machineType": "Fræsemaskine",
  "tools": [
    {
      "toolNumber": 1,
      "toolName": "End Mill Ø10mm",
      "length": 100.0,
      "offsetH": 1,
      "offsetD": 1,
      "comment": "HSS"
    }
  ],
  "originOffsets": [
    {
      "name": "G54",
      "x": 0.0,
      "y": 0.0,
      "z": 50.0
    }
  ],
  "fixtures": [],
  "media": [],
  "safetyChecklist": [
    "Check tools",
    "Verify setup"
  ]
}
```

**Required Fields:**
- `programId`, `machineId`, `machineType`, `tools` (min 1), `originOffsets` (min 1)

**Response (201):**
```json
{
  "success": true,
  "data": { /* created setup sheet */ }
}
```

---

### PUT /api/setup-sheets/:id

Update setup sheet (all fields optional).

---

### DELETE /api/setup-sheets/:id

Delete a setup sheet.

---

### POST /api/setup-sheets/:id/approve

Approve a setup sheet.

**Request Body:**
```json
{
  "approved": true,
  "comments": "Setup verified"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": { /* approved setup sheet */ }
}
```

---

## Data Models

### NCProgram

| Field | Type | Description |
|-------|------|-------------|
| `id` | uuid | Unique identifier |
| `name` | string | Program name |
| `partNumber` | string | Part number |
| `revision` | string | Revision (A, B, C, etc.) |
| `machineId` | uuid | Machine ID |
| `operation` | string | Operation description |
| `material` | string | Material type |
| `status` | enum | Draft \| In Review \| Approved \| Released \| Obsolete |
| `customer` | string | Customer name |
| `workOrder` | string? | Work order number |
| `description` | string? | Optional description |
| `hasCAD` | boolean | Has CAD file |
| `hasDXF` | boolean | Has DXF file |
| `hasSetupSheet` | boolean | Has setup sheet |
| `authorId` | uuid | Author user ID |
| `approverId` | uuid? | Approver user ID |
| `approvedAt` | datetime? | Approval timestamp |
| `lastModified` | datetime | Last modification time |

### Machine

| Field | Type | Description |
|-------|------|-------------|
| `id` | uuid | Unique identifier |
| `name` | string | Machine name |
| `type` | string | Machine type |
| `manufacturer` | string? | Manufacturer |
| `model` | string? | Model |
| `status` | enum | Online \| Offline \| Maintenance |
| `ipAddress` | string? | IP address |
| `serialPort` | string? | Serial port |
| `capabilities` | json? | Machine capabilities |

### SetupSheet

| Field | Type | Description |
|-------|------|-------------|
| `id` | uuid | Unique identifier |
| `programId` | uuid | Program ID |
| `machineId` | uuid | Machine ID |
| `machineType` | string | Machine type |
| `tools` | Tool[] | Tool list |
| `originOffsets` | OriginOffset[] | Work offsets |
| `fixtures` | Fixture[] | Fixture list |
| `media` | Media[] | Images/videos |
| `safetyChecklist` | string[] | Safety items |
| `createdById` | uuid | Creator user ID |
| `approvedById` | uuid? | Approver user ID |
| `approvedAt` | datetime? | Approval timestamp |

---

## Examples

### Search for programs

```bash
curl "http://localhost:3001/api/programs?search=flange&limit=5"
```

### Get machine details

```bash
curl http://localhost:3001/api/machines/123e4567-e89b-12d3-a456-426614174000
```

### Create a program

```bash
curl -X POST http://localhost:3001/api/programs \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New_Program",
    "partNumber": "P-2024-002",
    "revision": "A",
    "machineId": "123e4567-e89b-12d3-a456-426614174000",
    "operation": "Milling",
    "material": "Steel",
    "customer": "Test Customer"
  }'
```

### Update program status

```bash
curl -X POST http://localhost:3001/api/programs/123e4567-e89b-12d3-a456-426614174000/approve \
  -H "Content-Type: application/json" \
  -d '{"status": "Approved"}'
```

---

## Notes

- All timestamps are in ISO 8601 format (UTC)
- UUIDs are in standard format: `123e4567-e89b-12d3-a456-426614174000`
- File paths are relative to storage directory
- Meilisearch provides fast full-text search
- Database transactions ensure data consistency

---

**Last Updated**: October 30, 2025  
**Version**: Phase 1 - Core Repository



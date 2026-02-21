# Table & QR Management API Documentation

## 1. API Summary

| Method     | Endpoint                               | Description                                 | Access |
| :--------- | :------------------------------------- | :------------------------------------------ | :----- |
| **POST**   | `/api/admin/tables`                    | Create a new table                          | ADMIN  |
| **GET**    | `/api/admin/tables`                    | Get all tables (with filtering)             | ADMIN  |
| **GET**    | `/api/admin/tables/{id}`               | Get table details by ID                     | ADMIN  |
| **PUT**    | `/api/admin/tables/{id}`               | Update table details                        | ADMIN  |
| **PATCH**  | `/api/admin/tables/{id}/status`        | Update table status only                    | ADMIN  |
| **DELETE** | `/api/admin/tables/{id}`               | Delete a table                              | ADMIN  |
| **POST**   | `/api/admin/tables/{id}/qr/generate`   | Generate a unique QR token for a table      | ADMIN  |
| **POST**   | `/api/admin/tables/{id}/qr/regenerate` | Invalidate old token and generate a new one | ADMIN  |
| **GET**    | `/api/admin/tables/{id}/qr/download`   | Download QR code as PNG or PDF              | ADMIN  |
| **GET**    | `/api/admin/tables/qr/download-all`    | Download all table QR codes as a single PDF | ADMIN  |
| **GET**    | `/api/menu`                            | Verify QR token and access table session    | Public |
| **GET**    | `/api/menu/items`                      | Guest menu browsing (Search, Filter, Sort)  | Public |

---

## 2. Table Management (Admin)

### 2.1 Create Table

**POST** `/api/admin/tables`

Creates a new physical table in the system.

**Request Headers:**

```
Authorization: Bearer {jwt-token}
Content-Type: application/json
```

**Request Body:**

```json
{
    "tableNumber": "T-5",
    "capacity": 4,
    "location": "Indoor",
    "description": "Window seat table with city view"
}
```

**Field Validations:**

- `tableNumber` (required): String, not blank
- `capacity` (required): Integer, min: 1, max: 20
- `location` (optional): String (e.g., "Indoor", "Outdoor", "Patio", "VIP Room")
- `description` (optional): String

**Response (201 Created):**

```json
{
    "success": true,
    "message": "Table created successfully"
}
```

**Response (400 Bad Request):**

```json
{
    "success": false,
    "message": "Table number already exists"
}
```

---

### 2.2 Get All Tables

**GET** `/api/admin/tables`

Retrieves a list of tables with optional filtering and sorting.

**Request Headers:**

```
Authorization: Bearer {jwt-token}
```

**Query Parameters:**

- `status` (optional): Filter by status - `ACTIVE` or `INACTIVE`
- `location` (optional): Filter by location string
- `sortBy` (optional): Sort field name (e.g., "tableNumber", "capacity", "location")

**Response (200 OK):**

```json
{
    "message": "Success",
    "success": true,
    "tables": [
        {
            "id": "a3f12b5c-8d4e-4a1b-9c2d-1e3f4a5b6c7d",
            "tableNumber": "T-1",
            "capacity": 4,
            "location": "Indoor",
            "description": "Near entrance",
            "status": "ACTIVE",
            "hasQrCode": true,
            "qrTokenCreatedAt": "2026-02-20T10:30:00",
            "createdAt": "2026-02-15T08:00:00",
            "updatedAt": "2026-02-20T10:30:00"
        }
    ],
    "totalCount": 1
}
```

---

### 2.3 Get Table by ID

**GET** `/api/admin/tables/{id}`

Retrieves detailed information about a specific table.

**Request Headers:**

```
Authorization: Bearer {jwt-token}
```

**Path Parameters:**

- `id` (required): UUID of the table

**Response (200 OK):**

```json
{
    "id": "a3f12b5c-8d4e-4a1b-9c2d-1e3f4a5b6c7d",
    "tableNumber": "T-1",
    "capacity": 4,
    "location": "Indoor",
    "description": "Near entrance",
    "status": "ACTIVE",
    "hasQrCode": true,
    "qrTokenCreatedAt": "2026-02-20T10:30:00",
    "createdAt": "2026-02-15T08:00:00",
    "updatedAt": "2026-02-20T10:30:00"
}
```

**Response (404 Not Found):**

```json
{
    "success": false,
    "message": "Table not found"
}
```

---

### 2.4 Update Table

**PUT** `/api/admin/tables/{id}`

Updates table information. All fields are optional.

**Request Headers:**

```
Authorization: Bearer {jwt-token}
Content-Type: application/json
```

**Path Parameters:**

- `id` (required): UUID of the table

**Request Body:**

```json
{
    "tableNumber": "T-10",
    "capacity": 6,
    "location": "Outdoor",
    "description": "Updated description"
}
```

**Field Validations:**

- `tableNumber` (optional): String
- `capacity` (optional): Integer, min: 1, max: 20
- `location` (optional): String
- `description` (optional): String

**Response (200 OK):**

```json
{
    "success": true,
    "message": "Table updated successfully"
}
```

**Response (400 Bad Request):**

```json
{
    "success": false,
    "message": "Table number already exists"
}
```

---

### 2.5 Update Table Status

**PATCH** `/api/admin/tables/{id}/status`

Updates only the status of a table (ACTIVE/INACTIVE).

**Request Headers:**

```
Authorization: Bearer {jwt-token}
Content-Type: application/json
```

**Path Parameters:**

- `id` (required): UUID of the table

**Request Body:**

```json
{
    "status": "INACTIVE"
}
```

**Field Validations:**

- `status` (required): Enum - `ACTIVE` or `INACTIVE`

**Response (200 OK):**

```json
{
    "success": true,
    "message": "Table status updated successfully"
}
```

---

### 2.6 Delete Table

**DELETE** `/api/admin/tables/{id}`

Soft-deletes a table from the system.

**Request Headers:**

```
Authorization: Bearer {jwt-token}
```

**Path Parameters:**

- `id` (required): UUID of the table

**Response (204 No Content):**
Empty body (successful deletion).

**Response (400 Bad Request):**

```json
{
    "success": false,
    "message": "Cannot delete table with active orders"
}
```

---

## 3. QR Code Management (Admin)

### 3.1 Generate QR Code

**POST** `/api/admin/tables/{id}/qr/generate`

Generates a unique JWT-based QR token for a table. Fails if a QR code already exists (use regenerate instead).

**Request Headers:**

```
Authorization: Bearer {jwt-token}
```

**Path Parameters:**

- `id` (required): UUID of the table

**Response (200 OK):**

```json
{
    "success": true,
    "message": "QR code generated successfully",
    "tableId": "a3f12b5c-8d4e-4a1b-9c2d-1e3f4a5b6c7d",
    "tableNumber": "T-5",
    "qrUrl": "http://localhost:5173/menu?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "generatedAt": "2026-02-20T14:30:00"
}
```

**Response (400 Bad Request):**

```json
{
    "success": false,
    "message": "QR code already exists for this table"
}
```

---

### 3.2 Regenerate QR Code

**POST** `/api/admin/tables/{id}/qr/regenerate`

Invalidates the existing QR token and generates a new one. Useful for security purposes or if a QR code is compromised.

**Request Headers:**

```
Authorization: Bearer {jwt-token}
```

**Path Parameters:**

- `id` (required): UUID of the table

**Response (200 OK):**

```json
{
    "success": true,
    "message": "QR code generated successfully",
    "tableId": "a3f12b5c-8d4e-4a1b-9c2d-1e3f4a5b6c7d",
    "tableNumber": "T-5",
    "qrUrl": "http://localhost:5173/menu?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "generatedAt": "2026-02-20T15:45:00"
}
```

---

### 3.3 Download Single QR Code

**GET** `/api/admin/tables/{id}/qr/download`

Downloads the QR code as a PNG image or PDF document for printing.

**Request Headers:**

```
Authorization: Bearer {jwt-token}
```

**Path Parameters:**

- `id` (required): UUID of the table

**Query Parameters:**

- `format` (optional, default="png"): File format - `png` or `pdf`

**Response (PNG format):**

- **Status**: 200 OK
- **Content-Type**: `image/png`
- **Content-Disposition**: `attachment; filename="table-qr-{id}.png"`
- **Body**: Binary image data

**Response (PDF format):**

- **Status**: 200 OK
- **Content-Type**: `application/pdf`
- **Content-Disposition**: `attachment; filename="table-qr-{id}.pdf"`
- **Body**: Binary PDF data

**Response (404 Not Found):**

```json
{
    "success": false,
    "message": "QR code not found. Please generate one first."
}
```

---

### 3.4 Download All QR Codes

**GET** `/api/admin/tables/qr/download-all`

Generates a multi-page PDF containing QR codes for all tables. Formatted for easy printing (e.g., table tent cards or stickers).

**Request Headers:**

```
Authorization: Bearer {jwt-token}
```

**Response (200 OK):**

- **Status**: 200 OK
- **Content-Type**: `application/pdf`
- **Content-Disposition**: `attachment; filename="all-tables-qr.pdf"`
- **Body**: Binary PDF data with all table QR codes

**Response (404 Not Found):**

```json
{
    "success": false,
    "message": "No QR codes found. Please generate QR codes for table first"
}
```

---

## 4. Guest Menu Access (Public)

### 4.1 Verify QR & Access Menu

**GET** `/api/menu`

Public endpoint that validates a QR token and returns table session information. This is the entry point for customers scanning a table's QR code.

**Query Parameters:**

- `token` (required): The JWT token from the QR code URL

**Response (200 OK):**

```json
{
    "valid": true,
    "message": "Valid QR Code",
    "tableId": "a3f12b5c-8d4e-4a1b-9c2d-1e3f4a5b6c7d",
    "tableNumber": "T-5",
    "capacity": 4,
    "location": "Indoor"
}
```

**Response (401 Unauthorized):**

```json
{
    "valid": false,
    "message": "Invalid or expired QR token"
}
```

---

### 4.2 Guest Menu Items (Search & Filter)

**GET** `/api/menu/items`

Public endpoint for browsing menu items with search, filtering, sorting, and pagination. Requires a valid QR token.

**Query Parameters:**

- `token` (required): Valid QR token from `/api/menu`
- `query` (optional): Search term for filtering items by name (case-insensitive, partial match)
- `categoryId` (optional): UUID - Filter items by category
- `sort` (optional): Sort order
    - `name_asc` (default): Alphabetical A-Z
    - `popularity`: By popularity score (highest first)
    - `price_asc`: Price low to high
    - `price_desc`: Price high to low
    - `newest`: Most recently added
- `chefRecommended` (optional): Boolean - `true` to show only chef's recommendations
- `page` (optional, default=1): Page number (1-indexed)
- `limit` (optional, default=10, max=50): Items per page

**Response (200 OK):**

```json
{
    "success": true,
    "message": "Menu loaded successfully",
    "tableId": "a3f12b5c-8d4e-4a1b-9c2d-1e3f4a5b6c7d",
    "tableNumber": "T-5",
    "categories": [
        {
            "id": "b4e23c6d-9e5f-5b2c-ad3e-2f4g5b6c7d8e",
            "name": "Appetizers",
            "description": "Start your meal right",
            "displayOrder": 1
        },
        {
            "id": "c5f34d7e-af6g-6c3d-be4f-3g5h6c7d8e9f",
            "name": "Main Course",
            "description": "Our signature dishes",
            "displayOrder": 2
        }
    ],
    "items": [
        {
            "id": "d6g45e8f-bg7h-7d4e-cf5g-4h6i7d8e9f0g",
            "name": "Classic Cheeseburger",
            "description": "Juicy beef patty with cheddar, lettuce, tomato, and special sauce",
            "price": 12.99,
            "status": "AVAILABLE",
            "isChefRecommended": true,
            "popularityScore": 87,
            "prepTimeMinutes": 15,
            "primaryPhotoUrl": "https://res.cloudinary.com/.../burger.jpg",
            "categoryId": "c5f34d7e-af6g-6c3d-be4f-3g5h6c7d8e9f",
            "categoryName": "Main Course",
            "modifierGroups": [
                {
                    "id": "e7h56f9g-ch8i-8e5f-dg6h-5i7j8e9f0g1h",
                    "name": "Select Size",
                    "selectionType": "SINGLE",
                    "isRequired": true,
                    "minSelection": 1,
                    "maxSelection": 1,
                    "displayOrder": 1,
                    "options": [
                        {
                            "id": "f8i67g0h-di9j-9f6g-eh7i-6j8k9f0g1h2i",
                            "name": "Regular",
                            "priceAdjustment": 0.0
                        },
                        {
                            "id": "g9j78h1i-ej0k-0g7h-fi8j-7k9l0g1h2i3j",
                            "name": "Large",
                            "priceAdjustment": 3.5
                        }
                    ]
                },
                {
                    "id": "h0k89i2j-fk1l-1h8i-gj9k-8l0m1h2i3j4k",
                    "name": "Add Extras",
                    "selectionType": "MULTIPLE",
                    "isRequired": false,
                    "minSelection": 0,
                    "maxSelection": 5,
                    "displayOrder": 2,
                    "options": [
                        {
                            "id": "i1l90j3k-gl2m-2i9j-hk0l-9m1n2i3j4k5l",
                            "name": "Extra Cheese",
                            "priceAdjustment": 1.5
                        },
                        {
                            "id": "j2m01k4l-hm3n-3j0k-il1m-0n2o3j4k5l6m",
                            "name": "Bacon",
                            "priceAdjustment": 2.0
                        }
                    ]
                }
            ]
        }
    ],
    "page": 1,
    "limit": 10,
    "totalItems": 45,
    "totalPages": 5,
    "hasNext": true,
    "hasPrevious": false,
    "query": "burger",
    "categoryId": null,
    "sort": "popularity",
    "chefRecommended": null
}
```

**Response (401 Unauthorized):**

```json
{
    "success": false,
    "message": "Invalid or expired QR token"
}
```

---

## 5. Data Models

### Table Status Enum

- `ACTIVE`: Table is operational and available for use
- `INACTIVE`: Table is temporarily unavailable

### Menu Item Status Enum

- `AVAILABLE`: Item is available for ordering
- `UNAVAILABLE`: Item is temporarily unavailable
- `SOLD_OUT`: Item is sold out for the day

### Selection Type Enum

- `SINGLE`: Customer can select only one option
- `MULTIPLE`: Customer can select multiple options (up to maxSelection)

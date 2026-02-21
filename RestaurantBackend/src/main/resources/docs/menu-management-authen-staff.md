# API Contract

## Summary

| Domain | Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Auth** | POST | `/api/auth/register` | Public | Register a new user |
| | POST | `/api/auth/login` | Public | Authenticate user and get token |
| | POST | `/api/auth/verify-email` | Public | Verify email with token |
| | GET | `/api/auth/check-email` | Public | Check if email is available |
| | POST | `/api/auth/forgot-password` | Public | Request password reset token |
| | POST | `/api/auth/reset-password` | Public | Reset password using token |
| | PUT | `/api/auth/update-password` | Authenticated | Update current user's password |
| **Categories** | GET | `/api/admin/categories` | Authenticated | Get all categories |
| | GET | `/api/admin/categories/{id}` | Authenticated | Get category by ID |
| | POST | `/api/admin/categories` | Authenticated | Create a new category |
| | PATCH | `/api/admin/categories/{id}` | Authenticated | Update a category |
| | PATCH | `/api/admin/categories/{id}/status` | Authenticated | Update category status |
| **Menu Items** | GET | `/api/admin/menu/items` | Authenticated | Get all menu items |
| | GET | `/api/admin/menu/items/{id}` | Authenticated | Get menu item by ID |
| | POST | `/api/admin/menu/items` | Authenticated | Create a new menu item |
| | PATCH | `/api/admin/menu/items/{id}` | Authenticated | Update a menu item |
| | DELETE | `/api/admin/menu/items/{id}` | Authenticated | Delete a menu item |
| | POST | `/api/admin/menu/items/{id}/photo` | Authenticated | Upload photo for menu item |
| | PATCH | `/api/admin/menu/items/{menuItemId}/photo/{photoId}/primary` | Authenticated | Set primary photo |
| | DELETE | `/api/admin/menu/items/{menuItemId}/photo/{photoId}` | Authenticated | Delete a photo |
| | POST | `/api/admin/menu/items/{id}/modifier-groups` | Authenticated | Link modifier groups to item |
| **Modifier Groups** | GET | `/api/admin/menu/modifier-groups` | Authenticated | Get all modifier groups |
| | GET | `/api/admin/menu/modifier-groups/{id}` | Authenticated | Get modifier group by ID |
| | POST | `/api/admin/menu/modifier-groups` | Authenticated | Create a new modifier group |
| | PUT | `/api/admin/menu/modifier-groups/{id}` | Authenticated | Update a modifier group |
| | POST | `/api/admin/menu/modifier-groups/{groupId}/options` | Authenticated | Add option to modifier group |
| **Modifier Options** | PUT | `/api/admin/menu/modifier-options/{id}` | Authenticated | Update a modifier option |
| **Users** | GET | `/api/users/profile` | Authenticated | Get current user profile |
| | PUT | `/api/users/profile` | Authenticated | Update current user profile |
| | POST | `/api/users/avatar` | Authenticated | Upload user avatar |
| | POST | `/api/users/staff` | Admin | Create a staff member |
| | GET | `/api/users/staff` | Admin | Get all staff members |
| | GET | `/api/users/staff/{id}` | Admin | Get staff member by ID |
| | PUT | `/api/users/staff/{id}` | Admin | Update staff member |
| | PUT | `/api/users/staff/{id}/status` | Admin | Update staff status |

---

## Details

### Authentication

#### Register
- **Endpoint**: `POST /api/auth/register`
- **Auth**: Public
- **Request Body**: `RegisterRequest`
  ```json
  {
    "email": "string (email, max 100)",
    "password": "string (min 8, 1 upper, 1 lower, 1 number)",
    "confirmPassword": "string",
    "firstName": "string",
    "lastName": "string",
    "role": "string (optional)"
  }
  ```
- **Response**: `MessageResponse`
  ```json
  {
    "success": boolean,
    "message": "string"
  }
  ```

#### Login
- **Endpoint**: `POST /api/auth/login`
- **Auth**: Public
- **Request Body**: `LoginRequest`
  ```json
  {
    "email": "string (email)",
    "password": "string (min 8)"
  }
  ```
- **Response**: `AuthResponse`
  ```json
  {
    "success": boolean,
    "message": "string",
    "token": "string (JWT)",
    "tokenType": "string",
    "userId": "UUID",
    "email": "string",
    "firstName": "string",
    "lastName": "string",
    "role": "string (CUSTOMER, ADMIN, etc.)",
    "emailVerified": boolean
  }
  ```

#### Verify Email
- **Endpoint**: `POST /api/auth/verify-email`
- **Auth**: Public
- **Request Body**: `VerifyEmailRequest`
  ```json
  {
    "token": "string"
  }
  ```
- **Response**: `MessageResponse`
- **Frontend Handling**:
  - The user will receive an email with a link format: `{{frontendUrl}}/verify-email?token={token}`
  - Frontend must have a route `/verify-email`.
  - On load, extract `token` from URL query parameters.
  - Call `POST /api/auth/verify-email` with the token.
  - Display success or error message based on API response.

#### Check Email
- **Endpoint**: `GET /api/auth/check-email`
- **Auth**: Public
- **Query Params**: `email=string`
- **Response**: `CheckEmailResponse`
  ```json
  {
    "success": boolean,
    "message": "string"
  }
  ```

#### Forgot Password
- **Endpoint**: `POST /api/auth/forgot-password`
- **Auth**: Public
- **Request Body**: `ForgotPasswordRequest`
  ```json
  {
    "email": "string"
  }
  ```
- **Response**: `MessageResponse`
- **Frontend Handling**:
  - Call this endpoint with the user's email.
  - On success, display a message that a reset link has been sent.
  - The user will receive an email with a link format: `{{frontendUrl}}/reset-password?token={token}`.

#### Reset Password
- **Endpoint**: `POST /api/auth/reset-password`
- **Auth**: Public
- **Request Body**: `ResetPasswordRequest`
  ```json
  {
    "token": "string",
    "newPassword": "string (min 8, complex)"
  }
  ```
- **Response**: `MessageResponse`
- **Frontend Handling**:
    - This page is accessed via the link sent in the email.
    - Frontend must have a route `/reset-password`.
    - On load, extract `token` from URL query parameters.
    - Display a form to enter a `newPassword`.
    - On submit, call `POST /api/auth/reset-password` with the `token` and `newPassword`.
    - Redirect to login on success.

#### Update Password
- **Endpoint**: `PUT /api/auth/update-password`
- **Auth**: Authenticated
- **Request Body**: `UpdatePasswordRequest`
  ```json
  {
    "currentPassword": "string",
    "newPassword": "string (min 8, complex)",
    "confirmPassword": "string"
  }
  ```
- **Response**: `MessageResponse`

---

### Categories

#### Get All Categories
- **Endpoint**: `GET /api/admin/categories`
- **Response**: List of `Category`
  ```json
  [
    {
      "id": "UUID",
      "name": "string",
      "description": "string",
      "displayOrder": integer,
      "status": "string (ACTIVE, etc.)",
      "menuItems": [] // List of MenuItem objects
    }
  ]
  ```

#### Get Category by ID
- **Endpoint**: `GET /api/admin/categories/{id}`
- **Auth**: Authenticated
- **Response**: `Category`

#### Create Category
- **Endpoint**: `POST /api/admin/categories`
- **Request Body**: `CategoryRequest`
  ```json
  {
    "name": "string (min 2, max 50)",
    "description": "string (optional)",
    "displayOrder": integer,
    "status": "string (optional)"
  }
  ```
- **Response**: `Category` (Created object)

#### Update Category
- **Endpoint**: `PATCH /api/admin/categories/{id}`
- **Request Body**: `CategoryUpdateRequest`
  ```json
  {
    "name": "string (min 2, max 50)",
    "description": "string",
    "displayOrder": integer,
    "status": "string"
  }
  ```
- **Response**: `Category`

#### Update Category Status
- **Endpoint**: `PATCH /api/admin/categories/{id}/status`
- **Request Body**: `CategoryStatusRequest`
  ```json
  {
    "status": "string"
  }
  ```
- **Response**: `Category`

---

### Menu Items

#### Get All Menu Items
- **Endpoint**: `GET /api/admin/menu/items`
- **Response**: List of `MenuItem`
  ```json
  [
    {
      "id": "UUID",
      "name": "string",
      "description": "string",
      "price": number,
      "prepTimeMinutes": integer,
      "status": "string",
      "isChefRecommended": boolean,
      "categoryId": "UUID",
      "photos": [],
      "modifierGroups": []
    }
  ]
  ```

#### Get Menu Item by ID
- **Endpoint**: `GET /api/admin/menu/items/{id}`
- **Auth**: Authenticated
- **Response**: `MenuItem`

#### Create Menu Item
- **Endpoint**: `POST /api/admin/menu/items`
- **Request Body**: `MenuItemRequest`
  ```json
  {
    "name": "string (required)",
    "description": "string",
    "price": number (min 0),
    "prepTimeMinutes": integer (opt, 0-240),
    "isChefRecommended": boolean,
    "status": "string (required)",
    "categoryId": "UUID (required)"
  }
  ```
- **Response**: `MenuItem`

#### Update Menu Item
- **Endpoint**: `PATCH /api/admin/menu/items/{id}`
- **Request Body**: `MenuItemUpdateRequest`
  ```json
  {
    "name": "string",
    "description": "string",
    "price": number,
    "prepTimeMinutes": integer,
    "isChefRecommended": boolean,
    "status": "string",
    "categoryId": "UUID"
  }
  ```
- **Response**: `MenuItem`

#### Delete Menu Item
- **Endpoint**: `DELETE /api/admin/menu/items/{id}`
- **Auth**: Authenticated
- **Response**: `204 No Content`

#### Upload Photo
- **Endpoint**: `POST /api/admin/menu/items/{id}/photo`
- **Content-Type**: `multipart/form-data`
- **Form Data**:
  - `photo`: File
- **Response**: `MenuItemPhoto`

#### Set Primary Photo
- **Endpoint**: `PATCH /api/admin/menu/items/{menuItemId}/photo/{photoId}/primary`
- **Auth**: Authenticated
- **Response**: `String` ("Success")

#### Delete Photo
- **Endpoint**: `DELETE /api/admin/menu/items/{menuItemId}/photo/{photoId}`
- **Auth**: Authenticated
- **Response**: `204 No Content`

#### Link Modifier Groups
- **Endpoint**: `POST /api/admin/menu/items/{id}/modifier-groups`
- **Request Body**: `MenuItemModifierRequest`
  ```json
  {
    "modifierGroupIds": ["UUID", "UUID"]
  }
  ```
- **Response**: `MenuItem` (with updated modifier groups)

---

### Modifier Groups

#### Get All Modifier Groups
- **Endpoint**: `GET /api/admin/menu/modifier-groups`
- **Auth**: Authenticated
- **Response**: List of `ModifierGroup`
  ```json
  [
    {
      "id": "UUID",
      "name": "string",
      "selectionType": "string",
      "isRequired": boolean,
      "minSelection": integer,
      "maxSelection": integer,
      "displayOrder": integer,
      "status": "string",
      "options": []
    }
  ]
  ```

#### Get Modifier Group by ID
- **Endpoint**: `GET /api/admin/menu/modifier-groups/{id}`
- **Auth**: Authenticated
- **Response**: `ModifierGroup`

#### Create Modifier Group
- **Endpoint**: `POST /api/admin/menu/modifier-groups`
- **Request Body**: `ModifierGroupRequest`
  ```json
  {
    "name": "string",
    "selectionType": "string (SINGLE/MULTIPLE)",
    "isRequired": boolean,
    "minSelection": integer,
    "maxSelection": integer,
    "displayOrder": integer,
    "status": "string",
    "options": [
      {
        "name": "string",
        "priceAdjustment": number
      }
    ]
  }
  ```
- **Response**: `ModifierGroup` (including options)

#### Update Modifier Group
- **Endpoint**: `PUT /api/admin/menu/modifier-groups/{id}`
- **Request Body**: `ModifierGroupUpdateRequest`
  ```json
  {
    "name": "string",
    "selectionType": "string",
    "isRequired": boolean,
    "minSelection": integer,
    "maxSelection": integer,
    "displayOrder": integer,
    "status": "string"
  }
  ```
- **Response**: `ModifierGroup`

#### Add Modifier Option
- **Endpoint**: `POST /api/admin/menu/modifier-groups/{groupId}/options`
- **Request Body**: `ModifierOptionRequest`
  ```json
  {
    "name": "string",
    "priceAdjustment": number
  }
  ```
- **Response**: `ModifierOption`

---

### Modifier Options

#### Update Modifier Option
- **Endpoint**: `PUT /api/admin/menu/modifier-options/{id}`
- **Request Body**: `ModifierOptionUpdateRequest`
  ```json
  {
    "name": "string",
    "priceAdjustment": number
  }
  ```
- **Response**: `ModifierOption`

---

### Users & Models

#### Get Profile
- **Endpoint**: `GET /api/users/profile`
- **Response**: `UserResponse`
  ```json
  {
    "id": "UUID",
    "email": "string",
    "firstName": "string",
    "lastName": "string",
    "role": "string",
    "emailVerified": boolean,
    "avatar": "string (URL)",
    "status": "string",
    "lastLogin": "timestamp",
    "createdAt": "timestamp",
    "updatedAt": "timestamp"
  }
  ```

#### Update Profile
- **Endpoint**: `PUT /api/users/profile`
- **Auth**: Authenticated
- **Request Body**: `UpdateProfileRequest`
  ```json
  {
    "firstName": "string",
    "lastName": "string"
  }
  ```
- **Response**: `MessageResponse`

#### Upload Avatar
- **Endpoint**: `POST /api/users/avatar`
- **Auth**: Authenticated
- **Content-Type**: `multipart/form-data`
- **Form Data**:
  - `photo`: File
- **Response**: `MessageResponse`

#### Create Staff (Admin)
- **Endpoint**: `POST /api/users/staff`
- **Auth**: Admin
- **Request Body**: `CreateStaffRequest`
  ```json
  {
    "email": "string",
    "password": "string",
    "firstName": "string",
    "lastName": "string",
    "role": "string (WAITER, KITCHEN_STAFF, ADMIN)"
  }
  ```
- **Response**: `MessageResponse`

#### Get All Staff (Admin)
- **Endpoint**: `GET /api/users/staff`
- **Auth**: Admin
- **Response**: `StaffListResponse`
  ```json
  {
    "success": boolean,
    "message": "string",
    "staff": [], // List of UserResponse
    "total": integer
  }
  ```

#### Get Staff By ID (Admin)
- **Endpoint**: `GET /api/users/staff/{id}`
- **Auth**: Admin
- **Response**: `UserResponse`

#### Update Staff (Admin)
- **Endpoint**: `PUT /api/users/staff/{id}`
- **Auth**: Admin
- **Request Body**: `UpdateStaffRequest`
  ```json
  {
    "firstName": "string",
    "lastName": "string",
    "role": "string"
  }
  ```
- **Response**: `MessageResponse`

#### Update Staff Status (Admin)
- **Endpoint**: `PUT /api/users/staff/{id}/status`
- **Auth**: Admin
- **Request Body**: `UpdateStatusRequest`
  ```json
  {
    "status": "string"
  }
  ```
- **Response**: `MessageResponse`

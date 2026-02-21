# Prompt for Frontend AI Agent

You are an expert Frontend Developer tasked with implementing authentication, authorization, and staff management for the Smart Restaurant App.

## Context
The backend API is ready with endpoints for authentication, user management, and menu management. We need to build the frontend interfaces to interact with these APIs.
The system has two distinct user types: **Staff** (Admin, Waiter, Kitchen Staff) and **Customer**.

## Core Requirements

### 1. Token Management (CRITICAL)
- **Separate Storage**: You MUST store authentication tokens separately for Staff and Customers to allow testing both flows in the same browser if needed, and to avoid logical conflicts.
  - Use `staffToken` key in localStorage for Staff users (Admin, Waiter, etc.).
  - Use `customerToken` key in localStorage for Customers.
- Ensure the HTTP interceptor attaches the correct token based on the request context or current active portal.

### 2. Pages to Implement

#### A. Staff Login Page
- **Route**: `/admin/login`
- **Features**:
  - Email and Password fields.
  - "Forgot Password" link.
  - On success: Store token in `staffToken` and redirect to the specific dashboard based on role (or a default Admin dashboard for now).
  - Validation: Client-side validation for email format and required fields.

#### B. Customer Login Page
- **Route**: `/login`
- **Features**:
  - Email and Password fields.
  - "Register" link.
  - On success: Store token in `customerToken`.
  - **Redirect**: Since customer endpoints are not fully ready, redirect them to a temporary "Welcome" or "Profile" page (`/profile` or `/welcome`) that displays their user details fetched from `/api/users/profile`.

#### C. Staff Management Page (Admin Only)
- **Route**: `/admin/staff`
- **Auth**: Requires `staffToken` and `ADMIN` role.
- **Features**:
  - **List View**: Display table of all staff members (fetched from `GET /api/users/staff`).
    - Columns: Name, Email, Role, Status, Last Login.
  - **Add Staff**: A modal or form to create a new staff member (`POST /api/users/staff`).
    - Fields: Email, Password, First Name, Last Name, Role (Select: WAITER, KITCHEN_STAFF, ADMIN).
  - **Edit Staff**: Ability to update staff details (`PUT /api/users/staff/{id}`) and Status (`PUT /api/users/staff/{id}/status`).


## Technical Constraints
- Use the existing Frontend tech stack (Reactjs).
- Implement proper error handling (toast notifications for success/failure).
- Protect routes.

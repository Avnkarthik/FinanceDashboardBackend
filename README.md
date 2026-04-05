# Finance Dashboard Backend# Finance Dashboard Backend

This project implements the backend for a financial dashboard system, managing users, roles, and financial records. It utilizes Node.js, Express, TypeScript, MongoDB, and Socket.io to provide a robust API layer and real-time dashboard updates.

## Architecture and Design Approach

The implementation closely models an API-specific Model-View-Controller (MVC) pattern. 
- **Models**: Defines structured Mongoose schemas with indexing for fast aggregation.
- **Controllers**: Separates business logic (Authentication, Finance Logic) from the Express application logic.
- **Middleware**: Provides reusable logic for stateless JWT authentication and robust Role-Based Access Control (RBAC).

By keeping `index.ts` minimal, the app separates server configuration (WebSockets, Database, Express App) from routing and business execution.

### Tradeoffs and Assumptions

- **Unified User Collection**: Unlike standard multi-tenant or varied stakeholder platforms (e.g., Rider vs Customer), Viewers, Analysts, and Admins operate with fundamentally identical profile data in a dashboard environment. Therefore, a single `UserModel` using an `enum` for the `role` field was implemented to avoid collection bloat and unnecessary complex referencing.
- **Role Guard Abstraction**: The `AuthorizeRole` middleware abstracts away permissions logic seamlessly. Rather than writing conditional statements in every Controller, endpoints enforce policies natively at the routing layer (e.g., `AuthorizeRole([UserRole.Admin])`).
- **File Uploads**: Mongoose fields define standard metadata for financial records (amount, category, type). External blob storage (like Multer/Cloudinary) was omitted as receipts uploading wasn't specified, minimizing scope-creep.

## Setup Instructions

### Prerequisites
- Node.js installed
- MongoDB instance running locally (or adjust the URI in `.env` or `index.ts`)

### Installation & Execution
1. Install dependencies:
   ```bash
   npm install
   ```
2. Build the project:
   ```bash
   npm run build
   ```
3. Run the development server (auto-reloading):
   ```bash
   npm run dev
   ```

## Core Functionality

### 1. User & Role Management
- `POST /api/auth/register`: Create a designated user.
- `POST /api/auth/login`: Issue an `httpOnly` JWT cookie stateless session.
- `POST /api/auth/logout`: Destroy session cookie.

### 2. Financial Records
- `GET /api/finance`: List records (Supports Pagination and Filtering). Available to Admin, Analyst, and Viewers.
- `POST /api/finance`: Create record (Admin Only). Emits Socket.io event.
- `PUT /api/finance/:id`: Update record (Admin Only). Emits Socket.io event.
- `DELETE /api/finance/:id`: Delete record (Admin Only). Emits Socket.io event.

### 3. Dashboard Summaries
- `GET /api/finance/dashboard/summary`: Executes parallel Mongoose aggregations (`$group`, `$match`) to output category distributions and monthly trends (Admin and Analyst only).

### 4. Real-time Feedback
On any successful modification to the database (Create, Update, Delete), the Express `io` instance broadcasts a `dashboard_update` event so the frontend can optimistically or reactively fetch data.


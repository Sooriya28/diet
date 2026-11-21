# Diet Card Management System

A full-stack, role-based **Diet Card Management System** built with **React, Vite, Tailwind CSS, Node.js, and Express.js**, using local JSON files for backend persistence. Designed as a clean, responsive MCA mini-project for local academic demonstration.

---

## Features

### Admin Role
- Sign in via role-based authentication.
- View dynamically calculated dashboard statistics (Total Users, Active Users, Weight Loss, Weight Gain, High Protein counts, plan distribution, and recent members).
- Create, view, search, filter, edit, activate/deactivate, and delete member accounts.
- Automatic unique Diet Card ID generation (`DCM-YYYY-XXXX`) on user creation.
- Manage independent daily menus for **Weight Loss**, **Weight Gain**, and **High Protein** across five meal categories: **Breakfast**, **Morning Snack**, **Lunch**, **Evening Snack**, and **Dinner**.

### Member (User) Role
- Sign in using credentials issued by the administrator (no public self-registration).
- View personal dashboard with assigned plan and Diet Card ID.
- View read-only personal profile.
- View and print a formatted **Digital Diet Card**.
- View **My Menu**, strictly scoped on the backend to the member's currently assigned diet plan.

---

## Prerequisites

- **Node.js** v20+ (v22 recommended)
- **npm** v9+

---

## Installation & Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables by copying `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

3. Configure the administrator account (choose one option):
   - **Option A (Recommended for automated setup):** Set `ADMIN_USERNAME` and `ADMIN_PASSWORD` in `.env` (or in your Secrets panel):
     ```env
     PORT=3000
     ADMIN_USERNAME=admin
     ADMIN_PASSWORD=your_secure_password
     ```
   - **Option B (First-Run UI Setup):** Leave `ADMIN_USERNAME` and `ADMIN_PASSWORD` blank on first launch. Open the application in the browser and complete the one-time **Create Administrator Account** form. Once claimed, the setup route automatically locks.

---

## Running the Application

Start the integrated Express + Vite development server (runs backend REST API and frontend on port `3000`):

```bash
npm run dev
```

Open in your browser:
- **Application & API Base URL:** `http://localhost:3000`
- **Health Check:** `http://localhost:3000/api/health`

For a production build:
```bash
npm run build
NODE_ENV=production npm start
```

---

## Project Structure

```text
├── backend/
│   ├── config/
│   │   └── constants.ts          # Predefined diet plans, meal categories, file paths
│   ├── controllers/
│   │   ├── authController.ts     # Login, logout, /me, one-time admin setup
│   │   ├── memberController.ts   # Member profile, diet card, plan-scoped menu
│   │   ├── menuController.ts     # Admin menu CRUD per diet plan
│   │   └── userController.ts     # Admin user CRUD, filters, dynamic statistics
│   ├── data/                     # Auto-created on startup
│   │   ├── admin.json
│   │   ├── users.json
│   │   └── menus.json
│   ├── middleware/
│   │   ├── asyncHandler.ts
│   │   └── authMiddleware.ts     # JWT verification and Admin/User role guards
│   ├── routes/
│   │   ├── authRoutes.ts
│   │   ├── memberRoutes.ts
│   │   ├── menuRoutes.ts
│   │   └── userRoutes.ts
│   ├── services/
│   │   ├── authService.ts        # JWT signing, revocation, user sanitization
│   │   └── jsonStorage.ts        # Serialized async file I/O & starter menu seeding
│   └── types/
│       └── index.ts
├── src/
│   ├── components/               # Modals and confirmation dialogs
│   ├── context/                  # AuthContext (session persistence & verification)
│   ├── layouts/                  # Responsive Navy sidebar & workspace header
│   ├── pages/
│   │   ├── admin/                # AdminDashboard, UserManagement, MenuManagement, DietPlansPage
│   │   ├── user/                 # UserDashboard, MyProfile, MyDietCard, MyMenu
│   │   └── LoginPage.tsx
│   ├── services/api.ts           # Axios client with Bearer token interceptor
│   ├── types/index.ts
│   ├── App.tsx                   # React Router DOM routes & role guards
│   └── main.tsx
├── server.ts                     # Express entry point + Vite dev middleware
├── .env.example
└── package.json
```

---

## REST API Overview

### Authentication
- `GET /api/health` — Backend health and storage status
- `GET /api/auth/status` — Check whether an admin account is configured
- `POST /api/auth/setup-admin` — One-time first-run admin bootstrap (locked once configured)
- `POST /api/auth/login` — Authenticate Admin or User and issue signed JWT
- `POST /api/auth/logout` — Revoke active session token
- `GET /api/auth/me` — Verify token and return authoritative user/admin details

### Admin User Management (Requires Admin role)
- `GET /api/users?search=&plan=&status=` — List filtered users and live dashboard stats
- `POST /api/users` — Create member, hash password with bcrypt, generate Diet Card ID
- `GET /api/users/:id` — Fetch single user details
- `PUT /api/users/:id` — Update member profile, credentials, status, or assigned diet plan
- `PATCH /api/users/:id/status` — Activate or deactivate a member
- `DELETE /api/users/:id` — Delete a member account

### Admin Menu Management (Requires Admin role)
- `GET /api/menus` — Item counts across all three predefined plans
- `GET /api/menus/:plan` — Fetch menu items strictly for one plan
- `POST /api/menus` — Add food item to a plan and meal category
- `PUT /api/menus/:id` — Update food item
- `DELETE /api/menus/:id` — Remove food item

### Member Endpoints (Requires User role)
- `GET /api/user/profile` — Read-only personal profile
- `GET /api/user/diet-card` — Formatted digital diet card fields
- `GET /api/user/menu` — Menu items derived strictly from the authenticated user's current `assignedPlan` in `users.json` (denies attempts to query other plans)

---

## Local JSON Storage & Security Notes

- **Local Demonstration Scope:** `backend/data/admin.json`, `backend/data/users.json`, and `backend/data/menus.json` are created automatically on server startup. All file writes are serialized through a per-file async queue with atomic temp-file replacement. This storage model is intended strictly for single-instance local college demonstrations and is **not** suitable for multi-server or concurrent production deployments without a persistent database.
- **Data Persistence:** Restarting the server preserves all existing users, passwords, and menu items. Starter menu items are seeded only when `menus.json` does not exist or is empty.
- **Resetting Demonstration Data:** Stop the server, delete `backend/data/users.json` and `backend/data/menus.json` (and `admin.json` if resetting the admin password), then restart the server.
- **Session & Token Limitations:** The frontend stores the signed JWT in `localStorage` (`dcm_token`) solely for client session persistence; the backend never trusts client-supplied roles or diet plan names and re-reads the user's current record from JSON storage on every protected request. For a production deployment, consider `HttpOnly` cookies, an external persistent session store for token revocation across restarts, and an explicit `JWT_SECRET` environment variable.

---

## Troubleshooting

- **Port 3000 already in use:** Set a different port in `.env` (e.g., `PORT=3001`) or stop the conflicting process.
- **"Your account is currently inactive":** An administrator deactivated the user account in User Management; re-activate the user to restore login access.
- **Malformed JSON error on startup:** Inspect `backend/data/*.json` for manual edits with invalid JSON syntax, or remove the corrupted file and restart the server to reinitialize.

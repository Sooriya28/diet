# Diet Card Management System

## Full-Stack Project Build Specification

Build a complete, functional **Diet Card Management System** for an MCA
mini-project. The application has exactly two roles: **Admin** and
**User**. Keep the system simple, professional, responsive, and easy to
demonstrate. Do not add unnecessary features.

------------------------------------------------------------------------

## 1. Technology Stack

### Frontend

-   React.js with Vite
-   JavaScript and JSX only (do not use TypeScript)
-   React Router DOM
-   Tailwind CSS
-   Axios for API requests
-   Lucide React for icons

### Backend

-   Node.js
-   Express.js
-   REST API

### Data storage

-   Store application data in local JSON files on the backend.
-   Use browser LocalStorage only to persist the login token/session on
    the client.
-   Do not use MongoDB, MySQL, Firebase, or any external database.
-   Do not replace the backend with frontend-only LocalStorage.

The backend must read and write the JSON files and must remain running
while the application is in use. Explain that this storage approach is
intended for a local college demonstration, not production or
multi-server deployment.

------------------------------------------------------------------------

## 2. User Roles

### Admin

The admin can: - Log in. - View dashboard statistics. - Create users. -
View, search, filter, edit, activate/deactivate, and delete users. -
Assign one of the three predefined diet plans to each user. - Create,
view, edit, and delete menu items for each diet plan. - Log out.

### User

Users cannot register themselves. Only the admin creates their accounts.

A user can: - Log in using credentials provided by the admin. - View
their dashboard. - View their profile. - View their digital diet card. -
View only the menu belonging to their assigned diet plan. - Log out.

Users must not be able to edit their personal details, change their
assigned plan, or access another user's data.

------------------------------------------------------------------------

## 3. Predefined Diet Plans

Use exactly these three plans: 1. Weight Loss 2. Weight Gain 3. High
Protein

These are fixed plan categories. Do not build a complicated
plan-creation feature.

The admin assigns one plan when creating a user and can change it later.

------------------------------------------------------------------------

## 4. Admin Interface

Create a responsive admin layout with a sidebar containing:

-   Dashboard
-   User Management
-   Menu Management
-   Diet Plans
-   Logout

### 4.1 Dashboard

Display dynamically calculated statistics: - Total users - Active
users - Weight Loss users - Weight Gain users - High Protein users

Also display a simple recent-users list and a plan distribution summary.

Do not hardcode dashboard numbers. Calculate them from the stored JSON
data.

### 4.2 User Management

Create a user form with these fields:

  Field                Requirement
  -------------------- ---------------------------------------------
  Full Name            Required
  Age                  Required, valid positive number
  Height (cm)          Required, valid positive number
  Weight (kg)          Required, valid positive number
  Phone Number         Required
  Address              Required
  Email Address        Required, valid email
  Username             Required, unique
  Password             Required
  Assigned Diet Plan   Required; one of the three predefined plans

When creating a user: - Generate a unique Diet Card ID automatically. -
Validate all required fields. - Prevent duplicate usernames and email
addresses. - Hash the password before storing it. - Save the user
through the backend API to the JSON file. - Show a clear success or
error message.

User list features: - Display users in a table. - Search by name, email,
or phone number. - Filter by diet plan and status. - Edit user details
and assigned plan. - Activate/deactivate users. - Delete users only
after a confirmation dialog.

### 4.3 Menu Management

This is a core module.

The admin must be able to select one of the three diet plans and manage
that plan's menu independently.

For every menu item, store: - Unique item ID - Diet plan - Food name -
Meal category - Description

Meal categories: - Breakfast - Morning Snack - Lunch - Evening Snack -
Dinner

Admin actions: - Select a plan. - View only that plan's existing menu
items. - Add a food item. - Edit a food item. - Delete a food item. -
Show an empty state when the selected plan has no menu items.

Example starter menu items (these are editable examples, not medical or
nutritional prescriptions):

**Weight Loss** - Breakfast: Oats and Fruits - Morning Snack: Apple -
Lunch: Brown Rice and Vegetables - Evening Snack: Green Tea - Dinner:
Vegetable Soup

**Weight Gain** - Breakfast: Banana and Peanut Butter - Morning Snack:
Mixed Nuts - Lunch: Rice and Chicken - Evening Snack: Milkshake -
Dinner: Paneer and Chapati

**High Protein** - Breakfast: Eggs and Greek Yogurt - Morning Snack:
Roasted Chickpeas - Lunch: Grilled Chicken and Rice - Evening Snack:
Protein-rich Nuts - Dinner: Paneer and Lentils

Every menu item must be associated with exactly one diet plan. Never mix
items from different plans.

### 4.4 Diet Plans

Show the three predefined plans and the number of users assigned to
each. This section is informational; plan categories remain fixed.

------------------------------------------------------------------------

## 5. User Interface

Create a responsive user layout with a sidebar containing:

-   Dashboard
-   My Profile
-   My Diet Card
-   My Menu
-   Logout

### 5.1 User Dashboard

Show: - Welcome message with the user's name. - Assigned diet plan. -
Diet Card ID. - A brief personal information summary. - A link or
navigation item to My Menu.

### 5.2 My Profile

Display the user's: - Full name - Age - Height - Weight - Phone number -
Address - Email address - Assigned diet plan

This page is read-only.

### 5.3 My Diet Card

Create a polished digital card containing: - Application name: Diet Card
Management System - User's full name - Unique Diet Card ID - Age -
Height - Weight - Assigned diet plan - Phone number - Active/inactive
status

### 5.4 My Menu --- Critical Access Rule

The backend must determine the logged-in user's assigned diet plan from
the authenticated identity.

Examples: - A Weight Loss user sees only Weight Loss menu items. - A
Weight Gain user sees only Weight Gain menu items. - A High Protein user
sees only High Protein menu items.

Organize the displayed items by meal category: - Breakfast - Morning
Snack - Lunch - Evening Snack - Dinner

Display each food name and description. Show a helpful empty state if a
category or the entire menu has no items.

**Security requirement:** Do not trust a plan name supplied by the
browser or stored in editable LocalStorage. The backend must identify
the user from the verified session/token, read that user's current
assigned plan, and return only matching menu items. Users must not be
able to request another plan's menu by changing a URL or API parameter.

If the admin changes a user's plan, the user's menu must reflect the new
assignment on the next API request/page refresh.

------------------------------------------------------------------------

## 6. Authentication and Authorization

Create one login page for both roles with: - Username field - Password
field - Password visibility toggle - Login button - Clear validation and
error messages

There is no public registration.

Create a default admin account using environment variables. Document how
to configure the admin username and password. Do not hardcode production
credentials in source code.

Security requirements: - Hash user passwords using bcrypt. - Use signed
authentication tokens or a secure session approach. - Verify
authentication on every protected backend endpoint. - Add role-based
middleware. - Admin endpoints must reject normal users. - Users can
access only their own profile, card, and assigned menu. - Do not store
plain-text passwords in JSON files. - Do not treat LocalStorage as proof
of authorization; it only stores the client session token.

For a local development demonstration, document the security limitations
of the chosen session/token configuration.

------------------------------------------------------------------------

## 7. Backend REST API

Implement a real Express backend and connect the React frontend to it.

Suggested endpoints (the implementation may organize these cleanly):

### Authentication

-   `POST /api/auth/login`
-   `POST /api/auth/logout`
-   `GET /api/auth/me`

### Admin user management

-   `GET /api/users`
-   `POST /api/users`
-   `GET /api/users/:id`
-   `PUT /api/users/:id`
-   `DELETE /api/users/:id`

### Admin menu management

-   `GET /api/menus/:plan` --- admin access
-   `POST /api/menus` --- admin access
-   `PUT /api/menus/:id` --- admin access
-   `DELETE /api/menus/:id` --- admin access

### User-specific

-   `GET /api/user/profile`
-   `GET /api/user/diet-card`
-   `GET /api/user/menu`

The user menu endpoint must derive the plan from the authenticated
user's current record, not from a plan query parameter.

Use appropriate HTTP status codes and consistent JSON response formats.
Validate request bodies and handle errors without exposing passwords,
tokens, or stack traces.

------------------------------------------------------------------------

## 8. JSON File Storage

Create these files automatically if they do not exist:

``` text
backend/
  data/
    admin.json
    users.json
    menus.json
```

Requirements: - Read and write data through backend services. - Preserve
existing data when the server restarts. - Initialize missing files with
valid empty/default JSON. - Handle malformed JSON and file read/write
errors clearly. - Use safe asynchronous file operations. - Serialize
writes or otherwise prevent overlapping writes from corrupting files. -
Never return password hashes in API responses. - Do not silently replace
existing data with sample data on every startup.

Seed sample menu items only when the menu file is empty or has not yet
been initialized. Clearly document how to reset demonstration data.

JSON files are local development storage and are not suitable for
concurrent production use, multiple backend instances, or deployment
without persistent disk storage.

------------------------------------------------------------------------

## 9. UI/UX Requirements

Use a clean, modern, professional dashboard style.

Suggested visual direction: - Primary: Deep navy blue - Secondary:
White - Accent: Soft green - Page background: Light gray (`#F8FAFC`) -
Rounded cards and subtle shadows - Consistent typography and spacing -
Lucide icons

Admin UI: - Responsive sidebar and top navigation. - Dashboard statistic
cards. - Clean user table. - Search and filter controls. - Clear forms
and confirmation dialogs. - Menu management with plan selector and meal
categories.

User UI: - Simple navigation. - Welcome dashboard. - Attractive digital
diet card. - Readable meal sections and food cards.

Support desktop, laptop, tablet, and mobile screens. Avoid excessive
animation, crowded layouts, unnecessary charts, and non-functional
buttons.

Every visible button, form, search field, filter, and navigation link
must work.

------------------------------------------------------------------------

## 10. Suggested Project Structure

``` text
diet-card-management/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── layouts/
│   │   ├── services/
│   │   ├── context/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── .env.example
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── routes/
│   ├── services/
│   ├── data/
│   │   ├── admin.json
│   │   ├── users.json
│   │   └── menus.json
│   ├── server.js
│   ├── package.json
│   └── .env.example
│
└── README.md
```

You may adjust the structure if needed, but keep frontend and backend
clearly separated.

------------------------------------------------------------------------

## 11. End-to-End Demonstration and Acceptance Tests

The following complete workflow must work:

1.  Start the backend.
2.  Start the frontend.
3.  Open the application in a browser.
4.  Log in using the configured admin credentials.
5.  View dynamically calculated admin dashboard statistics.
6.  Create a user named Ahmed and assign the Weight Loss plan.
7.  Open Menu Management.
8.  Add several food items to the Weight Loss menu.
9.  Add separate items to Weight Gain and High Protein menus.
10. Log out.
11. Log in as Ahmed using the credentials created by admin.
12. Open My Profile and verify Ahmed's information.
13. Open My Diet Card and verify the unique card ID and assigned plan.
14. Open My Menu and verify that only Weight Loss items appear.
15. Attempt to access another plan's menu as Ahmed; the backend must
    deny access or return only Ahmed's assigned menu.
16. Log out and log in as admin.
17. Change Ahmed's assigned plan to High Protein.
18. Log in as Ahmed again.
19. Verify that only High Protein menu items now appear.
20. Restart the backend and verify that user and menu data remain saved
    in JSON files.

Do not claim a test passed unless it was actually run.

------------------------------------------------------------------------

## 12. Build and Delivery Instructions

Work in phases and keep the application runnable after each phase.

**Phase 1 --- Project setup** - Create frontend and backend folders. -
Configure dependencies and environment examples. - Create the backend
server and health-check endpoint.

**Phase 2 --- Backend** - Implement JSON storage services. - Implement
authentication and authorization. - Implement user CRUD APIs. -
Implement menu CRUD APIs. - Implement the user-specific profile,
diet-card, and menu APIs. - Test the APIs.

**Phase 3 --- Frontend** - Create routing and role-based layouts. -
Create login page. - Create admin dashboard and user management. -
Create menu management. - Create user dashboard, profile, diet card, and
My Menu. - Connect all pages to the backend APIs.

**Phase 4 --- Integration** - Test the full demonstration workflow. -
Fix errors and verify persistence after restart. - Check responsive
layouts.

**Phase 5 --- Documentation** Create a complete README containing: -
Prerequisites. - Installation commands. - Environment variable setup. -
How to create/configure the admin account. - How to run backend and
frontend in separate terminals. - Local URLs and ports. - API
overview. - JSON storage explanation. - Troubleshooting common errors.

### Final mandatory instructions

-   Build a complete working full-stack application, not just a UI
    mockup.
-   Do not omit the backend.
-   Do not use an external database.
-   Do not replace backend persistence with frontend LocalStorage.
-   Do not add food ordering, payments, calorie tracking, subscriptions,
    AI recommendations, or public registration.
-   Do not leave TODOs, fake API calls, or non-functional controls.
-   Do not overwrite user data on server restart.
-   Explain which files were created and provide exact commands to run
    the application.
-   If the environment cannot create or run a file, state that
    limitation instead of pretending it succeeded.

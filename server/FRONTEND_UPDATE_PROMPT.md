# Frontend Update Prompt (React JS)

Use this prompt in the frontend repository.

## Context

Before these backend updates, the frontend auth + recipes + comments flow was already implemented.
Now we added new backend capabilities and the frontend must be updated to support role-based behavior, admin moderation, and password change.

Backend base URL is still the same, and auth is cookie-based JWT.
Always send requests with credentials enabled.

---

## What Changed in Backend

### 1. User Role Support

- User model now includes `role` with values:
  - `user`
  - `admin`
- Auth responses now include `role`:
  - register response user object includes `role`
  - login response user object includes `role`

### 2. Admin Middleware + Role Authorization

- Backend now enforces role checks.
- Admin can manage any recipe.
- Normal users can edit/delete only their own recipes.

### 3. Recipe Approval Workflow

- If creator is `admin`:
  - recipe is published immediately.
- If creator is normal `user`:
  - recipe is created as pending request.
  - needs admin approval before it appears publicly.

Recipe moderation-related fields now exist in backend data:

- `approvalStatus`: `pending | approved | rejected`
- `isPublished`
- `approvedBy`
- `approvedAt`

### 4. New Admin Recipe Endpoints

- `GET /api/recipes/admin/requests`
  - Admin only
  - Returns all pending recipe requests
- `PATCH /api/recipes/admin/requests/:id/approve`
  - Admin only
  - Approves and publishes a pending recipe

### 5. Public Recipe Visibility Rules

- Public list and recipe details only show published recipes.
- Pending recipes are hidden from normal public browsing.

### 6. Comment Moderation Upgrade

- Comment update/delete now supports:
  - owner OR admin

### 7. Change Password Endpoint

- New protected endpoint:
  - `PATCH /api/auth/change-password`
- Request body:
  - `currentPassword`
  - `newPassword`

### 8. Admin Seeder Added

- Admin seed command exists in backend:
  - `npm run seed:admin`
- Super useful for local testing of admin UI flows.

---

## Frontend Tasks (React JS)

### A. Auth State Update

- Persist user role in auth store/context (from login/register/me response).
- Recommended auth shape:
  - `isAuthenticated`
  - `user`
  - `user.role`

### B. Route Protection Upgrade

Implement 3 guard types:

1. Guest-only routes (login/register)
2. Auth-only routes (profile, create recipe, etc.)
3. Admin-only routes (admin dashboard + moderation pages)

Add separate guard component for role-based access.

### C. New Admin Dashboard Section

Create admin pages:

1. `AdminDashboard` main page
2. `PendingRecipesPage` listing all pending recipe requests
3. Per-item action button: `Approve`

Expected UX:

- Show pending list with key recipe info (title, author, created date, short description, image if exists).
- Approve action triggers API call and removes item from pending list immediately.
- Show success/error toast alerts.

### D. Recipe UX Changes

For normal users creating recipe:

- After successful submit, show message like:
  - "Recipe submitted for admin approval"
- In user-facing list pages, do not expect pending recipes to appear publicly.

For edit/delete buttons in recipe card/detail page:

- Show if current user is owner OR admin.

### E. Comment UX Changes

- Admin should be able to edit/delete any comment from UI (optional badge or admin controls).
- Owners keep existing controls.

### F. Change Password UI

Add a new page/component under authenticated user settings, e.g.:

- `PATCH /api/auth/change-password`
- Form fields:
  - Current Password
  - New Password
  - Confirm New Password (frontend-only validation)

Validation requirements in UI:

- Required fields
- New password min length 6+
- Confirm password matches

### G. Navigation and Role-Based Menus

Update nav/header/sidebar:

- Show admin links only if `user.role === "admin"`.
- Add links to:
  - Admin Dashboard
  - Pending Recipe Requests
  - Change Password

---

## API Contract Notes

### Auth / Session

- Cookie-based auth; frontend must use `withCredentials: true` (axios) or `credentials: "include"` (fetch).

### Response Handling

- Preserve existing error handling, but add handling for:
  - `403` forbidden for role-restricted actions
  - approval flow messages from recipe creation

---

## Suggested Frontend Route Map

- `/login`
- `/register`
- `/dashboard` (auth user)
- `/profile` (auth user)
- `/change-password` (auth user)
- `/admin` (admin only)
- `/admin/recipe-requests` (admin only)

---

## Acceptance Criteria

1. Normal user can create recipe, sees "submitted for approval" feedback.
2. Pending recipe is NOT visible in public recipe list.
3. Admin sees pending requests list and can approve.
4. Approved recipe appears in public listing.
5. Owner can edit/delete own recipe.
6. Admin can edit/delete any recipe.
7. Owner or admin can edit/delete comment.
8. Authenticated user can change password with current password verification.
9. UI route guards correctly block unauthorized access to admin pages.
10. Swagger-backed endpoints are consumed correctly from frontend.

---

## Implementation Note

Use existing frontend architecture and styling patterns. Only extend what is needed for role-based guards, admin moderation UI, and password change flow.

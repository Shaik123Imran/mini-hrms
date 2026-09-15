# Mini HRMS

A frontend-only **Human Resource Management System** (HRMS) dashboard for managing employees, attendance, and leave requests. Built as a single-page application for internal HR teams — no backend required.

> **New to the team?** Read [CONTRIBUTING.md](CONTRIBUTING.md) for setup, the daily Git workflow, and tips for working together on this repo.

## Features

- **Role-based Authentication** — Login/logout with JWT session tokens and role-specific sign-in for Admin, HR Manager, Manager, and Employee
- **Dashboard** — KPI cards, weekly attendance trend chart, department distribution, recent employees & leave requests
- **Projects** — Role-aware project dashboard (KPIs, charts, filters, progress cards, team details). Admin/HR see all projects, managers see their team's, employees see their own
- **Employee Management** — Full CRUD (add, edit, delete, view profile) with search, filters, and pagination. Access is role-gated
- **Attendance** — Daily attendance records with date/dept/status filters, plus a clock in/out card for today's entry. Employees see their own records only
- **Leave Management** — View, apply, approve, and reject leave requests with detail view and confirmation dialogs. Employees can only apply for themselves
- **Notifications** — Bell icon showing pending leave alerts (own leaves for employees)
- **JWT Tokens** — Signed, expiring tokens are issued at login, stored securely, verified on session restore, and required for all mutating service calls

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [React](https://react.dev) 19 |
| Build tool | [Vite](https://vitejs.dev) |
| Routing | [react-router-dom](https://reactrouter.com) 7 |
| Styling | [Tailwind CSS](https://tailwindcss.com) 3 |
| Charts | [Recharts](https://recharts.org) |
| Icons | [lucide-react](https://lucide.dev) |
| Linting | [Oxlint](https://oxc.rs) |
| Data layer | localStorage (mock, replaceable with a real API) |

## Getting Started

```bash
# Install dependencies
npm install

# Start the dev server
npm run dev

# Build for production
npm run build

# Preview the production build
npm run preview

# Lint
npm run lint
```

## Demo Credentials

Pick your role on the login screen (it pre-fills credentials), or sign in with any account below:

| Role | Email | Password |
|---|---|---|
| Admin | `admin@company.com` | `admin123` |
| HR Manager | `hr@company.com` | `hr123` |
| Manager | `manager@company.com` | `manager123` |
| Employee | `employee@company.com` | `employee123` |

> An extra Manager account exists at `suresh.babu@company.com` / `manager123`.

## Project Structure

```
src/
├── main.jsx                # Entry point
├── App.jsx                 # Root router & providers
├── components/
│   ├── common/             # Reusable UI (Button, Modal, Toast, Badge, ...)
│   ├── employee/           # Employee form
│   └── layout/             # Sidebar & Navbar
├── context/
│   ├── AuthContext.jsx     # Auth state (login/logout/session/token)
│   └── ToastContext.jsx    # Global toast notifications
├── data/                   # Single JSON mock data store (data.json)
├── layouts/                # App layout wrapper
├── pages/                  # Route pages
│   └── auth/               # Login & Logout pages
├── routes/                 # ProtectedRoute guard + RoleRoute guard
├── services/               # Data services backed by localStorage + JWT checks
└── utils/                  # Constants, JWT, permissions, formatters, validators, storage
```

## Data Layer

All mock data (users, employees, attendance, leaves, dashboard) lives in a single JSON file — `src/data/data.json` — re-exported through `src/data/index.js`. User-edited records are kept in `localStorage` under the `mini_hrms_` prefix and seeded from that JSON on first run. The service layer (`src/services/`) is intentionally thin so the bodies can be swapped for real API/Axios calls when a backend is ready — no component changes required.

## Authentication & Roles

- On login, the app issues a mock **JWT** (`utils/jwt.js`) containing the user's id, role, and expiry, stored alongside the session.
- `AuthContext` restores the session only if the stored token is still valid and unexpired.
- Every mutating service call (`employeeService`, `attendanceService`, `leaveService`) goes through `assertAuthenticated()` in `services/apiClient.js`, which verifies the JWT first.
- Routes are protected by `ProtectedRoute` (must be logged in) and `RoleRoute` (must have an allowed role).

## Notes

- Employee avatars are generated from initials as no image upload is implemented.
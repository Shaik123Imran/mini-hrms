# Mini HRMS

A frontend-only **Human Resource Management System** (HRMS) dashboard for managing employees, attendance, and leave requests. Built as a single-page application for internal HR teams — no backend required.

## Features

- **Authentication** — Login/logout with session persistence, demo credentials, and a password-reset flow
- **Dashboard** — KPI cards, weekly attendance trend chart, department distribution, recent employees & leave requests
- **Employee Management** — Full CRUD (add, edit, delete, view profile) with search, filters, and pagination
- **Attendance** — Daily attendance records with date/dept/status filters, plus a clock in/out card for today's entry
- **Leave Management** — View, apply, approve, and reject leave requests with detail view and confirmation dialogs
- **Reports** — Charts for department distribution, employment status, attendance trend, and leave summaries
- **Notifications** — Bell icon showing real-time pending leave alerts

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

| Field | Value |
|---|---|
| Email | `admin@company.com` |
| Password | `admin123` |

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
│   ├── AuthContext.jsx     # Auth state (login/logout/session)
│   └── ToastContext.jsx    # Global toast notifications
├── data/                   # Mock data (employees, leaves, attendance, dashboard)
├── layouts/                # App layout wrapper
├── pages/                  # Route pages (Login, Dashboard, Employees, ...)
├── routes/                 # ProtectedRoute guard
├── services/               # Data services backed by localStorage
└── utils/                  # Constants, formatters, validators, storage helpers
```

## Data Layer

All data is stored in `localStorage` under the `mini_hrms_` prefix and seeded from mock data (`src/data/`) on first run. The service layer (`src/services/`) is intentionally thin so the bodies can be swapped for real API/Axios calls when a backend is ready — no component changes required.

## Notes

- Attendance records are auto-generated for the current month (weekdays only).
- Employee avatars are generated from initials as no image upload is implemented.
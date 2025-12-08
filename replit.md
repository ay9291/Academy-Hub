# ILT Academy Management System

## Overview

ILT Academy Management System is an internal web application for managing academy operations including student enrollment, teacher assignments, attendance tracking, homework management, fee collection, test administration, and various administrative tasks. The system is built as a full-stack application with role-based access control for admins, teachers, parents, and students.

**Tech Stack:**
- Frontend: React with TypeScript, Vite build tool
- UI Framework: shadcn/ui components with Radix UI primitives
- Styling: Tailwind CSS with custom design system
- Backend: Node.js with Express
- Database: PostgreSQL with Drizzle ORM
- Authentication: Custom session-based authentication with bcrypt
- State Management: TanStack Query (React Query)

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Component Structure:**
- Component library based on shadcn/ui with Radix UI primitives for accessible, composable UI components
- Custom theme system with light/dark mode support stored in localStorage
- File-based routing using Wouter (lightweight React router)
- Form handling via React Hook Form with Zod schema validation
- Global state management through TanStack Query for server state caching

**Design System:**
- Material Design principles adapted for admin dashboards (Linear/Notion-inspired)
- Inter font family for UI text, JetBrains Mono for monospace data
- Consistent spacing scale using Tailwind utilities (2, 4, 6, 8, 12, 16)
- Data-density focused layout with clear visual hierarchy
- Responsive grid system with mobile-first breakpoints

**Key Pages/Modules:**
- Dashboard with analytics and quick stats
- Student Management (enrollment, profiles, academic tracking)
- Teacher Management (assignments, workload tracking)
- Batch/Class Management (scheduling, student/teacher assignments)
- Attendance Tracking (daily, batch-wise, subject-wise)
- Homework Management (assignment creation, submission tracking)
- Test Management (creation, result entry, analytics)
- Fee Management (payment tracking, receipt generation)
- Study Materials (resource library by subject/category)
- Logbook (daily class logs, topics covered)
- Certificates (generation and tracking)
- Complaints System (issue reporting and resolution)
- Asset Management (equipment tracking)
- Library Management (book inventory, issue/return)
- Lost & Found tracking

### Backend Architecture

**API Structure:**
- RESTful API with Express.js
- Session-based authentication using express-session with PostgreSQL session store
- Role-based access control middleware for route protection
- Centralized error handling and logging
- Request/response logging with timestamp and duration tracking

**Authentication Flow:**
- Custom authentication system (not using Passport.js despite its presence in dependencies)
- Password authentication with bcrypt hashing
- OTP-based login via email (Resend API) or phone (Prelude API)
- Password reset flow with token-based validation
- Session storage in PostgreSQL with 7-day TTL
- Registration number-based user identification system

**Database Design:**
- PostgreSQL as primary database
- Drizzle ORM for type-safe database operations
- Schema-first approach with TypeScript type generation
- Session management table for authentication persistence
- Comprehensive relational schema covering:
  - Users (with role-based permissions)
  - Students (with parent details, academic categories)
  - Teachers (with subject specializations)
  - Subjects and Batches
  - Many-to-many relationships (batch-teacher, batch-student)
  - Attendance records
  - Homework and submissions
  - Fee structures and payments
  - Tests and results
  - Study materials
  - Logbook entries
  - Complaints and responses
  - Assets, library books, lost & found items
  - Certificates

**Data Storage Strategy:**
- All business logic handled through a centralized `storage.ts` module
- CRUD operations abstracted into reusable functions
- Transactions not explicitly implemented but can be added for multi-step operations

### Build & Deployment

**Build Process:**
- Custom build script using esbuild for server bundling
- Vite for client-side bundling with React plugin
- Production build separates client assets into `dist/public`
- Server bundled to single `dist/index.cjs` file
- Whitelisted dependencies bundled to reduce cold start times

**Development Environment:**
- Hot Module Replacement (HMR) via Vite
- Replit-specific development plugins (runtime error overlay, cartographer, dev banner)
- TypeScript type checking without emit
- Path aliases for clean imports (@/, @shared/, @assets/)

## External Dependencies

### Third-Party APIs & Services

**Email Service:**
- Resend API for transactional emails (password resets, OTPs, welcome emails)
- Configured via `RESEND_API_KEY` environment variable
- Graceful degradation when not configured (logs warnings but doesn't crash)

**SMS/Phone Verification:**
- Prelude SDK for phone OTP verification
- Configured via `PRELUDE_API_KEY` environment variable
- Used for passwordless authentication flow

### Database

**PostgreSQL:**
- Primary data store for all application data
- Connection string via `DATABASE_URL` environment variable
- Session storage using `connect-pg-simple` adapter
- Drizzle migrations stored in `/migrations` directory

### UI Component Libraries

**Core Dependencies:**
- Radix UI primitives for 20+ accessible components (dialogs, dropdowns, popovers, etc.)
- shadcn/ui as component architecture pattern
- Recharts for data visualization (attendance, performance charts)
- React Day Picker for calendar/date selection
- cmdk for command palette functionality

### Utility Libraries

**Notable Dependencies:**
- bcryptjs for password hashing
- date-fns for date manipulation
- zod for runtime type validation
- nanoid for unique ID generation
- React Hook Form for form state management

### Environment Variables Required

- `DATABASE_URL` - PostgreSQL connection string (required)
- `SESSION_SECRET` - Session encryption key (required)
- `RESEND_API_KEY` - Email service API key (optional)
- `PRELUDE_API_KEY` - Phone OTP service API key (optional)
- `NODE_ENV` - Environment mode (development/production)
- `REPL_ID` - Replit environment identifier (for dev tools)
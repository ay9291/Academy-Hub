# ILT Academy Management System

## Overview

ILT Academy Management System is an internal web application for managing academy operations including student enrollment, teacher assignments, attendance tracking, homework management, fee collection, test administration, and various administrative tasks. The system is built as a full-stack application with role-based access control for admins, teachers, parents, and students.

**Tech Stack:**
- Frontend: React with TypeScript, Vite build tool
- UI Framework: shadcn/ui components with Radix UI primitives
- Styling: Tailwind CSS with custom design system
- Backend: Vercel Serverless Functions (for production) / Express.js (for development)
- Database: Supabase PostgreSQL with Drizzle ORM
- Authentication: JWT-based authentication with httpOnly cookies
- State Management: TanStack Query (React Query)

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Deployment Architecture (Vercel)

**Serverless Functions:**
- All API endpoints are Vercel serverless functions in `/api` directory
- Each endpoint is a standalone TypeScript file with a default export handler
- Shared utilities in `/api/_lib/` (db.ts, auth.ts, storage.ts, email.ts)
- JWT tokens stored in httpOnly cookies for security
- 256MB memory, 10 second max duration per function

**API Endpoints Structure:**
```
/api
├── _lib/           # Shared utilities (db, auth, storage, email)
├── auth/           # Authentication (login, logout, refresh, OTP, password reset)
├── students/       # Student CRUD
├── teachers/       # Teacher CRUD
├── subjects/       # Subject CRUD
├── batches/        # Batch CRUD
├── attendance/     # Attendance tracking
├── homework/       # Homework management
├── tests/          # Test management
├── fee-structures/ # Fee structures
├── fee-payments/   # Fee payments
├── study-materials/# Study materials
├── complaints/     # Complaints system
├── logbook/        # Daily class logs
├── assets/         # Asset management
├── library-books/  # Library management
├── book-issues/    # Book issue tracking
├── lost-found/     # Lost and found
├── certificates/   # Certificate generation
└── dashboard/      # Dashboard stats
```

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

### Authentication Flow

**JWT-Based Authentication:**
- Password authentication with bcrypt hashing
- JWT access tokens (15 min expiry) stored in httpOnly cookies
- JWT refresh tokens (7 days expiry) stored in httpOnly cookies
- Token refresh endpoint for seamless session extension
- OTP-based login via email (Resend API)
- Password reset flow with token-based validation
- Registration number-based user identification (STU/TEA prefix + year + sequence)
- Parent login using student registration number + 'p' suffix

**Database Design:**
- Supabase PostgreSQL as primary database
- Drizzle ORM for type-safe database operations
- Schema-first approach with TypeScript type generation
- Connection pooling with max 5 connections per serverless instance
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
  - OTP codes and password reset tokens

### Build & Deployment

**Vercel Deployment:**
- `npm run build:vercel` - Builds frontend only (Vite)
- Vercel auto-compiles API functions from `/api` directory
- `vercel.json` configures rewrites and function settings
- SPA routing handled via catch-all rewrite to index.html

**Development Environment:**
- `npm run dev` - Runs Express server with Vite middleware
- Hot Module Replacement (HMR) via Vite
- Local development uses Express session-based auth
- Path aliases for clean imports (@/, @shared/, @assets/)

## External Dependencies

### Third-Party APIs & Services

**Email Service:**
- Resend API for transactional emails (password resets, OTPs, welcome emails)
- Configured via `RESEND_API_KEY` environment variable
- Graceful degradation when not configured (logs warnings but doesn't crash)
- From address: noreply@iltacademy.in

### Database

**Supabase PostgreSQL:**
- Primary data store for all application data
- Connection string via `SUPABASE_DATABASE_URL` environment variable
- Session Pooler connection with transaction mode
- URL-encoded password handling (@ → %40)
- Drizzle migrations via `npm run db:push`

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
- React Hook Form for form state management
- @vercel/node for serverless function types

### Environment Variables Required

**Required:**
- `SUPABASE_DATABASE_URL` - Supabase PostgreSQL connection string
- `SESSION_SECRET` - JWT signing secret key

**Optional:**
- `RESEND_API_KEY` - Email service API key
- `NODE_ENV` - Environment mode (development/production)
- `VERCEL_URL` - Auto-set by Vercel for production URL

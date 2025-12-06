# ILT Academy Management System - Design Guidelines

## Design Approach

**Selected Approach**: Design System - Material Design principles with modern admin dashboard influences (Linear, Notion)

**Justification**: This is a utility-focused, information-dense internal management system requiring excellent data visibility, efficient workflows, and role-based interfaces. Material Design provides robust patterns for complex forms, tables, and data visualization while maintaining clarity.

**Key Design Principles**:
- Data clarity over decoration
- Efficient information density with breathing room
- Clear visual hierarchy for role-based content
- Consistent interaction patterns across modules
- Quick scanning and task completion

---

## Typography

**Font Family**: 
- Primary: 'Inter' (Google Fonts) - for all UI text, forms, tables
- Monospace: 'JetBrains Mono' - for student IDs, reference numbers, data fields

**Type Scale**:
- Display/Dashboard Headers: text-3xl (30px) / font-bold
- Section Headers: text-2xl (24px) / font-semibold
- Card/Module Titles: text-xl (20px) / font-semibold
- Body/Form Labels: text-base (16px) / font-medium
- Table Content/Secondary: text-sm (14px) / font-normal
- Captions/Metadata: text-xs (12px) / font-normal

**Hierarchy Rules**:
- Dashboard page titles: text-3xl with mb-6
- Module section headers: text-2xl with mb-4
- Card headers: text-xl with mb-3
- Form field labels: text-sm with mb-1, uppercase tracking-wide

---

## Layout System

**Spacing Primitives**: Use Tailwind units of **2, 4, 6, 8, 12, 16** (e.g., p-4, gap-6, mb-8, py-12)

**Grid Structure**:
- Dashboard container: max-w-7xl mx-auto px-6
- Sidebar navigation: Fixed w-64 (256px) on desktop, collapsible on mobile
- Main content area: flex-1 with px-8 py-6
- Card grids: grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6
- Form layouts: max-w-4xl for multi-column forms, max-w-2xl for single-column

**Consistent Spacing**:
- Page padding: px-6 py-6 (mobile), px-8 py-8 (desktop)
- Card padding: p-6
- Section margins: mb-8 between major sections, mb-6 within sections
- Element gaps: gap-4 for form fields, gap-6 for cards, gap-2 for button groups

---

## Component Library

### Navigation & Layout
**Sidebar Navigation**:
- Fixed left sidebar (w-64) with academy logo at top
- Role-based menu items with icons (Heroicons)
- Active state: subtle background with border-l-4 accent
- Collapsible on mobile with hamburger toggle

**Top Bar**:
- Fixed header with h-16, includes breadcrumbs, search, notifications, user profile
- Right-aligned user dropdown with role badge (Admin/Teacher/Parent)

### Core UI Elements

**Cards**:
- Rounded corners (rounded-lg), subtle border (border)
- Padding p-6, shadow-sm with hover:shadow-md transition
- Card header with flex justify-between for title and actions

**Tables**:
- Striped rows for readability (even row background)
- Sticky header on scroll
- Column sorting indicators
- Row actions (edit/view/delete) in rightmost column
- Pagination at bottom with 10/25/50/100 items per page options

**Forms**:
- Label above input with text-sm font-medium mb-1
- Input height h-10, rounded border, px-3
- Multi-column grid on desktop: grid-cols-2 gap-6
- Required field indicator (asterisk) in label
- Helper text below inputs (text-xs)
- Form actions (Submit/Cancel) right-aligned with gap-3

**Buttons**:
- Height h-10 (h-9 for small variant)
- Padding px-6 (px-4 for small)
- Rounded corners rounded-md
- Primary: solid fill, font-semibold
- Secondary: outlined border-2
- Ghost: transparent with hover background
- Icon buttons: w-10 h-10 with centered icon

### Data Displays

**Status Badges**:
- Attendance: Pill-shaped (rounded-full px-3 py-1 text-xs font-medium)
  - Red flag: <70% attendance
  - Orange flag: 70-85% attendance  
  - Green flag: >85% attendance
- Fee status: "Paid" / "Pending" / "Overdue" badges
- Student tags: "Top Performer" / "Needs Mentoring" / "At Risk"

**Charts & Analytics**:
- Use Recharts library for all visualizations
- Line charts: Attendance trends, performance over time
- Bar charts: Subject-wise marks, batch comparisons
- Pie charts: Fee collection status, attendance distribution
- Chart container: min-h-80 with p-6

**Progress Indicators**:
- Linear progress bars (h-2 rounded-full) for homework completion
- Circular progress for attendance percentage
- Step indicators for multi-step forms (enrollment, test creation)

### Dashboards

**Metric Cards** (for Analytics Dashboard):
- Grid layout: grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6
- Each card shows: large number (text-3xl font-bold), label (text-sm), trend indicator
- Icon in top-right corner (w-12 h-12 with background circle)

**Quick Action Panels**:
- Horizontal button groups for common tasks
- Teacher dashboard: "Mark Attendance" / "Upload Homework" / "Enter Marks"
- Parent dashboard: "View Reports" / "Download Receipt" / "Raise Query"

### Specialized Components

**Student Profile Card**:
- Two-column layout: Left (photo, QR code, basic info), Right (tabbed interface for Attendance/Fees/Performance)
- Photo placeholder: w-32 h-32 rounded-full
- QR code: w-24 h-24 with "Scan for Profile" caption

**Timetable View**:
- Grid table with time slots (rows) and days (columns)
- Each cell: subject name, teacher name, room number (text-xs stacked)
- Conflict indicator: border-2 border-red

**Certificate Preview**:
- A4 aspect ratio container with border-4 decorative frame
- Center-aligned text with academy letterhead
- Download PDF button positioned at top-right of preview

**Complaint Tracker**:
- List view with status column (Open/In Progress/Resolved)
- Expandable rows showing conversation thread
- Reply input field with file attachment option

---

## Animations

**Minimal Usage**:
- Sidebar collapse/expand: transition-transform duration-300
- Dropdown menus: fade-in with duration-200
- Modal overlays: fade background, slide-in content (duration-300)
- Loading states: spinner animation only
- **No scroll animations, parallax, or decorative motion**

---

## Images

**No Hero Section**: This is an internal management application - start directly with dashboard content

**Image Usage**:
- Student profile photos: Circular avatars (rounded-full)
- Teacher profile photos: Circular avatars in sidebar/header
- Academy logo: Top of sidebar navigation
- Placeholder images: Use generic avatar SVGs for missing photos
- Certificate watermarks: Subtle academy logo in background

**All images must be optimized and served from CDN or local assets - never generate inline**
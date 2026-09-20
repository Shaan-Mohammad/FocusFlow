# FocusFlow

A responsive, browser-first task management workspace with a refined SaaS dashboard.

## Included

- Dashboard analytics, daily progress, upcoming work, and weekly activity
- Task creation, task details, editing, deletion confirmation, and one-click completion
- Search, status/priority/category filters, and sorting
- Today, upcoming, overdue, completed, category, settings, and Kanban board views
- Drag tasks between board columns, dark mode, keyboard shortcuts (`N`, `/`, `Esc`), and mobile navigation
- Durable local persistence via `localStorage`, including theme, profile, categories, and tasks

## Open it

Open `index.html` in a modern browser. No build step is required.

## Backend handoff

The app's state functions are intentionally centralized in `app.js`. Replacing the `localStorage` reads/writes in `save()` and startup state hydration with a typed API service is the clean insertion point for a Spring Boot + PostgreSQL backend. The UI task model already corresponds to the requested API fields (title, description, status, priority, category, due date/time, timestamps, and completion time).

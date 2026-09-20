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

## Database API

The `server/` folder now contains the FocusFlow Spring Boot API. It uses a local H2 database by default so you can start it immediately; configure `DATABASE_URL`, `DATABASE_USERNAME`, and `DATABASE_PASSWORD` to use PostgreSQL. Run it with `cd server && mvn spring-boot:run`. It exposes JWT-protected task and category endpoints plus `/api/auth/register` and `/api/auth/login`.

With the API running and the website served at `http://localhost:8000`, use **Sign in to sync** in the lower-right corner. Create an account once; FocusFlow then saves task and category changes to the database automatically. Your existing browser tasks are copied to the account on the first sign-in.

# NextGen Solutions - Premium Full-Stack Graphic Design Website

A complete full-stack website for **NextGen Solutions** with a premium creative-agency UI, animated one-page marketing website, and a secure admin dashboard.

## Stack

- Frontend: Next.js + TypeScript + Tailwind CSS + Framer Motion
- Backend: Django + Django REST Framework
- Database: PostgreSQL-ready configuration (with SQLite fallback for quick local testing)
- Auth: Session-based admin authentication with CSRF protection and password hashing
- Password reset: OTP-based forgot-password flow via email

## Core Features

### Public Website

- Premium dark-theme first design with brand accent colors from logo
- Light / dark theme toggle
- Smooth scrolling navigation
- Hero section with gradient typography and floating visual elements
- Services grid with creative cards and hover effects
- Dynamic portfolio with category filtering and modal preview
- Pricing cards with highlighted recommended plan
- Testimonials loaded dynamically from backend
- About section with animated statistics
- Contact form that saves messages to DB and triggers admin email notification
- Floating WhatsApp CTA button

### Admin Dashboard

- Secure login with session auth
- Forgot password with OTP email + password reset
- Portfolio CRUD with image upload
- Testimonial CRUD with optional profile image upload
- Contact message inbox with read/unread toggle and delete

## Project Structure

- `/backend` Django REST API + data models
- `/frontend` Next.js website + admin panel UI
- `/docker-compose.yml` PostgreSQL service

## Backend Setup (Django)

1. Create and activate a virtual environment.
2. Install dependencies:

```bash
cd /Users/sajarul/Documents/Playground/backend
pip install -r requirements.txt
```

If you want PostgreSQL mode, also install:

```bash
pip install -r requirements-postgres.txt
```

3. Create `.env` from `.env.example` and fill values.
4. Start PostgreSQL (optional via Docker):

```bash
cd /Users/sajarul/Documents/Playground
docker compose up -d postgres
```

5. Run migrations and seed initial data:

```bash
cd /Users/sajarul/Documents/Playground/backend
python manage.py migrate
python manage.py seed_initial_data
```

6. Start backend server:

```bash
python manage.py runserver 8000
```

Backend URL: `http://localhost:8000`

## Frontend Setup (Next.js)

1. Install dependencies:

```bash
cd /Users/sajarul/Documents/Playground/frontend
npm install
```

2. Create `.env.local` from `.env.local.example`.
3. Start frontend:

```bash
npm run dev
```

Frontend URL: `http://localhost:3000`

## Temporary Admin Credentials

- Username: `sksajarulhoque@gmail.com`
- Password: `sk.sajarul7`

These are created by running:

```bash
python manage.py seed_initial_data
```

## Important API Endpoints

- `GET /api/portfolio/items/`
- `GET /api/portfolio/categories/`
- `GET /api/testimonials/items/`
- `POST /api/contacts/messages/`
- `GET /api/auth/csrf/`
- `POST /api/auth/login/`
- `POST /api/auth/forgot-password/request/`
- `POST /api/auth/forgot-password/confirm/`

## Notes

- Configure SMTP in backend `.env` for real email delivery (contact notifications + OTP).
- Django admin is also available at `/admin/` for superuser-level management.
- Media uploads are served from `/media/` in development.

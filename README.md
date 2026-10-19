# Uyir Thuli Donors Network — Employee Management System

A role-aware employee management app built with React, Bootstrap 5, Django REST Framework, JWT, and MySQL.

## Project structure

```text
frontend/
├── backend/
│   ├── accounts/       # Email-based user model, roles, JWT, Django admin
│   ├── attendance/     # Daily attendance and leave requests
│   ├── employees/      # Employee profile API
│   ├── config/         # Django settings, URL routing, WSGI
│   ├── .env.example
│   ├── manage.py
│   └── requirements.txt
├── src/
│   ├── components/     # Login, dashboard shell, employee, attendance, leave views
│   ├── services/api.js # Axios JWT attachment and refresh
│   └── App.jsx         # Routes and role guards
└── ...
```

## Prerequisites

- Python 3.10 or newer
- Node.js 20.19+ (or 22.12+) and npm
- MySQL 8.x, with an empty database and a user that can create/alter tables
- On Windows, a compatible `mysqlclient` wheel or the MySQL/MariaDB C development libraries and a C compiler

## Run the backend

From the project root, create and activate a virtual environment, install dependencies, and configure the database:

```powershell
cd backend
py -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
Copy-Item .env.example .env
```

Edit `backend/.env` and set a unique `DJANGO_SECRET_KEY`, MySQL credentials, `DJANGO_DEBUG=True` for local development, and `CORS_ALLOWED_ORIGINS=http://localhost:5173`. Create the database first; for example, in MySQL:

```sql
CREATE DATABASE ems CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'ems_user'@'localhost' IDENTIFIED BY 'use-a-strong-password';
GRANT ALL PRIVILEGES ON ems.* TO 'ems_user'@'localhost';
```

Then, with the virtual environment active and `backend` as the working directory:

```powershell
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

The API is available at `http://127.0.0.1:8000/api/`; Django admin is at `http://127.0.0.1:8000/admin/`. A superuser is assigned the `Admin` role. Sign in to the frontend using that account, then add employee accounts from **Employees**. To create an HR account, add a user with the HR role in Django admin. Password-reset messages print to the backend console by default in development; set the SMTP variables in `.env` to deliver them by email.

## Run the frontend

From the project root:

```powershell
npm install
```

Optionally create `.env.local` in the project root to set the API base URL:

```text
VITE_API_URL=http://127.0.0.1:8000/api
```

Start the development server:

```powershell
npm run dev
```

Open `http://localhost:5173`. `npm run build` creates the production frontend bundle; `npm run lint` runs ESLint.

## API routes and access

All API routes below are prefixed with `/api/`. JWTs are obtained with `POST /token/` using `{ "email": "...", "password": "..." }`, and refreshed with `POST /token/refresh/` using `{ "refresh": "..." }`.

| Route | Access |
| --- | --- |
| `GET/POST /employees/`, `GET/PUT/PATCH/DELETE /employees/{id}/` | Admin and HR |
| `GET/POST /attendance/`, detail routes | Authenticated; employees see and create their own records; Admin/HR see all and can create, edit, or delete records for selected employees |
| `GET/POST /leaves/`, detail routes | Authenticated; employees see and create their own requests; Admin/HR see all and can approve, reject, edit, or delete |
| `POST /auth/password-reset/`, `POST /auth/password-reset/confirm/` | Public; reset requests use a generic response to avoid exposing registered email addresses |

Employee creation requires profile details and an initial password. Leave status defaults to `Pending`; only Admin/HR can change it. Each employee can have at most one attendance record per day.

Run the backend API tests with `python manage.py test accounts attendance --settings=config.test_settings` from the `backend` directory. These tests use an in-memory SQLite database; the application itself remains configured for MySQL.

## Production checklist

- Set `DJANGO_DEBUG=False`, a high-entropy `DJANGO_SECRET_KEY`, strict `DJANGO_ALLOWED_HOSTS`, database credentials, and exact CORS origins.
- Serve Django behind HTTPS and configure secure proxy/cookie settings for your deployment.
- Store frontend JWTs in secure, HttpOnly cookies rather than local storage for deployments with a suitable refresh-token flow; the included browser app uses local storage for a simple self-hosted setup.
- Run migrations as a deployment step and back up the MySQL database.

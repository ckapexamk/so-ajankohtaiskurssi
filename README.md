## Table of Contents
- [About](#-about)
- [Prerequisites](#prerequisites)
- [How to Install](#how-to-install)
- [Create First User](#create-first-user)
- [Testing](#testing)
- [Sqladmin](#sqladmin)
- [Troubleshooting](#troubleshooting)

## About

**Excercise progress tracking** web-app built using **React**, **FastAPI**, and **PostgreSQL** database. **Docker** compose is utilized to run these different layers as a multi-container application.

Sprint index: [docs/sprints/README.md](./docs/sprints/README.md)

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Git](https://git-scm.com/install/windows) (For cloning the repository)

## How to Install
### Initial Setup
Run the following commands from the repository root. ( ***Windows PowerShell*** )
```powershell
Copy-Item .env.example .env
docker compose up --build
```
  
### Database Setup
#### 1. Alembic migration
```powershell
docker compose exec api alembic upgrade head
```

---
#### 2. Seed demo data

To initialize the seed, run:
```powershell
docker compose exec api python -m app.db.init_db
```

### Generating JWT secret for Login
#### JWT_SECRET
Run the following command in **PowerShell** and copy the result as your JWT_SECRET in your `.env` file.
```powershell
python -c "import secrets; print(secrets.token_urlsafe(32))"
```
Afterwards run the following command to recreate the `api` to use the secret.
```powershell
docker compose up -d --force-recreate api
```

### Create First User
1. Navigate to: http://localhost:5173/register
2. Fill in your user info and press 'Submit'. You are redirected to the login page.
3. Log in with the user you just created.  
4. Logout

---
### Environmental Variables
These are located in the  root ``app/.env`` file.

| Variable                                                        | Used for                                                       |
| --------------------------------------------------------------- | -------------------------------------------------------------- |
| `API_HOST`, `API_PORT`                                          | Docker compose `api`                                           |
| `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`             | Docker compose `db`                                            |
| `DATABASE_URL`                                                  | Docker compose `db`                                            |
| `CORS_ORIGINS`                                                  | Allows cross origin for `web`                                  |
| `SQLADMIN_USERNAME`, `SQLADMIN_PASSWORD`, `SQLADMIN_SECRET_KEY` | Credentials for SQLAdmin<br>**Change these on shared devices** |
| `JWT_SECRET`, `ACCESS_TOKEN_EXPIRE_MINUTES`                     | Credentials for app-user login<br>**Not for SQLAdmin**         |

> **Use different secrets for JWT_SECRET and SQLADMIN_SECRET_KEY.**

## Testing

Currently testable URLs:

**Frontend (No authorization)**
- http://localhost:5173 — Login
- http://localhost:5173/register — create a new user
- http://localhost:5173/login — login user

**Frontend (Authorized login)**
- http://localhost:5173/ — User Dashboard
- http://localhost:5173/sessions — `GET /sessions`
- http://localhost:5173/plans — `GET /plans`
- http://localhost:5173/calendar — `GET /calendar`

**Backend**
- http://localhost:8000/docs — OpenAPI
- http://localhost:8000/admin — sqladmin
- http://localhost:8000/health — Quick healthcheck for backend

## Sqladmin
Access from: http://localhost:8000/admin

The default admin credentials are:  
> **Username:**
> admin  
> **Password:**
> admin  

If you are using the app on a shared device change these to something more secure in your .env file.

**NOTE:** JWT-secret key is NOT the same as sqladmin secret key, and can't be used to open /admin.  

## Troubleshooting

### Registering a new user
> "I can't see the registration page."
- Make sure you are using the frontend port, which is 5173 by default.
- The default path is: http://localhost:5173/register

### Ports
These are the default network **ports** used by the Docker containers.
- web: **5173**
- api: **8000**
- db:  **5432**

### Docker compose fails
Check that Docker and Docker compose are available.
```bash
docker --version
docker compose version
```

### Environment variables (.env)
If you forgot to create ``.env`` from the ``.env.example``
- Open a terminal from the project root and run:
```powershell
Copy-Item .env.example .env
```
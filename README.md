## Table of Contents
- [About](#-about)
- [Prerequisites](#prerequisites)
- [How to Install](#how-to-install)
- [How to Test](#how-to-test)
- [Create First User](#create-first-user)
- [Sqladmin](#sqladmin)
- [Troubleshooting](#troubleshooting)

## About

**Excercise progress tracking** web-app built using **React**, **FastAPI**, and **PostgreSQL** database. **Docker** compose is utilized to run these different layers as a multi-container application.

Sprint index: [docs/sprints/README.md](./docs/sprints/README.md)

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Git](https://git-scm.com/install/windows) (For cloning the repository)

## How to Install
1. Clone the repository
```powershell
git clone https://github.com/ckapexamk/so-ajankohtaiskurssi.git
cd so-ajankohtaiskurssi

cp .env.example .env
docker compose up --build
```

2. Copy the environment template, and create ``.env`` (replace the values in the .env file with your own values)
```powershell
cp .env.example .env
```

3. Build and start the project
```powershell
docker compose up --build  
```
  
## Database setup

### 1. Alembic migration
```powershell
cd backend
python -m alembic upgrade head
```

---
### 2. Seed
**app/services/seed.py**

To initialize the seed, run:
```powershell
cd backend
python -m app.db.init_db
```


---
### Environmental Variables
These are located in the  root ``app/.env`` file.

CORS_ORIGINS=http://localhost:5173, http://localhost:8000  

> Separate additional cors-urls by comma ","  

SQLADMIN_USERNAME  
SQLADMIN_PASSWORD  
SQLADMIN_SECRET_KEY  

JWT_SECRET  
ACCESS_TOKEN_EXPIRE_MINUTES

> jwt_secret is not the same as sqladmin_secret_key.  

## How to Test

Currently testable URLs:

**Frontend**
- http://localhost:5173 — Takes you to login or home depending on login status
- http://localhost:5173/register — create a new user
- http://localhost:5173/login — login user

**Backend**
- http://localhost:8000/docs — OpenAPI
- http://localhost:8000/admin — sqladmin
- http://localhost:8000/health — Quick healthcheck for backend


### Create First User
1. Navigate to: http://localhost:5173/register
2. Fill in your user info and press 'Submit'. You are redirected to the login page.
3. Log in with the user you just created.  
4. Logout

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

### User creation
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
cp .env.example .env
```
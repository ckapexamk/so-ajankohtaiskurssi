## Table of Contents
- [About](#-about)
- [Prerequisites](#prerequisites)
- [How to Install](#how-to-install)
- [How to Test](#how-to-test)
- [Troubleshooting](#troubleshooting)

## About

**Excercise progress tracking** web-app built using **React** frontend, **FastAPI**/Uvicorn backend, and **PostgreSQL** for the database. **Docker** compose is utilized to run these three layers together as a multi-container application.

***Work In Progress ...***
- ~~Doesn't do anything yet~~
- Some api routes, and a homepage placeholder.

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

2. Copy the environment template, and create ``.env``
```powershell
cp .env.example .env
```

3. Build and start the project
```powershell
docker compose up --build
```
    
## How to Test

Currently testable URLs:
- http://localhost:5173 — web/
- http://localhost:8000/docs — api/docs
- http://localhost:8000/health — api/health

---

When done testing, you can stop the app with:
```powershell
docker compose down
```

## Troubleshooting

### Ports
These are the network **ports** used by the Docker containers. Make sure they are not already in use.
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
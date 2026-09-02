# Excercise Progress Tracker

Excercise tracking web-app that uses React frontend, FastAPI/Uvicorn backend, and PostgreSQL for the database.
Docker compose is utilized to run the three layers together as a multi-container application.

## How to test
1. open terminal
2. `cp .env.example .env` copies environment file template
    - fill in your own environment variables in **.env**
3. `docker compose up --build` builds and starts containers
4. `docker compose ps` tests if containers are up
5. `docker compose down` stops containers

### Ports used
- API: 8000
- DB:  5432
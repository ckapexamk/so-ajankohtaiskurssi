# Sprint 1 report — Foundation

Copy this file to `docs/reports/sprint-01.md` in **your** repo and fill the blanks. Keep it a process log: no pasted source, no secrets, no `.env` values.

| Field        | Your answer |
| ------------ | ----------- |
| **Dates**    | 4.9.2026            |
| **Names**    | **ckapexamk** Kalle P.      |
| **Repo URL** | https://github.com/ckapexamk/so-ajankohtaiskurssi.git            |
| **Branch**   | sprint-01/compose-api             |

Tickets: [sprint-01-tickets.md](../tickets/sprint-01-tickets.md) · Index: [../README.md](../README.md)

## Sprint goal

From the tickets: ship a runnable skeleton so later sprints can focus on features. You are done when Compose starts `db`, `api`, and `web`; `GET /health` returns JSON; the frontend opens; the README covers clone → `.env` → Compose → URLs.

In your words (2–3 sentences): did you meet that, and what is still rough?

> The skeleton is running as per the basic requirements, at least if my own testing is to be trusted. Works on my machine.
> I didn't add a frontend UI component library yet for React, so that's what is observably rough at the moment.

## Tickets

For **each** ticket fill **Status** and **PR / commit**.

Fill **Demonstration** only where this template includes that section. Follow the numbered steps exactly. Store images under `docs/reports/images/sprint-01/` using the suggested filename. Crop secrets.

For **every** ticket: set **Used AI?** to `Yes` or `No`. Write the sprint-level **AI usage** reflection at the end of this report (not under each ticket).

Skip stretch tickets you did not do. Stretch: Status, PR, and Used AI? for each stretch you did; add a Demonstration only where listed below.

### S1-01 — Create monorepo layout and root `.gitignore` (Must)

- **Status:** Done
- **PR / commit:** 5c704b0
- **Used AI?** Yes

### S1-02 — FastAPI app skeleton (Must)

- **Status:** Done
- **PR / commit:** 4bb5e3b
- **Demonstration:**
  1. **Do this:** From `backend/`, start Uvicorn (`uvicorn app.main:app --reload` or your documented command). Open `http://localhost:8000/docs` in a browser.
  2. **Capture:** Screenshot of the OpenAPI / Swagger UI page.
  3. **Must show:** The `/docs` page loaded (title or Swagger chrome visible) and that the API is reachable (page is not a connection error).
  4. **Must not show:** `.env` contents, database passwords, or unrelated desktop clutter with secrets.
  5. **Save as:** `docs/reports/images/sprint-01/s1-02-docs.png`
  6. **Caption (1–2 sentences):**

  > Screenshot of vscode browser to the url: localhost:8000/docs 
- **Used AI?** Yes

### S1-03 — Health endpoint (Must)

- **Status:** Done
- **PR / commit:** 38595d9
- **Demonstration:**
  1. **Do this:** With the API running, open `http://localhost:8000/health` in the browser, or use Try it out on `GET /health` in `/docs`.
  2. **Capture:** Screenshot of the JSON response (browser or `/docs` response panel).
  3. **Must show:** HTTP success and a JSON body for `/health` (fields as in your ticket acceptance criteria, for example status).
  4. **Must not show:** Stack traces, env dumps, or secrets.
  5. **Save as:** `docs/reports/images/sprint-01/s1-03-health.png`
  6. **Caption (1–2 sentences):**

  > Screenshot of vscode browser to the url: http://localhost:8000/docs#/health
- **Used AI?** Yes

### S1-04 — Python dependencies (Must)

- **Status:** Done
- **PR / commit:** 9920192
- **Used AI?** Yes

### S1-06 — Env example and settings (Must)

- **Status:** Done
- **PR / commit:** 6c5c18a
- **Used AI?** Yes

### S1-07 — Docker Compose for db and api (Must)

- **Status:** Done
- **PR / commit:** 2383968
- **Demonstration:**
  1. **Do this:** From the repo root, run `docker compose up --build` (or your documented equivalent). Wait until services settle. Run `docker compose ps` (or show the Docker Desktop containers view).
  2. **Capture:** Screenshot of the terminal `ps` output or Docker UI listing services.
  3. **Must show:** Both `db` and `api` listed as running / healthy (or equivalent status for your Compose file).
  4. **Must not show:** Full `.env` values, Postgres passwords in clear text, or cloud credentials.
  5. **Save as:** `docs/reports/images/sprint-01/s1-07-compose-db-api.png`
  6. **Caption (1–2 sentences):**

  > Docker Desktop containers view showing both db and api are up and running.
- **Used AI?** Yes

### S1-08 — API reaches Postgres (Must)

- **Status:** Done
- **PR / commit:** a89b07e
- **Demonstration:**
  1. **Do this:** With Compose up, open API logs (`docker compose logs api`) and/or hit a healthcheck that talks to Postgres if you already have one. Confirm the connection string host inside Compose is the service name `db`, not `localhost`.
  2. **Capture:** Screenshot of logs or health output that proves the API reached Postgres.
  3. **Must show:** Evidence the API talks to host `db` (successful connect message, healthcheck pass, or equivalent)—not a connection refused to the wrong host.
  4. **Must not show:** Full `DATABASE_URL` with real passwords; redact credentials.
  5. **Save as:** `docs/reports/images/sprint-01/s1-08-api-db.png`
  6. **Caption (1–2 sentences):**

  > ``docker compose logs api``, showing GET /health succeeding.
  > ``docker compose ps``, shows db as (healthy)
  > The db_url in .env is set up as, DATABASE_URL=postgresql://app_user:local_password@db:5432/app_db
- **Used AI?** Yes

### S1-09 — Vite React TypeScript scaffold (Must)

- **Status:** Done
- **PR / commit:** c6dd44d
- **Demonstration:**
  1. **Do this:** Start the frontend (`npm run dev` in `frontend/` or via Compose if `web` already exists). Open the printed localhost URL in a browser.
  2. **Capture:** Screenshot of the browser showing the default Vite/React app shell.
  3. **Must show:** Browser address bar with the frontend URL and the running React/Vite page (not a blank error page).
  4. **Must not show:** API tokens or `.env` panels.
  5. **Save as:** `docs/reports/images/sprint-01/s1-09-frontend.png`
  6. **Caption (1–2 sentences):**

  > I had replaced the vite default view before starting this report. This shows the sprint placeholder with api down.
- **Used AI?** No

### S1-10 — Router and placeholder home (Must)

- **Status:** Done
- **PR / commit:** cc6865d
- **Demonstration:**
  1. **Do this:** With the frontend running, open the home route (usually `/`). Confirm your placeholder home content is what appears (not only the stock Vite counter if you replaced it).
  2. **Capture:** Screenshot of the home page including the URL bar.
  3. **Must show:** Placeholder home content and the route URL.
  4. **Must not show:** Secrets or unrelated authenticated data (none expected yet).
  5. **Save as:** `docs/reports/images/sprint-01/s1-10-home.png`
  6. **Caption (1–2 sentences):**

  > HomePage opening in URL: localhost:5173/
- **Used AI?** No

### S1-11 — API base URL and health indicator (Should)

- **Status:** Done
- **PR / commit:** 096e2b5
- **Demonstration:** (only if you did this ticket)
  1. **Do this:** Open the home page with API and frontend running. Trigger or wait for the health fetch so the UI shows API status (and/or the configured base URL if you display it).
  2. **Capture:** Screenshot of the home page after the health indicator updates.
  3. **Must show:** Visible API health status (healthy/unhealthy or equivalent) on the home page; include the base URL on screen if your UI shows it.
  4. **Must not show:** Bearer tokens or `.env` files.
  5. **Save as:** `docs/reports/images/sprint-01/s1-11-health-ui.png`
  6. **Caption (1–2 sentences):**

  > HomePage with the API health indicator, showing: OK.
- **Used AI?** No

### S1-12 — Web service in Compose (Must)

- **Status:** Done
- **PR / commit:** 2b42ae3
- **Demonstration:**
  1. **Do this:** Run `docker compose up --build` so `db`, `api`, and `web` start. Open the frontend URL published by Compose (see your README / `.env` ports, often `http://localhost:5173`).
  2. **Capture:** One screenshot of `docker compose ps` (or Docker UI) showing all three services, and one of the frontend loaded from that URL—or a single collage if both fit.
  3. **Must show:** `db`, `api`, and `web` running; browser showing the frontend from the Compose-published URL.
  4. **Must not show:** Secrets from env files in the terminal scrollback.
  5. **Save as:** `docs/reports/images/sprint-01/s1-12-compose-web.png`
  6. **Caption (1–2 sentences):**

  > Frontend homepage opened up while docker compose is running. 
  > ``docker compose ps``, showing web + api + db running at the same time.
- **Used AI?** Yes

### S1-13 — Root README (Must)

- **Status:** Done
- **PR / commit:** 7e9c896
- **Demonstration:**
  1. **Do this:** Open the root `README.md` in the editor or on your Git host.
  2. **Capture:** Screenshot of the section that covers prerequisites, `.env`, Compose, and the URL / demo-path table.
  3. **Must show:** Clone → `.env` → Compose (or equivalent) steps and a table or list of service URLs a classmate can follow.
  4. **Must not show:** Real passwords committed in the README.
  5. **Save as:** `docs/reports/images/sprint-01/s1-13-readme.png`
  6. **Caption (1–2 sentences):**

  > Sections for prerequisites, installation, and URL-paths shown on readme.
- **Used AI?** No

### Stretch (only if you did them)

For each stretch below that you completed: Status, PR / commit, Used AI? Add Demonstration only where steps are listed.

#### S1-S1 — DB-aware health (if done)

- **Status:**
- **PR / commit:**
- **Demonstration:**
  1. **Do this:** With Compose up and Postgres reachable, open `http://localhost:8000/health/db` (or your documented path).
  2. **Capture:** Screenshot of the JSON response.
  3. **Must show:** Successful JSON indicating DB connectivity (not only process liveness).
  4. **Must not show:** Connection strings with passwords.
  5. **Save as:** `docs/reports/images/sprint-01/s1-s1-health-db.png`
  6. **Caption (1–2 sentences):**
- **Used AI?** Yes / No

#### S1-S2 — Multi-stage API image (if done)

- **Status:**
- **PR / commit:**
- **Used AI?** Yes / No

#### S1-S3 — Smoke CI (if done)

- **Status:**
- **PR / commit:**
- **Demonstration:**
  1. **Do this:** Open the CI run on your Git host for the workflow that smoke-tests the API (or installs and runs a documented check).
  2. **Capture:** Screenshot of a green / successful job.
  3. **Must show:** Workflow name and success status for the smoke job.
  4. **Must not show:** Secrets in logs.
  5. **Save as:** `docs/reports/images/sprint-01/s1-s3-ci.png`
  6. **Caption (1–2 sentences):**
- **Used AI?** Yes / No

## How we(I) worked

Sprint 1 is **two weeks**.

- **Week 1** (backend shell & Compose):

> I tried to follow the sprint instructions as closely as I could.

- **Week 2** (frontend shell & README):

> Same as week 1. As I'm writing this report, I feel that I should've filled this gradually as I completed tickets, so the specific ticket documentation would be more accurate to the moment they were completed at.

- Who did what:

> I did the assignment independently.

- One blocker and how you unblocked it:

> Pydantic-settings, and understanding what I was doing took the most time I guess. Figuring out which settings were required and which weren't for this specific project took some time, as the online sources rarely explain their code examples line by line.
> I often ask AI to clarify specific things the documentation misses, or thinks is self-explanatory.

## Decisions

Two to four technical choices with why (for example Vite in Compose vs build + nginx).

> 1. Overall I went with options that were the easiest to test with, and left options available for later.
> 2. I chose to use Pydantic-settings because initially it seemed better in the long term.

## What we learned

Note what you actually used. Tools this sprint: Git / monorepo, Python venv + `requirements.txt`, FastAPI + Uvicorn, OpenAPI (`/docs`), Pydantic / pydantic-settings, PostgreSQL, Docker Compose, React + TypeScript + Vite, React Router, `.env` / `.env.example`.

- What clicked:
  > The docker compose workflow became more clear.
  > The default tools chosen seemed to fit together as expected.
  > Having used Express before for api functionality, I found FastAPI much more simple to get up and running, and it seemed there was less need for middleware.

- One thing you would do differently:
  > I'm still ignorant on the subject, so I don't really have an opinion on alternatives.

## Carry-over

Deferred Must/Should, stretch leftovers, risks for [Sprint 2 tickets](../tickets/sprint-02-tickets.md) (auth, catalog, SQLAdmin).

> The optional Stretch leftovers might make testing easier/better later on, so I might have to implement their features in future tickets.  

## AI usage (sprint-level reflection)

Mark **Used AI?** under each ticket above (`Yes` / `No`). Do **not** write per-ticket reflections there.

Here, cover your **overall** AI use during this sprint (Cursor, ChatGPT, Copilot, local coding assistants, etc.). Product Insights via Ollama in Sprint 5 does **not** count unless you also used an AI assistant to write code.

If you marked **No** on every ticket, write a short note that you did not use AI coding assistants this sprint (you may still answer verification / independence questions briefly).

- **Where AI helped most this sprint** (themes, ticket IDs, or areas—not a ticket-by-ticket dump):
- **What I typically accepted from AI suggestions:**
- **What I typically rejected or reworked, and why:**
- **How I verified AI-assisted work** (tests, `/docs`, manual demos, reviews):
- **What I can now explain or do independently** that I relied on AI for earlier:
- **Anything I would do differently with AI next sprint:**

Do not paste secrets, full JWTs, or `.env` values.

> - Most help I got from using AI was in getting a more accurate understanding of what I was doing, for example asking about the ticket objectives if they seemed unclear to me, as they often did on the newer topics. I sometimes verify from AI if my own written code is meant to do what I think it does. I basically use AI as a faster/better search to save time and effort.
> - I check mentally if I understand what the AI is suggesting, and prompt for clarifications on fluff that the AI usually adds to the suggestions.
> - I don't accept suggestions that look like something I would not be able to create myself at my skill level. I try to remove unnecessary code from code examples, and also format it in a way I would do them.
> - The testing that was included in the tickets felt sufficient, as I didn't let the AI really do any work.
> - I think I could manage the Docker compose workflow now independetly, or understand the elements it needs to function in the way we use it on this course (compose.yml, Dockerfile, .env).
> - Next sprint I'll try to improve my prompts such that the results contain less unnecessary suggestions.

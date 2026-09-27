# Sprint 2 report — Auth, catalog, SQLAdmin

Copy this file to `docs/reports/sprint-02.md` in **your** repo and fill the blanks. Keep it a process log: no pasted source, no secrets, no `.env` values.

| Field        | Your answer |
| ------------ | ----------- |
| **Dates**    | 27.9.2026   |
| **Names**    | **ckapexamk** Kalle P. |
| **Repo URL** | https://github.com/ckapexamk/so-ajankohtaiskurssi.git |
| **Branch**   | sprint-02/auth-database |

Tickets: [sprint-02-tickets.md](../tickets/sprint-02-tickets.md) · Index: [../README.md](../README.md)

## Sprint goal

From the tickets: add identity, schema (including the unit catalog), SQLAdmin, and JWT auth so sessions can belong to real users next sprint. You are done when migrations and seed work; `/admin` shows units, activities, and links; register / login / `/auth/me` work with bcrypt + JWT; the UI can register, log in, and show a profile.

In your words (2–3 sentences): did you meet that, and what is still rough?

> Sprint goals were accomplished.

## Tickets

For **each** ticket fill **Status** and **PR / commit**.

Fill **Demonstration** only where this template includes that section. Follow the numbered steps exactly. Store images under `docs/reports/images/sprint-02/` using the suggested filename. Crop secrets, password hashes, and full JWTs.

For **every** ticket: set **Used AI?** to `Yes` or `No`. Write the sprint-level **AI usage** reflection at the end of this report (not under each ticket).

Skip stretch tickets you did not do. Stretch: Status, PR, and Used AI? for each stretch you did; add a Demonstration only where listed below.

### S2-01 — SQLAlchemy engine, session, and Base (Must)

- **Status:** Done
- **PR / commit:** 42ebd45
- **Used AI?** Yes

### S2-02 — User model (Must)

- **Status:** Done
- **PR / commit:** 978d62e
- **Demonstration:**
  1. **Do this:** Prefer `/admin` after env-based SQLAdmin login showing the Users (or `user`) table. If `/admin` is not ready yet, show the Alembic migration file (or `alembic history`) listing the `user` table create.
  2. **Capture:** Screenshot of `/admin` Users list or the migration/editor view of the `user` table.
  3. **Must show:** Proof a `user` (or Users) table exists in the schema or admin UI.
  4. **Must not show:** Password hashes, SQLAdmin password fields filled in, or JWT tokens.
  5. **Save as:** `docs/reports/images/sprint-02/s2-02-user.png`
  6. **Caption (1–2 sentences):**
  
  > Image from /admin showing the User table.
- **Used AI?** Yes

### S2-03 — ActivityType model (Must)

- **Status:** Done
- **PR / commit:** fb3a32c
- **Demonstration:**
  1. **Do this:** Open `/admin` activity types view, or show activity types in `/docs` if you already expose a list endpoint.
  2. **Capture:** Screenshot of activity types listed.
  3. **Must show:** At least one activity type row (name/slug visible) in `/admin` or `/docs`.
  4. **Must not show:** Secrets or unrelated user password data.
  5. **Save as:** `docs/reports/images/sprint-02/s2-03-activity-types.png`
  6. **Caption (1–2 sentences):**

  > Image from /admin showing the Activity Types table.
- **Used AI?** Yes

### S2-04 — UnitType model and activity links (Must)

- **Status:** Done
- **PR / commit:** f5635cd
- **Demonstration:**
  1. **Do this:** In `/admin`, open unit types and the activity↔unit link (or activity detail) so Running → duration + distance (or your equivalent pair) is visible.
  2. **Capture:** Screenshot showing Running (or one activity) linked to at least two unit types such as duration and distance.
  3. **Must show:** The M:N link clearly (activity + allowed units), not only an empty units list.
  4. **Must not show:** SQLAdmin credentials in the shot.
  5. **Save as:** `docs/reports/images/sprint-02/s2-04-unit-links.png`
  6. **Caption (1–2 sentences):**

  > Image from /admin showing Face Pulls linking to two unit types 'Repetitions' and 'Weight'.
- **Used AI?** Yes

### S2-05 — Alembic setup and initial migration (Must)

- **Status:** Done
- **PR / commit:** 6fcf028
- **Demonstration:**
  1. **Do this:** Either (a) show `alembic upgrade head` succeeding in the terminal, (b) open the initial migration file in the editor, or (c) after a fresh Compose migrate, show tables present in `/admin` or `psql` `\dt`.
  2. **Capture:** Screenshot of one of those proofs.
  3. **Must show:** Migration tooling in use and schema applied (command success, migration file, or tables after upgrade).
  4. **Must not show:** Database passwords in the command line history.
  5. **Save as:** `docs/reports/images/sprint-02/s2-05-alembic.png`
  6. **Caption (1–2 sentences):**

  > Image showing result of ``docker compose exec db psql -U ${POSTGRES_USER} -d ${POSTGRES_DB} -c "\dt"`` before and after migration.
- **Used AI?** Yes

### S2-06 — Seed system catalog (Must)

- **Status:** Done
- **PR / commit:** 7cfa87a
- **Demonstration:**
  1. **Do this:** After seed runs (startup or documented command), open `/admin` and browse unit types and activity types (and links if shown).
  2. **Capture:** Screenshot of seeded units and activities (enough rows to prove the catalog, for example six activities and four units).
  3. **Must show:** Seeded catalog data present—not empty tables after seed.
  4. **Must not show:** Admin password typed into a form in clear text if avoidable.
  5. **Save as:** `docs/reports/images/sprint-02/s2-06-seed.png`
  6. **Caption (1–2 sentences):**

  > Image from /admin showing 4 units and 6 activity types.
- **Used AI?** Yes

### S2-07 — SQLAdmin UI for Postgres (Must)

- **Status:** Done
- **PR / commit:** 591d33e
- **Demonstration:**
  1. **Do this:** Open `http://localhost:8000/admin` (or your documented URL). Log in with **SQLAdmin env credentials** (not the app JWT Login page). Land on the admin home or a model list.
  2. **Capture:** Screenshot of `/admin` after successful env login.
  3. **Must show:** SQLAdmin UI loaded and authenticated; URL includes `/admin`.
  4. **Must not show:** The password you typed; crop the login form after submit if the password field is still visible. Do not show JWT Bearer tokens—this login is separate from app auth.
  5. **Save as:** `docs/reports/images/sprint-02/s2-07-admin.png`
  6. **Caption (1–2 sentences):**

  > Image after logging in to sqladmin.
- **Used AI?** Yes

### S2-08 — Password hashing helpers (Must)

- **Status:** Done
- **PR / commit:** 7fe7308
- **Used AI?** Yes

### S2-09 — JWT helpers and current user (Must)

- **Status:** Done
- **PR / commit:** 54a90af
- **Used AI?** Yes

### S2-10 — Register endpoint (Must)

- **Status:** Done
- **PR / commit:** 181d480
- **Demonstration:**
  1. **Do this:** In `/docs`, run `POST /auth/register` with a new email and password. Confirm HTTP 201 (or your documented success).
  2. **Capture:** Screenshot of the `/docs` request/response for register.
  3. **Must show:** Successful register response (201) and that a user was created (response body without password).
  4. **Must not show:** The password value in the request body—crop or blank it before saving.
  5. **Save as:** `docs/reports/images/sprint-02/s2-10-register.png`
  6. **Caption (1–2 sentences):**

  > Image from openapi showing successful register response.
- **Used AI?** Yes

### S2-11 — Login endpoint (Must)

- **Status:** Done
- **PR / commit:** 6993346
- **Demonstration:**
  1. **Do this:** In `/docs`, run `POST /auth/login` with a valid user. Confirm a token field is present in the response.
  2. **Capture:** Screenshot showing login succeeded and a token **key** exists.
  3. **Must show:** Successful login and evidence a token was returned (you may blur/crop the token **value**).
  4. **Must not show:** The full JWT string pasted into the report or left readable in the image. Never paste the token into the Markdown.
  5. **Save as:** `docs/reports/images/sprint-02/s2-11-login.png`
  6. **Caption (1–2 sentences):**

  > Image from openapi showing successful login response.
- **Used AI?** Yes

### S2-12 — Me endpoint (Must)

- **Status:** Done
- **PR / commit:** b9f3826
- **Demonstration:**
  1. **Do this:** In `/docs`, authorize with a valid Bearer token (Authorize button). Call `GET /auth/me`. Confirm 200 and your user profile fields.
  2. **Capture:** Screenshot of `/auth/me` response.
  3. **Must show:** 200 response with the current user (for example email/id)—proving the token was accepted.
  4. **Must not show:** The Authorize dialog with a full token visible; crop tokens.
  5. **Save as:** `docs/reports/images/sprint-02/s2-12-me.png`
  6. **Caption (1–2 sentences):**

  > Image from openapi showing response from /auth/me after authorizing.
- **Used AI?** Yes

### S2-13 — CORS lockdown (Must)

- **Status:** Done
- **PR / commit:** 54a765d
- **Demonstration:**
  1. **Do this:** From the frontend origin, trigger an API call (for example health or `/auth/me`). Open DevTools → Network. Select the API request and open Headers.
  2. **Capture:** Screenshot of the request/response headers showing the allowed origin behavior for your SPA origin.
  3. **Must show:** The frontend origin and that the API response allows it (for example `Access-Control-Allow-Origin` matching your Vite origin, or a successful cross-origin call from that origin).
  4. **Must not show:** Authorization Bearer values—collapse or crop that header.
  5. **Save as:** `docs/reports/images/sprint-02/s2-13-cors.png`
  6. **Caption (1–2 sentences):**

  > Image from DevTools Headers-tab showing cross-origin restrictions.
- **Used AI?** Yes

### S2-14 — Register page (Must)

- **Status:** Done
- **PR / commit:** 9fc1377
- **Demonstration:**
  1. **Do this:** Open the Register page in the SPA. Optionally submit once with a test user, then crop any password fields.
  2. **Capture:** Screenshot of the Register UI.
  3. **Must show:** Register form (email/password fields visible as UI chrome, not filled secrets).
  4. **Must not show:** Typed passwords or confirmation codes.
  5. **Save as:** `docs/reports/images/sprint-02/s2-14-register-ui.png`
  6. **Caption (1–2 sentences):**
  
  > Image of the registration page in vscode browser.
- **Used AI?** Yes

### S2-15 — Login page and token storage (Must)

- **Status:** Done
- **PR / commit:** 9ae68a7
- **Demonstration:**
  1. **Do this:** Open the Login page. Log in successfully so the app stores the JWT in `localStorage` (do not open Application → Local Storage for the screenshot if the token value is visible).
  2. **Capture:** Screenshot of the Login UI (before or after login, without exposing the token value).
  3. **Must show:** Login page UI for the SPA.
  4. **Must not show:** `localStorage` panel with a readable JWT, or password fields filled in.
  5. **Save as:** `docs/reports/images/sprint-02/s2-15-login-ui.png`
  6. **Caption (1–2 sentences):**

  > Image of the login page in vscode browser.
- **Used AI?** Yes

### S2-16 — Protected layout (Must)

- **Status:** Done
- **PR / commit:** 2dd41f8
- **Demonstration:**
  1. **Do this:** While logged out, open a gated route (for example Dashboard or Settings). Confirm you are redirected or blocked. Then log in and open the same route; confirm the protected layout appears.
  2. **Capture:** Two screenshots (logged-out bounce + logged-in layout) or one collage.
  3. **Must show:** Logged-out user cannot stay on the gated page; logged-in user sees the protected shell.
  4. **Must not show:** Tokens in the URL or DevTools.
  5. **Save as:** `docs/reports/images/sprint-02/s2-16-protected.png`
  6. **Caption (1–2 sentences):**

  > Images showing logged out user and logged in user navigating to the same protected route.
- **Used AI?** Yes

### S2-17 — User display and logout (Must)

- **Status:** Done
- **PR / commit:** 1fd2631
- **Demonstration:**
  1. **Do this:** While logged in, show the header or Settings with the current user identity. Then log out and show the post-logout state (login page or cleared header).
  2. **Capture:** Two screenshots (before and after logout).
  3. **Must show:** User identity visible when logged in; after logout the user is gone from the chrome and protected content is inaccessible.
  4. **Must not show:** Tokens or password fields.
  5. **Save as:** `docs/reports/images/sprint-02/s2-17-logout.png`
  6. **Caption (1–2 sentences):**

  > Images showing logged in user and the post logout state.
- **Used AI?** Yes

### S2-18 — Auth + SQLAdmin README notes (Should)

- **Status:** Done
- **PR / commit:** 70874d0
- **Demonstration:**
  1. **Do this:** Open the README section that documents auth (register/login) and `/admin` (env credentials, separate from JWT).
  2. **Capture:** Screenshot of that README section.
  3. **Must show:** Auth and SQLAdmin documented (URLs / purpose; placeholder credentials only if they match `.env.example`, not production secrets).
  4. **Must not show:** Real production passwords.
  5. **Save as:** `docs/reports/images/sprint-02/s2-18-readme.png`
  6. **Caption (1–2 sentences):**

  > Image showing the section of the readme, where creating new user profiles and sqladmin credentials.
  > The sqladmin secret key is mentioned earlier on section about environment variables.
- **Used AI?** No

## How we worked

Sprint 2 is **three weeks**.

- **Week 1** (schema, seed, SQLAdmin):
> I spent a weekend on these.

- **Week 2** (bcrypt, JWT, CORS):
> This phase was timed for the start of the following week.

- **Week 3** (Login/Register UI, `localStorage`, gated layout):
> These were timed for the rest of the week.

- Who did what:
> I did the whole sprint by myself.

- One blocker and how you unblocked it:
> I tried to add tailwind and shadcn at some point but couldn't get the imports working correctly.
> Afterwards I uninstalled them from the project. I'm going to troubleshoot the problems when these become more relevant.

## Decisions

Two to four technical choices with why (for example JWT library, CORS origin, what you store in `localStorage`).

1. I ended up using UUIDs in the db models because I thought that would be closer to how they would be done in real production. Integer's might've been a clearer option for debugging and learning.
2. I went with bcrypt without passlib because of passlib not supporting the newer bcrypt versions without downgrading.
3. PyJWT I chose because chatgpt thought it was a simpler or more straightforward option for this project.

## What we learned

Note what you actually used. Tools this sprint: SQLAlchemy, Alembic, psycopg, SQLAdmin, bcrypt (or passlib), JWT, FastAPI security (`HTTPBearer`), CORSMiddleware, `localStorage`.

- What clicked:
>All of the tools used for this sprint were new to me. Sqlalchemy caused the most headache I think, beacuse though their documentation was rich and described many concepts, it was hard to decide which parts of the information provided were relevant as a learner. I'm now better prepared to use sqlalchemy; at least the ORM parts.  
> I guess the main thing that I've learned is what all these tools are used for, and how they all connect together.

- One thing you would do differently:
> For a completely new project in the future, I might choose sqlmodel instead for learning purposes.
> I would have to review what techniques are best practices for authorization and security, since I've read/seen videos where people explain how JWT's are not secure enough anymore. 

## Carry-over

Deferred Must/Should, stretch leftovers, risks for [Sprint 3 tickets](../tickets/sprint-03-tickets.md) (sessions, planned/actual, clone, plans via `plan_id`, calendar, ownership).

> I did not do any of the stretch-tickets again, and will need to check later if those should be included before I start Sprint 3.

## AI usage (sprint-level reflection)

Mark **Used AI?** under each ticket above (`Yes` / `No`). Do **not** write per-ticket reflections there.

Here, cover your **overall** AI use during this sprint (Cursor, ChatGPT, Copilot, local coding assistants, etc.). Product Insights via Ollama in Sprint 5 does **not** count unless you also used an AI assistant to write code.

If you marked **No** on every ticket, write a short note that you did not use AI coding assistants this sprint (you may still answer verification / independence questions briefly).

- **Where AI helped most this sprint** (themes, ticket IDs, or areas—not a ticket-by-ticket dump):

> I use AI to clarify the ticket requirements, and explain new concepts that I are unable to connect to previous knowledge.

- **What I typically accepted from AI suggestions:**

> I only accept code solutions that I can read and understand what they do.

- **What I typically rejected or reworked, and why:**

> AI offered couple of times solutions that seemed overtly complex for the situation. I do often remove what I observe as unnecessary from the AI results, or ask it why some things are relevant.

- **How I verified AI-assisted work** (tests, `/docs`, manual demos, reviews):

> Just the basic testing included in the ticket instructions.
> I haven't seen the need for additional testing yet.

- **What I can now explain or do independently** that I relied on AI for earlier:

> I've gotten more familiar with Python syntax again, so I don't need as much help with that anymore.
> I know the concepts/tools used on this sprint at a surface level so that I am able to seek information from official documentation.

- **Anything I would do differently with AI next sprint:**

> Nothing specific comes to mind. I could emphasize even more in my prompts that I am doing things in a learning context, which might give me explanations straight up without further prompting.

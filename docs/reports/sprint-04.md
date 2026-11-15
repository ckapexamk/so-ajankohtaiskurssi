# Sprint 4 report — Analytics & progress

Copy this file to `docs/reports/sprint-04.md` in **your** repo and fill the blanks. Keep it a process log: no pasted source, no secrets, no `.env` values.

| Field        | Your answer |
| ------------ | ----------- |
| **Dates**    | 15.11.2026   |
| **Names**    | **ckapexamk** Kalle P. |
| **Repo URL** | https://github.com/ckapexamk/so-ajankohtaiskurssi.git |
| **Branch**   | sprint-04/analytics |

Tickets: [sprint-04-tickets.md](../tickets/sprint-04-tickets.md) · Index: [../README.md](../README.md)

## Sprint goal

From the tickets: turn stored sessions into stats and charts you can explain. You are done when stats endpoints match known fixtures; analytics unit tests pass without the full UI; Progress shows sessions over time and distance/intensity by activity; Dashboard period widgets match the API.

In your words (2–3 sentences): did you meet that, and what is still rough?

> Everything mentioned in the goal has been implemented in the ways they were described in the tickets.  
> So as per the ticket requirements, there are no volume statistics for other than duration and distance.  
> Average intensity as a generic statistic is available for all activity types.  

## Tickets

For **each** ticket fill **Status** and **PR / commit**.

Fill **Demonstration** only where this template includes that section. Follow the numbered steps exactly. Store images under `docs/reports/images/sprint-04/` using the suggested filename. Crop tokens.

For **every** ticket: set **Used AI?** to `Yes` or `No`. Write the sprint-level **AI usage** reflection at the end of this report (not under each ticket).

Skip stretch tickets you did not do. Stretch: Status, PR, and Used AI? for each stretch you did; add a Demonstration only where listed below.

### S4-01 — Analytics module skeleton (Must)

- **Status:** Done
- **PR / commit:** d2e40cf
- **Used AI?** Yes

### S4-02 — Summary metrics (Must)

- **Status:** Done
- **PR / commit:** 490f568
- **Used AI?** Yes

### S4-03 — Progress time series (Must)

- **Status:** Done
- **PR / commit:** cf20449
- **Used AI?** Yes

### S4-04 — Streak metrics (Must)

- **Status:** Done
- **PR / commit:** 2dd4dd0
- **Used AI?** Yes

### S4-05 — Analytics unit tests (Must)

- **Status:** Done
- **PR / commit:** 7136b07
- **Demonstration:**
  1. **Do this:** From the documented working directory, run `pytest` for the analytics unit tests (pure Python—no UI required).
  2. **Capture:** Terminal screenshot of the test run.
  3. **Must show:** Analytics-related tests **passed** (summary / progress / streaks coverage as in your tickets).
  4. **Must not show:** Secrets in the environment dump.
  5. **Save as:** `docs/reports/images/sprint-04/s4-05-pytest.png`
  6. **Caption (1–2 sentences):** Terminal after running the command from backend:`python -m pytest tests/test_analytics.py`.

- **Used AI?** Yes

### S4-06 — Stats summary endpoint (Must)

- **Status:** Done
- **PR / commit:** 8942860
- **Demonstration:**
  1. **Do this:** Authorize in `/docs`. Call `GET /stats/summary` for a **known** period where you already know expected totals from fixtures or seeded sessions.
  2. **Capture:** Screenshot of the `/docs` response JSON.
  3. **Must show:** Successful summary response for that period (counts/totals visible).
  4. **Must not show:** Full JWT; crop Authorize.
  5. **Save as:** `docs/reports/images/sprint-04/s4-06-summary.png`
  6. **Caption (1–2 sentences):** I added a month from the start of the week this report has been made as time range.
- **Used AI?** Yes

### S4-07 — Stats progress endpoint (Must)

- **Status:** Done
- **PR / commit:** 25a5a99
- **Demonstration:**
  1. **Do this:** In `/docs`, call `GET /stats/progress` with period/granularity params you support.
  2. **Capture:** Screenshot of the time-series (or bucketed) JSON response.
  3. **Must show:** Progress payload with series/points for the authenticated user.
  4. **Must not show:** Tokens.
  5. **Save as:** `docs/reports/images/sprint-04/s4-07-progress-api.png`
  6. **Caption (1–2 sentences):** I used `sessions` as a metric` and `week` as granularity, which returns the number of sessions count per week.
- **Used AI?** Yes

### S4-08 — Stats streaks endpoint (Must)

- **Status:** Done
- **PR / commit:** a50dc37
- **Demonstration:**
  1. **Do this:** In `/docs`, call `GET /stats/streaks`.
  2. **Capture:** Screenshot of the streaks JSON.
  3. **Must show:** Streak metrics returned for the authenticated user (document whether null `session_at` rows are excluded).
  4. **Must not show:** Tokens.
  5. **Save as:** `docs/reports/images/sprint-04/s4-08-streaks.png`
  6. **Caption (1–2 sentences):** GET /stats/streaks returning current and longest streak. Null `session_at` rows are excluded.
- **Used AI?** Yes

### S4-09 — User-scoped stats queries (Must)

- **Status:** Done
- **PR / commit:** 53a8265
- **Demonstration:**
  1. **Do this:** As User A, call a stats endpoint and note totals. As User B (different account with different sessions), call the same endpoint. Confirm User A’s response does **not** include User B’s sessions (and vice versa).
  2. **Capture:** Two screenshots (A and B) or one collage; emails only in the caption.
  3. **Must show:** Aggregate IDOR prevented—User B’s data absent from User A’s stats.
  4. **Must not show:** Tokens or passwords.
  5. **Save as:** `docs/reports/images/sprint-04/s4-09-scoped-stats.png`
  6. **Caption (1–2 sentences):** I called the stats for User B with the same date range as in `s4-06-summary.png`. Barbell curl and Hammer curl are included in the same session, which explainst the session_count being 3.
- **Used AI?** Yes

### S4-10 — Recharts setup (Must)

- **Status:** Done
- **PR / commit:** 68e5a17
- **Used AI?** No

### S4-11 — Progress page charts (Must)

- **Status:** Done
- **PR / commit:** fee5060
- **Demonstration:**
  1. **Do this:** Log in, open Progress for a **known** period whose numbers you can explain (same fixtures as tests or a hand-counted set).
  2. **Capture:** Screenshot of the Progress charts.
  3. **Must show:** Charts rendered for that period (sessions over time and/or distance/intensity by activity as implemented).
  4. **Must not show:** Tokens.
  5. **Save as:** `docs/reports/images/sprint-04/s4-11-progress.png`
  6. **Caption (1–2 sentences):** 5 sessions, with none using `distance_km` as value. There are 2 x running sessions with one set at 5 intensity, and 2 x cycling sessions with one set to 10 intensity. The last session uses `weight_kg` units.
- **Used AI?** Yes

### S4-12 — Period controls (Must)

- **Status:** Done
- **PR / commit:** 6641c64
- **Demonstration:**
  1. **Do this:** On Progress, change period and/or granularity. Confirm charts refetch and update.
  2. **Capture:** Two screenshots (before and after the control change) or a single shot with the control and updated chart.
  3. **Must show:** Period/granularity control changing the displayed data.
  4. **Must not show:** Tokens.
  5. **Save as:** `docs/reports/images/sprint-04/s4-12-period.png`
  6. **Caption (1–2 sentences):** Date range defaults on the left image, which I changed to the time range used in `s4-11-progress.png`
- **Used AI?** Yes

### S4-13 — Dashboard stat widgets (Must)

- **Status:** Done
- **PR / commit:** 6cb3b52
- **Demonstration:**
  1. **Do this:** Open Dashboard for the **same** period you used on Progress. Compare widget numbers to Progress / `/stats/summary`.
  2. **Capture:** Screenshot of Dashboard widgets.
  3. **Must show:** Period widgets (session count, totals, average intensity, or your implemented set) matching the same period as Progress.
  4. **Must not show:** Tokens or another user’s stats.
  5. **Save as:** `docs/reports/images/sprint-04/s4-13-dashboard.png`
  6. **Caption (1–2 sentences):** The total `total_duration_min` is at **0 min** because `planned_values` do not count for progress.
- **Used AI?** Yes

### S4-14 — Stats README notes (Should)

- **Status:** Done
- **PR / commit:** 91ae2f7
- **Demonstration:**
  1. **Do this:** Open the README (or `docs/stats.md`) section that documents stats endpoints, tests, and how to interpret periods/`session_at`.
  2. **Capture:** Screenshot of that documentation.
  3. **Must show:** Classmate-facing notes for stats/test commands or endpoint contract.
  4. **Must not show:** Secrets.
  5. **Save as:** `docs/reports/images/sprint-04/s4-14-readme.png`
  6. **Caption (1–2 sentences):** Screenshot taken from 'Analytics' section in README.md.
- **Used AI?** Yes

## How we worked

Sprint 4 is **three weeks**.

- **Week 1** (analytics module + unit tests):
- **Week 2** (`/stats/summary`, `/stats/progress`, `/stats/streaks`):
- **Week 3** (Progress charts, period controls, Dashboard widgets):
- Who did what:
> I did the sprint individually within one week.
- One blocker and how you unblocked it:
> I think every ticket blocked me in some way, and then unblocked that situation using AI assistance.  
> I guess quite a bit of time went on switching to use Mantine UI components instead of generic html, where some functionality had to be changed during that.

## Decisions

Two to four technical choices with why (for example how you define a streak, which `session_at` rows count).

1. I asked AI which choice related to `session_at` rows counting would be more aligned with how everything has been implemented already. Which lead to the choice of not counting unscheduled rows.
2. I found exercises as a thing to be more logical to count in weeks as workout plans are often weekly plans, so it didn't make sense to count daily streaks.
3. I chose to finally add Mantine as UI library, which also took some time to integrate to the work that was already done. Mantine or MUI seemed like the easiest to add at this time. 

## What we learned

Note what you actually used. Tools this sprint: pytest, dataclasses / TypedDict, Recharts, TanStack Query (period filters). Sprint 4 Must is **pure Python** in the API—not pandas.

- What clicked: I think I'm starting to recognize where I need these specific tools. A python refresh course before starting this one would've been useful, so I would better recognize what is tool or library specific convention and what is just regular python.
- One thing you would do differently: The difference between using dataclasses over TypedDict at the beginning, where I ended up using dataclasses for the input part, but then TypedDict for output type, as it was easier to get JSON output using TypedDict as far as I understood it.

## Carry-over

Deferred Must/Should, stretch leftovers, risks for [Sprint 5 tickets](../tickets/sprint-05-tickets.md) (Ollama insights).

> Keeping note that stretch features have not been included on any prior sprint.

## AI usage (sprint-level reflection)

Mark **Used AI?** under each ticket above (`Yes` / `No`). Do **not** write per-ticket reflections there.

Here, cover your **overall** AI use during this sprint (Cursor, ChatGPT, Copilot, local coding assistants, etc.). Product Insights via Ollama in Sprint 5 does **not** count unless you also used an AI assistant to write code.

If you marked **No** on every ticket, write a short note that you did not use AI coding assistants this sprint (you may still answer verification / independence questions briefly).

- **Where AI helped most this sprint** (themes, ticket IDs, or areas—not a ticket-by-ticket dump):
> Just in basic coding tasks. Specifically for the first week tickets, as they were backend related.  

- **What I typically accepted from AI suggestions:**
> The suggestions were not that long that I couldn't read them wholly.  
> If I understand roughly how the code works, I usually just go with it.  

- **What I typically rejected or reworked, and why:**
> I try to remove the extra fluff that AI sometimes includes in it's suggestions.
> Confusing function/variable names I edit to something more accurate to their purpose.  
> I think aiming for simplicity in the learning phase is beneficial for understanding the concepts.  

- **How I verified AI-assisted work** (tests, `/docs`, manual demos, reviews):
> I didn't make or do any specific tests for AI-assisted work.  
> I did manually confirm things were working as I expected them to.

- **What I can now explain or do independently** that I relied on AI for earlier:
> Manipulating dates to specific formats is something I could probably manage by checking the code in this project.  I don't get enough repetition to be able to recall how specific things are done, so using AI as sort of a more convenient search, instead of using more time reading classical documentation, has become a norm for me. I do still read normal documentation if they are well made, but for coding related tasks it is just faster to ask AI.

- **Anything I would do differently with AI next sprint:**
> You can always narrow things up in your prompts to minimize token usage, so that's something I'm conscious of.


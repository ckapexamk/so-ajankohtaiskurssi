import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router";
import apiReq from "../api/client";

type CalendarView = "month" | "week";
type SessionStatus = "planned" | "in_progress" | "completed";

interface CalendarSession {
  id: string;
  name: string;
  session_at: string;
  status: SessionStatus;
  plan_id: string | null;
}

interface Plan {
  id: string;
  name: string;
}

const dateKey = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate(),
  ).padStart(2, "0")}`;

const atLocalMidnight = (date: Date): Date =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

const mondayOf = (date: Date): Date => {
  const monday = atLocalMidnight(date);
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  return monday;
};

const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const dateTimeLocal = (value: string): string => {
  const date = new Date(value);
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 16);
};

const formatTime = (value: string): string =>
  new Intl.DateTimeFormat(undefined, { timeStyle: "short" }).format(
    new Date(value),
  );

const statusColors: Record<SessionStatus, string> = {
  planned: "#315b9a",
  in_progress: "#31859a",
  completed: "#2f8051",
};

const CalendarPage: React.FC = (): React.ReactElement => {
  const queryClient = useQueryClient();
  const [view, setView] = useState<CalendarView>("month");
  const [cursor, setCursor] = useState(() => atLocalMidnight(new Date()));
  const [planId, setPlanId] = useState("");
  const [cloneSource, setCloneSource] = useState<CalendarSession | null>(null);
  const [cloneName, setCloneName] = useState("");
  const [cloneAt, setCloneAt] = useState("");
  const [error, setError] = useState<string | null>(null);

  const visibleDates = useMemo(() => {
    if (view === "week") {
      const start = mondayOf(cursor);
      return Array.from({ length: 7 }, (_, index) => addDays(start, index));
    }

    const firstDay = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const start = mondayOf(firstDay);
    const lastDay = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0);
    const end = addDays(mondayOf(lastDay), 6);
    const days: Date[] = [];
    for (let day = start; day <= end; day = addDays(day, 1)) {
      days.push(day);
    }
    return days;
  }, [cursor, view]);

  const rangeFrom = atLocalMidnight(visibleDates[0]);
  const rangeTo = addDays(
    atLocalMidnight(visibleDates[visibleDates.length - 1]),
    1,
  );
  rangeTo.setMilliseconds(rangeTo.getMilliseconds() - 1);

  const calendar = useQuery({
    queryKey: ["calendar", rangeFrom.toISOString(), rangeTo.toISOString(), planId],
    queryFn: () => {
      const params = new URLSearchParams({
        from: rangeFrom.toISOString(),
        to: rangeTo.toISOString(),
      });
      if (planId) params.set("plan_id", planId);
      return apiReq<CalendarSession[]>(`/calendar?${params.toString()}`);
    },
  });

  const plans = useQuery({
    queryKey: ["plans"],
    queryFn: () => apiReq<Plan[]>("/plans"),
  });

  const cloneSession = useMutation({
    mutationFn: () => {
      if (!cloneSource) throw new Error("Choose a session to clone.");
      if (!cloneAt) throw new Error("Choose a date and time for the clone.");

      return apiReq<CalendarSession>(`/sessions/${cloneSource.id}/clone`, {
        method: "POST",
        body: JSON.stringify({
          name: cloneName.trim() || cloneSource.name,
          session_at: new Date(cloneAt).toISOString(),
          plan_id: cloneSource.plan_id,
        }),
      });
    },
    onSuccess: async () => {
      setCloneSource(null);
      setError(null);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["calendar"] }),
        queryClient.invalidateQueries({ queryKey: ["sessions"] }),
        queryClient.invalidateQueries({ queryKey: ["plans"] }),
      ]);
    },
    onError: (cause: Error) => setError(cause.message),
  });

  const startClone = (session: CalendarSession) => {
    setError(null);
    setCloneSource(session);
    setCloneName(`${session.name} (copy)`);
    setCloneAt(dateTimeLocal(session.session_at));
  };

  const submitClone = (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    cloneSession.mutate();
  };

  const moveCursor = (direction: -1 | 1) => {
    setCursor((current) =>
      view === "month"
        ? new Date(current.getFullYear(), current.getMonth() + direction, 1)
        : addDays(current, direction * 7),
    );
  };

  const sessionsByDay = new Map<string, CalendarSession[]>();
  for (const session of calendar.data ?? []) {
    const key = dateKey(new Date(session.session_at));
    const sessions = sessionsByDay.get(key) ?? [];
    sessions.push(session);
    sessionsByDay.set(key, sessions);
  }

  const monthTitle =
    view === "month"
      ? new Intl.DateTimeFormat(undefined, {
          month: "long",
          year: "numeric",
        }).format(cursor)
      : `${new Intl.DateTimeFormat(undefined, {
          dateStyle: "medium",
        }).format(visibleDates[0])} – ${new Intl.DateTimeFormat(undefined, {
          dateStyle: "medium",
        }).format(visibleDates[6])}`;

  if (plans.isError) return <p role="alert">Could not load plans.</p>;

  return (
    <section>
      <h1>Calendar</h1>
      <p><Link to="/sessions">Back to sessions</Link></p>
      <div style={{ display: "flex", gap: "1em", justifyContent: "space-between"}}>
        <div style={{ display: "flex", gap: "1em" }}>
        <div><strong>{monthTitle} </strong></div>
        <div>
          <button type="button" onClick={() => moveCursor(-1)}>Previous</button>
          <button type="button" onClick={() => moveCursor(1)}>Next</button></div>
        </div>
        <div style={{ display: "flex", gap: "0.5em" }}>
        <div>
        <button type="button" onClick={() => setCursor(atLocalMidnight(new Date()))}>
          Today
        </button></div>
        <div>
        <label>
          View
          <select
            value={view}
            onChange={(event) => setView(event.target.value as CalendarView)}
          >
            <option value="month">Month</option>
            <option value="week">Week</option>
          </select>
        </label></div>
        
        <label>
          Plan
          <select
            value={planId}
            onChange={(event) => setPlanId(event.target.value)}
          >
            <option value="">All plans</option>
            {plans.data?.map((plan) => (
              <option key={plan.id} value={plan.id}>
                {plan.name}
              </option>
            ))}
          </select>
        </label></div>
      </div>

      {error && <p role="alert">{error}</p>}
      {calendar.isPending ? (
        <p>Loading calendar…</p>
      ) : calendar.isError ? (
        <p role="alert">Could not load calendar sessions.</p>
      ) : (
        <div
          role="grid"
          aria-label={view === "month" ? "Monthly calendar" : "Weekly calendar"}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
            marginTop: "1em",
          }}
        >
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
            (day) => (
              <strong role="columnheader" key={day}>{day}</strong>
            ),
          )}
          {visibleDates.map((date) => {
            const key = dateKey(date);
            const sessions = sessionsByDay.get(key) ?? [];
            const outsideMonth =
              view === "month" && date.getMonth() !== cursor.getMonth();

            return (
              <div
                role="gridcell"
                key={key}
                style={{
                  border: "1px solid #bbb",
                  minHeight: view === "month" ? "2em" : "6em",
                  padding: "0.2em",
                  opacity: outsideMonth ? 0.25 : 1,
                }}
              >
                <strong>{date.getDate()}</strong>
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      textAlign: "center",
                      backgroundColor: statusColors[session.status],
                      color: "white",
                      borderRadius: "0.4em",
                      padding: "0.2em",
                      marginTop: "0.2em"
                    }}
                  >{formatTime(session.session_at)}
                    <Link
                      to={`/sessions/${session.id}/edit`}
                      style={{ color: "inherit" }}
                    >
                    {session.name}
                    </Link>
                    <button
                      style={{ marginTop: "0.5em" }}
                      type="button"
                      onClick={() => startClone(session)}
                      aria-label={`Clone ${session.name} to another date`}
                    >
                      Clone
                    </button>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}

      {cloneSource && (
        <dialog open aria-labelledby="clone-calendar-session-title">
          <form onSubmit={submitClone}
            style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.5em",
            }}>
            <strong id="clone-calendar-session-title">Clone session to date</strong>
            <label>
              Name
              <div>
              <input
                required
                maxLength={100}
                value={cloneName}
                onChange={(event) => setCloneName(event.target.value)}
              /></div>
            </label>
            <label>
              Date and time
              <div>
              <input
                required
                type="datetime-local"
                value={cloneAt}
                onChange={(event) => setCloneAt(event.target.value)}
              /></div>
            </label>
            <button type="submit" disabled={cloneSession.isPending}>
              {cloneSession.isPending ? "Cloning…" : "Create clone"}
            </button>
            <button
              type="button"
              onClick={() => setCloneSource(null)}
              disabled={cloneSession.isPending}
            >
              Cancel
            </button>
          </form>
        </dialog>
      )}
    </section>
  );
};

export default CalendarPage;

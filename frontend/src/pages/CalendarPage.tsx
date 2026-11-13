import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router";
import apiReq from "../api/client";
import { cloneSessionRequest } from "../api/sessions";
import {
  Alert,
  Anchor,
  Badge,
  Button,
  Container,
  TextInput,
  Modal,
  Group,
  NativeSelect,
  SimpleGrid,
  Stack
} from "@mantine/core";
import { useDisclosure } from '@mantine/hooks';

import EmptyState from "../components/EmptyState";

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

const parseDateKey = (value: string): Date => {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
};

const dateKey = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate(),
  ).padStart(2, "0")}`;

const atLocalMidnight = (date: Date): Date =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

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

const statusColors: Record<SessionStatus, string> = {
  planned: "#315b9a",
  in_progress: "#31859a",
  completed: "#2f8051",
};

const CalendarPage: React.FC = (): React.ReactElement => {
  const queryClient = useQueryClient();
  const [cursor, setCursor] = useState(() => atLocalMidnight(new Date()));
  const [view, setView] = useState<"month" | "week">("month");
  const [planId, setPlanId] = useState("");
  const [cloneSource, setCloneSource] = useState<CalendarSession | null>(null);
  const [cloneName, setCloneName] = useState("");
  const [cloneAt, setCloneAt] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [opened, { open, close }] = useDisclosure(false);

  const visibleDates = useMemo(() => {
    if (view === "week") {
      const start = atLocalMidnight(cursor);
      start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
      return Array.from({ length: 7 }, (_, index) => addDays(start, index));
    }

    const firstDay = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const start = atLocalMidnight(firstDay);
    start.setDate(start.getDate() - ((start.getDay() + 6) % 7));

    const lastDay = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0);
    const end = atLocalMidnight(lastDay);
    end.setDate(end.getDate() + ((7 - end.getDay()) % 7));

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

  const sessionsByDate = useMemo(() => {
    const sessions = new Map<string, CalendarSession[]>();
    for (const session of calendar.data ?? []) {
      const key = dateKey(new Date(session.session_at));
      sessions.set(key, [...(sessions.get(key) ?? []), session]);
    }
    return sessions;
  }, [calendar.data]);

  const plans = useQuery({
    queryKey: ["plans"],
    queryFn: () => apiReq<Plan[]>("/plans"),
  });

  const cloneSession = useMutation({
    mutationFn: () => {
      if (!cloneSource) throw new Error("Choose a session to clone.");
      if (!cloneAt) throw new Error("Choose a date and time for the clone.");

      return cloneSessionRequest<CalendarSession>(cloneSource.id, {
        name: cloneName.trim() || cloneSource.name,
        session_at: new Date(cloneAt).toISOString(),
        plan_id: cloneSource.plan_id,
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
    open();
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

  const dateFormatter = new Intl.DateTimeFormat(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const title =
    view === "month"
      ? new Intl.DateTimeFormat(undefined, {
          month: "long",
          year: "numeric",
        }).format(cursor)
      : `${dateFormatter.format(visibleDates[0])} – ${dateFormatter.format(
          visibleDates[visibleDates.length - 1],
        )}`;
  const weekdayFormatter = new Intl.DateTimeFormat(undefined, {
    weekday: "short",
  });

  if (plans.isError) {
    return (
      <Alert color="red" variant="filled">
        {plans.error instanceof Error
          ? plans.error.message
          : "Could not load plans."}
      </Alert>
    );
  }

  return (
    <>
      <Container fluid mt="1em" style={{ maxWidth: 1100, margin: "0 auto" }}>

        <Group justify="space-between" mb="md">
          <Group>
            <Button variant="default" onClick={() => moveCursor(-1)}>
              Previous
            </Button>
            <strong>{title}</strong>
            <Button variant="default" onClick={() => moveCursor(1)}>
              Next
            </Button>
            <Button variant="default"
              onClick={() => setCursor(atLocalMidnight(new Date()))}
            >
              Today
            </Button>
          </Group>

          <Group>
            <div role="group" aria-label="Calendar view">
              <Button variant={view === "month" ? "light" : "default"}
                aria-pressed={view === "month"}
                onClick={() => setView("month")}
              >
                Month
              </Button>

              <Button variant={view === "week" ? "light" : "default"}
                aria-pressed={view === "week"}
                onClick={() => setView("week")}
              >
                Week
              </Button>
            </div>
              <NativeSelect
                value={planId}
                onChange={(event) => setPlanId(event.target.value)}
              >
                <option value="">All plans</option>
                {plans.data?.map((plan) => (
                  <option key={plan.id} value={plan.id}>
                    {plan.name}
                  </option>
                ))}
              </NativeSelect>
          </Group>
        </Group>

        {error && <Alert color="red" title="Error" variant="filled" mb="md">{error}</Alert>}
        {calendar.isPending ? (
          <p>Loading calendar…</p>
        ) : calendar.isError ? (
          <Alert color="red" variant="filled">
            {calendar.error instanceof Error
              ? calendar.error.message
              : "Could not load calendar sessions."}
          </Alert>
        ) : (
          <>
            {calendar.data.length === 0 && (
              <EmptyState
                title="No sessions scheduled for this date range."
                action={<Anchor component={Link} to={`/sessions/new`} fw={600}
                        >Create a session</Anchor>
                }                
              />
            )}
            <SimpleGrid cols={7} spacing="xs" mb="xs">
              {visibleDates.slice(0, 7).map((date) => (
                <div
                  key={date.getDay()}
                  style={{ textAlign: "center", fontWeight: 600 }}
                >
                  {weekdayFormatter.format(date)}
                </div>
              ))}
            </SimpleGrid>
            <SimpleGrid cols={7} spacing="none">
              {visibleDates.map((date) => {
                const key = dateKey(date);
                const inCurrentMonth = date.getMonth() === cursor.getMonth();
                const isCursorDate = key === dateKey(cursor);
                const sessions = sessionsByDate.get(key) ?? [];
                return (
                  <div
                    key={key}
                    style={{
                      minWidth: 0,
                      minHeight: view === "week" ? 300 : 110,
                      padding: "0.25em",
                      margin: "2px",
                      border: "1px solid lightgray",
                      borderRadius: "var(--mantine-radius-sm)",
                      opacity: inCurrentMonth ? 1 : 0.5,
                    }}
                  >
                    <button
                      type="button"
                      aria-label={dateFormatter.format(date)}
                      onClick={() => setCursor(parseDateKey(key))}
                      style={{
                        minWidth: "2rem",
                        minHeight: "2rem",
                        border: `2px solid ${
                          isCursorDate
                            ? "var(--mantine-primary-color-filled)"
                            : "transparent"
                        }`,
                        borderRadius: "var(--mantine-radius-sm)",
                        background: "transparent",
                        font: "inherit",
                        fontWeight: 600,
                        cursor: "pointer",
                        padding: 0,
                      }}
                    >
                      {date.getDate()}
                    </button>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.25em",
                        marginTop: "0.5em",
                      }}
                    >
                      {sessions.map((session) => (
                        <Stack
                          key={session.id}
                          gap="xs"
                          style={{
                            width: "100%",
                            borderRadius: "var(--mantine-radius-sm)",
                            padding: "0.5em",
                            background: statusColors[session.status],
                            color: "white",
                          }}
                          title={session.name}
                        >
                          
                          <Anchor component={Link} to={`/sessions/${session.id}`}
                            c="white"
                            fw={600}
                          >
                            {session.name}
                          </Anchor>
                          <Badge
                            size="sm"
                            color={
                              session.status === "planned"
                                ? "blue"
                                : session.status === "in_progress"
                                  ? "cyan"
                                  : "green"
                            }
                          >
                            {session.status.replace("_", " ")}
                          </Badge>
                          <Button
                            size="compact-xs"
                            variant="white"
                            color="dark"
                            onClick={() => startClone(session)}
                          >Clone
                          </Button>
                        </Stack>
                      ))}
                    </div>
                  </div>
                );
              })}
            </SimpleGrid>
          </>
        )}

      {cloneSource && (
        <Modal opened={opened} onClose={close} title="Clone session to date" centered>
          <form onSubmit={submitClone}
            style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.5em",
            }}>
  
              <TextInput
                label="Name"
                required
                maxLength={100}
                value={cloneName}
                onChange={(event) => setCloneName(event.target.value)}
              />

              <TextInput
                label="Date and time"
                required
                type="datetime-local"
                value={cloneAt}
                onChange={(event) => setCloneAt(event.target.value)}
              />

            <Group mt="md" justify="space-between">

            <Button type="submit" disabled={cloneSession.isPending}>
              {cloneSession.isPending ? "Cloning…" : "Create clone"}
            </Button>

            <Button variant="default"
              onClick={() => setCloneSource(null)}
              disabled={cloneSession.isPending}
            >Cancel
            </Button>

            </Group>
          </form>
        </Modal>
      )}
      </Container>
    </>
  );
};

export default CalendarPage;

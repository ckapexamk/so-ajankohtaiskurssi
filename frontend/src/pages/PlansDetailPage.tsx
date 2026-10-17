import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "react-router";
import apiReq from "../api/client";
import Alert from "../components/Alert";
import EmptyState from "../components/EmptyState";

interface SessionSummary {
  id: string;
  name: string;
  session_at: string | null;
  status: string;
  plan_id: string | null;
  items: Array<{ activity_type_id: string }>;
}

interface PlanDetail {
  id: string;
  name: string;
  notes: string | null;
  start_date: string | null;
  length_weeks: number | null;
  sessions: SessionSummary[];
}

const formatSessionDate = (sessionAt: string): string =>
  new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(sessionAt));

const PlansDetailPage: React.FC = (): React.ReactElement => {
  const { planId } = useParams();
  const queryClient = useQueryClient();
  const [selectedSessionId, setSelectedSessionId] = useState("");
  const [error, setError] = useState<string | null>(null);

  const plan = useQuery({
    queryKey: ["plans", planId],
    queryFn: () => {
      if (!planId) throw new Error("A plan ID is required.");
      return apiReq<PlanDetail>(`/plans/${planId}`);
    },
    enabled: Boolean(planId),
  });

  const sessions = useQuery({
    queryKey: ["sessions"],
    queryFn: () => apiReq<SessionSummary[]>("/sessions"),
  });

  const refreshPlanData = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["plans"] }),
      queryClient.invalidateQueries({ queryKey: ["sessions"] }),
    ]);
  };

  const attachSession = useMutation({
    mutationFn: (sessionId: string) => {
      if (!planId) throw new Error("A plan ID is required.");
      return apiReq<SessionSummary>(
        `/plans/${planId}/sessions/${sessionId}`,
        { method: "POST" },
      );
    },
    onSuccess: async () => {
      setSelectedSessionId("");
      setError(null);
      await refreshPlanData();
    },
    onError: (cause: Error) => setError(cause.message),
  });

  const detachSession = useMutation({
    mutationFn: (sessionId: string) => {
      if (!planId) throw new Error("A plan ID is required.");
      return apiReq<void>(
        `/plans/${planId}/sessions/${sessionId}`,
        { method: "DELETE" },
      );
    },
    onSuccess: async () => {
      setError(null);
      await refreshPlanData();
    },
    onError: (cause: Error) => setError(cause.message),
  });

  if (plan.isPending || sessions.isPending) return <p>Loading plan…</p>;
  if (plan.isError || sessions.isError) {
    return (
      <section>
        <Alert>
          {plan.error instanceof Error
            ? plan.error.message
            : sessions.error instanceof Error
              ? sessions.error.message
              : "Could not load this plan. It may not exist or you may not have access."}
        </Alert>
        <Link to="/plans">Back to plans</Link>
      </section>
    );
  }

  const scheduledSessions = plan.data.sessions
    .filter((session) => session.session_at !== null)
    .sort(
      (a, b) =>
        new Date(a.session_at!).getTime() - new Date(b.session_at!).getTime(),
    );
  const unscheduledSessions = plan.data.sessions.filter(
    (session) => session.session_at === null,
  );
  const availableSessions = sessions.data.filter(
    (session) => session.plan_id === null,
  );

  const renderSession = (session: SessionSummary) => (
    <li key={session.id} style={{ padding: "0.1em" }}>
      {session.session_at
        ? `${formatSessionDate(session.session_at)} — `
        : ""}
      <Link to={`/sessions/${session.id}/edit`}>{session.name}</Link>{" "}({session.status}){" "}
      <button
        type="button"
        onClick={() => detachSession.mutate(session.id)}
        disabled={detachSession.isPending}
      >
        Detach
      </button>
    </li>
  );

  return (
    <section>
      <p><Link to="/plans">Back to plans</Link></p>
      <h1>{plan.data.name}</h1>
      {plan.data.notes && <p>{plan.data.notes}</p>}
      {plan.data.start_date && <p>Starts: {plan.data.start_date}</p>}
      {plan.data.length_weeks !== null && (
        <p>Length: {plan.data.length_weeks} weeks</p>
      )}

      {error && <Alert>{error}</Alert>}

      <form style={{ display: "flex", flexDirection: "column", gap: "0.5em" }}
        onSubmit={(event) => {
          event.preventDefault();
          if (selectedSessionId) attachSession.mutate(selectedSessionId);
        }}
      >
        <label>
          Attach an unassigned session
          <div>
          <select
            value={selectedSessionId}
            onChange={(event) => setSelectedSessionId(event.target.value)}
          >
            <option value="">Choose a session</option>
            {availableSessions.map((session) => (
              <option key={session.id} value={session.id}>
                {session.name}
                {session.session_at
                  ? ` — ${formatSessionDate(session.session_at)}`
                  : " — unscheduled"}
              </option>
            ))}
          </select></div>
        </label>
        {availableSessions.length === 0 && (
          <p>There are no unassigned sessions available to attach.</p>
        )}
        <div>
        <button
          type="submit"
          disabled={!selectedSessionId || attachSession.isPending}
        >
          {attachSession.isPending ? "Attaching…" : "Attach session"}
        </button></div>
      </form>

      <h2>Scheduled sessions</h2>
      {scheduledSessions.length === 0 ? (
        <EmptyState title="No scheduled sessions">
          Attach a session above to add it to this plan.
        </EmptyState>
      ) : (
        <ol>{scheduledSessions.map(renderSession)}</ol>
      )}

      <h2>Unscheduled sessions</h2>
      {unscheduledSessions.length === 0 ? (
        <EmptyState title="No unscheduled sessions" />
      ) : (
        <ol>{unscheduledSessions.map(renderSession)}</ol>
      )}
    </section>
  );
};

export default PlansDetailPage;

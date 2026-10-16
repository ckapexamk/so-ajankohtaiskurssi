import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router";
import apiReq from "../api/client";

interface WorkoutSession {
  id: string;
  name: string;
  session_at: string | null;
  status: string;
  items: Array<{
    id: string;
    activity_type_id: string;
  }>;
}

interface ActivityType {
  id: string;
  name: string;
}

interface CloneSessionRequest {
  name: string;
  session_at: string;
}

const formatDate = (sessionAt: string | null): string => {
  if (sessionAt === null) return "unscheduled";

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(sessionAt));
};

const toDateTimeLocal = (value: string | null): string => {
  if (value === null) return "";

  const date = new Date(value);
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 16);
};

const actionErrorMessage = (error: unknown): string => {
  if (!(error instanceof Error)) {
    return "The request failed. Please try again.";
  }
  if (error.message.includes("404")) {
    return "Session was not found or you do not have access to it.";
  }
  if (error.message.includes("403")) {
    return "You do not have permission to perform this action.";
  }
  return "Could not complete the request. Please try again.";
};

const SessionsPage: React.FC = (): React.ReactElement => {
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const [cloneSessionId, setCloneSessionId] = useState<string | null>(null);
  const [cloneName, setCloneName] = useState("");
  const [cloneDate, setCloneDate] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);

  const filters = {
    from: searchParams.get("from") ?? "",
    to: searchParams.get("to") ?? "",
    status: searchParams.get("status") ?? "",
    unscheduled: searchParams.get("unscheduled") ?? "",
    plan_id: searchParams.get("plan_id") ?? "",
    activity_type_id: searchParams.get("activity_type_id") ?? "",
  };

  const sessions = useQuery({
    queryKey: ["sessions", filters],
    queryFn: () => {
      const params = new URLSearchParams();
      for (const [key, value] of Object.entries(filters)) {
        if (value) params.set(key, value);
      }

      return apiReq<WorkoutSession[]>(
        `/sessions${params.size ? `?${params.toString()}` : ""}`,
      );
    },
  });

  const activities = useQuery({
    queryKey: ["activity-types"],
    queryFn: () => apiReq<ActivityType[]>("/activity-types"),
  });

  const deleteSession = useMutation({
    mutationFn: (sessionId: string) =>
      apiReq<void>(`/sessions/${sessionId}`, { method: "DELETE" }),
    onSuccess: async () => {
      setActionError(null);
      await queryClient.invalidateQueries({ queryKey: ["sessions"] });
    },
    onError: (error: Error) => setActionError(actionErrorMessage(error)),
  });

  const cloneSession = useMutation({
    mutationFn: ({
      sessionId,
      payload,
    }: {
      sessionId: string;
      payload: CloneSessionRequest;
    }) =>
      apiReq<WorkoutSession>(`/sessions/${sessionId}/clone`, {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    onSuccess: async () => {
      setActionError(null);
      setCloneSessionId(null);
      setCloneName("");
      setCloneDate("");
      await queryClient.invalidateQueries({ queryKey: ["sessions"] });
    },
    onError: (error: Error) => setActionError(actionErrorMessage(error)),
  });

  const startClone = (session: WorkoutSession) => {
    setActionError(null);
    setCloneSessionId(session.id);
    setCloneName(`${session.name} (copy)`);
    setCloneDate(toDateTimeLocal(session.session_at));
  };

  const submitClone = (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!cloneSessionId) return;

    cloneSession.mutate({
      sessionId: cloneSessionId,
      payload: {
        name: cloneName.trim(),
        session_at: new Date(cloneDate).toISOString(),
      },
    });
  };

  const confirmDelete = (session: WorkoutSession) => {
    if (!window.confirm(`Delete "${session.name}"? This cannot be undone.`)) {
      return;
    }

    setActionError(null);
    deleteSession.mutate(session.id);
  };

  if (sessions.isPending || activities.isPending) {
    return <p>Loading…</p>;
  }

  if (sessions.isError || activities.isError) {
    return <p role="alert">Could not load sessions.</p>;
  }

  const activityNames = new Map(
    activities.data.map((activity) => [activity.id, activity.name]),
  );

  return (
    <section>
      <h1>Sessions</h1>
      <p>
        <Link to="/sessions/new">Create session</Link>
      </p>

      {actionError && (
        <div role="alert" style={{ backgroundColor: "red", color: "white", padding: "1em" }}>
          {actionError}
        </div>
      )}

      {sessions.data.length === 0 ? (
        <p>No sessions.</p>
      ) : (
        <div style={{ display: "flex" }}>
        <ol>
          {sessions.data.map((session) => {
            const summary = session.items
              .map(
                (item) =>
                  activityNames.get(item.activity_type_id) ??
                  "Unknown activity",
              )
              .join(", ");

            return (
              <li key={session.id}>
                <h2>{session.name}</h2>
                <p>Session at: {formatDate(session.session_at)}</p>
                <p>Status: {session.status}</p>
                <p>Exercises: {summary || "None"}</p>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                <Link to={`/sessions/${session.id}/edit`}>Edit</Link>{" "}
                <button
                  type="button"
                  onClick={() => confirmDelete(session)}
                  disabled={deleteSession.isPending}
                >
                  Delete
                </button>{" "}
                <button
                  type="button"
                  onClick={() => startClone(session)}
                  disabled={cloneSession.isPending}
                >
                  Clone
                </button>
                </div>
                
                {cloneSessionId === session.id && (
                  <dialog open>
                  <form onSubmit={submitClone} style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.5em"
                  }}>
                    
                    <label>
                      <div>New name</div>
                      <input
                        required
                        maxLength={100}
                        value={cloneName}
                        onChange={(event) => setCloneName(event.target.value)}
                      />
                    </label>
                    <label>
                      <div>New date and time</div>
                      <input
                        required
                        type="datetime-local"
                        value={cloneDate}
                        onChange={(event) => setCloneDate(event.target.value)}
                      />
                    </label>
                    <button type="submit" disabled={cloneSession.isPending}>
                      {cloneSession.isPending ? "Cloning…" : "Create clone"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setCloneSessionId(null)}
                      disabled={cloneSession.isPending}
                    >
                      Cancel
                    </button>
                  </form></dialog>
                )}
              </li>
            );
          })}
        </ol></div>
      )}
    </section>
  );
};

export default SessionsPage;

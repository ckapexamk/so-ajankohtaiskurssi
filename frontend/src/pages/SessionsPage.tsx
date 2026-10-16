import { useQuery } from "@tanstack/react-query";
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

const formatDate = (sessionAt: string | null): string => {
  if (sessionAt === null) return "unscheduled";

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(sessionAt));
};

const SessionsPage: React.FC = (): React.ReactElement => {
    const [searchParams] = useSearchParams();
    
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

  if (sessions.isPending || activities.isPending) {
    return <p>Loading…</p>;
  }

  if (sessions.isError || activities.isError) {
    return <p>Couldn't load sessions.</p>;
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

      {sessions.data.length === 0 ? (
        <p>No sessions.</p>
      ) : (
        <ul>
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
                <Link to={`/sessions/${session.id}`}>Edit</Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
};

export default SessionsPage;

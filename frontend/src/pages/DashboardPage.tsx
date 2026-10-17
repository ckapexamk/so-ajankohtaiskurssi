import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router";
import apiReq from "../api/client";

interface WorkoutSession {
  id: string;
  name: string;
  session_at: string | null;
  status: string;
}

const formatDate = (sessionAt: string): string =>
  new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(sessionAt));

const DashboardPage: React.FC = (): React.ReactElement => {
  const sessions = useQuery({
    queryKey: ["sessions", "dashboard"],
    queryFn: () => apiReq<WorkoutSession[]>("/sessions"),
  });

  if (sessions.isPending) return <p>Loading recent sessions…</p>;
  if (sessions.isError) {
    return <p role="alert">Could not load your recent sessions.</p>;
  }

  const recentSessions = sessions.data
    .filter(
      (session): session is WorkoutSession & { session_at: string } =>
        session.session_at !== null,
    )
    .sort(
      (first, second) =>
        new Date(second.session_at).getTime() -
        new Date(first.session_at).getTime(),
    )
    .slice(0, 5);

  return (
    <main>
      <h1>Dashboard</h1>
      <nav aria-label="Main navigation">
        <Link to="/sessions">Sessions</Link>{" / "}
        <Link to="/plans">Plans</Link>{" / "}
        <Link to="/calendar">Calendar</Link>
      </nav>

      <section aria-labelledby="recent-sessions-heading">
        <h2 id="recent-sessions-heading">Recent dated sessions</h2>
        {recentSessions.length === 0 ? (
          <p>
            You have no sessions.{" "}
            <Link to="/sessions/new">Create a session</Link>.
          </p>
        ) : (
          <dl>
            {recentSessions.map((session) => (
              <li key={session.id}>
                <dt>
                  <Link to={`/sessions/${session.id}/edit`}>{session.name}</Link>
                </dt>
                <dd style={{ marginBottom: "1em" }}>
                  {"Status: "}
                  {session.status}
                  {" — Session at: "}
                  {formatDate(session.session_at)}
                </dd>
              </li>
            ))}
          </dl>
        )}
        <Link to="/sessions">View all sessions</Link>
      </section>
    </main>
  );
};

export default DashboardPage;

import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router";
import apiReq from "../api/client";

import EmptyState from "../components/EmptyState";
import { Alert, Anchor, Button, Container, Divider, Paper, Title } from '@mantine/core';

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
    return (
      <Alert color="red" variant="filled">
        {sessions.error instanceof Error
          ? sessions.error.message
          : "Could not load sessions."}
      </Alert>
    )
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
    <>
    <Container fluid style={{ maxWidth: 800, margin: "0 auto" }}>
      <Title>Dashboard</Title>

        <Title order={2} mt="1em">Recent dated sessions</Title>
        
        {recentSessions.length === 0 ? (
          <EmptyState
            title="You have no sessions."
            action={<Button component={Link} to="/sessions/new">Create a session</Button>}
          >
          </EmptyState>
          
        ) : (
          <Paper p="md" m="md">
          <dl style={{ marginLeft: "1em"}}>
            {recentSessions.map((session) => (
              <li key={session.id}>
                <dt>
                  <Anchor component={Link} to={`/sessions/${session.id}/edit`}>{session.name}</Anchor>
                </dt>
                <dd style={{ marginBottom: "1em" }}>
                  {"Status: "}
                  {session.status}
                  {" — Session at: "}
                  {formatDate(session.session_at)}
                </dd>
                <Divider mb="1em"></Divider>
              </li>
            ))}
            
          </dl>
          <Anchor component={Link} to="/sessions">View all sessions</Anchor>
          </Paper>
        )}
        
    </Container>  
    </>
  );
};

export default DashboardPage;

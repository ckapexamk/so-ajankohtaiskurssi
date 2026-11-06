import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "react-router";
import apiReq from "../api/client";
import { Anchor, Alert, Badge, Button, Container, DataList, Divider, NativeSelect, Paper, Text, Title } from "@mantine/core";
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
      <>
        <Alert color="red" variant="filled">
          {plan.error instanceof Error
            ? plan.error.message
            : sessions.error instanceof Error
              ? sessions.error.message
              : "Could not load this plan. It may not exist or you may not have access."}
        </Alert>
        <Anchor component={Link} to="/plans">Back to plans</Anchor>
      </>
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
    <Container key={session.id} style={{ padding: "0.5em", mb: "2em" }}>
      <Anchor component={Link} to={`/sessions/${session.id}/edit`}>
        {session.name}
      </Anchor>
      {session.session_at
        ? ` — ${formatSessionDate(session.session_at)}`
        : ""}
      {" — "}
      <Badge
        color={
          session.status === "planned"
            ? "blue"
            : session.status === "in_progress"
              ? "cyan" : "green"
        }
      >{session.status}
      </Badge>
      {" "}
      <Button variant="default" size="compact-md"
        onClick={() => detachSession.mutate(session.id)}
        disabled={detachSession.isPending}
      >Detach
      </Button>
    </Container>
  );

  return (
    <Container fluid style={{ maxWidth: 800, margin: "0 auto" }}>
      <Anchor component={Link} to="/plans">Back to plans</Anchor>
      
      <Title>{plan.data.name} — plan details</Title>

      <Paper withBorder shadow="sm" p="md" m="md">
        <DataList withDivider style={{ marginBottom: "1em" }}>
          {plan.data.notes &&
          <DataList.Item>
            <DataList.ItemLabel>Notes: </DataList.ItemLabel>
            <DataList.ItemValue>{plan.data.notes}</DataList.ItemValue>
          </DataList.Item>}

        {plan.data.start_date &&
        <DataList.Item>
          <DataList.ItemLabel>Starts: </DataList.ItemLabel>
          <DataList.ItemValue>{plan.data.start_date}</DataList.ItemValue>
        </DataList.Item>}

        {plan.data.length_weeks !== null && (
          <DataList.Item>
          <DataList.ItemLabel>Length: </DataList.ItemLabel>
          <DataList.ItemValue>{plan.data.length_weeks} weeks</DataList.ItemValue>
        </DataList.Item>)}
        
        </DataList>
      
      {error && <Alert color="red" variant="filled">{error}</Alert>}
        
      <form
        onSubmit={(event) => {event.preventDefault();
          if (selectedSessionId) attachSession.mutate(selectedSessionId);
        }}
      >
        <Container p="md" style={{ display: "grid", gap: "0.5em" }}>
          <NativeSelect
            label="Attach an unassigned session to this plan"
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
          </NativeSelect>
          <Button
            type="submit"
            disabled={!selectedSessionId || attachSession.isPending}
          >{attachSession.isPending ? "Attaching…" : "Attach session"}
          </Button>

  
        {availableSessions.length === 0 && (
          <EmptyState
            title="There are no unassigned sessions available to attach."
            action={<Anchor component={Link} to="/sessions/new" >Create a new session</Anchor>}
          ></EmptyState>
        )}
      </Container>

      </form>
      </Paper>

      <Divider mt="2em"></Divider>
      <Container>
      <Title order={4} mt="1em">Scheduled sessions</Title>
      {scheduledSessions.length === 0 ? (
        <EmptyState title="No scheduled sessions">
          Attach a session above to add it to this plan.
        </EmptyState>
      ) : (
        <Text>{scheduledSessions.map(renderSession)}</Text>
      )}

      <Divider mt="2em"></Divider>
      <Title order={4} mt="1em">Unscheduled sessions</Title>
      {unscheduledSessions.length === 0 ? (
        <EmptyState title="No unscheduled sessions" />
      ) : (
        <Text>{unscheduledSessions.map(renderSession)}</Text>
      )}
      </Container>
    </Container>
  );
};

export default PlansDetailPage;

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router";
import apiReq from "../api/client";
import { cloneSessionRequest, type CloneSessionPayload } from "../api/sessions";
import {
  Alert,
  Anchor,
  Button,
  Container,
  Group,
  DataList,
  Modal,
  Paper,
  TextInput,
  Title,
} from "@mantine/core";
import EmptyState from "../components/EmptyState";

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
      payload: CloneSessionPayload;
    }) => cloneSessionRequest<WorkoutSession>(sessionId, payload),
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
    const error = sessions.error ?? activities.error;
    return (
      <Alert color="red" variant="filled">
        {error instanceof Error ? error.message : "Could not load sessions."}
      </Alert>
    );
  }

  const activityNames = new Map(
    activities.data.map((activity) => [activity.id, activity.name]),
  );

  return (
    <>
    <Container fluid style={{ maxWidth: 800, margin: "0 auto" }}>
      <Title>Sessions</Title>

          <Link to="/sessions/new">
            <Button mt="lg">
              Create a session
            </Button>
          </Link>
      {actionError && <Alert color="red" variant="filled">{actionError}</Alert>}

      {sessions.data.length === 0 ? (
        <EmptyState
          title="No sessions yet"
          action={<Anchor component={Link} to="/sessions/new">Create your first session</Anchor>}
        >
          Create a session to start tracking your workouts.
        </EmptyState>
      ) : (

        <Container fluid style={{ maxWidth: 800, margin: "0 auto" }}>
          {sessions.data.map((session) => {
            const summary = session.items
              .map(
                (item) =>
                  activityNames.get(item.activity_type_id) ??
                  "Unknown activity",
              )
              .join(", ");

            return (
              <Paper withBorder shadow="sm" p="md" m="md" key={session.id}
              >
                <DataList key={session.id} withDivider>
                    <Title order={4} mb="sm">
                    <Anchor fw={600} fz="lg"
                      component={Link} to={`/sessions/${session.id}/edit`}>{session.name}
                    </Anchor>
                    </Title>

                  <DataList.Item>
                    <DataList.ItemLabel>Session at:</DataList.ItemLabel>
                    <DataList.ItemValue>{formatDate(session.session_at)}</DataList.ItemValue>
                  </DataList.Item>

                  <DataList.Item>
                    <DataList.ItemLabel>Status:</DataList.ItemLabel>
                    <DataList.ItemValue>{session.status}</DataList.ItemValue>
                  </DataList.Item>

                  <DataList.Item>
                    <DataList.ItemLabel>Exercises:</DataList.ItemLabel>
                    <DataList.ItemValue>{summary || "None"}</DataList.ItemValue>
                  </DataList.Item>

                  <Group justify="flex-end">

                    <Button variant="default" size="compact-md"
                      onClick={() => confirmDelete(session)}
                      disabled={deleteSession.isPending}
                    >Delete
                    </Button>
                    {" "}
                    <Button variant="default" size="compact-md"
                      onClick={() => startClone(session)}
                      disabled={cloneSession.isPending}
                    >Clone
                    </Button>

                  </Group>

              </DataList>
              </Paper>
            );
          })}
         </Container>
      )}
      <Modal
        opened={cloneSessionId !== null}
        onClose={() => {
          if (!cloneSession.isPending) setCloneSessionId(null);
        }}
        title="Clone session"
        centered
      >
        <form
          onSubmit={submitClone}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.5em",
          }}
        >
          <TextInput
            label="New name"
            required
            maxLength={100}
            value={cloneName}
            onChange={(event) => setCloneName(event.target.value)}
          />
          <TextInput
            label="New date and time"
            required
            type="datetime-local"
            value={cloneDate}
            onChange={(event) => setCloneDate(event.target.value)}
          />
          <Group mt="md" justify="space-between">
            <Button type="submit" disabled={cloneSession.isPending}>
              {cloneSession.isPending ? "Cloning…" : "Create clone"}
            </Button>
            <Button
              type="button"
              variant="default"
              onClick={() => setCloneSessionId(null)}
              disabled={cloneSession.isPending}
            >
              Cancel
            </Button>
          </Group>
        </form>
      </Modal>
    </Container>
    </>
  );
};

export default SessionsPage;

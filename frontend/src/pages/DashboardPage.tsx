import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router";
import apiReq from "../api/client";

import EmptyState from "../components/EmptyState";
import StatWidgets from "../components/StatWidgets";
import {
    Alert,
    Anchor,
    Badge,
    Button,
    Container,
    Group,
    Loader,
    List,
    Paper,
    Title,
} from "@mantine/core";

interface WorkoutSession {
    id: string;
    name: string;
    session_at: string | null;
    status: string;
}

const formatDate = (sessionAt: string): string =>
    new Intl.DateTimeFormat(undefined, {
        dateStyle: "short",
        timeStyle: "short",
    }).format(new Date(sessionAt));

const DashboardPage: React.FC = (): React.ReactElement => {
    const sessions = useQuery({
        queryKey: ["sessions", "dashboard"],
        queryFn: () => apiReq<WorkoutSession[]>("/sessions"),
    });

    if (sessions.isPending) {
        return (
            <EmptyState
                title="Loading dashboard..."
                action={<Loader color="blue" type="bars" />}
            />
        );
    }

    if (sessions.isError) {
        return (
            <Alert color="red" variant="filled">
                {sessions.error instanceof Error
                    ? sessions.error.message
                    : "Could not load sessions."}
            </Alert>
        );
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
                <Group justify="space-between">
                    {recentSessions.length === 0 ? (
                        <EmptyState
                            title="You have no sessions."
                            action={
                                <Button component={Link} to="/sessions/new">
                                    Create a session
                                </Button>
                            }
                        ></EmptyState>
                    ) : (
                        <Paper p="md" m="md">
                            <Title order={2} m="xs">
                                Recent dated sessions
                            </Title>
                            <List>
                                {recentSessions.map((session) => (
                                    <List.Item
                                        key={session.id}
                                        pb="xs"
                                        style={{
                                            borderBottom: "1px lightgray solid",
                                        }}
                                    >
                                        <Anchor
                                            component={Link}
                                            to={`/sessions/${session.id}/edit`}
                                        >
                                            <Title order={5} mb="xs">
                                                {session.name}
                                            </Title>
                                        </Anchor>
                                        <Badge
                                            color={
                                                session.status === "planned"
                                                    ? "blue"
                                                    : session.status ===
                                                        "in_progress"
                                                      ? "cyan"
                                                      : "green"
                                            }
                                        >
                                            {session.status}
                                        </Badge>
                                        {" — "}
                                        {formatDate(session.session_at)}
                                    </List.Item>
                                ))}
                            </List>
                            <Anchor
                                component={Link}
                                to="/sessions"
                                style={{ textAlign: "center" }}
                            >
                                View all sessions
                            </Anchor>
                        </Paper>
                    )}
                    <StatWidgets />
                </Group>
            </Container>
        </>
    );
};

export default DashboardPage;

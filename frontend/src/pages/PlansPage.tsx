import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router";
import apiReq from "../api/client";
import { Alert, Anchor, Button, Container, DataList, Divider, Group, NumberInput, Paper, Textarea, TextInput, Title } from "@mantine/core";
import { DateInput } from "@mantine/dates";
import EmptyState from "../components/EmptyState";

interface Plan {
  id: string;
  name: string;
  notes: string | null;
  start_date: string | null;
  length_weeks: number | null;
}

interface PlanPayload {
  name: string;
  notes: string | null;
  start_date: string | null;
  length_weeks: number | null;
}

const PlansPage: React.FC = (): React.ReactElement => {
  const queryClient = useQueryClient();
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [startDate, setStartDate] = useState<string | null>(null);
  const [lengthWeeks, setLengthWeeks] = useState("");
  const [error, setError] = useState<string | null>(null);

  const plans = useQuery({
    queryKey: ["plans"],
    queryFn: () => apiReq<Plan[]>("/plans"),
  });

  const resetForm = () => {
    setEditingPlan(null);
    setName("");
    setNotes("");
    setStartDate("");
    setLengthWeeks("");
  };

  const savePlan = useMutation({
    mutationFn: ({
      planId,
      payload,
    }: {
      planId: string | null;
      payload: PlanPayload;
    }) =>
      apiReq<Plan>(planId ? `/plans/${planId}` : "/plans", {
        method: planId ? "PATCH" : "POST",
        body: JSON.stringify(payload),
      }),
    onSuccess: async () => {
      setError(null);
      resetForm();
      await queryClient.invalidateQueries({ queryKey: ["plans"] });
    },
    onError: (cause: Error) => setError(cause.message),
  });

  const deletePlan = useMutation({
    mutationFn: (planId: string) =>
      apiReq<void>(`/plans/${planId}`, { method: "DELETE" }),
    onSuccess: async () => {
      setError(null);
      await queryClient.invalidateQueries({ queryKey: ["plans"] });
    },
    onError: (cause: Error) => setError(cause.message),
  });

  const editPlan = (plan: Plan) => {
    setEditingPlan(plan);
    setName(plan.name);
    setNotes(plan.notes ?? "");
    setStartDate(plan.start_date ?? "");
    setLengthWeeks(plan.length_weeks?.toString() ?? "");
    setError(null);
  };

  const submit = (
    event: React.SubmitEvent<HTMLFormElement>,
    planId: string | null,
  ) => {
    event.preventDefault();
    setError(null);
    savePlan.mutate({
      planId,
      payload: {
        name: name.trim(),
        notes: notes.trim() || null,
        start_date: startDate || null,
        length_weeks: lengthWeeks ? Number(lengthWeeks) : null,
      },
    });
  };

  const confirmDelete = (plan: Plan) => {
    if (!window.confirm(`Delete "${plan.name}"?`)) return;
    setError(null);
    deletePlan.mutate(plan.id);
  };

  if (plans.isPending) return <p>Loading plans…</p>;
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
      <Container fluid style={{ maxWidth: 800, margin: "0 auto" }}>
      <Title>Plans</Title>
      <Group>
        <nav aria-label="Main navigation">
          <Anchor component={Link} to="/">Dashboard</Anchor>
          {` / `}
          <Anchor component={Link} to="/sessions">Sessions</Anchor>
          {` / `}
          <Anchor component={Link} to="/calendar">Calendar</Anchor>
        </nav>
      </Group>

      {error && <Alert color="red" variant="filled">{error}</Alert>}
      <Paper withBorder shadow="sm" p="md" m="md">
      <form
        onSubmit={(event) => submit(event, editingPlan?.id ?? null)}
        style={{ display: "flex", flexDirection: "column", gap: "0.5em" }}
      >
        <Title order={3}>{editingPlan ? `${name}` : "Create plan"}</Title>
        
            <TextInput
              label="Name"
              required
              maxLength={100}
              value={name}
              onChange={(event) => setName(event.target.value)}
            />

            <Textarea
              label="Notes (optional)"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
            />
            <Group mb={"0.5em"}>
            <DateInput
              label="Start date (optional)"
              value={startDate}
              onChange={(event) => setStartDate(event || "")}
            />

            <NumberInput
              label="Length in weeks (optional)"
              min={1}
              value={lengthWeeks}
              onChange={(event) => setLengthWeeks(String(event))}
            />

            </Group><Divider mb="0.5em"></Divider>

        <Button type="submit" disabled={savePlan.isPending}>
          {savePlan.isPending
            ? "Saving…"
            : editingPlan
              ? "Save changes"
              : "Create plan"}
        </Button>
            
        {editingPlan && (
          <Button variant="default"
            type="button"
            onClick={resetForm}
            disabled={savePlan.isPending}
          >
            Cancel
          </Button>
        )}
      </form>
      </Paper><Divider mt="2em" mb="2em"></Divider>

      
      {plans.data.length === 0 ? (
        <EmptyState title="No plans yet">
          Create your first plan using the form above.
        </EmptyState>
      ) : (

        <Paper style={{  maxWidth: "80%", margin: "0 auto" }}>
        <Title order={3}>Your plans</Title>
          {plans.data.map((plan) => (

            <Paper shadow="sm" p="xs" m="xs">
              <Title order={4} mb="0.5em">
                <Anchor component={Link} to={`/plans/${plan.id}`}>{plan.name}</Anchor>
              </Title>
            <DataList withDivider key={plan.id} mb={"0.5em"}>
              
              {plan.start_date &&
                <DataList.Item>
                  <DataList.ItemLabel>Starts: </DataList.ItemLabel>
                  <DataList.ItemValue>{plan.start_date}</DataList.ItemValue>
                </DataList.Item>
              }
              {plan.length_weeks !== null && (
                <DataList.Item>
                  <DataList.ItemLabel>Length: </DataList.ItemLabel>
                  <DataList.ItemValue>{plan.length_weeks} weeks</DataList.ItemValue>
                </DataList.Item>
              )}
              <DataList.Item>
              <Group>

                <Button variant="default" size="compact-md"
                  onClick={() => editPlan(plan)}
                > Edit
                </Button>

                <Button variant="default" size="compact-md"
                  onClick={() => confirmDelete(plan)}
                  disabled={deletePlan.isPending || savePlan.isPending}
                >Delete
                </Button>

              </Group>
              </DataList.Item>
              
            </DataList>
            </Paper>
          ))}
        
        </Paper>
      )}
      </Container>
    </>
  );
};

export default PlansPage;

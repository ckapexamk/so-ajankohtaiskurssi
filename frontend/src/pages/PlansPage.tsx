import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router";
import apiReq from "../api/client";

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
  const [startDate, setStartDate] = useState("");
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
  if (plans.isError) return <p role="alert">Could not load plans.</p>;

  return (
    <section>
      <h1>Plans</h1>
      <p><Link to="/sessions">Back to sessions</Link></p>

      {error && <p role="alert">{error}</p>}

      <form
        onSubmit={(event) => submit(event, editingPlan?.id ?? null)}
        style={{ display: "flex", flexDirection: "column", gap: "0.5em" }}
      >
        <h2>{editingPlan ? "Edit plan" : "Create plan"}</h2>
        <label>
          Name
          <div>
            <input
              required
              maxLength={100}
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </div>
        </label>
        <label>
          Notes
          <div>
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
            />
          </div>
        </label>
        <label>
          Start date (optional)
          <div>
            <input
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
            />
          </div>
        </label>
        <label>
          Length in weeks (optional)
          <div>
            <input
              type="number"
              min={1}
              value={lengthWeeks}
              onChange={(event) => setLengthWeeks(event.target.value)}
            />
          </div>
        </label><div>
        <button type="submit" disabled={savePlan.isPending}>
          {savePlan.isPending
            ? "Saving…"
            : editingPlan
              ? "Save changes"
              : "Create plan"}
        </button></div>
        {editingPlan && (
          <div>
          <button
            type="button"
            onClick={resetForm}
            disabled={savePlan.isPending}
          >
            Cancel edit
          </button></div>
        )}
      </form>

      <h2>Your plans</h2>
      {plans.data.length === 0 ? (
        <ul>You are planless</ul>
      ) : (
        <ul>
          {plans.data.map((plan) => (
            <li key={plan.id}>
              <h3><Link to={`/plans/${plan.id}`}>{plan.name}</Link></h3>
              {plan.start_date && <p>Starts: {plan.start_date}</p>}
              {plan.length_weeks !== null && (
                <p>Length: {plan.length_weeks} weeks</p>
              )}
              <button type="button" onClick={() => editPlan(plan)}>
                Edit
              </button>
              <button
                type="button"
                onClick={() => confirmDelete(plan)}
                disabled={deletePlan.isPending || savePlan.isPending}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default PlansPage;

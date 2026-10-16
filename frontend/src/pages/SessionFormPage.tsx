import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router";
import apiReq from "../api/client";
import MeasurementEditor, {
  type ActivityType,
  type DraftExercise,
  type DraftMeasurement,
} from "../components/MeasurementEditor";

interface Plan {
  id: string;
  name: string;
}

type SessionStatus = "planned" | "in_progress" | "completed";

interface SessionCreatePayload {
  name: string;
  session_at: string | null;
  status: SessionStatus;
  notes: string | null;
  intensity: number | null;
  plan_id: string | null;
  items: Array<{
    activity_type_id: string;
    sort_order: number;
    notes: string | null;
    measurements: Array<{
      unit_type_id: string;
      planned_value: number | null;
      actual_value: number | null;
      set_index: number | null;
    }>;
  }>;
}

const emptyExercise = (): DraftExercise => ({
  activity_type_id: "",
  measurements: [],
});

const SessionsFormPage: React.FC = (): React.ReactElement => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [sessionAt, setSessionAt] = useState("");
  const [status, setStatus] = useState<SessionStatus>("planned");
  const [notes, setNotes] = useState("");
  const [intensity, setIntensity] = useState("");
  const [planId, setPlanId] = useState("");
  const [exercises, setExercises] = useState<DraftExercise[]>([emptyExercise(),]);

  const [formError, setFormError] = useState<string | null>(null);

  const activities = useQuery({
    queryKey: ["activity-types"],
    queryFn: () => apiReq<ActivityType[]>("/activity-types"),
  });

  const plans = useQuery({
    queryKey: ["plans"],
    queryFn: () => apiReq<Plan[]>("/plans"),
  });

  const createSession = useMutation({
    mutationFn: (payload: SessionCreatePayload) =>
      apiReq("/sessions", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["sessions"] });
      navigate("/sessions");
    },
  });

  const selectActivity = (exerciseIndex: number, activityTypeId: string) => {
    const activity = activities.data?.find(
      (item) => item.id === activityTypeId,
    );

    setExercises((current) =>
      current.map((exercise, index) =>
        index === exerciseIndex
          ? {
              activity_type_id: activityTypeId,
              measurements:
                activity?.unit_link.map((link) => ({
                  unit_type_id: link.unit_type_id,
                  planned_value: "",
                  actual_value: "",
                  set_index: link.per_set ? "1" : "",
                })) ?? [],
            }
          : exercise,
      ),
    );
  };

  const updateMeasurement = (
    exerciseIndex: number,
    measurementIndex: number,
    field: keyof DraftMeasurement,
    value: string,
  ) => {
    setExercises((current) =>
      current.map((exercise, index) =>
        index === exerciseIndex
          ? {
              ...exercise,
              measurements: exercise.measurements.map((measurement, mIndex) =>
                mIndex === measurementIndex
                  ? { ...measurement, [field]: value }
                  : measurement,
              ),
            }
          : exercise,
      ),
    );
  };

  const addSet = (exerciseIndex: number) => {
    const exercise = exercises[exerciseIndex];
    const activity = activities.data?.find(
      (item) => item.id === exercise.activity_type_id,
    );
    if (!activity) return;

    const perSetLinks = activity.unit_link.filter((link) => link.per_set);
    if (perSetLinks.length === 0) return;

    const currentSetIndex = Math.max(
      0,
      ...exercise.measurements
        .filter((measurement) => measurement.set_index !== "")
        .map((measurement) => Number(measurement.set_index)),
    );
    const incompleteLink = perSetLinks.find((link) => {
      const measurement = exercise.measurements.find(
        (item) =>
          item.unit_type_id === link.unit_type_id &&
          Number(item.set_index) === currentSetIndex,
      );

      return (
        !measurement ||
        (measurement.planned_value === "" && measurement.actual_value === "")
      );
    });

    if (incompleteLink) {
      setFormError(
        `Enter either planned or actual ${incompleteLink.unit_type.name} for Set ${currentSetIndex}.`,
      );
      return;
    }

    setFormError(null);

    const nextSetIndex =
      Math.max(
        0,
        ...exercise.measurements
          .filter((measurement) => measurement.set_index !== "")
          .map((measurement) => Number(measurement.set_index)),
      ) + 1;

    setExercises((current) =>
      current.map((item, index) =>
        index === exerciseIndex
          ? {
              ...item,
              measurements: [
                ...item.measurements,
                ...perSetLinks.map((link) => ({
                  unit_type_id: link.unit_type_id,
                  planned_value: "",
                  actual_value: "",
                  set_index: String(nextSetIndex),
                })),
              ],
            }
          : item,
      ),
    );
  };

  const removeLastSet = (exerciseIndex: number) => {
    setExercises((current) =>
      current.map((exercise, index) => {
        if (index !== exerciseIndex) return exercise;

        const setIndexes = exercise.measurements
          .map((measurement) => Number(measurement.set_index))
          .filter(Number.isFinite);
      if (setIndexes.length <= 1) return exercise;

      const lastSetIndex = Math.max(0, ...setIndexes);

      return {
          ...exercise,
          measurements: exercise.measurements.filter(
            (measurement) =>
              measurement.set_index === "" ||
              Number(measurement.set_index) !== lastSetIndex,
          ),
        };
      }),
    );
  };

  const submit = (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    if (exercises.some((exercise) => !exercise.activity_type_id)) {
      setFormError("Choose an activity for each exercise.");
      return;
    }

    for (const exercise of exercises) {
      if (
        !exercise.measurements.some(
          (measurement) =>
            measurement.planned_value !== "" ||
            measurement.actual_value !== "",
        )
      ) {
        setFormError(
          "Planned or actual value required.",
        );
        return;
      }

      const activity = activities.data?.find(
        (item) => item.id === exercise.activity_type_id,
      );
      if (!activity) continue;

      for (const link of activity.unit_link) {
        const rows = exercise.measurements.filter(
          (measurement) => measurement.unit_type_id === link.unit_type_id,
        );
        if (
          link.is_required &&
          !rows.some(
            (measurement) =>
              measurement.planned_value !== "" || measurement.actual_value !== "",
          )
        ) {
          setFormError(`Enter a value for ${link.unit_type.name}.`);
          return;
        }
      }
    }

    const payload: SessionCreatePayload = {
      name: name.trim(),
      session_at: sessionAt ? new Date(sessionAt).toISOString() : null,
      status,
      notes: notes.trim() || null,
      intensity: intensity === "" ? null : Number(intensity),
      plan_id: planId || null,
      items: exercises.map((exercise, sort_order) => ({
        activity_type_id: exercise.activity_type_id,
        sort_order,
        notes: null,
        measurements: exercise.measurements
          .filter(
            (measurement) =>
              measurement.planned_value !== "" ||
              measurement.actual_value !== "",
          )
          .map((measurement) => ({
            unit_type_id: measurement.unit_type_id,
            planned_value:
              measurement.planned_value === ""
                ? null
                : Number(measurement.planned_value),
            actual_value:
              measurement.actual_value === ""
                ? null
                : Number(measurement.actual_value),
            set_index:
              measurement.set_index === ""
                ? null
                : Number(measurement.set_index),
          })),
      })),
    };

    createSession.mutate(payload);
  };

  if (activities.isPending || plans.isPending) {
    return <p>Loading form options…</p>;
  }

  if (activities.isError || plans.isError) {
    return <p>Could not load activities or plans.</p>;
  }

  return (
    <section>
      <h1>Add session</h1>
      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: "0.5em" }}>
        <label>
          Name<div>
          <input
            required
            maxLength={100}
            value={name}
            onChange={(event) => setName(event.target.value)}
          /></div>
        </label>

        <label>
          Session at (optional)<div>
          <input
            type="datetime-local"
            value={sessionAt}
            onChange={(event) => setSessionAt(event.target.value)}
          /></div>
        </label>

        <label>
          Status<div>
          <select
            value={status}
            onChange={(event) =>
              setStatus(event.target.value as SessionStatus)
            }
          >
            <option value="planned">Planned</option>
            <option value="in_progress">In progress</option>
            <option value="completed">Completed</option>
          </select></div>
        </label>

        <label>
          Notes<div>
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
          /></div>
        </label>

        <label>
          Intensity (1-10, optional)<div>
          <input
            type="number"
            min={1}
            max={10}
            value={intensity}
            onChange={(event) => setIntensity(event.target.value)}
          /></div>
        </label>

        <label>
          Plan (optional)<div>
          <select
            value={planId}
            onChange={(event) => setPlanId(event.target.value)}
          >
            <option value="">No plan</option>
            {plans.data.map((plan) => (
              <option key={plan.id} value={plan.id}>
                {plan.name}
              </option>
            ))}
          </select></div>
        </label>
        {formError && (
          <div style={{ backgroundColor: "red", color: "white", padding: "1em" }}>
            <strong role="alert">{formError}</strong>
          </div>
        )}
        <section style={{  marginTop: "1em", marginBottom: "1em" }}>
          {exercises.map((exercise, exerciseIndex) => (
            <MeasurementEditor
              key={exerciseIndex}
              activities={activities.data}
              exercise={exercise}
              exerciseIndex={exerciseIndex}
              canRemoveExercise={exercises.length > 1}
              onSelectActivity={selectActivity}
              onUpdateMeasurement={updateMeasurement}
              onAddSet={addSet}
              onRemoveLastSet={removeLastSet}
              onRemoveExercise={(index) =>
                setExercises((current) =>
                  current.filter((_, currentIndex) => currentIndex !== index),
                )
              }
            />
          ))}
        </section>

        <button
          type="button"
          onClick={() =>
            setExercises((current) => [...current, emptyExercise()])
          }
        >
          Add exercise
        </button>

        {createSession.isError && (
          <p role="alert">
            Could not save session. Check required values and try again.
          </p>
        )}

        <button type="submit" disabled={createSession.isPending}>
          {createSession.isPending ? "Saving…" : "Save session"}
        </button>
      </form>
      <p>
        <Link to="/sessions">Cancel</Link>
      </p>
    </section>
  );
};

export default SessionsFormPage;

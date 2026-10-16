import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router";
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

interface WorkoutSession {
  id: string;
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

const toDateTimeLocal = (value: string | null): string => {
  if (!value) return "";

  const date = new Date(value);
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 16);
};

const SessionsFormPage: React.FC = (): React.ReactElement => {
  const { sessionId } = useParams();

  const session = useQuery({
    queryKey: ["sessions", sessionId],
    queryFn: () => {
      if (!sessionId) throw new Error("A session ID is required.");
      return apiReq<WorkoutSession>(`/sessions/${sessionId}`);
    },
    enabled: Boolean(sessionId),
  });

  const activities = useQuery({
    queryKey: ["activity-types"],
    queryFn: () => apiReq<ActivityType[]>("/activity-types"),
  });

  const plans = useQuery({
    queryKey: ["plans"],
    queryFn: () => apiReq<Plan[]>("/plans"),
  });

  if (
    activities.isPending ||
    plans.isPending ||
    (Boolean(sessionId) && session.isPending)
  ) {
    return <p>Loading form options…</p>;
  }

  if (sessionId && session.isError) {
    return (
      <p role="alert">
        Could not load this session. It may not exist or you may not have access.
      </p>
    );
  }

  if (activities.isError || plans.isError) {
    return <p>Could not load activities or plans.</p>;
  }

  return (
    <SessionFormContent
      key={sessionId ?? "new"}
      sessionId={sessionId}
      initialSession={session.data}
      activities={activities.data}
      plans={plans.data}
    />
  );
};

interface SessionFormContentProps {
  sessionId: string | undefined;
  initialSession: WorkoutSession | undefined;
  activities: ActivityType[];
  plans: Plan[];
}

const SessionFormContent: React.FC<SessionFormContentProps> = ({
  sessionId,
  initialSession,
  activities,
  plans,
}): React.ReactElement => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [name, setName] = useState(initialSession?.name ?? "");
  const [sessionAt, setSessionAt] = useState(
    toDateTimeLocal(initialSession?.session_at ?? null),
  );
  const [status, setStatus] = useState<SessionStatus>(
    initialSession?.status ?? "planned",
  );
  const [notes, setNotes] = useState(initialSession?.notes ?? "");
  const [intensity, setIntensity] = useState(
    initialSession?.intensity?.toString() ?? "",
  );
  const [planId, setPlanId] = useState(initialSession?.plan_id ?? "");
  const [exercises, setExercises] = useState<DraftExercise[]>(
    initialSession
      ? [...initialSession.items]
          .sort((a, b) => a.sort_order - b.sort_order)
          .map((item) => ({
            activity_type_id: item.activity_type_id,
            measurements: item.measurements.map((measurement) => ({
              unit_type_id: measurement.unit_type_id,
              planned_value: measurement.planned_value?.toString() ?? "",
              actual_value: measurement.actual_value?.toString() ?? "",
              set_index: measurement.set_index?.toString() ?? "",
            })),
          }))
      : [emptyExercise()],
  );

  const [formError, setFormError] = useState<string | null>(null);

  const saveSession = useMutation({
    mutationFn: (payload: SessionCreatePayload) =>
      apiReq(sessionId ? `/sessions/${sessionId}` : "/sessions", {
        method: sessionId ? "PATCH" : "POST",
        body: JSON.stringify(payload),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["sessions"] });
      navigate("/sessions");
    },
  });

  const selectActivity = (exerciseIndex: number, activityTypeId: string) => {
    const activity = activities.find(
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
    const activity = activities.find((item) => item.id === exercise.activity_type_id);
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

      const activity = activities.find(
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

    saveSession.mutate(payload);
  };

  return (
    <section>
      <h1>{sessionId ? "Edit session" : "Add session"}</h1>
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
            {plans.map((plan) => (
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
              activities={activities}
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

        {saveSession.isError && (
          <p role="alert">
            {saveSession.error instanceof Error
              ? saveSession.error.message
              : "Could not save session. Please try again."}
          </p>
        )}

        <button type="submit" disabled={saveSession.isPending}>
          {saveSession.isPending ? "Saving…" : "Save session"}
        </button>
      </form>
      <p>
        <Link to="/sessions">Cancel</Link>
      </p>
    </section>
  );
};

export default SessionsFormPage;

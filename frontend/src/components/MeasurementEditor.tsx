import ActivityTypeSelect, {
  type ActivityType,
} from "./ActivityTypeSelect";

export type { ActivityType } from "./ActivityTypeSelect";

export interface DraftMeasurement {
  unit_type_id: string;
  planned_value: string;
  actual_value: string;
  set_index: string;
}

export interface DraftExercise {
  activity_type_id: string;
  measurements: DraftMeasurement[];
}

interface MeasurementEditorProps {
  activities: ActivityType[];
  exercise: DraftExercise;
  exerciseIndex: number;
  canRemoveExercise: boolean;
  onSelectActivity: (exerciseIndex: number, activityTypeId: string) => void;
  onUpdateMeasurement: (
    exerciseIndex: number,
    measurementIndex: number,
    field: keyof DraftMeasurement,
    value: string,
  ) => void;
  onAddSet: (exerciseIndex: number) => void;
  onRemoveLastSet: (exerciseIndex: number) => void;
  onRemoveExercise: (exerciseIndex: number) => void;
}

const MeasurementEditor: React.FC<MeasurementEditorProps> = ({
  activities,
  exercise,
  exerciseIndex,
  canRemoveExercise,
  onSelectActivity,
  onUpdateMeasurement,
  onAddSet,
  onRemoveLastSet,
  onRemoveExercise,
}): React.ReactElement => {
  const activity = activities.find(
    (item) => item.id === exercise.activity_type_id,
  );
  const perSetLinks =
    activity?.unit_link.filter((link) => link.per_set) ?? [];
  const singleLinks =
    activity?.unit_link.filter((link) => !link.per_set) ?? [];
  const setIndexes = [
    ...new Set(
      exercise.measurements
        .filter((measurement) => measurement.set_index !== "")
        .map((measurement) => Number(measurement.set_index)),
    ),
  ].sort((a, b) => a - b);

  return (
    <fieldset>
      <legend>Exercise {exerciseIndex + 1}</legend>
      <label>
        Activity
        <ActivityTypeSelect
          activities={activities}
          value={exercise.activity_type_id}
          onChange={(activityTypeId) =>
            onSelectActivity(exerciseIndex, activityTypeId)
          }
        />
      </label>

      {singleLinks.map((link) => {
        const measurementIndexes = exercise.measurements
          .map((measurement, index) =>
            measurement.unit_type_id === link.unit_type_id ? index : -1,
          )
          .filter((index) => index >= 0);

        return (
          <fieldset key={link.unit_type_id}>
            <legend>
              {link.unit_type.name}
              {link.unit_type.unit_label
                ? ` (${link.unit_type.unit_label})`
                : ""}
              {link.is_required ? " — required" : ""}
            </legend>

            {measurementIndexes.map((measurementIndex) => {
              const measurement = exercise.measurements[measurementIndex];
              return (
                <div key={`${link.unit_type_id}-${measurementIndex}`}>
                  <label>
                    Planned
                    <input
                      type="number"
                      step="any"
                      value={measurement.planned_value}
                      onChange={(event) =>
                        onUpdateMeasurement(
                          exerciseIndex,
                          measurementIndex,
                          "planned_value",
                          event.target.value,
                        )
                      }
                    />
                  </label>
                  <label>
                    Actual
                    <input
                      type="number"
                      step="any"
                      value={measurement.actual_value}
                      onChange={(event) =>
                        onUpdateMeasurement(
                          exerciseIndex,
                          measurementIndex,
                          "actual_value",
                          event.target.value,
                        )
                      }
                    />
                  </label>
                </div>
              );
            })}
          </fieldset>
        );
      })}

      {perSetLinks.length > 0 && (
        <section aria-label="Sets">
          {setIndexes.map((setIndex) => (
            <fieldset key={setIndex}>
              <legend>Set {setIndex}</legend>
              <div style={{ display: "grid", gap: "0.5em" }}>
                {perSetLinks.map((link) => {
                  const measurementIndex = exercise.measurements.findIndex(
                    (measurement) =>
                      measurement.unit_type_id === link.unit_type_id &&
                      Number(measurement.set_index) === setIndex,
                  );

                  if (measurementIndex < 0) return null;
                  const measurement = exercise.measurements[measurementIndex];

                  return (
                    <div key={link.unit_type_id}>
                      <strong>
                        {link.unit_type.name}
                        {link.unit_type.unit_label
                          ? ` (${link.unit_type.unit_label})`
                          : ""}
                      </strong>
                      <br />
                      <label>
                        Planned
                        <input
                          type="number"
                          step="any"
                          value={measurement.planned_value}
                          onChange={(event) =>
                            onUpdateMeasurement(
                              exerciseIndex,
                              measurementIndex,
                              "planned_value",
                              event.target.value,
                            )
                          }
                        />
                      </label>
                      <label>
                        Actual
                        <input
                          type="number"
                          step="any"
                          value={measurement.actual_value}
                          onChange={(event) =>
                            onUpdateMeasurement(
                              exerciseIndex,
                              measurementIndex,
                              "actual_value",
                              event.target.value,
                            )
                          }
                        />
                      </label>
                    </div>
                  );
                })}
              </div>
            </fieldset>
          ))}
        </section>
      )}

      <div style={{ display: "flex", gap: "1em", marginTop: "0.5em" }}>
        {perSetLinks.length > 0 && (
          <div>
            <button type="button" onClick={() => onAddSet(exerciseIndex)}>
              Add set
            </button>
            <button
              type="button"
              onClick={() => onRemoveLastSet(exerciseIndex)}
              disabled={setIndexes.length <= 1}
            >
              Remove set
            </button>
          </div>
        )}
        <div>
          <button
            type="button"
            onClick={() => onRemoveExercise(exerciseIndex)}
            disabled={!canRemoveExercise}
          >
            Remove exercise
          </button>
        </div>
      </div>
    </fieldset>
  );
};

export default MeasurementEditor;

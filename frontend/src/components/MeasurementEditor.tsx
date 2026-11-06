import ActivityTypeSelect, {
  type ActivityType,
} from "./ActivityTypeSelect";

import { Button, Container, Fieldset, Group, NumberInput, Stack } from "@mantine/core";


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
    <Container fluid style={{ maxWidth: 600, margin: "0 auto" }}>
    <Fieldset legend={`Exercise ${exerciseIndex + 1}`}>
        <ActivityTypeSelect
          label="Activity"
          activities={activities}
          value={exercise.activity_type_id}
          onChange={(activityTypeId) =>
            onSelectActivity(exerciseIndex, activityTypeId)
          }
        />

      <Group mt="md">
      {singleLinks.map((link) => {
        const measurementIndexes = exercise.measurements
          .map((measurement, index) =>
            measurement.unit_type_id === link.unit_type_id ? index : -1,
          )
          .filter((index) => index >= 0);

        return (
          
          <Fieldset key={link.unit_type_id}
            legend={` 
              ${link.unit_type.name}
              ${link.unit_type.unit_label
                ? ` (${link.unit_type.unit_label})`
                : ""}
              ${link.is_required ? " — required" : ""}`
            }>
          
            {measurementIndexes.map((measurementIndex) => {
              const measurement = exercise.measurements[measurementIndex];
              return (
                <div key={`${link.unit_type_id}-${measurementIndex}`}>
                  <Stack>
                    <NumberInput
                      label="Planned"
                      allowNegative={false}
                      value={measurement.planned_value}
                      onChange={(event) =>
                        onUpdateMeasurement(
                          exerciseIndex,
                          measurementIndex,
                          "planned_value",
                          String(event),
                        )
                      }
                    />
   
                    <NumberInput
                      label="Actual"
                      allowNegative={false}
                      value={measurement.actual_value}
                      onChange={(event) =>
                        onUpdateMeasurement(
                          exerciseIndex,
                          measurementIndex,
                          "actual_value",
                          String(event),
                        )
                      }
                    />
                  </Stack >
                </div>
              );
            })}
          </Fieldset>
        );
      })}
      
      {perSetLinks.length > 0 && (
        <section aria-label="Sets">
          {setIndexes.map((setIndex) => (
            <Fieldset key={setIndex}
              legend={`Set ${setIndex}`}
            >
              {perSetLinks.map((link) => {
                const measurementIndex = exercise.measurements.findIndex(
                  (measurement) =>
                    measurement.unit_type_id === link.unit_type_id &&
                    Number(measurement.set_index) === setIndex,
                );

                if (measurementIndex < 0) return null;
                const measurement = exercise.measurements[measurementIndex];

                  return (
                    <Fieldset key={link.unit_type_id}
                      legend={`
                        ${link.unit_type.name}
                        ${link.unit_type.unit_label
                          ? ` (${link.unit_type.unit_label})`
                          : ""}
                      `}
                    >
                    <Stack>
                    <Group justify="space-between">
                      <NumberInput
                        label="Planned"
                        allowNegative={false}
                        value={measurement.planned_value}
                        onChange={(event) =>
                          onUpdateMeasurement(
                            exerciseIndex,
                            measurementIndex,
                            "planned_value",
                            String(event),
                          )
                        }
                      />

                      <NumberInput
                        label="Actual"
                        value={measurement.actual_value}
                        onChange={(event) =>
                          onUpdateMeasurement(
                            exerciseIndex,
                            measurementIndex,
                            "actual_value",
                            String(event),
                          )
                        }
                      />
                      </Group>
                      </Stack>

                    </Fieldset>
                    
                  );
                })}
            </Fieldset>
          ))}
        </section>
      )}
      </Group>
        <Stack mt="1em">
        {perSetLinks.length > 0 && (
          <Group justify="space-between">
            <button type="button" onClick={() => onAddSet(exerciseIndex)}>
              Add set
            </button>

            <Group>
              <button
                type="button"
                onClick={() => onRemoveLastSet(exerciseIndex)}
                disabled={setIndexes.length <= 1}
              >
                Remove set
              </button>

              <button
              type="button"
              onClick={() => onRemoveExercise(exerciseIndex)}
              disabled={!canRemoveExercise}
              >Remove exercise
              </button>
            </Group>

          </Group>

        )}
      </Stack>
      
    </Fieldset>
    </Container>
  );
};

export default MeasurementEditor;

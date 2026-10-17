export interface ActivityType {
  id: string;
  name: string;
  unit_link: Array<{
    unit_type_id: string;
    per_set: boolean;
    is_required: boolean;
    unit_type: {
      name: string;
      unit_label: string | null;
    };
  }>;
}

interface ActivityTypeSelectProps {
  activities: ActivityType[];
  value: string;
  onChange: (activityTypeId: string) => void;
}

const getUnitSummary = (activity: ActivityType): string => {
  if (activity.unit_link.length === 0) return "no measurements";

  return activity.unit_link
    .map((link) => {
      const unitName = link.unit_type.unit_label
        ? `${link.unit_type.name} (${link.unit_type.unit_label})`
        : link.unit_type.name;
      const details = [
        link.per_set ? "per set" : null,
        link.is_required ? "required" : null,
      ].filter(Boolean);

      return details.length > 0
        ? `${unitName} ${details.join(", ")}`
        : unitName;
    })
    .join("; ");
};

const ActivityTypeSelect: React.FC<ActivityTypeSelectProps> = ({
  activities,
  value,
  onChange,
}): React.ReactElement => (
  <select
    style={{ marginBottom: "1em" }}
    required
    value={value}
    onChange={(event) => onChange(event.target.value)}
  >
    <option value="">Choose an activity</option>
    {activities.map((activity) => (
      <option key={activity.id} value={activity.id}>
        {activity.name} — {getUnitSummary(activity)}
      </option>
    ))}
  </select>
);

export default ActivityTypeSelect;
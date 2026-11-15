import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import apiReq from "../api/client";

import { DatePickerInput } from "@mantine/dates";
import {
  Alert,
  Button,
  Group,
  Loader,
  Paper,
  Stack,
  Text,
  Title,
} from "@mantine/core";



interface SessionSummary {
  session_count: number;
  total_duration_min: number;
  total_distance_km: number;
  average_intensity: number | null;
}

const startOfDayIso = (value: string): string => {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day).toISOString();
};

const endOfDayIso = (value: string): string => {
  const [year, month, day] = value.split("-").map(Number);
  const nextDay = new Date(year, month - 1, day + 1);
  nextDay.setMilliseconds(nextDay.getMilliseconds() - 1);
  return nextDay.toISOString();
};

function StatWidgets(): React.ReactElement {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const invalidDateRange = Boolean(from && to && from > to);
  const params = new URLSearchParams();

  if (from) params.set("from", startOfDayIso(from));
  if (to) params.set("to", endOfDayIso(to));

  const queryString = params.toString();

  const summaryQuery = useQuery({
    queryKey: ["summary", from, to],
    enabled: !invalidDateRange,
    queryFn: () =>
      apiReq<SessionSummary>(
        `/stats/summary${queryString ? `?${queryString}` : ""}`,
      ),
  });

  return (
    <Paper p="md" m="md" shadow="sm">
      <Title order={2}>Your progress</Title>

      <Group mt="md" mb="md">
        <DatePickerInput
          label="From"
          placeholder="Pick a date"
          value={from || null}
          onChange={(value) => setFrom(value || "")}
        />
        <DatePickerInput
          label="To"
          placeholder="Pick a date"
          value={to || null}
          onChange={(value) => setTo(value || "")}
        />
      </Group>

      {invalidDateRange ? (
        <Alert color="red" title="Invalid date range">
          The start date must be on or before the end date.
        </Alert>
      ) : summaryQuery.isPending ? (
        <Loader aria-label="Loading statistics" />
      ) : summaryQuery.isError ? (
        <Alert
          color="red"
          title="Could not load statistics"
          withCloseButton={false}
        >
          {summaryQuery.error.message}
          <Button mt="sm" onClick={() => void summaryQuery.refetch()}>
            Try again
          </Button>
        </Alert>
      ) : (
        <Stack>
          <StatCard
            label="Sessions"
            value={summaryQuery.data.session_count.toLocaleString()}
          />
          <StatCard
            label="Average intensity"
            value={
              summaryQuery.data.average_intensity === null
                ? "—"
                : summaryQuery.data.average_intensity.toLocaleString()
            }
          />
          <StatCard
            label="Total distance"
            value={`${summaryQuery.data.total_distance_km.toLocaleString()} km`}
          />
          <StatCard
            label="Total duration"
            value={`${summaryQuery.data.total_duration_min.toLocaleString()} min`}
          />
        </Stack>
      )}
    </Paper>
  );
}

interface StatCardProps {
  label: string;
  value: string;
}

function StatCard({ label, value }: StatCardProps): React.ReactElement {
  return (
    <Paper p="xs" withBorder>
      <Text size="sm" c="dimmed">
        {label}
      </Text>
      <Text size="xl" fw={700}>
        {value}
      </Text>
    </Paper>
  );
}

export default StatWidgets;
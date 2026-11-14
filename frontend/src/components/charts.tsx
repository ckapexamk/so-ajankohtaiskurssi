import { useState } from "react"
import { useSearchParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import apiReq from "../api/client";
import EmptyState from "../components/EmptyState";
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Alert, Box, Button, Group, Loader, Paper, SegmentedControl, Title } from "@mantine/core";
import { DatePickerInput } from '@mantine/dates';

interface PeriodValue {
  period_label: string;
  value: number;
}

interface SessionSummary {
  session_count: number;
  total_duration_min: number;
  total_distance_km: number;
  average_intensity: number | null;
  by_activity_type: Record<string, ActivityTypeSummary>;
}

interface ActivityTypeSummary {
  session_count: number;
  average_intensity: number | null;
  total_distance_km: number | null;
}

const formatDateInput = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const dateStartIso = (value: string): string => {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day).toISOString();
};

const dateEndIso = (value: string): string => {
  const [year, month, day] = value.split("-").map(Number);
  const nextDay = new Date(year, month - 1, day + 1);
  nextDay.setMilliseconds(nextDay.getMilliseconds() - 1);
  return nextDay.toISOString();
};

const Progress: React.FC = (): React.ReactElement => {
  const [searchParams] = useSearchParams();
  const [defaultRange] = useState(() => {
    const toDate = new Date();
    toDate.setHours(0, 0, 0, 0);

    const fromDate = new Date(toDate);
    fromDate.setDate(fromDate.getDate() - 8 * 7);

    return {
      from: formatDateInput(fromDate),
      to: formatDateInput(toDate),
    };
  });

  const [from, setFrom] = useState(
    () => searchParams.get("from") || defaultRange.from,
  );
  const [to, setTo] = useState(
    () => searchParams.get("to") || defaultRange.to,
  );

  const [granularity, setGranularity] = useState("week");
  const [metric, setMetric] = useState("sessions");

  const invalidDateRange = Boolean(from && to && from > to);
  const progressParams = new URLSearchParams({ metric, granularity });
  const dateParams = new URLSearchParams();

  if (from) dateParams.set("from", dateStartIso(from));
  if (to) dateParams.set("to", dateEndIso(to));
  const dateRange = dateParams.toString();

  const progressQuery = useQuery({
    queryKey: ["progress", metric, granularity, from, to],
    enabled: !invalidDateRange,
    queryFn: () =>
      apiReq<PeriodValue[]>(
        `/stats/progress?${progressParams.toString()}${dateRange ? `&${dateRange}` : ""}`,
      ),
  });

  const summaryQuery = useQuery({
    queryKey: ["summary", from, to],
    enabled: !invalidDateRange,
    queryFn: () =>
      apiReq<SessionSummary>(
        `/stats/summary${dateRange ? `?${dateRange}` : ""}`,
      ),
  });

  const activityData = Object.entries(
    summaryQuery.data?.by_activity_type ?? {},
  ).map(([activity_type, summary]) => ({
    activity_type,
    ...summary,
  }));
  const distanceData = activityData.filter(
    (summary) => summary.total_distance_km !== null,
  );
  const intensityData = activityData.filter(
    (summary) => summary.average_intensity !== null,
  );

  if (invalidDateRange) {
    return (
      <>
        <Group justify="flex-end">
          <DatePickerInput
            valueFormat="YYYY-MM-DD"
            label="From"
            placeholder="Date range start"
            value={from}
            onChange={(value) => setFrom(value || "")}
          />
          <DatePickerInput
            valueFormat="YYYY-MM-DD"
            label="To"
            placeholder="Date range end"
            value={to}
            onChange={(value) => setTo(value || "")}
          />
        </Group>
        <Alert m="1em" title="Invalid date range"
        >Select a valid date range.</Alert>
        </>
    );
  }

  if (progressQuery.isPending || summaryQuery.isPending) {
    return (
      <EmptyState
        title="Loading progress"
        action={<Loader color="blue" type="bars" />}
      />
    );
  }

  if (progressQuery.isError) {
    return (
      <EmptyState
        title="Could not load progress data"
        action={
          <Button onClick={() => void progressQuery.refetch()}>
            Try again
          </Button>
        }
      >
        {progressQuery.error.message}
      </EmptyState>
    );
  }
  if (summaryQuery.isError) {
    return (
      <EmptyState
        title="Could not load session data"
        action={
          <Button onClick={() => void summaryQuery.refetch()}>
            Try again
          </Button>
        }
      >
        {summaryQuery.error.message}
      </EmptyState>
    );
  }

  return (
    <>
      <Group justify="space-between">
        <Group>
        <SegmentedControl
          value={granularity}
          onChange={setGranularity}
          data={[
            { label: "Week", value: "week" },
            { label: "Month", value: "month" },
          ]}
        />
        </Group>
        <Group>
          <DatePickerInput
            valueFormat="YYYY-MM-DD"
            label="From"
            placeholder="Date range start"
            value={from}
            onChange={(value) => setFrom(value || "")}
          />
          <DatePickerInput
            valueFormat="YYYY-MM-DD"
            label="To"
            placeholder="Date range end"
            value={to}
            onChange={(value) => setTo(value || "")}
          />
        </Group>
      </Group>
      <Paper shadow="sm" p="md" m="md">
        <Title order={4} pb="1em">Sessions over time</Title>
        {progressQuery.data.length === 0 ? (
          <EmptyState title="No session history">There are no scheduled sessions to chart.</EmptyState>
        ) : (
          <Box style={{ width: "100%", height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={progressQuery.data}>
                <XAxis dataKey="period_label" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line dataKey="value" name="Sessions" />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        )}
      </Paper>

      <Paper shadow="sm" p="md" m="md">
        <Title order={4} pb="1em">Total distance by activity type</Title>
        {distanceData.length === 0 ? (
          <EmptyState title="No distance data">Activity types have no distance values.</EmptyState>
        ) : (
          <Box style={{ width: "100%", height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distanceData}>
                <XAxis dataKey="activity_type" />
                <YAxis domain={[0, "auto"]} />
                <Tooltip />
                <Bar dataKey="total_distance_km"
                  name="Distance (km)"
                  fill="#228be6"
                  radius={[10, 10, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        )}
      </Paper>

      <Paper shadow="sm" p="md" m="md">
        <Title order={4} pb="1em">Average intensity by activity type</Title>
        {intensityData.length === 0 ? (
          <EmptyState title="No intensity data">Activity types have no intensity values.</EmptyState>
        ) : (
          <Box style={{ width: "100%", height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={intensityData}>
                <XAxis dataKey="activity_type" />
                <YAxis domain={[0, 10]} />
                <Tooltip />
                <Bar dataKey="average_intensity"
                  name="Average intensity"
                  fill="#228be6"
                  radius={[10, 10, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        )}
      </Paper>

    </>
  );
};

export default Progress;
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
import { Box, Button, Loader, Paper, Title } from "@mantine/core";


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

const Progress: React.FC = (): React.ReactElement => {
  const metric = "sessions";
  const granularity = "week";
  const from = "";
  const to = "";

  const progressParams = new URLSearchParams({ metric, granularity });
  const dateParams = new URLSearchParams();

  if (from) dateParams.set("from", from);
  if (to) dateParams.set("to", to);
  const dateRange = dateParams.toString();

  const progressQuery = useQuery({
    queryKey: ["progress", metric, granularity, from, to],
    queryFn: () =>
      apiReq<PeriodValue[]>(
        `/stats/progress?${progressParams.toString()}${dateRange ? `&${dateRange}` : ""}`,
      ),
  });

  const summaryQuery = useQuery({
    queryKey: ["summary", from, to],
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
      <Paper shadow="sm" p="md" m="md">
        <Title order={4}>Sessions over time</Title>
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
        <Title order={4}>Total distance by activity type</Title>
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
        <Title order={4}>Average intensity by activity type</Title>
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
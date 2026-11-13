import { useQuery } from "@tanstack/react-query";
import apiReq from "../api/client";
import EmptyState from "../components/EmptyState";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Box, Button, Loader, Title } from "@mantine/core";

interface PeriodValue {
  period_label: string;
  value: number;
}

const Progress: React.FC = (): React.ReactElement => {
  const metric = "sessions";
  const granularity = "week";
  const progressQuery = useQuery({
    queryKey: ["progress", metric, granularity],
    queryFn: () =>
      apiReq<PeriodValue[]>(
        `/stats/progress?metric=${metric}&granularity=${granularity}`,
      ),
  });

  if (progressQuery.isPending) {
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

  if (progressQuery.data.length === 0) {
    return (
      <EmptyState title="No progress data">
        There are no scheduled sessions recorded.
      </EmptyState>
    );
  }

  return (
      <Box style={{ width: "100%", height: 320 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={progressQuery.data}>

            <XAxis dataKey="period_label" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="value"
              name="Sessions"
              stroke="#228be6"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>
  );
};

export default Progress;
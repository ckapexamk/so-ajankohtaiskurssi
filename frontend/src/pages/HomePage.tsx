import { useQuery } from "@tanstack/react-query";
import apiReq from "../api/client";

interface HealthResponse {
  status: string;
}

const HomePage: React.FC = (): React.ReactElement => {
  
  const healthQuery = useQuery({
    queryKey: ["health"],
    queryFn: () => apiReq<HealthResponse>("/health"),
  });

  return (
    <>
      <h2>Sprint 1 placeholder</h2>
      <h4>API health:</h4>

      {healthQuery.isPending && <p>Checking server...</p>}
      {healthQuery.isError && <p>Server is not ok.</p>}
      {healthQuery.isSuccess && (
        <p>{healthQuery.data.status === "ok" ? "OK" : "failed"}</p>
      )}
    </>
  );
};

export default HomePage;

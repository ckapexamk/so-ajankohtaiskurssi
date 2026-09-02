import { useEffect, useState } from 'react';
import apiReq from '../api/client';

interface HealthResponse {
    status: string;
}

const HomePage : React.FC = () : React.ReactElement => {
    const [health, setHealth] = useState<string>("Tarkistetaan palvelinta...");

    useEffect(() => {
        apiReq<HealthResponse>("/health")
            .then((response) => {
                setHealth(response.status === "ok"
                    ? "OK"
                    : "failed"
                );
            })
            .catch((error) => {
                console.error(error)
                setHealth("failed");
            });
    }, []);

    return (
        <>
            <h2>Sprint 1 placeholder</h2>
            <h4>API health:</h4><p>{health}</p>
        </>
    );
}

export default HomePage


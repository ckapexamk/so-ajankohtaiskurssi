import { getToken } from "../auth/token";

const apiUrl = import.meta.env.VITE_API_BASE_URL

const apiReq = async <T,>(path: string, req: RequestInit = {}) : Promise<T> => {
    const headers = new Headers(req.headers);
    const token = getToken();

    if (req.body && !headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
    }
    if (token && !headers.has("Authorization")) {
        headers.set("Authorization", `Bearer ${token}`);
    }

    const response = await fetch(`${apiUrl}${path}`, {
        ...req,
        headers,
    });

    if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
    }

    return (await response.json()) as T;
}

export default apiReq
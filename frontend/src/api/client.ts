const apiUrl = import.meta.env.VITE_API_BASE_URL

const apiReq = async <T,>(path: string, req: RequestInit = {}) : Promise<T> => {
    const headers = new Headers(req.headers);

    if (req.body && !headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
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
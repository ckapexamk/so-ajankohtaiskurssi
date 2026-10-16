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
        const responseText = await response.text();
        let message = `Request failed with status ${response.status}`;

        if (responseText) {
            try {
                const responseData: unknown = JSON.parse(responseText);
                if (
                    typeof responseData === "object" &&
                    responseData !== null &&
                    "detail" in responseData
                ) {
                    const detail = responseData.detail;
                    message += `: ${
                        typeof detail === "string"
                            ? detail
                            : JSON.stringify(detail)
                    }`;
                } else {
                    message += `: ${responseText}`;
                }
            } catch {
                message += `: ${responseText}`;
            }
        }

        throw new Error(message);
    }

    if (response.status === 204) {
        return undefined as T;
    }

    return (await response.json()) as T;
}

export default apiReq
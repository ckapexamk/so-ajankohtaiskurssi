const apiUrl = import.meta.env.VITE_API_BASE_URL

const apiReq = async <T,>(path: string) : Promise<T> => {
    const response = await fetch(`${apiUrl}${path}`)

    if (!response.ok) {
        throw new Error(`Kutsu epäonnistui: ${response.status}`);
    }

    return (await response.json()) as T;
}

export default apiReq
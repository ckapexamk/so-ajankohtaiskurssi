import apiReq from "./client";

export interface CloneSessionPayload {
  name: string;
  session_at: string;
  plan_id?: string | null;
}

export const cloneSessionRequest = <T,>(
  sessionId: string,
  payload: CloneSessionPayload,
): Promise<T> =>
  apiReq<T>(`/sessions/${encodeURIComponent(sessionId)}/clone`, {
    method: "POST",
    body: JSON.stringify(payload),
  });

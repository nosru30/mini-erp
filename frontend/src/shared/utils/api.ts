import { fetchAuthSession } from "aws-amplify/auth";
import type { ApiErrors } from "../types";

export async function apiFetch(input: RequestInfo | URL, init?: RequestInit) {
  const session = await fetchAuthSession();
  const accessToken = session.tokens?.accessToken.toString();
  const headers = new Headers(init?.headers);

  if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);

  return fetch(input, { ...init, headers });
}

export async function readError(response: Response): Promise<ApiErrors> {
  try {
    const body = (await response.json()) as ApiErrors & { message?: string };
    if (body.message) return { form: body.message };
    return body;
  } catch {
    return { form: `通信に失敗しました（${response.status}）` };
  }
}

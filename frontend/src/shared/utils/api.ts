import { fetchAuthSession } from "aws-amplify/auth";
import { expireAuthSession } from "../../auth/sessionEvents";
import type { ApiErrors } from "../types";

export async function apiFetch(input: RequestInfo | URL, init?: RequestInit) {
  let session;
  try {
    session = await fetchAuthSession();
  } catch (error) {
    if (
      error instanceof Error &&
      (error.name === "UserUnAuthenticatedException" ||
        error.name === "NotAuthorizedException")
    ) {
      await expireAuthSession();
    }
    throw error;
  }

  const accessToken = session.tokens?.accessToken.toString();
  const headers = new Headers(init?.headers);

  if (!accessToken) {
    await expireAuthSession();
    throw new Error("認証セッションの有効期限が切れています。");
  }

  headers.set("Authorization", `Bearer ${accessToken}`);

  const response = await fetch(input, { ...init, headers });

  if (response.status === 401) await expireAuthSession();

  return response;
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

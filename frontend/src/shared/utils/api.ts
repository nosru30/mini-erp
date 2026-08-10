import type { ApiErrors } from "../types";

export async function readError(response: Response): Promise<ApiErrors> {
  try {
    const body = (await response.json()) as ApiErrors & { message?: string };
    if (body.message) return { form: body.message };
    return body;
  } catch {
    return { form: `通信に失敗しました（${response.status}）` };
  }
}

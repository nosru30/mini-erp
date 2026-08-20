import { apiJson } from "../../shared/utils/api";
import type { AdminUser, AdminUserForm, AdminUserPage } from "./types";

export const adminUserKeys = { all: ["admin-users"] as const };
export const fetchAdminUsers = (nextToken: string | null) => {
  const parameters = new URLSearchParams({ limit: "60" });
  if (nextToken) parameters.set("nextToken", nextToken);
  return apiJson<AdminUserPage>(
    `/api/admin/users?${parameters}`,
    undefined,
    "ユーザー一覧を取得できませんでした。",
  );
};
export const createAdminUser = (form: AdminUserForm) =>
  apiJson<AdminUser>(
    "/api/admin/users",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: form.email.trim(),
        name: form.name.trim(),
      }),
    },
    "ユーザーを作成できませんでした。",
  );

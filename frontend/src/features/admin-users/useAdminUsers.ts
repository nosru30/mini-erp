import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";
import type { ApiErrors } from "../../shared/types";
import { apiFetch, readError } from "../../shared/utils/api";
import type { AdminUser, AdminUserForm, AdminUserPage } from "./types";

const initialForm: AdminUserForm = { email: "", name: "" };

export function useAdminUsers(
  query: string,
  showNotice: (message: string) => void,
  enabled: boolean,
) {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [nextToken, setNextToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [hasLoaded, setHasLoaded] = useState(false);
  const loadingRef = useRef(false);
  const [formOpen, setFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formErrors, setFormErrors] = useState<ApiErrors>({});
  const [form, setForm] = useState(initialForm);

  const loadUsers = useCallback(async (token?: string, append = false) => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    setLoadError("");
    try {
      const parameters = new URLSearchParams({ limit: "60" });
      if (token) parameters.set("nextToken", token);
      const response = await apiFetch(`/api/admin/users?${parameters}`);
      if (!response.ok) throw new Error("ユーザー一覧を取得できませんでした。");
      const page = (await response.json()) as AdminUserPage;
      setUsers((current) => (append ? [...current, ...page.users] : page.users));
      setNextToken(page.nextToken);
      setHasLoaded(true);
    } catch (error) {
      setLoadError(
        error instanceof Error
          ? error.message
          : "ユーザー一覧を取得できませんでした。",
      );
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (enabled && !hasLoaded) void loadUsers();
  }, [enabled, hasLoaded, loadUsers]);

  const filteredUsers = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("ja");
    return normalized
      ? users.filter((user) =>
          `${user.email ?? ""} ${user.name ?? ""} ${user.username}`
            .toLocaleLowerCase("ja")
            .includes(normalized),
        )
      : users;
  }, [query, users]);

  const openNew = () => {
    setForm(initialForm);
    setFormErrors({});
    setFormOpen(true);
  };

  const closeForm = () => {
    if (saving) return;
    setFormOpen(false);
    setFormErrors({});
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setFormErrors({});
    try {
      const response = await apiFetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email.trim(),
          name: form.name.trim(),
        }),
      });
      if (!response.ok) {
        setFormErrors(await readError(response));
        return;
      }
      const created = (await response.json()) as AdminUser;
      setUsers((current) => [created, ...current]);
      setFormOpen(false);
      setForm(initialForm);
      showNotice(`ユーザー「${created.email ?? created.username}」を作成しました。`);
    } catch {
      setFormErrors({ form: "サーバーに接続できませんでした。" });
    } finally {
      setSaving(false);
    }
  };

  return {
    users,
    filteredUsers,
    nextToken,
    loading: loading || (enabled && !hasLoaded && !loadError),
    loadError,
    loadUsers,
    loadNext: () => nextToken && loadUsers(nextToken, true),
    formOpen,
    saving,
    formErrors,
    form,
    setForm,
    openNew,
    closeForm,
    submit,
  };
}

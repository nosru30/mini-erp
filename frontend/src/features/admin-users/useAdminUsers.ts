import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
  type InfiniteData,
} from "@tanstack/react-query";
import { useMemo, useState, type FormEvent } from "react";
import type { ApiErrors } from "../../shared/types";
import { ApiError } from "../../shared/utils/api";
import { adminUserKeys, createAdminUser, fetchAdminUsers } from "./api";
import type { AdminUser, AdminUserForm, AdminUserPage } from "./types";

const initialForm: AdminUserForm = { email: "", name: "" };
const emptyUsers: AdminUser[] = [];

export function useAdminUsers(
  query: string,
  showNotice: (message: string) => void,
  enabled: boolean,
) {
  const queryClient = useQueryClient();
  const usersQuery = useInfiniteQuery({
    queryKey: adminUserKeys.all,
    queryFn: ({ pageParam }) => fetchAdminUsers(pageParam),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextToken ?? undefined,
    enabled,
  });
  const users = useMemo(
    () => usersQuery.data?.pages.flatMap((page) => page.users) ?? emptyUsers,
    [usersQuery.data],
  );
  const [formOpen, setFormOpen] = useState(false);
  const [formErrors, setFormErrors] = useState<ApiErrors>({});
  const [form, setForm] = useState(initialForm);
  const createMutation = useMutation({
    mutationFn: createAdminUser,
    onSuccess: (created) => {
      queryClient.setQueryData<InfiniteData<AdminUserPage, string | null>>(
        adminUserKeys.all,
        (current) =>
          current
            ? {
                ...current,
                pages: current.pages.map((page, index) =>
                  index === 0
                    ? { ...page, users: [created, ...page.users] }
                    : page,
                ),
              }
            : current,
      );
      setFormOpen(false);
      setForm(initialForm);
      showNotice(
        `ユーザー「${created.email ?? created.username}」を作成しました。`,
      );
    },
    onError: (error) =>
      setFormErrors(
        error instanceof ApiError
          ? error.fields
          : { form: "サーバーに接続できませんでした。" },
      ),
  });
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
    if (!createMutation.isPending) {
      setFormOpen(false);
      setFormErrors({});
    }
  };
  const submit = (event: FormEvent) => {
    event.preventDefault();
    setFormErrors({});
    createMutation.mutate(form);
  };
  const lastPage = usersQuery.data?.pages.at(-1);
  return {
    users,
    filteredUsers,
    nextToken: lastPage?.nextToken ?? null,
    loading: enabled && (usersQuery.isPending || usersQuery.isFetchingNextPage),
    loadError:
      usersQuery.error instanceof Error ? usersQuery.error.message : "",
    loadUsers: usersQuery.refetch,
    loadNext: usersQuery.fetchNextPage,
    formOpen,
    saving: createMutation.isPending,
    formErrors,
    form,
    setForm,
    openNew,
    closeForm,
    submit,
  };
}

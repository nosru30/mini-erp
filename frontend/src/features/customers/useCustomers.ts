import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState, type FormEvent } from "react";
import type { ApiErrors } from "../../shared/types";
import { ApiError } from "../../shared/utils/api";
import { customerKeys, fetchCustomers, saveCustomer } from "./api";
import type { Customer, CustomerForm } from "./types";

const initialForm: CustomerForm = {
  customerCode: "",
  name: "",
  email: "",
  phone: "",
  active: true,
};
const emptyCustomers: Customer[] = [];

export function useCustomers(
  query: string,
  showNotice: (message: string) => void,
  enabled: boolean,
) {
  const queryClient = useQueryClient();
  const customersQuery = useQuery({
    queryKey: customerKeys.all,
    queryFn: fetchCustomers,
    enabled,
  });
  const customers = customersQuery.data ?? emptyCustomers;
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formErrors, setFormErrors] = useState<ApiErrors>({});
  const [form, setForm] = useState(initialForm);
  const saveMutation = useMutation({
    mutationFn: saveCustomer,
    onSuccess: (saved, variables) => {
      queryClient.setQueryData<Customer[]>(customerKeys.all, (current = []) =>
        variables.id
          ? current.map((item) => (item.id === saved.id ? saved : item))
          : [...current, saved],
      );
      setFormOpen(false);
      setEditingId(null);
      showNotice(
        `顧客「${saved.name}」を${variables.id ? "更新" : "登録"}しました。`,
      );
    },
    onError: (error) =>
      setFormErrors(
        error instanceof ApiError
          ? error.fields
          : { form: "サーバーに接続できませんでした。" },
      ),
  });
  const filteredCustomers = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("ja");
    return normalized
      ? customers.filter((customer) =>
          `${customer.customerCode} ${customer.name} ${customer.email ?? ""} ${customer.phone ?? ""}`
            .toLocaleLowerCase("ja")
            .includes(normalized),
        )
      : customers;
  }, [customers, query]);
  const openNew = () => {
    setEditingId(null);
    setForm(initialForm);
    setFormErrors({});
    setFormOpen(true);
  };
  const openEdit = (customer: Customer) => {
    setEditingId(customer.id);
    setForm({
      customerCode: customer.customerCode,
      name: customer.name,
      email: customer.email ?? "",
      phone: customer.phone ?? "",
      active: customer.active,
    });
    setFormErrors({});
    setFormOpen(true);
  };
  const closeForm = () => {
    if (!saveMutation.isPending) {
      setFormOpen(false);
      setEditingId(null);
      setFormErrors({});
    }
  };
  const submit = (event: FormEvent) => {
    event.preventDefault();
    setFormErrors({});
    saveMutation.mutate({ id: editingId, form });
  };
  return {
    customers,
    filteredCustomers,
    loading: enabled && customersQuery.isPending,
    loadError:
      customersQuery.error instanceof Error ? customersQuery.error.message : "",
    loadCustomers: customersQuery.refetch,
    formOpen,
    editing: editingId !== null,
    saving: saveMutation.isPending,
    formErrors,
    form,
    setForm,
    openNew,
    openEdit,
    closeForm,
    submit,
  };
}

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";
import type { ApiErrors } from "../../shared/types";
import { readError } from "../../shared/utils/api";
import type { Customer, CustomerForm } from "./types";

const initialForm: CustomerForm = {
  customerCode: "",
  name: "",
  email: "",
  phone: "",
  active: true,
};

export function useCustomers(
  query: string,
  showNotice: (message: string) => void,
  enabled: boolean,
) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [hasLoaded, setHasLoaded] = useState(false);
  const loadingRef = useRef(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [formErrors, setFormErrors] = useState<ApiErrors>({});
  const [form, setForm] = useState(initialForm);

  const loadCustomers = useCallback(async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    setLoadError("");
    try {
      const response = await fetch("/api/customers");
      if (!response.ok) throw new Error("顧客マスタを取得できませんでした。");
      setCustomers((await response.json()) as Customer[]);
      setHasLoaded(true);
    } catch (error) {
      setLoadError(
        error instanceof Error
          ? error.message
          : "顧客マスタを取得できませんでした。",
      );
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    if (enabled && !hasLoaded) void loadCustomers();
  }, [enabled, hasLoaded, loadCustomers]);

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
    if (saving) return;
    setFormOpen(false);
    setEditingId(null);
    setFormErrors({});
  };
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setFormErrors({});
    try {
      const response = await fetch(
        editingId ? `/api/customers/${editingId}` : "/api/customers",
        {
          method: editingId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customerCode: form.customerCode.trim(),
            name: form.name.trim(),
            email: form.email.trim() || null,
            phone: form.phone.trim() || null,
            active: form.active,
          }),
        },
      );
      if (!response.ok) {
        setFormErrors(await readError(response));
        return;
      }
      const saved = (await response.json()) as Customer;
      setCustomers((current) =>
        editingId
          ? current.map((customer) =>
              customer.id === saved.id ? saved : customer,
            )
          : [...current, saved],
      );
      setFormOpen(false);
      setEditingId(null);
      showNotice(
        `顧客「${saved.name}」を${editingId ? "更新" : "登録"}しました。`,
      );
    } catch {
      setFormErrors({ form: "サーバーに接続できませんでした。" });
    } finally {
      setSaving(false);
    }
  };
  return {
    customers,
    filteredCustomers,
    loading: loading || (enabled && !hasLoaded && !loadError),
    loadError,
    loadCustomers,
    formOpen,
    editing: editingId !== null,
    saving,
    formErrors,
    form,
    setForm,
    openNew,
    openEdit,
    closeForm,
    submit,
  };
}

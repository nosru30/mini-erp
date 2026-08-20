import { apiJson } from "../../shared/utils/api";
import type { Customer, CustomerForm } from "./types";

export const customerKeys = { all: ["customers"] as const };
export const fetchCustomers = () =>
  apiJson<Customer[]>(
    "/api/customers",
    undefined,
    "顧客マスタを取得できませんでした。",
  );
export const saveCustomer = ({
  id,
  form,
}: {
  id: number | null;
  form: CustomerForm;
}) =>
  apiJson<Customer>(
    id ? `/api/customers/${id}` : "/api/customers",
    {
      method: id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerCode: form.customerCode.trim(),
        name: form.name.trim(),
        email: form.email.trim() || null,
        phone: form.phone.trim() || null,
        active: form.active,
      }),
    },
    "顧客を保存できませんでした。",
  );

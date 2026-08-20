import { apiJson } from "../../shared/utils/api";
import type {
  SalesOrderDetail,
  SalesOrderSummary,
  SavedSalesOrder,
} from "./types";

export type OrderAction = "confirm" | "cancel";
export type SaveOrderInput = {
  id: number | null;
  customerCode: string;
  orderDate: string;
  items: { productCode: string; quantity: number }[];
};
export const salesOrderKeys = {
  all: ["sales-orders"] as const,
  detail: (id: number) => ["sales-orders", id] as const,
};
export const fetchSalesOrders = () =>
  apiJson<SalesOrderSummary[]>(
    "/api/sales-orders",
    undefined,
    "受注情報を取得できませんでした。",
  );
export const fetchSalesOrder = (id: number) =>
  apiJson<SalesOrderDetail>(
    `/api/sales-orders/${id}`,
    undefined,
    "受注情報を取得できませんでした。",
  );
export const saveSalesOrder = ({ id, ...body }: SaveOrderInput) =>
  apiJson<SavedSalesOrder>(
    id ? `/api/sales-orders/${id}` : "/api/sales-orders",
    {
      method: id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
    "受注を保存できませんでした。",
  );
export const changeSalesOrderStatus = ({
  id,
  action,
}: {
  id: number;
  action: OrderAction;
}) =>
  apiJson<SalesOrderDetail>(
    `/api/sales-orders/${id}/${action}`,
    { method: "POST" },
    "受注状態を変更できませんでした。",
  );

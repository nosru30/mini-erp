import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { apiFetch, readError } from "../../shared/utils/api";
import type {
  SalesOrderDetail,
  SalesOrderSummary,
  SavedSalesOrder,
} from "./types";

type OrderAction = "confirm" | "cancel";

function toSummary(order: SalesOrderDetail): SalesOrderSummary {
  const {
    id,
    orderNumber,
    customerId,
    customerCode,
    customerName,
    orderDate,
    status,
    totalAmount,
  } = order;
  return {
    id,
    orderNumber,
    customerId,
    customerCode,
    customerName,
    orderDate,
    status,
    totalAmount,
  };
}

export function useSalesOrders(
  query: string,
  showNotice: (message: string) => void,
  enabled: boolean,
) {
  const [orders, setOrders] = useState<SalesOrderSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [hasLoaded, setHasLoaded] = useState(false);
  const loadingRef = useRef(false);
  const [selectedOrder, setSelectedOrder] = useState<SalesOrderDetail | null>(
    null,
  );
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");
  const [action, setAction] = useState<OrderAction | null>(null);
  const [actionError, setActionError] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<SalesOrderDetail | null>(
    null,
  );

  const loadOrders = useCallback(async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    setLoadError("");
    try {
      const response = await apiFetch("/api/sales-orders");
      if (!response.ok) throw new Error("受注情報を取得できませんでした。");
      setOrders((await response.json()) as SalesOrderSummary[]);
      setHasLoaded(true);
    } catch (error) {
      setLoadError(
        error instanceof Error
          ? error.message
          : "受注情報を取得できませんでした。",
      );
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    if (enabled && !hasLoaded) void loadOrders();
  }, [enabled, hasLoaded, loadOrders]);

  const filteredOrders = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("ja");
    return normalized
      ? orders.filter((order) =>
          `${order.orderNumber} ${order.customerCode} ${order.customerName}`
            .toLocaleLowerCase("ja")
            .includes(normalized),
        )
      : orders;
  }, [orders, query]);
  const openNew = () => {
    setEditingOrder(null);
    setFormOpen(true);
  };
  const openEdit = (order: SalesOrderDetail) => {
    setDetailOpen(false);
    setEditingOrder(order);
    setFormOpen(true);
  };
  const closeForm = () => {
    setFormOpen(false);
    setEditingOrder(null);
  };
  const handleSaved = (saved: SavedSalesOrder, editing: boolean) => {
    const summary = toSummary(saved);
    setOrders((current) =>
      editing
        ? current.map((order) => (order.id === saved.id ? summary : order))
        : [summary, ...current],
    );
    closeForm();
    showNotice(
      `受注「${saved.orderNumber}」を${editing ? "更新" : "登録"}しました。`,
    );
  };

  const openDetail = async (id: number) => {
    setDetailOpen(true);
    setDetailLoading(true);
    setDetailError("");
    setSelectedOrder(null);
    try {
      const response = await apiFetch(`/api/sales-orders/${id}`);
      if (!response.ok) throw new Error("受注情報を取得できませんでした。");
      setSelectedOrder((await response.json()) as SalesOrderDetail);
    } catch (error) {
      setDetailError(
        error instanceof Error
          ? error.message
          : "受注情報を取得できませんでした。",
      );
    } finally {
      setDetailLoading(false);
    }
  };
  const closeDetail = () => {
    setDetailOpen(false);
    setSelectedOrder(null);
    setDetailError("");
  };
  const changeStatus = async (
    order: SalesOrderDetail,
    nextAction: OrderAction,
  ) => {
    const confirmed = window.confirm(
      nextAction === "confirm"
        ? "この受注を確定します。確定後は受注内容を編集できません。よろしいですか？"
        : "この受注をキャンセルします。よろしいですか？",
    );
    if (!confirmed) return;
    setAction(nextAction);
    setActionError("");
    try {
      const response = await apiFetch(
        `/api/sales-orders/${order.id}/${nextAction}`,
        { method: "POST" },
      );
      if (!response.ok) {
        const errors = await readError(response);
        throw new Error(
          errors.form ??
            Object.values(errors)[0] ??
            "受注状態を変更できませんでした。",
        );
      }
      const updated = (await response.json()) as SalesOrderDetail;
      setSelectedOrder(updated);
      setOrders((current) =>
        current.map((item) =>
          item.id === updated.id ? toSummary(updated) : item,
        ),
      );
      showNotice(
        `受注「${updated.orderNumber}」を${nextAction === "confirm" ? "確定" : "キャンセル"}しました。`,
      );
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : "受注状態を変更できませんでした。",
      );
    } finally {
      setAction(null);
    }
  };

  return {
    orders,
    filteredOrders,
    loading: loading || (enabled && !hasLoaded && !loadError),
    loadError,
    loadOrders,
    formOpen,
    editingOrder,
    openNew,
    openEdit,
    closeForm,
    handleSaved,
    detailOpen,
    selectedOrder,
    detailLoading,
    detailError,
    action,
    actionError,
    openDetail,
    closeDetail,
    changeStatus,
  };
}

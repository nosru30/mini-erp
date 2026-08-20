import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
  changeSalesOrderStatus,
  fetchSalesOrder,
  fetchSalesOrders,
  salesOrderKeys,
  type OrderAction,
} from "./api";
import type {
  SalesOrderDetail,
  SalesOrderSummary,
  SavedSalesOrder,
} from "./types";

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
const emptyOrders: SalesOrderSummary[] = [];

export function useSalesOrders(
  query: string,
  showNotice: (message: string) => void,
  enabled: boolean,
) {
  const queryClient = useQueryClient();
  const ordersQuery = useQuery({
    queryKey: salesOrderKeys.all,
    queryFn: fetchSalesOrders,
    enabled,
  });
  const orders = ordersQuery.data ?? emptyOrders;
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<SalesOrderDetail | null>(
    null,
  );
  const detailQuery = useQuery({
    queryKey: salesOrderKeys.detail(selectedOrderId ?? 0),
    queryFn: () => fetchSalesOrder(selectedOrderId!),
    enabled: detailOpen && selectedOrderId !== null,
  });
  const statusMutation = useMutation({
    mutationFn: changeSalesOrderStatus,
    onSuccess: (updated, variables) => {
      const actionLabel = variables.action === "confirm" ? "確定" : "キャンセル";
      queryClient.setQueryData(salesOrderKeys.detail(updated.id), updated);
      queryClient.setQueryData<SalesOrderSummary[]>(
        salesOrderKeys.all,
        (current = []) =>
          current.map((item) =>
            item.id === updated.id ? toSummary(updated) : item,
          ),
      );
      showNotice(
        `受注「${updated.orderNumber}」を${actionLabel}しました。`,
      );
    },
  });
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
    queryClient.setQueryData<SalesOrderSummary[]>(
      salesOrderKeys.all,
      (current = []) =>
        editing
          ? current.map((order) =>
              order.id === saved.id ? toSummary(saved) : order,
            )
          : [toSummary(saved), ...current],
    );
    queryClient.setQueryData(salesOrderKeys.detail(saved.id), saved);
    closeForm();
    showNotice(
      `受注「${saved.orderNumber}」を${editing ? "更新" : "登録"}しました。`,
    );
  };
  const openDetail = (id: number) => {
    statusMutation.reset();
    setSelectedOrderId(id);
    setDetailOpen(true);
  };
  const closeDetail = () => {
    setDetailOpen(false);
    setSelectedOrderId(null);
    statusMutation.reset();
  };
  const changeStatus = (order: SalesOrderDetail, action: OrderAction) => {
    const confirmed = window.confirm(
      action === "confirm"
        ? "この受注を確定します。" +
            "確定後は受注内容を編集できません。よろしいですか？"
        : "この受注をキャンセルします。よろしいですか？",
    );
    if (confirmed) {
      statusMutation.reset();
      statusMutation.mutate({ id: order.id, action });
    }
  };
  return {
    orders,
    filteredOrders,
    loading: enabled && ordersQuery.isPending,
    loadError:
      ordersQuery.error instanceof Error ? ordersQuery.error.message : "",
    loadOrders: ordersQuery.refetch,
    formOpen,
    editingOrder,
    openNew,
    openEdit,
    closeForm,
    handleSaved,
    detailOpen,
    selectedOrder: detailQuery.data ?? null,
    detailLoading: detailQuery.isPending,
    detailError:
      detailQuery.error instanceof Error ? detailQuery.error.message : "",
    action: statusMutation.isPending
      ? (statusMutation.variables?.action ?? null)
      : null,
    actionError:
      statusMutation.error instanceof Error ? statusMutation.error.message : "",
    openDetail,
    closeDetail,
    changeStatus,
  };
}

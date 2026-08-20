import type { SalesOrderStatus } from "../../features/sales-orders/types";
import type { MasterKind } from "../types";

export function OrderStatusBadge({ status }: { status: SalesOrderStatus }) {
  const labels: Record<SalesOrderStatus, string> = {
    DRAFT: "下書き",
    CONFIRMED: "確定",
    CANCELLED: "キャンセル",
  };

  return (
    <span className={`order-status status-${status.toLowerCase()}`}>
      {labels[status]}
    </span>
  );
}

export function StatusBadge({ active }: { active: boolean }) {
  return (
    <span className={`status-badge ${active ? "is-active" : "is-inactive"}`}>
      <span className="status-dot" />
      {active ? "有効" : "無効"}
    </span>
  );
}

export function EmptyState({ kind }: { kind: MasterKind }) {
  const mark =
    kind === "products"
      ? "商"
      : kind === "customers"
        ? "顧"
        : kind === "users"
          ? "人"
          : "受";
  const description =
    kind === "salesOrders"
      ? "検索条件を変更するか、受注登録後に再読み込みしてください。"
      : "検索条件を変更するか、新しいデータを登録してください。";

  return (
    <div className="empty-state">
      <div className="empty-mark">{mark}</div>
      <h3>該当するデータがありません</h3>
      <p>{description}</p>
    </div>
  );
}

export function ScreenLoading() {
  return (
    <div className="table-loading" aria-live="polite">
      <span className="spinner" />
      データを読み込んでいます
    </div>
  );
}

export function ScreenError({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="error-state">
      <strong>データを取得できませんでした</strong>
      <p>{message}</p>
      <button onClick={onRetry}>再読み込み</button>
    </div>
  );
}

export function SearchToolbar({
  query,
  onQueryChange,
  placeholder,
  filteredCount,
  totalCount,
}: {
  query: string;
  onQueryChange: (query: string) => void;
  placeholder: string;
  filteredCount: number;
  totalCount: number;
}) {
  return (
    <div className="panel-toolbar">
      <div className="search-box">
        <span aria-hidden="true">⌕</span>
        <input
          type="search"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder={placeholder}
          aria-label="一覧を検索"
        />
        {query && (
          <button onClick={() => onQueryChange("")} aria-label="検索をクリア">
            ×
          </button>
        )}
      </div>
      <p className="result-count">
        <strong>{filteredCount}</strong> / {totalCount} 件
      </p>
    </div>
  );
}

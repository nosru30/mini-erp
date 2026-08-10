import {
  EmptyState,
  OrderStatusBadge,
  ScreenError,
  ScreenLoading,
  SearchToolbar,
} from "../../shared/components/ScreenParts";
import { formatCurrency, formatDate } from "../../shared/utils/format";
import type { SalesOrderSummary } from "./types";

type Props = {
  orders: SalesOrderSummary[];
  filteredOrders: SalesOrderSummary[];
  query: string;
  loading: boolean;
  loadError: string;
  onQueryChange: (query: string) => void;
  onCreate: () => void;
  onOpenDetail: (id: number) => void;
  onRetry: () => void;
};

export default function SalesOrdersScreen({
  orders,
  filteredOrders,
  query,
  loading,
  loadError,
  onQueryChange,
  onCreate,
  onOpenDetail,
  onRetry,
}: Props) {
  return (
    <main className="workspace">
      <header className="topbar">
        <div>
          <p className="eyebrow">SALES ORDERS</p>
          <h1>受注一覧</h1>
          <p className="page-description">受注状況と取引金額を確認します。</p>
        </div>
        <button className="primary-button" onClick={onCreate}>
          <span aria-hidden="true">＋</span>受注を登録
        </button>
      </header>
      <section className="summary-grid" aria-label="登録状況">
        <article className="summary-card accent-card">
          <p>受注件数</p>
          <strong>{orders.length}</strong>
          <span>sales orders</span>
        </article>
        <article className="summary-card">
          <p>受注金額</p>
          <strong className="summary-amount">
            {formatCurrency(
              orders.reduce((sum, order) => sum + Number(order.totalAmount), 0),
            )}
          </strong>
          <span>全受注の合計</span>
        </article>
        <article className="summary-card">
          <p>未確定</p>
          <strong>
            {orders.filter((order) => order.status === "DRAFT").length}
          </strong>
          <span>下書きの受注</span>
        </article>
      </section>
      <section className="data-panel">
        <SearchToolbar
          query={query}
          onQueryChange={onQueryChange}
          placeholder="受注番号・顧客コード・顧客名で検索"
          filteredCount={filteredOrders.length}
          totalCount={orders.length}
        />
        {loading ? (
          <ScreenLoading />
        ) : loadError ? (
          <ScreenError message={loadError} onRetry={onRetry} />
        ) : filteredOrders.length ? (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>受注番号</th>
                  <th>受注日</th>
                  <th>顧客</th>
                  <th>状態</th>
                  <th className="number-cell">受注金額</th>
                  <th className="action-cell">操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id}>
                    <td>
                      <strong className="order-number">
                        {order.orderNumber}
                      </strong>
                    </td>
                    <td className="muted">{formatDate(order.orderDate)}</td>
                    <td>
                      <span className="customer-name">
                        {order.customerName}
                      </span>
                      <span className="customer-code">
                        {order.customerCode}
                      </span>
                    </td>
                    <td>
                      <OrderStatusBadge status={order.status} />
                    </td>
                    <td className="number-cell price">
                      {formatCurrency(order.totalAmount)}
                    </td>
                    <td className="action-cell">
                      <button
                        className="edit-button"
                        onClick={() => onOpenDetail(order.id)}
                      >
                        詳細
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState kind="salesOrders" />
        )}
      </section>
    </main>
  );
}

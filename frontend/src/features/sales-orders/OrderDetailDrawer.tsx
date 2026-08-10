import { OrderStatusBadge } from "../../shared/components/ScreenParts";
import { formatCurrency, formatDate } from "../../shared/utils/format";
import type { SalesOrderDetail } from "./types";

type OrderAction = "confirm" | "cancel";

type Props = {
  order: SalesOrderDetail | null;
  loading: boolean;
  error: string;
  action: OrderAction | null;
  actionError: string;
  onClose: () => void;
  onEdit: (order: SalesOrderDetail) => void;
  onChangeStatus: (order: SalesOrderDetail, action: OrderAction) => void;
};

export default function OrderDetailDrawer({
  order,
  loading,
  error,
  action,
  actionError,
  onClose,
  onEdit,
  onChangeStatus,
}: Props) {
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="form-drawer order-detail-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-detail-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="drawer-header">
          <div>
            <p className="eyebrow">SALES ORDER DETAIL</p>
            <h2 id="order-detail-title">受注詳細</h2>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="閉じる">
            ×
          </button>
        </div>
        {loading ? (
          <div className="detail-loading">
            <span className="spinner" />
            受注情報を読み込んでいます
          </div>
        ) : error ? (
          <div className="error-state detail-error">
            <strong>詳細を取得できませんでした</strong>
            <p>{error}</p>
          </div>
        ) : order ? (
          <>
            <div className="order-detail-heading">
              <div>
                <span>受注番号</span>
                <strong>{order.orderNumber}</strong>
              </div>
              <div className="detail-heading-actions">
                <OrderStatusBadge status={order.status} />
                {order.status === "DRAFT" && (
                  <button
                    className="detail-edit-button"
                    onClick={() => onEdit(order)}
                  >
                    編集
                  </button>
                )}
              </div>
            </div>
            <dl className="detail-grid">
              <div>
                <dt>受注日</dt>
                <dd>{formatDate(order.orderDate)}</dd>
              </div>
              <div>
                <dt>顧客コード</dt>
                <dd>{order.customerCode}</dd>
              </div>
              <div className="detail-customer">
                <dt>顧客名</dt>
                <dd>{order.customerName}</dd>
              </div>
            </dl>
            <section className="items-section">
              <div className="section-heading">
                <h3>受注明細</h3>
                <span>{order.items.length} 件</span>
              </div>
              <div className="detail-table-scroll">
                <table className="detail-table">
                  <thead>
                    <tr>
                      <th>商品</th>
                      <th className="number-cell">数量</th>
                      <th className="number-cell">単価</th>
                      <th className="number-cell">金額</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <span className="item-name">{item.productName}</span>
                          <span className="customer-code">
                            {item.productCode}
                          </span>
                        </td>
                        <td className="number-cell">{item.quantity}</td>
                        <td className="number-cell muted">
                          {formatCurrency(item.unitPrice)}
                        </td>
                        <td className="number-cell price">
                          {formatCurrency(item.lineAmount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
            <div className="order-total">
              <span>受注金額合計</span>
              <strong>{formatCurrency(order.totalAmount)}</strong>
            </div>
            {actionError && (
              <div className="form-alert order-action-error">{actionError}</div>
            )}
            {order.status !== "CANCELLED" && (
              <div className="order-action-panel">
                <div>
                  <strong>受注操作</strong>
                  <span>
                    {order.status === "DRAFT"
                      ? "内容を確認して受注を確定します。"
                      : "確定済み受注をキャンセルできます。"}
                  </span>
                </div>
                <div className="order-action-buttons">
                  {order.status === "DRAFT" && (
                    <button
                      className="confirm-order-button"
                      disabled={action !== null}
                      onClick={() => onChangeStatus(order, "confirm")}
                    >
                      {action === "confirm" ? "確定中…" : "受注を確定"}
                    </button>
                  )}
                  <button
                    className="cancel-order-button"
                    disabled={action !== null}
                    onClick={() => onChangeStatus(order, "cancel")}
                  >
                    {action === "cancel" ? "処理中…" : "キャンセル"}
                  </button>
                </div>
              </div>
            )}
            <div className="detail-timestamps">
              <span>登録日時 {formatDate(order.createdAt)}</span>
              <span>更新日時 {formatDate(order.updatedAt)}</span>
            </div>
          </>
        ) : null}
      </section>
    </div>
  );
}

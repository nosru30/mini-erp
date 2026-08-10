import type { MasterKind } from "../shared/types";

type Props = {
  activeKind: MasterKind;
  salesOrderCount: number;
  productCount: number;
  customerCount: number;
  hasError: boolean;
  onNavigate: (kind: MasterKind) => void;
};

export default function AppSidebar({
  activeKind,
  salesOrderCount,
  productCount,
  customerCount,
  hasError,
  onNavigate,
}: Props) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="brand-mark">M</span>
        <div>
          <strong>Mini ERP</strong>
          <span>Operations</span>
        </div>
      </div>
      <nav aria-label="メインナビゲーション">
        <p className="nav-label">販売管理</p>
        <button
          className={
            activeKind === "salesOrders" ? "nav-item active" : "nav-item"
          }
          onClick={() => onNavigate("salesOrders")}
        >
          <span className="nav-icon">S</span>受注一覧
          <span className="nav-count">{salesOrderCount}</span>
        </button>
        <p className="nav-label nav-section">マスタ管理</p>
        <button
          className={activeKind === "products" ? "nav-item active" : "nav-item"}
          onClick={() => onNavigate("products")}
        >
          <span className="nav-icon">P</span>商品マスタ
          <span className="nav-count">{productCount}</span>
        </button>
        <button
          className={
            activeKind === "customers" ? "nav-item active" : "nav-item"
          }
          onClick={() => onNavigate("customers")}
        >
          <span className="nav-icon">C</span>顧客マスタ
          <span className="nav-count">{customerCount}</span>
        </button>
      </nav>
      <div className="sidebar-footer">
        <span className={`connection-dot ${hasError ? "error" : ""}`} />
        {hasError ? "API 接続エラー" : "システム稼働中"}
      </div>
    </aside>
  );
}

import type { MasterKind } from "../shared/types";

type Props = {
  activeKind: MasterKind;
  hasError: boolean;
  username: string;
  isAdmin: boolean;
  onNavigate: (kind: MasterKind) => void;
  onSignOut: () => void;
};

export default function AppSidebar({
  activeKind,
  hasError,
  username,
  isAdmin,
  onNavigate,
  onSignOut,
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
        </button>
        <p className="nav-label nav-section">マスタ管理</p>
        <button
          className={activeKind === "products" ? "nav-item active" : "nav-item"}
          onClick={() => onNavigate("products")}
        >
          <span className="nav-icon">P</span>商品マスタ
        </button>
        <button
          className={
            activeKind === "customers" ? "nav-item active" : "nav-item"
          }
          onClick={() => onNavigate("customers")}
        >
          <span className="nav-icon">C</span>顧客マスタ
        </button>
        {isAdmin && (
          <>
            <p className="nav-label nav-section">システム管理</p>
            <button
              className={activeKind === "users" ? "nav-item active" : "nav-item"}
              onClick={() => onNavigate("users")}
            >
              <span className="nav-icon">U</span>ユーザー管理
            </button>
          </>
        )}
      </nav>
      <div className="sidebar-account">
        <span>ログイン中</span>
        <strong title={username}>{username}</strong>
        <button onClick={onSignOut}>ログアウト</button>
      </div>
      <div className="sidebar-footer">
        <span className={`connection-dot ${hasError ? "error" : ""}`} />
        {hasError ? "API 接続エラー" : "システム稼働中"}
      </div>
    </aside>
  );
}

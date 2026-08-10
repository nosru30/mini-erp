import {
  EmptyState,
  ScreenError,
  ScreenLoading,
  SearchToolbar,
  StatusBadge,
} from "../../shared/components/ScreenParts";
import type { Customer } from "./types";

type Props = {
  customers: Customer[];
  filteredCustomers: Customer[];
  query: string;
  loading: boolean;
  loadError: string;
  onQueryChange: (query: string) => void;
  onCreate: () => void;
  onEdit: (customer: Customer) => void;
  onRetry: () => void;
};

export default function CustomersScreen({
  customers,
  filteredCustomers,
  query,
  loading,
  loadError,
  onQueryChange,
  onCreate,
  onEdit,
  onRetry,
}: Props) {
  return (
    <main className="workspace">
      <header className="topbar">
        <div>
          <p className="eyebrow">MASTER DATA</p>
          <h1>顧客マスタ</h1>
          <p className="page-description">
            取引先の基本情報と連絡先を登録・検索します。
          </p>
        </div>
        <button className="primary-button" onClick={onCreate}>
          <span aria-hidden="true">＋</span>顧客を登録
        </button>
      </header>
      <section className="summary-grid" aria-label="登録状況">
        <article className="summary-card accent-card">
          <p>登録件数</p>
          <strong>{customers.length}</strong>
          <span>customers</span>
        </article>
        <article className="summary-card">
          <p>有効</p>
          <strong>{customers.filter((item) => item.active).length}</strong>
          <span>現在利用可能</span>
        </article>
        <article className="summary-card">
          <p>無効</p>
          <strong>{customers.filter((item) => !item.active).length}</strong>
          <span>利用停止中</span>
        </article>
      </section>
      <section className="data-panel">
        <SearchToolbar
          query={query}
          onQueryChange={onQueryChange}
          placeholder="顧客コード・顧客名・連絡先で検索"
          filteredCount={filteredCustomers.length}
          totalCount={customers.length}
        />
        {loading ? (
          <ScreenLoading />
        ) : loadError ? (
          <ScreenError message={loadError} onRetry={onRetry} />
        ) : filteredCustomers.length ? (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>顧客コード</th>
                  <th>顧客名</th>
                  <th>メールアドレス</th>
                  <th>電話番号</th>
                  <th>状態</th>
                  <th className="action-cell">操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id}>
                    <td>
                      <span className="code-chip">{customer.customerCode}</span>
                    </td>
                    <td>
                      <strong className="primary-text">{customer.name}</strong>
                    </td>
                    <td className="muted">{customer.email || "—"}</td>
                    <td className="muted">{customer.phone || "—"}</td>
                    <td>
                      <StatusBadge active={customer.active} />
                    </td>
                    <td className="action-cell">
                      <button
                        className="edit-button"
                        onClick={() => onEdit(customer)}
                      >
                        編集
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState kind="customers" />
        )}
      </section>
    </main>
  );
}

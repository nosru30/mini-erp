import {
  EmptyState,
  ScreenError,
  ScreenLoading,
  SearchToolbar,
  StatusBadge,
} from "../../shared/components/ScreenParts";
import { formatCurrency, formatDate } from "../../shared/utils/format";
import type { Product } from "./types";

type Props = {
  products: Product[];
  filteredProducts: Product[];
  query: string;
  loading: boolean;
  loadError: string;
  onQueryChange: (query: string) => void;
  onCreate: () => void;
  onEdit: (product: Product) => void;
  onRetry: () => void;
};

export default function ProductsScreen({
  products,
  filteredProducts,
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
          <h1>商品マスタ</h1>
          <p className="page-description">
            販売商品と基準単価を登録・検索します。
          </p>
        </div>
        <button className="primary-button" onClick={onCreate}>
          <span aria-hidden="true">＋</span>商品を登録
        </button>
      </header>
      <section className="summary-grid" aria-label="登録状況">
        <article className="summary-card accent-card">
          <p>登録件数</p>
          <strong>{products.length}</strong>
          <span>products</span>
        </article>
        <article className="summary-card">
          <p>有効</p>
          <strong>{products.filter((item) => item.active).length}</strong>
          <span>現在利用可能</span>
        </article>
        <article className="summary-card">
          <p>無効</p>
          <strong>{products.filter((item) => !item.active).length}</strong>
          <span>利用停止中</span>
        </article>
      </section>
      <section className="data-panel">
        <SearchToolbar
          query={query}
          onQueryChange={onQueryChange}
          placeholder="商品コード・商品名で検索"
          filteredCount={filteredProducts.length}
          totalCount={products.length}
        />
        {loading ? (
          <ScreenLoading />
        ) : loadError ? (
          <ScreenError message={loadError} onRetry={onRetry} />
        ) : filteredProducts.length ? (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>商品コード</th>
                  <th>商品名</th>
                  <th className="number-cell">単価</th>
                  <th>状態</th>
                  <th>更新日</th>
                  <th className="action-cell">操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <span className="code-chip">{product.productCode}</span>
                    </td>
                    <td>
                      <strong className="primary-text">{product.name}</strong>
                    </td>
                    <td className="number-cell price">
                      {formatCurrency(product.unitPrice)}
                    </td>
                    <td>
                      <StatusBadge active={product.active} />
                    </td>
                    <td className="muted">{formatDate(product.updatedAt)}</td>
                    <td className="action-cell">
                      <button
                        className="edit-button"
                        onClick={() => onEdit(product)}
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
          <EmptyState kind="products" />
        )}
      </section>
    </main>
  );
}

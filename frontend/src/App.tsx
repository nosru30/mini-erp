import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import "./App.css";
import OrderFormDrawer, { type SavedSalesOrder } from "./OrderFormDrawer";

type MasterKind = "salesOrders" | "products" | "customers";
type ApiErrors = Record<string, string>;

type Product = {
  id: number;
  productCode: string;
  name: string;
  unitPrice: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

type Customer = {
  id: number;
  customerCode: string;
  name: string;
  email: string | null;
  phone: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

type SalesOrderStatus = "DRAFT" | "CONFIRMED" | "CANCELLED";

type SalesOrderSummary = {
  id: number;
  orderNumber: string;
  customerId: number;
  customerCode: string;
  customerName: string;
  orderDate: string;
  status: SalesOrderStatus;
  totalAmount: number;
};

type SalesOrderItem = {
  id: number;
  productId: number;
  productCode: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  lineAmount: number;
};

type SalesOrderDetail = SalesOrderSummary & {
  items: SalesOrderItem[];
  createdAt: string;
  updatedAt: string;
};

type ProductForm = {
  productCode: string;
  name: string;
  unitPrice: string;
  active: boolean;
};

type CustomerForm = {
  customerCode: string;
  name: string;
  email: string;
  phone: string;
  active: boolean;
};

const initialProductForm: ProductForm = {
  productCode: "",
  name: "",
  unitPrice: "",
  active: true,
};

const initialCustomerForm: CustomerForm = {
  customerCode: "",
  name: "",
  email: "",
  phone: "",
  active: true,
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency: "JPY",
    maximumFractionDigits: 2,
  }).format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value));
}

async function readError(response: Response): Promise<ApiErrors> {
  try {
    const body = (await response.json()) as ApiErrors & { message?: string };
    if (body.message) return { form: body.message };
    return body;
  } catch {
    return { form: `通信に失敗しました（${response.status}）` };
  }
}

function OrderStatusBadge({ status }: { status: SalesOrderStatus }) {
  const labels: Record<SalesOrderStatus, string> = {
    DRAFT: "下書き",
    CONFIRMED: "確定",
    CANCELLED: "キャンセル",
  };

  return <span className={`order-status status-${status.toLowerCase()}`}>{labels[status]}</span>;
}

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span className={`status-badge ${active ? "is-active" : "is-inactive"}`}>
      <span className="status-dot" />
      {active ? "有効" : "無効"}
    </span>
  );
}

function EmptyState({ kind }: { kind: MasterKind }) {
  return (
    <div className="empty-state">
      <div className="empty-mark">{kind === "products" ? "商" : kind === "customers" ? "顧" : "受"}</div>
      <h3>該当するデータがありません</h3>
      <p>{kind === "salesOrders" ? "検索条件を変更するか、受注登録後に再読み込みしてください。" : "検索条件を変更するか、新しいデータを登録してください。"}</p>
    </div>
  );
}

function App() {
  const [activeKind, setActiveKind] = useState<MasterKind>("salesOrders");
const [salesOrders, setSalesOrders] = useState<SalesOrderSummary[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<SalesOrderDetail | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
const [detailError, setDetailError] = useState("");
  const [orderAction, setOrderAction] = useState<"confirm" | "cancel" | null>(null);
  const [orderActionError, setOrderActionError] = useState("");
  const [orderFormOpen, setOrderFormOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<SalesOrderDetail | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [formErrors, setFormErrors] = useState<ApiErrors>({});
  const [productForm, setProductForm] = useState(initialProductForm);
  const [customerForm, setCustomerForm] = useState(initialCustomerForm);
  const [notice, setNotice] = useState("");

  const loadMasters = useCallback(async () => {
    setLoading(true);
    setLoadError("");

    try {
      const [salesOrderResponse, productResponse, customerResponse] = await Promise.all([
        fetch("/api/sales-orders"),
        fetch("/api/products"),
        fetch("/api/customers"),
      ]);

      if (!salesOrderResponse.ok || !productResponse.ok || !customerResponse.ok) {
        throw new Error("マスタデータを取得できませんでした。");
      }

      const [salesOrderData, productData, customerData] = await Promise.all([
        salesOrderResponse.json() as Promise<SalesOrderSummary[]>,
        productResponse.json() as Promise<Product[]>,
        customerResponse.json() as Promise<Customer[]>,
      ]);

      setSalesOrders(salesOrderData);
      setProducts(productData);
      setCustomers(customerData);
    } catch (error) {
      setLoadError(
        error instanceof Error
          ? error.message
          : "マスタデータを取得できませんでした。",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadMasters();
  }, [loadMasters]);

  useEffect(() => {
    setQuery("");
    setFormErrors({});
    setFormOpen(false);
    setEditingId(null);
  }, [activeKind]);

  const filteredSalesOrders = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("ja");
    if (!normalized) return salesOrders;
    return salesOrders.filter((order) =>
      `${order.orderNumber} ${order.customerCode} ${order.customerName}`
        .toLocaleLowerCase("ja")
        .includes(normalized),
    );
  }, [salesOrders, query]);
  const filteredProducts = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("ja");
    if (!normalized) return products;
    return products.filter((product) =>
      `${product.productCode} ${product.name}`
        .toLocaleLowerCase("ja")
        .includes(normalized),
    );
  }, [products, query]);

  const filteredCustomers = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("ja");
    if (!normalized) return customers;
    return customers.filter((customer) =>
      `${customer.customerCode} ${customer.name} ${customer.email ?? ""} ${customer.phone ?? ""}`
        .toLocaleLowerCase("ja")
        .includes(normalized),
    );
  }, [customers, query]);

  const currentCount =
    activeKind === "salesOrders"
      ? salesOrders.length
      : activeKind === "products"
        ? products.length
        : customers.length;
  const filteredCount =
    activeKind === "salesOrders"
      ? filteredSalesOrders.length
      : activeKind === "products"
        ? filteredProducts.length
        : filteredCustomers.length;

  const openNewOrder = () => {
    setEditingOrder(null);
    setOrderFormOpen(true);
  };

  const openOrderEdit = (order: SalesOrderDetail) => {
    setDetailOpen(false);
    setEditingOrder(order);
    setOrderFormOpen(true);
  };

  const handleOrderSaved = (saved: SavedSalesOrder, editing: boolean) => {
    const summary: SalesOrderSummary = {
      id: saved.id,
      orderNumber: saved.orderNumber,
      customerId: saved.customerId,
      customerCode: saved.customerCode,
      customerName: saved.customerName,
      orderDate: saved.orderDate,
      status: saved.status,
      totalAmount: saved.totalAmount,
    };
    setSalesOrders((current) =>
      editing
        ? current.map((order) => order.id === saved.id ? summary : order)
        : [summary, ...current],
    );
    setOrderFormOpen(false);
    setEditingOrder(null);
    showNotice(`受注「${saved.orderNumber}」を${editing ? "更新" : "登録"}しました。`);
  };
  const openOrderDetail = async (id: number) => {
    setDetailOpen(true);
    setDetailLoading(true);
    setDetailError("");
    setSelectedOrder(null);

    try {
      const response = await fetch(`/api/sales-orders/${id}`);
      if (!response.ok) {
        throw new Error("受注情報を取得できませんでした。");
      }
      setSelectedOrder((await response.json()) as SalesOrderDetail);
    } catch (error) {
      setDetailError(
        error instanceof Error ? error.message : "受注情報を取得できませんでした。",
      );
    } finally {
      setDetailLoading(false);
    }
  };

  const changeOrderStatus = async (
    order: SalesOrderDetail,
    action: "confirm" | "cancel",
  ) => {
    const confirmed = window.confirm(
      action === "confirm"
        ? "この受注を確定します。確定後は受注内容を編集できません。よろしいですか？"
        : "この受注をキャンセルします。よろしいですか？",
    );
    if (!confirmed) return;

    setOrderAction(action);
    setOrderActionError("");
    try {
      const response = await fetch(`/api/sales-orders/${order.id}/${action}`, {
        method: "POST",
      });
      if (!response.ok) {
        const errors = await readError(response);
        throw new Error(errors.form ?? Object.values(errors)[0] ?? "受注状態を変更できませんでした。");
      }

      const updated = (await response.json()) as SalesOrderDetail;
      setSelectedOrder(updated);
      setSalesOrders((current) => current.map((item) =>
        item.id === updated.id
          ? {
              id: updated.id,
              orderNumber: updated.orderNumber,
              customerId: updated.customerId,
              customerCode: updated.customerCode,
              customerName: updated.customerName,
              orderDate: updated.orderDate,
              status: updated.status,
              totalAmount: updated.totalAmount,
            }
          : item,
      ));
      showNotice(
        `受注「${updated.orderNumber}」を${action === "confirm" ? "確定" : "キャンセル"}しました。`,
      );
    } catch (error) {
      setOrderActionError(
        error instanceof Error ? error.message : "受注状態を変更できませんでした。",
      );
    } finally {
      setOrderAction(null);
    }
  };
  const closeOrderDetail = () => {
    setDetailOpen(false);
    setSelectedOrder(null);
    setDetailError("");
  };
  const openForm = () => {
    setEditingId(null);
    setProductForm(initialProductForm);
    setCustomerForm(initialCustomerForm);
    setFormErrors({});
    setFormOpen(true);
  };

  const openProductEdit = (product: Product) => {
    setEditingId(product.id);
    setProductForm({
      productCode: product.productCode,
      name: product.name,
      unitPrice: String(product.unitPrice),
      active: product.active,
    });
    setFormErrors({});
    setFormOpen(true);
  };

  const openCustomerEdit = (customer: Customer) => {
    setEditingId(customer.id);
    setCustomerForm({
      customerCode: customer.customerCode,
      name: customer.name,
      email: customer.email ?? "",
      phone: customer.phone ?? "",
      active: customer.active,
    });
    setFormErrors({});
    setFormOpen(true);
  };

  const closeForm = () => {
    if (saving) return;
    setFormOpen(false);
    setEditingId(null);
    setFormErrors({});
  };

  const showNotice = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 3200);
  };

  const submitProduct = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setFormErrors({});

    try {
      const response = await fetch(editingId ? `/api/products/${editingId}` : "/api/products", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productCode: productForm.productCode.trim(),
          name: productForm.name.trim(),
          unitPrice: Number(productForm.unitPrice),
          active: productForm.active,
        }),
      });

      if (!response.ok) {
        setFormErrors(await readError(response));
        return;
      }

      const created = (await response.json()) as Product;
      setProducts((current) =>
        editingId
          ? current.map((product) => (product.id === created.id ? created : product))
          : [...current, created],
      );
      setEditingId(null);
      setFormOpen(false);
      showNotice(`商品「${created.name}」を${editingId ? "更新" : "登録"}しました。`);
    } catch {
      setFormErrors({ form: "サーバーに接続できませんでした。" });
    } finally {
      setSaving(false);
    }
  };

  const submitCustomer = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setFormErrors({});

    try {
      const response = await fetch(editingId ? `/api/customers/${editingId}` : "/api/customers", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerCode: customerForm.customerCode.trim(),
          name: customerForm.name.trim(),
          email: customerForm.email.trim() || null,
          phone: customerForm.phone.trim() || null,
          active: customerForm.active,
        }),
      });

      if (!response.ok) {
        setFormErrors(await readError(response));
        return;
      }

      const created = (await response.json()) as Customer;
      setCustomers((current) =>
        editingId
          ? current.map((customer) => (customer.id === created.id ? created : customer))
          : [...current, created],
      );
      setEditingId(null);
      setFormOpen(false);
      showNotice(`顧客「${created.name}」を${editingId ? "更新" : "登録"}しました。`);
    } catch {
      setFormErrors({ form: "サーバーに接続できませんでした。" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="app-shell">
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
            className={activeKind === "salesOrders" ? "nav-item active" : "nav-item"}
            onClick={() => setActiveKind("salesOrders")}
          >
            <span className="nav-icon">S</span>
            受注一覧
            <span className="nav-count">{salesOrders.length}</span>
          </button>
          <p className="nav-label nav-section">マスタ管理</p>
          <button
            className={activeKind === "products" ? "nav-item active" : "nav-item"}
            onClick={() => setActiveKind("products")}
          >
            <span className="nav-icon">P</span>
            商品マスタ
            <span className="nav-count">{products.length}</span>
          </button>
          <button
            className={activeKind === "customers" ? "nav-item active" : "nav-item"}
            onClick={() => setActiveKind("customers")}
          >
            <span className="nav-icon">C</span>
            顧客マスタ
            <span className="nav-count">{customers.length}</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <span className={`connection-dot ${loadError ? "error" : ""}`} />
          {loadError ? "API 接続エラー" : "システム稼働中"}
        </div>
      </aside>

      <main className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">{activeKind === "salesOrders" ? "SALES ORDERS" : "MASTER DATA"}</p>
            <h1>
              {activeKind === "salesOrders"
                ? "受注一覧"
                : activeKind === "products"
                  ? "商品マスタ"
                  : "顧客マスタ"}
            </h1>
            <p className="page-description">
              {activeKind === "salesOrders"
                ? "受注状況と取引金額を確認します。"
                : activeKind === "products"
                  ? "販売商品と基準単価を登録・検索します。"
                  : "取引先の基本情報と連絡先を登録・検索します。"}
            </p>
          </div>
          <button
            className="primary-button"
            onClick={activeKind === "salesOrders" ? openNewOrder : openForm}
          >
            <span aria-hidden="true">＋</span>
            {activeKind === "salesOrders"
              ? "受注を登録"
              : activeKind === "products"
                ? "商品を登録"
                : "顧客を登録"}
          </button>
        </header>

        <section className="summary-grid" aria-label="登録状況">
          <article className="summary-card accent-card">
            <p>{activeKind === "salesOrders" ? "受注件数" : "登録件数"}</p>
            <strong>{currentCount}</strong>
            <span>{activeKind === "salesOrders" ? "sales orders" : activeKind === "products" ? "products" : "customers"}</span>
          </article>
          <article className="summary-card">
            <p>{activeKind === "salesOrders" ? "受注金額" : "有効"}</p>
            <strong className={activeKind === "salesOrders" ? "summary-amount" : ""}>
              {activeKind === "salesOrders"
                ? formatCurrency(salesOrders.reduce((sum, order) => sum + Number(order.totalAmount), 0))
                : activeKind === "products"
                  ? products.filter((item) => item.active).length
                  : customers.filter((item) => item.active).length}
            </strong>
            <span>{activeKind === "salesOrders" ? "全受注の合計" : "現在利用可能"}</span>
          </article>
          <article className="summary-card">
            <p>{activeKind === "salesOrders" ? "未確定" : "無効"}</p>
            <strong>
              {activeKind === "salesOrders"
                ? salesOrders.filter((order) => order.status === "DRAFT").length
                : activeKind === "products"
                  ? products.filter((item) => !item.active).length
                  : customers.filter((item) => !item.active).length}
            </strong>
            <span>{activeKind === "salesOrders" ? "下書きの受注" : "利用停止中"}</span>
          </article>
        </section>

        <section className="data-panel">
          <div className="panel-toolbar">
            <div className="search-box">
              <span aria-hidden="true">⌕</span>
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={
                  activeKind === "salesOrders"
                    ? "受注番号・顧客コード・顧客名で検索"
                    : activeKind === "products"
                      ? "商品コード・商品名で検索"
                      : "顧客コード・顧客名・連絡先で検索"
                }
                aria-label="一覧を検索"
              />
              {query && (
                <button onClick={() => setQuery("")} aria-label="検索をクリア">
                  ×
                </button>
              )}
            </div>
            <p className="result-count">
              <strong>{filteredCount}</strong> / {currentCount} 件
            </p>
          </div>

          {loading ? (
            <div className="table-loading" aria-live="polite">
              <span className="spinner" />
              データを読み込んでいます
            </div>
          ) : loadError ? (
            <div className="error-state">
              <strong>データを取得できませんでした</strong>
              <p>{loadError}</p>
              <button onClick={() => void loadMasters()}>再読み込み</button>
            </div>
          ) : activeKind === "salesOrders" ? (
            filteredSalesOrders.length ? (
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
                    {filteredSalesOrders.map((order) => (
                      <tr key={order.id}>
                        <td><strong className="order-number">{order.orderNumber}</strong></td>
                        <td className="muted">{formatDate(order.orderDate)}</td>
                        <td>
                          <span className="customer-name">{order.customerName}</span>
                          <span className="customer-code">{order.customerCode}</span>
                        </td>
                        <td><OrderStatusBadge status={order.status} /></td>
                        <td className="number-cell price">{formatCurrency(order.totalAmount)}</td>
                        <td className="action-cell">
                          <button className="edit-button" onClick={() => void openOrderDetail(order.id)}>
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
            )
          ) : activeKind === "products" ? (
            filteredProducts.length ? (
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
                        <td><span className="code-chip">{product.productCode}</span></td>
                        <td><strong className="primary-text">{product.name}</strong></td>
                        <td className="number-cell price">{formatCurrency(product.unitPrice)}</td>
                        <td><StatusBadge active={product.active} /></td>
                        <td className="muted">{formatDate(product.updatedAt)}</td>
                        <td className="action-cell">
                          <button className="edit-button" onClick={() => openProductEdit(product)}>
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
            )
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
                      <td><span className="code-chip">{customer.customerCode}</span></td>
                      <td><strong className="primary-text">{customer.name}</strong></td>
                      <td className="muted">{customer.email || "—"}</td>
                      <td className="muted">{customer.phone || "—"}</td>
                      <td><StatusBadge active={customer.active} /></td>
                      <td className="action-cell">
                        <button className="edit-button" onClick={() => openCustomerEdit(customer)}>
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

      {orderFormOpen && (
        <OrderFormDrawer
          customers={customers}
          products={products}
          order={editingOrder}
          onClose={() => {
            setOrderFormOpen(false);
            setEditingOrder(null);
          }}
          onSaved={handleOrderSaved}
        />
      )}
      {detailOpen && (
        <div className="modal-backdrop" role="presentation" onMouseDown={closeOrderDetail}>
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
              <button className="icon-button" onClick={closeOrderDetail} aria-label="閉じる">×</button>
            </div>

            {detailLoading ? (
              <div className="detail-loading">
                <span className="spinner" />
                受注情報を読み込んでいます
              </div>
            ) : detailError ? (
              <div className="error-state detail-error">
                <strong>詳細を取得できませんでした</strong>
                <p>{detailError}</p>
              </div>
            ) : selectedOrder ? (
              <>
                <div className="order-detail-heading">
                  <div>
                    <span>受注番号</span>
                    <strong>{selectedOrder.orderNumber}</strong>
                  </div>
                  <div className="detail-heading-actions">
                    <OrderStatusBadge status={selectedOrder.status} />
                    {selectedOrder.status === "DRAFT" && (
                      <button className="detail-edit-button" onClick={() => openOrderEdit(selectedOrder)}>
                        編集
                      </button>
                    )}
                  </div>
                </div>

                <dl className="detail-grid">
                  <div>
                    <dt>受注日</dt>
                    <dd>{formatDate(selectedOrder.orderDate)}</dd>
                  </div>
                  <div>
                    <dt>顧客コード</dt>
                    <dd>{selectedOrder.customerCode}</dd>
                  </div>
                  <div className="detail-customer">
                    <dt>顧客名</dt>
                    <dd>{selectedOrder.customerName}</dd>
                  </div>
                </dl>

                <section className="items-section">
                  <div className="section-heading">
                    <h3>受注明細</h3>
                    <span>{selectedOrder.items.length} 件</span>
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
                        {selectedOrder.items.map((item) => (
                          <tr key={item.id}>
                            <td>
                              <span className="item-name">{item.productName}</span>
                              <span className="customer-code">{item.productCode}</span>
                            </td>
                            <td className="number-cell">{item.quantity}</td>
                            <td className="number-cell muted">{formatCurrency(item.unitPrice)}</td>
                            <td className="number-cell price">{formatCurrency(item.lineAmount)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>

                <div className="order-total">
                  <span>受注金額合計</span>
                  <strong>{formatCurrency(selectedOrder.totalAmount)}</strong>
                </div>
                {orderActionError && <div className="form-alert order-action-error">{orderActionError}</div>}
                {selectedOrder.status !== "CANCELLED" && (
                  <div className="order-action-panel">
                    <div>
                      <strong>受注操作</strong>
                      <span>
                        {selectedOrder.status === "DRAFT"
                          ? "内容を確認して受注を確定します。"
                          : "確定済み受注をキャンセルできます。"}
                      </span>
                    </div>
                    <div className="order-action-buttons">
                      {selectedOrder.status === "DRAFT" && (
                        <button
                          className="confirm-order-button"
                          disabled={orderAction !== null}
                          onClick={() => void changeOrderStatus(selectedOrder, "confirm")}
                        >
                          {orderAction === "confirm" ? "確定中…" : "受注を確定"}
                        </button>
                      )}
                      <button
                        className="cancel-order-button"
                        disabled={orderAction !== null}
                        onClick={() => void changeOrderStatus(selectedOrder, "cancel")}
                      >
                        {orderAction === "cancel" ? "処理中…" : "キャンセル"}
                      </button>
                    </div>
                  </div>
                )}
                <div className="detail-timestamps">
                  <span>登録日時 {formatDate(selectedOrder.createdAt)}</span>
                  <span>更新日時 {formatDate(selectedOrder.updatedAt)}</span>
                </div>
              </>
            ) : null}
          </section>
        </div>
      )}
      {formOpen && (
        <div className="modal-backdrop" role="presentation" onMouseDown={closeForm}>
          <section
            className="form-drawer"
            role="dialog"
            aria-modal="true"
            aria-labelledby="form-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="drawer-header">
              <div>
                <p className="eyebrow">{editingId ? "EDIT RECORD" : "NEW RECORD"}</p>
                <h2 id="form-title">
                  {editingId
                    ? activeKind === "products"
                      ? "商品を編集"
                      : "顧客を編集"
                    : activeKind === "products"
                      ? "商品を登録"
                      : "顧客を登録"}
                </h2>
              </div>
              <button className="icon-button" onClick={closeForm} aria-label="閉じる">×</button>
            </div>

            {formErrors.form && <div className="form-alert">{formErrors.form}</div>}

            {activeKind === "products" ? (
              <form onSubmit={(event) => void submitProduct(event)}>
                <FormField label="商品コード" required error={formErrors.productCode}>
                  <input
                    autoFocus
                    value={productForm.productCode}
                    onChange={(event) =>
                      setProductForm({ ...productForm, productCode: event.target.value })
                    }
                    placeholder="例：P001"
                    maxLength={50}
                    required
                  />
                </FormField>
                <FormField label="商品名" required error={formErrors.name}>
                  <input
                    value={productForm.name}
                    onChange={(event) =>
                      setProductForm({ ...productForm, name: event.target.value })
                    }
                    placeholder="例：スタンダードデスク"
                    maxLength={255}
                    required
                  />
                </FormField>
                <FormField label="単価" required error={formErrors.unitPrice} hint="0円以上、小数点以下2桁まで">
                  <div className="input-prefix">
                    <span>¥</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={productForm.unitPrice}
                      onChange={(event) =>
                        setProductForm({ ...productForm, unitPrice: event.target.value })
                      }
                      placeholder="0.00"
                      required
                    />
                  </div>
                </FormField>
                <ActiveSwitch
                  checked={productForm.active}
                  onChange={(active) => setProductForm({ ...productForm, active })}
                />
                <FormActions saving={saving} onCancel={closeForm} editing={editingId !== null} />
              </form>
            ) : (
              <form onSubmit={(event) => void submitCustomer(event)}>
                <FormField label="顧客コード" required error={formErrors.customerCode}>
                  <input
                    autoFocus
                    value={customerForm.customerCode}
                    onChange={(event) =>
                      setCustomerForm({ ...customerForm, customerCode: event.target.value })
                    }
                    placeholder="例：C001"
                    maxLength={50}
                    required
                  />
                </FormField>
                <FormField label="顧客名" required error={formErrors.name}>
                  <input
                    value={customerForm.name}
                    onChange={(event) =>
                      setCustomerForm({ ...customerForm, name: event.target.value })
                    }
                    placeholder="例：株式会社サンプル"
                    maxLength={255}
                    required
                  />
                </FormField>
                <FormField label="メールアドレス" error={formErrors.email}>
                  <input
                    type="email"
                    value={customerForm.email}
                    onChange={(event) =>
                      setCustomerForm({ ...customerForm, email: event.target.value })
                    }
                    placeholder="contact@example.com"
                    maxLength={255}
                  />
                </FormField>
                <FormField label="電話番号" error={formErrors.phone}>
                  <input
                    type="tel"
                    value={customerForm.phone}
                    onChange={(event) =>
                      setCustomerForm({ ...customerForm, phone: event.target.value })
                    }
                    placeholder="03-1234-5678"
                    maxLength={30}
                  />
                </FormField>
                <ActiveSwitch
                  checked={customerForm.active}
                  onChange={(active) => setCustomerForm({ ...customerForm, active })}
                />
                <FormActions saving={saving} onCancel={closeForm} editing={editingId !== null} />
              </form>
            )}
          </section>
        </div>
      )}

      {notice && <div className="toast" role="status"><span>✓</span>{notice}</div>}
    </div>
  );
}

function FormField({
  label,
  required,
  error,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className={`form-field ${error ? "has-error" : ""}`}>
      <span className="field-label">
        {label}
        {required && <em>必須</em>}
      </span>
      {children}
      {error ? <span className="field-error">{error}</span> : hint ? <span className="field-hint">{hint}</span> : null}
    </label>
  );
}

function ActiveSwitch({ checked, onChange }: { checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <label className="switch-row">
      <span>
        <strong>有効状態</strong>
        <small>登録後すぐに利用可能にする</small>
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span className="switch" aria-hidden="true" />
    </label>
  );
}

function FormActions({
  saving,
  onCancel,
  editing,
}: {
  saving: boolean;
  onCancel: () => void;
  editing: boolean;
}) {
  return (
    <div className="form-actions">
      <button type="button" className="secondary-button" onClick={onCancel} disabled={saving}>
        キャンセル
      </button>
      <button type="submit" className="primary-button" disabled={saving}>
        {saving ? <><span className="button-spinner" />保存中</> : editing ? "変更を保存" : "登録する"}
      </button>
    </div>
  );
}

export default App;




















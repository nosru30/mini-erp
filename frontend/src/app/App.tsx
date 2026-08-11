import { useEffect, useState } from "react";
import CustomerFormDrawer from "../features/customers/CustomerFormDrawer";
import CustomersScreen from "../features/customers/CustomersScreen";
import { useCustomers } from "../features/customers/useCustomers";
import ProductFormDrawer from "../features/products/ProductFormDrawer";
import ProductsScreen from "../features/products/ProductsScreen";
import { useProducts } from "../features/products/useProducts";
import OrderDetailDrawer from "../features/sales-orders/OrderDetailDrawer";
import OrderFormDrawer from "../features/sales-orders/OrderFormDrawer";
import SalesOrdersScreen from "../features/sales-orders/SalesOrdersScreen";
import { useSalesOrders } from "../features/sales-orders/useSalesOrders";
import type { MasterKind } from "../shared/types";
import { useAuth } from "../auth/useAuth";
import "./App.css";
import AppSidebar from "./AppSidebar";

export default function App() {
  const auth = useAuth();
  const [activeKind, setActiveKind] = useState<MasterKind>("salesOrders");
  const [query, setQuery] = useState("");
  const [notice, setNotice] = useState("");

  const showNotice = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 3200);
  };

  const salesOrders = useSalesOrders(
    query,
    showNotice,
    activeKind === "salesOrders",
  );
  const products = useProducts(
    query,
    showNotice,
    activeKind === "products" || salesOrders.formOpen,
  );
  const customers = useCustomers(
    query,
    showNotice,
    activeKind === "customers" || salesOrders.formOpen,
  );

  useEffect(() => {
    setQuery("");
  }, [activeKind]);

  const activeError =
    activeKind === "salesOrders"
      ? salesOrders.loadError
      : activeKind === "products"
        ? products.loadError
        : customers.loadError;

  return (
    <div className="app-shell">
      <AppSidebar
        activeKind={activeKind}
        hasError={Boolean(activeError)}
        username={auth.username ?? ""}
        onNavigate={setActiveKind}
        onSignOut={() => void auth.signOut()}
      />

      {activeKind === "salesOrders" ? (
        <SalesOrdersScreen
          orders={salesOrders.orders}
          filteredOrders={salesOrders.filteredOrders}
          query={query}
          loading={salesOrders.loading}
          loadError={salesOrders.loadError}
          onQueryChange={setQuery}
          onCreate={salesOrders.openNew}
          onOpenDetail={(id) => void salesOrders.openDetail(id)}
          onRetry={() => void salesOrders.loadOrders()}
        />
      ) : activeKind === "products" ? (
        <ProductsScreen
          products={products.products}
          filteredProducts={products.filteredProducts}
          query={query}
          loading={products.loading}
          loadError={products.loadError}
          onQueryChange={setQuery}
          onCreate={products.openNew}
          onEdit={products.openEdit}
          onRetry={() => void products.loadProducts()}
        />
      ) : (
        <CustomersScreen
          customers={customers.customers}
          filteredCustomers={customers.filteredCustomers}
          query={query}
          loading={customers.loading}
          loadError={customers.loadError}
          onQueryChange={setQuery}
          onCreate={customers.openNew}
          onEdit={customers.openEdit}
          onRetry={() => void customers.loadCustomers()}
        />
      )}

      {activeKind === "salesOrders" && salesOrders.formOpen && (
        <OrderFormDrawer
          customers={customers.customers}
          products={products.products}
          order={salesOrders.editingOrder}
          onClose={salesOrders.closeForm}
          onSaved={salesOrders.handleSaved}
        />
      )}
      {activeKind === "salesOrders" && salesOrders.detailOpen && (
        <OrderDetailDrawer
          order={salesOrders.selectedOrder}
          loading={salesOrders.detailLoading}
          error={salesOrders.detailError}
          action={salesOrders.action}
          actionError={salesOrders.actionError}
          onClose={salesOrders.closeDetail}
          onEdit={salesOrders.openEdit}
          onChangeStatus={(order, action) =>
            void salesOrders.changeStatus(order, action)
          }
        />
      )}
      {activeKind === "products" && products.formOpen && (
        <ProductFormDrawer
          editing={products.editing}
          form={products.form}
          errors={products.formErrors}
          saving={products.saving}
          onChange={products.setForm}
          onSubmit={products.submit}
          onClose={products.closeForm}
        />
      )}
      {activeKind === "customers" && customers.formOpen && (
        <CustomerFormDrawer
          editing={customers.editing}
          form={customers.form}
          errors={customers.formErrors}
          saving={customers.saving}
          onChange={customers.setForm}
          onSubmit={customers.submit}
          onClose={customers.closeForm}
        />
      )}
      {notice && (
        <div className="toast" role="status">
          <span>✓</span>
          {notice}
        </div>
      )}
    </div>
  );
}

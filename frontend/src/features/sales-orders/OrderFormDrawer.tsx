import { useMemo, useState, type FormEvent } from "react";
import type { Customer } from "../customers/types";
import type { Product } from "../products/types";
import { apiFetch } from "../../shared/utils/api";
import { formatCurrency, today } from "../../shared/utils/format";
import type { SavedSalesOrder } from "./types";

type EditableOrder = SavedSalesOrder | null;
type FormLine = { key: number; productCode: string; quantity: string };

type Props = {
  customers: Customer[];
  products: Product[];
  order: EditableOrder;
  onClose: () => void;
  onSaved: (order: SavedSalesOrder, editing: boolean) => void;
};

export default function OrderFormDrawer({
  customers,
  products,
  order,
  onClose,
  onSaved,
}: Props) {
  const [customerCode, setCustomerCode] = useState(order?.customerCode ?? "");
  const [orderDate, setOrderDate] = useState(order?.orderDate ?? today());
  const [lines, setLines] = useState<FormLine[]>(
    order?.items.map((item, index) => ({
      key: index + 1,
      productCode: item.productCode,
      quantity: String(item.quantity),
    })) ?? [{ key: 1, productCode: "", quantity: "1" }],
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const activeCustomers = customers.filter((customer) => customer.active);
  const activeProducts = products.filter((product) => product.active);

  const estimatedTotal = useMemo(
    () =>
      lines.reduce((sum, line) => {
        const product = products.find(
          (item) => item.productCode === line.productCode,
        );
        return sum + (product?.unitPrice ?? 0) * (Number(line.quantity) || 0);
      }, 0),
    [lines, products],
  );

  const updateLine = (key: number, patch: Partial<FormLine>) => {
    setLines((current) =>
      current.map((line) => (line.key === key ? { ...line, ...patch } : line)),
    );
  };

  const addLine = () => {
    setLines((current) => [
      ...current,
      {
        key: Math.max(0, ...current.map((line) => line.key)) + 1,
        productCode: "",
        quantity: "1",
      },
    ]);
  };

  const removeLine = (key: number) => {
    setLines((current) => current.filter((line) => line.key !== key));
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");

    if (!customerCode) {
      setError("顧客を選択してください。");
      return;
    }
    if (
      !lines.length ||
      lines.some((line) => !line.productCode || Number(line.quantity) < 1)
    ) {
      setError("各明細の商品と1以上の数量を入力してください。");
      return;
    }

    setSaving(true);
    try {
      const response = await apiFetch(
        order ? `/api/sales-orders/${order.id}` : "/api/sales-orders",
        {
          method: order ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customerCode,
            orderDate,
            items: lines.map((line) => ({
              productCode: line.productCode,
              quantity: Number(line.quantity),
            })),
          }),
        },
      );

      if (!response.ok) {
        try {
          const body = (await response.json()) as Record<string, string> & {
            message?: string;
          };
          setError(
            body.message ??
              Object.values(body)[0] ??
              "受注を保存できませんでした。",
          );
        } catch {
          setError("受注を保存できませんでした。");
        }
        return;
      }

      onSaved((await response.json()) as SavedSalesOrder, Boolean(order));
    } catch {
      setError("サーバーに接続できませんでした。");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onMouseDown={saving ? undefined : onClose}
    >
      <section
        className="form-drawer order-form-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-form-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="drawer-header">
          <div>
            <p className="eyebrow">
              {order ? "EDIT SALES ORDER" : "NEW SALES ORDER"}
            </p>
            <h2 id="order-form-title">{order ? "受注を編集" : "受注を登録"}</h2>
            {order && (
              <span className="drawer-subtitle">{order.orderNumber}</span>
            )}
          </div>
          <button
            className="icon-button"
            onClick={onClose}
            disabled={saving}
            aria-label="閉じる"
          >
            ×
          </button>
        </div>

        {error && <div className="form-alert">{error}</div>}

        <form onSubmit={(event) => void submit(event)}>
          <div className="order-basic-fields">
            <label className="form-field">
              <span className="field-label">
                顧客 <em>必須</em>
              </span>
              <select
                value={customerCode}
                onChange={(event) => setCustomerCode(event.target.value)}
                required
              >
                <option value="">顧客を選択</option>
                {activeCustomers.map((customer) => (
                  <option
                    key={customer.customerCode}
                    value={customer.customerCode}
                  >
                    {customer.customerCode}　{customer.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="form-field">
              <span className="field-label">
                受注日 <em>必須</em>
              </span>
              <input
                type="date"
                value={orderDate}
                onChange={(event) => setOrderDate(event.target.value)}
                required
              />
            </label>
          </div>

          <div className="order-lines-heading">
            <div>
              <h3>受注明細</h3>
              <p>商品と数量を入力してください。</p>
            </div>
            <button
              type="button"
              className="secondary-button add-line-button"
              onClick={addLine}
            >
              ＋ 明細を追加
            </button>
          </div>

          <div className="order-lines">
            {lines.map((line, index) => {
              const product = products.find(
                (item) => item.productCode === line.productCode,
              );
              const lineAmount =
                (product?.unitPrice ?? 0) * (Number(line.quantity) || 0);
              return (
                <div className="order-line" key={line.key}>
                  <div className="line-number">{index + 1}</div>
                  <label>
                    <span>商品</span>
                    <select
                      value={line.productCode}
                      onChange={(event) =>
                        updateLine(line.key, {
                          productCode: event.target.value,
                        })
                      }
                      required
                    >
                      <option value="">商品を選択</option>
                      {activeProducts.map((item) => (
                        <option key={item.productCode} value={item.productCode}>
                          {item.productCode}　{item.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="quantity-field">
                    <span>数量</span>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={line.quantity}
                      onChange={(event) =>
                        updateLine(line.key, { quantity: event.target.value })
                      }
                      required
                    />
                  </label>
                  <div className="line-amount">
                    <span>金額</span>
                    <strong>{formatCurrency(lineAmount)}</strong>
                  </div>
                  <button
                    type="button"
                    className="remove-line-button"
                    onClick={() => removeLine(line.key)}
                    disabled={lines.length === 1}
                    aria-label={`${index + 1}行目を削除`}
                  >
                    ×
                  </button>
                </div>
              );
            })}
          </div>

          <div className="order-form-total">
            <span>受注金額（予定）</span>
            <strong>{formatCurrency(estimatedTotal)}</strong>
          </div>
          <p className="price-note">
            単価は登録済みの商品マスタから計算され、保存時に確定します。
          </p>

          <div className="form-actions order-form-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={onClose}
              disabled={saving}
            >
              キャンセル
            </button>
            <button type="submit" className="primary-button" disabled={saving}>
              {saving ? (
                <>
                  <span className="button-spinner" />
                  保存中
                </>
              ) : order ? (
                "変更を保存"
              ) : (
                "下書きで登録"
              )}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

import type { FormEvent } from "react";
import {
  ActiveSwitch,
  FormActions,
  FormField,
} from "../../shared/components/FormParts";
import type { ApiErrors } from "../../shared/types";
import type { ProductForm } from "./types";

type Props = {
  editing: boolean;
  form: ProductForm;
  errors: ApiErrors;
  saving: boolean;
  onChange: (form: ProductForm) => void;
  onSubmit: (event: FormEvent) => void;
  onClose: () => void;
};

export default function ProductFormDrawer({
  editing,
  form,
  errors,
  saving,
  onChange,
  onSubmit,
  onClose,
}: Props) {
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="form-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-form-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="drawer-header">
          <div>
            <p className="eyebrow">{editing ? "EDIT RECORD" : "NEW RECORD"}</p>
            <h2 id="product-form-title">
              {editing ? "商品を編集" : "商品を登録"}
            </h2>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="閉じる">
            ×
          </button>
        </div>
        {errors.form && <div className="form-alert">{errors.form}</div>}
        <form onSubmit={(event) => void onSubmit(event)}>
          <FormField label="商品コード" required error={errors.productCode}>
            <input
              autoFocus
              value={form.productCode}
              onChange={(event) =>
                onChange({ ...form, productCode: event.target.value })
              }
              placeholder="例：P001"
              maxLength={50}
              required
            />
          </FormField>
          <FormField label="商品名" required error={errors.name}>
            <input
              value={form.name}
              onChange={(event) =>
                onChange({ ...form, name: event.target.value })
              }
              placeholder="例：スタンダードデスク"
              maxLength={255}
              required
            />
          </FormField>
          <FormField
            label="単価"
            required
            error={errors.unitPrice}
            hint="0円以上、小数点以下2桁まで"
          >
            <div className="input-prefix">
              <span>¥</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.unitPrice}
                onChange={(event) =>
                  onChange({ ...form, unitPrice: event.target.value })
                }
                placeholder="0.00"
                required
              />
            </div>
          </FormField>
          <ActiveSwitch
            checked={form.active}
            onChange={(active) => onChange({ ...form, active })}
          />
          <FormActions saving={saving} onCancel={onClose} editing={editing} />
        </form>
      </section>
    </div>
  );
}

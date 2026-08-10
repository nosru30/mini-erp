import type { FormEvent } from "react";
import {
  ActiveSwitch,
  FormActions,
  FormField,
} from "../../shared/components/FormParts";
import type { ApiErrors } from "../../shared/types";
import type { CustomerForm } from "./types";

type Props = {
  editing: boolean;
  form: CustomerForm;
  errors: ApiErrors;
  saving: boolean;
  onChange: (form: CustomerForm) => void;
  onSubmit: (event: FormEvent) => void;
  onClose: () => void;
};

export default function CustomerFormDrawer({
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
        aria-labelledby="customer-form-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="drawer-header">
          <div>
            <p className="eyebrow">{editing ? "EDIT RECORD" : "NEW RECORD"}</p>
            <h2 id="customer-form-title">
              {editing ? "顧客を編集" : "顧客を登録"}
            </h2>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="閉じる">
            ×
          </button>
        </div>
        {errors.form && <div className="form-alert">{errors.form}</div>}
        <form onSubmit={(event) => void onSubmit(event)}>
          <FormField label="顧客コード" required error={errors.customerCode}>
            <input
              autoFocus
              value={form.customerCode}
              onChange={(event) =>
                onChange({ ...form, customerCode: event.target.value })
              }
              placeholder="例：C001"
              maxLength={50}
              required
            />
          </FormField>
          <FormField label="顧客名" required error={errors.name}>
            <input
              value={form.name}
              onChange={(event) =>
                onChange({ ...form, name: event.target.value })
              }
              placeholder="例：株式会社サンプル"
              maxLength={255}
              required
            />
          </FormField>
          <FormField label="メールアドレス" error={errors.email}>
            <input
              type="email"
              value={form.email}
              onChange={(event) =>
                onChange({ ...form, email: event.target.value })
              }
              placeholder="contact@example.com"
              maxLength={255}
            />
          </FormField>
          <FormField label="電話番号" error={errors.phone}>
            <input
              type="tel"
              value={form.phone}
              onChange={(event) =>
                onChange({ ...form, phone: event.target.value })
              }
              placeholder="03-1234-5678"
              maxLength={30}
            />
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

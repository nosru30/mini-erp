import type { FormEvent } from "react";
import { FormActions, FormField } from "../../shared/components/FormParts";
import type { ApiErrors } from "../../shared/types";
import type { AdminUserForm } from "./types";

type Props = {
  form: AdminUserForm;
  errors: ApiErrors;
  saving: boolean;
  onChange: (form: AdminUserForm) => void;
  onSubmit: (event: FormEvent) => void;
  onClose: () => void;
};

export default function AdminUserFormDrawer({
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
        aria-labelledby="admin-user-form-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="drawer-header">
          <div>
            <p className="eyebrow">INVITE USER</p>
            <h2 id="admin-user-form-title">ユーザーを追加</h2>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="閉じる">
            ×
          </button>
        </div>
        {errors.form && <div className="form-alert">{errors.form}</div>}
        <form onSubmit={(event) => void onSubmit(event)}>
          <FormField label="名前" required error={errors.name}>
            <input
              autoFocus
              value={form.name}
              onChange={(event) => onChange({ ...form, name: event.target.value })}
              placeholder="例：山田 太郎"
              maxLength={256}
              required
            />
          </FormField>
          <FormField
            label="メールアドレス"
            required
            error={errors.email}
            hint="一時パスワードを含む招待メールが送信されます。"
          >
            <input
              type="email"
              value={form.email}
              onChange={(event) => onChange({ ...form, email: event.target.value })}
              placeholder="user@example.com"
              maxLength={320}
              required
            />
          </FormField>
          <FormActions saving={saving} onCancel={onClose} editing={false} />
        </form>
      </section>
    </div>
  );
}

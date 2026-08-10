import type { ReactNode } from "react";

export function FormField({
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
      {error ? (
        <span className="field-error">{error}</span>
      ) : hint ? (
        <span className="field-hint">{hint}</span>
      ) : null}
    </label>
  );
}

export function ActiveSwitch({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
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

export function FormActions({
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
      <button
        type="button"
        className="secondary-button"
        onClick={onCancel}
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
        ) : editing ? (
          "変更を保存"
        ) : (
          "登録する"
        )}
      </button>
    </div>
  );
}

import { useState, type FormEvent } from "react";
import { useAuth } from "./useAuth";

function authErrorMessage(error: unknown) {
  if (!(error instanceof Error)) return "ログインに失敗しました。";

  switch (error.name) {
    case "NotAuthorizedException":
    case "UserNotFoundException":
      return "ユーザー名またはパスワードが正しくありません。";
    case "UserNotConfirmedException":
      return "ユーザーの確認が完了していません。管理者へ連絡してください。";
    case "PasswordResetRequiredException":
      return "パスワードの再設定が必要です。管理者へ連絡してください。";
    default:
      return error.message || "ログインに失敗しました。";
  }
}

export default function LoginScreen() {
  const auth = useAuth();
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [requiresNewPassword, setRequiresNewPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");

    if (requiresNewPassword && newPassword !== confirmPassword) {
      setError("確認用パスワードが一致しません。");
      return;
    }

    setSubmitting(true);
    try {
      if (requiresNewPassword) {
        await auth.confirmNewPassword(newPassword);
      } else {
        const result = await auth.signIn(loginId.trim(), password);
        setRequiresNewPassword(result === "newPasswordRequired");
        setPassword("");
      }
    } catch (cause) {
      setError(authErrorMessage(cause));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="login-page">
      <section className="login-panel" aria-labelledby="login-title">
        <div className="login-brand">
          <span className="brand-mark">M</span>
          <div>
            <strong>Mini ERP</strong>
            <span>Operations</span>
          </div>
        </div>
        <p className="eyebrow">SECURE ACCESS</p>
        <h1 id="login-title">
          {requiresNewPassword ? "新しいパスワードを設定" : "ログイン"}
        </h1>
        <p className="login-description">
          {requiresNewPassword
            ? "初回ログイン用の一時パスワードを変更してください。"
            : "業務システムを利用するアカウントでログインしてください。"}
        </p>

        <form className="login-form" onSubmit={(event) => void submit(event)}>
          {!requiresNewPassword ? (
            <>
              <label>
                ユーザー名またはメールアドレス
                <input
                  autoComplete="username"
                  value={loginId}
                  onChange={(event) => setLoginId(event.target.value)}
                  required
                />
              </label>
              <label>
                パスワード
                <input
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </label>
            </>
          ) : (
            <>
              <label>
                新しいパスワード
                <input
                  type="password"
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  required
                  minLength={8}
                />
              </label>
              <label>
                新しいパスワード（確認）
                <input
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  required
                  minLength={8}
                />
              </label>
            </>
          )}

          {error && (
            <p className="login-error" role="alert">
              {error}
            </p>
          )}
          <button className="primary-button login-button" disabled={submitting}>
            {submitting
              ? "処理中..."
              : requiresNewPassword
                ? "パスワードを設定"
                : "ログイン"}
          </button>
        </form>
      </section>
      <aside className="login-context" aria-hidden="true">
        <p>MINI ERP / OPERATIONS</p>
        <strong>受注・商品・顧客を、ひとつの場所で。</strong>
        <span>安全な認証で業務データへのアクセスを保護します。</span>
      </aside>
    </main>
  );
}

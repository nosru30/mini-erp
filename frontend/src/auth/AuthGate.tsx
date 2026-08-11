import type { ReactNode } from "react";
import { useAuth } from "./useAuth";
import LoginScreen from "./LoginScreen";

export default function AuthGate({ children }: { children: ReactNode }) {
  const auth = useAuth();

  if (!auth.configured) {
    return (
      <main className="auth-state-page">
        <section className="auth-state-card">
          <p className="eyebrow">AUTH CONFIGURATION</p>
          <h1>Cognitoの設定が必要です</h1>
          <p>フロントエンドのビルド時に次の環境変数を設定してください。</p>
          <code>VITE_COGNITO_USER_POOL_ID</code>
          <code>VITE_COGNITO_USER_POOL_CLIENT_ID</code>
        </section>
      </main>
    );
  }

  if (auth.loading) {
    return (
      <main className="auth-state-page">
        <p className="auth-loading" role="status">
          セッションを確認しています...
        </p>
      </main>
    );
  }

  return auth.username ? children : <LoginScreen />;
}

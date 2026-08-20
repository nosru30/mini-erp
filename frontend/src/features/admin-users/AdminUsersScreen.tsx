import {
  EmptyState,
  ScreenError,
  ScreenLoading,
  SearchToolbar,
  StatusBadge,
} from "../../shared/components/ScreenParts";
import type { AdminUser } from "./types";

type Props = {
  users: AdminUser[];
  filteredUsers: AdminUser[];
  query: string;
  loading: boolean;
  loadError: string;
  hasNextPage: boolean;
  onQueryChange: (query: string) => void;
  onCreate: () => void;
  onRetry: () => void;
  onLoadNext: () => void;
};

const statusLabels: Record<string, string> = {
  CONFIRMED: "利用可能",
  FORCE_CHANGE_PASSWORD: "初回変更待ち",
  RESET_REQUIRED: "再設定待ち",
  UNCONFIRMED: "未確認",
};

export default function AdminUsersScreen({
  users,
  filteredUsers,
  query,
  loading,
  loadError,
  hasNextPage,
  onQueryChange,
  onCreate,
  onRetry,
  onLoadNext,
}: Props) {
  return (
    <main className="workspace">
      <header className="topbar">
        <div>
          <p className="eyebrow">SYSTEM ADMINISTRATION</p>
          <h1>ユーザー管理</h1>
          <p className="page-description">
            Cognitoユーザーの登録状況を確認し、新しい利用者を招待します。
          </p>
        </div>
        <button className="primary-button" onClick={onCreate}>
          <span aria-hidden="true">＋</span>ユーザーを追加
        </button>
      </header>
      <section className="summary-grid" aria-label="ユーザー登録状況">
        <article className="summary-card accent-card">
          <p>取得件数</p>
          <strong>{users.length}</strong>
          <span>users</span>
        </article>
        <article className="summary-card">
          <p>利用可能</p>
          <strong>{users.filter((user) => user.enabled).length}</strong>
          <span>有効なアカウント</span>
        </article>
        <article className="summary-card">
          <p>初回変更待ち</p>
          <strong>
            {users.filter((user) => user.status === "FORCE_CHANGE_PASSWORD").length}
          </strong>
          <span>一時パスワード利用中</span>
        </article>
      </section>
      <section className="data-panel">
        <SearchToolbar
          query={query}
          onQueryChange={onQueryChange}
          placeholder="名前・メールアドレスで検索"
          filteredCount={filteredUsers.length}
          totalCount={users.length}
        />
        {loading && !users.length ? (
          <ScreenLoading />
        ) : loadError ? (
          <ScreenError message={loadError} onRetry={onRetry} />
        ) : filteredUsers.length ? (
          <>
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>名前</th>
                    <th>メールアドレス</th>
                    <th>認証状態</th>
                    <th>アカウント</th>
                    <th>作成日時</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.username}>
                      <td>
                        <strong className="primary-text">{user.name || "—"}</strong>
                      </td>
                      <td className="muted">{user.email || user.username}</td>
                      <td>
                        <span className="code-chip">
                          {statusLabels[user.status] ?? user.status}
                        </span>
                      </td>
                      <td><StatusBadge active={user.enabled} /></td>
                      <td className="muted">
                        {new Intl.DateTimeFormat("ja-JP", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        }).format(new Date(user.createdAt))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {hasNextPage && !query && (
              <div className="load-more-row">
                <button
                  className="secondary-button"
                  onClick={onLoadNext}
                  disabled={loading}
                >
                  {loading ? "読み込み中..." : "さらに読み込む"}
                </button>
              </div>
            )}
          </>
        ) : (
          <EmptyState kind="users" />
        )}
      </section>
    </main>
  );
}

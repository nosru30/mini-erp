import {
  confirmSignIn,
  getCurrentUser,
  signIn,
  signOut,
} from "aws-amplify/auth";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { AuthContext, type AuthState } from "./authContext";
import { cognitoConfigured } from "./config";
import { AUTH_SESSION_EXPIRED_EVENT } from "./sessionEvents";

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(cognitoConfigured);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    if (!cognitoConfigured) return;

    void getCurrentUser()
      .then((user) => setUsername(user.signInDetails?.loginId ?? user.username))
      .catch(() => setUsername(null))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const clearExpiredSession = () => setUsername(null);
    window.addEventListener(AUTH_SESSION_EXPIRED_EVENT, clearExpiredSession);
    return () =>
      window.removeEventListener(
        AUTH_SESSION_EXPIRED_EVENT,
        clearExpiredSession,
      );
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      configured: cognitoConfigured,
      loading,
      username,
      async signIn(loginId, password) {
        const result = await signIn({ username: loginId, password });

        if (result.isSignedIn) {
          const user = await getCurrentUser();
          setUsername(user.signInDetails?.loginId ?? user.username);
          return "signedIn";
        }

        if (
          result.nextStep.signInStep ===
          "CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED"
        ) {
          return "newPasswordRequired";
        }

        throw new Error(`未対応の認証ステップです: ${result.nextStep.signInStep}`);
      },
      async confirmNewPassword(password) {
        const result = await confirmSignIn({ challengeResponse: password });
        if (!result.isSignedIn) {
          throw new Error(`未対応の認証ステップです: ${result.nextStep.signInStep}`);
        }
        const user = await getCurrentUser();
        setUsername(user.signInDetails?.loginId ?? user.username);
      },
      async signOut() {
        await signOut();
        setUsername(null);
      },
    }),
    [loading, username],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

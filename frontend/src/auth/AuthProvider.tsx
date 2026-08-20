import {
  confirmSignIn,
  fetchAuthSession,
  getCurrentUser,
  signIn,
  signOut,
} from "aws-amplify/auth";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AuthContext, type AuthState } from "./authContext";
import { cognitoConfigured } from "./config";
import { AUTH_SESSION_EXPIRED_EVENT } from "./sessionEvents";

export default function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(cognitoConfigured);
  const [username, setUsername] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const loadAuthenticatedUser = async () => {
    const [user, session] = await Promise.all([
      getCurrentUser(),
      fetchAuthSession(),
    ]);
    const groups = session.tokens?.accessToken.payload["cognito:groups"];
    setUsername(user.signInDetails?.loginId ?? user.username);
    setIsAdmin(Array.isArray(groups) && groups.includes("ADMIN"));
  };

  useEffect(() => {
    if (!cognitoConfigured) return;

    void loadAuthenticatedUser()
      .catch(() => {
        setUsername(null);
        setIsAdmin(false);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const clearExpiredSession = () => {
      queryClient.clear();
      setUsername(null);
      setIsAdmin(false);
    };
    window.addEventListener(AUTH_SESSION_EXPIRED_EVENT, clearExpiredSession);
    return () =>
      window.removeEventListener(
        AUTH_SESSION_EXPIRED_EVENT,
        clearExpiredSession,
      );
  }, [queryClient]);

  const value = useMemo<AuthState>(
    () => ({
      configured: cognitoConfigured,
      loading,
      username,
      isAdmin,
      async signIn(loginId, password) {
        const result = await signIn({ username: loginId, password });

        if (result.isSignedIn) {
          await loadAuthenticatedUser();
          return "signedIn";
        }

        if (
          result.nextStep.signInStep ===
          "CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED"
        ) {
          return "newPasswordRequired";
        }

        throw new Error(
          `未対応の認証ステップです: ${result.nextStep.signInStep}`,
        );
      },
      async confirmNewPassword(password) {
        const result = await confirmSignIn({ challengeResponse: password });
        if (!result.isSignedIn) {
          throw new Error(
            `未対応の認証ステップです: ${result.nextStep.signInStep}`,
          );
        }
        await loadAuthenticatedUser();
      },
      async signOut() {
        await signOut();
        queryClient.clear();
        setUsername(null);
        setIsAdmin(false);
      },
    }),
    [isAdmin, loading, queryClient, username],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

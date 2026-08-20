import { createContext } from "react";

export type SignInResult = "signedIn" | "newPasswordRequired";

export type AuthState = {
  configured: boolean;
  loading: boolean;
  username: string | null;
  isAdmin: boolean;
  signIn: (username: string, password: string) => Promise<SignInResult>;
  confirmNewPassword: (password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

export const AuthContext = createContext<AuthState | null>(null);

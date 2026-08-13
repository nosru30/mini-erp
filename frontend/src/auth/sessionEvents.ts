import { signOut } from "aws-amplify/auth";

export const AUTH_SESSION_EXPIRED_EVENT = "mini-erp:auth-session-expired";

let expirationInProgress: Promise<void> | null = null;

export function expireAuthSession() {
  if (expirationInProgress) return expirationInProgress;

  expirationInProgress = signOut()
    .catch(() => undefined)
    .then(() => {
      window.dispatchEvent(new Event(AUTH_SESSION_EXPIRED_EVENT));
    })
    .finally(() => {
      expirationInProgress = null;
    });

  return expirationInProgress;
}

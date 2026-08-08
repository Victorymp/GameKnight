import { ReactNode } from "react";

// TEST STUB: Bypass MSAL for local testing.
// This exports a minimal `msalInstance` with the methods used by the app
// and an `AuthProvider` that simply returns children so nothing breaks.

class MsalStub {
  async initialize(): Promise<void> {
    return;
  }
  getActiveAccount() {
    return null;
  }
  getAllAccounts() {
    return [] as any[];
  }
  async acquireTokenSilent(): Promise<{ accessToken: string }> {
    return { accessToken: "" };
  }
  addEventCallback(): void {
    return;
  }
  setActiveAccount(): void {
    return;
  }
}

export const msalInstance = new MsalStub() as any;

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // Bypass authentication for testing — render children immediately.
  return <>{children}</>;
};

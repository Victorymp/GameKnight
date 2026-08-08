import { ReactNode, useEffect, useState } from "react";
import { MsalProvider } from "@azure/msal-react";
import { PublicClientApplication, EventType, AuthenticationResult } from "@azure/msal-browser";
import { msalConfig } from "../auth-config";

interface AuthProviderProps {
  children: ReactNode;
}

// Create MSAL instance once
export const msalInstance = new PublicClientApplication(msalConfig);

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      await msalInstance.initialize(); // ✅ ensure MSAL is ready

      // Set active account if not already set
      if (!msalInstance.getActiveAccount() && msalInstance.getAllAccounts().length > 0) {
        msalInstance.setActiveAccount(msalInstance.getAllAccounts()[0]);
      }

      // Optional: listen for login events
      msalInstance.addEventCallback((event) => {
        if (event.eventType === EventType.LOGIN_SUCCESS) {
          const result = event.payload as AuthenticationResult;
          if (result.account) {
            msalInstance.setActiveAccount(result.account);
          }
        }
      });

      setReady(true); // allow children to render
    };

    init();
  }, []);

  if (!ready) {
    return <div>Loading authentication...</div>; // or a spinner
  }

  return <MsalProvider instance={msalInstance}>{children}</MsalProvider>;
};

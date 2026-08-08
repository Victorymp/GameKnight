// msalCredential.ts
import { msalInstance } from "./hooks/auth-provider";
import { AuthenticationResult } from "@azure/msal-browser";
import { TokenCredential, AccessToken } from "@azure/core-auth";

class MsalTokenCredential implements TokenCredential {
  async getToken(): Promise<AccessToken | null> {
    try {
      const account = msalInstance.getActiveAccount();
      if (account === null) {
        console.warn("No accounts in MSAL cache — user must log in interactively once before silent token works.");
        return null;
      }
      const response: AuthenticationResult = await msalInstance.acquireTokenSilent({
        scopes: ["https://storage.azure.com/.default"],
        account: account,
      });

      if (!response.accessToken) throw new Error("No access token acquired");

      return {
        token: response.accessToken,
        expiresOnTimestamp: response.expiresOn?.getTime() ?? Date.now() + 3600 * 1000,
      };
    } catch (error) {
      console.warn("Silent token acquisition failed, trying popup:", error);

      return null;
    }
  }
}

export const msalCredential = new MsalTokenCredential();

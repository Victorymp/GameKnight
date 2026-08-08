import { LogLevel } from "@azure/msal-browser";
import type { Configuration } from "@azure/msal-browser";

/**
 * Configuration object to be passed to MSAL instance on creation.
 * For a full list of MSAL.js configuration parameters, visit:
 * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/docs/configuration.md
 */

const clientId = import.meta.env.VITE_USERS_CLIENT_ID;
const tenantId = import.meta.env.VITE_USERS_TENANT_ID;

export const msalConfig: Configuration = {
  auth: {
    clientId: clientId, // App (client) ID
    authority:
      `https://login.microsoftonline.com/${tenantId}`, 
    redirectUri: "/home", // Must be registered in Azure Portal
    postLogoutRedirectUri: "/logoutpage",
    navigateToLoginRequestUrl: false,
  },
  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: false,
  },
  system: {
    loggerOptions: {
      loggerCallback: (level: any, message: any, containsPii: any) => {
        if (containsPii) return;
        switch (level) {
          case LogLevel.Error:
            console.error(message);
            break;
          case LogLevel.Info:
            console.info(message);
            break;
          case LogLevel.Verbose:
            console.debug(message);
            break;
          case LogLevel.Warning:
            console.warn(message);
            break;
        }
      },
    },
  },
};

/**
 * Scopes you add here will be prompted for user consent during sign-in.
 * By default, MSAL.js will add OIDC scopes (openid, profile, email).
 */
export const loginRequest = {
  scopes: ["openid", "profile", "email", "offline_access"], // you can add API scopes here
};

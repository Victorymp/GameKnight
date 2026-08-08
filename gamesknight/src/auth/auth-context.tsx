import { createContext, useContext, useState, ReactNode } from "react";

interface AuthContextType {
  login: (email: string, password: string) => boolean;
  // ...maybe logout, user, etc
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [, setUser] = useState<string | null>(null);

  const login = (email: string, password: string) => {
    if (password === "password") {
      setUser(email);
      return true;
    }
    return false;
  };

  return (
    <AuthContext.Provider value={{ login }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
};

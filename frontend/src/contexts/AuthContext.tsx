import React, { createContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
interface AuthProviderType {
  children: React.ReactNode;
}

interface AuthContextType {
  token: string;
  isValid: boolean;
}

const AuthContext = createContext<AuthContextType>({
  token: "",
  isValid: false,
});

function isTokenValid(token: string): boolean {
  if (token === "") return false;

  try {
    const { exp } = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    const isTokenNotExpired: boolean = (exp || 0) > currentTime;
    return isTokenNotExpired;
  } catch (error) {
    return false;
  }
}

const AuthProvider: React.FC<AuthProviderType> = (props: AuthProviderType) => {
  const [token, setToken] = useState<string>(() => {
    return localStorage.getItem("access_token") || "";
  });
  const [isValid, setIsValid] = useState<boolean>(false);

  // Update isValid when token changes
  useEffect(() => {
    setIsValid(isTokenValid(token));
  }, [token]);

  // Listen for storage changes (e.g., logout from another tab)
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === "access_token") {
        const newToken = event.newValue || "";
        setToken(newToken);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return (
    <AuthContext.Provider value={{ token, isValid }}>
      {props.children}
    </AuthContext.Provider>
  );
};

export { AuthProvider };
export const useAuth = () => React.useContext(AuthContext);
export default AuthContext;

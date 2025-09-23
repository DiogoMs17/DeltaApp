
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { apiRequest } from "./queryClient";

interface User {
  id: number;
  name: string;
  userType: "admin" | "editor" | "consulta";
}

interface UserPermissions {
  canEdit: boolean;
  canApprove: boolean;
  canViewSensitive: boolean;
}

interface AuthContextType {
  user: User | null;
  permissions: UserPermissions | null;
  login: (accessCode: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [permissions, setPermissions] = useState<UserPermissions | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadUserPermissions = async (userId: number) => {
    try {
      // For now, set default permissions based on user type stored in localStorage
      const savedUser = localStorage.getItem("user");
      if (savedUser) {
        const userData = JSON.parse(savedUser);
        const defaultPermissions = {
          canEdit: userData.userType === "admin" || userData.userType === "editor",
          canApprove: userData.userType === "admin",
          canViewSensitive: userData.userType !== "consulta",
        };
        setPermissions(defaultPermissions);
      } else {
        setPermissions({
          canEdit: false,
          canApprove: false,
          canViewSensitive: true,
        });
      }
    } catch (error) {
      console.error("Error loading user permissions:", error);
      setPermissions({
        canEdit: false,
        canApprove: false,
        canViewSensitive: true,
      });
    }
  };

  const login = async (accessCode: string) => {
    const response = await apiRequest("POST", "/api/auth/login", { accessCode });
    const result = await response.json();
    
    if (result.success) {
      const userData = {
        ...result.administrator,
        userType: result.administrator.userType || "admin"
      };
      
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
      await loadUserPermissions(userData.id);
    } else {
      throw new Error(result.message || "Erro no login");
    }
  };

  const logout = () => {
    setUser(null);
    setPermissions(null);
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  useEffect(() => {
    const checkAuth = async () => {
      const savedUser = localStorage.getItem("user");
      
      if (savedUser) {
        try {
          const userData = JSON.parse(savedUser);
          setUser(userData);
          await loadUserPermissions(userData.id);
        } catch (error) {
          localStorage.removeItem("user");
        }
      }
      setIsLoading(false);
    };
    
    checkAuth();
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  return (
    <AuthContext.Provider value={{
      user,
      permissions,
      login,
      logout,
      isLoading,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

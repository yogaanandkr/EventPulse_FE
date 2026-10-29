import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { apolloClient } from "../apollo/client";
import { ME, REFRESH_TOKEN, LOGOUT } from "../graphql/auth";
import { setAccessToken } from "../utils/token";

type UserRole = "CUSTOMER" | "ORGANIZER" | "ADMIN";

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (token: string, user: User) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const restoreSession = async () => {
      try {
        const refreshResult = await apolloClient.mutate<{
          refreshToken: { accessToken: string };
        }>({
          mutation: REFRESH_TOKEN,
        });

        const token = refreshResult.data?.refreshToken.accessToken;

        if (!token || !active) return;

        setAccessToken(token);

        const meResult = await apolloClient.query<{
          me: User;
        }>({
          query: ME,
          fetchPolicy: "network-only",
        });

        if (active && meResult?.data?.me) {
          setUser(meResult.data.me);
        }
      } catch {
        if (active) {
          setAccessToken(null);
          setUser(null);
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    restoreSession();

    return () => {
      active = false;
    };
  }, []);

  const login = (token: string, loggedInUser: User) => {
    setAccessToken(token);
    setUser(loggedInUser);
  };

  const logout = async () => {
    try {
      await apolloClient.mutate({
        mutation: LOGOUT,
      });
    } finally {
      setAccessToken(null);
      setUser(null);
      await apolloClient.clearStore();
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
};

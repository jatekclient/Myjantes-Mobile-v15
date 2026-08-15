import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authApi, getApiAccessToken, setApiAccessToken, setApiOnTokensRefreshed, setApiRefreshToken, type LoginData, type RegisterData, type UserProfile } from "./api";

const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";
const CLIENT_ROLES = new Set(["client", "client_professionnel", "client_particulier"]);

interface SocialLoginSuccess {
  status: "authenticated";
  accessToken: string;
  refreshToken: string;
  user: UserProfile;
}

interface SocialLoginNeedsRegistration {
  status: "needs_registration";
  email: string;
  displayName: string | null;
  firebaseUid: string;
}

type SocialLoginResult = SocialLoginSuccess | SocialLoginNeedsRegistration;

interface AuthContextValue {
  user: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isEmployee: boolean;
  isAdminOrEmployee: boolean;
  accessToken: string | null;
  login: (data: LoginData) => Promise<UserProfile | null>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  biometricLogin: () => Promise<boolean>;
  socialLogin: (idToken: string, provider: string) => Promise<SocialLoginResult>;
  appleLogin: (idToken: string, rawNonce: string) => Promise<SocialLoginResult>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

async function storageSet(key: string, value: string) {
  if (Platform.OS === "web") return AsyncStorage.setItem(key, value);
  return SecureStore.setItemAsync(key, value);
}

async function storageGet(key: string) {
  if (Platform.OS === "web") return AsyncStorage.getItem(key);
  return SecureStore.getItemAsync(key);
}

async function storageRemove(key: string) {
  if (Platform.OS === "web") return AsyncStorage.removeItem(key);
  return SecureStore.deleteItemAsync(key);
}

function normalizeUser(value: any): UserProfile | null {
  const user = value?.user || value?.data?.user || value?.profile ||
    (value?.id || value?.email ? value : value?.data);
  return user?.id || user?.email ? user as UserProfile : null;
}

function isClientUser(user: UserProfile | null) {
  if (!user) return false;
  const role = String(user.role || "").toLowerCase();
  return CLIENT_ROLES.has(role);
}

function decodeJwt(token: string): any {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=")));
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  const clearSession = useCallback(async () => {
    setUser(null);
    setAccessToken(null);
    setApiAccessToken(null);
    setApiRefreshToken(null);
    await Promise.all([
      storageRemove(ACCESS_TOKEN_KEY),
      storageRemove(REFRESH_TOKEN_KEY),
    ]);
  }, []);

  const refreshUser = useCallback(async () => {
    const savedAccess = await storageGet(ACCESS_TOKEN_KEY);
    const savedRefresh = await storageGet(REFRESH_TOKEN_KEY);
    if (!savedAccess) {
      await clearSession();
      return;
    }

    setApiAccessToken(savedAccess);
    setApiRefreshToken(savedRefresh);
    try {
      const current = normalizeUser(await authApi.getUser());
      if (!isClientUser(current)) {
        await clearSession();
        return;
      }
      setAccessToken(savedAccess);
      setUser(current);
    } catch (err: any) {
      // Ne purger la session que si l'authentification est réellement invalide.
      // Une panne réseau ou une indisponibilité temporaire du backend ne doit
      // pas déconnecter l'utilisateur ni détruire son refresh token.
      if (err?.status === 401 || err?.status === 403) {
        await clearSession();
      } else {
        setAccessToken(savedAccess);
      }
    }
  }, [clearSession]);

  useEffect(() => {
    setApiOnTokensRefreshed((access, refresh) => {
      setAccessToken(access);
      void storageSet(ACCESS_TOKEN_KEY, access);
      if (refresh) {
        void storageSet(REFRESH_TOKEN_KEY, refresh);
      }
    });
    refreshUser().finally(() => setIsLoading(false));
  }, [refreshUser]);

  const login = useCallback(async (data: LoginData) => {
    const result = await authApi.login(data);
    const loggedInUser = normalizeUser(result);
    const token = result?.accessToken || result?.token || result?.data?.accessToken;
    const refresh = result?.refreshToken || result?.data?.refreshToken;

    if (!loggedInUser || !isClientUser(loggedInUser)) {
      await clearSession();
      throw new Error("Cette application est réservée aux clients MyJantes.");
    }
    if (token) {
      setApiAccessToken(token);
      setApiRefreshToken(refresh || null);
      setAccessToken(token);
      await storageSet(ACCESS_TOKEN_KEY, token);
      if (refresh) await storageSet(REFRESH_TOKEN_KEY, refresh);
    }
    setUser(loggedInUser);
    return loggedInUser;
  }, [clearSession]);

  const register = useCallback(async (data: RegisterData) => {
    await authApi.register({ ...data, role: "client" });
    await login({ email: data.email, password: data.password });
  }, [login]);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // The local session is still cleared if the upstream is unavailable.
    }
    await clearSession();
  }, [clearSession]);

  const socialLogin = useCallback(async (idToken: string, provider: string): Promise<SocialLoginResult> => {
    const response = await fetch("https://api.myjantes.fr/api/mobile/auth/firebase", {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({ idToken, provider }),
    });
    const data = await response.json().catch(() => ({}));
    if (response.status === 404) {
      const decoded = decodeJwt(idToken);
      return {
        status: "needs_registration",
        email: data.email || decoded?.email || "",
        displayName: data.displayName || decoded?.name || null,
        firebaseUid: data.firebaseUid || decoded?.user_id || decoded?.sub || "",
      };
    }
    if (!response.ok) throw new Error(data.message || "Authentification sociale indisponible.");
    const loggedInUser = normalizeUser(data);
    const token = data.accessToken || data.token || data.data?.accessToken;
    const refresh = data.refreshToken || data.data?.refreshToken;
    if (!loggedInUser || !token || !isClientUser(loggedInUser)) {
      throw new Error("Ce compte n'est pas un compte client MyJantes.");
    }
    setApiAccessToken(token);
    setApiRefreshToken(refresh || null);
    setAccessToken(token);
    setUser(loggedInUser);
    await storageSet(ACCESS_TOKEN_KEY, token);
    if (refresh) await storageSet(REFRESH_TOKEN_KEY, refresh);
    return { status: "authenticated", accessToken: token, refreshToken: refresh || "", user: loggedInUser };
  }, []);

  const appleLogin = useCallback((idToken: string, rawNonce: string) =>
    socialLogin(idToken, "apple"), [socialLogin]);

  const biometricLogin = useCallback(async () => false, []);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    isLoading,
    isAuthenticated: !!user,
    isAdmin: false,
    isEmployee: false,
    isAdminOrEmployee: false,
    accessToken: accessToken || getApiAccessToken(),
    login,
    register,
    logout,
    refreshUser,
    biometricLogin,
    socialLogin,
    appleLogin,
  }), [user, isLoading, accessToken, login, register, logout, refreshUser, biometricLogin, socialLogin, appleLogin]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
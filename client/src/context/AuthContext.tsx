import {
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { apiRequest } from "../lib/api";

import {
  AuthContext,
  type Organization,
  type User,
} from "./auth-context";

type AuthProviderProps = {
  children: ReactNode;
};

const ACTIVE_WORKSPACE_KEY = "flowdeck_active_workspace";

export function AuthProvider({
  children,
}: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);

  const [organizations, setOrganizations] = useState<
    Organization[]
  >([]);

  const [currentOrganization, setCurrentOrganization] =
    useState<Organization | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  const refreshOrganizations = useCallback(async () => {
    try {
      const response = await apiRequest("/organizations");

      const workspaceList =
        response.data.organizations as Organization[];

      setOrganizations(workspaceList);

      setCurrentOrganization((current) => {
        const savedId = localStorage.getItem(ACTIVE_WORKSPACE_KEY);
        const next =
          workspaceList.find(
            (workspace) => workspace.organization.id === current?.organization.id
          ) ||
          workspaceList.find(
            (workspace) => workspace.organization.id === savedId
          ) ||
          workspaceList[0] ||
          null;

        if (next) localStorage.setItem(ACTIVE_WORKSPACE_KEY, next.organization.id);
        else localStorage.removeItem(ACTIVE_WORKSPACE_KEY);
        return next;
      });

      return workspaceList;
    } catch {
      setOrganizations([]);
      setCurrentOrganization(null);
      localStorage.removeItem(ACTIVE_WORKSPACE_KEY);
      return [];
    }
  }, []);

  const selectOrganization = useCallback(
    (organizationId: string) => {
      localStorage.setItem(ACTIVE_WORKSPACE_KEY, organizationId);
      const selected = organizations.find(
        (workspace) => workspace.organization.id === organizationId
      );
      if (!selected) return;
      setCurrentOrganization(selected);
    },
    [organizations]
  );

  const refreshUser = useCallback(async () => {
    const token = localStorage.getItem("flowdeck_token");

    if (!token) {
      setUser(null);
      setOrganizations([]);
      setCurrentOrganization(null);
      setIsLoading(false);

      return;
    }

    setIsLoading(true);

    try {
      const response = await apiRequest("/auth/me");

      setUser(response.data.user);

      await refreshOrganizations();
    } catch {
      localStorage.removeItem("flowdeck_token");

      setUser(null);
      setOrganizations([]);
      setCurrentOrganization(null);
    } finally {
      setIsLoading(false);
    }
  }, [refreshOrganizations]);

  function logout() {
    localStorage.removeItem("flowdeck_token");
    localStorage.removeItem(ACTIVE_WORKSPACE_KEY);

    setUser(null);
    setOrganizations([]);
    setCurrentOrganization(null);
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void refreshUser();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [refreshUser]);

  return (
    <AuthContext.Provider
      value={{
        user,
        organizations,
        currentOrganization,
        isLoading,
        refreshUser,
        refreshOrganizations,
        selectOrganization,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

import { createContext } from "react";

export type User = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  emailVerifiedAt: string | null;
};

export type Organization = {
  role: "OWNER" | "ADMIN" | "MEMBER";
  joinedAt: string;

  organization: {
    id: string;
    name: string;
    slug: string;
    createdAt: string;
  };
};

export type AuthContextType = {
  user: User | null;
  organizations: Organization[];
  currentOrganization: Organization | null;
  isLoading: boolean;
  refreshUser: () => Promise<void>;
  refreshOrganizations: () => Promise<Organization[]>;
  selectOrganization: (organizationId: string) => void;
  logout: () => void;
};

export const AuthContext =
  createContext<AuthContextType | undefined>(undefined);

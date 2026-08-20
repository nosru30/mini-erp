export type AdminUser = {
  username: string;
  email: string | null;
  name: string | null;
  status: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AdminUserPage = {
  users: AdminUser[];
  nextToken: string | null;
};

export type AdminUserForm = {
  email: string;
  name: string;
};

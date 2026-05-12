export enum UserRole {
  USER = "USER",
  COLLECTOR = "COLLECTOR",
  ADMIN = "ADMIN",
}

export type User = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  createdAt: string;
};

export type CreateUserInput = {
  name: string;
  email: string;
  password: string;
  phone?: string;
};

export type UpdateUserInput = {
  name?: string;
  phone?: string;
};

export type LoginInput = {
  email: string;
  password: string;
};

export type AuthResponse = {
  user: User;
};

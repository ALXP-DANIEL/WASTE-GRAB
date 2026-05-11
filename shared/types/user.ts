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
  points: number;
  isActiveCollector: boolean;
  vehicleInfo: string | null;
  createdAt: string;
};

export type CreateUserInput = {
  name: string;
  email: string;
  passwordHash: string;
  phone?: string;
};

export type UpdateUserInput = {
  name?: string;
  phone?: string;
  isActiveCollector?: boolean;
  vehicleInfo?: string;
};

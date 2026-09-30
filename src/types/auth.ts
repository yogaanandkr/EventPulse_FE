export type UserRole = "CUSTOMER" | "ORGANIZER" | "ADMIN";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface MeData {
  me: User | null;
}

export interface LoginData {
  login: {
    accessToken: string;
    user: User;
  };
}

export interface LoginVariables {
  input: {
    email: string;
    password: string;
  };
}

export interface RegisterData {
  register: User;
}

export interface RegisterVariables {
  input: {
    name: string;
    email: string;
    password: string;
    role?: UserRole;
  };
}



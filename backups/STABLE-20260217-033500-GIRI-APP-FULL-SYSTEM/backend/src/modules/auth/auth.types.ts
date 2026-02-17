import type { User, UserPublic, AuthTokens, UUID } from '../../types/index.js';

export interface RegisterInput {
  email: string;
  password: string;
  name: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: UserPublic;
  tokens: AuthTokens;
}

export interface RefreshResponse {
  tokens: AuthTokens;
}

export interface SessionInfo {
  id: UUID;
  ip_address: string | null;
  user_agent: string | null;
  created_at: Date;
  expires_at: Date;
  current: boolean;
}

export interface UserWithPassword extends User {
  password_hash: string;
}

export interface TokenBlacklistEntry {
  id: UUID;
  token_hash: string;
  user_id: UUID;
  expires_at: Date;
  created_at: Date;
}

export interface PasswordResetInput {
  token: string;
  password: string;
}

export interface ForgotPasswordInput {
  email: string;
}

export interface UpdatePasswordInput {
  currentPassword: string;
  newPassword: string;
}

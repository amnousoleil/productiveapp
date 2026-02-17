import type { UserPublic, AuthTokens, UUID } from '../../types/index.js';
import type { RegisterInput, LoginInput, AuthResponse, UpdatePasswordInput, SessionInfo } from './auth.types.js';
export declare class AuthService {
    register(input: RegisterInput, ip?: string, userAgent?: string): Promise<AuthResponse>;
    login(input: LoginInput, ip?: string, userAgent?: string): Promise<AuthResponse>;
    logout(userId: UUID, sessionId: UUID, accessToken: string): Promise<void>;
    logoutAll(userId: UUID): Promise<void>;
    refresh(refreshToken: string, ip?: string, userAgent?: string): Promise<AuthTokens>;
    getMe(userId: UUID): Promise<UserPublic>;
    updatePassword(userId: UUID, input: UpdatePasswordInput): Promise<void>;
    getSessions(userId: UUID, currentSessionId: UUID): Promise<SessionInfo[]>;
    deleteSession(userId: UUID, sessionId: UUID): Promise<void>;
    forgotPassword(email: string): Promise<void>;
    resetPassword(token: string, newPassword: string): Promise<void>;
    private createSession;
}
export declare const authService: AuthService;
//# sourceMappingURL=auth.service.d.ts.map
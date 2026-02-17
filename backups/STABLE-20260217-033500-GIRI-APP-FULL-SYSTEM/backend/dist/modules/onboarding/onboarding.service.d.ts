import type { UUID } from '../../types/index.js';
export declare class OnboardingService {
    /**
     * Configure un workspace complet pour un nouvel utilisateur avec des données d'onboarding
     * @param userId - L'ID de l'utilisateur
     * @param userName - Le nom complet de l'utilisateur
     * @param email - L'email de l'utilisateur (non utilisé pour l'instant, prévu pour personnalisation future)
     */
    setupNewUserWorkspace(userId: UUID, _userName: string, _email: string): Promise<void>;
}
export declare const onboardingService: OnboardingService;
//# sourceMappingURL=onboarding.service.d.ts.map
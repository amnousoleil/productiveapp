export interface EmailOptions {
    to: string;
    subject: string;
    html: string;
    text?: string;
}
export declare const EmailService: {
    /**
     * Envoie un email generique
     */
    send(options: EmailOptions): Promise<boolean>;
    /**
     * Email de bienvenue apres inscription
     */
    sendWelcome(to: string, name: string): Promise<boolean>;
    /**
     * Email de reset mot de passe
     */
    sendPasswordReset(to: string, name: string, resetToken: string): Promise<boolean>;
    /**
     * Email d'invitation workspace
     */
    sendWorkspaceInvitation(to: string, inviterName: string, workspaceName: string, inviteToken: string): Promise<boolean>;
    /**
     * Email de verification d'adresse
     */
    sendEmailVerification(to: string, name: string, verifyToken: string): Promise<boolean>;
};
export default EmailService;
//# sourceMappingURL=email.service.d.ts.map
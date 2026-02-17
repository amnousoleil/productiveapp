// =============================================
// MAIL EXECUTOR
// Exécute toutes les actions liées aux emails
// =============================================

const MailExecutor = {
    /**
     * Envoie un email
     */
    async send(params) {
        const { to, subject, body, cc, bcc } = params;

        if (!to) throw new Error('Destinataire (to) obligatoire');
        if (!body) throw new Error('Corps du message (body) obligatoire');

        // Résoudre le destinataire si c'est un nom
        const resolvedTo = await MahayawenApiMap.utils.resolveContact(to).catch(() => to);

        // Générer un sujet automatique si manquant
        const finalSubject = subject || this.generateSubject(body);

        // Préparer les données
        const mailData = {
            to: resolvedTo,
            subject: finalSubject,
            body
        };

        if (cc) mailData.cc = cc;
        if (bcc) mailData.bcc = bcc;

        // Appeler l'API
        const fn = MahayawenApiMap.mail.send.fn();
        const result = await fn(mailData);

        return {
            success: true,
            message: `✉️ Email envoyé à ${resolvedTo}`,
            subject: finalSubject,
            data: result,
            actions: [
                { label: 'Voir dans Mail Pro', intent: 'system.navigate', params: { view: 'mail-pro' } }
            ]
        };
    },

    /**
     * Récupère les emails envoyés
     */
    async getSentMails(params = {}) {
        const fn = MahayawenApiMap.mail.getSentMails.fn();
        const mails = await fn(params);

        const mailsArray = Array.isArray(mails.data) ? mails.data : mails;

        return {
            success: true,
            message: `📧 ${mailsArray.length} email(s) envoyé(s)`,
            data: mailsArray,
            count: mailsArray.length
        };
    },

    /**
     * Récupère un email par ID
     */
    async getMailById(params) {
        const { mailId } = params;
        if (!mailId) throw new Error('mailId manquant');

        const fn = MahayawenApiMap.mail.getMailById.fn();
        const mail = await fn(mailId);

        return {
            success: true,
            message: `📧 Email: ${mail.data?.subject || 'Sans sujet'}`,
            data: mail.data
        };
    },

    /**
     * Sauvegarde un brouillon
     */
    async saveDraft(params) {
        const { to, subject, body } = params;

        if (!to && !subject && !body) {
            throw new Error('Au moins un champ requis pour un brouillon');
        }

        const fn = MahayawenApiMap.mail.saveDraft.fn();
        const draft = await fn(params);

        return {
            success: true,
            message: `💾 Brouillon sauvegardé`,
            data: draft,
            actions: [
                { label: 'Éditer', intent: 'mail.editDraft', params: { draftId: draft.data?.id } }
            ]
        };
    },

    /**
     * Récupère les brouillons
     */
    async getDrafts(params = {}) {
        const fn = MahayawenApiMap.mail.getDrafts.fn();
        const drafts = await fn();

        const draftsArray = Array.isArray(drafts.data) ? drafts.data : drafts;

        return {
            success: true,
            message: `📝 ${draftsArray.length} brouillon(s)`,
            data: draftsArray,
            count: draftsArray.length
        };
    },

    /**
     * Supprime un brouillon (confirmation requise)
     */
    async deleteDraft(params) {
        const { draftId } = params;
        if (!draftId) throw new Error('draftId manquant');

        const fn = MahayawenApiMap.mail.deleteDraft.fn();
        await fn(draftId);

        return {
            success: true,
            message: `🗑️ Brouillon supprimé`,
            data: { draftId }
        };
    },

    /**
     * Récupère les templates
     */
    async getTemplates(params = {}) {
        const fn = MahayawenApiMap.mail.getTemplates.fn();
        const templates = await fn();

        const templatesArray = Array.isArray(templates.data) ? templates.data : templates;

        return {
            success: true,
            message: `📋 ${templatesArray.length} template(s)`,
            data: templatesArray,
            count: templatesArray.length
        };
    },

    /**
     * Crée un template
     */
    async createTemplate(params) {
        const { name, subject, body } = params;

        if (!name) throw new Error('Nom du template obligatoire');
        if (!subject || !body) throw new Error('Subject et body obligatoires');

        const fn = MahayawenApiMap.mail.createTemplate.fn();
        const template = await fn(params);

        return {
            success: true,
            message: `📋 Template créé : "${name}"`,
            data: template
        };
    },

    /**
     * Récupère les statistiques des emails
     */
    async getStats(params = {}) {
        const fn = MahayawenApiMap.mail.getStats.fn();
        const stats = await fn();

        return {
            success: true,
            message: `📊 Statistiques emails`,
            data: stats.data || stats
        };
    },

    /**
     * Génère un sujet automatique à partir du corps
     */
    generateSubject(body) {
        if (!body) return 'Message';

        const words = body.trim().split(' ').slice(0, 6).join(' ');
        return words + (body.split(' ').length > 6 ? '...' : '');
    }
};

// Exposer globalement
if (typeof window !== 'undefined') {
    window.MailExecutor = MailExecutor;
}

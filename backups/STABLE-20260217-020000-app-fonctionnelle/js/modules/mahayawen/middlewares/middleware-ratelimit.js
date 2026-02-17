// =============================================
// MIDDLEWARE RATE LIMITING
// Protection contre les boucles et actions trop rapides
// =============================================

const RateLimitMiddleware = {
    lastExecutions: new Map(), // intent -> timestamp
    counts: new Map(), // intent -> count dans la dernière minute

    /**
     * Vérifie le rate limiting
     * Limite: 10 actions par minute, min 1 seconde entre deux actions identiques
     */
    async process(intent) {
        const now = Date.now();
        const key = intent.intent;

        // 1. Vérifier délai minimum entre deux actions identiques
        const lastExec = this.lastExecutions.get(key) || 0;
        if (now - lastExec < 1000) {
            return {
                blocked: true,
                reason: '⏳ Action trop rapide. Veuillez patienter 1 seconde.',
                retryAfter: 1000 - (now - lastExec)
            };
        }

        // 2. Compter les actions dans la dernière minute
        const countEntry = this.counts.get(key) || { count: 0, resetAt: now + 60000 };

        // Reset si la minute est écoulée
        if (now >= countEntry.resetAt) {
            countEntry.count = 0;
            countEntry.resetAt = now + 60000;
        }

        countEntry.count++;
        this.counts.set(key, countEntry);

        // 3. Vérifier limite de 10 par minute
        if (countEntry.count > 10) {
            return {
                blocked: true,
                reason: '🚫 Trop d\'actions de ce type. Limite: 10 par minute.',
                retryAfter: countEntry.resetAt - now
            };
        }

        // 4. Enregistrer l'exécution
        this.lastExecutions.set(key, now);

        // Nettoyer les anciennes entrées (éviter fuite mémoire)
        this.cleanup(now);

        return { blocked: false };
    },

    /**
     * Nettoyer les entrées anciennes (> 2 minutes)
     */
    cleanup(now) {
        for (const [key, timestamp] of this.lastExecutions.entries()) {
            if (now - timestamp > 120000) {
                this.lastExecutions.delete(key);
            }
        }
        for (const [key, entry] of this.counts.entries()) {
            if (now >= entry.resetAt + 60000) {
                this.counts.delete(key);
            }
        }
    }
};

// Exposer globalement
if (typeof window !== 'undefined') {
    window.RateLimitMiddleware = RateLimitMiddleware;
}

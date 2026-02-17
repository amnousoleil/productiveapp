// =============================================
// PRODUCTIVEAPP - FILES MODULE
// Gestion des fichiers et uploads
// =============================================

const FilesModule = {
    initialized: false,

    /**
     * Initialise le module
     */
    init() {
        if (this.initialized) return;
        console.log('[FilesModule] Initialized');
        this.initialized = true;
    },

    /**
     * Upload un fichier
     */
    async upload(file, workspaceId) {
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch(`/api/v1/files/workspace/${workspaceId}/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${ApiTokens.getAccessToken()}`
                },
                body: formData
            });
            return await response.json();
        } catch (error) {
            console.error('[FilesModule] Upload error:', error);
            throw error;
        }
    },

    /**
     * Liste les fichiers d'un workspace
     */
    async list(workspaceId) {
        try {
            const response = await ApiFetch.get(`/files/workspace/${workspaceId}`);
            return response.data || [];
        } catch (error) {
            console.error('[FilesModule] List error:', error);
            return [];
        }
    },

    /**
     * Supprime un fichier
     */
    async delete(fileId) {
        try {
            await ApiFetch.delete(`/files/${fileId}`);
            return true;
        } catch (error) {
            console.error('[FilesModule] Delete error:', error);
            return false;
        }
    },

    /**
     * Obtient l'URL de telechargement
     */
    getDownloadUrl(fileId) {
        return `/api/v1/files/${fileId}/download`;
    }
};

// Auto-init
if (typeof window !== 'undefined') {
    window.FilesModule = FilesModule;
}

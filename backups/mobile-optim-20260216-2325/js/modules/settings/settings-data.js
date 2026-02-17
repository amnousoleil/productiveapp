/**
 * SETTINGS DATA - ProductiveApp v4.0
 * Actions: export, cache, toast
 */

const SettingsData = (function() {
    'use strict';

    /**
     * Show toast notification
     */
    function showToast(message, type) {
        type = type || 'success';
        if (typeof Toast !== 'undefined' && Toast.show) { Toast.show(message, type); return; }
        var toast = document.createElement('div');
        toast.className = 'settings-toast ' + type;
        toast.innerHTML = '<span class="settings-toast-icon">' + (type === 'success' ? SettingsState.icons.check : '!') + '</span><span>' + message + '</span>';
        toast.style.cssText = 'position: fixed; bottom: 24px; right: 24px; background: ' + (type === 'success' ? 'rgba(34, 197, 94, 0.95)' : 'rgba(239, 68, 68, 0.95)') + '; color: white; padding: 12px 20px; border-radius: 10px; display: flex; align-items: center; gap: 10px; font-size: 14px; font-weight: 500; z-index: 100000; animation: slideInRight 0.3s ease; box-shadow: 0 4px 20px rgba(0,0,0,0.3);';
        document.body.appendChild(toast);
        setTimeout(function() { toast.style.animation = 'slideOutRight 0.3s ease'; setTimeout(function() { toast.remove(); }, 300); }, 3000);
    }

    /**
     * Export user data as JSON
     */
    function exportData() {
        try {
            var data = {
                exportDate: new Date().toISOString(),
                version: SettingsState.CONFIG.version,
                user: SettingsState.getCurrentUser(),
                settings: {
                    theme: SettingsState.getCurrentTheme(),
                    notifications: SettingsState.getNotificationSettings(),
                    sidebarCompact: SettingsState.isSidebarCompact()
                },
                localStorage: {}
            };
            var relevantKeys = ['tasks', 'projects', 'notes', 'theme', 'galaxyNodes'];
            relevantKeys.forEach(function(key) {
                var value = localStorage.getItem(key);
                if (value) { try { data.localStorage[key] = JSON.parse(value); } catch (e) { data.localStorage[key] = value; } }
            });
            var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            var url = URL.createObjectURL(blob);
            var a = document.createElement('a');
            a.href = url;
            a.download = 'productiveapp-export-' + new Date().toISOString().split('T')[0] + '.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            showToast('Donnees exportees avec succes');
        } catch (e) {
            console.error('Export error:', e);
            showToast('Erreur lors de l\'export', 'error');
        }
    }

    /**
     * Clear local cache
     */
    function clearCache() {
        if (!confirm('Etes-vous sur de vouloir vider le cache local ?\n\nCette action supprimera toutes les donnees locales.\n\nCette action est irreversible.')) return;
        try {
            var session = localStorage.getItem('currentUser');
            var token = localStorage.getItem('authToken');
            localStorage.clear();
            if (session) localStorage.setItem('currentUser', session);
            if (token) localStorage.setItem('authToken', token);
            showToast('Cache local vide');
            setTimeout(function() { location.reload(); }, 1000);
        } catch (e) {
            console.error('Clear cache error:', e);
            showToast('Erreur lors du vidage du cache', 'error');
        }
    }

    return { showToast: showToast, exportData: exportData, clearCache: clearCache };
})();

if (typeof window !== 'undefined') {
    window.SettingsData = SettingsData;
}

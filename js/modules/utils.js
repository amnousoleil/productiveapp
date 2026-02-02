// =============================================
// PRODUCTIVEAPP - UTILS MODULE
// Fonctions utilitaires partagées
// =============================================

const Utils = {
    /**
     * Sélecteur DOM simplifié
     * @param {string} id - ID de l'élément
     * @returns {HTMLElement|null}
     */
    $(id) {
        return document.getElementById(id);
    },

    /**
     * Échappe les caractères HTML dangereux
     * @param {string} text - Texte à échapper
     * @returns {string} - Texte échappé
     */
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    /**
     * Obtient le label de priorité
     * @param {number} level - Niveau (1, 2, 3)
     * @returns {string} - Label de priorité
     */
    getPriorityLabel(level) {
        const labels = { 1: '🔥 Urgent', 2: 'Normal', 3: '💤 Zen' };
        return labels[level] || 'Normal';
    },

    /**
     * Obtient le nom d'un utilisateur par ID
     * @param {string} userId - ID utilisateur
     * @returns {string} - Nom de l'utilisateur
     */
    getUserName(userId) {
        const user = AppConfig.USERS.find(u => u.id === userId);
        return user ? user.name : userId;
    },

    /**
     * Obtient l'avatar d'un utilisateur par ID
     * @param {string} userId - ID utilisateur
     * @returns {string} - Avatar emoji
     */
    getUserAvatar(userId) {
        const user = AppConfig.USERS.find(u => u.id === userId);
        return user ? user.avatar : '👤';
    },

    /**
     * Génère un ID unique
     * @param {string} prefix - Préfixe pour l'ID
     * @returns {string} - ID unique
     */
    generateId(prefix = 'id') {
        return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    },

    /**
     * Formate une date en français
     * @param {Date|string} date - Date à formater
     * @returns {string} - Date formatée
     */
    formatDate(date) {
        return new Date(date).toLocaleDateString('fr-FR');
    },

    /**
     * Formate une heure en français
     * @param {Date|string} date - Date/heure à formater
     * @returns {string} - Heure formatée
     */
    formatTime(date) {
        return new Date(date).toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit'
        });
    },

    /**
     * Convertit un Blob en base64
     * @param {Blob} blob - Blob à convertir
     * @returns {Promise<string>} - Données base64
     */
    blobToBase64(blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    },

    /**
     * Convertit un File en base64
     * @param {File} file - Fichier à convertir
     * @returns {Promise<string>} - Données base64
     */
    fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    },

    /**
     * Débounce une fonction
     * @param {Function} func - Fonction à débouncer
     * @param {number} wait - Délai en ms
     * @returns {Function} - Fonction débouncée
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * Extrait du texte d'une réponse API (structure variable)
     * @param {any} data - Données de réponse
     * @returns {string|null} - Texte extrait ou null
     */
    extractText(data) {
        if (typeof data === 'string') return data;
        if (!data) return null;

        // Chercher dans les clés communes
        if (data.output && typeof data.output === 'string') return data.output;
        if (data.text && typeof data.text === 'string') return data.text;
        if (data.content && typeof data.content === 'string') return data.content;
        if (data.message && typeof data.message === 'string') return data.message;
        if (data.result && typeof data.result === 'string') return data.result;
        if (data.response && typeof data.response === 'string') return data.response;

        // OpenAI format
        if (data.message && data.message.content) return data.message.content;
        if (data.choices && data.choices[0] && data.choices[0].message) {
            return data.choices[0].message.content;
        }

        // Si c'est un objet avec une seule clé string
        const keys = Object.keys(data);
        for (const key of keys) {
            if (typeof data[key] === 'string' && data[key].length > 5) {
                return data[key];
            }
        }

        // Chercher récursivement dans les sous-objets
        for (const key of keys) {
            if (typeof data[key] === 'object') {
                const found = this.extractText(data[key]);
                if (found) return found;
            }
        }

        return null;
    },

    /**
     * Parse une réponse API (gère array et objets)
     * @param {any} data - Données à parser
     * @returns {string|null} - Texte extrait
     */
    parseApiResponse(data) {
        if (Array.isArray(data)) {
            if (data.length > 0) {
                return this.extractText(data[0]);
            }
            return null;
        }
        return this.extractText(data);
    },

    /**
     * Parse le texte d'une tâche (titre + description)
     * @param {string} fullText - Texte complet
     * @returns {Object} - { title, description }
     */
    parseTaskText(fullText) {
        const parts = (fullText || '').split('\n---\n');
        return {
            title: parts[0] || fullText,
            description: parts[1] || ''
        };
    },

    /**
     * Combine titre et description pour stockage
     * @param {string} title - Titre
     * @param {string} description - Description
     * @returns {string} - Texte combiné
     */
    combineTaskText(title, description) {
        if (description && description.trim()) {
            return `${title}\n---\n${description}`;
        }
        return title;
    },

    /**
     * Scroll vers un élément
     * @param {HTMLElement|string} element - Élément ou sélecteur
     * @param {Object} options - Options de scroll
     */
    scrollTo(element, options = { behavior: 'smooth', block: 'center' }) {
        const el = typeof element === 'string' ? document.querySelector(element) : element;
        if (el) {
            el.scrollIntoView(options);
        }
    },

    /**
     * Clone et remplace un élément (pour reset event listeners)
     * @param {HTMLElement} element - Élément à cloner
     * @returns {HTMLElement} - Nouvel élément
     */
    cloneAndReplace(element) {
        const newElement = element.cloneNode(true);
        element.parentNode.replaceChild(newElement, element);
        return newElement;
    },

    /**
     * Affiche une notification
     * @param {string} message - Message à afficher
     * @param {string} type - Type (success, error, warning, info)
     */
    notify(message, type = 'info') {
        // Pour l'instant, utilise alert, mais pourrait être amélioré
        const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
        console.log(`${icons[type] || ''} ${message}`);
        if (type === 'error' || type === 'warning') {
            alert(message);
        }
    },

    /**
     * Vérifie si on est sur mobile
     * @returns {boolean}
     */
    isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    },

    /**
     * Vérifie si un élément est visible dans le viewport
     * @param {HTMLElement} element - Élément à vérifier
     * @returns {boolean}
     */
    isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }
};

// Exposer $ globalement pour compatibilité
window.$ = Utils.$;
window.Utils = Utils;

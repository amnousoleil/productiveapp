// =============================================
// MAIL UTILS - Fonctions utilitaires
// Helpers pour formatage dates, HTML escape, etc.
// =============================================

const MailUtils = {
  /**
   * Échappe le HTML pour prévenir XSS
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text || '';
    return div.innerHTML;
  },

  /**
   * Formate une date en format court pour liste
   * Aujourd'hui: HH:MM | Hier: "Hier" | Semaine: "Lun" | Ancien: "12 fév"
   */
  formatDateShort(dateStr) {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;
    const hours = Math.floor(diff / (1000 * 60 * 60));

    // Aujourd'hui : heure seulement
    if (hours < 24) {
      return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    }

    // Hier
    if (hours < 48) {
      return 'Hier';
    }

    // Moins de 7 jours : jour de la semaine court (Lun, Mar, etc.)
    if (hours < 168) {
      const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
      return days[date.getDay()];
    }

    // Cette année : jour + mois court (12 fév)
    if (date.getFullYear() === now.getFullYear()) {
      return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    }

    // Année passée : jour + mois + année (12 fév 2025)
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
  },

  /**
   * Formate une date en format détaillé
   * Ex: "Aujourd'hui à 14:30", "Hier à 09:15", "Lundi à 16:45"
   */
  formatDateDetailed(dateStr) {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));

    // Moins d'1h : minutes
    if (minutes < 60) {
      return minutes < 1 ? 'À l\'instant' : `Il y a ${minutes}min`;
    }

    // Moins de 24h : heures + timestamp
    if (hours < 24) {
      const time = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
      return `Aujourd'hui à ${time}`;
    }

    // Hier
    if (hours < 48) {
      const time = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
      return `Hier à ${time}`;
    }

    // Moins de 7 jours : jour de la semaine
    if (hours < 168) {
      const day = date.toLocaleDateString('fr-FR', { weekday: 'long' });
      const time = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
      return `${day.charAt(0).toUpperCase() + day.slice(1)} à ${time}`;
    }

    // Plus vieux : date complète
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
      hour: '2-digit',
      minute: '2-digit'
    });
  },

  /**
   * Formate une date simple pour affichage
   * Ex: "Il y a 2h", "Hier", "12 fév"
   */
  formatDate(dateStr) {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (hours < 1) return 'Il y a quelques minutes';
    if (hours < 24) return `Il y a ${hours}h`;
    if (hours < 48) return 'Hier';

    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  },

  /**
   * Nettoie le HTML pour avoir un preview texte propre
   */
  cleanHtmlPreview(html, maxLength = 80) {
    return html
      .replace(/<head[^>]*>[\s\S]*?<\/head>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<!--[\s\S]*?-->/g, '')
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&[a-z0-9]+;/gi, '')
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s\u00C0-\u024F.,!?-]/g, '')
      .trim()
      .substring(0, maxLength);
  },

  /**
   * Nettoie le texte plain pour preview
   */
  cleanTextPreview(text, maxLength = 80) {
    return text
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, maxLength);
  },

  /**
   * Formate les destinataires (max N emails affichés)
   */
  formatRecipients(recipients, maxDisplay = 2) {
    if (!recipients || recipients.length === 0) return '(aucun destinataire)';

    if (recipients.length === 1) {
      return recipients[0];
    }

    if (recipients.length === maxDisplay) {
      return recipients.join(', ');
    }

    return `${recipients[0]} +${recipients.length - 1}`;
  },

  /**
   * Parse un status email pour affichage
   */
  parseStatus(mail) {
    let icon = '✉️';
    let cssClass = 'sent';
    let tooltip = 'Envoyé';

    if (mail.opened_at) {
      icon = '👁️';
      cssClass = 'opened';
      tooltip = 'Lu le ' + this.formatDate(mail.opened_at);
    } else if (mail.status === 'failed') {
      icon = '❌';
      cssClass = 'failed';
      tooltip = 'Échec d\'envoi';
    }

    return { icon, cssClass, tooltip };
  }
};

window.MailUtils = MailUtils;

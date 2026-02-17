/**
 * Giri Vision - Security Module v1.0
 * Protection XSS et sanitization des inputs utilisateurs
 * @author Architecte Divin
 */

class GiriSecurity {
  /**
   * Sanitize user input (nom, messages chat, etc.)
   * @param {string} input - Raw user input
   * @param {object} options - Sanitization options
   * @returns {string} - Safe HTML string
   */
  static sanitize(input, options = {}) {
    if (typeof input !== 'string') return '';

    const defaults = {
      maxLength: 100,
      allowHTML: false,
      allowEmoji: true
    };

    const opts = { ...defaults, ...options };

    // 1. Truncate
    let sanitized = input.slice(0, opts.maxLength);

    // 2. Remove HTML tags si non autorisé
    if (!opts.allowHTML) {
      sanitized = sanitized
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    // 3. Strip control characters (sauf emoji si autorisé)
    if (!opts.allowEmoji) {
      sanitized = sanitized.replace(/[^\x20-\x7E]/g, ''); // ASCII printable only
    }

    return sanitized.trim();
  }

  /**
   * Sanitize participant name
   */
  static sanitizeParticipantName(name) {
    return this.sanitize(name, {
      maxLength: 50,
      allowHTML: false,
      allowEmoji: true
    });
  }

  /**
   * Sanitize chat message
   */
  static sanitizeChatMessage(message) {
    return this.sanitize(message, {
      maxLength: 500,
      allowHTML: false,
      allowEmoji: true
    });
  }

  /**
   * Sanitize room name
   */
  static sanitizeRoomName(roomName) {
    return this.sanitize(roomName, {
      maxLength: 100,
      allowHTML: false,
      allowEmoji: false
    });
  }

  /**
   * Safe set innerHTML (utilise textContent si pas HTML autorisé)
   */
  static setContent(element, content, allowHTML = false) {
    if (!element) return;

    if (allowHTML) {
      element.innerHTML = this.sanitize(content, { allowHTML: true });
    } else {
      element.textContent = content; // textContent = SAFE (no HTML parsing)
    }
  }
}

// Export global
window.GiriSecurity = GiriSecurity;

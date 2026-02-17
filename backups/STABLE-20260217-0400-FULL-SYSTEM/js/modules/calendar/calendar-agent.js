/**
 * Calendar AI Agent - Frontend
 * @description Interface IA pour prise de RDV en langage naturel
 */
const CalendarAgent = (function() {
  'use strict';

  function wid() {
    return (typeof ApiTokens !== 'undefined' && ApiTokens.getWorkspaceId)
      ? ApiTokens.getWorkspaceId()
      : localStorage.getItem('workspace_id') || '';
  }

  function mid() {
    return localStorage.getItem('member_id') || '';
  }

  /**
   * Parse natural language query
   * @param {string} query - e.g., "Prends RDV avec Brice demain à 14h pour révision projet"
   * @returns {Promise<Object>} Parsed event data
   */
  async function parseQuery(query) {
    return Api.post(`/calendar/workspace/${wid()}/agent/parse`, {
      query,
      member_id: mid()
    });
  }

  /**
   * Create event from natural language query
   * @param {string} query
   * @param {boolean} autoSchedule - If true, find best available slot
   * @returns {Promise<Object>} { event, suggestions? }
   */
  async function createFromQuery(query, autoSchedule = false) {
    return Api.post(`/calendar/workspace/${wid()}/agent/create`, {
      query,
      member_id: mid(),
      auto_schedule: autoSchedule
    });
  }

  /**
   * Find available time slots
   * @param {string} startDate - ISO date
   * @param {string} endDate - ISO date
   * @param {number} durationMinutes - Default: 60
   * @returns {Promise<Array>} Available slots with scores
   */
  async function findAvailableSlots(startDate, endDate, durationMinutes = 60) {
    const params = new URLSearchParams({
      start_date: startDate,
      end_date: endDate,
      duration: durationMinutes,
      member_id: mid()
    });
    const result = await Api.get(`/calendar/workspace/${wid()}/agent/available-slots?${params}`);
    return result.slots || [];
  }

  /**
   * Get AI suggestions for event optimization
   * @param {string} eventId
   * @returns {Promise<Object>} { betterTimes, conflictingEvents, recommendations }
   */
  async function getSuggestions(eventId) {
    return Api.get(`/calendar/workspace/${wid()}/agent/suggestions/${eventId}?member_id=${mid()}`);
  }

  /**
   * Process natural language command from Mahayawen chatbot
   * @param {string} message - User message
   * @returns {Promise<Object>} Response with action taken
   */
  async function processCommand(message) {
    const lowerMsg = message.toLowerCase();

    // Detect calendar-related commands
    const isCalendarCommand =
      lowerMsg.includes('rdv') ||
      lowerMsg.includes('rendez-vous') ||
      lowerMsg.includes('rendez vous') ||
      lowerMsg.includes('réunion') ||
      lowerMsg.includes('meeting') ||
      lowerMsg.includes('événement') ||
      lowerMsg.includes('evenement') ||
      lowerMsg.includes('prends') ||
      lowerMsg.includes('planifie') ||
      lowerMsg.includes('programme');

    if (!isCalendarCommand) {
      return { handled: false };
    }

    try {
      // Check if user wants suggestions for available slots
      const wantsSuggestions =
        lowerMsg.includes('propose') ||
        lowerMsg.includes('suggère') ||
        lowerMsg.includes('disponibilités') ||
        lowerMsg.includes('disponible') ||
        lowerMsg.includes('libre');

      if (wantsSuggestions) {
        // Find slots for next 7 days
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        const nextWeek = new Date(tomorrow);
        nextWeek.setDate(nextWeek.getDate() + 7);

        const slots = await findAvailableSlots(
          tomorrow.toISOString(),
          nextWeek.toISOString()
        );

        return {
          handled: true,
          action: 'suggest_slots',
          data: { slots },
          message: formatSlotsMessage(slots)
        };
      }

      // Create event from query
      const result = await createFromQuery(message, false);

      return {
        handled: true,
        action: 'event_created',
        data: result,
        message: formatCreatedEventMessage(result.event)
      };

    } catch (error) {
      console.error('Calendar agent error:', error);
      return {
        handled: true,
        action: 'error',
        message: "❌ Désolé, je n'ai pas pu traiter votre demande. Essayez de reformuler (ex: 'Prends RDV avec Brice demain à 14h')."
      };
    }
  }

  /**
   * Format slots into human-readable message
   */
  function formatSlotsMessage(slots) {
    if (!slots || slots.length === 0) {
      return "❌ Aucun créneau disponible trouvé dans les 7 prochains jours.";
    }

    let msg = "📅 Voici les créneaux disponibles:\n\n";
    slots.slice(0, 5).forEach((slot, i) => {
      const start = new Date(slot.start);
      const day = start.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
      const time = start.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
      msg += `${i + 1}. ${day} à ${time}\n`;
    });

    return msg;
  }

  /**
   * Format created event message
   */
  function formatCreatedEventMessage(event) {
    if (!event) return "✅ Événement créé !";

    const start = new Date(event.start_date);
    const day = start.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
    const time = start.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

    let msg = `✅ **${event.title}** créé!\n\n`;
    msg += `📅 ${day} à ${time}`;

    if (event.attendees && event.attendees.length > 0) {
      msg += `\n👥 Participants: ${event.attendees.length}`;
    }

    if (event.location) {
      msg += `\n📍 ${event.location}`;
    }

    return msg;
  }

  /**
   * Show suggestions modal for event optimization
   */
  async function showSuggestionsModal(eventId) {
    try {
      const suggestions = await getSuggestions(eventId);

      let html = '<div class="calendar-suggestions-modal">';
      html += '<h3>💡 Suggestions IA</h3>';

      // Recommendations
      if (suggestions.recommendations && suggestions.recommendations.length > 0) {
        html += '<div class="suggestions-section">';
        html += '<h4>Recommandations</h4>';
        suggestions.recommendations.forEach(rec => {
          html += `<p class="suggestion-item">${rec}</p>`;
        });
        html += '</div>';
      }

      // Conflicts
      if (suggestions.conflictingEvents && suggestions.conflictingEvents.length > 0) {
        html += '<div class="suggestions-section">';
        html += '<h4>⚠️ Conflits détectés</h4>';
        suggestions.conflictingEvents.forEach(ev => {
          const start = new Date(ev.start_at).toLocaleString('fr-FR');
          html += `<p class="conflict-item">${ev.title} - ${start}</p>`;
        });
        html += '</div>';
      }

      // Better times
      if (suggestions.betterTimes && suggestions.betterTimes.length > 0) {
        html += '<div class="suggestions-section">';
        html += '<h4>✨ Créneaux optimaux</h4>';
        suggestions.betterTimes.slice(0, 3).forEach((slot, i) => {
          const start = new Date(slot.start);
          const day = start.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
          const time = start.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
          html += `<button class="suggestion-slot-btn" data-start="${slot.start}" data-end="${slot.end}">
            ${i + 1}. ${day} à ${time} (score: ${slot.score})
          </button>`;
        });
        html += '</div>';
      }

      html += '</div>';

      // Show modal (integrate with existing modal system)
      if (typeof Toast !== 'undefined') {
        Toast.info('Suggestions chargées');
      }

      return suggestions;

    } catch (error) {
      console.error('Failed to get suggestions:', error);
      if (typeof Toast !== 'undefined') {
        Toast.error('Erreur lors du chargement des suggestions');
      }
    }
  }

  return {
    parseQuery,
    createFromQuery,
    findAvailableSlots,
    getSuggestions,
    processCommand,
    showSuggestionsModal
  };
})();

if (typeof window !== 'undefined') window.CalendarAgent = CalendarAgent;

/**
 * CalendarView v7.0 - Vue Calendrier Premium Glassmorphism
 * Modes: Mois/Semaine/Jour/Agenda | Drag & Drop | Filtres | Edit Modal | AI Agent
 */
const CalendarView = (function() {
  'use strict';

  let _container = null;
  let _currentDate = new Date();
  let _viewMode = 'month'; // month | week | day | agenda
  let _events = [];
  let _draggedEvent = null;
  let _activeFilters = ['urgent', 'meeting', 'deadline', 'personal', 'reminder', 'general']; // All active by default

  const DAYS_SHORT = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  const DAYS_FULL = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
  const MONTHS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

  // Event type colors mapping
  const EVENT_COLORS = {
    urgent: '#EF4444',
    meeting: '#3B82F6',
    deadline: '#F59E0B',
    personal: '#10B981',
    reminder: '#8B5CF6',
    general: '#6366F1',
  };

  const EVENT_TYPE_LABELS = {
    urgent: 'Urgent',
    meeting: 'Meeting',
    deadline: 'Échéance',
    personal: 'Personnel',
    reminder: 'Rappel',
    general: 'Général',
  };

  function init() {
    _container = document.getElementById('view-calendar');
    if (_container) {
      render(_container);
    }
  }

  function render(container) {
    _container = container;
    container.innerHTML = buildHTML();
    loadEvents();
    attachEventListeners();
  }

  function buildHTML() {
    return `
      <div class="calendar-v7-container">
        <!-- Header -->
        <div class="cal-v7-header">
          <div class="cal-v7-header-left">
            <h2 class="cal-v7-title">📅 Calendrier</h2>
            <p class="cal-v7-subtitle">Événements, tâches et échéances</p>
          </div>
          <div class="cal-v7-header-right">
            <button class="cal-v7-btn cal-v7-btn-secondary" onclick="CalendarView.openAIAssistant()">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
              Assistant IA
            </button>
            <button class="cal-v7-btn cal-v7-btn-secondary" onclick="CalendarView.syncAll()">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/></svg>
              Sync
            </button>
            <button class="cal-v7-btn cal-v7-btn-primary" onclick="CalendarView.showCreate()">
              + Nouvel événement
            </button>
          </div>
        </div>

        <!-- Filters -->
        <div class="cal-v7-filters" id="cal-v7-filters">
          <span class="cal-v7-filter-label">Filtres :</span>
          ${Object.entries(EVENT_TYPE_LABELS).map(([type, label]) => `
            <div class="cal-v7-filter-chip ${type} active" data-type="${type}" onclick="CalendarView.toggleFilter('${type}')">
              <span>${label}</span>
            </div>
          `).join('')}
        </div>

        <!-- Toolbar -->
        <div class="cal-v7-toolbar">
          <div class="cal-v7-toolbar-left">
            <button class="cal-v7-nav-btn" onclick="CalendarView.navigatePrev()">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <button class="cal-v7-nav-btn" onclick="CalendarView.navigateToday()">Aujourd'hui</button>
            <button class="cal-v7-nav-btn" onclick="CalendarView.navigateNext()">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
            <h3 class="cal-v7-current-label" id="cal-v7-current-label"></h3>
          </div>
          <div class="cal-v7-toolbar-right">
            <div class="cal-v7-view-switcher">
              <button class="cal-v7-view-btn ${_viewMode === 'month' ? 'active' : ''}" onclick="CalendarView.setViewMode('month')">Mois</button>
              <button class="cal-v7-view-btn ${_viewMode === 'week' ? 'active' : ''}" onclick="CalendarView.setViewMode('week')">Semaine</button>
              <button class="cal-v7-view-btn ${_viewMode === 'day' ? 'active' : ''}" onclick="CalendarView.setViewMode('day')">Jour</button>
              <button class="cal-v7-view-btn ${_viewMode === 'agenda' ? 'active' : ''}" onclick="CalendarView.setViewMode('agenda')">Agenda</button>
            </div>
          </div>
        </div>

        <!-- Content Area -->
        <div class="cal-v7-content" id="cal-v7-content">
          <!-- Rendered dynamically -->
        </div>

        <!-- Modal -->
        <div class="cal-v7-modal" id="cal-v7-modal" style="display:none"></div>

        <!-- AI Assistant Panel -->
        <div class="cal-v7-ai-panel" id="cal-v7-ai-panel" style="display:none">
          <div class="cal-v7-ai-panel-content">
            <div class="cal-v7-ai-header">
              <h3>🤖 Assistant IA Calendrier</h3>
              <button class="cal-v7-close-btn" onclick="CalendarView.closeAIPanel()">×</button>
            </div>
            <div class="cal-v7-ai-body">
              <p class="cal-v7-ai-hint">Essayez : "Prends RDV avec Brice demain à 14h pour révision projet"</p>
              <textarea id="cal-v7-ai-input" class="cal-v7-ai-input" placeholder="Décrivez l'événement en langage naturel..."></textarea>
              <div class="cal-v7-ai-actions">
                <button class="cal-v7-btn cal-v7-btn-secondary" onclick="CalendarView.findAvailableSlots()">
                  Proposer des créneaux
                </button>
                <button class="cal-v7-btn cal-v7-btn-primary" onclick="CalendarView.createFromAI()">
                  Créer l'événement
                </button>
              </div>
              <div id="cal-v7-ai-result"></div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  async function loadEvents() {
    try {
      const { start, end } = getDateRange();
      if (typeof CalendarApi !== 'undefined') {
        const result = await CalendarApi.listEvents(start, end);
        _events = result || [];
        renderContent();
      }
    } catch (e) {
      console.error('Failed to load events:', e);
    }
  }

  function getDateRange() {
    const y = _currentDate.getFullYear();
    const m = _currentDate.getMonth();
    const d = _currentDate.getDate();

    if (_viewMode === 'month' || _viewMode === 'agenda') {
      const firstDay = new Date(y, m, 1);
      const lastDay = new Date(y, m + 1, 0);
      const start = new Date(firstDay);
      start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
      const end = new Date(lastDay);
      end.setDate(end.getDate() + (7 - ((lastDay.getDay() + 6) % 7) % 7));
      return {
        start: start.toISOString().split('T')[0],
        end: end.toISOString().split('T')[0],
      };
    } else if (_viewMode === 'week') {
      const weekStart = getWeekStart(_currentDate);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      return {
        start: weekStart.toISOString().split('T')[0],
        end: weekEnd.toISOString().split('T')[0],
      };
    } else {
      return {
        start: _currentDate.toISOString().split('T')[0],
        end: _currentDate.toISOString().split('T')[0],
      };
    }
  }

  function getWeekStart(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = (day + 6) % 7;
    d.setDate(d.getDate() - diff);
    return d;
  }

  function renderContent() {
    const content = document.getElementById('cal-v7-content');
    const label = document.getElementById('cal-v7-current-label');
    if (!content || !label) return;

    const y = _currentDate.getFullYear();
    const m = _currentDate.getMonth();
    const d = _currentDate.getDate();

    if (_viewMode === 'week') {
      const weekStart = getWeekStart(_currentDate);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      label.textContent = `${weekStart.getDate()} ${MONTHS[weekStart.getMonth()]} - ${weekEnd.getDate()} ${MONTHS[weekEnd.getMonth()]} ${y}`;
      content.innerHTML = renderWeekView();
    } else if (_viewMode === 'day') {
      label.textContent = `${DAYS_FULL[_currentDate.getDay()]} ${d} ${MONTHS[m]} ${y}`;
      content.innerHTML = renderDayView();
    } else if (_viewMode === 'agenda') {
      label.textContent = `${MONTHS[m]} ${y}`;
      content.innerHTML = renderAgendaView();
    } else {
      label.textContent = `${MONTHS[m]} ${y}`;
      content.innerHTML = renderMonthView();
    }
  }

  function renderMonthView() {
    const y = _currentDate.getFullYear();
    const m = _currentDate.getMonth();
    const firstDay = new Date(y, m, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - ((firstDay.getDay() + 6) % 7));
    const today = new Date().toISOString().split('T')[0];

    let html = '<div class="cal-v7-month-grid">';

    // Headers
    DAYS_SHORT.forEach(day => {
      html += `<div class="cal-v7-month-day-header">${day}</div>`;
    });

    // Calendar days
    const current = new Date(startDate);
    for (let i = 0; i < 42; i++) {
      const dateStr = current.toISOString().split('T')[0];
      const isCurrentMonth = current.getMonth() === m;
      const isToday = dateStr === today;
      const dayEvents = getFilteredEvents().filter(e => e.start_date && e.start_date.substring(0, 10) === dateStr);

      html += `<div class="cal-v7-month-day ${isToday ? 'today' : ''} ${!isCurrentMonth ? 'other-month' : ''}"
                    data-date="${dateStr}"
                    ondrop="CalendarView.handleDrop(event)"
                    ondragover="CalendarView.handleDragOver(event)"
                    ondblclick="CalendarView.showCreate('${dateStr}')">`;
      html += `<div class="cal-v7-month-day-number">${current.getDate()}</div>`;
      html += '<div class="cal-v7-month-day-events">';

      dayEvents.slice(0, 3).forEach(ev => {
        html += renderEventBadge(ev);
      });

      if (dayEvents.length > 3) {
        html += `<div class="cal-v7-more-events">+${dayEvents.length - 3} autres</div>`;
      }

      html += '</div></div>';
      current.setDate(current.getDate() + 1);
    }

    html += '</div>';
    return html;
  }

  function renderWeekView() {
    const weekStart = getWeekStart(_currentDate);
    const today = new Date().toISOString().split('T')[0];

    let html = '<div class="cal-v7-week-grid">';

    // Header row
    html += '<div class="cal-v7-week-time-header"></div>';
    for (let d = 0; d < 7; d++) {
      const day = new Date(weekStart);
      day.setDate(day.getDate() + d);
      const dateStr = day.toISOString().split('T')[0];
      const isToday = dateStr === today;
      html += `<div class="cal-v7-week-day-header ${isToday ? 'today' : ''}">
                 <div class="cal-v7-week-day-name">${DAYS_SHORT[d]}</div>
                 <div class="cal-v7-week-day-number">${day.getDate()}</div>
               </div>`;
    }

    // Time slots (6h-22h)
    for (let hour = 6; hour <= 22; hour++) {
      html += `<div class="cal-v7-week-time">${hour.toString().padStart(2, '0')}:00</div>`;

      for (let d = 0; d < 7; d++) {
        const day = new Date(weekStart);
        day.setDate(day.getDate() + d);
        const dateStr = day.toISOString().split('T')[0];

        html += `<div class="cal-v7-week-cell"
                      data-date="${dateStr}"
                      data-hour="${hour}"
                      ondrop="CalendarView.handleDrop(event)"
                      ondragover="CalendarView.handleDragOver(event)"
                      ondblclick="CalendarView.showCreate('${dateStr}', ${hour})">`;

        // Show events for this hour
        const hourEvents = getFilteredEvents().filter(e => {
          if (!e.start_date) return false;
          const evDate = e.start_date.substring(0, 10);
          const evTime = new Date(e.start_date);
          const evHour = evTime.getHours();
          return evDate === dateStr && evHour === hour;
        });

        hourEvents.forEach(ev => {
          html += renderEventBlock(ev);
        });

        html += '</div>';
      }
    }

    html += '</div>';
    return html;
  }

  function renderDayView() {
    const dateStr = _currentDate.toISOString().split('T')[0];
    const dayEvents = getFilteredEvents().filter(e => e.start_date && e.start_date.substring(0, 10) === dateStr);

    let html = '<div class="cal-v7-day-view">';
    html += '<div class="cal-v7-day-timeline">';

    for (let hour = 6; hour <= 22; hour++) {
      html += `<div class="cal-v7-day-hour">`;
      html += `<div class="cal-v7-day-hour-label">${hour.toString().padStart(2, '0')}:00</div>`;
      html += `<div class="cal-v7-day-hour-content"
                    data-date="${dateStr}"
                    data-hour="${hour}"
                    ondblclick="CalendarView.showCreate('${dateStr}', ${hour})">`;

      const hourEvents = dayEvents.filter(e => {
        if (!e.start_date) return false;
        const evTime = new Date(e.start_date);
        return evTime.getHours() === hour;
      });

      hourEvents.forEach(ev => {
        html += renderEventBlock(ev);
      });

      html += '</div></div>';
    }

    html += '</div></div>';
    return html;
  }

  function renderAgendaView() {
    const events = getFilteredEvents();

    // Group events by date
    const grouped = {};
    events.forEach(e => {
      if (!e.start_date) return;
      const dateStr = e.start_date.substring(0, 10);
      if (!grouped[dateStr]) grouped[dateStr] = [];
      grouped[dateStr].push(e);
    });

    // Sort dates
    const sortedDates = Object.keys(grouped).sort();
    const today = new Date().toISOString().split('T')[0];

    if (sortedDates.length === 0) {
      return `
        <div class="cal-v7-agenda-view">
          <div class="cal-v7-agenda-no-events">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            <p>Aucun événement à afficher</p>
          </div>
        </div>
      `;
    }

    let html = '<div class="cal-v7-agenda-view">';
    html += `<div class="cal-v7-agenda-header">
               <h3 class="cal-v7-agenda-title">Événements à venir</h3>
               <span class="cal-v7-agenda-count">${events.length} événement${events.length > 1 ? 's' : ''}</span>
             </div>`;

    sortedDates.forEach(dateStr => {
      const date = new Date(dateStr + 'T12:00:00');
      const dayEvents = grouped[dateStr];
      const isToday = dateStr === today;

      html += `<div class="cal-v7-agenda-group">`;
      html += `<div class="cal-v7-agenda-date-header ${isToday ? 'today' : ''}">
                 <div class="cal-v7-agenda-day">${date.getDate()}</div>
                 <div class="cal-v7-agenda-date-label">
                   <div class="cal-v7-agenda-weekday">${DAYS_FULL[date.getDay()]}</div>
                   <div class="cal-v7-agenda-month">${MONTHS[date.getMonth()]} ${date.getFullYear()}</div>
                 </div>
               </div>`;

      html += '<div class="cal-v7-agenda-events">';
      dayEvents.forEach(ev => {
        const eventType = getEventType(ev);
        const time = ev.start_date ? new Date(ev.start_date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : 'Toute la journée';

        html += `<div class="cal-v7-agenda-event ${eventType}" onclick="CalendarView.editEvent('${ev.id}')">
                   <div class="cal-v7-agenda-event-time">${time}</div>
                   <div class="cal-v7-agenda-event-content">
                     <div class="cal-v7-agenda-event-title">${escapeHtml(ev.title)}</div>
                     ${ev.description ? `<div style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 4px;">${escapeHtml(ev.description)}</div>` : ''}
                     <div class="cal-v7-agenda-event-meta">
                       <span class="cal-v7-agenda-event-tag ${eventType}" style="background: ${EVENT_COLORS[eventType]}20; color: ${EVENT_COLORS[eventType]};">
                         ${EVENT_TYPE_LABELS[eventType]}
                       </span>
                       ${ev.location ? `<span class="cal-v7-agenda-event-tag" style="background: var(--cal-glass-bg); color: var(--text-secondary);">📍 ${escapeHtml(ev.location)}</span>` : ''}
                     </div>
                   </div>
                 </div>`;
      });
      html += '</div></div>';
    });

    html += '</div>';
    return html;
  }

  function renderEventBadge(ev) {
    const eventType = getEventType(ev);
    const color = ev.color || EVENT_COLORS[eventType];

    return `
      <div class="cal-v7-event-badge ${eventType}"
           style="background: ${color};"
           draggable="true"
           ondragstart="CalendarView.handleDragStart(event, '${ev.id}')"
           ondblclick="CalendarView.editEvent('${ev.id}')">
        ${escapeHtml(ev.title)}
      </div>
    `;
  }

  function renderEventBlock(ev) {
    const eventType = getEventType(ev);
    const color = ev.color || EVENT_COLORS[eventType];
    const time = ev.start_date ? new Date(ev.start_date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '';

    return `
      <div class="cal-v7-event-block ${eventType}"
           style="background: ${color}; color: #fff;"
           draggable="true"
           ondragstart="CalendarView.handleDragStart(event, '${ev.id}')"
           ondblclick="CalendarView.editEvent('${ev.id}')">
        ${time ? `<div class="cal-v7-event-time">${time}</div>` : ''}
        <div class="cal-v7-event-title">${escapeHtml(ev.title)}</div>
      </div>
    `;
  }

  // Determine event type based on event data
  function getEventType(event) {
    if (event.event_type) {
      // Map backend types to frontend types
      if (event.event_type === 'task_due') return 'urgent';
      if (event.event_type === 'meeting') return 'meeting';
      if (event.event_type === 'deadline' || event.event_type === 'invoice_due') return 'deadline';
      if (event.event_type === 'reminder') return 'reminder';
    }

    // Fallback: check title for keywords
    const title = (event.title || '').toLowerCase();
    if (title.includes('urgent') || title.includes('asap')) return 'urgent';
    if (title.includes('meeting') || title.includes('réunion') || title.includes('rdv')) return 'meeting';
    if (title.includes('deadline') || title.includes('échéance') || title.includes('due')) return 'deadline';
    if (title.includes('perso') || title.includes('personnel')) return 'personal';
    if (title.includes('rappel') || title.includes('reminder')) return 'reminder';

    return 'general';
  }

  function getFilteredEvents() {
    return _events.filter(e => {
      const type = getEventType(e);
      return _activeFilters.includes(type);
    });
  }

  function toggleFilter(type) {
    const index = _activeFilters.indexOf(type);
    const chip = document.querySelector(`[data-type="${type}"]`);

    if (index > -1) {
      _activeFilters.splice(index, 1);
      if (chip) chip.classList.remove('active');
    } else {
      _activeFilters.push(type);
      if (chip) chip.classList.add('active');
    }

    renderContent();
  }

  // ==========================
  // MODAL MANAGEMENT
  // ==========================

  function showCreate(date, hour) {
    const modal = document.getElementById('cal-v7-modal');
    if (!modal) return;

    const dateStr = date || _currentDate.toISOString().split('T')[0];
    const timeStr = hour !== undefined ? `${hour.toString().padStart(2, '0')}:00` : '09:00';

    modal.innerHTML = `
      <div class="cal-v7-modal-overlay" onclick="CalendarView.closeModal()"></div>
      <div class="cal-v7-modal-content">
        <div class="cal-v7-modal-header">
          <h3>Nouvel événement</h3>
          <button class="cal-v7-close-btn" onclick="CalendarView.closeModal()">×</button>
        </div>
        <div class="cal-v7-modal-body">
          <div class="cal-v7-form-group">
            <label for="ev-title">Titre *</label>
            <input type="text" id="ev-title" class="cal-v7-input" placeholder="Nom de l'événement" required>
          </div>
          <div class="cal-v7-form-group">
            <label for="ev-description">Description</label>
            <textarea id="ev-description" class="cal-v7-input" rows="3" placeholder="Détails de l'événement"></textarea>
          </div>
          <div class="cal-v7-form-row">
            <div class="cal-v7-form-group">
              <label for="ev-start-date">Date début *</label>
              <input type="date" id="ev-start-date" class="cal-v7-input" value="${dateStr}" required>
            </div>
            <div class="cal-v7-form-group">
              <label for="ev-start-time">Heure début</label>
              <input type="time" id="ev-start-time" class="cal-v7-input" value="${timeStr}">
            </div>
          </div>
          <div class="cal-v7-form-row">
            <div class="cal-v7-form-group">
              <label for="ev-end-date">Date fin</label>
              <input type="date" id="ev-end-date" class="cal-v7-input" value="${dateStr}">
            </div>
            <div class="cal-v7-form-group">
              <label for="ev-end-time">Heure fin</label>
              <input type="time" id="ev-end-time" class="cal-v7-input">
            </div>
          </div>
          <div class="cal-v7-form-row">
            <div class="cal-v7-form-group">
              <label for="ev-type">Type</label>
              <select id="ev-type" class="cal-v7-input">
                <option value="general">Général</option>
                <option value="meeting">Meeting</option>
                <option value="deadline">Échéance</option>
                <option value="personal">Personnel</option>
                <option value="reminder">Rappel</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div class="cal-v7-form-group">
              <label for="ev-color">Couleur</label>
              <input type="color" id="ev-color" class="cal-v7-color-input" value="${EVENT_COLORS.general}">
            </div>
          </div>
          <div class="cal-v7-form-group">
            <label for="ev-location">Lieu</label>
            <input type="text" id="ev-location" class="cal-v7-input" placeholder="Adresse ou lien vidéo">
          </div>
        </div>
        <div class="cal-v7-modal-footer">
          <button class="cal-v7-btn cal-v7-btn-secondary" onclick="CalendarView.closeModal()">Annuler</button>
          <button class="cal-v7-btn cal-v7-btn-primary" onclick="CalendarView.submitCreate()">Créer</button>
        </div>
      </div>
    `;
    modal.style.display = 'flex';

    // Update color when type changes
    const typeSelect = document.getElementById('ev-type');
    const colorInput = document.getElementById('ev-color');
    if (typeSelect && colorInput) {
      typeSelect.addEventListener('change', function() {
        colorInput.value = EVENT_COLORS[this.value] || EVENT_COLORS.general;
      });
    }
  }

  async function submitCreate() {
    try {
      const title = document.getElementById('ev-title')?.value;
      if (!title) {
        if (typeof Toast !== 'undefined') Toast.error('Le titre est requis');
        return;
      }

      const startDate = document.getElementById('ev-start-date')?.value;
      const startTime = document.getElementById('ev-start-time')?.value || '00:00';
      const endDate = document.getElementById('ev-end-date')?.value;
      const endTime = document.getElementById('ev-end-time')?.value;

      await CalendarApi.createEvent({
        title,
        description: document.getElementById('ev-description')?.value || undefined,
        start_date: `${startDate}T${startTime}:00`,
        end_date: endDate && endTime ? `${endDate}T${endTime}:00` : undefined,
        event_type: document.getElementById('ev-type')?.value || 'general',
        location: document.getElementById('ev-location')?.value || undefined,
        color: document.getElementById('ev-color')?.value
      });

      if (typeof Toast !== 'undefined') Toast.success('Événement créé');
      closeModal();
      loadEvents();
    } catch (e) {
      console.error('Failed to create event:', e);
      if (typeof Toast !== 'undefined') Toast.error('Erreur lors de la création');
    }
  }

  function editEvent(eventId) {
    const event = _events.find(e => e.id === eventId);
    if (!event) {
      console.error('Event not found:', eventId);
      return;
    }

    const modal = document.getElementById('cal-v7-modal');
    if (!modal) return;

    const startDate = event.start_date ? event.start_date.substring(0, 10) : '';
    const startTime = event.start_date ? new Date(event.start_date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '';
    const endDate = event.end_date ? event.end_date.substring(0, 10) : '';
    const endTime = event.end_date ? new Date(event.end_date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '';
    const eventType = getEventType(event);

    modal.innerHTML = `
      <div class="cal-v7-modal-overlay" onclick="CalendarView.closeModal()"></div>
      <div class="cal-v7-modal-content">
        <div class="cal-v7-modal-header">
          <h3>Modifier l'événement</h3>
          <button class="cal-v7-close-btn" onclick="CalendarView.closeModal()">×</button>
        </div>
        <div class="cal-v7-modal-body">
          <div class="cal-v7-form-group">
            <label for="ev-title">Titre *</label>
            <input type="text" id="ev-title" class="cal-v7-input" value="${escapeHtml(event.title)}" required>
          </div>
          <div class="cal-v7-form-group">
            <label for="ev-description">Description</label>
            <textarea id="ev-description" class="cal-v7-input" rows="3">${escapeHtml(event.description || '')}</textarea>
          </div>
          <div class="cal-v7-form-row">
            <div class="cal-v7-form-group">
              <label for="ev-start-date">Date début *</label>
              <input type="date" id="ev-start-date" class="cal-v7-input" value="${startDate}" required>
            </div>
            <div class="cal-v7-form-group">
              <label for="ev-start-time">Heure début</label>
              <input type="time" id="ev-start-time" class="cal-v7-input" value="${startTime}">
            </div>
          </div>
          <div class="cal-v7-form-row">
            <div class="cal-v7-form-group">
              <label for="ev-end-date">Date fin</label>
              <input type="date" id="ev-end-date" class="cal-v7-input" value="${endDate}">
            </div>
            <div class="cal-v7-form-group">
              <label for="ev-end-time">Heure fin</label>
              <input type="time" id="ev-end-time" class="cal-v7-input" value="${endTime}">
            </div>
          </div>
          <div class="cal-v7-form-row">
            <div class="cal-v7-form-group">
              <label for="ev-type">Type</label>
              <select id="ev-type" class="cal-v7-input">
                <option value="general" ${eventType === 'general' ? 'selected' : ''}>Général</option>
                <option value="meeting" ${eventType === 'meeting' ? 'selected' : ''}>Meeting</option>
                <option value="deadline" ${eventType === 'deadline' ? 'selected' : ''}>Échéance</option>
                <option value="personal" ${eventType === 'personal' ? 'selected' : ''}>Personnel</option>
                <option value="reminder" ${eventType === 'reminder' ? 'selected' : ''}>Rappel</option>
                <option value="urgent" ${eventType === 'urgent' ? 'selected' : ''}>Urgent</option>
              </select>
            </div>
            <div class="cal-v7-form-group">
              <label for="ev-color">Couleur</label>
              <input type="color" id="ev-color" class="cal-v7-color-input" value="${event.color || EVENT_COLORS[eventType]}">
            </div>
          </div>
          <div class="cal-v7-form-group">
            <label for="ev-location">Lieu</label>
            <input type="text" id="ev-location" class="cal-v7-input" value="${escapeHtml(event.location || '')}" placeholder="Adresse ou lien vidéo">
          </div>
        </div>
        <div class="cal-v7-modal-footer">
          <button class="cal-v7-btn" style="background: var(--cal-urgent); color: #fff; margin-right: auto;" onclick="CalendarView.deleteEvent('${event.id}')">Supprimer</button>
          <button class="cal-v7-btn cal-v7-btn-secondary" onclick="CalendarView.closeModal()">Annuler</button>
          <button class="cal-v7-btn cal-v7-btn-primary" onclick="CalendarView.submitEdit('${event.id}')">Enregistrer</button>
        </div>
      </div>
    `;
    modal.style.display = 'flex';

    // Update color when type changes
    const typeSelect = document.getElementById('ev-type');
    const colorInput = document.getElementById('ev-color');
    if (typeSelect && colorInput) {
      typeSelect.addEventListener('change', function() {
        colorInput.value = EVENT_COLORS[this.value] || EVENT_COLORS.general;
      });
    }
  }

  async function submitEdit(eventId) {
    try {
      const title = document.getElementById('ev-title')?.value;
      if (!title) {
        if (typeof Toast !== 'undefined') Toast.error('Le titre est requis');
        return;
      }

      const startDate = document.getElementById('ev-start-date')?.value;
      const startTime = document.getElementById('ev-start-time')?.value || '00:00';
      const endDate = document.getElementById('ev-end-date')?.value;
      const endTime = document.getElementById('ev-end-time')?.value;

      await CalendarApi.updateEvent(eventId, {
        title,
        description: document.getElementById('ev-description')?.value || undefined,
        start_date: `${startDate}T${startTime}:00`,
        end_date: endDate && endTime ? `${endDate}T${endTime}:00` : undefined,
        event_type: document.getElementById('ev-type')?.value || 'general',
        location: document.getElementById('ev-location')?.value || undefined,
        color: document.getElementById('ev-color')?.value
      });

      if (typeof Toast !== 'undefined') Toast.success('Événement modifié');
      closeModal();
      loadEvents();
    } catch (e) {
      console.error('Failed to update event:', e);
      if (typeof Toast !== 'undefined') Toast.error('Erreur lors de la modification');
    }
  }

  async function deleteEvent(eventId) {
    if (!confirm('Voulez-vous vraiment supprimer cet événement ?')) return;

    try {
      await CalendarApi.deleteEvent(eventId);
      if (typeof Toast !== 'undefined') Toast.success('Événement supprimé');
      closeModal();
      loadEvents();
    } catch (e) {
      console.error('Failed to delete event:', e);
      if (typeof Toast !== 'undefined') Toast.error('Erreur lors de la suppression');
    }
  }

  function closeModal() {
    const modal = document.getElementById('cal-v7-modal');
    if (modal) {
      modal.style.display = 'none';
      modal.innerHTML = '';
    }
  }

  // ==========================
  // DRAG & DROP
  // ==========================

  function handleDragStart(event, eventId) {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('eventId', eventId);
    _draggedEvent = eventId;
  }

  function handleDragOver(event) {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }

  async function handleDrop(event) {
    event.preventDefault();
    const eventId = event.dataTransfer.getData('eventId');
    if (!eventId) return;

    const target = event.target.closest('[data-date]');
    if (!target) return;

    const newDate = target.dataset.date;
    const newHour = target.dataset.hour;

    try {
      const ev = _events.find(e => e.id === eventId);
      if (!ev) return;

      const oldStart = new Date(ev.start_date);
      const newStart = new Date(newDate);
      if (newHour !== undefined) {
        newStart.setHours(parseInt(newHour), 0, 0, 0);
      } else {
        newStart.setHours(oldStart.getHours(), oldStart.getMinutes(), 0, 0);
      }

      let newEnd = undefined;
      if (ev.end_date) {
        const oldEnd = new Date(ev.end_date);
        const duration = oldEnd - oldStart;
        newEnd = new Date(newStart.getTime() + duration);
      }

      await CalendarApi.updateEvent(eventId, {
        start_date: newStart.toISOString(),
        end_date: newEnd ? newEnd.toISOString() : undefined,
      });

      if (typeof Toast !== 'undefined') Toast.success('Événement déplacé');
      loadEvents();
    } catch (e) {
      console.error('Failed to move event:', e);
      if (typeof Toast !== 'undefined') Toast.error('Erreur lors du déplacement');
    }

    _draggedEvent = null;
  }

  // ==========================
  // AI ASSISTANT
  // ==========================

  function openAIAssistant() {
    const panel = document.getElementById('cal-v7-ai-panel');
    if (panel) panel.style.display = 'flex';
  }

  function closeAIPanel() {
    const panel = document.getElementById('cal-v7-ai-panel');
    if (panel) panel.style.display = 'none';
  }

  async function createFromAI() {
    const input = document.getElementById('cal-v7-ai-input')?.value;
    const result = document.getElementById('cal-v7-ai-result');
    if (!input || !result) return;

    result.innerHTML = '<div class="cal-v7-ai-loading">⏳ Analyse en cours...</div>';

    try {
      if (typeof CalendarAgent === 'undefined') {
        throw new Error('CalendarAgent not available');
      }

      const response = await CalendarAgent.createFromQuery(input, true);
      result.innerHTML = `<div class="cal-v7-ai-success">✅ ${response.message || 'Événement créé avec succès !'}</div>`;

      setTimeout(() => {
        closeAIPanel();
        loadEvents();
      }, 1500);
    } catch (e) {
      console.error('AI create error:', e);
      result.innerHTML = `<div class="cal-v7-ai-error">❌ ${e.message || 'Erreur lors de la création'}</div>`;
    }
  }

  async function findAvailableSlots() {
    const result = document.getElementById('cal-v7-ai-result');
    if (!result) return;

    result.innerHTML = '<div class="cal-v7-ai-loading">🔍 Recherche de créneaux...</div>';

    try {
      if (typeof CalendarAgent === 'undefined') {
        throw new Error('CalendarAgent not available');
      }

      const startDate = new Date().toISOString().split('T')[0];
      const endDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const slots = await CalendarAgent.findAvailableSlots(startDate, endDate, 60);

      if (slots && slots.length > 0) {
        let html = '<div class="cal-v7-ai-slots"><h4>Créneaux disponibles :</h4>';
        slots.slice(0, 5).forEach(slot => {
          const date = new Date(slot.start);
          html += `<div class="cal-v7-ai-slot">${DAYS_FULL[date.getDay()]} ${date.getDate()} ${MONTHS[date.getMonth()]} - ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</div>`;
        });
        html += '</div>';
        result.innerHTML = html;
      } else {
        result.innerHTML = '<div class="cal-v7-ai-info">ℹ️ Aucun créneau trouvé pour les 7 prochains jours</div>';
      }
    } catch (e) {
      console.error('AI slots error:', e);
      result.innerHTML = `<div class="cal-v7-ai-error">❌ ${e.message || 'Erreur lors de la recherche'}</div>`;
    }
  }

  // ==========================
  // NAVIGATION
  // ==========================

  function navigatePrev() {
    if (_viewMode === 'month' || _viewMode === 'agenda') {
      _currentDate.setMonth(_currentDate.getMonth() - 1);
    } else if (_viewMode === 'week') {
      _currentDate.setDate(_currentDate.getDate() - 7);
    } else {
      _currentDate.setDate(_currentDate.getDate() - 1);
    }
    loadEvents();
  }

  function navigateNext() {
    if (_viewMode === 'month' || _viewMode === 'agenda') {
      _currentDate.setMonth(_currentDate.getMonth() + 1);
    } else if (_viewMode === 'week') {
      _currentDate.setDate(_currentDate.getDate() + 7);
    } else {
      _currentDate.setDate(_currentDate.getDate() + 1);
    }
    loadEvents();
  }

  function navigateToday() {
    _currentDate = new Date();
    loadEvents();
  }

  function setViewMode(mode) {
    _viewMode = mode;
    document.querySelectorAll('.cal-v7-view-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`.cal-v7-view-btn[onclick*="${mode}"]`)?.classList.add('active');
    loadEvents();
  }

  // ==========================
  // SYNC
  // ==========================

  async function syncAll() {
    try {
      if (typeof CalendarApi !== 'undefined') {
        await CalendarApi.syncTasks();
        await CalendarApi.syncInvoices();
        if (typeof Toast !== 'undefined') Toast.success('Synchronisation terminée');
        loadEvents();
      }
    } catch (e) {
      console.error('Sync error:', e);
      if (typeof Toast !== 'undefined') Toast.error('Erreur lors de la synchronisation');
    }
  }

  // ==========================
  // UTILITIES
  // ==========================

  function attachEventListeners() {
    // Global keyboard shortcuts
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        closeModal();
        closeAIPanel();
      }
    });
  }

  function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // ==========================
  // PUBLIC API
  // ==========================

  return {
    init,
    render,
    showCreate,
    editEvent,
    submitCreate,
    submitEdit,
    deleteEvent,
    closeModal,
    handleDragStart,
    handleDragOver,
    handleDrop,
    openAIAssistant,
    closeAIPanel,
    createFromAI,
    findAvailableSlots,
    navigatePrev,
    navigateNext,
    navigateToday,
    setViewMode,
    syncAll,
    toggleFilter,
  };
})();

if (typeof window !== 'undefined') window.CalendarView = CalendarView;

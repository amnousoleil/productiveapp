/**
 * CalendarView v6.0 - Vue Calendrier Avancée
 * Modes: Mois/Semaine/Jour | Drag & Drop | AI Agent
 */
const CalendarView = (function() {
  'use strict';

  let _container = null;
  let _currentDate = new Date();
  let _viewMode = 'month'; // month | week | day
  let _events = [];
  let _draggedEvent = null;

  const DAYS_SHORT = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  const DAYS_FULL = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
  const MONTHS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

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
      <div class="calendar-v6-container">
        <!-- Header -->
        <div class="cal-v6-header">
          <div class="cal-v6-header-left">
            <h2 class="cal-v6-title">📅 Calendrier</h2>
            <p class="cal-v6-subtitle">Événements, tâches et échéances</p>
          </div>
          <div class="cal-v6-header-right">
            <button class="cal-v6-btn cal-v6-btn-secondary" onclick="CalendarView.openAIAssistant()">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
              Assistant IA
            </button>
            <button class="cal-v6-btn cal-v6-btn-secondary" onclick="CalendarView.syncAll()">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/></svg>
              Sync
            </button>
            <button class="cal-v6-btn cal-v6-btn-primary" onclick="CalendarView.showCreate()">
              + Nouvel événement
            </button>
          </div>
        </div>

        <!-- Toolbar -->
        <div class="cal-v6-toolbar">
          <div class="cal-v6-toolbar-left">
            <button class="cal-v6-nav-btn" onclick="CalendarView.navigatePrev()">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <button class="cal-v6-nav-btn" onclick="CalendarView.navigateToday()">Aujourd'hui</button>
            <button class="cal-v6-nav-btn" onclick="CalendarView.navigateNext()">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
            <h3 class="cal-v6-current-label" id="cal-v6-current-label"></h3>
          </div>
          <div class="cal-v6-toolbar-right">
            <div class="cal-v6-view-switcher">
              <button class="cal-v6-view-btn ${_viewMode === 'month' ? 'active' : ''}" onclick="CalendarView.setViewMode('month')">Mois</button>
              <button class="cal-v6-view-btn ${_viewMode === 'week' ? 'active' : ''}" onclick="CalendarView.setViewMode('week')">Semaine</button>
              <button class="cal-v6-view-btn ${_viewMode === 'day' ? 'active' : ''}" onclick="CalendarView.setViewMode('day')">Jour</button>
            </div>
          </div>
        </div>

        <!-- Content Area -->
        <div class="cal-v6-content" id="cal-v6-content">
          <!-- Rendered dynamically -->
        </div>

        <!-- Modal -->
        <div class="cal-v6-modal" id="cal-v6-modal" style="display:none"></div>

        <!-- AI Assistant Panel -->
        <div class="cal-v6-ai-panel" id="cal-v6-ai-panel" style="display:none">
          <div class="cal-v6-ai-panel-content">
            <div class="cal-v6-ai-header">
              <h3>🤖 Assistant IA Calendrier</h3>
              <button class="cal-v6-close-btn" onclick="CalendarView.closeAIPanel()">×</button>
            </div>
            <div class="cal-v6-ai-body">
              <p class="cal-v6-ai-hint">Essayez : "Prends RDV avec Brice demain à 14h pour révision projet"</p>
              <textarea id="cal-v6-ai-input" class="cal-v6-ai-input" placeholder="Décrivez l'événement en langage naturel..."></textarea>
              <div class="cal-v6-ai-actions">
                <button class="cal-v6-btn cal-v6-btn-secondary" onclick="CalendarView.findAvailableSlots()">
                  Proposer des créneaux
                </button>
                <button class="cal-v6-btn cal-v6-btn-primary" onclick="CalendarView.createFromAI()">
                  Créer l'événement
                </button>
              </div>
              <div id="cal-v6-ai-result" class="cal-v6-ai-result"></div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  async function loadEvents() {
    const { start, end } = getDateRange();
    try {
      if (typeof CalendarApi !== 'undefined') {
        _events = await CalendarApi.listEvents(start, end) || [];
      }
    } catch (e) {
      console.error('Failed to load events:', e);
      _events = [];
    }
    renderContent();
  }

  function getDateRange() {
    const y = _currentDate.getFullYear();
    const m = _currentDate.getMonth();
    const d = _currentDate.getDate();

    let start, end;

    if (_viewMode === 'month') {
      const firstDay = new Date(y, m, 1);
      start = new Date(firstDay);
      start.setDate(start.getDate() - ((firstDay.getDay() + 6) % 7)); // Start from Monday
      end = new Date(start);
      end.setDate(end.getDate() + 42); // 6 weeks
    } else if (_viewMode === 'week') {
      start = getWeekStart(_currentDate);
      end = new Date(start);
      end.setDate(end.getDate() + 7);
    } else { // day
      start = new Date(y, m, d);
      start.setHours(0, 0, 0, 0);
      end = new Date(start);
      end.setDate(end.getDate() + 1);
    }

    return {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0]
    };
  }

  function getWeekStart(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = (day + 6) % 7; // Monday = 0
    d.setDate(d.getDate() - diff);
    return d;
  }

  function renderContent() {
    const content = document.getElementById('cal-v6-content');
    const label = document.getElementById('cal-v6-current-label');

    if (!content || !label) return;

    // Update label
    if (_viewMode === 'month') {
      label.textContent = `${MONTHS[_currentDate.getMonth()]} ${_currentDate.getFullYear()}`;
    } else if (_viewMode === 'week') {
      const weekStart = getWeekStart(_currentDate);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      label.textContent = `${weekStart.getDate()} - ${weekEnd.getDate()} ${MONTHS[weekEnd.getMonth()]} ${weekEnd.getFullYear()}`;
    } else {
      label.textContent = `${DAYS_FULL[(_currentDate.getDay() + 6) % 7]} ${_currentDate.getDate()} ${MONTHS[_currentDate.getMonth()]} ${_currentDate.getFullYear()}`;
    }

    // Render view
    if (_viewMode === 'month') content.innerHTML = renderMonthView();
    else if (_viewMode === 'week') content.innerHTML = renderWeekView();
    else content.innerHTML = renderDayView();

    attachContentEventListeners();
  }

  function renderMonthView() {
    const y = _currentDate.getFullYear();
    const m = _currentDate.getMonth();
    const firstDay = new Date(y, m, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - ((firstDay.getDay() + 6) % 7));

    const today = new Date().toISOString().split('T')[0];

    let html = '<div class="cal-v6-month-grid">';

    // Day headers
    DAYS_SHORT.forEach(day => {
      html += `<div class="cal-v6-month-day-header">${day}</div>`;
    });

    // Calendar days
    const current = new Date(startDate);
    for (let i = 0; i < 42; i++) {
      const dateStr = current.toISOString().split('T')[0];
      const isCurrentMonth = current.getMonth() === m;
      const isToday = dateStr === today;
      const dayEvents = _events.filter(e => e.start_date && e.start_date.substring(0, 10) === dateStr);

      html += `<div class="cal-v6-month-day ${isToday ? 'today' : ''} ${!isCurrentMonth ? 'other-month' : ''}"
                    data-date="${dateStr}"
                    ondrop="CalendarView.handleDrop(event)"
                    ondragover="CalendarView.handleDragOver(event)">`;
      html += `<div class="cal-v6-month-day-number">${current.getDate()}</div>`;
      html += '<div class="cal-v6-month-day-events">';

      dayEvents.slice(0, 3).forEach(ev => {
        html += renderEventBadge(ev);
      });

      if (dayEvents.length > 3) {
        html += `<div class="cal-v6-more-events">+${dayEvents.length - 3} autres</div>`;
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

    let html = '<div class="cal-v6-week-grid">';

    // Header row
    html += '<div class="cal-v6-week-time-header"></div>';
    for (let d = 0; d < 7; d++) {
      const day = new Date(weekStart);
      day.setDate(day.getDate() + d);
      const dateStr = day.toISOString().split('T')[0];
      const isToday = dateStr === today;
      html += `<div class="cal-v6-week-day-header ${isToday ? 'today' : ''}">
                 <div class="cal-v6-week-day-name">${DAYS_SHORT[d]}</div>
                 <div class="cal-v6-week-day-number">${day.getDate()}</div>
               </div>`;
    }

    // Time slots (6h-22h)
    for (let hour = 6; hour <= 22; hour++) {
      html += `<div class="cal-v6-week-time">${hour.toString().padStart(2, '0')}:00</div>`;

      for (let d = 0; d < 7; d++) {
        const day = new Date(weekStart);
        day.setDate(day.getDate() + d);
        const dateStr = day.toISOString().split('T')[0];

        html += `<div class="cal-v6-week-cell"
                      data-date="${dateStr}"
                      data-hour="${hour}"
                      ondrop="CalendarView.handleDrop(event)"
                      ondragover="CalendarView.handleDragOver(event)">`;

        // Show events for this hour
        const hourEvents = _events.filter(e => {
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
    const dayEvents = _events.filter(e => e.start_date && e.start_date.substring(0, 10) === dateStr);

    let html = '<div class="cal-v6-day-view">';
    html += '<div class="cal-v6-day-timeline">';

    for (let hour = 6; hour <= 22; hour++) {
      html += `<div class="cal-v6-day-hour">`;
      html += `<div class="cal-v6-day-hour-label">${hour.toString().padStart(2, '0')}:00</div>`;
      html += `<div class="cal-v6-day-hour-content"
                    data-date="${dateStr}"
                    data-hour="${hour}"
                    ondrop="CalendarView.handleDrop(event)"
                    ondragover="CalendarView.handleDragOver(event)">`;

      const hourEvents = dayEvents.filter(e => {
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

  function renderEventBadge(ev) {
    const color = ev.color || '#3B82F6';
    return `<div class="cal-v6-event-badge"
                 data-event-id="${ev.id}"
                 draggable="true"
                 ondragstart="CalendarView.handleDragStart(event)"
                 ondblclick="CalendarView.editEvent('${ev.id}')"
                 style="background:${color}20;border-left:3px solid ${color};color:${color}">
              <span class="cal-v6-event-title">${esc(ev.title)}</span>
            </div>`;
  }

  function renderEventBlock(ev) {
    const color = ev.color || '#3B82F6';
    const startTime = new Date(ev.start_date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    return `<div class="cal-v6-event-block"
                 data-event-id="${ev.id}"
                 draggable="true"
                 ondragstart="CalendarView.handleDragStart(event)"
                 ondblclick="CalendarView.editEvent('${ev.id}')"
                 style="background:${color};color:#fff">
              <div class="cal-v6-event-time">${startTime}</div>
              <div class="cal-v6-event-title">${esc(ev.title)}</div>
            </div>`;
  }

  function attachEventListeners() {
    // Already attached via onclick in HTML
  }

  function attachContentEventListeners() {
    // Click on empty day cell to create event
    document.querySelectorAll('.cal-v6-month-day, .cal-v6-week-cell, .cal-v6-day-hour-content').forEach(el => {
      el.addEventListener('click', (e) => {
        if (e.target === el) {
          const date = el.dataset.date;
          const hour = el.dataset.hour;
          showCreate(date, hour);
        }
      });
    });
  }

  // ==========================
  // NAVIGATION
  // ==========================

  function navigatePrev() {
    if (_viewMode === 'month') {
      _currentDate.setMonth(_currentDate.getMonth() - 1);
    } else if (_viewMode === 'week') {
      _currentDate.setDate(_currentDate.getDate() - 7);
    } else {
      _currentDate.setDate(_currentDate.getDate() - 1);
    }
    loadEvents();
  }

  function navigateNext() {
    if (_viewMode === 'month') {
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
    localStorage.setItem('calendar_view_mode', mode);
    renderContent();
  }

  // ==========================
  // DRAG & DROP
  // ==========================

  function handleDragStart(e) {
    const eventId = e.target.dataset.eventId;
    _draggedEvent = _events.find(ev => ev.id === eventId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.target.innerHTML);
    e.target.style.opacity = '0.4';
  }

  function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    return false;
  }

  async function handleDrop(e) {
    e.stopPropagation();
    e.preventDefault();

    if (!_draggedEvent) return;

    const cell = e.target.closest('[data-date]');
    if (!cell) return;

    const newDate = cell.dataset.date;
    const newHour = cell.dataset.hour || '09';

    // Update event
    try {
      const newStartDate = `${newDate}T${newHour.padStart(2, '0')}:00:00`;
      await CalendarApi.updateEvent(_draggedEvent.id, { start_date: newStartDate });
      if (typeof Toast !== 'undefined') {
        Toast.success('Événement déplacé');
      }
      loadEvents();
    } catch (e) {
      console.error('Failed to move event:', e);
      if (typeof Toast !== 'undefined') {
        Toast.error('Erreur lors du déplacement');
      }
    }

    _draggedEvent = null;
    return false;
  }

  // ==========================
  // EVENT CRUD
  // ==========================

  function showCreate(date, hour) {
    const modal = document.getElementById('cal-v6-modal');
    if (!modal) return;

    const defaultDate = date || new Date().toISOString().split('T')[0];
    const defaultTime = hour ? `${hour.padStart(2, '0')}:00` : '09:00';

    modal.innerHTML = `
      <div class="cal-v6-modal-overlay" onclick="CalendarView.closeModal()"></div>
      <div class="cal-v6-modal-content">
        <div class="cal-v6-modal-header">
          <h3>Nouvel événement</h3>
          <button class="cal-v6-close-btn" onclick="CalendarView.closeModal()">×</button>
        </div>
        <div class="cal-v6-modal-body">
          <div class="cal-v6-form-group">
            <label>Titre *</label>
            <input id="ev-title" type="text" placeholder="Titre de l'événement" class="cal-v6-input" />
          </div>
          <div class="cal-v6-form-row">
            <div class="cal-v6-form-group">
              <label>Date de début *</label>
              <input id="ev-start-date" type="date" value="${defaultDate}" class="cal-v6-input" />
            </div>
            <div class="cal-v6-form-group">
              <label>Heure</label>
              <input id="ev-start-time" type="time" value="${defaultTime}" class="cal-v6-input" />
            </div>
          </div>
          <div class="cal-v6-form-row">
            <div class="cal-v6-form-group">
              <label>Date de fin</label>
              <input id="ev-end-date" type="date" class="cal-v6-input" />
            </div>
            <div class="cal-v6-form-group">
              <label>Heure de fin</label>
              <input id="ev-end-time" type="time" class="cal-v6-input" />
            </div>
          </div>
          <div class="cal-v6-form-group">
            <label>Type</label>
            <select id="ev-type" class="cal-v6-input">
              <option value="general">Général</option>
              <option value="meeting">Rendez-vous</option>
              <option value="deadline">Échéance</option>
              <option value="reminder">Rappel</option>
            </select>
          </div>
          <div class="cal-v6-form-group">
            <label>Lieu</label>
            <input id="ev-location" type="text" placeholder="Lieu (optionnel)" class="cal-v6-input" />
          </div>
          <div class="cal-v6-form-group">
            <label>Couleur</label>
            <input id="ev-color" type="color" value="#3B82F6" class="cal-v6-color-input" />
          </div>
        </div>
        <div class="cal-v6-modal-footer">
          <button class="cal-v6-btn cal-v6-btn-secondary" onclick="CalendarView.closeModal()">Annuler</button>
          <button class="cal-v6-btn cal-v6-btn-primary" onclick="CalendarView.saveEvent()">Créer</button>
        </div>
      </div>
    `;

    modal.style.display = 'flex';
  }

  async function saveEvent() {
    const title = document.getElementById('ev-title')?.value?.trim();
    if (!title) {
      if (typeof Toast !== 'undefined') Toast.error('Le titre est requis');
      return;
    }

    const startDate = document.getElementById('ev-start-date')?.value;
    const startTime = document.getElementById('ev-start-time')?.value || '00:00';
    const endDate = document.getElementById('ev-end-date')?.value;
    const endTime = document.getElementById('ev-end-time')?.value || '00:00';

    try {
      await CalendarApi.createEvent({
        title,
        start_date: `${startDate}T${startTime}:00`,
        end_date: endDate ? `${endDate}T${endTime}:00` : undefined,
        event_type: document.getElementById('ev-type')?.value,
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
    // TODO: Implement edit modal (similar to create but with update)
    console.log('Edit event:', eventId);
  }

  function closeModal() {
    const modal = document.getElementById('cal-v6-modal');
    if (modal) {
      modal.style.display = 'none';
      modal.innerHTML = '';
    }
  }

  // ==========================
  // AI ASSISTANT
  // ==========================

  function openAIAssistant() {
    const panel = document.getElementById('cal-v6-ai-panel');
    if (panel) panel.style.display = 'flex';
  }

  function closeAIPanel() {
    const panel = document.getElementById('cal-v6-ai-panel');
    if (panel) panel.style.display = 'none';
  }

  async function createFromAI() {
    const input = document.getElementById('cal-v6-ai-input');
    const result = document.getElementById('cal-v6-ai-result');
    if (!input || !result) return;

    const query = input.value.trim();
    if (!query) {
      result.innerHTML = '<p class="cal-v6-ai-error">❌ Veuillez saisir une description</p>';
      return;
    }

    try {
      result.innerHTML = '<p class="cal-v6-ai-loading">🔄 Création en cours...</p>';

      const response = await CalendarAgent.createFromQuery(query);

      result.innerHTML = `
        <div class="cal-v6-ai-success">
          ✅ <strong>${response.event.title}</strong> créé !<br/>
          📅 ${new Date(response.event.start_date).toLocaleString('fr-FR')}
        </div>
      `;

      input.value = '';
      setTimeout(() => {
        closeAIPanel();
        loadEvents();
      }, 2000);

    } catch (e) {
      console.error('AI create failed:', e);
      result.innerHTML = '<p class="cal-v6-ai-error">❌ Erreur lors de la création</p>';
    }
  }

  async function findAvailableSlots() {
    const result = document.getElementById('cal-v6-ai-result');
    if (!result) return;

    try {
      result.innerHTML = '<p class="cal-v6-ai-loading">🔄 Recherche de créneaux...</p>';

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const nextWeek = new Date(tomorrow);
      nextWeek.setDate(nextWeek.getDate() + 7);

      const slots = await CalendarAgent.findAvailableSlots(
        tomorrow.toISOString().split('T')[0],
        nextWeek.toISOString().split('T')[0]
      );

      if (slots.length === 0) {
        result.innerHTML = '<p class="cal-v6-ai-info">ℹ️ Aucun créneau disponible trouvé</p>';
        return;
      }

      let html = '<div class="cal-v6-ai-slots"><h4>📅 Créneaux disponibles:</h4>';
      slots.slice(0, 5).forEach(slot => {
        const start = new Date(slot.start);
        html += `<div class="cal-v6-ai-slot">
                   ${start.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                   à ${start.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                 </div>`;
      });
      html += '</div>';
      result.innerHTML = html;

    } catch (e) {
      console.error('Failed to find slots:', e);
      result.innerHTML = '<p class="cal-v6-ai-error">❌ Erreur lors de la recherche</p>';
    }
  }

  async function syncAll() {
    try {
      if (typeof Toast !== 'undefined') Toast.info('Synchronisation en cours...');
      if (typeof CalendarApi !== 'undefined') {
        await Promise.all([
          CalendarApi.syncTasks(),
          CalendarApi.syncInvoices()
        ]);
      }
      if (typeof Toast !== 'undefined') Toast.success('Synchronisation terminée');
      loadEvents();
    } catch (e) {
      console.error('Sync failed:', e);
      if (typeof Toast !== 'undefined') Toast.error('Erreur de synchronisation');
    }
  }

  function esc(s) {
    const div = document.createElement('div');
    div.textContent = s || '';
    return div.innerHTML;
  }

  return {
    init,
    render,
    navigatePrev,
    navigateNext,
    navigateToday,
    setViewMode,
    handleDragStart,
    handleDragOver,
    handleDrop,
    showCreate,
    saveEvent,
    editEvent,
    closeModal,
    openAIAssistant,
    closeAIPanel,
    createFromAI,
    findAvailableSlots,
    syncAll,
    refresh: loadEvents
  };
})();

if (typeof window !== 'undefined') window.CalendarView = CalendarView;

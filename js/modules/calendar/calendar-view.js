/**
 * CalendarView - Vue Calendrier mensuelle v5.0
 * Connectee au backend, synchro taches/factures
 */
const CalendarView = (function() {
  'use strict';
  let _container = null;
  let _currentDate = new Date();
  let _events = [];

  function init() {
    _container = document.getElementById('view-calendar');
    if (_container) {
      render(_container);
    }
  }

  function render(container) {
    _container = container;
    container.innerHTML = `
      <div style="padding:20px;max-width:1200px;margin:0 auto">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
          <div>
            <h2 style="margin:0;color:var(--text-primary)">Calendrier</h2>
            <p style="margin:4px 0 0;color:var(--text-secondary);font-size:0.9rem">Echeances, rendez-vous et taches</p>
          </div>
          <div style="display:flex;gap:8px">
            <button onclick="CalendarView.syncAll()" style="padding:8px 16px;border-radius:8px;border:1px solid var(--border-color);background:var(--bg-secondary);color:var(--text-primary);cursor:pointer">Synchroniser</button>
            <button onclick="CalendarView.showCreate()" style="padding:8px 16px;border-radius:8px;border:none;background:var(--accent-color);color:#fff;cursor:pointer;font-weight:600">+ Evenement</button>
          </div>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
          <button onclick="CalendarView.prevMonth()" style="padding:6px 12px;border-radius:8px;border:1px solid var(--border-color);background:var(--bg-secondary);color:var(--text-primary);cursor:pointer">&larr;</button>
          <h3 id="cal-month-label" style="margin:0;color:var(--text-primary)"></h3>
          <button onclick="CalendarView.nextMonth()" style="padding:6px 12px;border-radius:8px;border:1px solid var(--border-color);background:var(--bg-secondary);color:var(--text-primary);cursor:pointer">&rarr;</button>
        </div>
        <div id="cal-grid" style="display:grid;grid-template-columns:repeat(7,1fr);gap:1px;background:var(--border-color);border-radius:12px;overflow:hidden"></div>
      </div>
      <div id="cal-modal" style="display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:1000;justify-content:center;align-items:center"></div>`;
    loadMonth();
  }

  async function loadMonth() {
    var y = _currentDate.getFullYear(), m = _currentDate.getMonth();
    var label = document.getElementById('cal-month-label');
    if (label) label.textContent = new Date(y, m).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    var firstDay = new Date(y, m, 1);
    var lastDay = new Date(y, m + 1, 0);
    var startDate = new Date(firstDay); startDate.setDate(startDate.getDate() - ((firstDay.getDay() + 6) % 7));
    var endDate = new Date(startDate); endDate.setDate(endDate.getDate() + 41);
    try {
      if (typeof CalendarApi !== 'undefined') {
        _events = await CalendarApi.listEvents(startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]) || [];
      }
    } catch (e) { _events = []; }
    renderGrid(y, m, startDate, endDate);
  }

  function renderGrid(year, month, startDate, endDate) {
    var grid = document.getElementById('cal-grid');
    if (!grid) return;
    var days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
    var html = days.map(function(d) { return '<div style="background:var(--bg-tertiary);padding:8px;text-align:center;font-weight:600;color:var(--text-secondary);font-size:0.8rem">' + d + '</div>'; }).join('');
    var current = new Date(startDate);
    var today = new Date().toISOString().split('T')[0];
    for (var i = 0; i < 42; i++) {
      var dateStr = current.toISOString().split('T')[0];
      var isCurrentMonth = current.getMonth() === month;
      var isToday = dateStr === today;
      var dayEvents = _events.filter(function(e) { return e.start_date && e.start_date.substring(0, 10) === dateStr; });
      html += '<div style="background:var(--bg-primary);padding:6px;min-height:80px;cursor:pointer;' + (isToday ? 'outline:2px solid var(--accent-color);outline-offset:-2px;' : '') + (isCurrentMonth ? '' : 'opacity:0.4;') + '" onclick="CalendarView.showCreate(\'' + dateStr + '\')">';
      html += '<div style="font-size:0.85rem;font-weight:' + (isToday ? '700' : '400') + ';color:' + (isToday ? 'var(--accent-color)' : 'var(--text-primary)') + ';margin-bottom:4px">' + current.getDate() + '</div>';
      dayEvents.slice(0, 3).forEach(function(ev) {
        var c = ev.color || '#3B82F6';
        html += '<div style="font-size:0.7rem;padding:2px 4px;border-radius:4px;margin-bottom:2px;background:' + c + '20;color:' + c + ';white-space:nowrap;overflow:hidden;text-overflow:ellipsis" title="' + esc(ev.title) + '">' + esc(ev.title).substring(0, 20) + '</div>';
      });
      if (dayEvents.length > 3) html += '<div style="font-size:0.7rem;color:var(--text-secondary)">+' + (dayEvents.length - 3) + '</div>';
      html += '</div>';
      current.setDate(current.getDate() + 1);
    }
    grid.innerHTML = html;
  }

  function showCreate(date) {
    var modal = document.getElementById('cal-modal');
    if (!modal) return;
    modal.style.display = 'flex';
    modal.innerHTML = '<div style="background:var(--bg-primary);border-radius:16px;padding:32px;width:95%;max-width:650px;max-height:90vh;overflow-y:auto;border:1px solid var(--border-color)"><h3 style="margin:0 0 24px;color:var(--text-primary);font-size:1.5rem">Nouvel evenement</h3><div style="display:flex;flex-direction:column;gap:20px"><div><label style="display:block;margin-bottom:8px;color:var(--text-secondary);font-weight:600;font-size:0.9rem">Titre *</label><input id="ev-title" placeholder="Ex: Reunion client, Echeance rapport..." style="width:100%;padding:14px 16px;border-radius:8px;border:1px solid var(--border-color);background:var(--bg-secondary);color:var(--text-primary);font-size:1rem;box-sizing:border-box"></div><div style="display:grid;grid-template-columns:1fr 1fr;gap:20px"><div><label style="display:block;margin-bottom:8px;color:var(--text-secondary);font-weight:600;font-size:0.9rem">Date debut *</label><input id="ev-start" type="date" value="' + (date || new Date().toISOString().split('T')[0]) + '" style="width:100%;padding:14px 16px;border-radius:8px;border:1px solid var(--border-color);background:var(--bg-secondary);color:var(--text-primary);font-size:1rem;box-sizing:border-box"></div><div><label style="display:block;margin-bottom:8px;color:var(--text-secondary);font-weight:600;font-size:0.9rem">Date fin</label><input id="ev-end" type="date" style="width:100%;padding:14px 16px;border-radius:8px;border:1px solid var(--border-color);background:var(--bg-secondary);color:var(--text-primary);font-size:1rem;box-sizing:border-box"></div></div><div><label style="display:block;margin-bottom:8px;color:var(--text-secondary);font-weight:600;font-size:0.9rem">Type d\'evenement</label><select id="ev-type" style="width:100%;padding:14px 16px;border-radius:8px;border:1px solid var(--border-color);background:var(--bg-secondary);color:var(--text-primary);font-size:1rem;box-sizing:border-box"><option value="general">General</option><option value="meeting">Rendez-vous</option><option value="deadline">Echeance</option><option value="reminder">Rappel</option></select></div><div><label style="display:block;margin-bottom:8px;color:var(--text-secondary);font-weight:600;font-size:0.9rem">Lieu</label><input id="ev-location" placeholder="Ex: Bureau, Zoom, Paris..." style="width:100%;padding:14px 16px;border-radius:8px;border:1px solid var(--border-color);background:var(--bg-secondary);color:var(--text-primary);font-size:1rem;box-sizing:border-box"></div><div><label style="display:block;margin-bottom:8px;color:var(--text-secondary);font-weight:600;font-size:0.9rem">Description</label><textarea id="ev-description" placeholder="Ajouter des details..." style="width:100%;padding:14px 16px;border-radius:8px;border:1px solid var(--border-color);background:var(--bg-secondary);color:var(--text-primary);font-size:1rem;min-height:100px;resize:vertical;box-sizing:border-box;font-family:inherit"></textarea></div><div><label style="display:block;margin-bottom:8px;color:var(--text-secondary);font-weight:600;font-size:0.9rem">Couleur</label><input id="ev-color" type="color" value="#3B82F6" style="width:60px;height:48px;border:1px solid var(--border-color);border-radius:8px;background:var(--bg-secondary);cursor:pointer"></div></div><div style="display:flex;gap:12px;margin-top:32px;justify-content:flex-end;padding-top:24px;border-top:1px solid var(--border-color)"><button onclick="CalendarView.closeModal()" style="padding:12px 28px;border-radius:8px;border:1px solid var(--border-color);background:var(--bg-secondary);color:var(--text-primary);cursor:pointer;font-size:1rem;font-weight:500;min-width:120px">Annuler</button><button onclick="CalendarView.saveEvent()" style="padding:12px 28px;border-radius:8px;border:none;background:var(--accent-color);color:#fff;cursor:pointer;font-weight:600;font-size:1rem;min-width:120px">Enregistrer</button></div></div>';
  }

  async function saveEvent() {
    var title = document.getElementById('ev-title')?.value?.trim();
    if (!title) {
      alert('Le titre est obligatoire');
      return;
    }
    var startDate = document.getElementById('ev-start')?.value;
    if (!startDate) {
      alert('La date de debut est obligatoire');
      return;
    }
    try {
      var memberId = (typeof AppState !== 'undefined' && AppState.currentMember) ? AppState.currentMember.id : localStorage.getItem('member_id') || null;
      var eventData = {
        title: title,
        start_date: startDate,
        end_date: document.getElementById('ev-end')?.value || undefined,
        event_type: document.getElementById('ev-type')?.value,
        location: document.getElementById('ev-location')?.value || undefined,
        description: document.getElementById('ev-description')?.value || undefined,
        color: document.getElementById('ev-color')?.value,
        member_id: memberId
      };
      await CalendarApi.createEvent(eventData);
      if (typeof Toast !== 'undefined') {
        Toast.success('Evenement cree avec succes');
      }
      closeModal();
      loadMonth();
    } catch (e) {
      console.error('Create event error:', e);
      if (typeof Toast !== 'undefined') {
        Toast.error('Erreur lors de la creation de l\'evenement');
      } else {
        alert('Erreur lors de la creation de l\'evenement');
      }
    }
  }

  async function syncAll() { try { if (typeof CalendarApi !== 'undefined') { await Promise.all([CalendarApi.syncTasks(), CalendarApi.syncInvoices()]); } loadMonth(); } catch (e) { console.error('Sync error:', e); } }
  function prevMonth() { _currentDate.setMonth(_currentDate.getMonth() - 1); loadMonth(); }
  function nextMonth() { _currentDate.setMonth(_currentDate.getMonth() + 1); loadMonth(); }
  function closeModal() { var m = document.getElementById('cal-modal'); if (m) { m.style.display = 'none'; m.innerHTML = ''; } }
  function esc(s) { var d = document.createElement('div'); d.textContent = s || ''; return d.innerHTML; }

  return { init: init, render: render, prevMonth: prevMonth, nextMonth: nextMonth, showCreate: showCreate, saveEvent: saveEvent, syncAll: syncAll, closeModal: closeModal, refresh: loadMonth };
})();
if (typeof window !== 'undefined') window.CalendarView = CalendarView;

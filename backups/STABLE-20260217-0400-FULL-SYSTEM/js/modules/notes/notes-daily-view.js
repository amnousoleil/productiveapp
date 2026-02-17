/**
 * NOTES DAILY VIEW - Daily notes system
 * ProductiveApp v6.0 - World Class Edition
 *
 * Features:
 * - Auto-generate daily note (YYYY-MM-DD format)
 * - Template system
 * - Calendar picker
 * - Navigation (prev/next day)
 */

const NotesDailyView = (function() {
    'use strict';

    const DAILY_TAG = 'daily';

    // ========== RENDERING ==========

    function render() {
        const today = getToday();
        const dailyNotes = getDailyNotes();

        return `
            <div class="notes-daily-view">
                <div class="notes-daily-header">
                    <h4>Notes quotidiennes</h4>
                    <button class="notes-daily-today-btn" onclick="NotesDailyView.openToday()">
                        📅 Aujourd'hui
                    </button>
                </div>

                <div class="notes-daily-calendar">
                    ${renderMiniCalendar()}
                </div>

                <div class="notes-daily-list">
                    <h5>Dernières notes quotidiennes</h5>
                    ${dailyNotes.length > 0
                        ? dailyNotes.slice(0, 10).map(note => renderDailyNoteItem(note)).join('')
                        : '<div class="notes-daily-empty">Aucune note quotidienne</div>'
                    }
                </div>
            </div>
        `;
    }

    function renderMiniCalendar() {
        const today = new Date();
        const month = today.getMonth();
        const year = today.getFullYear();

        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
        const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

        let html = `
            <div class="notes-calendar-header">
                <span class="notes-calendar-month">${monthNames[month]} ${year}</span>
            </div>
            <div class="notes-calendar-grid">
                ${dayNames.map(day => `<div class="notes-calendar-day-name">${day}</div>`).join('')}
        `;

        // Empty cells before first day
        for (let i = 0; i < startingDayOfWeek; i++) {
            html += '<div class="notes-calendar-cell empty"></div>';
        }

        // Days
        const dailyNotes = getDailyNotes();
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dateStr = formatDate(date);
            const hasNote = dailyNotes.some(n => n.title === dateStr);
            const isToday = day === today.getDate();

            html += `
                <div class="notes-calendar-cell ${isToday ? 'today' : ''} ${hasNote ? 'has-note' : ''}"
                     onclick="NotesDailyView.openDate('${dateStr}')"
                     title="${hasNote ? 'Note existante' : 'Créer note'}">
                    ${day}
                    ${hasNote ? '<span class="notes-calendar-dot"></span>' : ''}
                </div>
            `;
        }

        html += '</div>';
        return html;
    }

    function renderDailyNoteItem(note) {
        return `
            <div class="notes-daily-item" onclick="NotesWikiLinks.openNote('${note.id}')">
                <div class="notes-daily-item-date">${note.title}</div>
                <div class="notes-daily-item-preview">${escapeHtml(note.content ? note.content.substring(0, 80) : 'Note vide...')}</div>
            </div>
        `;
    }

    // ========== DAILY NOTES ==========

    function getDailyNotes() {
        if (typeof NotesModule === 'undefined') return [];

        return NotesModule.getNotes()
            .filter(note => note.tags && note.tags.includes(DAILY_TAG))
            .sort((a, b) => new Date(b.title) - new Date(a.title));
    }

    function findDailyNote(dateStr) {
        if (typeof NotesModule === 'undefined') return null;

        return NotesModule.getNotes().find(note =>
            note.title === dateStr && note.tags && note.tags.includes(DAILY_TAG)
        );
    }

    async function createDailyNote(dateStr) {
        if (typeof NotesModule === 'undefined') return null;

        try {
            const note = await NotesModule.createNew();

            const template = generateDailyTemplate(dateStr);

            await NotesModule.updateNote(note.id, {
                title: dateStr,
                content: template,
                tags: [DAILY_TAG]
            });

            console.log(`Daily note created: ${dateStr}`);
            return note;
        } catch (error) {
            console.error('Failed to create daily note', error);
            if (typeof Toast !== 'undefined') {
                Toast.error('Échec de la création de la note quotidienne');
            }
            return null;
        }
    }

    function generateDailyTemplate(dateStr) {
        const date = new Date(dateStr);
        const dayNames = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
        const dayName = dayNames[date.getDay()];

        const yesterday = new Date(date);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = formatDate(yesterday);

        const tomorrow = new Date(date);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = formatDate(tomorrow);

        return `# ${dayName} ${dateStr}

## 🎯 Priorités du jour
- [ ]

## 📝 Notes rapides


## 💡 Idées


## 🔗 Liens
[[${yesterdayStr}]] ← Hier | Demain → [[${tomorrowStr}]]

---
Tags: #daily
`;
    }

    // ========== ACTIONS ==========

    async function openToday() {
        const today = getToday();
        await openDate(today);
    }

    async function openDate(dateStr) {
        let note = findDailyNote(dateStr);

        if (!note) {
            // Create new daily note
            note = await createDailyNote(dateStr);
            if (!note) return;

            if (typeof Toast !== 'undefined') {
                Toast.success(`Note quotidienne créée : ${dateStr}`);
            }
        }

        // Open note
        if (typeof NotesWikiLinks !== 'undefined') {
            NotesWikiLinks.openNote(note.id);
        }

        // Refresh sidebar
        if (typeof NotesLayoutV6 !== 'undefined') {
            NotesLayoutV6.switchSidebarTab('daily');
        }
    }

    // ========== UTILS ==========

    function getToday() {
        return formatDate(new Date());
    }

    function formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // ========== PUBLIC API ==========

    return {
        render,
        openToday,
        openDate,
        getDailyNotes
    };

})();

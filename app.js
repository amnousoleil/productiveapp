// === DONNÉES ===
let bubbles = JSON.parse(localStorage.getItem('bubbles')) || [];
let journal = JSON.parse(localStorage.getItem('journal')) || [];
let history = JSON.parse(localStorage.getItem('history')) || [];

// === ÉLÉMENTS DOM ===
const bubbleInput = document.getElementById('bubble-input');
const journalInput = document.getElementById('journal-input');
const todoBubbles = document.getElementById('todo-bubbles');
const doneBubbles = document.getElementById('done-bubbles');
const journalEntries = document.getElementById('journal-entries');
const generateSummaryBtn = document.getElementById('generate-summary');
const dailySummary = document.getElementById('daily-summary');

// === INITIALISATION ===
document.addEventListener('DOMContentLoaded', () => {
    renderBubbles();
    renderJournal();
});

// === CRÉATION DE BULLES ===
bubbleInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && bubbleInput.value.trim()) {
        createBubble(bubbleInput.value.trim());
        bubbleInput.value = '';
    }
});

function createBubble(text) {
    const bubble = {
        id: Date.now(),
        text: text,
        done: false,
        priority: analyzePriority(text),
        createdAt: new Date().toISOString()
    };
    
    bubbles.push(bubble);
    saveBubbles();
    renderBubbles();
}

// === ANALYSE DE PRIORITÉ SIMPLE ===
function analyzePriority(text) {
    const urgentKeywords = ['urgent', 'important', 'deadline', 'aujourd\'hui', 'maintenant', 'asap', 'critique'];
    const lowKeywords = ['peut-être', 'éventuellement', 'un jour', 'quand possible', 'optionnel'];
    
    const textLower = text.toLowerCase();
    
    if (urgentKeywords.some(kw => textLower.includes(kw))) {
        return { level: 1, label: 'Urgent' };
    }
    if (lowKeywords.some(kw => textLower.includes(kw))) {
        return { level: 3, label: 'Basse' };
    }
    return { level: 2, label: 'Normal' };
}

// === RENDU DES BULLES ===
function renderBubbles() {
    const todo = bubbles.filter(b => !b.done).sort((a, b) => a.priority.level - b.priority.level);
    const done = bubbles.filter(b => b.done);
    
    todoBubbles.innerHTML = todo.length ? '' : '<div class="empty-state">Aucune bulle pour l\'instant</div>';
    doneBubbles.innerHTML = done.length ? '' : '<div class="empty-state">Rien de terminé encore</div>';
    
    todo.forEach(bubble => {
        todoBubbles.appendChild(createBubbleElement(bubble));
    });
    
    done.forEach(bubble => {
        doneBubbles.appendChild(createBubbleElement(bubble));
    });
}

function createBubbleElement(bubble) {
    const div = document.createElement('div');
    div.className = `bubble ${bubble.done ? 'done' : 'todo'}`;
    div.innerHTML = `
        <span class="text">${escapeHtml(bubble.text)}</span>
        ${!bubble.done ? `<span class="priority">${bubble.priority.label}</span>` : ''}
        <button class="delete-btn" onclick="deleteBubble(${bubble.id}, event)">×</button>
    `;
    div.onclick = () => toggleBubble(bubble.id);
    return div;
}

function toggleBubble(id) {
    const bubble = bubbles.find(b => b.id === id);
    if (bubble) {
        bubble.done = !bubble.done;
        if (bubble.done) {
            bubble.completedAt = new Date().toISOString();
            // Ajoute automatiquement au journal
            addJournalEntry(`✓ Terminé: ${bubble.text}`);
        }
        saveBubbles();
        renderBubbles();
    }
}

function deleteBubble(id, event) {
    event.stopPropagation();
    bubbles = bubbles.filter(b => b.id !== id);
    saveBubbles();
    renderBubbles();
}

// === JOURNAL ===
journalInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && journalInput.value.trim()) {
        addJournalEntry(journalInput.value.trim());
        journalInput.value = '';
    }
});

function addJournalEntry(text) {
    const entry = {
        id: Date.now(),
        text: text,
        time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        date: new Date().toISOString()
    };
    
    journal.unshift(entry);
    saveJournal();
    renderJournal();
}

function renderJournal() {
    const today = new Date().toDateString();
    const todayEntries = journal.filter(e => new Date(e.date).toDateString() === today);
    
    journalEntries.innerHTML = todayEntries.length ? '' : '<div class="empty-state">Aucune entrée aujourd\'hui</div>';
    
    todayEntries.forEach(entry => {
        const div = document.createElement('div');
        div.className = 'journal-entry';
        div.innerHTML = `
            <span class="time">${entry.time}</span>
            <span class="content">${escapeHtml(entry.text)}</span>
        `;
        journalEntries.appendChild(div);
    });
}

// === RÉSUMÉ DU JOUR ===
generateSummaryBtn.addEventListener('click', generateSummary);

function generateSummary() {
    const today = new Date().toDateString();
    const todayEntries = journal.filter(e => new Date(e.date).toDateString() === today);
    const completedToday = bubbles.filter(b => b.done && b.completedAt && new Date(b.completedAt).toDateString() === today);
    
    let summaryHtml = `<h3>📊 Résumé du ${new Date().toLocaleDateString('fr-FR')}</h3>`;
    
    if (todayEntries.length === 0 && completedToday.length === 0) {
        summaryHtml += '<p>Aucune activité enregistrée aujourd\'hui.</p>';
    } else {
        summaryHtml += `<p><strong>${completedToday.length}</strong> bulle(s) terminée(s)</p>`;
        summaryHtml += `<p><strong>${todayEntries.length}</strong> entrée(s) dans le journal</p>`;
        
        if (todayEntries.length > 0) {
            summaryHtml += '<p style="margin-top: 15px;"><strong>Ce que tu as fait :</strong></p>';
            summaryHtml += '<ul style="margin-left: 20px; margin-top: 5px;">';
            todayEntries.forEach(e => {
                summaryHtml += `<li>${escapeHtml(e.text)}</li>`;
            });
            summaryHtml += '</ul>';
        }
    }
    
    // Sauvegarde dans l'historique
    const summaryData = {
        date: new Date().toISOString(),
        entries: todayEntries,
        completedBubbles: completedToday
    };
    history.push(summaryData);
    localStorage.setItem('history', JSON.stringify(history));
    
    dailySummary.innerHTML = summaryHtml;
    dailySummary.classList.add('visible');
}

// === UTILITAIRES ===
function saveBubbles() {
    localStorage.setItem('bubbles', JSON.stringify(bubbles));
}

function saveJournal() {
    localStorage.setItem('journal', JSON.stringify(journal));
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// === EXPORT POUR N8N (futur) ===
window.exportData = function() {
    return {
        bubbles: bubbles,
        journal: journal,
        history: history
    };
};

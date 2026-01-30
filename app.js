// === CONFIGURATION N8N ===
const N8N_WEBHOOK_URL = 'https://n8n.srv1053121.hstgr.cloud/webhook/b44d5f39-8f25-4fb0-9fcf-d69be1ffa1a1';
const CURRENT_USER = 'Maha';

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
const addBubbleBtn = document.getElementById('add-bubble-btn');
const addJournalBtn = document.getElementById('add-journal-btn');
const clearAllBtn = document.getElementById('clear-all-btn');
const confirmModal = document.getElementById('confirm-modal');
const modalMessage = document.getElementById('modal-message');
const modalCancel = document.getElementById('modal-cancel');
const modalConfirm = document.getElementById('modal-confirm');

// === INITIALISATION ===
document.addEventListener('DOMContentLoaded', () => {
    renderBubbles();
    renderJournal();
});

// === VIDER TOUTES LES BULLES ===
clearAllBtn.addEventListener('click', () => {
    if (bubbles.length === 0) {
        return;
    }
    
    modalMessage.textContent = `Tu es sur le point de supprimer ${bubbles.length} bulle(s).`;
    confirmModal.classList.remove('hidden');
});

modalCancel.addEventListener('click', () => {
    confirmModal.classList.add('hidden');
});

modalConfirm.addEventListener('click', () => {
    bubbles = [];
    saveBubbles();
    renderBubbles();
    confirmModal.classList.add('hidden');
});

// Fermer la modale en cliquant en dehors
confirmModal.addEventListener('click', (e) => {
    if (e.target === confirmModal) {
        confirmModal.classList.add('hidden');
    }
});

// === CRÉATION DE BULLES ===
bubbleInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && bubbleInput.value.trim()) {
        createBubble(bubbleInput.value.trim());
        bubbleInput.value = '';
    }
});

addBubbleBtn.addEventListener('click', () => {
    if (bubbleInput.value.trim()) {
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
        project: detectProject(text),
        createdAt: new Date().toISOString()
    };
    
    bubbles.push(bubble);
    saveBubbles();
    renderBubbles();
    
    // Envoi à n8n
    sendToN8N('bubble', bubble);
}

// === ENVOI VERS N8N ===
async function sendToN8N(type, data) {
    try {
        const payload = {
            type: type,
            user: CURRENT_USER,
            ...data,
            priority_level: data.priority?.level,
            priority_label: data.priority?.label,
            project: data.project || 'Général'
        };
        
        await fetch(N8N_WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });
        console.log('Envoyé à n8n:', payload);
    } catch (error) {
        console.error('Erreur envoi n8n:', error);
    }
}

// === ANALYSE DE PRIORITÉ ET PROJET ===
function analyzePriority(text) {
    const urgentKeywords = ['urgent', 'important', 'deadline', 'aujourd\'hui', 'maintenant', 'asap', 'critique', 'vite', 'rapidement'];
    const lowKeywords = ['peut-être', 'éventuellement', 'un jour', 'quand possible', 'optionnel', 'si possible', 'à voir'];
    
    const textLower = text.toLowerCase();
    
    let level = 2;
    let label = 'Normal';
    
    if (urgentKeywords.some(kw => textLower.includes(kw))) {
        level = 1;
        label = 'Urgent';
    } else if (lowKeywords.some(kw => textLower.includes(kw))) {
        level = 3;
        label = 'Basse';
    }
    
    return { level, label };
}

function detectProject(text) {
    const textLower = text.toLowerCase();
    
    // Règles de détection de projet (ordre de priorité)
    const projectRules = [
        // Admin / Comptabilité
        { keywords: ['urssaf', 'ursaff', 'déclaration', 'décla', 'impôt', 'impots', 'tva', 'sasu', 'sarl', 'micro-entreprise', 'autoentrepreneur', 'comptable', 'compta', 'bilan', 'cfe', 'cotisation', 'charges', 'kbis', 'caf'], project: 'Admin' },
        
        // Banque / Finances
        { keywords: ['banque', 'virement', 'rib', 'iban', 'compte bancaire', 'carte bancaire', 'prélèvement', 'chèque', 'crédit', 'prêt'], project: 'Banque' },
        
        // Juridique
        { keywords: ['avocat', 'avocate', 'contrat', 'cgv', 'cgu', 'mentions légales', 'rgpd', 'litige', 'huissier', 'tribunal', 'juridique', 'notaire'], project: 'Juridique' },
        
        // Clients / Commercial
        { keywords: ['devis', 'facture client', 'prospect', 'rendez-vous client', 'rdv client', 'appel client', 'relance client', 'closing', 'vente', 'commercial'], project: 'Clients' },
        
        // Marketing / Communication
        { keywords: ['instagram', 'insta', 'facebook', 'linkedin', 'tiktok', 'youtube', 'post', 'publication', 'story', 'reel', 'newsletter', 'emailing', 'mailer', 'mailchimp', 'campagne', 'pub ', 'publicité', 'contenu', 'visuel', 'branding', 'logo', 'méta', 'meta'], project: 'Marketing' },
        
        // Produit / Offres
        { keywords: ['formation', 'coaching', 'programme', 'module', 'cours', 'offre', 'lancement', 'tunnel', 'page de vente', 'webinaire', 'masterclass'], project: 'Produit' },
        
        // Tech / Développement
        { keywords: ['site', 'website', 'bug', 'application', 'app', 'code', 'développement', 'n8n', 'automatisation', 'api', 'serveur', 'hébergement', 'wordpress'], project: 'Tech' },
        
        // Perso / Famille
        { keywords: ['mère', 'maman', 'père', 'papa', 'fille', 'fils', 'enfant', 'famille', 'frère', 'soeur', 'sœur', 'mari', 'femme', 'ex ', 'copain', 'copine', 'maison', 'appartement', 'ménage', 'courses', 'médecin', 'docteur', 'santé', 'dentiste', 'kiné', 'perso'], project: 'Perso' },
    ];
    
    // Chercher une correspondance
    for (const rule of projectRules) {
        if (rule.keywords.some(kw => textLower.includes(kw))) {
            return rule.project;
        }
    }
    
    // Détecter les prénoms courants
    const prenoms = ['stéphane', 'stephane', 'marie', 'sophie', 'julie', 'laura', 'emma', 'léa', 'chloé', 'camille', 'sarah', 'lucas', 'hugo', 'louis', 'jules', 'gabriel', 'arthur', 'nathan', 'thomas', 'nicolas', 'pierre', 'jean', 'paul', 'michel', 'philippe', 'alain', 'bernard', 'patrick', 'david', 'eric', 'olivier', 'laurent', 'christophe', 'christian', 'daniel', 'pascal', 'jacques', 'thierry', 'claude', 'didier', 'denis', 'serge', 'gérard', 'nathalie', 'isabelle', 'sylvie', 'catherine', 'christine', 'monique', 'nicole', 'françoise', 'anne', 'brigitte', 'martine', 'karima', 'kada', 'karim', 'mohamed', 'ahmed', 'fatima', 'samira', 'yasmine', 'leila', 'nadia', 'rachid', 'said', 'hassan', 'ali', 'youssef', 'omar', 'adam', 'amine', 'mehdi', 'sami', 'walid', 'rayan', 'ilyes', 'enzo', 'mathis', 'théo', 'raphaël', 'maxime', 'antoine', 'alexandre', 'quentin', 'romain', 'kevin', 'julien', 'florian', 'dylan', 'killian', 'alexis', 'valentin', 'bastien', 'corentin', 'adrien', 'benjamin', 'clément', 'victor', 'samuel', 'evan', 'noah', 'ethan', 'liam', 'léo', 'malo', 'timéo', 'mathéo', 'loïc', 'jérémy', 'jonathan', 'anthony', 'jordan', 'steven', 'bryan', 'amélie', 'clara', 'manon', 'océane', 'anaïs', 'justine', 'pauline', 'charlotte', 'juliette', 'margot', 'eva', 'lola', 'zoé', 'inès', 'jade', 'louise', 'alice', 'rose', 'anna', 'elsa', 'mila', 'lina', 'nina', 'maya', 'lou', 'lucie', 'maëlys', 'lilou', 'louna', 'romane', 'clémence', 'agathe', 'victoire', 'elise', 'mathilde', 'margaux', 'célia', 'coralie', 'elodie', 'audrey', 'mélanie', 'jennifer', 'jessica', 'vanessa', 'sabrina', 'laetitia', 'aurélie', 'emilie', 'virginie', 'sandrine', 'valérie', 'stéphanie', 'véronique', 'corinne', 'laurence', 'karine', 'carine', 'delphine', 'céline', 'fabienne', 'dominique', 'patricia', 'josiane', 'florence', 'hélène', 'béatrice', 'agnès'];
    
    for (const prenom of prenoms) {
        if (textLower.includes(prenom)) {
            // Capitaliser la première lettre
            return prenom.charAt(0).toUpperCase() + prenom.slice(1);
        }
    }
    
    return 'Général';
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

addJournalBtn.addEventListener('click', () => {
    if (journalInput.value.trim()) {
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

// === CHATBOT IA ===
const chatbotToggle = document.getElementById('chatbot-toggle');
const chatbotWindow = document.getElementById('chatbot-window');
const chatbotClose = document.getElementById('chatbot-close');
const chatbotInput = document.getElementById('chatbot-input');
const chatbotSend = document.getElementById('chatbot-send');
const chatbotMessages = document.getElementById('chatbot-messages');

// Toggle chatbot
chatbotToggle.addEventListener('click', () => {
    chatbotWindow.classList.toggle('hidden');
    if (!chatbotWindow.classList.contains('hidden')) {
        chatbotInput.focus();
    }
});

chatbotClose.addEventListener('click', () => {
    chatbotWindow.classList.add('hidden');
});

// Envoyer message
chatbotSend.addEventListener('click', sendChatMessage);
chatbotInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendChatMessage();
});

async function sendChatMessage() {
    const message = chatbotInput.value.trim();
    if (!message) return;
    
    // Afficher message utilisateur
    addChatMessage(message, 'user');
    chatbotInput.value = '';
    
    // Afficher "en train d'écrire..."
    const loadingDiv = addChatMessage('En train de réfléchir...', 'assistant loading');
    
    try {
        const response = await getChatbotResponse(message);
        loadingDiv.remove();
        addChatMessage(response, 'assistant');
    } catch (error) {
        loadingDiv.remove();
        addChatMessage('Oups, une erreur est survenue. Réessaie !', 'assistant');
    }
}

function addChatMessage(text, className) {
    const div = document.createElement('div');
    div.className = `chat-message ${className}`;
    div.textContent = text;
    chatbotMessages.appendChild(div);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    return div;
}

async function getChatbotResponse(userMessage) {
    // Contexte des tâches actuelles
    const todoBubbles = bubbles.filter(b => !b.done);
    const doneBubbles = bubbles.filter(b => b.done);
    const urgentBubbles = todoBubbles.filter(b => b.priority.level === 1);
    
    const context = `
Contexte de l'utilisateur (${CURRENT_USER}) :
- ${todoBubbles.length} tâche(s) à faire
- ${doneBubbles.length} tâche(s) terminée(s)
- ${urgentBubbles.length} tâche(s) urgente(s)

Tâches à faire :
${todoBubbles.map(b => `- ${b.text} (${b.priority.label}, projet: ${b.project})`).join('\n') || 'Aucune'}

Tâches urgentes :
${urgentBubbles.map(b => `- ${b.text}`).join('\n') || 'Aucune'}
    `.trim();
    
    // Appel à l'API OpenAI via n8n ou directement
    // Pour l'instant, réponses intelligentes locales basées sur le contexte
    return getSmartResponse(userMessage, todoBubbles, urgentBubbles, doneBubbles);
}

function getSmartResponse(message, todo, urgent, done) {
    const msgLower = message.toLowerCase();
    
    // Questions sur les tâches
    if (msgLower.includes('combien') && (msgLower.includes('tâche') || msgLower.includes('bulle'))) {
        return `Tu as ${todo.length} tâche(s) à faire et ${done.length} terminée(s). ${urgent.length > 0 ? `⚠️ Dont ${urgent.length} urgente(s) !` : 'Aucune urgence pour le moment 👍'}`;
    }
    
    if (msgLower.includes('urgent') || msgLower.includes('priorit')) {
        if (urgent.length === 0) {
            return `Bonne nouvelle ! Tu n'as aucune tâche urgente. Tu peux avancer sereinement sur tes ${todo.length} tâches en cours.`;
        }
        return `Tu as ${urgent.length} tâche(s) urgente(s) :\n${urgent.map(b => `• ${b.text}`).join('\n')}\n\nJe te conseille de t'en occuper en priorité ! 💪`;
    }
    
    if (msgLower.includes('quoi faire') || msgLower.includes('par quoi commencer') || msgLower.includes('conseil')) {
        if (urgent.length > 0) {
            return `Commence par tes urgences :\n• ${urgent[0].text}\n\nUne fois ça fait, tu pourras passer aux autres tâches plus sereinement.`;
        }
        if (todo.length > 0) {
            const firstTask = todo[0];
            return `Je te suggère de commencer par : "${firstTask.text}" (${firstTask.project}). C'est ta priorité du moment !`;
        }
        return `Tu n'as aucune tâche en cours ! C'est le moment de planifier ta journée ou de te reposer 😊`;
    }
    
    if (msgLower.includes('projet') || msgLower.includes('catégorie')) {
        const projects = {};
        todo.forEach(b => {
            projects[b.project] = (projects[b.project] || 0) + 1;
        });
        const projectList = Object.entries(projects).map(([p, c]) => `• ${p}: ${c} tâche(s)`).join('\n');
        return `Répartition de tes tâches par projet :\n${projectList || 'Aucune tâche en cours'}`;
    }
    
    if (msgLower.includes('résumé') || msgLower.includes('recap') || msgLower.includes('overview')) {
        return `📊 Résumé rapide :\n\n• ${todo.length} tâche(s) à faire\n• ${done.length} terminée(s)\n• ${urgent.length} urgente(s)\n\n${urgent.length > 0 ? '⚠️ Pense à traiter tes urgences !' : '✨ Tout roule, continue comme ça !'}`;
    }
    
    if (msgLower.includes('motivation') || msgLower.includes('encourage') || msgLower.includes('boost')) {
        const motivations = [
            `Tu gères ! ${done.length} tâches déjà terminées, continue sur ta lancée 💪`,
            `Chaque petite action compte. Tu avances, c'est l'essentiel ! ✨`,
            `Rome ne s'est pas construite en un jour. Tu fais du super boulot ! 🏆`,
            `${todo.length} tâches ? Tu vas les pulvériser une par une ! 🔥`,
            `La clé c'est la régularité. Et tu es là, donc tu assures ! 💫`
        ];
        return motivations[Math.floor(Math.random() * motivations.length)];
    }
    
    if (msgLower.includes('merci')) {
        return `Avec plaisir ! Je suis là pour t'aider à rester organisée. N'hésite pas si tu as d'autres questions 💫`;
    }
    
    if (msgLower.includes('bonjour') || msgLower.includes('salut') || msgLower.includes('hello') || msgLower.includes('coucou')) {
        return `Hey ${CURRENT_USER} ! 👋 Comment puis-je t'aider ? Tu peux me demander un résumé de tes tâches, des conseils de priorité, ou juste discuter !`;
    }
    
    // Réponse par défaut
    return `Je suis ton assistant de productivité ! Tu peux me demander :\n• "Combien de tâches j'ai ?"\n• "Quoi faire en premier ?"\n• "Montre mes urgences"\n• "Résumé de mes tâches"\n• "Donne-moi de la motivation"\n\nOu pose-moi n'importe quelle question sur ton organisation !`;
}

// === CONFIGURATION N8N ===
const N8N_WEBHOOK_URL = 'https://n8n.srv1053121.hstgr.cloud/webhook/b44d5f39-8f25-4fb0-9fcf-d69be1ffa1a1';

// Nom stylé - parfois en japonais, parfois Maître Maha Giri
const NAMES = ['真波', '導師', 'マハ', '師範', 'Maître Maha Giri ⚡', '魔覇', 'MAHA 悟', '真覇王'];
const CURRENT_USER = NAMES[Math.floor(Math.random() * NAMES.length)];

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
const themeBtn = document.getElementById('theme-btn');
const themeModal = document.getElementById('theme-modal');
const themeModalClose = document.getElementById('theme-modal-close');
const themeSlider = document.getElementById('theme-slider');
const themeName = document.getElementById('theme-name');

const THEMES = [
    { id: 'desert', name: '🏜️ Désert' },
    { id: 'matrix', name: '💚 Matrix' },
    { id: 'bubblegum', name: '🍬 Bubblegum' },
    { id: 'midnight', name: '🌙 Midnight' },
    { id: 'ocean', name: '🌊 Océan' },
    { id: 'fantasy', name: '🔮 Fantasy' },
    { id: 'sunset', name: '🌅 Sunset' },
    { id: 'forest', name: '🌲 Forest' },
    { id: 'hacker', name: '🖤 Hacker' }
];

// === INITIALISATION ===
document.addEventListener('DOMContentLoaded', () => {
    renderBubbles();
    renderJournal();
    loadTheme();
});

// === GESTION DES THÈMES ===
themeBtn.addEventListener('click', () => {
    themeModal.classList.remove('hidden');
});

themeModalClose.addEventListener('click', () => {
    themeModal.classList.add('hidden');
});

themeModal.addEventListener('click', (e) => {
    if (e.target === themeModal) {
        themeModal.classList.add('hidden');
    }
});

themeSlider.addEventListener('input', () => {
    const index = parseInt(themeSlider.value);
    const theme = THEMES[index];
    setTheme(theme.id);
    themeName.textContent = theme.name;
});

// === EFFETS VISUELS PAR THÈME ===
const matrixCanvas = document.getElementById('matrix-bg');
const matrixCtx = matrixCanvas.getContext('2d');
let particles = [];
let animationId = null;

function initCanvas() {
    matrixCanvas.width = window.innerWidth;
    matrixCanvas.height = window.innerHeight;
    particles = [];
}

function animate() {
    const theme = document.documentElement.getAttribute('data-theme');
    
    matrixCtx.clearRect(0, 0, matrixCanvas.width, matrixCanvas.height);
    
    if (theme === 'matrix') {
        drawMatrixRain();
    } else if (theme === 'midnight') {
        drawStars();
    } else if (theme === 'ocean') {
        drawBubbles();
    } else if (theme === 'fantasy') {
        drawMagicParticles();
    } else if (theme === 'bubblegum') {
        drawPinkBubbles();
    } else if (theme === 'forest') {
        drawLeaves();
    } else if (theme === 'sunset') {
        drawSunsetGlow();
    } else if (theme === 'hacker') {
        drawHackerGrid();
    } else {
        drawSandParticles();
    }
    
    animationId = requestAnimationFrame(animate);
}

// Matrix - MAITRE MAHA GIRI qui tombe
function drawMatrixRain() {
    const words = ['真', '覇', '王', 'MAHA', 'GIRI', 'マハ', '01'];
    
    if (particles.length < 40) {
        particles.push({
            x: Math.random() * matrixCanvas.width,
            y: -50,
            speed: Math.random() * 1.5 + 0.5,
            word: words[Math.floor(Math.random() * words.length)],
            opacity: Math.random() * 0.3 + 0.1
        });
    }
    
    particles = particles.filter(p => p.y < matrixCanvas.height + 100);
    
    matrixCtx.font = '16px monospace';
    particles.forEach(p => {
        p.y += p.speed;
        matrixCtx.fillStyle = `rgba(0, 210, 106, ${p.opacity})`;
        matrixCtx.fillText(p.word, p.x, p.y);
    });
}

// Midnight - Étoiles scintillantes
function drawStars() {
    if (particles.length < 100) {
        particles.push({
            x: Math.random() * matrixCanvas.width,
            y: Math.random() * matrixCanvas.height,
            size: Math.random() * 2.5 + 0.5,
            twinkle: Math.random() * Math.PI * 2,
            speed: Math.random() * 0.05 + 0.02
        });
    }
    
    particles.forEach(p => {
        p.twinkle += p.speed;
        const opacity = 0.5 + Math.sin(p.twinkle) * 0.4;
        matrixCtx.beginPath();
        matrixCtx.fillStyle = `rgba(150, 180, 255, ${opacity})`;
        matrixCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        matrixCtx.fill();
    });
}

// Ocean - Bulles qui montent
function drawBubbles() {
    if (particles.length < 35 && Math.random() > 0.85) {
        particles.push({
            x: Math.random() * matrixCanvas.width,
            y: matrixCanvas.height + 20,
            size: Math.random() * 15 + 5,
            speed: Math.random() * 1.2 + 0.5,
            wobble: Math.random() * Math.PI * 2
        });
    }
    
    particles = particles.filter(p => p.y > -30);
    
    particles.forEach(p => {
        p.y -= p.speed;
        p.wobble += 0.04;
        p.x += Math.sin(p.wobble) * 0.8;
        matrixCtx.beginPath();
        matrixCtx.fillStyle = 'rgba(0, 200, 230, 0.08)';
        matrixCtx.strokeStyle = 'rgba(0, 220, 255, 0.3)';
        matrixCtx.lineWidth = 1.5;
        matrixCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        matrixCtx.fill();
        matrixCtx.stroke();
    });
}

// Fantasy - Particules magiques avec glow
function drawMagicParticles() {
    if (particles.length < 60 && Math.random() > 0.8) {
        particles.push({
            x: Math.random() * matrixCanvas.width,
            y: Math.random() * matrixCanvas.height,
            size: Math.random() * 5 + 2,
            vx: (Math.random() - 0.5) * 1,
            vy: (Math.random() - 0.5) * 1,
            life: 1,
            hue: Math.random() * 60 + 260
        });
    }
    
    particles = particles.filter(p => p.life > 0);
    
    particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.008;
        
        matrixCtx.beginPath();
        matrixCtx.fillStyle = `hsla(${p.hue}, 80%, 70%, ${p.life * 0.6})`;
        matrixCtx.shadowBlur = 20;
        matrixCtx.shadowColor = `hsla(${p.hue}, 80%, 60%, 0.5)`;
        matrixCtx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        matrixCtx.fill();
        matrixCtx.shadowBlur = 0;
    });
}

// Bubblegum - Grosses bulles roses
function drawPinkBubbles() {
    if (particles.length < 25 && Math.random() > 0.9) {
        particles.push({
            x: Math.random() * matrixCanvas.width,
            y: matrixCanvas.height + 50,
            size: Math.random() * 30 + 15,
            speed: Math.random() * 0.6 + 0.3,
            wobble: Math.random() * Math.PI * 2
        });
    }
    
    particles = particles.filter(p => p.y > -60);
    
    particles.forEach(p => {
        p.y -= p.speed;
        p.wobble += 0.025;
        p.x += Math.sin(p.wobble) * 0.8;
        matrixCtx.beginPath();
        matrixCtx.fillStyle = 'rgba(255, 107, 157, 0.12)';
        matrixCtx.strokeStyle = 'rgba(255, 150, 200, 0.35)';
        matrixCtx.lineWidth = 2;
        matrixCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        matrixCtx.fill();
        matrixCtx.stroke();
    });
}

// Forest - Feuilles qui tombent
function drawLeaves() {
    if (particles.length < 20 && Math.random() > 0.93) {
        particles.push({
            x: Math.random() * matrixCanvas.width,
            y: -30,
            rotation: Math.random() * Math.PI * 2,
            speed: Math.random() * 1 + 0.5,
            rotSpeed: (Math.random() - 0.5) * 0.08,
            wobble: Math.random() * Math.PI * 2,
            size: Math.random() * 10 + 8
        });
    }
    
    particles = particles.filter(p => p.y < matrixCanvas.height + 40);
    
    particles.forEach(p => {
        p.y += p.speed;
        p.wobble += 0.04;
        p.x += Math.sin(p.wobble) * 1.2;
        p.rotation += p.rotSpeed;
        
        matrixCtx.save();
        matrixCtx.translate(p.x, p.y);
        matrixCtx.rotate(p.rotation);
        matrixCtx.fillStyle = 'rgba(74, 222, 128, 0.4)';
        matrixCtx.beginPath();
        matrixCtx.ellipse(0, 0, p.size, p.size / 2.5, 0, 0, Math.PI * 2);
        matrixCtx.fill();
        matrixCtx.restore();
    });
}

// Sunset - Lueur chaude animée
function drawSunsetGlow() {
    const time = Date.now() / 2000;
    const pulseSize = 350 + Math.sin(time) * 80;
    
    const gradient = matrixCtx.createRadialGradient(
        matrixCanvas.width * 0.85, matrixCanvas.height * 0.1, 0,
        matrixCanvas.width * 0.85, matrixCanvas.height * 0.1, pulseSize
    );
    gradient.addColorStop(0, 'rgba(255, 150, 50, 0.15)');
    gradient.addColorStop(0.4, 'rgba(255, 100, 50, 0.08)');
    gradient.addColorStop(1, 'rgba(255, 50, 50, 0)');
    matrixCtx.fillStyle = gradient;
    matrixCtx.fillRect(0, 0, matrixCanvas.width, matrixCanvas.height);
}

// Hacker - Grille dorée avec pulse
function drawHackerGrid() {
    const time = Date.now() / 800;
    const pulse = 0.04 + Math.sin(time) * 0.02;
    
    matrixCtx.strokeStyle = `rgba(255, 215, 0, ${pulse})`;
    matrixCtx.lineWidth = 1;
    
    for (let x = 0; x < matrixCanvas.width; x += 80) {
        matrixCtx.beginPath();
        matrixCtx.moveTo(x, 0);
        matrixCtx.lineTo(x, matrixCanvas.height);
        matrixCtx.stroke();
    }
    for (let y = 0; y < matrixCanvas.height; y += 80) {
        matrixCtx.beginPath();
        matrixCtx.moveTo(0, y);
        matrixCtx.lineTo(matrixCanvas.width, y);
        matrixCtx.stroke();
    }
    
    // Points lumineux aux intersections
    matrixCtx.fillStyle = `rgba(255, 215, 0, ${pulse * 3})`;
    for (let x = 0; x < matrixCanvas.width; x += 80) {
        for (let y = 0; y < matrixCanvas.height; y += 80) {
            matrixCtx.beginPath();
            matrixCtx.arc(x, y, 2, 0, Math.PI * 2);
            matrixCtx.fill();
        }
    }
}

// Désert - Particules de sable qui volent
function drawSandParticles() {
    if (particles.length < 40 && Math.random() > 0.85) {
        particles.push({
            x: -20,
            y: Math.random() * matrixCanvas.height,
            size: Math.random() * 3 + 1,
            speed: Math.random() * 2 + 1,
            vy: (Math.random() - 0.5) * 0.5,
            opacity: Math.random() * 0.4 + 0.2
        });
    }
    
    particles = particles.filter(p => p.x < matrixCanvas.width + 30);
    
    particles.forEach(p => {
        p.x += p.speed;
        p.y += p.vy + Math.sin(p.x / 50) * 0.3;
        matrixCtx.beginPath();
        matrixCtx.fillStyle = `rgba(224, 170, 120, ${p.opacity})`;
        matrixCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        matrixCtx.fill();
    });
}

function startAnimation() {
    if (!animationId) {
        initCanvas();
        animate();
    }
}

function stopAnimation() {
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }
}

window.addEventListener('resize', initCanvas);

function setTheme(theme) {
    if (theme === 'desert') {
        document.documentElement.removeAttribute('data-theme');
    } else {
        document.documentElement.setAttribute('data-theme', theme);
    }
    localStorage.setItem('theme', theme);
    
    // Reset particles pour le nouveau thème
    particles = [];
}

function loadTheme() {
    const savedTheme = localStorage.getItem('theme') || 'desert';
    setTheme(savedTheme);
    
    // Update slider position
    const index = THEMES.findIndex(t => t.id === savedTheme);
    if (index !== -1) {
        themeSlider.value = index;
        themeName.textContent = THEMES[index].name;
    }
    
    // Démarrer l'animation
    setTimeout(startAnimation, 100);
}

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
const CHATBOT_WEBHOOK_URL = 'https://n8n.srv1053121.hstgr.cloud/webhook/f199f400-91f2-48ea-b115-26a330247dcc';

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
        // Préparer le contexte des tâches
        const todoBubbles = bubbles.filter(b => !b.done);
        const doneBubbles = bubbles.filter(b => b.done);
        
        const context = `
UTILISATEUR: ${CURRENT_USER}
TÂCHES À FAIRE (${todoBubbles.length}):
${todoBubbles.map(b => `- "${b.text}" | Priorité: ${b.priority.label} | Projet: ${b.project}`).join('\n') || 'Aucune'}

TÂCHES TERMINÉES (${doneBubbles.length}):
${doneBubbles.slice(0, 10).map(b => `- "${b.text}" | Projet: ${b.project}`).join('\n') || 'Aucune'}
        `.trim();
        
        // Appel au webhook n8n
        const response = await fetch(CHATBOT_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: message,
                context: context,
                user: CURRENT_USER
            })
        });
        
        const data = await response.text();
        loadingDiv.remove();
        
        // Parser la réponse
        let aiResponse = data;
        try {
            const jsonData = JSON.parse(data);
            aiResponse = jsonData.response || jsonData.text || data;
        } catch (e) {
            // Si ce n'est pas du JSON, utiliser la réponse brute
        }
        
        // Vérifier si l'IA demande une action
        if (aiResponse.includes('ACTION:CREATE')) {
            const actionMatch = aiResponse.match(/ACTION:CREATE\s*(\{.*\})/);
            if (actionMatch) {
                try {
                    const taskData = JSON.parse(actionMatch[1]);
                    createBubbleFromAI(taskData);
                    aiResponse = aiResponse.replace(/ACTION:CREATE\s*\{.*\}/, '').trim();
                    aiResponse += '\n\n✅ Tâche créée !';
                } catch (e) {
                    console.error('Erreur création tâche:', e);
                }
            }
        }
        
        addChatMessage(aiResponse || 'Réponse reçue !', 'assistant');
        
    } catch (error) {
        console.error('Erreur chatbot:', error);
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

// Créer une bulle depuis l'IA
function createBubbleFromAI(taskData) {
    const bubble = {
        id: Date.now(),
        text: taskData.text,
        done: false,
        priority: {
            level: taskData.priority_level || 2,
            label: taskData.priority_label || 'Normal'
        },
        project: taskData.project || detectProject(taskData.text),
        createdAt: new Date().toISOString()
    };
    
    bubbles.push(bubble);
    saveBubbles();
    renderBubbles();
    sendToN8N('bubble', bubble);
}

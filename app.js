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
    applyChatbotSize(); // Appliquer la taille sauvegardée du chatbot
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
    
    // S'assurer que le canvas a la bonne taille
    if (matrixCanvas.width !== window.innerWidth || matrixCanvas.height !== window.innerHeight) {
        matrixCanvas.width = window.innerWidth;
        matrixCanvas.height = window.innerHeight;
        particles = [];
        particles.columns = null;
    }
    
    // Limite de sécurité - éviter les fuites mémoire
    if (Array.isArray(particles) && particles.length > 200) {
        particles = particles.slice(-100);
    }
    
    matrixCtx.clearRect(0, 0, matrixCanvas.width, matrixCanvas.height);
    
    try {
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
    } catch (e) {
        console.error('Animation error:', e);
        // Reset en cas d'erreur
        particles = [];
        particles.columns = null;
    }
    
    animationId = requestAnimationFrame(animate);
}

// Matrix - Vraie pluie de code style Matrix avec MAITRE MAHA GIRI badass
function drawMatrixRain() {
    const chars = '真覇王導師悟アイウエオカキクケコ0123456789ABCDEF';
    const columnWidth = 20;
    const numColumns = Math.floor(matrixCanvas.width / columnWidth);
    
    // Initialiser les colonnes si pas fait
    if (!particles.columns) {
        particles.columns = [];
        for (let i = 0; i < numColumns; i++) {
            particles.columns.push({
                x: i * columnWidth,
                y: Math.random() * matrixCanvas.height * 2 - matrixCanvas.height,
                speed: Math.random() * 2 + 2,
                chars: [],
                length: Math.floor(Math.random() * 15) + 10,
                isMaha: false
            });
            // Remplir avec des caractères
            for (let j = 0; j < particles.columns[i].length; j++) {
                particles.columns[i].chars.push(chars[Math.floor(Math.random() * chars.length)]);
            }
        }
        
        // Choisir quelques colonnes pour MAITRE MAHA GIRI (doré badass)
        const mahaText = 'MAITREMAHAGIRI';
        const startCol = Math.floor(numColumns / 2) - 7;
        for (let i = 0; i < mahaText.length && startCol + i < numColumns; i++) {
            if (startCol + i >= 0) {
                particles.columns[startCol + i].isMaha = true;
                particles.columns[startCol + i].mahaChar = mahaText[i];
                particles.columns[startCol + i].speed = 1.5;
            }
        }
    }
    
    matrixCtx.font = '16px monospace';
    
    particles.columns.forEach(col => {
        col.y += col.speed;
        
        // Reset quand la colonne sort de l'écran
        if (col.y - col.length * 18 > matrixCanvas.height) {
            col.y = -col.length * 18;
            // Regénérer les caractères
            for (let j = 0; j < col.chars.length; j++) {
                col.chars[j] = chars[Math.floor(Math.random() * chars.length)];
            }
        }
        
        // Dessiner chaque caractère de la colonne
        col.chars.forEach((char, i) => {
            const charY = col.y - i * 18;
            if (charY > -20 && charY < matrixCanvas.height + 20) {
                if (col.isMaha && i === 0) {
                    // MAITRE MAHA GIRI en doré brillant badass
                    matrixCtx.fillStyle = '#ffd700';
                    matrixCtx.shadowBlur = 15;
                    matrixCtx.shadowColor = '#ffd700';
                    matrixCtx.fillText(col.mahaChar, col.x, charY);
                    matrixCtx.shadowBlur = 0;
                } else {
                    // Caractères normaux - dégradé d'opacité
                    const opacity = i === 0 ? 1 : Math.max(0.1, 0.8 - i * 0.05);
                    matrixCtx.fillStyle = i === 0 ? '#50ff50' : `rgba(0, 255, 100, ${opacity})`;
                    matrixCtx.fillText(char, col.x, charY);
                }
            }
        });
        
        // Changer aléatoirement des caractères pour l'effet "vivant"
        if (Math.random() > 0.9) {
            const idx = Math.floor(Math.random() * col.chars.length);
            col.chars[idx] = chars[Math.floor(Math.random() * chars.length)];
        }
    });
}

// Midnight - Étoiles scintillantes + étoiles filantes
function drawStars() {
    // Étoiles fixes qui scintillent (max 80, pas plus)
    const stars = particles.filter(p => p.type === 'star');
    if (stars.length < 80) {
        particles.push({
            x: Math.random() * matrixCanvas.width,
            y: Math.random() * matrixCanvas.height,
            size: Math.random() * 2 + 0.5,
            twinkle: Math.random() * Math.PI * 2,
            speed: Math.random() * 0.05 + 0.02,
            type: 'star'
        });
    }
    
    // Étoiles filantes occasionnelles
    if (Math.random() > 0.995) {
        particles.push({
            x: Math.random() * matrixCanvas.width,
            y: 0,
            speed: Math.random() * 8 + 5,
            length: Math.random() * 80 + 40,
            type: 'shooting'
        });
    }
    
    // Nettoyer les étoiles filantes sorties
    particles = particles.filter(p => {
        if (p.type === 'shooting') return p.y < matrixCanvas.height && p.x < matrixCanvas.width;
        return true;
    });
    
    // Limiter le total
    if (particles.length > 100) {
        particles = particles.filter(p => p.type === 'star').slice(0, 80);
    }
    
    particles.forEach(p => {
        if (p.type === 'star') {
            p.twinkle += p.speed;
            const opacity = 0.5 + Math.sin(p.twinkle) * 0.4;
            matrixCtx.beginPath();
            matrixCtx.fillStyle = `rgba(180, 200, 255, ${opacity})`;
            matrixCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            matrixCtx.fill();
        } else if (p.type === 'shooting') {
            // Étoile filante
            p.x += p.speed * 0.7;
            p.y += p.speed;
            
            const gradient = matrixCtx.createLinearGradient(
                p.x, p.y, p.x - p.length * 0.7, p.y - p.length
            );
            gradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
            gradient.addColorStop(1, 'rgba(100, 150, 255, 0)');
            
            matrixCtx.beginPath();
            matrixCtx.strokeStyle = gradient;
            matrixCtx.lineWidth = 2;
            matrixCtx.moveTo(p.x, p.y);
            matrixCtx.lineTo(p.x - p.length * 0.7, p.y - p.length);
            matrixCtx.stroke();
        }
    });
}

// Ocean - Vagues + bulles
function drawBubbles() {
    const time = Date.now() / 1000;
    
    // Dessiner des vagues en bas
    matrixCtx.beginPath();
    matrixCtx.moveTo(0, matrixCanvas.height);
    for (let x = 0; x <= matrixCanvas.width; x += 20) {
        const y = matrixCanvas.height - 30 + Math.sin(x / 80 + time) * 15 + Math.sin(x / 40 + time * 1.5) * 8;
        matrixCtx.lineTo(x, y);
    }
    matrixCtx.lineTo(matrixCanvas.width, matrixCanvas.height);
    matrixCtx.fillStyle = 'rgba(0, 180, 220, 0.08)';
    matrixCtx.fill();
    
    // Bulles qui montent
    if (particles.length < 25 && Math.random() > 0.9) {
        particles.push({
            x: Math.random() * matrixCanvas.width,
            y: matrixCanvas.height + 20,
            size: Math.random() * 12 + 4,
            speed: Math.random() * 1.5 + 0.8,
            wobble: Math.random() * Math.PI * 2
        });
    }
    
    particles = particles.filter(p => p.y > -30);
    
    particles.forEach(p => {
        p.y -= p.speed;
        p.wobble += 0.06;
        p.x += Math.sin(p.wobble) * 1;
        matrixCtx.beginPath();
        matrixCtx.fillStyle = 'rgba(100, 220, 255, 0.15)';
        matrixCtx.strokeStyle = 'rgba(150, 240, 255, 0.4)';
        matrixCtx.lineWidth = 1;
        matrixCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        matrixCtx.fill();
        matrixCtx.stroke();
    });
}

// Fantasy - Particules magiques avec glow (plus longues)
function drawMagicParticles() {
    if (particles.length < 40 && Math.random() > 0.85) {
        particles.push({
            x: Math.random() * matrixCanvas.width,
            y: Math.random() * matrixCanvas.height,
            size: Math.random() * 6 + 3,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            life: 1,
            hue: Math.random() * 60 + 260
        });
    }
    
    particles = particles.filter(p => p.life > 0);
    
    particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.003;
        
        matrixCtx.beginPath();
        matrixCtx.fillStyle = `hsla(${p.hue}, 80%, 70%, ${p.life * 0.6})`;
        matrixCtx.shadowBlur = 20;
        matrixCtx.shadowColor = `hsla(${p.hue}, 80%, 60%, 0.5)`;
        matrixCtx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        matrixCtx.fill();
        matrixCtx.shadowBlur = 0;
    });
}

// Bubblegum - Confettis et cœurs qui tombent
function drawPinkBubbles() {
    if (particles.length < 30 && Math.random() > 0.9) {
        particles.push({
            x: Math.random() * matrixCanvas.width,
            y: -20,
            size: Math.random() * 12 + 6,
            speed: Math.random() * 1.5 + 0.5,
            wobble: Math.random() * Math.PI * 2,
            rotation: Math.random() * Math.PI * 2,
            type: Math.random() > 0.5 ? 'heart' : 'confetti',
            color: `hsl(${Math.random() * 60 + 320}, 80%, 70%)`
        });
    }
    
    particles = particles.filter(p => p.y < matrixCanvas.height + 30);
    
    particles.forEach(p => {
        p.y += p.speed;
        p.wobble += 0.05;
        p.x += Math.sin(p.wobble) * 1.5;
        p.rotation += 0.03;
        
        matrixCtx.save();
        matrixCtx.translate(p.x, p.y);
        matrixCtx.rotate(p.rotation);
        matrixCtx.fillStyle = p.color;
        matrixCtx.globalAlpha = 0.6;
        
        if (p.type === 'heart') {
            // Dessiner un cœur
            matrixCtx.beginPath();
            matrixCtx.moveTo(0, p.size / 4);
            matrixCtx.bezierCurveTo(p.size / 2, -p.size / 2, p.size, p.size / 4, 0, p.size);
            matrixCtx.bezierCurveTo(-p.size, p.size / 4, -p.size / 2, -p.size / 2, 0, p.size / 4);
            matrixCtx.fill();
        } else {
            // Confetti rectangle
            matrixCtx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        }
        
        matrixCtx.globalAlpha = 1;
        matrixCtx.restore();
    });
}

// Forest - Feuilles d'automne avec vent
function drawLeaves() {
    const windTime = Date.now() / 1000;
    const wind = Math.sin(windTime * 0.5) * 2 + Math.sin(windTime * 1.3) * 1;
    
    if (particles.length < 25 && Math.random() > 0.92) {
        const colors = ['rgba(74, 222, 128, 0.5)', 'rgba(255, 180, 50, 0.5)', 'rgba(255, 100, 50, 0.5)', 'rgba(200, 80, 50, 0.5)', 'rgba(255, 220, 100, 0.5)'];
        particles.push({
            x: Math.random() * matrixCanvas.width,
            y: -30,
            rotation: Math.random() * Math.PI * 2,
            speed: Math.random() * 1 + 0.5,
            rotSpeed: (Math.random() - 0.5) * 0.1,
            wobble: Math.random() * Math.PI * 2,
            size: Math.random() * 10 + 8,
            color: colors[Math.floor(Math.random() * colors.length)]
        });
    }
    
    particles = particles.filter(p => p.y < matrixCanvas.height + 40);
    
    particles.forEach(p => {
        p.y += p.speed;
        p.wobble += 0.04;
        p.x += Math.sin(p.wobble) * 1.2 + wind;
        p.rotation += p.rotSpeed + wind * 0.02;
        
        matrixCtx.save();
        matrixCtx.translate(p.x, p.y);
        matrixCtx.rotate(p.rotation);
        matrixCtx.fillStyle = p.color;
        matrixCtx.beginPath();
        matrixCtx.ellipse(0, 0, p.size, p.size / 2.5, 0, 0, Math.PI * 2);
        matrixCtx.fill();
        matrixCtx.restore();
    });
}

// Sunset - Rayons de soleil + oiseaux qui volent
function drawSunsetGlow() {
    const time = Date.now() / 2000;
    
    // Soleil
    const sunX = matrixCanvas.width * 0.85;
    const sunY = matrixCanvas.height * 0.15;
    const gradient = matrixCtx.createRadialGradient(sunX, sunY, 0, sunX, sunY, 150);
    gradient.addColorStop(0, 'rgba(255, 200, 100, 0.3)');
    gradient.addColorStop(0.5, 'rgba(255, 150, 50, 0.15)');
    gradient.addColorStop(1, 'rgba(255, 100, 50, 0)');
    matrixCtx.fillStyle = gradient;
    matrixCtx.fillRect(0, 0, matrixCanvas.width, matrixCanvas.height);
    
    // Rayons
    matrixCtx.save();
    matrixCtx.translate(sunX, sunY);
    for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2 + time * 0.2;
        const length = 200 + Math.sin(time + i) * 50;
        matrixCtx.beginPath();
        matrixCtx.moveTo(0, 0);
        matrixCtx.lineTo(Math.cos(angle) * length, Math.sin(angle) * length);
        matrixCtx.strokeStyle = 'rgba(255, 180, 100, 0.1)';
        matrixCtx.lineWidth = 20;
        matrixCtx.stroke();
    }
    matrixCtx.restore();
    
    // Nuages qui passent doucement
    if (particles.length < 4 && Math.random() > 0.995) {
        particles.push({
            x: -200,
            y: Math.random() * matrixCanvas.height * 0.4 + 50,
            speed: Math.random() * 0.3 + 0.2,
            width: Math.random() * 150 + 100,
            height: Math.random() * 40 + 30
        });
    }
    
    particles = particles.filter(p => p.x < matrixCanvas.width + 250);
    
    particles.forEach(p => {
        p.x += p.speed;
        
        // Dessiner un nuage doux
        matrixCtx.fillStyle = 'rgba(255, 255, 255, 0.08)';
        matrixCtx.beginPath();
        matrixCtx.ellipse(p.x, p.y, p.width * 0.5, p.height * 0.5, 0, 0, Math.PI * 2);
        matrixCtx.fill();
        matrixCtx.beginPath();
        matrixCtx.ellipse(p.x - p.width * 0.3, p.y + 10, p.width * 0.35, p.height * 0.4, 0, 0, Math.PI * 2);
        matrixCtx.fill();
        matrixCtx.beginPath();
        matrixCtx.ellipse(p.x + p.width * 0.3, p.y + 5, p.width * 0.4, p.height * 0.45, 0, 0, Math.PI * 2);
        matrixCtx.fill();
    });
}

// Hacker - Grille avec courants électriques
function drawHackerGrid() {
    const time = Date.now() / 800;
    const pulse = 0.04 + Math.sin(time) * 0.02;
    
    // Grille de points
    matrixCtx.fillStyle = `rgba(255, 215, 0, ${pulse * 2})`;
    for (let x = 0; x < matrixCanvas.width; x += 60) {
        for (let y = 0; y < matrixCanvas.height; y += 60) {
            matrixCtx.beginPath();
            matrixCtx.arc(x, y, 2, 0, Math.PI * 2);
            matrixCtx.fill();
        }
    }
    
    // Courants électriques
    if (particles.length < 8 && Math.random() > 0.95) {
        const startX = Math.floor(Math.random() * (matrixCanvas.width / 60)) * 60;
        const startY = Math.floor(Math.random() * (matrixCanvas.height / 60)) * 60;
        particles.push({
            x: startX, y: startY,
            path: [{x: startX, y: startY}],
            color: Math.random() > 0.5 ? '#00bfff' : '#ff8c00',
            life: 1
        });
    }
    
    particles = particles.filter(p => p.life > 0);
    
    particles.forEach(p => {
        // Étendre le chemin
        if (p.path.length < 15 && Math.random() > 0.3) {
            const last = p.path[p.path.length - 1];
            const dirs = [[60,0],[-60,0],[0,60],[0,-60]];
            const dir = dirs[Math.floor(Math.random() * dirs.length)];
            const newX = Math.max(0, Math.min(matrixCanvas.width, last.x + dir[0]));
            const newY = Math.max(0, Math.min(matrixCanvas.height, last.y + dir[1]));
            p.path.push({x: newX, y: newY});
        }
        
        p.life -= 0.02;
        
        // Dessiner le courant
        matrixCtx.beginPath();
        matrixCtx.strokeStyle = p.color;
        matrixCtx.lineWidth = 3;
        matrixCtx.shadowBlur = 15;
        matrixCtx.shadowColor = p.color;
        matrixCtx.globalAlpha = p.life;
        matrixCtx.moveTo(p.path[0].x, p.path[0].y);
        p.path.forEach(pt => matrixCtx.lineTo(pt.x, pt.y));
        matrixCtx.stroke();
        matrixCtx.shadowBlur = 0;
        matrixCtx.globalAlpha = 1;
    });
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
    
    // Reset complet des particles pour le nouveau thème
    particles = [];
    particles.columns = null;
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

// === REPORTING PRO (avec IA + PDF) ===
generateSummaryBtn.addEventListener('click', generateSummary);

const downloadPdfBtn = document.getElementById('download-pdf');
let lastSummaryData = null;

downloadPdfBtn.addEventListener('click', downloadSummaryPDF);

// Calculer les métriques
function calculateMetrics() {
    const today = new Date().toDateString();
    const thisWeek = getWeekDates();
    
    const todoBubblesList = bubbles.filter(b => !b.done);
    const doneBubblesList = bubbles.filter(b => b.done);
    const completedToday = doneBubblesList.filter(b => b.completedAt && new Date(b.completedAt).toDateString() === today);
    const completedThisWeek = doneBubblesList.filter(b => b.completedAt && isInWeek(new Date(b.completedAt), thisWeek));
    const createdToday = bubbles.filter(b => new Date(b.createdAt).toDateString() === today);
    
    const todayEntries = journal.filter(e => new Date(e.date).toDateString() === today);
    
    // Répartition par projet
    const projectStats = {};
    bubbles.forEach(b => {
        const proj = b.project || 'Général';
        if (!projectStats[proj]) {
            projectStats[proj] = { total: 0, done: 0, pending: 0, urgent: 0 };
        }
        projectStats[proj].total++;
        if (b.done) {
            projectStats[proj].done++;
        } else {
            projectStats[proj].pending++;
            if (b.priority.level === 1) projectStats[proj].urgent++;
        }
    });
    
    // Répartition par priorité
    const priorityStats = {
        urgent: todoBubblesList.filter(b => b.priority.level === 1).length,
        normal: todoBubblesList.filter(b => b.priority.level === 2).length,
        low: todoBubblesList.filter(b => b.priority.level === 3).length
    };
    
    // Taux de complétion
    const totalTasks = bubbles.length;
    const completionRate = totalTasks > 0 ? Math.round((doneBubblesList.length / totalTasks) * 100) : 0;
    
    // Tâches par jour cette semaine
    const weeklyProgress = [];
    const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    for (let i = 0; i < 7; i++) {
        const date = new Date(thisWeek.start);
        date.setDate(date.getDate() + i);
        const dateStr = date.toDateString();
        const completed = doneBubblesList.filter(b => 
            b.completedAt && new Date(b.completedAt).toDateString() === dateStr
        ).length;
        const created = bubbles.filter(b => 
            new Date(b.createdAt).toDateString() === dateStr
        ).length;
        weeklyProgress.push({
            day: dayNames[date.getDay()],
            date: date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
            completed,
            created,
            isToday: dateStr === today
        });
    }
    
    return {
        today: {
            date: new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
            created: createdToday.length,
            completed: completedToday.length,
            pending: todoBubblesList.length,
            journalEntries: todayEntries.length
        },
        overall: {
            total: totalTasks,
            done: doneBubblesList.length,
            pending: todoBubblesList.length,
            completionRate
        },
        priority: priorityStats,
        projects: projectStats,
        weeklyProgress,
        journal: todayEntries,
        pendingTasks: todoBubblesList,
        completedTasks: completedToday,
        allCompletedTasks: doneBubblesList
    };
}

function getWeekDates() {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const start = new Date(now);
    start.setDate(now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)); // Lundi
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(start.getDate() + 6); // Dimanche
    end.setHours(23, 59, 59, 999);
    return { start, end };
}

function isInWeek(date, week) {
    return date >= week.start && date <= week.end;
}

async function generateSummary() {
    // Afficher le loading
    dailySummary.innerHTML = `<p style="color: var(--text-muted); font-style: italic;">🔮 Génération du rapport en cours...</p>`;
    dailySummary.classList.add('visible');
    downloadPdfBtn.style.display = 'none';
    
    // Calculer toutes les métriques
    const metrics = calculateMetrics();
    
    console.log('📊 Métriques calculées:', metrics);
    
    // Si aucune activité du tout
    if (metrics.overall.total === 0 && metrics.journal.length === 0) {
        dailySummary.innerHTML = `
            <h3>📊 Rapport du ${metrics.today.date}</h3>
            <p>Aucune activité enregistrée. Commence par ajouter des tâches !</p>
        `;
        return;
    }
    
    try {
        // Préparer le contexte détaillé pour l'IA
        const context = `
=== RAPPORT DE PRODUCTIVITÉ ===
Date: ${metrics.today.date}

📈 MÉTRIQUES DU JOUR:
- Tâches créées aujourd'hui: ${metrics.today.created}
- Tâches terminées aujourd'hui: ${metrics.today.completed}
- Tâches en attente: ${metrics.today.pending}
- Entrées journal: ${metrics.today.journalEntries}

📊 MÉTRIQUES GLOBALES:
- Total tâches: ${metrics.overall.total}
- Terminées: ${metrics.overall.done}
- En attente: ${metrics.overall.pending}
- Taux de complétion: ${metrics.overall.completionRate}%

🚨 PAR PRIORITÉ (en attente):
- Urgent: ${metrics.priority.urgent}
- Normal: ${metrics.priority.normal}
- Basse: ${metrics.priority.low}

📁 PAR PROJET:
${Object.entries(metrics.projects).map(([proj, stats]) => 
    `- ${proj}: ${stats.done}/${stats.total} (${stats.pending} en attente${stats.urgent > 0 ? `, ${stats.urgent} urgent(s)` : ''})`
).join('\n')}

📅 PROGRESSION SEMAINE:
${metrics.weeklyProgress.map(d => `- ${d.day} ${d.date}: ${d.completed} terminée(s), ${d.created} créée(s)${d.isToday ? ' (AUJOURD\'HUI)' : ''}`).join('\n')}

📝 JOURNAL DU JOUR:
${metrics.journal.map(e => `- ${e.time}: ${e.text}`).join('\n') || 'Aucune entrée'}

✅ TÂCHES TERMINÉES AUJOURD'HUI:
${metrics.completedTasks.map(b => `- ${b.text} (${b.project})`).join('\n') || 'Aucune'}

⏳ TÂCHES EN ATTENTE:
${metrics.pendingTasks.map(b => `- [${b.priority.label}] ${b.text} (${b.project})`).join('\n') || 'Aucune'}
        `.trim();
        
        const prompt = `Tu es un assistant de direction qui analyse la productivité. Génère une ANALYSE STRATÉGIQUE basée sur ces données.

FORMAT REQUIS (respecte exactement ces sections):

📋 SYNTHÈSE EXÉCUTIVE
(2-3 phrases résumant la journée/situation globale)

🎯 ACCOMPLISSEMENTS DU JOUR
(Liste à puces des réalisations concrètes basées sur le journal et tâches terminées)

⚠️ POINTS D'ATTENTION
(Tâches urgentes, retards potentiels, déséquilibres entre projets)

📊 ANALYSE PAR PROJET
(Pour chaque projet actif: statut, charge, recommandation)

💡 RECOMMANDATIONS
(3 actions prioritaires pour demain, basées sur les données)

📈 TENDANCE
(La productivité est-elle en hausse/baisse cette semaine ? Pourquoi ?)

Sois factuel, précis et orienté action. Pas de blabla, que du concret utile pour un dirigeant.`;

        // Appel au webhook chatbot
        const response = await fetch(CHATBOT_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: prompt,
                context: context,
                user: CURRENT_USER,
                type: 'report'
            })
        });
        
        const data = await response.text();
        
        // Parser la réponse
        let aiResponse = data;
        try {
            const jsonData = JSON.parse(data);
            aiResponse = jsonData.response || jsonData.text || jsonData.output || data;
        } catch (e) {
            // Pas du JSON, utiliser tel quel
        }
        
        // Nettoyer la réponse
        aiResponse = aiResponse.replace(/ACTION:(CREATE|DELETE|DONE|CLEAR_DONE)\|?[^\n]*/g, '').trim();
        
        // Stocker pour le PDF
        lastSummaryData = {
            date: metrics.today.date,
            dateShort: new Date().toLocaleDateString('fr-FR'),
            metrics: metrics,
            aiAnalysis: aiResponse,
            generatedAt: new Date().toISOString()
        };
        
        // Afficher le rapport
        displayReport(metrics, aiResponse);
        
        // Afficher le bouton PDF
        downloadPdfBtn.style.display = 'inline-block';
        
        // Sauvegarder dans l'historique
        history.push(lastSummaryData);
        localStorage.setItem('history', JSON.stringify(history));
        
    } catch (error) {
        console.error('Erreur rapport IA:', error);
        
        // Fallback sans IA
        lastSummaryData = {
            date: metrics.today.date,
            dateShort: new Date().toLocaleDateString('fr-FR'),
            metrics: metrics,
            aiAnalysis: null,
            generatedAt: new Date().toISOString()
        };
        
        displayReport(metrics, null);
        downloadPdfBtn.style.display = 'inline-block';
    }
}

function displayReport(metrics, aiAnalysis) {
    // Générer les barres de progression par projet
    const projectBars = Object.entries(metrics.projects).map(([proj, stats]) => {
        const percent = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;
        return `
            <div style="margin-bottom: 8px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
                    <span>${proj}</span>
                    <span>${stats.done}/${stats.total} (${percent}%)</span>
                </div>
                <div style="background: var(--bg-tertiary); border-radius: 10px; height: 8px; overflow: hidden;">
                    <div style="background: linear-gradient(90deg, var(--accent), var(--accent-light)); width: ${percent}%; height: 100%; border-radius: 10px;"></div>
                </div>
            </div>
        `;
    }).join('');
    
    // Générer la mini-chart de la semaine
    const maxDaily = Math.max(...metrics.weeklyProgress.map(d => Math.max(d.completed, d.created)), 1);
    const weekChart = metrics.weeklyProgress.map(d => {
        const completedHeight = (d.completed / maxDaily) * 40;
        const createdHeight = (d.created / maxDaily) * 40;
        return `
            <div style="display: flex; flex-direction: column; align-items: center; flex: 1;">
                <div style="display: flex; gap: 2px; align-items: flex-end; height: 45px;">
                    <div style="width: 8px; background: var(--success); border-radius: 2px; height: ${completedHeight}px;" title="Terminées: ${d.completed}"></div>
                    <div style="width: 8px; background: var(--accent); border-radius: 2px; height: ${createdHeight}px;" title="Créées: ${d.created}"></div>
                </div>
                <span style="font-size: 0.7rem; color: var(--text-muted); margin-top: 4px; ${d.isToday ? 'font-weight: bold; color: var(--accent);' : ''}">${d.day}</span>
            </div>
        `;
    }).join('');
    
    dailySummary.innerHTML = `
        <div style="margin-bottom: 20px;">
            <h3 style="margin-bottom: 5px;">📊 Rapport de Productivité</h3>
            <p style="color: var(--text-muted); font-size: 0.9rem;">${metrics.today.date}</p>
        </div>
        
        <!-- Métriques clés -->
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 20px;">
            <div style="background: var(--card-bg); padding: 12px; border-radius: 12px; text-align: center;">
                <div style="font-size: 1.5rem; font-weight: bold; color: var(--accent);">${metrics.today.completed}</div>
                <div style="font-size: 0.75rem; color: var(--text-muted);">Terminées aujourd'hui</div>
            </div>
            <div style="background: var(--card-bg); padding: 12px; border-radius: 12px; text-align: center;">
                <div style="font-size: 1.5rem; font-weight: bold; color: var(--text);">${metrics.overall.pending}</div>
                <div style="font-size: 0.75rem; color: var(--text-muted);">En attente</div>
            </div>
            <div style="background: var(--card-bg); padding: 12px; border-radius: 12px; text-align: center;">
                <div style="font-size: 1.5rem; font-weight: bold; color: ${metrics.priority.urgent > 0 ? 'var(--danger)' : 'var(--success)'};">${metrics.priority.urgent}</div>
                <div style="font-size: 0.75rem; color: var(--text-muted);">Urgentes</div>
            </div>
            <div style="background: var(--card-bg); padding: 12px; border-radius: 12px; text-align: center;">
                <div style="font-size: 1.5rem; font-weight: bold; color: var(--success);">${metrics.overall.completionRate}%</div>
                <div style="font-size: 0.75rem; color: var(--text-muted);">Complétion</div>
            </div>
        </div>
        
        <!-- Progression semaine -->
        <div style="background: var(--card-bg); padding: 15px; border-radius: 12px; margin-bottom: 20px;">
            <h4 style="margin-bottom: 10px; font-size: 0.9rem;">📅 Cette semaine</h4>
            <div style="display: flex; justify-content: space-between;">
                ${weekChart}
            </div>
            <div style="display: flex; gap: 15px; margin-top: 10px; font-size: 0.75rem; color: var(--text-muted);">
                <span><span style="display: inline-block; width: 10px; height: 10px; background: var(--success); border-radius: 2px; margin-right: 5px;"></span>Terminées</span>
                <span><span style="display: inline-block; width: 10px; height: 10px; background: var(--accent); border-radius: 2px; margin-right: 5px;"></span>Créées</span>
            </div>
        </div>
        
        <!-- Progression par projet -->
        <div style="background: var(--card-bg); padding: 15px; border-radius: 12px; margin-bottom: 20px;">
            <h4 style="margin-bottom: 12px; font-size: 0.9rem;">📁 Par projet</h4>
            ${projectBars || '<p style="color: var(--text-muted);">Aucun projet</p>'}
        </div>
        
        <!-- Analyse IA -->
        ${aiAnalysis ? `
            <div style="background: var(--card-bg); padding: 15px; border-radius: 12px; border-left: 3px solid var(--accent);">
                <h4 style="margin-bottom: 12px; font-size: 0.9rem;">🔮 Analyse IA</h4>
                <div style="white-space: pre-wrap; line-height: 1.7; font-size: 0.9rem;">${escapeHtml(aiAnalysis)}</div>
            </div>
        ` : `
            <div style="background: var(--card-bg); padding: 15px; border-radius: 12px;">
                <p style="color: var(--text-muted);">⚠️ Analyse IA non disponible</p>
            </div>
        `}
    `;
}

// === TÉLÉCHARGER LE RAPPORT EN PDF PRO ===
function downloadSummaryPDF() {
    if (!lastSummaryData) {
        alert('Génère d\'abord un rapport !');
        return;
    }
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const metrics = lastSummaryData.metrics;
    
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const maxWidth = pageWidth - margin * 2;
    let y = 20;
    
    // === PAGE 1: EN-TÊTE ET MÉTRIQUES ===
    
    // Titre principal
    doc.setFillColor(224, 120, 64); // Orange accent
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('RAPPORT DE PRODUCTIVITÉ', pageWidth / 2, 18, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(lastSummaryData.date, pageWidth / 2, 30, { align: 'center' });
    
    y = 55;
    doc.setTextColor(0, 0, 0);
    
    // Métriques clés - Boîtes
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('MÉTRIQUES CLÉS', margin, y);
    y += 10;
    
    const boxWidth = (maxWidth - 15) / 4;
    const boxHeight = 25;
    const boxes = [
        { label: 'Terminées\naujourd\'hui', value: metrics.today.completed, color: [45, 138, 78] },
        { label: 'En attente', value: metrics.overall.pending, color: [100, 100, 100] },
        { label: 'Urgentes', value: metrics.priority.urgent, color: metrics.priority.urgent > 0 ? [199, 80, 80] : [45, 138, 78] },
        { label: 'Complétion', value: metrics.overall.completionRate + '%', color: [45, 138, 78] }
    ];
    
    boxes.forEach((box, i) => {
        const x = margin + i * (boxWidth + 5);
        doc.setFillColor(...box.color);
        doc.roundedRect(x, y, boxWidth, boxHeight, 3, 3, 'F');
        
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text(String(box.value), x + boxWidth / 2, y + 10, { align: 'center' });
        
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        const labelLines = box.label.split('\n');
        labelLines.forEach((line, li) => {
            doc.text(line, x + boxWidth / 2, y + 16 + li * 4, { align: 'center' });
        });
    });
    
    y += boxHeight + 15;
    doc.setTextColor(0, 0, 0);
    
    // Progression par projet
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('PROGRESSION PAR PROJET', margin, y);
    y += 8;
    
    Object.entries(metrics.projects).forEach(([proj, stats]) => {
        const percent = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`${proj}`, margin, y);
        doc.text(`${stats.done}/${stats.total} (${percent}%)`, pageWidth - margin, y, { align: 'right' });
        
        y += 4;
        
        // Barre de progression
        doc.setFillColor(230, 230, 230);
        doc.roundedRect(margin, y, maxWidth, 5, 2, 2, 'F');
        
        if (percent > 0) {
            doc.setFillColor(224, 120, 64);
            doc.roundedRect(margin, y, maxWidth * (percent / 100), 5, 2, 2, 'F');
        }
        
        y += 10;
    });
    
    y += 5;
    
    // Progression de la semaine
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('PROGRESSION DE LA SEMAINE', margin, y);
    y += 10;
    
    const chartX = margin;
    const chartWidth = maxWidth;
    const chartHeight = 35;
    const barWidth = chartWidth / 7 - 8;
    const maxVal = Math.max(...metrics.weeklyProgress.map(d => Math.max(d.completed, d.created)), 1);
    
    metrics.weeklyProgress.forEach((d, i) => {
        const x = chartX + i * (chartWidth / 7) + 4;
        const completedH = (d.completed / maxVal) * chartHeight;
        const createdH = (d.created / maxVal) * chartHeight;
        
        // Barre terminées (vert)
        doc.setFillColor(45, 138, 78);
        doc.rect(x, y + chartHeight - completedH, barWidth / 2 - 1, completedH, 'F');
        
        // Barre créées (orange)
        doc.setFillColor(224, 120, 64);
        doc.rect(x + barWidth / 2, y + chartHeight - createdH, barWidth / 2 - 1, createdH, 'F');
        
        // Label jour
        doc.setFontSize(8);
        doc.setTextColor(d.isToday ? 224 : 100, d.isToday ? 120 : 100, d.isToday ? 64 : 100);
        doc.text(d.day, x + barWidth / 2, y + chartHeight + 8, { align: 'center' });
    });
    
    y += chartHeight + 15;
    
    // Légende
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.setFillColor(45, 138, 78);
    doc.rect(margin, y, 8, 4, 'F');
    doc.text('Terminées', margin + 12, y + 3);
    doc.setFillColor(224, 120, 64);
    doc.rect(margin + 50, y, 8, 4, 'F');
    doc.text('Créées', margin + 62, y + 3);
    
    y += 15;
    doc.setTextColor(0, 0, 0);
    
    // === JOURNAL DU JOUR ===
    if (metrics.journal && metrics.journal.length > 0) {
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('JOURNAL DU JOUR', margin, y);
        y += 8;
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        
        metrics.journal.forEach(entry => {
            if (y > pageHeight - 30) {
                doc.addPage();
                y = 20;
            }
            
            const text = `${entry.time} - ${entry.text}`;
            const lines = doc.splitTextToSize(text, maxWidth - 10);
            
            doc.setFillColor(245, 245, 245);
            doc.roundedRect(margin, y - 3, maxWidth, lines.length * 5 + 4, 2, 2, 'F');
            
            doc.text(lines, margin + 5, y + 2);
            y += lines.length * 5 + 8;
        });
        
        y += 5;
    }
    
    // === TÂCHES EN ATTENTE ===
    if (metrics.pendingTasks && metrics.pendingTasks.length > 0) {
        if (y > pageHeight - 50) {
            doc.addPage();
            y = 20;
        }
        
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('TÂCHES EN ATTENTE', margin, y);
        y += 8;
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        
        metrics.pendingTasks.forEach(task => {
            if (y > pageHeight - 20) {
                doc.addPage();
                y = 20;
            }
            
            // Badge priorité
            const priorityColors = {
                'Urgent': [199, 80, 80],
                'Normal': [100, 100, 100],
                'Basse': [150, 150, 150]
            };
            const pColor = priorityColors[task.priority.label] || [100, 100, 100];
            
            doc.setFillColor(...pColor);
            doc.roundedRect(margin, y - 3, 35, 6, 2, 2, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(7);
            doc.text(task.priority.label.toUpperCase(), margin + 17.5, y + 1, { align: 'center' });
            
            doc.setTextColor(0, 0, 0);
            doc.setFontSize(10);
            const taskLines = doc.splitTextToSize(task.text, maxWidth - 45);
            doc.text(taskLines, margin + 40, y);
            
            doc.setTextColor(150, 150, 150);
            doc.setFontSize(8);
            doc.text(`[${task.project}]`, pageWidth - margin, y, { align: 'right' });
            
            doc.setTextColor(0, 0, 0);
            y += taskLines.length * 5 + 6;
        });
        
        y += 5;
    }
    
    // === ANALYSE IA ===
    if (lastSummaryData.aiAnalysis) {
        if (y > pageHeight - 80) {
            doc.addPage();
            y = 20;
        }
        
        doc.setFillColor(255, 248, 240);
        doc.roundedRect(margin - 5, y - 5, maxWidth + 10, 15, 3, 3, 'F');
        
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(224, 120, 64);
        doc.text('ANALYSE & RECOMMANDATIONS IA', margin, y + 5);
        y += 18;
        
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        
        const aiLines = doc.splitTextToSize(lastSummaryData.aiAnalysis, maxWidth);
        aiLines.forEach(line => {
            if (y > pageHeight - 15) {
                doc.addPage();
                y = 20;
            }
            doc.text(line, margin, y);
            y += 5;
        });
    }
    
    // === FOOTER SUR TOUTES LES PAGES ===
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        
        // Ligne de séparation
        doc.setDrawColor(200, 200, 200);
        doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);
        
        // Texte footer
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(`ProductiveApp - Rapport généré le ${new Date().toLocaleString('fr-FR')}`, margin, pageHeight - 8);
        doc.text(`Page ${i}/${pageCount}`, pageWidth - margin, pageHeight - 8, { align: 'right' });
    }
    
    // Télécharger
    const fileName = `rapport_productivite_${lastSummaryData.dateShort.replace(/\//g, '-')}.pdf`;
    doc.save(fileName);
    
    console.log('📄 PDF généré:', fileName);
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
const chatbotSizeToggle = document.getElementById('chatbot-size-toggle');
const expandIcon = document.getElementById('expand-icon');
const collapseIcon = document.getElementById('collapse-icon');

// État du mode large (sauvegardé dans localStorage)
let isLargeMode = localStorage.getItem('chatbot-large-mode') === 'true';

// Appliquer la taille sauvegardée du chatbot
function applyChatbotSize() {
    if (isLargeMode) {
        chatbotWindow.classList.add('large-mode');
        expandIcon.style.display = 'none';
        collapseIcon.style.display = 'block';
    } else {
        chatbotWindow.classList.remove('large-mode');
        expandIcon.style.display = 'block';
        collapseIcon.style.display = 'none';
    }
}

// Toggle entre petit et grand mode
function toggleChatbotSize() {
    isLargeMode = !isLargeMode;
    localStorage.setItem('chatbot-large-mode', isLargeMode);
    applyChatbotSize();
}

// Event listener pour le bouton de taille
chatbotSizeToggle.addEventListener('click', toggleChatbotSize);

// Toggle chatbot (ouvrir/fermer)
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
        const todoBubblesList = bubbles.filter(b => !b.done);
        const doneBubblesList = bubbles.filter(b => b.done);
        
        const context = `
UTILISATEUR: ${CURRENT_USER}
TÂCHES À FAIRE (${todoBubblesList.length}):
${todoBubblesList.map(b => `- "${b.text}" | Priorité: ${b.priority.label} | Projet: ${b.project}`).join('\n') || 'Aucune'}

TÂCHES TERMINÉES (${doneBubblesList.length}):
${doneBubblesList.slice(0, 10).map(b => `- "${b.text}" | Projet: ${b.project}`).join('\n') || 'Aucune'}
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
        
        // === ACTIONS DE L'IA ===
        // L'IA peut : créer, supprimer, modifier des tâches
        
        // ACTION:CREATE|texte de la tâche
        if (aiResponse.includes('ACTION:CREATE|')) {
            const matches = aiResponse.matchAll(/ACTION:CREATE\|([^\n]+)/g);
            for (const match of matches) {
                const taskText = match[1].trim();
                if (taskText) {
                    createBubbleFromAI({ text: taskText });
                    console.log('Tâche créée:', taskText);
                }
            }
            aiResponse = aiResponse.replace(/ACTION:CREATE\|[^\n]+/g, '').trim();
            aiResponse += '\n\n✅ Tâche(s) créée(s) !';
        }
        
        // ACTION:DELETE|texte exact ou partiel de la tâche à supprimer
        if (aiResponse.includes('ACTION:DELETE|')) {
            const matches = aiResponse.matchAll(/ACTION:DELETE\|([^\n]+)/g);
            let deletedCount = 0;
            for (const match of matches) {
                const searchText = match[1].trim().toLowerCase();
                if (searchText) {
                    const bubbleIndex = bubbles.findIndex(b => 
                        !b.done && b.text.toLowerCase().includes(searchText)
                    );
                    if (bubbleIndex !== -1) {
                        const deleted = bubbles.splice(bubbleIndex, 1)[0];
                        console.log('Tâche supprimée:', deleted.text);
                        deletedCount++;
                    }
                }
            }
            if (deletedCount > 0) {
                saveBubbles();
                renderBubbles();
                aiResponse = aiResponse.replace(/ACTION:DELETE\|[^\n]+/g, '').trim();
                aiResponse += `\n\n🗑️ ${deletedCount} tâche(s) supprimée(s) !`;
            }
        }
        
        // ACTION:DONE|texte exact ou partiel de la tâche à marquer comme terminée
        if (aiResponse.includes('ACTION:DONE|')) {
            const matches = aiResponse.matchAll(/ACTION:DONE\|([^\n]+)/g);
            let doneCount = 0;
            for (const match of matches) {
                const searchText = match[1].trim().toLowerCase();
                if (searchText) {
                    const bubble = bubbles.find(b => 
                        !b.done && b.text.toLowerCase().includes(searchText)
                    );
                    if (bubble) {
                        bubble.done = true;
                        bubble.completedAt = new Date().toISOString();
                        addJournalEntry(`✓ Terminé: ${bubble.text}`);
                        console.log('Tâche terminée:', bubble.text);
                        doneCount++;
                    }
                }
            }
            if (doneCount > 0) {
                saveBubbles();
                renderBubbles();
                aiResponse = aiResponse.replace(/ACTION:DONE\|[^\n]+/g, '').trim();
                aiResponse += `\n\n✅ ${doneCount} tâche(s) marquée(s) comme terminée(s) !`;
            }
        }
        
        // ACTION:CLEAR_DONE - Vider toutes les tâches terminées
        if (aiResponse.includes('ACTION:CLEAR_DONE')) {
            const beforeCount = bubbles.length;
            bubbles = bubbles.filter(b => !b.done);
            const deletedCount = beforeCount - bubbles.length;
            if (deletedCount > 0) {
                saveBubbles();
                renderBubbles();
                console.log('Tâches terminées supprimées:', deletedCount);
            }
            aiResponse = aiResponse.replace(/ACTION:CLEAR_DONE/g, '').trim();
            aiResponse += `\n\n🧹 ${deletedCount} tâche(s) terminée(s) supprimée(s) !`;
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

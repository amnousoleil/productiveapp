// === ANIMATIONS CANVAS ===
// Effets visuels subtils en arrière-plan

const matrixCanvas = document.getElementById('matrix-bg');
const matrixCtx = matrixCanvas ? matrixCanvas.getContext('2d') : null;
let particles = [];
let matrixDrops = [];
let animationRunning = false;

function initAnimation() {
    if (!matrixCanvas || !matrixCtx) {
        console.warn('Canvas not found');
        return;
    }
    
    matrixCanvas.width = window.innerWidth;
    matrixCanvas.height = window.innerHeight;
    
    const columns = Math.floor(matrixCanvas.width / 25);
    matrixDrops = [];
    for (let i = 0; i < columns; i++) {
        matrixDrops[i] = Math.random() * -50;
    }
    
    particles = [];
    
    if (!animationRunning) {
        animationRunning = true;
        requestAnimationFrame(animateCanvas);
    }
    
    console.log('✨ Animations initialized');
}

function animateCanvas() {
    if (!matrixCtx) return;
    
    const theme = document.documentElement.getAttribute('data-theme') || 'desert';
    
    if (matrixCanvas.width !== window.innerWidth || matrixCanvas.height !== window.innerHeight) {
        matrixCanvas.width = window.innerWidth;
        matrixCanvas.height = window.innerHeight;
        const columns = Math.floor(matrixCanvas.width / 25);
        matrixDrops = [];
        for (let i = 0; i < columns; i++) {
            matrixDrops[i] = Math.random() * -50;
        }
    }
    
    // Clear
    if (theme === 'hacker' || theme === 'matrix') {
        matrixCtx.fillStyle = theme === 'hacker' ? 'rgba(0, 0, 0, 0.05)' : 'rgba(10, 15, 10, 0.05)';
        matrixCtx.fillRect(0, 0, matrixCanvas.width, matrixCanvas.height);
    } else {
        matrixCtx.clearRect(0, 0, matrixCanvas.width, matrixCanvas.height);
    }
    
    switch(theme) {
        case 'hacker': animateHacker(); break;
        case 'matrix': animateMatrix(); break;
        case 'ocean': animateOcean(); break;
        case 'fantasy': animateFantasy(); break;
        case 'sunset': animateSunset(); break;
        case 'forest': animateForest(); break;
        case 'bubblegum': animateBubblegum(); break;
        case 'midnight': animateMidnight(); break;
        default: animateDesert(); break;
    }
    
    requestAnimationFrame(animateCanvas);
}

// === HACKER - Subtil, lent, élégant ===
function animateHacker() {
    matrixCtx.font = '16px monospace';
    
    const chars = '01<>{}';
    const columns = Math.floor(matrixCanvas.width / 40); // Moins de colonnes
    
    for (let i = 0; i < columns; i++) {
        if (matrixDrops[i] === undefined) matrixDrops[i] = Math.random() * -20;
        
        const char = chars[Math.floor(Math.random() * chars.length)];
        const x = i * 40;
        const y = matrixDrops[i] * 25;
        
        // Plus subtil
        matrixCtx.globalAlpha = 0.4;
        matrixCtx.shadowBlur = 8;
        matrixCtx.shadowColor = '#ffd700';
        matrixCtx.fillStyle = '#ffd700';
        matrixCtx.fillText(char, x, y);
        matrixCtx.shadowBlur = 0;
        matrixCtx.globalAlpha = 1;
        
        if (y > matrixCanvas.height && Math.random() > 0.995) {
            matrixDrops[i] = 0;
        }
        matrixDrops[i] += 0.15; // Plus lent
    }
}

// === MATRIX - Code vert subtil ===
function animateMatrix() {
    matrixCtx.font = '14px monospace';
    
    const chars = 'アイウエオ01';
    const columns = Math.floor(matrixCanvas.width / 30);
    
    for (let i = 0; i < columns; i++) {
        if (matrixDrops[i] === undefined) matrixDrops[i] = Math.random() * -20;
        
        const char = chars[Math.floor(Math.random() * chars.length)];
        const x = i * 30;
        const y = matrixDrops[i] * 22;
        
        matrixCtx.globalAlpha = 0.5;
        matrixCtx.shadowBlur = 10;
        matrixCtx.shadowColor = '#00ff66';
        matrixCtx.fillStyle = '#00ff66';
        matrixCtx.fillText(char, x, y);
        matrixCtx.shadowBlur = 0;
        matrixCtx.globalAlpha = 1;
        
        if (y > matrixCanvas.height && Math.random() > 0.99) {
            matrixDrops[i] = 0;
        }
        matrixDrops[i] += 0.2;
    }
}

// === OCEAN - Bulles douces ===
function animateOcean() {
    if (particles.length < 15 && Math.random() > 0.97) {
        particles.push({
            x: Math.random() * matrixCanvas.width,
            y: matrixCanvas.height + 10,
            size: Math.random() * 5 + 2,
            speed: Math.random() * 0.5 + 0.3,
            wobble: Math.random() * Math.PI * 2
        });
    }
    
    particles = particles.filter(p => p.y > -20);
    
    particles.forEach(p => {
        p.y -= p.speed;
        p.wobble += 0.02;
        p.x += Math.sin(p.wobble) * 0.5;
        
        matrixCtx.globalAlpha = 0.4;
        matrixCtx.beginPath();
        matrixCtx.arc(p.x, p.y, Math.max(0.5, p.size), 0, Math.PI * 2);
        matrixCtx.strokeStyle = 'rgba(0, 180, 216, 0.6)';
        matrixCtx.lineWidth = 1;
        matrixCtx.stroke();
        
        // Reflet
        matrixCtx.beginPath();
        matrixCtx.arc(p.x - p.size * 0.3, p.y - p.size * 0.3, Math.max(0.2, p.size * 0.2), 0, Math.PI * 2);
        matrixCtx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        matrixCtx.fill();
        matrixCtx.globalAlpha = 1;
    });
}

// === FANTASY - Étoiles magiques ===
function animateFantasy() {
    if (particles.length < 25 && Math.random() > 0.95) {
        particles.push({
            x: Math.random() * matrixCanvas.width,
            y: Math.random() * matrixCanvas.height,
            size: Math.random() * 2 + 1,
            life: 1,
            twinkleOffset: Math.random() * Math.PI * 2,
            color: Math.random() > 0.5 ? '#bf6bff' : '#ff6bda'
        });
    }
    
    particles = particles.filter(p => p.life > 0.05);
    
    particles.forEach(p => {
        p.life -= 0.005;
        const twinkle = (Math.sin(Date.now() * 0.003 + p.twinkleOffset) + 1) / 2;
        
        matrixCtx.globalAlpha = twinkle * p.life * 0.6;
        matrixCtx.shadowBlur = 10;
        matrixCtx.shadowColor = p.color;
        matrixCtx.fillStyle = p.color;
        
        matrixCtx.beginPath();
        matrixCtx.arc(p.x, p.y, Math.max(0.5, p.size * twinkle), 0, Math.PI * 2);
        matrixCtx.fill();
        
        matrixCtx.globalAlpha = 1;
        matrixCtx.shadowBlur = 0;
    });
}

// === SUNSET - Particules chaudes ===
function animateSunset() {
    if (particles.length < 20 && Math.random() > 0.96) {
        particles.push({
            x: Math.random() * matrixCanvas.width,
            y: matrixCanvas.height + 5,
            size: Math.random() * 3 + 1,
            speed: Math.random() * 0.4 + 0.2,
            life: 1,
            drift: (Math.random() - 0.5) * 0.3,
            color: ['#f97316', '#fbbf24', '#ef4444'][Math.floor(Math.random() * 3)]
        });
    }
    
    particles = particles.filter(p => p.life > 0.1 && p.y > -10);
    
    particles.forEach(p => {
        p.y -= p.speed;
        p.x += p.drift;
        p.life -= 0.003;
        
        matrixCtx.globalAlpha = p.life * 0.5;
        matrixCtx.beginPath();
        matrixCtx.fillStyle = p.color;
        matrixCtx.shadowBlur = 5;
        matrixCtx.shadowColor = p.color;
        matrixCtx.arc(p.x, p.y, Math.max(0.5, p.size), 0, Math.PI * 2);
        matrixCtx.fill();
        matrixCtx.globalAlpha = 1;
        matrixCtx.shadowBlur = 0;
    });
}

// === FOREST - Feuilles d'automne qui tombent ===
function animateForest() {
    if (particles.length < 15 && Math.random() > 0.98) {
        // Couleurs d'automne : vert, jaune, orange, rouge
        const autumnColors = ['#4ade80', '#86efac', '#fbbf24', '#f97316', '#ef4444', '#dc2626'];
        particles.push({
            x: Math.random() * matrixCanvas.width,
            y: -10,
            size: Math.random() * 6 + 4,
            speed: Math.random() * 0.5 + 0.3,
            drift: Math.random() * 2 - 1,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.03,
            color: autumnColors[Math.floor(Math.random() * autumnColors.length)]
        });
    }
    
    particles = particles.filter(p => p.y < matrixCanvas.height + 20);
    
    particles.forEach(p => {
        p.y += p.speed;
        p.x += Math.sin(p.y * 0.015) * p.drift;
        p.rotation += p.rotationSpeed;
        
        matrixCtx.save();
        matrixCtx.translate(p.x, p.y);
        matrixCtx.rotate(p.rotation);
        
        matrixCtx.globalAlpha = 0.7;
        matrixCtx.beginPath();
        // Forme de feuille
        matrixCtx.ellipse(0, 0, p.size, p.size * 0.5, 0, 0, Math.PI * 2);
        matrixCtx.fillStyle = p.color;
        matrixCtx.fill();
        matrixCtx.globalAlpha = 1;
        
        matrixCtx.restore();
    });
}

// === BUBBLEGUM - Bulles roses ===
function animateBubblegum() {
    if (particles.length < 20 && Math.random() > 0.96) {
        particles.push({
            x: Math.random() * matrixCanvas.width,
            y: matrixCanvas.height + 10,
            size: Math.random() * 6 + 3,
            speed: Math.random() * 0.5 + 0.2,
            wobble: Math.random() * Math.PI * 2,
            color: ['#ff6b9d', '#ff9ec4', '#ffc0d0'][Math.floor(Math.random() * 3)]
        });
    }
    
    particles = particles.filter(p => p.y > -20);
    
    particles.forEach(p => {
        p.y -= p.speed;
        p.wobble += 0.015;
        p.x += Math.sin(p.wobble) * 0.4;
        
        matrixCtx.globalAlpha = 0.4;
        matrixCtx.beginPath();
        matrixCtx.arc(p.x, p.y, Math.max(0.5, p.size), 0, Math.PI * 2);
        matrixCtx.fillStyle = p.color;
        matrixCtx.fill();
        
        matrixCtx.beginPath();
        matrixCtx.arc(p.x, p.y, Math.max(0.5, p.size), 0, Math.PI * 2);
        matrixCtx.strokeStyle = p.color;
        matrixCtx.lineWidth = 1;
        matrixCtx.stroke();
        
        // Reflet
        matrixCtx.beginPath();
        matrixCtx.arc(p.x - p.size * 0.25, p.y - p.size * 0.25, Math.max(0.2, p.size * 0.15), 0, Math.PI * 2);
        matrixCtx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        matrixCtx.fill();
        matrixCtx.globalAlpha = 1;
    });
}

// === MIDNIGHT - Étoiles et étoiles filantes ===
function animateMidnight() {
    if (particles.length < 40 && Math.random() > 0.92) {
        particles.push({
            x: Math.random() * matrixCanvas.width,
            y: Math.random() * matrixCanvas.height,
            size: Math.random() * 1.5 + 0.5,
            life: 1,
            twinkle: Math.random() * Math.PI * 2
        });
    }
    
    // Étoile filante rare
    if (Math.random() > 0.997) {
        const startX = Math.random() * matrixCanvas.width;
        const startY = Math.random() * matrixCanvas.height * 0.4;
        matrixCtx.beginPath();
        matrixCtx.moveTo(startX, startY);
        matrixCtx.lineTo(startX + 60, startY + 30);
        
        const gradient = matrixCtx.createLinearGradient(startX, startY, startX + 60, startY + 30);
        gradient.addColorStop(0, 'rgba(108, 143, 255, 0.7)');
        gradient.addColorStop(1, 'transparent');
        matrixCtx.strokeStyle = gradient;
        matrixCtx.lineWidth = 2;
        matrixCtx.stroke();
    }
    
    particles = particles.filter(p => p.life > 0.05);
    
    particles.forEach(p => {
        p.life -= 0.002;
        p.twinkle += 0.03;
        const brightness = (Math.sin(p.twinkle) + 1) / 2;
        
        matrixCtx.globalAlpha = p.life * brightness * 0.7;
        matrixCtx.beginPath();
        matrixCtx.arc(p.x, p.y, Math.max(0.3, p.size * brightness), 0, Math.PI * 2);
        matrixCtx.fillStyle = '#6c8fff';
        matrixCtx.fill();
        matrixCtx.globalAlpha = 1;
    });
}

// === DESERT - Grains de sable doux ===
function animateDesert() {
    if (particles.length < 25 && Math.random() > 0.95) {
        particles.push({
            x: Math.random() * matrixCanvas.width,
            y: Math.random() * matrixCanvas.height,
            size: Math.random() * 2 + 1,
            vx: (Math.random() - 0.5) * 0.2,
            vy: (Math.random() - 0.5) * 0.2,
            life: 1
        });
    }
    
    particles = particles.filter(p => p.life > 0.05);
    
    particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.003;
        
        const radius = Math.max(0.3, p.size * p.life);
        matrixCtx.globalAlpha = p.life * 0.4;
        matrixCtx.beginPath();
        matrixCtx.fillStyle = '#e07840';
        matrixCtx.arc(p.x, p.y, radius, 0, Math.PI * 2);
        matrixCtx.fill();
        matrixCtx.globalAlpha = 1;
    });
}

// === Reset pour changement de thème ===
function resetAnimationForTheme() {
    particles = [];
    const columns = Math.floor(window.innerWidth / 25);
    matrixDrops = [];
    for (let i = 0; i < columns; i++) {
        matrixDrops[i] = Math.random() * -50;
    }
    if (matrixCtx) {
        matrixCtx.clearRect(0, 0, matrixCanvas.width, matrixCanvas.height);
    }
}

window.addEventListener('resize', () => {
    if (matrixCanvas) {
        matrixCanvas.width = window.innerWidth;
        matrixCanvas.height = window.innerHeight;
        resetAnimationForTheme();
    }
});

console.log('✨ animations.js loaded');

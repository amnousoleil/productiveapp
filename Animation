// === ANIMATIONS CANVAS ===
// Fichier séparé pour les effets visuels

const matrixCanvas = document.getElementById('matrix-bg');
const matrixCtx = matrixCanvas ? matrixCanvas.getContext('2d') : null;
let particles = [];
let matrixDrops = [];
let animationRunning = false;

function initAnimation() {
    if (!matrixCanvas || !matrixCtx) {
        console.warn('Canvas not found, skipping animations');
        return;
    }
    
    matrixCanvas.width = window.innerWidth;
    matrixCanvas.height = window.innerHeight;
    
    // Init matrix drops
    const columns = Math.floor(matrixCanvas.width / 20);
    matrixDrops = [];
    for (let i = 0; i < columns; i++) {
        matrixDrops[i] = Math.random() * -100;
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
    
    // Resize si nécessaire
    if (matrixCanvas.width !== window.innerWidth || matrixCanvas.height !== window.innerHeight) {
        matrixCanvas.width = window.innerWidth;
        matrixCanvas.height = window.innerHeight;
        
        // Réinit les drops
        const columns = Math.floor(matrixCanvas.width / 20);
        matrixDrops = [];
        for (let i = 0; i < columns; i++) {
            matrixDrops[i] = Math.random() * -100;
        }
    }
    
    // Clear selon le thème
    if (theme === 'hacker') {
        matrixCtx.fillStyle = 'rgba(0, 0, 0, 0.08)';
        matrixCtx.fillRect(0, 0, matrixCanvas.width, matrixCanvas.height);
    } else if (theme === 'matrix') {
        matrixCtx.fillStyle = 'rgba(10, 15, 10, 0.08)';
        matrixCtx.fillRect(0, 0, matrixCanvas.width, matrixCanvas.height);
    } else {
        matrixCtx.clearRect(0, 0, matrixCanvas.width, matrixCanvas.height);
    }
    
    // Animer selon le thème
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

// === HACKER - Pluie de code doré ===
function animateHacker() {
    matrixCtx.font = '14px monospace';
    matrixCtx.fillStyle = '#ffd700';
    
    const chars = '01$€£¥₿<>{}[]=/\\|アイウエオカキク';
    const columns = Math.floor(matrixCanvas.width / 20);
    
    for (let i = 0; i < columns; i++) {
        if (matrixDrops[i] === undefined) matrixDrops[i] = Math.random() * -50;
        
        const char = chars[Math.floor(Math.random() * chars.length)];
        const x = i * 20;
        const y = matrixDrops[i] * 20;
        
        matrixCtx.shadowBlur = 15;
        matrixCtx.shadowColor = '#ffd700';
        matrixCtx.fillText(char, x, y);
        matrixCtx.shadowBlur = 0;
        
        if (y > matrixCanvas.height && Math.random() > 0.98) {
            matrixDrops[i] = 0;
        }
        matrixDrops[i] += 0.5;
    }
    
    // Glitch lines
    if (Math.random() > 0.97) {
        const y = Math.random() * matrixCanvas.height;
        matrixCtx.fillStyle = 'rgba(255, 215, 0, 0.2)';
        matrixCtx.fillRect(0, y, matrixCanvas.width, 2);
    }
}

// === MATRIX - Code vert ===
function animateMatrix() {
    matrixCtx.font = '15px monospace';
    matrixCtx.fillStyle = '#00ff66';
    
    const chars = 'アイウエオカキクケコサシスセソ0123456789ABCDEF';
    const columns = Math.floor(matrixCanvas.width / 18);
    
    for (let i = 0; i < columns; i++) {
        if (matrixDrops[i] === undefined) matrixDrops[i] = Math.random() * -30;
        
        const char = chars[Math.floor(Math.random() * chars.length)];
        const x = i * 18;
        const y = matrixDrops[i] * 18;
        
        matrixCtx.shadowBlur = 12;
        matrixCtx.shadowColor = '#00ff66';
        matrixCtx.fillText(char, x, y);
        matrixCtx.shadowBlur = 0;
        
        if (y > matrixCanvas.height && Math.random() > 0.975) {
            matrixDrops[i] = 0;
        }
        matrixDrops[i] += 0.6;
    }
}

// === OCEAN - Bulles ===
function animateOcean() {
    if (particles.length < 25 && Math.random() > 0.96) {
        particles.push({
            x: Math.random() * matrixCanvas.width,
            y: matrixCanvas.height + 10,
            size: Math.random() * 6 + 3,
            speed: Math.random() * 1 + 0.5,
            wobble: Math.random() * Math.PI * 2
        });
    }
    
    particles = particles.filter(p => p.y > -20);
    
    particles.forEach(p => {
        p.y -= p.speed;
        p.wobble += 0.03;
        p.x += Math.sin(p.wobble) * 0.8;
        
        matrixCtx.beginPath();
        matrixCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        matrixCtx.strokeStyle = 'rgba(0, 180, 216, 0.5)';
        matrixCtx.lineWidth = 1.5;
        matrixCtx.stroke();
        
        // Reflet
        matrixCtx.beginPath();
        matrixCtx.arc(p.x - p.size * 0.3, p.y - p.size * 0.3, p.size * 0.25, 0, Math.PI * 2);
        matrixCtx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        matrixCtx.fill();
    });
}

// === FANTASY - Étoiles magiques ===
function animateFantasy() {
    if (particles.length < 40 && Math.random() > 0.92) {
        particles.push({
            x: Math.random() * matrixCanvas.width,
            y: Math.random() * matrixCanvas.height,
            size: Math.random() * 2 + 1,
            life: 1,
            twinkleOffset: Math.random() * Math.PI * 2,
            color: Math.random() > 0.5 ? '#bf6bff' : '#ff6bda'
        });
    }
    
    particles = particles.filter(p => p.life > 0);
    
    particles.forEach(p => {
        p.life -= 0.008;
        const twinkle = (Math.sin(Date.now() * 0.005 + p.twinkleOffset) + 1) / 2;
        
        matrixCtx.shadowBlur = 15;
        matrixCtx.shadowColor = p.color;
        matrixCtx.fillStyle = p.color;
        matrixCtx.globalAlpha = twinkle * p.life;
        
        matrixCtx.beginPath();
        matrixCtx.arc(p.x, p.y, p.size * (0.5 + twinkle * 0.5), 0, Math.PI * 2);
        matrixCtx.fill();
        
        matrixCtx.globalAlpha = 1;
        matrixCtx.shadowBlur = 0;
    });
}

// === SUNSET - Particules chaudes ===
function animateSunset() {
    if (particles.length < 30 && Math.random() > 0.94) {
        particles.push({
            x: Math.random() * matrixCanvas.width,
            y: matrixCanvas.height + 5,
            size: Math.random() * 3 + 2,
            speed: Math.random() * 0.6 + 0.3,
            life: 1,
            drift: (Math.random() - 0.5) * 0.5,
            color: ['#f97316', '#fbbf24', '#ef4444'][Math.floor(Math.random() * 3)]
        });
    }
    
    particles = particles.filter(p => p.life > 0.1 && p.y > -10);
    
    particles.forEach(p => {
        p.y -= p.speed;
        p.x += p.drift;
        p.life -= 0.005;
        
        matrixCtx.beginPath();
        matrixCtx.fillStyle = p.color;
        matrixCtx.globalAlpha = p.life * 0.6;
        matrixCtx.shadowBlur = 8;
        matrixCtx.shadowColor = p.color;
        matrixCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        matrixCtx.fill();
        matrixCtx.globalAlpha = 1;
        matrixCtx.shadowBlur = 0;
    });
}

// === FOREST - Feuilles qui tombent ===
function animateForest() {
    if (particles.length < 20 && Math.random() > 0.97) {
        particles.push({
            x: Math.random() * matrixCanvas.width,
            y: -10,
            size: Math.random() * 4 + 3,
            speed: Math.random() * 0.8 + 0.4,
            drift: Math.random() * 2 - 1,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.05,
            color: ['#4ade80', '#22c55e', '#86efac'][Math.floor(Math.random() * 3)]
        });
    }
    
    particles = particles.filter(p => p.y < matrixCanvas.height + 20);
    
    particles.forEach(p => {
        p.y += p.speed;
        p.x += Math.sin(p.y * 0.02) * p.drift;
        p.rotation += p.rotationSpeed;
        
        matrixCtx.save();
        matrixCtx.translate(p.x, p.y);
        matrixCtx.rotate(p.rotation);
        
        matrixCtx.beginPath();
        matrixCtx.ellipse(0, 0, p.size, p.size * 0.6, 0, 0, Math.PI * 2);
        matrixCtx.fillStyle = p.color;
        matrixCtx.globalAlpha = 0.6;
        matrixCtx.fill();
        matrixCtx.globalAlpha = 1;
        
        matrixCtx.restore();
    });
}

// === BUBBLEGUM - Bulles roses ===
function animateBubblegum() {
    if (particles.length < 30 && Math.random() > 0.95) {
        particles.push({
            x: Math.random() * matrixCanvas.width,
            y: matrixCanvas.height + 10,
            size: Math.random() * 8 + 4,
            speed: Math.random() * 0.8 + 0.3,
            wobble: Math.random() * Math.PI * 2,
            color: ['#ff6b9d', '#ff9ec4', '#ffc0d0'][Math.floor(Math.random() * 3)]
        });
    }
    
    particles = particles.filter(p => p.y > -20);
    
    particles.forEach(p => {
        p.y -= p.speed;
        p.wobble += 0.02;
        p.x += Math.sin(p.wobble) * 0.6;
        
        matrixCtx.beginPath();
        matrixCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        matrixCtx.fillStyle = p.color;
        matrixCtx.globalAlpha = 0.3;
        matrixCtx.fill();
        matrixCtx.globalAlpha = 1;
        
        matrixCtx.beginPath();
        matrixCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        matrixCtx.strokeStyle = p.color;
        matrixCtx.lineWidth = 1;
        matrixCtx.stroke();
        
        // Reflet
        matrixCtx.beginPath();
        matrixCtx.arc(p.x - p.size * 0.3, p.y - p.size * 0.3, p.size * 0.2, 0, Math.PI * 2);
        matrixCtx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        matrixCtx.fill();
    });
}

// === MIDNIGHT - Étoiles filantes ===
function animateMidnight() {
    // Étoiles fixes scintillantes
    if (particles.length < 50 && Math.random() > 0.9) {
        particles.push({
            x: Math.random() * matrixCanvas.width,
            y: Math.random() * matrixCanvas.height,
            size: Math.random() * 1.5 + 0.5,
            life: 1,
            twinkle: Math.random() * Math.PI * 2
        });
    }
    
    // Étoiles filantes occasionnelles
    if (Math.random() > 0.995) {
        const startX = Math.random() * matrixCanvas.width;
        const startY = Math.random() * matrixCanvas.height * 0.5;
        matrixCtx.beginPath();
        matrixCtx.moveTo(startX, startY);
        matrixCtx.lineTo(startX + 80, startY + 40);
        
        const gradient = matrixCtx.createLinearGradient(startX, startY, startX + 80, startY + 40);
        gradient.addColorStop(0, 'rgba(108, 143, 255, 0.8)');
        gradient.addColorStop(1, 'transparent');
        matrixCtx.strokeStyle = gradient;
        matrixCtx.lineWidth = 2;
        matrixCtx.stroke();
    }
    
    particles = particles.filter(p => p.life > 0);
    
    particles.forEach(p => {
        p.life -= 0.003;
        p.twinkle += 0.05;
        const brightness = (Math.sin(p.twinkle) + 1) / 2;
        
        matrixCtx.beginPath();
        matrixCtx.arc(p.x, p.y, p.size * brightness, 0, Math.PI * 2);
        matrixCtx.fillStyle = `rgba(108, 143, 255, ${p.life * brightness})`;
        matrixCtx.fill();
    });
}

// === DESERT - Particules sable ===
function animateDesert() {
    if (particles.length < 35 && Math.random() > 0.94) {
        particles.push({
            x: Math.random() * matrixCanvas.width,
            y: Math.random() * matrixCanvas.height,
            size: Math.random() * 2 + 1,
            vx: (Math.random() - 0.5) * 0.3,
            vy: (Math.random() - 0.5) * 0.3,
            life: 1
        });
    }
    
    particles = particles.filter(p => p.life > 0);
    
    particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.005;
        
        matrixCtx.beginPath();
        matrixCtx.fillStyle = `rgba(224, 120, 64, ${p.life * 0.4})`;
        matrixCtx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        matrixCtx.fill();
    });
}

// === Réinitialiser quand on change de thème ===
function resetAnimationForTheme() {
    particles = [];
    const columns = Math.floor(window.innerWidth / 20);
    matrixDrops = [];
    for (let i = 0; i < columns; i++) {
        matrixDrops[i] = Math.random() * -100;
    }
    if (matrixCtx) {
        matrixCtx.clearRect(0, 0, matrixCanvas.width, matrixCanvas.height);
    }
}

// Resize handler
window.addEventListener('resize', () => {
    if (matrixCanvas) {
        matrixCanvas.width = window.innerWidth;
        matrixCanvas.height = window.innerHeight;
        resetAnimationForTheme();
    }
});

console.log('✨ animations.js loaded');

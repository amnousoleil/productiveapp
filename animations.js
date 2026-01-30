// === ANIMATIONS CANVAS ===
// Effets visuels en arrière-plan - TOUTES FONCTIONNELLES

const matrixCanvas = document.getElementById('matrix-bg');
const matrixCtx = matrixCanvas ? matrixCanvas.getContext('2d') : null;
let particles = [];
let matrixDrops = [];
let animationRunning = false;
let frameCount = 0;

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
    frameCount = 0;
    
    if (!animationRunning) {
        animationRunning = true;
        requestAnimationFrame(animateCanvas);
    }
    
    console.log('✨ Animations initialized');
}

function animateCanvas() {
    if (!matrixCtx) return;
    
    frameCount++;
    const theme = document.documentElement.getAttribute('data-theme') || 'desert';
    
    if (matrixCanvas.width !== window.innerWidth || matrixCanvas.height !== window.innerHeight) {
        matrixCanvas.width = window.innerWidth;
        matrixCanvas.height = window.innerHeight;
    }
    
    // Clear complet pour tous les thèmes - évite les trainées blanches
    matrixCtx.clearRect(0, 0, matrixCanvas.width, matrixCanvas.height);
    
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

// === HACKER - Code doré avec trainée simulée ===
function animateHacker() {
    matrixCtx.font = '14px monospace';
    
    const chars = '01';
    const columns = Math.floor(matrixCanvas.width / 25);
    
    for (let i = 0; i < columns; i++) {
        if (matrixDrops[i] === undefined) {
            matrixDrops[i] = Math.random() * -50;
        }
        
        const x = i * 25;
        const baseY = matrixDrops[i];
        
        // Dessiner une trainée de 12 caractères
        for (let j = 0; j < 12; j++) {
            const y = (baseY - j) * 22;
            if (y < 0 || y > matrixCanvas.height) continue;
            
            const char = chars[Math.floor(Math.random() * chars.length)];
            
            // Le premier caractère est le plus brillant
            if (j === 0) {
                matrixCtx.fillStyle = '#ffffff';
                matrixCtx.shadowBlur = 8;
                matrixCtx.shadowColor = '#ffd700';
            } else {
                // Dégradé d'opacité pour la trainée
                const alpha = Math.max(0.1, 1 - (j / 12));
                matrixCtx.fillStyle = `rgba(255, 215, 0, ${alpha})`;
                matrixCtx.shadowBlur = 0;
            }
            
            matrixCtx.fillText(char, x, y);
        }
        matrixCtx.shadowBlur = 0;
        
        // Avancer la goutte
        matrixDrops[i] += 0.25;
        
        // Reset quand elle sort de l'écran
        if (matrixDrops[i] * 22 > matrixCanvas.height + 300) {
            if (Math.random() > 0.97) {
                matrixDrops[i] = 0;
            }
        }
    }
}

// === MATRIX - Code vert avec trainée simulée ===
function animateMatrix() {
    matrixCtx.font = '14px monospace';
    
    const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン01';
    const columns = Math.floor(matrixCanvas.width / 20);
    
    for (let i = 0; i < columns; i++) {
        if (matrixDrops[i] === undefined) {
            matrixDrops[i] = Math.random() * -50;
        }
        
        const x = i * 20;
        const baseY = matrixDrops[i];
        
        // Dessiner une trainée de 15 caractères
        for (let j = 0; j < 15; j++) {
            const y = (baseY - j) * 20;
            if (y < 0 || y > matrixCanvas.height) continue;
            
            const char = chars[Math.floor(Math.random() * chars.length)];
            
            // Le premier caractère est le plus brillant
            if (j === 0) {
                matrixCtx.fillStyle = '#ffffff';
                matrixCtx.shadowBlur = 10;
                matrixCtx.shadowColor = '#00ff66';
            } else {
                // Dégradé d'opacité pour la trainée
                const alpha = Math.max(0.1, 1 - (j / 15));
                matrixCtx.fillStyle = `rgba(0, 255, 102, ${alpha})`;
                matrixCtx.shadowBlur = 0;
            }
            
            matrixCtx.fillText(char, x, y);
        }
        matrixCtx.shadowBlur = 0;
        
        // Avancer la goutte
        matrixDrops[i] += 0.3;
        
        // Reset quand elle sort de l'écran
        if (matrixDrops[i] * 20 > matrixCanvas.height + 300) {
            if (Math.random() > 0.95) {
                matrixDrops[i] = 0;
            }
        }
    }
}

// === OCEAN - Bulles qui montent ===
function animateOcean() {
    // Créer des bulles régulièrement
    if (frameCount % 20 === 0 && particles.length < 30) {
        particles.push({
            x: Math.random() * matrixCanvas.width,
            y: matrixCanvas.height + 10,
            size: Math.random() * 8 + 3,
            speed: Math.random() * 1 + 0.5,
            wobble: Math.random() * Math.PI * 2
        });
    }
    
    particles = particles.filter(p => p.y > -20);
    
    particles.forEach(p => {
        p.y -= p.speed;
        p.wobble += 0.03;
        p.x += Math.sin(p.wobble) * 0.8;
        
        // Bulle
        matrixCtx.beginPath();
        matrixCtx.arc(p.x, p.y, Math.max(1, p.size), 0, Math.PI * 2);
        matrixCtx.strokeStyle = 'rgba(0, 180, 216, 0.6)';
        matrixCtx.lineWidth = 2;
        matrixCtx.stroke();
        
        // Reflet
        matrixCtx.beginPath();
        matrixCtx.arc(p.x - p.size * 0.3, p.y - p.size * 0.3, Math.max(0.5, p.size * 0.25), 0, Math.PI * 2);
        matrixCtx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        matrixCtx.fill();
    });
}

// === FANTASY - Étoiles magiques scintillantes ===
function animateFantasy() {
    // Créer des étoiles
    if (frameCount % 10 === 0 && particles.length < 50) {
        particles.push({
            x: Math.random() * matrixCanvas.width,
            y: Math.random() * matrixCanvas.height,
            size: Math.random() * 3 + 2,
            life: 1,
            twinkleSpeed: Math.random() * 0.1 + 0.05,
            twinkleOffset: Math.random() * Math.PI * 2,
            color: ['#bf6bff', '#ff6bda', '#6bffff', '#ffda6b'][Math.floor(Math.random() * 4)]
        });
    }
    
    particles = particles.filter(p => p.life > 0.02);
    
    particles.forEach(p => {
        p.life -= 0.003;
        const twinkle = (Math.sin(frameCount * p.twinkleSpeed + p.twinkleOffset) + 1) / 2;
        
        matrixCtx.globalAlpha = twinkle * p.life;
        matrixCtx.shadowBlur = 15;
        matrixCtx.shadowColor = p.color;
        matrixCtx.fillStyle = p.color;
        
        // Étoile à 4 branches
        const size = p.size * (0.5 + twinkle * 0.5);
        matrixCtx.beginPath();
        matrixCtx.moveTo(p.x, p.y - size);
        matrixCtx.lineTo(p.x + size * 0.3, p.y);
        matrixCtx.lineTo(p.x, p.y + size);
        matrixCtx.lineTo(p.x - size * 0.3, p.y);
        matrixCtx.closePath();
        matrixCtx.fill();
        
        matrixCtx.beginPath();
        matrixCtx.moveTo(p.x - size, p.y);
        matrixCtx.lineTo(p.x, p.y + size * 0.3);
        matrixCtx.lineTo(p.x + size, p.y);
        matrixCtx.lineTo(p.x, p.y - size * 0.3);
        matrixCtx.closePath();
        matrixCtx.fill();
        
        matrixCtx.globalAlpha = 1;
        matrixCtx.shadowBlur = 0;
    });
}

// === SUNSET - Particules chaudes qui montent ===
function animateSunset() {
    // Créer des particules
    if (frameCount % 15 === 0 && particles.length < 40) {
        particles.push({
            x: Math.random() * matrixCanvas.width,
            y: matrixCanvas.height + 5,
            size: Math.random() * 5 + 2,
            speed: Math.random() * 1 + 0.5,
            life: 1,
            drift: (Math.random() - 0.5) * 0.5,
            color: ['#f97316', '#fbbf24', '#ef4444', '#fb7185'][Math.floor(Math.random() * 4)]
        });
    }
    
    particles = particles.filter(p => p.life > 0.05 && p.y > -20);
    
    particles.forEach(p => {
        p.y -= p.speed;
        p.x += p.drift + Math.sin(frameCount * 0.02 + p.x * 0.01) * 0.3;
        p.life -= 0.004;
        
        matrixCtx.globalAlpha = p.life * 0.8;
        matrixCtx.shadowBlur = 10;
        matrixCtx.shadowColor = p.color;
        matrixCtx.fillStyle = p.color;
        matrixCtx.beginPath();
        matrixCtx.arc(p.x, p.y, Math.max(1, p.size * p.life), 0, Math.PI * 2);
        matrixCtx.fill();
        matrixCtx.globalAlpha = 1;
        matrixCtx.shadowBlur = 0;
    });
}

// === FOREST - Feuilles d'automne multicolores ===
function animateForest() {
    // Créer des feuilles
    if (frameCount % 30 === 0 && particles.length < 25) {
        const autumnColors = ['#4ade80', '#86efac', '#fbbf24', '#f97316', '#ef4444', '#dc2626', '#a3e635'];
        particles.push({
            x: Math.random() * matrixCanvas.width,
            y: -20,
            size: Math.random() * 8 + 5,
            speed: Math.random() * 1 + 0.5,
            drift: Math.random() * 3 - 1.5,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.05,
            swayOffset: Math.random() * Math.PI * 2,
            color: autumnColors[Math.floor(Math.random() * autumnColors.length)]
        });
    }
    
    particles = particles.filter(p => p.y < matrixCanvas.height + 30);
    
    particles.forEach(p => {
        p.y += p.speed;
        p.x += Math.sin(frameCount * 0.02 + p.swayOffset) * p.drift;
        p.rotation += p.rotationSpeed;
        
        matrixCtx.save();
        matrixCtx.translate(p.x, p.y);
        matrixCtx.rotate(p.rotation);
        
        matrixCtx.globalAlpha = 0.8;
        matrixCtx.fillStyle = p.color;
        
        // Forme de feuille
        matrixCtx.beginPath();
        matrixCtx.ellipse(0, 0, p.size, p.size * 0.5, 0, 0, Math.PI * 2);
        matrixCtx.fill();
        
        // Nervure
        matrixCtx.strokeStyle = 'rgba(0,0,0,0.2)';
        matrixCtx.lineWidth = 1;
        matrixCtx.beginPath();
        matrixCtx.moveTo(-p.size * 0.8, 0);
        matrixCtx.lineTo(p.size * 0.8, 0);
        matrixCtx.stroke();
        
        matrixCtx.globalAlpha = 1;
        matrixCtx.restore();
    });
}

// === BUBBLEGUM - Bulles roses ===
function animateBubblegum() {
    if (frameCount % 20 === 0 && particles.length < 30) {
        particles.push({
            x: Math.random() * matrixCanvas.width,
            y: matrixCanvas.height + 10,
            size: Math.random() * 10 + 5,
            speed: Math.random() * 0.8 + 0.3,
            wobble: Math.random() * Math.PI * 2,
            color: ['#ff6b9d', '#ff9ec4', '#ffc0d0', '#ffb3e6'][Math.floor(Math.random() * 4)]
        });
    }
    
    particles = particles.filter(p => p.y > -30);
    
    particles.forEach(p => {
        p.y -= p.speed;
        p.wobble += 0.02;
        p.x += Math.sin(p.wobble) * 0.6;
        
        // Bulle remplie
        matrixCtx.globalAlpha = 0.4;
        matrixCtx.beginPath();
        matrixCtx.arc(p.x, p.y, Math.max(1, p.size), 0, Math.PI * 2);
        matrixCtx.fillStyle = p.color;
        matrixCtx.fill();
        
        // Contour
        matrixCtx.globalAlpha = 0.7;
        matrixCtx.beginPath();
        matrixCtx.arc(p.x, p.y, Math.max(1, p.size), 0, Math.PI * 2);
        matrixCtx.strokeStyle = p.color;
        matrixCtx.lineWidth = 2;
        matrixCtx.stroke();
        
        // Reflet
        matrixCtx.globalAlpha = 0.8;
        matrixCtx.beginPath();
        matrixCtx.arc(p.x - p.size * 0.3, p.y - p.size * 0.3, Math.max(0.5, p.size * 0.2), 0, Math.PI * 2);
        matrixCtx.fillStyle = 'white';
        matrixCtx.fill();
        
        matrixCtx.globalAlpha = 1;
    });
}

// === MIDNIGHT - Étoiles scintillantes + filantes ===
function animateMidnight() {
    // Étoiles
    if (frameCount % 8 === 0 && particles.length < 60) {
        particles.push({
            x: Math.random() * matrixCanvas.width,
            y: Math.random() * matrixCanvas.height,
            size: Math.random() * 2 + 1,
            life: 1,
            twinkle: Math.random() * Math.PI * 2,
            twinkleSpeed: Math.random() * 0.1 + 0.03
        });
    }
    
    // Étoile filante rare
    if (Math.random() > 0.995) {
        const startX = Math.random() * matrixCanvas.width;
        const startY = Math.random() * matrixCanvas.height * 0.5;
        
        matrixCtx.beginPath();
        matrixCtx.moveTo(startX, startY);
        matrixCtx.lineTo(startX + 100, startY + 50);
        
        const gradient = matrixCtx.createLinearGradient(startX, startY, startX + 100, startY + 50);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
        gradient.addColorStop(0.3, 'rgba(108, 143, 255, 0.7)');
        gradient.addColorStop(1, 'transparent');
        matrixCtx.strokeStyle = gradient;
        matrixCtx.lineWidth = 2;
        matrixCtx.stroke();
    }
    
    particles = particles.filter(p => p.life > 0.02);
    
    particles.forEach(p => {
        p.life -= 0.002;
        p.twinkle += p.twinkleSpeed;
        const brightness = (Math.sin(p.twinkle) + 1) / 2;
        
        matrixCtx.globalAlpha = p.life * brightness;
        matrixCtx.shadowBlur = 5;
        matrixCtx.shadowColor = '#6c8fff';
        matrixCtx.fillStyle = '#ffffff';
        matrixCtx.beginPath();
        matrixCtx.arc(p.x, p.y, Math.max(0.5, p.size * brightness), 0, Math.PI * 2);
        matrixCtx.fill();
        matrixCtx.globalAlpha = 1;
        matrixCtx.shadowBlur = 0;
    });
}

// === DESERT - Grains de sable flottants ===
function animateDesert() {
    // Créer des particules régulièrement sur le côté gauche
    if (frameCount % 8 === 0 && particles.length < 60) {
        particles.push({
            x: -10, // Départ à gauche
            y: Math.random() * matrixCanvas.height,
            size: Math.random() * 4 + 2,
            speed: Math.random() * 2 + 1, // Vitesse horizontale
            drift: Math.random() * 0.5 - 0.25, // Légère oscillation verticale
            opacity: Math.random() * 0.5 + 0.5
        });
    }
    
    // Filtrer les particules sorties de l'écran
    particles = particles.filter(p => p.x < matrixCanvas.width + 20);
    
    // Dessiner et animer chaque particule
    particles.forEach(p => {
        // Mouvement principal : gauche à droite (vent)
        p.x += p.speed;
        // Légère oscillation verticale (flottement)
        p.y += Math.sin(frameCount * 0.02 + p.x * 0.01) * p.drift;
        
        // Dessiner avec glow
        matrixCtx.save();
        matrixCtx.globalAlpha = p.opacity;
        matrixCtx.shadowBlur = 15;
        matrixCtx.shadowColor = '#e07840';
        matrixCtx.fillStyle = '#f4a261';
        matrixCtx.beginPath();
        matrixCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        matrixCtx.fill();
        
        // Deuxième couche de glow plus large
        matrixCtx.shadowBlur = 25;
        matrixCtx.shadowColor = '#e07840';
        matrixCtx.globalAlpha = p.opacity * 0.3;
        matrixCtx.beginPath();
        matrixCtx.arc(p.x, p.y, p.size * 1.5, 0, Math.PI * 2);
        matrixCtx.fill();
        
        matrixCtx.restore();
    });
}

// === Reset pour changement de thème ===
function resetAnimationForTheme() {
    particles = [];
    frameCount = 0;
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

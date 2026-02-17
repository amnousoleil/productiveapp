/**
 * GIRI GAMES UI v1.0
 */
const GamesUI = (function() {
    'use strict';

    function showGameOver(container, score, gameId, restartFn) {
        const best = typeof GamesState !== 'undefined' ? GamesState.getBestScore(gameId) : 0;
        const isNew = score > best;
        if (typeof GamesState !== 'undefined') GamesState.addScore(gameId, score);
        if (typeof GamesApi !== 'undefined') GamesApi.saveScore(gameId, score, { won: false });
        const overlay = createGameOver(isNew ? `🏆 Nouveau record ! ${score.toLocaleString('fr-FR')}` : `Score : ${score.toLocaleString('fr-FR')}`, restartFn);
        container.style.position = 'relative';
        container.appendChild(overlay);
    }

    function createGameOver(msg, onRestart) {
        const overlay = document.createElement('div');
        overlay.style.cssText = 'position:absolute;inset:0;background:rgba(0,0,0,0.75);display:flex;align-items:center;justify-content:center;border-radius:8px;z-index:100;';
        const restartStr = onRestart ? onRestart.toString() : 'function(){}';
        overlay.innerHTML = `
            <div style="text-align:center;color:white;padding:32px;">
                <div style="font-size:20px;font-weight:700;margin-bottom:20px;">${msg}</div>
                <div style="display:flex;gap:12px;justify-content:center;">
                    <button onclick="this.closest('[style*=position]').remove();(${restartStr})()" style="padding:10px 20px;background:#7c3aed;color:white;border:none;border-radius:8px;cursor:pointer;font-weight:600;">🔄 Rejouer</button>
                    <button onclick="GiriGames.showHome()" style="padding:10px 20px;background:rgba(255,255,255,0.2);color:white;border:1px solid rgba(255,255,255,0.3);border-radius:8px;cursor:pointer;">🏠 Accueil</button>
                </div>
            </div>
        `;
        return overlay;
    }

    return { showGameOver, createGameOver };
})();

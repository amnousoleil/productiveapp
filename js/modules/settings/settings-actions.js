/**
 * SETTINGS ACTIONS - ProductiveApp v4.0
 * Actions: notifications, theme, sidebar, profile, workspace
 */

const SettingsActions = (function() {
    'use strict';

    function showToast(msg, type) { SettingsData.showToast(msg, type); }

    /**
     * Save notification settings to localStorage
     */
    function saveNotificationSettings(settings) {
        try {
            localStorage.setItem(SettingsState.CONFIG.storageKeys.notifications, JSON.stringify(settings));
            showToast('Parametres de notifications sauvegardes');
        } catch (e) { console.error('Error saving notification settings:', e); }
    }

    /**
     * Toggle sidebar compact mode
     */
    function toggleSidebarCompact(compact) {
        localStorage.setItem(SettingsState.CONFIG.storageKeys.sidebarCompact, compact);
        document.body.classList.toggle('sidebar-collapsed', compact);
        showToast(compact ? 'Sidebar compacte activee' : 'Sidebar etendue activee');
    }

    /**
     * Set theme
     */
    function setTheme(themeId) {
        localStorage.setItem(SettingsState.CONFIG.storageKeys.theme, themeId);
        if (typeof Themes !== 'undefined' && Themes.setTheme) Themes.setTheme(themeId);
        document.querySelectorAll('.settings-theme-card').forEach(function(card) {
            card.classList.toggle('active', card.dataset.theme === themeId);
        });
        showToast('Theme "' + themeId + '" applique');
    }

    /**
     * Toggle notification setting
     */
    function toggleNotification(element, key) {
        var settings = SettingsState.getNotificationSettings();
        settings[key] = element.classList.toggle('active');
        saveNotificationSettings(settings);
    }

    /**
     * Toggle sidebar
     */
    function toggleSidebar(element) {
        toggleSidebarCompact(element.classList.toggle('active'));
    }

    /**
     * Save profile changes
     */
    async function saveProfile() {
        var nameInput = document.getElementById('profile-name');
        if (!nameInput) return;
        var name = nameInput.value.trim();
        if (!name) { showToast('Le nom ne peut pas etre vide', 'error'); return; }
        try {
            if (typeof ApiFetch !== 'undefined') {
                await ApiFetch.fetchWithAuth('/users/me', { method: 'PUT', body: JSON.stringify({ name: name }) });
            }
            if (typeof AppState !== 'undefined' && AppState.currentUser) AppState.currentUser.name = name;
            showToast('Profil sauvegarde');
        } catch (e) {
            console.error('Save profile error:', e);
            showToast('Erreur lors de la sauvegarde', 'error');
        }
    }

    /**
     * Save workspace changes
     */
    async function saveWorkspace() {
        var nameInput = document.getElementById('workspace-name');
        var icon = localStorage.getItem('workspace_icon') || '🚀';
        if (!nameInput) return;
        var name = nameInput.value.trim();
        if (!name) { showToast('Le nom ne peut pas etre vide', 'error'); return; }
        localStorage.setItem('workspace_name', name);
        try {
            if (typeof ApiFetch !== 'undefined' && typeof ApiTokens !== 'undefined') {
                var wsId = ApiTokens.getWorkspaceId();
                if (wsId) await ApiFetch.fetchWithAuth('/workspaces/' + wsId, { method: 'PUT', body: JSON.stringify({ name: name, icon: icon }) });
            }
            showToast('Workspace sauvegarde');
        } catch (e) {
            console.error('Save workspace error:', e);
            showToast('Erreur lors de la sauvegarde', 'error');
        }
    }

    /**
     * Set workspace icon
     */
    function setWorkspaceIcon(icon) {
        localStorage.setItem('workspace_icon', icon);
        var iconEl = document.getElementById('workspace-icon');
        if (iconEl) iconEl.textContent = icon;
        document.querySelectorAll('.settings-icon-btn').forEach(function(btn) {
            var isActive = btn.dataset.icon === icon;
            btn.classList.toggle('active', isActive);
            btn.style.borderColor = isActive ? 'var(--primary)' : 'var(--border)';
            btn.style.background = isActive ? 'rgba(139, 92, 246, 0.15)' : 'transparent';
        });
    }

    // Delegate to SettingsData
    function exportData() { SettingsData.exportData(); }
    function clearCache() { SettingsData.clearCache(); }

    /**
     * Set animation intensity
     */
    function setAnimIntensity(value) {
        var intensity = parseInt(value, 10);
        if (typeof AnimationControls !== 'undefined') {
            AnimationControls.setIntensity(intensity);
        }
        var valEl = document.getElementById('settings-anim-value');
        if (valEl) valEl.textContent = intensity + '%';
    }

    /**
     * Set animation preset
     */
    function setAnimPreset(presetKey) {
        if (typeof AnimationControls !== 'undefined') {
            AnimationControls.setPreset(presetKey);
        }
        // Update preset button highlights in settings
        document.querySelectorAll('.settings-anim-preset').forEach(function(btn) {
            var isActive = btn.getAttribute('data-preset') === presetKey;
            btn.classList.toggle('active', isActive);
            btn.style.borderColor = isActive ? 'var(--accent)' : 'var(--border)';
            btn.style.background = isActive ? 'var(--bg-card)' : 'transparent';
            btn.style.color = isActive ? 'var(--accent)' : 'var(--text-muted)';
            btn.style.boxShadow = isActive ? '0 0 8px var(--accent-glow, rgba(99,102,241,0.2))' : 'none';
        });
        // Update slider to match preset intensity
        var slider = document.getElementById('settings-anim-slider');
        var valEl = document.getElementById('settings-anim-value');
        if (slider && typeof AnimationControls !== 'undefined') {
            var newVal = AnimationControls.getIntensity();
            slider.value = String(newVal);
            if (valEl) valEl.textContent = newVal + '%';
        }
        showToast('Animation: ' + presetKey);
    }

    /**
     * Preview animations (flash to 100% for 2s then restore)
     */
    function previewAnimations() {
        if (typeof AnimationControls !== 'undefined' && AnimationControls.getIntensity) {
            var original = AnimationControls.getIntensity();
            var originalPreset = AnimationControls.getPreset();
            AnimationControls.setIntensity(100);
            if (typeof window.AnimEngine !== 'undefined' && window.AnimEngine.reinit) {
                window.AnimEngine.reinit();
            }
            showToast('Aper\u00E7u animations...');
            setTimeout(function() {
                AnimationControls.setIntensity(original);
                if (originalPreset) AnimationControls.setPreset(originalPreset);
                var slider = document.getElementById('settings-anim-slider');
                var valEl = document.getElementById('settings-anim-value');
                if (slider) slider.value = String(original);
                if (valEl) valEl.textContent = original + '%';
            }, 2000);
        }
    }

    /**
     * Reset animations to cinematic default
     */
    function resetAnimations() {
        setAnimPreset('cinematic');
        showToast('Animations r\u00E9initialis\u00E9es (Cin\u00E9ma)');
    }

    /**
     * Toggle animations ON/OFF
     */
    function toggleAnimations(enabled) {
        try {
            // Save state to localStorage
            localStorage.setItem(SettingsState.CONFIG.storageKeys.animationEnabled, String(enabled));
            console.log('🎨 Animations ' + (enabled ? 'enabled' : 'disabled'));

            // Control canvas visibility
            var canvas = document.getElementById('matrix-bg');
            if (canvas) {
                if (enabled) {
                    // Enable: Initialize animation engine and show canvas
                    if (typeof initAnimation === 'function') {
                        initAnimation();
                        console.log('✅ initAnimation() called from toggleAnimations');
                    }
                    canvas.style.opacity = '0.95';
                } else {
                    // Disable: Hide canvas completely
                    canvas.style.opacity = '0';
                }
            }

            // Re-render settings to update UI (toggle state + opacity on controls)
            if (typeof SettingsView !== 'undefined' && SettingsView.render) {
                SettingsView.render();
            }

            // User feedback
            showToast('Animations ' + (enabled ? 'activees' : 'desactivees'));
        } catch (e) {
            console.error('Error toggling animations:', e);
            showToast('Erreur lors de la modification des animations', 'error');
        }
    }

    // ===== Avatar Upload + Crop =====
    var cropState = { img: null, scale: 1, offsetX: 0, offsetY: 0, dragging: false, lastX: 0, lastY: 0, canvas: null, ctx: null };

    function openAvatarUpload() {
        var input = document.getElementById('avatar-file-input');
        if (input) input.click();
    }

    function handleAvatarFile(event) {
        var file = event.target.files && event.target.files[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) { showToast('Fichier non supporte', 'error'); return; }
        if (file.size > 10 * 1024 * 1024) { showToast('Image trop lourde (max 10 Mo)', 'error'); return; }
        var reader = new FileReader();
        reader.onload = function(e) { openCropModal(e.target.result); };
        reader.readAsDataURL(file);
        event.target.value = '';
    }

    function openCropModal(dataUrl) {
        var existing = document.getElementById('avatar-crop-modal');
        if (existing) existing.remove();

        var modal = document.createElement('div');
        modal.id = 'avatar-crop-modal';
        modal.className = 'avatar-crop-modal';
        modal.innerHTML =
            '<div class="avatar-crop-content">' +
                '<h3>Recadrer la photo</h3>' +
                '<div class="avatar-crop-canvas-wrap" id="crop-canvas-wrap">' +
                    '<canvas id="crop-canvas" width="300" height="300"></canvas>' +
                '</div>' +
                '<p class="avatar-crop-hint">Glissez pour positionner, molette pour zoomer</p>' +
                '<div class="avatar-crop-actions">' +
                    '<button class="crop-cancel" onclick="SettingsActions.closeCropModal()">Annuler</button>' +
                    '<button class="crop-confirm" onclick="SettingsActions.cropAndUpload()">Confirmer</button>' +
                '</div>' +
            '</div>';
        document.body.appendChild(modal);

        var img = new Image();
        img.onload = function() {
            cropState.img = img;
            var size = 300;
            var ratio = Math.max(size / img.width, size / img.height);
            cropState.scale = ratio;
            cropState.offsetX = (size - img.width * ratio) / 2;
            cropState.offsetY = (size - img.height * ratio) / 2;
            cropState.canvas = document.getElementById('crop-canvas');
            cropState.ctx = cropState.canvas.getContext('2d');
            drawCrop();
            bindCropEvents();
        };
        img.src = dataUrl;

        modal.addEventListener('click', function(e) {
            if (e.target === modal) closeCropModal();
        });
    }

    function drawCrop() {
        var ctx = cropState.ctx;
        var size = 300;
        if (!ctx || !cropState.img) return;

        ctx.clearRect(0, 0, size, size);
        ctx.drawImage(cropState.img, cropState.offsetX, cropState.offsetY,
            cropState.img.width * cropState.scale, cropState.img.height * cropState.scale);

        // Circular mask overlay
        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
        ctx.fillRect(0, 0, size, size);
        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 2 - 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Circle border
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 2 - 10, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(139, 92, 246, 0.6)';
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    function bindCropEvents() {
        var wrap = document.getElementById('crop-canvas-wrap');
        if (!wrap) return;

        wrap.addEventListener('mousedown', function(e) {
            cropState.dragging = true;
            cropState.lastX = e.clientX;
            cropState.lastY = e.clientY;
        });
        wrap.addEventListener('touchstart', function(e) {
            cropState.dragging = true;
            cropState.lastX = e.touches[0].clientX;
            cropState.lastY = e.touches[0].clientY;
            e.preventDefault();
        }, { passive: false });

        document.addEventListener('mousemove', cropMove);
        document.addEventListener('touchmove', cropTouchMove, { passive: false });
        document.addEventListener('mouseup', cropEnd);
        document.addEventListener('touchend', cropEnd);

        wrap.addEventListener('wheel', function(e) {
            e.preventDefault();
            var delta = e.deltaY > 0 ? -0.05 : 0.05;
            var newScale = Math.max(0.3, Math.min(5, cropState.scale + delta));
            var cx = 150, cy = 150;
            cropState.offsetX = cx - (cx - cropState.offsetX) * (newScale / cropState.scale);
            cropState.offsetY = cy - (cy - cropState.offsetY) * (newScale / cropState.scale);
            cropState.scale = newScale;
            drawCrop();
        }, { passive: false });
    }

    function cropMove(e) {
        if (!cropState.dragging) return;
        cropState.offsetX += e.clientX - cropState.lastX;
        cropState.offsetY += e.clientY - cropState.lastY;
        cropState.lastX = e.clientX;
        cropState.lastY = e.clientY;
        drawCrop();
    }
    function cropTouchMove(e) {
        if (!cropState.dragging) return;
        e.preventDefault();
        cropState.offsetX += e.touches[0].clientX - cropState.lastX;
        cropState.offsetY += e.touches[0].clientY - cropState.lastY;
        cropState.lastX = e.touches[0].clientX;
        cropState.lastY = e.touches[0].clientY;
        drawCrop();
    }
    function cropEnd() { cropState.dragging = false; }

    function closeCropModal() {
        var modal = document.getElementById('avatar-crop-modal');
        if (modal) modal.remove();
        document.removeEventListener('mousemove', cropMove);
        document.removeEventListener('touchmove', cropTouchMove);
        document.removeEventListener('mouseup', cropEnd);
        document.removeEventListener('touchend', cropEnd);
        cropState.img = null;
        cropState.canvas = null;
        cropState.ctx = null;
    }

    async function cropAndUpload() {
        if (!cropState.img || !cropState.canvas) return;
        var confirmBtn = document.querySelector('.crop-confirm');
        if (confirmBtn) { confirmBtn.disabled = true; confirmBtn.textContent = '...'; }

        try {
            // Extract crop region (circle area = center 280x280 of the 300x300 canvas)
            var outSize = 200;
            var cropRadius = 140; // 300/2 - 10
            var offscreen = document.createElement('canvas');
            offscreen.width = outSize;
            offscreen.height = outSize;
            var octx = offscreen.getContext('2d');

            // Draw image at same transform but offset to match crop circle
            var scaleRatio = outSize / (cropRadius * 2);
            var sx = cropState.offsetX - (150 - cropRadius);
            var sy = cropState.offsetY - (150 - cropRadius);
            octx.drawImage(cropState.img, sx * scaleRatio, sy * scaleRatio,
                cropState.img.width * cropState.scale * scaleRatio,
                cropState.img.height * cropState.scale * scaleRatio);

            // Clip to circle
            octx.globalCompositeOperation = 'destination-in';
            octx.beginPath();
            octx.arc(outSize / 2, outSize / 2, outSize / 2, 0, Math.PI * 2);
            octx.fill();

            var blob = await new Promise(function(resolve) {
                offscreen.toBlob(resolve, 'image/png');
            });

            // Upload to existing endpoint
            var formData = new FormData();
            formData.append('file', blob, 'avatar.png');
            var token = typeof ApiTokens !== 'undefined' ? ApiTokens.getAccessToken() : null;
            var headers = {};
            if (token) headers['Authorization'] = 'Bearer ' + token;
            var wsId = typeof ApiTokens !== 'undefined' ? ApiTokens.getWorkspaceId() : null;
            if (wsId) headers['x-workspace-id'] = wsId;

            var uploadResp = await fetch('/api/v1/uploads/message', { method: 'POST', headers: headers, body: formData });
            var uploadData = await uploadResp.json();
            var avatarUrl = uploadData.data ? uploadData.data.url : (uploadData.url || null);
            if (!avatarUrl) throw new Error('Upload echoue');

            // Update user profile in backend
            await ApiFetch.fetchWithAuth('/users/me', { method: 'PUT', body: JSON.stringify({ avatar_url: avatarUrl }) });

            // Update frontend state
            if (typeof AppState !== 'undefined' && AppState.currentUser) {
                AppState.currentUser.avatar = avatarUrl;
                AppState.currentUser.avatar_url = avatarUrl;
            }
            var memberId = localStorage.getItem('selectedMemberId');
            if (typeof AppConfig !== 'undefined' && memberId) {
                var configUser = AppConfig.USERS.find(function(u) { return u.id === memberId; });
                if (configUser) configUser.avatar = avatarUrl;
            }

            closeCropModal();
            showToast('Photo de profil mise a jour');

            // Re-render affected components
            if (typeof SettingsView !== 'undefined') SettingsView.render();
            if (typeof Sidebar !== 'undefined' && Sidebar.render) Sidebar.render();
        } catch (e) {
            console.error('Avatar upload error:', e);
            showToast('Erreur lors de l\'upload: ' + (e.message || 'inconnue'), 'error');
            if (confirmBtn) { confirmBtn.disabled = false; confirmBtn.textContent = 'Confirmer'; }
        }
    }

    return {
        saveNotificationSettings: saveNotificationSettings,
        toggleSidebarCompact: toggleSidebarCompact,
        setTheme: setTheme,
        exportData: exportData,
        clearCache: clearCache,
        showToast: showToast,
        toggleNotification: toggleNotification,
        toggleSidebar: toggleSidebar,
        saveProfile: saveProfile,
        saveWorkspace: saveWorkspace,
        setWorkspaceIcon: setWorkspaceIcon,
        setAnimIntensity: setAnimIntensity,
        setAnimPreset: setAnimPreset,
        previewAnimations: previewAnimations,
        resetAnimations: resetAnimations,
        toggleAnimations: toggleAnimations,
        openAvatarUpload: openAvatarUpload,
        handleAvatarFile: handleAvatarFile,
        closeCropModal: closeCropModal,
        cropAndUpload: cropAndUpload
    };
})();

if (typeof window !== 'undefined') {
    window.SettingsActions = SettingsActions;
}

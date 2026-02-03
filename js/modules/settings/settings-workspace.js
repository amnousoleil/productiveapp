/**
 * Settings Workspace Module
 * Handles workspace settings (name, members, invitations)
 */

const SettingsWorkspace = (function() {
    'use strict';

    let workspaceData = null;
    let members = [];

    /**
     * Load workspace data
     */
    async function load() {
        try {
            const workspaceId = ApiTokens?.getWorkspaceId?.() || 'default';
            const [wsResponse, membersResponse] = await Promise.all([
                ApiFetch.fetchWithAuth(`/workspaces/${workspaceId}`),
                ApiFetch.fetchWithAuth(`/workspaces/${workspaceId}/members`)
            ]);
            workspaceData = wsResponse.data || wsResponse;
            members = membersResponse.data || membersResponse || [];
        } catch (error) {
            console.warn('⚠️ Using mock workspace data');
            workspaceData = getMockWorkspace();
            members = getMockMembers();
        }
        return { workspaceData, members };
    }

    /**
     * Render workspace section
     * @param {HTMLElement} container
     */
    function render(container) {
        if (!container) return;

        container.innerHTML = `
            <div class="settings-content-header">
                <h2 class="settings-content-title">
                    <span>🏢</span>
                    <span>Workspace</span>
                </h2>
                <p class="settings-content-desc">Gérez votre espace de travail et les membres</p>
            </div>

            <form class="settings-form" id="workspace-form">
                <!-- Workspace Info -->
                <div class="settings-form-row">
                    <div class="settings-form-group">
                        <label class="settings-label">Nom du workspace</label>
                        <input type="text" class="settings-input" id="workspace-name"
                               value="${escapeHtml(workspaceData?.name || '')}" placeholder="Mon équipe">
                    </div>
                    <div class="settings-form-group">
                        <label class="settings-label">Slug (URL)</label>
                        <input type="text" class="settings-input" id="workspace-slug"
                               value="${escapeHtml(workspaceData?.slug || '')}" placeholder="mon-equipe">
                    </div>
                </div>

                <div class="settings-form-group">
                    <label class="settings-label">Icône</label>
                    <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                        ${renderIconPicker()}
                    </div>
                </div>

                <button type="submit" class="settings-save-btn">
                    💾 Sauvegarder
                </button>
            </form>

            <!-- Members Section -->
            <div style="margin-top: 40px; padding-top: 32px; border-top: 1px solid var(--border);">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
                    <h3 style="font-size: 1.1rem; font-weight: 600; color: var(--text-primary);">
                        👥 Membres (${members.length})
                    </h3>
                    <button type="button" class="settings-avatar-btn primary" id="invite-member-btn">
                        ➕ Inviter
                    </button>
                </div>

                <div class="settings-members-list" id="members-list">
                    ${members.map(m => renderMember(m)).join('')}
                </div>
            </div>
        `;

        attachListeners();
    }

    /**
     * Render icon picker
     */
    function renderIconPicker() {
        const icons = ['🚀', '💼', '🎯', '⚡', '🔥', '💎', '🌟', '🎨', '📊', '🏆'];
        const currentIcon = workspaceData?.icon || '🚀';

        return icons.map(icon => `
            <button type="button" class="settings-icon-btn ${icon === currentIcon ? 'active' : ''}"
                    data-icon="${icon}"
                    style="width: 44px; height: 44px; border-radius: 10px; border: 2px solid ${icon === currentIcon ? 'var(--accent)' : 'var(--border)'}; background: ${icon === currentIcon ? 'var(--accent-muted)' : 'var(--background)'}; font-size: 1.3rem; cursor: pointer; transition: all 0.2s ease;">
                ${icon}
            </button>
        `).join('');
    }

    /**
     * Render single member item
     * @param {Object} member
     */
    function renderMember(member) {
        const roleClass = member.role === 'owner' ? 'owner' : member.role === 'admin' ? 'admin' : 'member';
        const roleLabel = member.role === 'owner' ? 'Propriétaire' : member.role === 'admin' ? 'Admin' : 'Membre';

        return `
            <div class="settings-member-item" data-member-id="${member.id}">
                <div class="settings-member-avatar">${member.avatar || '👤'}</div>
                <div class="settings-member-info">
                    <div class="settings-member-name">${escapeHtml(member.name)}</div>
                    <div class="settings-member-email">${escapeHtml(member.email)}</div>
                </div>
                <span class="settings-member-role ${roleClass}">${roleLabel}</span>
            </div>
        `;
    }

    /**
     * Attach event listeners
     */
    function attachListeners() {
        // Icon picker
        document.querySelectorAll('.settings-icon-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.settings-icon-btn').forEach(b => {
                    b.style.borderColor = 'var(--border)';
                    b.style.background = 'var(--background)';
                });
                btn.style.borderColor = 'var(--accent)';
                btn.style.background = 'var(--accent-muted)';
                workspaceData.icon = btn.dataset.icon;
            });
        });

        // Form submit
        const form = document.getElementById('workspace-form');
        form?.addEventListener('submit', async (e) => {
            e.preventDefault();
            await saveWorkspace();
        });

        // Invite button
        const inviteBtn = document.getElementById('invite-member-btn');
        inviteBtn?.addEventListener('click', showInviteModal);
    }

    /**
     * Save workspace settings
     */
    async function saveWorkspace() {
        const data = {
            name: document.getElementById('workspace-name')?.value,
            slug: document.getElementById('workspace-slug')?.value,
            icon: workspaceData?.icon
        };

        try {
            const workspaceId = ApiTokens?.getWorkspaceId?.() || 'default';
            await ApiFetch.fetchWithAuth(`/workspaces/${workspaceId}`, {
                method: 'PUT',
                body: JSON.stringify(data)
            });
            console.log('✅ Workspace saved');
        } catch (error) {
            console.error('❌ Failed to save workspace:', error);
        }
    }

    /**
     * Show invite modal
     */
    function showInviteModal() {
        const email = prompt('Email du membre à inviter :');
        if (email && email.includes('@')) {
            inviteMember(email);
        }
    }

    /**
     * Invite a member
     * @param {string} email
     */
    async function inviteMember(email) {
        try {
            const workspaceId = ApiTokens?.getWorkspaceId?.() || 'default';
            await ApiFetch.fetchWithAuth(`/workspaces/${workspaceId}/members/invite`, {
                method: 'POST',
                body: JSON.stringify({ email })
            });
            console.log('✅ Invitation sent to', email);
            alert(`Invitation envoyée à ${email}`);
        } catch (error) {
            console.error('❌ Failed to invite:', error);
            alert('Erreur lors de l\'invitation');
        }
    }

    function getMockWorkspace() {
        return {
            id: 'ws-1',
            name: 'ProductiveApp Team',
            slug: 'productiveapp',
            icon: '🚀'
        };
    }

    function getMockMembers() {
        return [
            { id: 'u1', name: 'Maha', email: 'maha@productive.app', avatar: '👑', role: 'owner' },
            { id: 'u2', name: 'Brice', email: 'brice@productive.app', avatar: '🚀', role: 'admin' },
            { id: 'u3', name: 'Team', email: 'team@productive.app', avatar: '👥', role: 'member' }
        ];
    }

    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    return {
        load,
        render,
        saveWorkspace,
        inviteMember
    };
})();

if (typeof window !== 'undefined') {
    window.SettingsWorkspace = SettingsWorkspace;
}

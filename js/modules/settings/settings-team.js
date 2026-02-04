/**
 * SETTINGS TEAM - ProductiveApp v4.0
 * Gestion des membres du workspace
 */

const SettingsTeam = (function() {
    'use strict';

    let members = [];
    let loading = false;

    const icons = {
        users: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
        plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
        trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>',
        edit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>'
    };

    function showToast(msg, type) {
        if (typeof SettingsData !== 'undefined') SettingsData.showToast(msg, type);
        else console.log(msg);
    }

    function getWorkspaceId() {
        return typeof ApiTokens !== 'undefined' ? ApiTokens.getWorkspaceId() : null;
    }

    async function loadMembers() {
        var wsId = getWorkspaceId();
        if (!wsId) { members = []; return []; }
        loading = true;
        try {
            var resp = await ApiFetch.fetchWithAuth('/workspaces/' + wsId + '/members');
            members = resp.data || resp.members || resp || [];
            return members;
        } catch (e) {
            console.error('Load members error:', e);
            showToast('Erreur chargement membres', 'error');
            return [];
        } finally { loading = false; }
    }

    async function addMember(name, email, role) {
        var wsId = getWorkspaceId();
        if (!wsId) { showToast('Workspace non trouve', 'error'); return false; }
        if (!email || !name) { showToast('Nom et email requis', 'error'); return false; }
        try {
            await ApiFetch.fetchWithAuth('/workspaces/' + wsId + '/members', {
                method: 'POST', body: JSON.stringify({ name: name, email: email, role: role || 'member' })
            });
            showToast('Membre ajoute');
            await loadMembers();
            renderMembersList();
            return true;
        } catch (e) {
            console.error('Add member error:', e);
            showToast(e.message || 'Erreur ajout membre', 'error');
            return false;
        }
    }

    async function removeMember(userId) {
        if (!confirm('Supprimer ce membre du workspace ?')) return false;
        var wsId = getWorkspaceId();
        if (!wsId) return false;
        try {
            await ApiFetch.fetchWithAuth('/workspaces/' + wsId + '/members/' + userId, { method: 'DELETE' });
            showToast('Membre supprime');
            await loadMembers();
            renderMembersList();
            return true;
        } catch (e) {
            console.error('Remove member error:', e);
            showToast(e.message || 'Erreur suppression', 'error');
            return false;
        }
    }

    async function updateRole(userId, role) {
        var wsId = getWorkspaceId();
        if (!wsId) return false;
        try {
            await ApiFetch.fetchWithAuth('/workspaces/' + wsId + '/members/' + userId, {
                method: 'PATCH', body: JSON.stringify({ role: role })
            });
            showToast('Role mis a jour');
            await loadMembers();
            renderMembersList();
            return true;
        } catch (e) {
            console.error('Update role error:', e);
            showToast(e.message || 'Erreur mise a jour', 'error');
            return false;
        }
    }

    function getRoleBadge(role) {
        var colors = { owner: '#f59e0b', admin: '#8b5cf6', member: '#6b7280' };
        var labels = { owner: 'Proprietaire', admin: 'Admin', member: 'Membre' };
        return '<span style="background:' + (colors[role] || colors.member) + '20;color:' + (colors[role] || colors.member) + ';padding:2px 8px;border-radius:4px;font-size:11px;font-weight:600;">' + (labels[role] || role) + '</span>';
    }

    function renderMemberRow(m) {
        var isOwner = m.role === 'owner';
        var currentUser = typeof AppState !== 'undefined' ? AppState.currentUser : null;
        var isMe = currentUser && currentUser.id === m.id;
        return '<div class="settings-member-row" style="display:flex;align-items:center;padding:12px 16px;border-bottom:1px solid var(--border);gap:12px;">' +
            '<div style="width:36px;height:36px;border-radius:50%;background:var(--primary);display:flex;align-items:center;justify-content:center;color:white;font-weight:600;">' + (m.name || 'U').charAt(0).toUpperCase() + '</div>' +
            '<div style="flex:1;min-width:0;">' +
                '<div style="font-weight:500;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + (m.name || 'Sans nom') + (isMe ? ' (vous)' : '') + '</div>' +
                '<div style="font-size:12px;color:var(--text-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + (m.email || '') + '</div>' +
            '</div>' +
            '<div style="display:flex;align-items:center;gap:8px;">' +
                getRoleBadge(m.role) +
                (!isOwner && !isMe ? '<select onchange="SettingsTeam.updateRole(\'' + m.id + '\',this.value)" style="padding:4px 8px;border-radius:4px;border:1px solid var(--border);background:var(--surface);color:var(--text);font-size:12px;cursor:pointer;">' +
                    '<option value="member"' + (m.role === 'member' ? ' selected' : '') + '>Membre</option>' +
                    '<option value="admin"' + (m.role === 'admin' ? ' selected' : '') + '>Admin</option>' +
                '</select>' : '') +
                (!isOwner && !isMe ? '<button onclick="SettingsTeam.removeMember(\'' + m.id + '\')" style="width:28px;height:28px;border:none;background:rgba(239,68,68,0.1);color:#ef4444;border-radius:6px;cursor:pointer;display:flex;align-items:center;justify-content:center;" title="Supprimer">' + icons.trash + '</button>' : '') +
            '</div>' +
        '</div>';
    }

    function renderMembersList() {
        var container = document.getElementById('team-members-list');
        if (!container) return;
        if (loading) { container.innerHTML = '<div style="padding:20px;text-align:center;color:var(--text-muted);">Chargement...</div>'; return; }
        if (!members.length) { container.innerHTML = '<div style="padding:20px;text-align:center;color:var(--text-muted);">Aucun membre</div>'; return; }
        container.innerHTML = members.map(renderMemberRow).join('');
    }

    function handleAddMember() {
        var name = document.getElementById('team-add-name');
        var email = document.getElementById('team-add-email');
        var role = document.getElementById('team-add-role');
        if (name && email) {
            addMember(name.value.trim(), email.value.trim(), role ? role.value : 'member');
            name.value = ''; email.value = '';
        }
    }

    function render() {
        loadMembers().then(function() { renderMembersList(); });
        return '<section class="settings-section">' +
            '<h2 class="settings-section-title">' + icons.users + '<span>Equipe</span></h2>' +
            '<div class="settings-card">' +
                '<div id="team-members-list" style="max-height:300px;overflow-y:auto;"><div style="padding:20px;text-align:center;color:var(--text-muted);">Chargement...</div></div>' +
                '<div style="padding:16px;border-top:1px solid var(--border);">' +
                    '<div style="font-size:13px;font-weight:600;color:var(--text);margin-bottom:12px;">Ajouter un membre</div>' +
                    '<div style="display:flex;gap:8px;flex-wrap:wrap;">' +
                        '<input type="text" id="team-add-name" placeholder="Nom" style="flex:1;min-width:100px;padding:8px 12px;border:1px solid var(--border);border-radius:6px;background:var(--surface);color:var(--text);font-size:13px;">' +
                        '<input type="email" id="team-add-email" placeholder="Email" style="flex:2;min-width:150px;padding:8px 12px;border:1px solid var(--border);border-radius:6px;background:var(--surface);color:var(--text);font-size:13px;">' +
                        '<select id="team-add-role" style="padding:8px 12px;border:1px solid var(--border);border-radius:6px;background:var(--surface);color:var(--text);font-size:13px;">' +
                            '<option value="member">Membre</option>' +
                            '<option value="admin">Admin</option>' +
                        '</select>' +
                        '<button onclick="SettingsTeam.handleAddMember()" class="settings-btn primary" style="white-space:nowrap;">' + icons.plus + ' Ajouter</button>' +
                    '</div>' +
                '</div>' +
            '</div>' +
        '</section>';
    }

    return {
        render: render,
        loadMembers: loadMembers,
        addMember: addMember,
        removeMember: removeMember,
        updateRole: updateRole,
        handleAddMember: handleAddMember,
        renderMembersList: renderMembersList
    };
})();

if (typeof window !== 'undefined') { window.SettingsTeam = SettingsTeam; }

/**
 * NOTES CORE - Data management with API + localStorage fallback
 * ProductiveApp v4.0
 */

const NotesModule = (function() {
    'use strict';

    const AUTOSAVE_DELAY = 1000;

    let notes = [];
    let folders = [];
    let currentNoteId = null;
    let currentFolderId = null;
    let autosaveTimeout = null;
    let saveStatus = 'saved';

    function generateId() {
        return 'note_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // ========== STORAGE (scoped by member) ==========

    function getStorageKey() {
        const memberId = localStorage.getItem('selectedMemberId') || 'default';
        return `productiveapp_notes_${memberId}`;
    }

    function saveToLocal() {
        try {
            localStorage.setItem(getStorageKey(), JSON.stringify(notes));
            localStorage.setItem(getStorageKey() + '_folders', JSON.stringify(folders));
        } catch (e) {
            console.warn('Notes: localStorage save failed', e);
        }
    }

    function loadFromLocal() {
        try {
            const saved = localStorage.getItem(getStorageKey());
            if (saved) notes = JSON.parse(saved);

            const savedFolders = localStorage.getItem(getStorageKey() + '_folders');
            if (savedFolders) folders = JSON.parse(savedFolders);
        } catch (e) {
            console.warn('Notes: localStorage load failed', e);
            notes = [];
            folders = [];
        }
    }

    // ========== API OPERATIONS ==========

    async function loadNotes() {
        // Always try API first (no permanent fallback)
        if (typeof ApiNotes !== 'undefined') {
            try {
                const apiNotes = await ApiNotes.getAll();
                notes = apiNotes.map(n => ({
                    id: n.id,
                    title: n.title || '',
                    content: n.content || '',
                    projectId: n.project_id || null,
                    parentId: n.parent_id || null,
                    memberId: n.member_id || null,
                    isPublic: n.is_public || false,
                    tags: n.tags || [],
                    isPinned: n.is_pinned || false,
                    createdAt: n.created_at,
                    updatedAt: n.updated_at
                }));
                saveToLocal();
                console.log('Notes loaded from API:', notes.length);
                return notes;
            } catch (e) {
                console.warn('Notes: API load failed, using localStorage', e);
            }
        }
        loadFromLocal();
        return notes;
    }

    async function createNew(projectId = null) {
        const note = {
            id: generateId(),
            title: '',
            content: '',
            projectId,
            parentId: null,
            memberId: localStorage.getItem('selectedMemberId') || null,
            isPublic: false,
            tags: [],
            isPinned: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        if (typeof ApiNotes !== 'undefined') {
            try {
                const apiNote = await ApiNotes.create({
                    title: note.title,
                    content: note.content,
                    project_id: projectId
                });
                if (apiNote) {
                    note.id = apiNote.id;
                    note.createdAt = apiNote.created_at;
                    note.updatedAt = apiNote.updated_at;
                }
            } catch (e) {
                console.warn('Notes: API create failed', e);
            }
        }

        notes.unshift(note);
        saveToLocal();
        currentNoteId = note.id;

        // XP Feedback: nouvelle note créée
        if (typeof XPFeedback !== 'undefined' && XPFeedback.recordAction) {
            XPFeedback.recordAction('note_created', null, 'Note créée')
                .catch(err => console.warn('XP Feedback failed:', err));
        }

        return note;
    }

    async function updateNote(id, updates) {
        const index = notes.findIndex(n => n.id === id);
        if (index === -1) return null;

        notes[index] = {
            ...notes[index],
            ...updates,
            updatedAt: new Date().toISOString()
        };

        if (typeof ApiNotes !== 'undefined') {
            try {
                const apiData = {};
                if (updates.title !== undefined) apiData.title = updates.title;
                if (updates.content !== undefined) apiData.content = updates.content;
                if (updates.projectId !== undefined) apiData.project_id = updates.projectId;
                if (updates.parentId !== undefined) apiData.parent_id = updates.parentId;
                if (updates.tags !== undefined) apiData.tags = updates.tags;
                if (updates.isPublic !== undefined) apiData.is_public = updates.isPublic;
                if (updates.isPinned !== undefined) apiData.is_pinned = updates.isPinned;
                await ApiNotes.update(id, apiData);
            } catch (e) {
                console.warn('Notes: API update failed', e);
            }
        }

        saveToLocal();
        return notes[index];
    }

    async function deleteNote(id) {
        const index = notes.findIndex(n => n.id === id);
        if (index === -1) return false;

        if (typeof ApiNotes !== 'undefined') {
            try {
                await ApiNotes.remove(id);
            } catch (e) {
                console.warn('Notes: API delete failed', e);
            }
        }

        notes.splice(index, 1);
        saveToLocal();

        if (currentNoteId === id) {
            currentNoteId = notes.length > 0 ? notes[0].id : null;
        }
        return true;
    }

    // ========== SEARCH ==========

    function searchNotes(query) {
        if (!query || !query.trim()) return notes;
        const q = query.toLowerCase().trim();
        return notes.filter(n =>
            (n.title && n.title.toLowerCase().includes(q)) ||
            (n.content && n.content.toLowerCase().includes(q))
        );
    }

    // ========== GETTERS ==========

    function getNotes() { return notes; }
    function getNote(id) { return notes.find(n => n.id === id); }
    function getCurrentNote() { return currentNoteId ? getNote(currentNoteId) : null; }
    function getNotesByProject(projectId) {
        if (!projectId) return [];
        return notes.filter(n => n.projectId === projectId);
    }
    function getSortedNotes(sortBy = 'updatedAt') {
        return [...notes].sort((a, b) => new Date(b[sortBy]) - new Date(a[sortBy]));
    }

    // ========== SETTERS ==========

    function selectNote(id) { currentNoteId = id; }
    function setCurrentNote(id) { currentNoteId = id; }
    function getSaveStatus() { return saveStatus; }
    function setSaveStatus(status) { saveStatus = status; }
    function getAutosaveTimeout() { return autosaveTimeout; }
    function setAutosaveTimeout(timeout) { autosaveTimeout = timeout; }
    function clearAutosaveTimeout() {
        if (autosaveTimeout) {
            clearTimeout(autosaveTimeout);
            autosaveTimeout = null;
        }
    }

    // ========== FOLDERS CRUD ==========

    function getFolders() { return folders; }
    function getFolder(id) { return folders.find(f => f.id === id); }
    function getCurrentFolder() { return currentFolderId ? getFolder(currentFolderId) : null; }

    function getFolderTree() {
        // Build tree structure from flat folders array
        const rootFolders = folders.filter(f => !f.parentId);
        const buildTree = (parentFolders) => {
            return parentFolders.map(folder => ({
                ...folder,
                children: buildTree(folders.filter(f => f.parentId === folder.id))
            }));
        };
        return buildTree(rootFolders);
    }

    function getNotesByFolder(folderId) {
        if (!folderId) return notes.filter(n => !n.folderId);
        return notes.filter(n => n.folderId === folderId);
    }

    function createFolder(name, parentId = null, color = '#8b5cf6') {
        const folder = {
            id: 'folder_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            name: name || 'Nouveau dossier',
            parentId: parentId,
            color: color,
            createdAt: new Date().toISOString()
        };
        folders.push(folder);
        saveToLocal();
        return folder;
    }

    function updateFolder(id, updates) {
        const index = folders.findIndex(f => f.id === id);
        if (index === -1) return null;
        folders[index] = { ...folders[index], ...updates };
        saveToLocal();
        return folders[index];
    }

    function deleteFolder(id, deleteNotes = false) {
        const index = folders.findIndex(f => f.id === id);
        if (index === -1) return false;

        // Delete child folders recursively
        const childFolders = folders.filter(f => f.parentId === id);
        childFolders.forEach(child => deleteFolder(child.id, deleteNotes));

        // Handle notes in this folder
        if (deleteNotes) {
            notes = notes.filter(n => n.folderId !== id);
        } else {
            // Move notes to parent folder or root
            const parentId = folders[index].parentId;
            notes.forEach(n => {
                if (n.folderId === id) n.folderId = parentId;
            });
        }

        folders.splice(index, 1);
        saveToLocal();
        return true;
    }

    function setCurrentFolder(id) {
        currentFolderId = id;
    }

    // ========== RESET (called when switching members) ==========

    function reset() {
        notes = [];
        folders = [];
        currentNoteId = null;
        currentFolderId = null;
        saveStatus = 'saved';
        clearAutosaveTimeout();
    }

    return {
        AUTOSAVE_DELAY,
        loadNotes,
        getNotes,
        getNote,
        getCurrentNote,
        getNotesByProject,
        getNotesByFolder,
        getSortedNotes,
        searchNotes,
        createNew,
        updateNote,
        deleteNote,
        selectNote,
        setCurrentNote,
        getSaveStatus,
        setSaveStatus,
        getAutosaveTimeout,
        setAutosaveTimeout,
        clearAutosaveTimeout,
        // Folders
        getFolders,
        getFolder,
        getCurrentFolder,
        getFolderTree,
        createFolder,
        updateFolder,
        deleteFolder,
        setCurrentFolder,
        reset,
        get currentNoteId() { return currentNoteId; },
        get currentFolderId() { return currentFolderId; }
    };
})();

if (typeof window !== 'undefined') {
    window.NotesModule = NotesModule;
}

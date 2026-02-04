/**
 * NOTES CORE - Data management with API + localStorage fallback
 * ProductiveApp v4.0
 */

const NotesModule = (function() {
    'use strict';

    const STORAGE_KEY = 'productiveapp_notes';
    const AUTOSAVE_DELAY = 1000;

    let notes = [];
    let currentNoteId = null;
    let autosaveTimeout = null;
    let saveStatus = 'saved';
    let useApi = true;

    function generateId() {
        return 'note_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // ========== STORAGE ==========

    function saveToLocal() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
        } catch (e) {
            console.warn('Notes: localStorage save failed', e);
        }
    }

    function loadFromLocal() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) notes = JSON.parse(saved);
        } catch (e) {
            console.warn('Notes: localStorage load failed', e);
            notes = [];
        }
    }

    // ========== API OPERATIONS ==========

    async function loadNotes() {
        if (useApi && typeof ApiNotes !== 'undefined') {
            try {
                const apiNotes = await ApiNotes.getAll();
                notes = apiNotes.map(n => ({
                    id: n.id,
                    title: n.title || '',
                    content: n.content || '',
                    projectId: n.project_id || null,
                    tags: n.tags || [],
                    isPinned: n.is_pinned || false,
                    createdAt: n.created_at,
                    updatedAt: n.updated_at
                }));
                saveToLocal();
                console.log('📝 Notes loaded from API:', notes.length);
                return notes;
            } catch (e) {
                console.warn('Notes: API load failed, using localStorage', e);
                useApi = false;
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
            tags: [],
            isPinned: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        if (useApi && typeof ApiNotes !== 'undefined') {
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

        if (useApi && typeof ApiNotes !== 'undefined') {
            try {
                await ApiNotes.update(id, {
                    title: updates.title,
                    content: updates.content,
                    project_id: updates.projectId,
                    tags: updates.tags
                });
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

        if (useApi && typeof ApiNotes !== 'undefined') {
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

    return {
        AUTOSAVE_DELAY,
        loadNotes,
        getNotes,
        getNote,
        getCurrentNote,
        getNotesByProject,
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
        get currentNoteId() { return currentNoteId; }
    };
})();

if (typeof window !== 'undefined') {
    window.NotesModule = NotesModule;
}

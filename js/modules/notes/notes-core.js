/**
 * NOTES CORE - Data management
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

    /**
     * Generate unique ID
     */
    function generateId() {
        return 'note_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Load notes from localStorage
     */
    function loadNotes() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                notes = JSON.parse(saved);
            }
        } catch (e) {
            console.warn('Notes: Could not load', e);
            notes = [];
        }
    }

    /**
     * Save notes to localStorage
     */
    function saveNotes() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
        } catch (e) {
            console.warn('Notes: Could not save', e);
        }
    }

    /**
     * Get all notes
     */
    function getNotes() {
        return notes;
    }

    /**
     * Get note by ID
     */
    function getNote(id) {
        return notes.find(n => n.id === id);
    }

    /**
     * Get current note
     */
    function getCurrentNote() {
        return currentNoteId ? getNote(currentNoteId) : null;
    }

    /**
     * Create new note
     */
    function createNew(projectId = null) {
        const note = {
            id: generateId(),
            title: '',
            content: '',
            projectId,
            tags: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        notes.unshift(note);
        saveNotes();
        currentNoteId = note.id;

        return note;
    }

    /**
     * Update note
     */
    function updateNote(id, updates) {
        const index = notes.findIndex(n => n.id === id);
        if (index === -1) return null;

        notes[index] = {
            ...notes[index],
            ...updates,
            updatedAt: new Date().toISOString()
        };

        saveNotes();
        return notes[index];
    }

    /**
     * Delete note
     */
    function deleteNote(id) {
        const index = notes.findIndex(n => n.id === id);
        if (index === -1) return false;

        notes.splice(index, 1);
        saveNotes();

        if (currentNoteId === id) {
            currentNoteId = notes.length > 0 ? notes[0].id : null;
        }

        return true;
    }

    /**
     * Select note
     */
    function selectNote(id) {
        currentNoteId = id;
    }

    /**
     * Set current note ID
     */
    function setCurrentNote(id) {
        currentNoteId = id;
    }

    /**
     * Get save status
     */
    function getSaveStatus() {
        return saveStatus;
    }

    /**
     * Set save status
     */
    function setSaveStatus(status) {
        saveStatus = status;
    }

    /**
     * Get autosave timeout
     */
    function getAutosaveTimeout() {
        return autosaveTimeout;
    }

    /**
     * Set autosave timeout
     */
    function setAutosaveTimeout(timeout) {
        autosaveTimeout = timeout;
    }

    /**
     * Clear autosave timeout
     */
    function clearAutosaveTimeout() {
        if (autosaveTimeout) {
            clearTimeout(autosaveTimeout);
            autosaveTimeout = null;
        }
    }

    /**
     * Get notes by project ID
     * @param {string} projectId - Project ID
     * @returns {Array} - Notes for this project
     */
    function getNotesByProject(projectId) {
        if (!projectId) return [];
        return notes.filter(n => n.projectId === projectId);
    }

    return {
        AUTOSAVE_DELAY,
        loadNotes,
        saveNotes,
        getNotes,
        getNote,
        getCurrentNote,
        getNotesByProject,
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

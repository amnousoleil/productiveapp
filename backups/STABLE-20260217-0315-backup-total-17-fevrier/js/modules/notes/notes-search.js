/**
 * NOTES SEARCH - Advanced full-text search
 * ProductiveApp v5.0 - Phase 1
 */

const NotesSearch = (function() {
    'use strict';

    let searchIndex = new Map();
    let searchHistory = [];
    const MAX_HISTORY = 10;

    // ========== INDEX BUILDING ==========

    function buildIndex() {
        searchIndex.clear();

        const notes = NotesModule.getNotes();

        notes.forEach(note => {
            const tokens = tokenize(note.title + ' ' + note.content);

            tokens.forEach(token => {
                if (!searchIndex.has(token)) {
                    searchIndex.set(token, new Set());
                }
                searchIndex.get(token).add(note.id);
            });
        });

        console.log(`🔍 Search index built: ${searchIndex.size} unique tokens`);
    }

    function tokenize(text) {
        if (!text) return [];

        // Normalize: lowercase, remove punctuation, split on whitespace
        return text
            .toLowerCase()
            .replace(/[^\w\sàâäéèêëïîôùûüÿœæç]/g, ' ') // Keep French accents
            .split(/\s+/)
            .filter(token => token.length > 2) // Min 3 chars
            .filter(token => !isStopWord(token));
    }

    function isStopWord(word) {
        const stopWords = new Set([
            'le', 'la', 'les', 'un', 'une', 'des', 'de', 'du',
            'et', 'ou', 'mais', 'donc', 'car', 'ni',
            'je', 'tu', 'il', 'elle', 'nous', 'vous', 'ils', 'elles',
            'ce', 'cet', 'cette', 'ces',
            'mon', 'ton', 'son', 'ma', 'ta', 'sa', 'mes', 'tes', 'ses',
            'qui', 'que', 'quoi', 'dont', 'où',
            'the', 'a', 'an', 'and', 'or', 'but', 'is', 'are', 'was', 'were'
        ]);
        return stopWords.has(word);
    }

    // ========== SEARCH ==========

    function search(query, options = {}) {
        if (!query || query.trim().length < 2) {
            return {
                results: [],
                query: query,
                total: 0,
                time: 0
            };
        }

        const startTime = performance.now();

        const defaults = {
            titleOnly: false,
            contentOnly: false,
            tags: false,
            caseSensitive: false,
            exactMatch: false,
            limit: 50
        };

        const opts = { ...defaults, ...options };

        // Tokenize query
        const tokens = opts.exactMatch
            ? [query.toLowerCase()]
            : tokenize(query);

        if (tokens.length === 0) {
            return { results: [], query, total: 0, time: 0 };
        }

        // Get candidate note IDs from index
        let candidateIds = new Set();

        if (searchIndex.size > 0) {
            // Use index for token-based search
            tokens.forEach((token, i) => {
                const ids = searchIndex.get(token);
                if (ids) {
                    if (i === 0) {
                        candidateIds = new Set(ids);
                    } else {
                        // Intersection: only keep notes that match ALL tokens
                        candidateIds = new Set([...candidateIds].filter(id => ids.has(id)));
                    }
                }
            });
        } else {
            // Fallback: all notes
            candidateIds = new Set(NotesModule.getNotes().map(n => n.id));
        }

        // Score and rank results
        const results = [];

        candidateIds.forEach(id => {
            const note = NotesModule.getNote(id);
            if (!note) return;

            const score = scoreNote(note, query, tokens, opts);
            if (score > 0) {
                results.push({
                    note,
                    score,
                    highlights: extractHighlights(note, query, opts)
                });
            }
        });

        // Sort by score (descending)
        results.sort((a, b) => b.score - a.score);

        // Limit results
        const limited = results.slice(0, opts.limit);

        const endTime = performance.now();

        // Save to history
        addToHistory(query);

        return {
            results: limited,
            query,
            total: results.length,
            time: Math.round(endTime - startTime)
        };
    }

    function scoreNote(note, query, tokens, opts) {
        let score = 0;

        const queryLower = query.toLowerCase();
        const titleLower = (note.title || '').toLowerCase();
        const contentLower = (note.content || '').toLowerCase();

        // Exact match in title: +100
        if (titleLower.includes(queryLower)) {
            score += 100;
        }

        // Exact match in content: +50
        if (contentLower.includes(queryLower)) {
            score += 50;
        }

        // Token matches
        tokens.forEach(token => {
            // Title match: +20 per token
            if (titleLower.includes(token)) {
                score += 20;
            }

            // Content match: +5 per token
            if (contentLower.includes(token)) {
                score += 5;
            }
        });

        // Tags match: +30
        if (opts.tags && note.tags) {
            note.tags.forEach(tag => {
                if (tag.toLowerCase().includes(queryLower)) {
                    score += 30;
                }
            });
        }

        // Recency bonus: +1 to +10 based on updatedAt
        if (note.updatedAt) {
            const age = Date.now() - new Date(note.updatedAt).getTime();
            const daysSince = age / (1000 * 60 * 60 * 24);
            const recencyBonus = Math.max(0, 10 - Math.floor(daysSince / 7));
            score += recencyBonus;
        }

        // Filter by options
        if (opts.titleOnly && !titleLower.includes(queryLower)) {
            return 0;
        }

        if (opts.contentOnly && !contentLower.includes(queryLower)) {
            return 0;
        }

        return score;
    }

    function extractHighlights(note, query, opts) {
        const highlights = [];
        const queryLower = query.toLowerCase();

        // Title highlight
        if (note.title) {
            const titleLower = note.title.toLowerCase();
            const index = titleLower.indexOf(queryLower);
            if (index !== -1) {
                highlights.push({
                    type: 'title',
                    text: note.title,
                    start: index,
                    end: index + query.length
                });
            }
        }

        // Content highlights (max 3)
        if (note.content) {
            const contentLower = note.content.toLowerCase();
            let startIndex = 0;
            let count = 0;

            while (count < 3) {
                const index = contentLower.indexOf(queryLower, startIndex);
                if (index === -1) break;

                // Extract context (50 chars before/after)
                const contextStart = Math.max(0, index - 50);
                const contextEnd = Math.min(note.content.length, index + query.length + 50);
                const context = note.content.substring(contextStart, contextEnd);

                highlights.push({
                    type: 'content',
                    text: context,
                    start: index - contextStart,
                    end: index - contextStart + query.length,
                    fullStart: index
                });

                startIndex = index + query.length;
                count++;
            }
        }

        return highlights;
    }

    // ========== HISTORY ==========

    function addToHistory(query) {
        if (!query || query.trim().length < 2) return;

        // Remove duplicates
        searchHistory = searchHistory.filter(q => q !== query);

        // Add to front
        searchHistory.unshift(query);

        // Limit size
        if (searchHistory.length > MAX_HISTORY) {
            searchHistory = searchHistory.slice(0, MAX_HISTORY);
        }

        saveHistory();
    }

    function getHistory() {
        return searchHistory;
    }

    function clearHistory() {
        searchHistory = [];
        saveHistory();
    }

    function saveHistory() {
        const memberId = localStorage.getItem('selectedMemberId') || 'default';
        const key = `productiveapp_search_history_${memberId}`;
        try {
            localStorage.setItem(key, JSON.stringify(searchHistory));
        } catch (e) {
            console.warn('Failed to save search history', e);
        }
    }

    function loadHistory() {
        const memberId = localStorage.getItem('selectedMemberId') || 'default';
        const key = `productiveapp_search_history_${memberId}`;
        try {
            const saved = localStorage.getItem(key);
            if (saved) searchHistory = JSON.parse(saved);
        } catch (e) {
            console.warn('Failed to load search history', e);
        }
    }

    // ========== RENDER ==========

    function renderSearchModal(query = '') {
        const history = getHistory();

        return `
            <div class="search-modal-overlay" onclick="NotesSearch.closeModal()">
                <div class="search-modal" onclick="event.stopPropagation()">
                    <div class="search-modal-header">
                        <input type="text"
                            class="search-modal-input"
                            id="search-modal-input"
                            placeholder="Rechercher dans les notes..."
                            value="${escapeHtml(query)}"
                            oninput="NotesSearch.handleSearchInput(this.value)"
                            autofocus>
                        <button class="search-modal-close" onclick="NotesSearch.closeModal()">×</button>
                    </div>

                    <div class="search-modal-body">
                        ${history.length > 0 && !query ? `
                            <div class="search-history">
                                <div class="search-history-header">
                                    <span>Recherches récentes</span>
                                    <button onclick="NotesSearch.clearHistory()">Effacer</button>
                                </div>
                                ${history.map(q => `
                                    <div class="search-history-item" onclick="NotesSearch.performSearch('${escapeHtml(q)}')">
                                        <svg viewBox="0 0 24 24" width="14" height="14"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                        <span>${escapeHtml(q)}</span>
                                    </div>
                                `).join('')}
                            </div>
                        ` : ''}

                        <div id="search-modal-results"></div>
                    </div>
                </div>
            </div>
        `;
    }

    function renderResults(results, query) {
        if (!query) return '';

        if (results.length === 0) {
            return `
                <div class="search-no-results">
                    <p>Aucun résultat pour "${escapeHtml(query)}"</p>
                </div>
            `;
        }

        return `
            <div class="search-results-header">
                ${results.length} résultat${results.length > 1 ? 's' : ''}
            </div>
            <div class="search-results-list">
                ${results.map(result => renderResultItem(result, query)).join('')}
            </div>
        `;
    }

    function renderResultItem(result, query) {
        const { note, highlights } = result;

        const titleHighlight = highlights.find(h => h.type === 'title');
        const contentHighlights = highlights.filter(h => h.type === 'content').slice(0, 2);

        return `
            <div class="search-result-item" onclick="NotesSearch.selectResult('${note.id}')">
                <div class="search-result-title">
                    ${titleHighlight
                        ? highlightText(titleHighlight.text, titleHighlight.start, titleHighlight.end)
                        : escapeHtml(note.title || 'Sans titre')
                    }
                </div>
                ${contentHighlights.length > 0 ? `
                    <div class="search-result-snippets">
                        ${contentHighlights.map(h => `
                            <div class="search-result-snippet">
                                ...${highlightText(h.text, h.start, h.end)}...
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
                <div class="search-result-meta">
                    ${formatDate(note.updatedAt)}
                </div>
            </div>
        `;
    }

    function highlightText(text, start, end) {
        const before = escapeHtml(text.substring(0, start));
        const match = escapeHtml(text.substring(start, end));
        const after = escapeHtml(text.substring(end));
        return `${before}<mark class="search-highlight">${match}</mark>${after}`;
    }

    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function formatDate(dateStr) {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
    }

    // ========== ACTIONS ==========

    let searchTimeout = null;

    function handleSearchInput(query) {
        clearTimeout(searchTimeout);

        searchTimeout = setTimeout(() => {
            performSearch(query);
        }, 300); // Debounce 300ms
    }

    function performSearch(query) {
        const input = document.getElementById('search-modal-input');
        if (input) input.value = query;

        const resultsContainer = document.getElementById('search-modal-results');
        if (!resultsContainer) return;

        if (!query || query.trim().length < 2) {
            resultsContainer.innerHTML = '';
            return;
        }

        const searchResults = search(query);

        resultsContainer.innerHTML = renderResults(searchResults.results, query);

        console.log(`🔍 Search "${query}": ${searchResults.total} results in ${searchResults.time}ms`);
    }

    function selectResult(noteId) {
        closeModal();

        if (typeof NotesEditor !== 'undefined' && NotesEditor.selectNote) {
            NotesEditor.selectNote(noteId);
        }
    }

    function openModal() {
        const existing = document.querySelector('.search-modal-overlay');
        if (existing) existing.remove();

        const modal = document.createElement('div');
        modal.innerHTML = renderSearchModal();
        document.body.appendChild(modal.firstElementChild);

        // Focus input
        setTimeout(() => {
            const input = document.getElementById('search-modal-input');
            if (input) input.focus();
        }, 100);

        // Keyboard shortcuts
        document.addEventListener('keydown', handleModalKeydown);
    }

    function closeModal() {
        const modal = document.querySelector('.search-modal-overlay');
        if (modal) modal.remove();

        document.removeEventListener('keydown', handleModalKeydown);
    }

    function handleModalKeydown(e) {
        if (e.key === 'Escape') {
            closeModal();
        }
    }

    // ========== INIT ==========

    function init() {
        loadHistory();
        buildIndex();

        // Global keyboard shortcut: Ctrl+K
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                openModal();
            }
        });

        console.log('🔍 NotesSearch initialized');
    }

    function rebuild() {
        buildIndex();
    }

    // ========== PUBLIC API ==========

    return {
        init,
        rebuild,
        search,
        buildIndex,
        getHistory,
        clearHistory,
        openModal,
        closeModal,
        handleSearchInput,
        performSearch,
        selectResult
    };
})();

if (typeof window !== 'undefined') {
    window.NotesSearch = NotesSearch;
}

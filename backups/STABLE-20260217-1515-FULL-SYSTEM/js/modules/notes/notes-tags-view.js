/**
 * NOTES TAGS VIEW - Hierarchical tags sidebar
 * ProductiveApp v6.0 - World Class Edition
 *
 * Features:
 * - Hierarchical tags (#work/projects/alpha)
 * - Tag count badges
 * - Click to filter
 * - Color coding
 * - Drag & drop tags onto notes
 */

const NotesTagsView = (function() {
    'use strict';

    let tagsHierarchy = {};
    let expandedTags = new Set();

    // ========== INITIALIZATION ==========

    function init() {
        console.log('🏷️  NotesTagsView: Initializing tags system');
        loadExpandedState();
        rebuildHierarchy();
    }

    function loadExpandedState() {
        try {
            const saved = localStorage.getItem('productiveapp_notes_expanded_tags_v6');
            if (saved) {
                expandedTags = new Set(JSON.parse(saved));
            }
        } catch (e) {
            console.warn('Failed to load expanded tags', e);
        }
    }

    function saveExpandedState() {
        try {
            localStorage.setItem('productiveapp_notes_expanded_tags_v6', JSON.stringify([...expandedTags]));
        } catch (e) {
            console.warn('Failed to save expanded tags', e);
        }
    }

    // ========== HIERARCHY BUILDING ==========

    function rebuildHierarchy() {
        tagsHierarchy = {};

        if (typeof NotesModule === 'undefined') return;

        const notes = NotesModule.getNotes();
        const tagCounts = new Map();

        // Count all tags
        notes.forEach(note => {
            if (note.tags && Array.isArray(note.tags)) {
                note.tags.forEach(tag => {
                    tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
                });
            }
        });

        // Build hierarchy
        tagCounts.forEach((count, tag) => {
            addTagToHierarchy(tag, count);
        });

        console.log(`  ✓ Built hierarchy with ${tagCounts.size} tags`);
    }

    function addTagToHierarchy(tag, count) {
        const parts = tag.split('/');
        let current = tagsHierarchy;

        parts.forEach((part, index) => {
            if (!current[part]) {
                current[part] = {
                    name: part,
                    fullPath: parts.slice(0, index + 1).join('/'),
                    count: 0,
                    children: {}
                };
            }

            if (index === parts.length - 1) {
                current[part].count = count;
            }

            current = current[part].children;
        });
    }

    // ========== RENDERING ==========

    function render() {
        rebuildHierarchy();

        if (Object.keys(tagsHierarchy).length === 0) {
            return renderEmpty();
        }

        return `
            <div class="notes-tags-view">
                <div class="notes-tags-header">
                    <h4>Tags (${getTotalTagsCount()})</h4>
                    <button class="notes-tags-btn" onclick="NotesTagsView.collapseAll()" title="Tout replier">
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="18 15 12 9 6 15"/>
                        </svg>
                    </button>
                </div>
                <div class="notes-tags-tree">
                    ${renderTagsTree(tagsHierarchy)}
                </div>
            </div>
        `;
    }

    function renderEmpty() {
        return `
            <div class="notes-tags-empty">
                <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
                    <line x1="7" y1="7" x2="7.01" y2="7"/>
                </svg>
                <p>Aucun tag</p>
                <span class="notes-tags-hint">Les tags apparaîtront ici</span>
            </div>
        `;
    }

    function renderTagsTree(tree, depth = 0) {
        return Object.keys(tree)
            .sort()
            .map(key => renderTagNode(tree[key], depth))
            .join('');
    }

    function renderTagNode(node, depth) {
        const hasChildren = Object.keys(node.children).length > 0;
        const isExpanded = expandedTags.has(node.fullPath);
        const chevron = hasChildren
            ? (isExpanded
                ? '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>'
                : '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>')
            : '<span class="notes-tag-spacer"></span>';

        const color = getTagColor(node.fullPath);

        return `
            <div class="notes-tag-node" data-depth="${depth}">
                <div class="notes-tag-item" onclick="NotesTagsView.toggleTag('${escapeAttr(node.fullPath)}')" style="padding-left: ${depth * 16}px">
                    <span class="notes-tag-chevron" ${hasChildren ? `onclick="NotesTagsView.toggleExpand('${escapeAttr(node.fullPath)}'); event.stopPropagation();"` : ''}>
                        ${chevron}
                    </span>
                    <span class="notes-tag-icon" style="color: ${color}">🏷️</span>
                    <span class="notes-tag-name">${escapeHtml(node.name)}</span>
                    <span class="notes-tag-count" style="background: ${color}20; color: ${color}">${node.count}</span>
                </div>
                ${hasChildren && isExpanded ? `<div class="notes-tag-children">${renderTagsTree(node.children, depth + 1)}</div>` : ''}
            </div>
        `;
    }

    // ========== ACTIONS ==========

    function toggleExpand(fullPath) {
        if (expandedTags.has(fullPath)) {
            expandedTags.delete(fullPath);
        } else {
            expandedTags.add(fullPath);
        }
        saveExpandedState();

        // Re-render sidebar
        if (typeof NotesLayoutV6 !== 'undefined') {
            NotesLayoutV6.switchSidebarTab('tags');
        }
    }

    function toggleTag(fullPath) {
        filterByTag(fullPath);
    }

    function filterByTag(tag) {
        // TODO: Implement filtering
        if (typeof Toast !== 'undefined') {
            Toast.info(`Filtre par tag : #${tag}`);
        }

        console.log('Filter by tag:', tag);
    }

    function collapseAll() {
        expandedTags.clear();
        saveExpandedState();

        if (typeof NotesLayoutV6 !== 'undefined') {
            NotesLayoutV6.switchSidebarTab('tags');
        }
    }

    // ========== TAG COLORS ==========

    function getTagColor(tag) {
        const colors = [
            '#6366f1', // indigo
            '#8b5cf6', // purple
            '#ec4899', // pink
            '#f59e0b', // amber
            '#10b981', // emerald
            '#06b6d4', // cyan
            '#3b82f6', // blue
            '#f97316', // orange
        ];

        // Hash tag name to color
        let hash = 0;
        for (let i = 0; i < tag.length; i++) {
            hash = tag.charCodeAt(i) + ((hash << 5) - hash);
        }

        return colors[Math.abs(hash) % colors.length];
    }

    // ========== UTILS ==========

    function getTotalTagsCount() {
        let count = 0;
        function countRecursive(tree) {
            Object.values(tree).forEach(node => {
                if (node.count > 0) count++;
                countRecursive(node.children);
            });
        }
        countRecursive(tagsHierarchy);
        return count;
    }

    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function escapeAttr(text) {
        if (!text) return '';
        return text.replace(/'/g, "\\'").replace(/"/g, '&quot;');
    }

    // ========== PUBLIC API ==========

    return {
        init,
        render,
        rebuildHierarchy,
        toggleExpand,
        toggleTag,
        collapseAll
    };

})();

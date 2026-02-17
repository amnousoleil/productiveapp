/**
 * SKELETONS - ProductiveApp v4.0
 * Placeholders animes pendant le chargement
 */
const Skeletons = (function() {
    'use strict';

    function line(w, h) {
        w = w || '100%';
        h = h || '14px';
        return '<div class="skeleton-line" style="width:' + w + ';height:' + h + ';"></div>';
    }

    function circle(size) {
        size = size || '40px';
        return '<div class="skeleton-circle" style="width:' + size + ';height:' + size + ';"></div>';
    }

    function card() {
        return '<div class="skeleton-card">' +
            '<div class="skeleton-card-header">' + circle('32px') + '<div class="skeleton-card-meta">' + line('60%', '12px') + line('40%', '10px') + '</div></div>' +
            line('90%') + line('70%') + line('50%', '10px') +
        '</div>';
    }

    function render(type, count) {
        count = count || 3;
        var html = '<div class="skeleton-container">';
        for (var i = 0; i < count; i++) {
            switch (type) {
                case 'tasks':
                    html += taskSkeleton();
                    break;
                case 'projects':
                    html += projectSkeleton();
                    break;
                case 'notes':
                    html += noteSkeleton();
                    break;
                case 'dashboard':
                    html += dashboardSkeleton();
                    break;
                case 'list':
                    html += listSkeleton();
                    break;
                default:
                    html += card();
            }
        }
        html += '</div>';
        return html;
    }

    function taskSkeleton() {
        return '<div class="skeleton-task">' +
            '<div class="skeleton-task-left">' + circle('18px') + '</div>' +
            '<div class="skeleton-task-content">' + line('70%', '13px') + line('40%', '10px') + '</div>' +
            '<div class="skeleton-task-right">' + line('50px', '20px') + '</div>' +
        '</div>';
    }

    function projectSkeleton() {
        return '<div class="skeleton-project">' +
            circle('44px') +
            '<div style="flex:1;">' + line('60%', '14px') + line('35%', '11px') + '</div>' +
            line('60px', '24px') +
        '</div>';
    }

    function noteSkeleton() {
        return '<div class="skeleton-note">' +
            line('50%', '16px') +
            line('90%') + line('80%') + line('60%') +
            '<div style="margin-top:8px;">' + line('30%', '10px') + '</div>' +
        '</div>';
    }

    function dashboardSkeleton() {
        return '<div class="skeleton-dashboard-widget">' +
            '<div class="skeleton-widget-header">' + line('40%', '12px') + '</div>' +
            '<div class="skeleton-widget-value">' + line('30%', '28px') + '</div>' +
            line('60%', '10px') +
        '</div>';
    }

    function listSkeleton() {
        return '<div class="skeleton-list-item">' +
            circle('28px') +
            '<div style="flex:1;">' + line('55%', '13px') + line('30%', '10px') + '</div>' +
        '</div>';
    }

    return { render: render, line: line, circle: circle, card: card };
})();

if (typeof window !== 'undefined') window.Skeletons = Skeletons;

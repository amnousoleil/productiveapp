/**
 * REPORTS DETAIL - ProductiveApp v4.0
 * Modal de detail d'un rapport
 */

const ReportsDetail = (function() {
    'use strict';

    const MONTHS_FR = ['Janvier', 'Fevrier', 'Mars', 'Avril', 'Mai', 'Juin',
                       'Juillet', 'Aout', 'Septembre', 'Octobre', 'Novembre', 'Decembre'];

    function formatDate(date) {
        return date.getDate() + ' ' + MONTHS_FR[date.getMonth()].substring(0, 3);
    }

    /**
     * Generer le HTML du contenu du detail
     */
    function renderContent(report, icons) {
        var m = report.metrics || {};
        var periodStart = new Date(report.period_start);
        var periodEnd = new Date(report.period_end);

        return `
            <div class="detail-header">
                <div class="detail-score">${m.score || 0}</div>
                <div class="detail-period">${formatDate(periodStart)} - ${formatDate(periodEnd)}</div>
            </div>

            <div class="detail-section">
                <h3 class="detail-section-title">${icons.check} Taches</h3>
                <div class="detail-grid">
                    <div class="detail-stat">
                        <div class="detail-stat-label">Creees</div>
                        <div class="detail-stat-value">${m.tasks?.created || 0}</div>
                    </div>
                    <div class="detail-stat">
                        <div class="detail-stat-label">Completees</div>
                        <div class="detail-stat-value">${m.tasks?.completed || 0}</div>
                    </div>
                    <div class="detail-stat">
                        <div class="detail-stat-label">En retard</div>
                        <div class="detail-stat-value">${m.tasks?.overdue || 0}</div>
                    </div>
                    <div class="detail-stat">
                        <div class="detail-stat-label">Taux completion</div>
                        <div class="detail-stat-value">${m.tasks?.completion_rate || 0}%</div>
                        <div class="progress-bar-container">
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${m.tasks?.completion_rate || 0}%"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="detail-section">
                <h3 class="detail-section-title">${icons.target} Projets</h3>
                <div class="detail-grid">
                    <div class="detail-stat">
                        <div class="detail-stat-label">Total</div>
                        <div class="detail-stat-value">${m.projects?.total || 0}</div>
                    </div>
                    <div class="detail-stat">
                        <div class="detail-stat-label">Actifs</div>
                        <div class="detail-stat-value">${m.projects?.active || 0}</div>
                    </div>
                    <div class="detail-stat">
                        <div class="detail-stat-label">Termines</div>
                        <div class="detail-stat-value">${m.projects?.completed || 0}</div>
                    </div>
                    <div class="detail-stat">
                        <div class="detail-stat-label">Progression moyenne</div>
                        <div class="detail-stat-value">${m.projects?.avg_progress || 0}%</div>
                        <div class="progress-bar-container">
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${m.projects?.avg_progress || 0}%"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="detail-section">
                <h3 class="detail-section-title">${icons.clock} Productivite</h3>
                <div class="detail-grid">
                    <div class="detail-stat">
                        <div class="detail-stat-label">Taches/jour</div>
                        <div class="detail-stat-value">${m.productivity?.tasks_per_day || 0}</div>
                    </div>
                    <div class="detail-stat">
                        <div class="detail-stat-label">Temps moyen (h)</div>
                        <div class="detail-stat-value">${m.productivity?.avg_completion_time_hours || '-'}</div>
                    </div>
                    <div class="detail-stat">
                        <div class="detail-stat-label">Jour le + productif</div>
                        <div class="detail-stat-value">${m.productivity?.most_productive_day || '-'}</div>
                    </div>
                    <div class="detail-stat">
                        <div class="detail-stat-label">Heure la + productive</div>
                        <div class="detail-stat-value">${m.productivity?.most_productive_hour !== null ? m.productivity.most_productive_hour + 'h' : '-'}</div>
                    </div>
                </div>
            </div>

            <div class="detail-section">
                <h3 class="detail-section-title">${icons.award} Gamification</h3>
                <div class="detail-grid">
                    <div class="detail-stat">
                        <div class="detail-stat-label">XP gagne</div>
                        <div class="detail-stat-value">${m.gamification?.xp_earned || 0}</div>
                    </div>
                    <div class="detail-stat">
                        <div class="detail-stat-label">Streak actuel</div>
                        <div class="detail-stat-value">${m.gamification?.current_streak || 0} jours</div>
                    </div>
                    <div class="detail-stat">
                        <div class="detail-stat-label">Succes debloques</div>
                        <div class="detail-stat-value">${m.gamification?.achievements_unlocked || 0}</div>
                    </div>
                    <div class="detail-stat">
                        <div class="detail-stat-label">Niveau</div>
                        <div class="detail-stat-value">${m.gamification?.level || 1}</div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Afficher le modal de detail
     */
    function show(report, icons) {
        var modal = document.getElementById('report-detail-modal');
        var content = document.getElementById('report-detail-content');

        if (!modal || !content) return;

        content.innerHTML = renderContent(report, icons);
        modal.style.display = 'block';
    }

    /**
     * Fermer le modal
     */
    function close() {
        var modal = document.getElementById('report-detail-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    return {
        renderContent,
        show,
        close
    };
})();

if (typeof window !== 'undefined') {
    window.ReportsDetail = ReportsDetail;
}

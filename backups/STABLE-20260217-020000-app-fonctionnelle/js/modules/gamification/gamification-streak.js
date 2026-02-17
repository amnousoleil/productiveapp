/**
 * Gamification Streak Calendar Component
 * Displays 30-day calendar with active days highlighted
 */

const GamificationStreak = (function() {
    'use strict';

    let streakData = null;

    /**
     * Render the streak calendar
     * @param {HTMLElement} container - Container element
     * @param {Object} data - Streak data { current, longest, activeDays }
     */
    function render(container, data) {
        if (!container || !data) return;
        streakData = data;

        const today = new Date();
        const currentDay = today.getDate();
        const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();

        container.innerHTML = `
            <div class="gam-streak">
                <div class="gam-streak-header">
                    <div class="gam-section-title">🔥 Streak</div>
                    <div class="gam-streak-count">
                        ${data.current}
                        <span>jours consécutifs</span>
                    </div>
                </div>
                <div class="gam-streak-stats">
                    <span style="color:var(--gam-text-muted);font-size:0.8rem;">
                        Record: ${data.longest} jours
                    </span>
                </div>
                <div class="gam-calendar">
                    ${renderCalendar(data.activeDays, currentDay, daysInMonth)}
                </div>
            </div>
        `;
    }

    /**
     * Render calendar grid
     * @param {Array} activeDays - Array of active day numbers
     * @param {number} currentDay - Current day of month
     * @param {number} totalDays - Total days in month
     */
    function renderCalendar(activeDays, currentDay, totalDays) {
        let html = '';
        const activeDaysSet = new Set(activeDays);

        // Render last 30 days or current month
        const startDay = Math.max(1, currentDay - 29);

        for (let day = startDay; day <= Math.min(startDay + 29, totalDays); day++) {
            const isActive = activeDaysSet.has(day);
            const isToday = day === currentDay;
            const isFuture = day > currentDay;

            let classes = 'gam-calendar-day';
            if (isActive) classes += ' active';
            if (isToday) classes += ' today';
            if (isFuture) classes += ' future';

            html += `<div class="${classes}" data-day="${day}">${day}</div>`;
        }

        return html;
    }

    /**
     * Mark a day as active
     * @param {number} day - Day number to mark
     */
    function markDayActive(day) {
        if (!streakData) return;

        if (!streakData.activeDays.includes(day)) {
            streakData.activeDays.push(day);
            streakData.current++;

            // Update longest if needed
            if (streakData.current > streakData.longest) {
                streakData.longest = streakData.current;
            }
        }

        const dayEl = document.querySelector(`.gam-calendar-day[data-day="${day}"]`);
        if (dayEl && !dayEl.classList.contains('active')) {
            dayEl.classList.add('active');
            dayEl.style.animation = 'streakPop 0.4s ease-out';
        }

        updateStreakCount();
    }

    /**
     * Update streak counter display
     */
    function updateStreakCount() {
        const countEl = document.querySelector('.gam-streak-count');
        if (countEl && streakData) {
            countEl.innerHTML = `
                ${streakData.current}
                <span>jours consécutifs</span>
            `;
        }

        const recordEl = document.querySelector('.gam-streak-stats span');
        if (recordEl && streakData) {
            recordEl.textContent = `Record: ${streakData.longest} jours`;
        }
    }

    /**
     * Check if streak is broken
     * @returns {boolean} True if streak is broken
     */
    function isStreakBroken() {
        if (!streakData) return false;

        const today = new Date().getDate();
        const yesterday = today - 1;

        return !streakData.activeDays.includes(yesterday) &&
               !streakData.activeDays.includes(today);
    }

    /**
     * Get current streak length
     */
    function getCurrentStreak() {
        return streakData?.current || 0;
    }

    /**
     * Get longest streak
     */
    function getLongestStreak() {
        return streakData?.longest || 0;
    }

    /**
     * Get active days
     */
    function getActiveDays() {
        return streakData?.activeDays || [];
    }

    /**
     * Get current data
     */
    function getData() {
        return streakData;
    }

    return {
        render,
        markDayActive,
        isStreakBroken,
        getCurrentStreak,
        getLongestStreak,
        getActiveDays,
        getData
    };
})();

if (typeof window !== 'undefined') {
    window.GamificationStreak = GamificationStreak;
}

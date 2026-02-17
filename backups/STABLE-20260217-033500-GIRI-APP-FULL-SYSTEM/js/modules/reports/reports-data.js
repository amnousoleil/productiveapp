/**
 * REPORTS DATA ENGINE - ProductiveApp Premium
 * Moteur de calcul de donnees pour tous les composants rapports
 */

const ReportsData = (function() {
    'use strict';

    // === HELPERS ===
    function getTasks() {
        return (typeof AppState !== 'undefined' && Array.isArray(AppState.tasks)) ? AppState.tasks : [];
    }
    function getProjects() {
        return (typeof AppState !== 'undefined' && Array.isArray(AppState.projects)) ? AppState.projects : [];
    }
    function getUsers() {
        return (typeof AppConfig !== 'undefined' && Array.isArray(AppConfig.USERS)) ? AppConfig.USERS : [];
    }

    function getTaskStatus(t) { return t.status || 'todo'; }
    function getTaskPriority(t) { return t.priority?.level || t.priority || 3; }
    function getTaskProject(t) { return t.project || t.project_id || null; }
    function getTaskCreatedAt(t) { return t.created_at || t.createdAt || null; }
    function getTaskCompletedAt(t) { return t.completed_at || t.completedAt || t.updated_at || t.updatedAt || null; }
    function getTaskDueDate(t) { return t.due_date || t.dueDate || t.deadline || null; }

    function startOfDay(d) {
        var r = new Date(d);
        r.setHours(0, 0, 0, 0);
        return r;
    }
    function daysAgo(n) {
        var d = new Date();
        d.setDate(d.getDate() - n);
        return startOfDay(d);
    }
    function dateKey(d) {
        var dt = new Date(d);
        return dt.getFullYear() + '-' + String(dt.getMonth() + 1).padStart(2, '0') + '-' + String(dt.getDate()).padStart(2, '0');
    }
    function dayOfWeek(d) { return new Date(d).getDay(); }
    function hourOf(d) { return new Date(d).getHours(); }

    // === KPI: Tasks Completed ===
    function getTasksCompleted(periodDays) {
        var tasks = getTasks();
        var now = startOfDay(new Date());
        var periodStart = daysAgo(periodDays);
        var prevStart = daysAgo(periodDays * 2);

        var current = 0, previous = 0;
        tasks.forEach(function(t) {
            if (getTaskStatus(t) !== 'done') return;
            var completed = getTaskCompletedAt(t);
            if (!completed) return;
            var cd = startOfDay(new Date(completed));
            if (cd >= periodStart && cd <= now) current++;
            else if (cd >= prevStart && cd < periodStart) previous++;
        });

        return {
            current: current,
            previous: previous,
            trend: current > previous ? 'up' : current < previous ? 'down' : 'flat',
            diff: current - previous
        };
    }

    // === KPI: Completion Rate ===
    function getCompletionRate(periodDays) {
        var tasks = getTasks();
        var periodStart = daysAgo(periodDays);
        var prevStart = daysAgo(periodDays * 2);
        var now = startOfDay(new Date());

        var currentTotal = 0, currentDone = 0;
        var prevTotal = 0, prevDone = 0;

        tasks.forEach(function(t) {
            var created = getTaskCreatedAt(t);
            if (!created) return;
            var cd = startOfDay(new Date(created));
            if (cd >= periodStart && cd <= now) {
                currentTotal++;
                if (getTaskStatus(t) === 'done') currentDone++;
            } else if (cd >= prevStart && cd < periodStart) {
                prevTotal++;
                if (getTaskStatus(t) === 'done') prevDone++;
            }
        });

        var currentRate = currentTotal > 0 ? Math.round((currentDone / currentTotal) * 100) : 0;
        var prevRate = prevTotal > 0 ? Math.round((prevDone / prevTotal) * 100) : 0;

        // Fallback: use all tasks if period filter gives nothing
        if (currentTotal === 0) {
            var allDone = tasks.filter(function(t) { return getTaskStatus(t) === 'done'; }).length;
            currentRate = tasks.length > 0 ? Math.round((allDone / tasks.length) * 100) : 0;
        }

        return {
            current: currentRate,
            previous: prevRate,
            trend: currentRate > prevRate ? 'up' : currentRate < prevRate ? 'down' : 'flat',
            diff: currentRate - prevRate
        };
    }

    // === KPI: Streak ===
    function getStreak() {
        var tasks = getTasks();
        var doneTasks = tasks.filter(function(t) { return getTaskStatus(t) === 'done' && getTaskCompletedAt(t); });
        if (!doneTasks.length) return 0;

        // Group by day
        var dayMap = {};
        doneTasks.forEach(function(t) {
            var key = dateKey(getTaskCompletedAt(t));
            dayMap[key] = true;
        });

        var streak = 0;
        var day = new Date();
        // Check today first
        if (!dayMap[dateKey(day)]) {
            // Maybe streak ended yesterday
            day.setDate(day.getDate() - 1);
            if (!dayMap[dateKey(day)]) return 0;
        }

        while (dayMap[dateKey(day)]) {
            streak++;
            day.setDate(day.getDate() - 1);
        }
        return streak;
    }

    // === KPI: Active Projects with health ===
    function getActiveProjects() {
        var projects = getProjects();
        var tasks = getTasks();
        var active = projects.filter(function(p) { return p.status !== 'archived'; });

        var result = active.map(function(p) {
            var projectTasks = tasks.filter(function(t) { return getTaskProject(t) === p.id; });
            var total = projectTasks.length;
            var done = projectTasks.filter(function(t) { return getTaskStatus(t) === 'done'; }).length;
            var inprogress = projectTasks.filter(function(t) { return getTaskStatus(t) === 'inprogress'; }).length;
            var todo = total - done - inprogress;
            var progress = total > 0 ? Math.round((done / total) * 100) : 0;
            var overdue = projectTasks.filter(function(t) {
                var due = getTaskDueDate(t);
                return due && new Date(due) < new Date() && getTaskStatus(t) !== 'done';
            }).length;
            var health = progress >= 70 ? 'green' : progress >= 40 ? 'yellow' : 'red';
            if (overdue > total * 0.3) health = 'red';

            return {
                id: p.id,
                name: p.name,
                icon: p.icon || '\u{1F4C1}',
                color: p.color || '#6b7280',
                progress: progress,
                total: total,
                todoCount: todo,
                inprogressCount: inprogress,
                doneCount: done,
                overdue: overdue,
                health: health,
                donePercent: total > 0 ? Math.round((done / total) * 100) : 0,
                inprogressPercent: total > 0 ? Math.round((inprogress / total) * 100) : 0
            };
        }).sort(function(a, b) { return b.total - a.total; });

        return { count: result.length, projects: result };
    }

    // === KPI: Team Velocity ===
    function getTeamVelocity(periodDays) {
        var completed = getTasksCompleted(periodDays);
        var currentVelocity = periodDays > 0 ? Math.round((completed.current / periodDays) * 10) / 10 : 0;
        var prevVelocity = periodDays > 0 ? Math.round((completed.previous / periodDays) * 10) / 10 : 0;

        return {
            current: currentVelocity,
            previous: prevVelocity,
            trend: currentVelocity > prevVelocity ? 'up' : currentVelocity < prevVelocity ? 'down' : 'flat',
            diff: Math.round((currentVelocity - prevVelocity) * 10) / 10
        };
    }

    // === SPARKLINE: Daily completion series ===
    function getDailyCompletionSeries(days) {
        var tasks = getTasks();
        var series = [];
        for (var i = days - 1; i >= 0; i--) {
            var day = daysAgo(i);
            var key = dateKey(day);
            var count = 0;
            tasks.forEach(function(t) {
                if (getTaskStatus(t) === 'done') {
                    var completed = getTaskCompletedAt(t);
                    if (completed && dateKey(completed) === key) count++;
                }
            });
            series.push(count);
        }
        return series;
    }

    // === HEATMAP: 365-day contribution data ===
    function getContributionHeatmap() {
        var tasks = getTasks();
        var data = [];

        // Build completion map
        var completionMap = {};
        tasks.forEach(function(t) {
            if (getTaskStatus(t) !== 'done') return;
            var completed = getTaskCompletedAt(t);
            if (!completed) return;
            var key = dateKey(completed);
            completionMap[key] = (completionMap[key] || 0) + 1;
        });

        // Generate 365 days ending today
        // Align to start of first week (Sunday)
        var today = new Date();
        var endDate = startOfDay(today);
        var startDate = new Date(endDate);
        startDate.setDate(startDate.getDate() - 364);
        // Align to Sunday
        var dayOffset = startDate.getDay();
        startDate.setDate(startDate.getDate() - dayOffset);

        var current = new Date(startDate);
        while (current <= endDate) {
            var key = dateKey(current);
            data.push({
                date: key,
                count: completionMap[key] || 0
            });
            current.setDate(current.getDate() + 1);
        }

        return data;
    }

    // === TIMELINE: 30-day productivity ===
    function getProductivityTimeline(days) {
        var tasks = getTasks();
        var DAYS_FR = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
        var currentLabels = [], currentData = [], prevData = [];

        for (var i = days - 1; i >= 0; i--) {
            var day = daysAgo(i);
            var prevDay = daysAgo(i + days);
            var key = dateKey(day);
            var prevKey = dateKey(prevDay);

            var count = 0, prevCount = 0;
            tasks.forEach(function(t) {
                if (getTaskStatus(t) !== 'done') return;
                var completed = getTaskCompletedAt(t);
                if (!completed) return;
                var ck = dateKey(completed);
                if (ck === key) count++;
                if (ck === prevKey) prevCount++;
            });

            var d = new Date(day);
            var label = d.getDate() + '/' + (d.getMonth() + 1);
            currentLabels.push(label);
            currentData.push(count);
            prevData.push(prevCount);
        }

        return {
            current: { labels: currentLabels, data: currentData },
            previous: { labels: currentLabels, data: prevData }
        };
    }

    // === PROJECT HEALTH ===
    function getProjectHealth() {
        return getActiveProjects().projects.slice(0, 8);
    }

    // === CHART: Task Distribution (doughnut) ===
    function getTaskDistributionChart() {
        var tasks = getTasks();
        var done = tasks.filter(function(t) { return getTaskStatus(t) === 'done'; }).length;
        var inprogress = tasks.filter(function(t) { return getTaskStatus(t) === 'inprogress'; }).length;
        var todo = tasks.filter(function(t) { return getTaskStatus(t) === 'todo'; }).length;

        return {
            labels: ['Termine', 'En cours', 'A faire'],
            datasets: [{
                data: [done, inprogress, todo],
                backgroundColor: ['#10b981', '#f59e0b', '#3b82f6'],
                borderWidth: 0,
                hoverBorderWidth: 2,
                hoverBorderColor: 'rgba(255,255,255,0.3)'
            }],
            total: tasks.length
        };
    }

    // === CHART: Productivity Trend (14 days area) ===
    function getProductivityTrendChart(days) {
        days = days || 14;
        var timeline = getProductivityTimeline(days);
        return {
            labels: timeline.current.labels,
            currentData: timeline.current.data,
            previousData: timeline.previous.data
        };
    }

    // === CHART: Priority Matrix (stacked horizontal bars) ===
    function getPriorityMatrixChart() {
        var tasks = getTasks();
        var priorities = [
            { label: 'Urgent', level: 1 },
            { label: 'Important', level: 2 },
            { label: 'Normal', level: 3 },
            { label: 'Basse', level: 4 }
        ];

        var todoData = [], inprogressData = [], doneData = [];
        var labels = [];

        priorities.forEach(function(p) {
            var filtered = tasks.filter(function(t) { return getTaskPriority(t) === p.level; });
            labels.push(p.label);
            todoData.push(filtered.filter(function(t) { return getTaskStatus(t) === 'todo'; }).length);
            inprogressData.push(filtered.filter(function(t) { return getTaskStatus(t) === 'inprogress'; }).length);
            doneData.push(filtered.filter(function(t) { return getTaskStatus(t) === 'done'; }).length);
        });

        return {
            labels: labels,
            datasets: [
                { label: 'A faire', data: todoData, backgroundColor: 'rgba(148,163,184,0.6)' },
                { label: 'En cours', data: inprogressData, backgroundColor: 'rgba(245,158,11,0.7)' },
                { label: 'Fait', data: doneData, backgroundColor: 'rgba(16,185,129,0.7)' }
            ]
        };
    }

    // === CHART: Work Pattern Heatmap (7x24 matrix) ===
    function getWorkPatternHeatmap() {
        var tasks = getTasks();
        // 7 rows (days: 0=Dim..6=Sam) x 24 cols (hours)
        var matrix = [];
        for (var d = 0; d < 7; d++) {
            matrix[d] = [];
            for (var h = 0; h < 24; h++) {
                matrix[d][h] = 0;
            }
        }

        tasks.forEach(function(t) {
            var created = getTaskCreatedAt(t);
            if (!created) return;
            var dt = new Date(created);
            matrix[dt.getDay()][dt.getHours()]++;

            // Also count completions
            if (getTaskStatus(t) === 'done') {
                var completed = getTaskCompletedAt(t);
                if (completed) {
                    var cdt = new Date(completed);
                    matrix[cdt.getDay()][cdt.getHours()]++;
                }
            }
        });

        return matrix;
    }

    // === CHART: Project Comparison (grouped bars) ===
    function getProjectComparisonChart() {
        var projects = getActiveProjects().projects.slice(0, 6);
        var labels = [], totalData = [], doneData = [];

        projects.forEach(function(p) {
            labels.push(p.name.length > 12 ? p.name.substring(0, 12) + '...' : p.name);
            totalData.push(p.total);
            doneData.push(p.doneCount);
        });

        return {
            labels: labels,
            datasets: [
                { label: 'Total', data: totalData, backgroundColor: 'rgba(148,163,184,0.3)', borderColor: 'rgba(148,163,184,0.6)', borderWidth: 1 },
                { label: 'Termine', data: doneData, backgroundColor: 'rgba(16,185,129,0.6)', borderColor: '#10b981', borderWidth: 1 }
            ]
        };
    }

    // === CHART: Weekly Velocity (8 weeks line + target) ===
    function getWeeklyVelocityChart() {
        var tasks = getTasks();
        var weeks = 8;
        var labels = [], data = [];
        var total = 0;

        for (var w = weeks - 1; w >= 0; w--) {
            var weekStart = daysAgo(w * 7 + 6);
            var weekEnd = daysAgo(w * 7);
            var weekKey = 'S' + (weeks - w);
            labels.push(weekKey);

            var count = 0;
            tasks.forEach(function(t) {
                if (getTaskStatus(t) !== 'done') return;
                var completed = getTaskCompletedAt(t);
                if (!completed) return;
                var cd = startOfDay(new Date(completed));
                if (cd >= weekStart && cd <= weekEnd) count++;
            });
            data.push(count);
            total += count;
        }

        var avg = weeks > 0 ? Math.round(total / weeks) : 0;
        var targetLine = new Array(weeks).fill(avg);

        return {
            labels: labels,
            velocityData: data,
            targetData: targetLine,
            average: avg
        };
    }

    // === SCORE GLOBAL ===
    function getGlobalScore() {
        var tasks = getTasks();
        if (!tasks.length) return 0;

        var stats = {
            total: tasks.length,
            done: tasks.filter(function(t) { return getTaskStatus(t) === 'done'; }).length,
            inprogress: tasks.filter(function(t) { return getTaskStatus(t) === 'inprogress'; }).length
        };

        var completionRate = stats.total > 0 ? (stats.done / stats.total) : 0;
        var streak = getStreak();
        var velocity = getTeamVelocity(7);

        // Score calculation (0-100)
        var score = 0;
        score += Math.min(completionRate * 40, 40);         // 40 pts max for completion
        score += Math.min(streak * 3, 15);                   // 15 pts max for streak
        score += Math.min(stats.inprogress * 2, 15);         // 15 pts for active work
        score += Math.min(velocity.current * 5, 20);         // 20 pts for velocity
        score += (velocity.trend === 'up' ? 10 : velocity.trend === 'flat' ? 5 : 0); // 10 pts trend bonus

        return Math.min(Math.round(score), 100);
    }

    return {
        getTasks: getTasks,
        getProjects: getProjects,
        getUsers: getUsers,
        getTasksCompleted: getTasksCompleted,
        getCompletionRate: getCompletionRate,
        getStreak: getStreak,
        getActiveProjects: getActiveProjects,
        getTeamVelocity: getTeamVelocity,
        getDailyCompletionSeries: getDailyCompletionSeries,
        getContributionHeatmap: getContributionHeatmap,
        getProductivityTimeline: getProductivityTimeline,
        getProjectHealth: getProjectHealth,
        getTaskDistributionChart: getTaskDistributionChart,
        getProductivityTrendChart: getProductivityTrendChart,
        getPriorityMatrixChart: getPriorityMatrixChart,
        getWorkPatternHeatmap: getWorkPatternHeatmap,
        getProjectComparisonChart: getProjectComparisonChart,
        getWeeklyVelocityChart: getWeeklyVelocityChart,
        getGlobalScore: getGlobalScore
    };
})();

if (typeof window !== 'undefined') {
    window.ReportsData = ReportsData;
}

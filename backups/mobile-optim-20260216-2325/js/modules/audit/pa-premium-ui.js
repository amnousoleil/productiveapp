/**
 * PSYCHO-AUDIT PREMIUM UI - Multi-tab therapeutic expérience
 * ProductiveApp v6.0 - Interface Haut de Gamme
 *
 * Systeme d'onglets :
 * 1. AUDIT - Questionnaire enrichi + résultats
 * 2. THERAPIE - Exercices prescrits selon le profil
 * 3. BIBLIOTHEQUE - Catalogue complet des exercices
 * 4. PROGRAMMES - Protocoles 12 semaines
 * 5. JOURNAL - Suivi quotidien & progression
 */

const PaPremiumUI = (function() {
    'use strict';

    let currentTab = 'audit';
    let currentExercise = null;
    let currentProgram = null;
    let exerciseFilter = 'all';
    let journalEntries = [];

    // =========================================================================
    // NAVIGATION ONGLETS
    // =========================================================================

    function renderTabBar() {
        var tabs = [
            { id: 'audit', icon: '🧠', label: 'Audit' },
            { id: 'therapy', icon: '💊', label: 'Thérapie' },
            { id: 'library', icon: '📚', label: 'Bibliothèque' },
            { id: 'programs', icon: '🗺️', label: 'Programmes' },
            { id: 'journal', icon: '📓', label: 'Journal' }
        ];

        var html = '<div class="pa-premium-tabs">';
        tabs.forEach(function(tab) {
            html += '<button class="pa-tab-btn ' + (currentTab === tab.id ? 'active' : '') + '" onclick="PaPremiumUI.switchTab(\'' + tab.id + '\')">' +
                '<span class="pa-tab-icon">' + tab.icon + '</span>' +
                '<span class="pa-tab-label">' + tab.label + '</span>' +
                '</button>';
        });
        html += '</div>';
        return html;
    }

    function switchTab(tabId) {
        currentTab = tabId;
        currentExercise = null;
        renderPremiumView();
    }

    // =========================================================================
    // RENDU PRINCIPAL
    // =========================================================================

    function renderPremiumView() {
        var container = document.getElementById('view-psycho-audit');
        if (!container) return;

        var html = '<div class="pa-premium-wrapper">';

        // Header premium
        html += '<header class="pa-premium-header">' +
            '<div class="pa-premium-title-row">' +
            '<h1 class="pa-premium-title">Psycho-Audit</h1>' +
            '<span class="pa-premium-badge">Premium</span>' +
            '</div>' +
            '<p class="pa-premium-subtitle">Thérapie comportementale · Développement personnel · Éveil de conscience</p>' +
            '</header>';

        // Tab bar
        html += renderTabBar();

        // Content
        html += '<div class="pa-premium-content">';
        switch (currentTab) {
            case 'audit': html += renderAuditTab(); break;
            case 'therapy': html += renderTherapyTab(); break;
            case 'library': html += renderLibraryTab(); break;
            case 'programs': html += renderProgramsTab(); break;
            case 'journal': html += renderJournalTab(); break;
        }
        html += '</div>';

        html += '</div>';
        container.innerHTML = html;
    }

    // =========================================================================
    // ONGLET AUDIT (delegue au render existant)
    // =========================================================================

    function renderAuditTab() {
        var state = PaState.getState();
        if (state.showResults) {
            return renderEnhancedResults();
        }
        return PaRender.renderQuestionnaire();
    }

    function renderEnhancedResults() {
        var html = PaRender.renderResults();

        // Ajouter les exercices recommandes apres les résultats
        if (typeof PaTherapyLibrary !== 'undefined') {
            var axisScores = PaState.calculateAxisScores();
            var recommended = PaTherapyLibrary.getRecommendedExercises(axisScores);
            var program = PaTherapyLibrary.getRecommendedProgram(axisScores);

            if (recommended.length > 0) {
                html += '<div class="pa-recommended-section">';
                html += '<h3 class="pa-section-title">Exercices thérapeutiques recommandes</h3>';
                html += '<p class="pa-section-desc">Bases sur vos résultats, voici les exercices valides qui vous aideront le plus</p>';
                html += '<div class="pa-exercise-cards">';
                recommended.forEach(function(ex) {
                    var cat = PaTherapyLibrary.getCategory(ex.category);
                    html += renderExerciseCard(ex, cat);
                });
                html += '</div>';
                html += '</div>';
            }

            if (program) {
                html += '<div class="pa-program-suggestion">';
                html += '<div class="pa-program-suggestion-inner">';
                html += '<span class="pa-program-icon">' + program.icon + '</span>';
                html += '<div class="pa-program-info">';
                html += '<h4>Programme recommande : ' + program.title + '</h4>';
                html += '<p>' + program.description + '</p>';
                html += '</div>';
                html += '<button class="pa-btn-program" onclick="PaPremiumUI.switchTab(\'programs\'); PaPremiumUI.selectProgram(\'' + program.id + '\');">Voir le programme</button>';
                html += '</div>';
                html += '</div>';
            }
        }

        return html;
    }

    // =========================================================================
    // ONGLET THERAPIE - Exercices prescrits selon le profil
    // =========================================================================

    function renderTherapyTab() {
        if (currentExercise) {
            return renderExerciseDetail(currentExercise);
        }

        var html = '<div class="pa-therapy-tab">';
        var axisScores = PaState.calculateAxisScores();
        var hasScores = axisScores && Object.keys(axisScores).length > 0;

        if (!hasScores) {
            html += '<div class="pa-therapy-empty">';
            html += '<div class="pa-empty-icon">🎯</div>';
            html += '<h3>Completez votre premier audit</h3>';
            html += '<p>Realisez un audit psycho-productivite pour recevoir des exercices thérapeutiques personnalisés adaptes a votre profil.</p>';
            html += '<button class="pa-btn-primary" onclick="PaPremiumUI.switchTab(\'audit\')">Commencer l\'audit</button>';
            html += '</div>';
        } else {
            var recommended = typeof PaTherapyLibrary !== 'undefined' ? PaTherapyLibrary.getRecommendedExercises(axisScores) : [];

            html += '<div class="pa-therapy-header">';
            html += '<h2>Votre prescription thérapeutique</h2>';
            html += '<p>Exercices sélectionnes selon votre profil psycho-productif actuel</p>';
            html += '</div>';

            // Urgences / Quick wins
            html += '<div class="pa-therapy-section">';
            html += '<h3 class="pa-section-title"><span class="pa-section-icon">🚨</span> Premiers secours (en cas de crise)</h3>';
            html += '<div class="pa-exercise-cards">';
            ['dbt_tipp', 'se_grounding', 'mbsr_3min_breathing'].forEach(function(id) {
                var ex = typeof PaTherapyLibrary !== 'undefined' ? PaTherapyLibrary.getExercise(id) : null;
                if (ex) {
                    var cat = PaTherapyLibrary.getCategory(getCategoryForExercise(id));
                    html += renderExerciseCard(ex, cat, true);
                }
            });
            html += '</div></div>';

            // Exercices quotidiens
            html += '<div class="pa-therapy-section">';
            html += '<h3 class="pa-section-title"><span class="pa-section-icon">☀️</span> Pratique quotidienne recommandee</h3>';
            html += '<div class="pa-daily-routine">';

            var dailyRoutine = [
                { time: 'Matin (10 min)', exercise: 'resil_cohérence_cardiaque', reason: 'Calibrer le système nerveux pour la journée' },
                { time: 'Journee (3 min)', exercise: 'mbsr_3min_breathing', reason: 'Ancrage de pleine conscience entre les taches' },
                { time: 'Soir (15 min)', exercise: 'cbt_thought_record', reason: 'Traiter les evenements de la journée' }
            ];

            dailyRoutine.forEach(function(slot) {
                var ex = typeof PaTherapyLibrary !== 'undefined' ? PaTherapyLibrary.getExercise(slot.exercise) : null;
                if (ex) {
                    html += '<div class="pa-daily-slot" onclick="PaPremiumUI.openExercise(\'' + slot.exercise + '\')">';
                    html += '<div class="pa-daily-time">' + slot.time + '</div>';
                    html += '<div class="pa-daily-info">';
                    html += '<div class="pa-daily-name">' + ex.title + '</div>';
                    html += '<div class="pa-daily-reason">' + slot.reason + '</div>';
                    html += '</div>';
                    html += '<div class="pa-daily-arrow">→</div>';
                    html += '</div>';
                }
            });
            html += '</div></div>';

            // Exercices personnalisés
            if (recommended.length > 0) {
                html += '<div class="pa-therapy-section">';
                html += '<h3 class="pa-section-title"><span class="pa-section-icon">🎯</span> Personnalises pour vos axes faibles</h3>';
                html += '<div class="pa-exercise-cards">';
                recommended.forEach(function(ex) {
                    var cat = PaTherapyLibrary.getCategory(ex.category);
                    html += renderExerciseCard(ex, cat);
                });
                html += '</div></div>';
            }

            // Exercices profonds hebdomadaires
            html += '<div class="pa-therapy-section">';
            html += '<h3 class="pa-section-title"><span class="pa-section-icon">🌊</span> Travail profond hebdomadaire</h3>';
            html += '<div class="pa-exercise-cards">';
            ['shadow_mirror_exercise', 'shadow_inner_child', 'spirit_vipassana_basic', 'act_values_compass'].forEach(function(id) {
                var ex = typeof PaTherapyLibrary !== 'undefined' ? PaTherapyLibrary.getExercise(id) : null;
                if (ex) {
                    var cat = PaTherapyLibrary.getCategory(getCategoryForExercise(id));
                    html += renderExerciseCard(ex, cat);
                }
            });
            html += '</div></div>';
        }

        html += '</div>';
        return html;
    }

    // =========================================================================
    // ONGLET BIBLIOTHEQUE - Catalogue complet
    // =========================================================================

    function renderLibraryTab() {
        if (currentExercise) {
            return renderExerciseDetail(currentExercise);
        }

        var html = '<div class="pa-library-tab">';

        // Filtre categories
        var categories = typeof PaTherapyLibrary !== 'undefined' ? PaTherapyLibrary.getCategories() : [];

        html += '<div class="pa-library-header">';
        html += '<h2>Bibliothèque Therapeutique</h2>';
        html += '<p>' + getTotalExerciseCount() + ' exercices valides · 10 approches · 4 niveaux</p>';
        html += '</div>';

        html += '<div class="pa-filter-bar">';
        html += '<button class="pa-filter-btn ' + (exerciseFilter === 'all' ? 'active' : '') + '" onclick="PaPremiumUI.setFilter(\'all\')">Tous</button>';
        categories.forEach(function(cat) {
            html += '<button class="pa-filter-btn ' + (exerciseFilter === cat.id ? 'active' : '') + '" onclick="PaPremiumUI.setFilter(\'' + cat.id + '\')">' +
                '<span>' + cat.icon + '</span> ' + cat.label + '</button>';
        });
        html += '</div>';

        // Exercices filtres
        if (exerciseFilter === 'all') {
            categories.forEach(function(cat) {
                var exercises = typeof PaTherapyLibrary !== 'undefined' ? PaTherapyLibrary.getExercises(cat.id) : [];
                if (exercises.length > 0) {
                    html += '<div class="pa-category-section">';
                    html += '<div class="pa-category-header" style="border-left: 3px solid ' + cat.color + '">';
                    html += '<span class="pa-category-icon">' + cat.icon + '</span>';
                    html += '<div class="pa-category-info">';
                    html += '<h3>' + cat.label + '</h3>';
                    html += '<p>' + cat.description + '</p>';
                    html += '</div>';
                    html += '</div>';
                    html += '<div class="pa-exercise-cards">';
                    exercises.forEach(function(ex) { html += renderExerciseCard(ex, cat); });
                    html += '</div></div>';
                }
            });
        } else {
            var cat = typeof PaTherapyLibrary !== 'undefined' ? PaTherapyLibrary.getCategory(exerciseFilter) : null;
            var exercises = typeof PaTherapyLibrary !== 'undefined' ? PaTherapyLibrary.getExercises(exerciseFilter) : [];
            if (cat && exercises.length > 0) {
                html += '<div class="pa-category-section">';
                html += '<div class="pa-category-header" style="border-left: 3px solid ' + cat.color + '">';
                html += '<span class="pa-category-icon">' + cat.icon + '</span>';
                html += '<div class="pa-category-info">';
                html += '<h3>' + cat.label + '</h3>';
                html += '<p>' + cat.description + '</p>';
                html += '</div>';
                html += '</div>';
                html += '<div class="pa-exercise-cards">';
                exercises.forEach(function(ex) { html += renderExerciseCard(ex, cat); });
                html += '</div></div>';
            }
        }

        html += '</div>';
        return html;
    }

    // =========================================================================
    // ONGLET PROGRAMMES - Protocoles 12 semaines
    // =========================================================================

    function renderProgramsTab() {
        if (currentProgram) {
            return renderProgramDetail(currentProgram);
        }
        if (currentExercise) {
            return renderExerciseDetail(currentExercise);
        }

        var html = '<div class="pa-programs-tab">';
        html += '<div class="pa-programs-header">';
        html += '<h2>Programmes Therapeutiques</h2>';
        html += '<p>Protocoles de transformation en 12 semaines, construits par des experts, valides par la science</p>';
        html += '</div>';

        var programs = typeof PaTherapyLibrary !== 'undefined' ? PaTherapyLibrary.getPrograms() : [];

        // Programme recommande
        var axisScores = PaState.calculateAxisScores();
        var recommended = typeof PaTherapyLibrary !== 'undefined' ? PaTherapyLibrary.getRecommendedProgram(axisScores) : null;

        programs.forEach(function(prog) {
            var isRecommended = recommended && recommended.id === prog.id;
            html += '<div class="pa-program-card ' + (isRecommended ? 'recommended' : '') + '" onclick="PaPremiumUI.selectProgram(\'' + prog.id + '\')">';
            if (isRecommended) {
                html += '<div class="pa-program-rec-badge">Recommande pour votre profil</div>';
            }
            html += '<div class="pa-program-card-header">';
            html += '<span class="pa-program-card-icon">' + prog.icon + '</span>';
            html += '<div class="pa-program-card-info">';
            html += '<h3>' + prog.title + '</h3>';
            html += '<p class="pa-program-card-subtitle">' + prog.subtitle + '</p>';
            html += '</div>';
            html += '</div>';
            html += '<p class="pa-program-card-desc">' + prog.description + '</p>';
            html += '<div class="pa-program-card-meta">';
            html += '<span class="pa-meta-item">📅 ' + prog.duration + '</span>';
            html += '<span class="pa-meta-item">🎯 ' + prog.target_axes.length + ' axes cibles</span>';
            html += '<span class="pa-meta-item">📊 ' + prog.weeks.length * 3 + ' exercices</span>';
            html += '</div>';
            html += '</div>';
        });

        html += '</div>';
        return html;
    }

    function renderProgramDetail(programId) {
        var prog = typeof PaTherapyLibrary !== 'undefined' ? PaTherapyLibrary.getProgram(programId) : null;
        if (!prog) return '<div>Programme non trouve</div>';

        var html = '<div class="pa-program-detail">';
        html += '<button class="pa-back-btn" onclick="PaPremiumUI.backFromProgram()">← Retour aux programmes</button>';

        html += '<div class="pa-program-detail-header">';
        html += '<span class="pa-program-detail-icon">' + prog.icon + '</span>';
        html += '<h2>' + prog.title + '</h2>';
        html += '<p class="pa-program-detail-subtitle">' + prog.subtitle + '</p>';
        html += '<p class="pa-program-detail-desc">' + prog.description + '</p>';
        html += '</div>';

        // Timeline des semaines
        html += '<div class="pa-program-timeline">';
        prog.weeks.forEach(function(week) {
            html += '<div class="pa-week-card">';
            html += '<div class="pa-week-header">';
            html += '<span class="pa-week-number">S' + week.week + '</span>';
            html += '<span class="pa-week-theme">' + week.theme + '</span>';
            html += '</div>';
            html += '<div class="pa-week-exercises">';
            week.exercises.forEach(function(exId) {
                var ex = typeof PaTherapyLibrary !== 'undefined' ? PaTherapyLibrary.getExercise(exId) : null;
                if (ex) {
                    html += '<div class="pa-week-exercise" onclick="PaPremiumUI.openExercise(\'' + exId + '\')">';
                    html += '<span class="pa-week-ex-title">' + ex.title + '</span>';
                    html += '<span class="pa-week-ex-dur">' + ex.duration + '</span>';
                    html += '</div>';
                }
            });
            html += '</div>';
            html += '</div>';
        });
        html += '</div>';

        html += '</div>';
        return html;
    }

    // =========================================================================
    // ONGLET JOURNAL - Suivi quotidien
    // =========================================================================

    function renderJournalTab() {
        var html = '<div class="pa-journal-tab">';
        html += '<div class="pa-journal-header">';
        html += '<h2>Journal de Conscience</h2>';
        html += '<p>Votre espace personnel de réflexion et de suivi quotidien</p>';
        html += '</div>';

        // Quick mood check
        html += '<div class="pa-journal-mood">';
        html += '<h3>Comment vous sentez-vous maintenant ?</h3>';
        html += '<div class="pa-mood-buttons">';
        var moods = [
            { emoji: '😫', label: 'Epuise(e)', value: 1 },
            { emoji: '😔', label: 'Difficile', value: 2 },
            { emoji: '😐', label: 'Neutre', value: 3 },
            { emoji: '🙂', label: 'Bien', value: 4 },
            { emoji: '🌟', label: 'Excellent', value: 5 }
        ];
        moods.forEach(function(m) {
            html += '<button class="pa-mood-btn" onclick="PaPremiumUI.logMood(' + m.value + ', \'' + m.label + '\')">' +
                '<span class="pa-mood-emoji">' + m.emoji + '</span>' +
                '<span class="pa-mood-label">' + m.label + '</span>' +
                '</button>';
        });
        html += '</div></div>';

        // Journaling prompts
        html += '<div class="pa-journal-prompts">';
        html += '<h3>Reflexion du jour</h3>';
        var prompts = getRandomPrompts();
        html += '<div class="pa-prompts-list">';
        prompts.forEach(function(p, i) {
            html += '<div class="pa-prompt-card">';
            html += '<div class="pa-prompt-icon">' + p.icon + '</div>';
            html += '<div class="pa-prompt-text">' + p.text + '</div>';
            html += '<textarea class="pa-prompt-input" id="journal-prompt-' + i + '" placeholder="Ecrivez librement..." rows="3"></textarea>';
            html += '</div>';
        });
        html += '</div>';
        html += '<button class="pa-btn-primary" onclick="PaPremiumUI.saveJournal()">Sauvegarder mon journal</button>';
        html += '</div>';

        // Gratitude section
        html += '<div class="pa-journal-gratitude">';
        html += '<h3>3 Gratitudes du jour</h3>';
        html += '<p class="pa-journal-gratitude-desc">La gratitude est l\'exercice le plus puissant de la psychologie positive (Emmons & McCullough, 2003). 3 gratitudes par jour pendant 21 jours augmentent le bonheur de 25%.</p>';
        html += '<div class="pa-gratitude-inputs">';
        for (var i = 1; i <= 3; i++) {
            html += '<div class="pa-gratitude-row">';
            html += '<span class="pa-gratitude-num">' + i + '</span>';
            html += '<input type="text" class="pa-gratitude-input" id="gratitude-' + i + '" placeholder="Je suis reconnaissant(e) pour...">';
            html += '</div>';
        }
        html += '</div>';
        html += '</div>';

        // Exercise tracker
        html += '<div class="pa-journal-tracker">';
        html += '<h3>Exercices realises aujourd\'hui</h3>';
        var exerciseLog = getExerciseLog();
        if (exerciseLog.length > 0) {
            html += '<div class="pa-tracker-list">';
            exerciseLog.forEach(function(log) {
                html += '<div class="pa-tracker-item">';
                html += '<span class="pa-tracker-check">✓</span>';
                html += '<span class="pa-tracker-name">' + log.name + '</span>';
                html += '<span class="pa-tracker-time">' + log.time + '</span>';
                html += '</div>';
            });
            html += '</div>';
        } else {
            html += '<p class="pa-tracker-empty">Aucun exercice realise aujourd\'hui. Allez dans l\'onglet Thérapie pour commencer !</p>';
        }
        html += '</div>';

        html += '</div>';
        return html;
    }

    // =========================================================================
    // RENDU CARTE EXERCICE
    // =========================================================================

    function renderExerciseCard(exercise, category, isUrgent) {
        var catColor = category ? category.color : '#8b5cf6';
        var diffColors = { debutant: '#22c55e', intermediaire: '#f59e0b', avance: '#ef4444' };
        var diffLabel = { debutant: 'Debutant', intermediaire: 'Intermediaire', avance: 'Avance' };

        var html = '<div class="pa-exercise-card ' + (isUrgent ? 'urgent' : '') + '" onclick="PaPremiumUI.openExercise(\'' + exercise.id + '\')">';
        html += '<div class="pa-ex-card-accent" style="background: ' + catColor + '"></div>';
        html += '<div class="pa-ex-card-body">';
        html += '<div class="pa-ex-card-top">';
        html += '<span class="pa-ex-card-diff" style="background: ' + (diffColors[exercise.difficulty] || '#888') + '20; color: ' + (diffColors[exercise.difficulty] || '#888') + '">' + (diffLabel[exercise.difficulty] || exercise.difficulty) + '</span>';
        html += '<span class="pa-ex-card-duration">' + exercise.duration + '</span>';
        html += '</div>';
        html += '<h4 class="pa-ex-card-title">' + exercise.title + '</h4>';
        html += '<p class="pa-ex-card-subtitle">' + exercise.subtitle + '</p>';
        html += '<div class="pa-ex-card-evidence">';
        html += '<span class="pa-evidence-badge">' + exercise.evidence_level + '</span>';
        html += '<span class="pa-evidence-by">' + exercise.validated_by + '</span>';
        html += '</div>';
        html += '</div></div>';
        return html;
    }

    // =========================================================================
    // RENDU DETAIL EXERCICE
    // =========================================================================

    function renderExerciseDetail(exerciseId) {
        var exercise = typeof PaTherapyLibrary !== 'undefined' ? PaTherapyLibrary.getExercise(exerciseId) : null;
        if (!exercise) return '<div>Exercice non trouve</div>';

        var html = '<div class="pa-exercise-detail">';
        html += '<button class="pa-back-btn" onclick="PaPremiumUI.backFromExercise()">← Retour</button>';

        // Header
        html += '<div class="pa-ex-detail-header">';
        html += '<h2>' + exercise.title + '</h2>';
        html += '<p class="pa-ex-detail-subtitle">' + exercise.subtitle + '</p>';
        html += '<div class="pa-ex-detail-meta">';
        html += '<span class="pa-meta-item">⏱️ ' + exercise.duration + '</span>';
        html += '<span class="pa-meta-item">📊 Niveau: ' + exercise.difficulty + '</span>';
        html += '<span class="pa-meta-item">🔁 ' + exercise.frequency + '</span>';
        html += '</div>';
        html += '</div>';

        // Evidence & Validation
        html += '<div class="pa-ex-evidence-box">';
        html += '<div class="pa-evidence-header">';
        html += '<span class="pa-evidence-icon">🔬</span>';
        html += '<h3>Base scientifique</h3>';
        html += '</div>';
        html += '<p class="pa-evidence-text">' + exercise.scientific_basis + '</p>';
        html += '<div class="pa-evidence-footer">';
        html += '<span class="pa-evidence-badge">' + exercise.evidence_level + '</span>';
        html += '<span class="pa-evidence-org">Valide par : ' + exercise.validated_by + '</span>';
        html += '</div>';
        html += '</div>';

        // Description
        html += '<div class="pa-ex-description">';
        html += '<p>' + exercise.description + '</p>';
        html += '</div>';

        // Steps - Guide interactif
        html += '<div class="pa-ex-steps">';
        html += '<h3>Guide pas a pas</h3>';
        exercise.steps.forEach(function(step) {
            html += '<div class="pa-step-card">';
            html += '<div class="pa-step-number">' + step.step + '</div>';
            html += '<div class="pa-step-body">';
            html += '<div class="pa-step-top">';
            html += '<h4>' + step.title + '</h4>';
            html += '<span class="pa-step-dur">' + step.duration + '</span>';
            html += '</div>';
            html += '<p>' + step.instruction + '</p>';
            html += '</div>';
            html += '</div>';
        });
        html += '</div>';

        // Resultats attendus
        html += '<div class="pa-ex-results">';
        html += '<div class="pa-results-header">';
        html += '<span class="pa-results-icon">📈</span>';
        html += '<h3>Resultats attendus</h3>';
        html += '</div>';
        html += '<p>' + exercise.expected_results + '</p>';
        html += '</div>';

        // Temoignage
        if (exercise.testimonial) {
            html += '<div class="pa-ex-testimonial">';
            html += '<div class="pa-testimonial-icon">💬</div>';
            html += '<blockquote>' + exercise.testimonial + '</blockquote>';
            html += '</div>';
        }

        // Contre-indications
        if (exercise.contraindications) {
            html += '<div class="pa-ex-contra">';
            html += '<span class="pa-contra-icon">⚠️</span>';
            html += '<p>' + exercise.contraindications + '</p>';
            html += '</div>';
        }

        // Bouton commencer
        html += '<div class="pa-ex-actions">';
        html += '<button class="pa-btn-primary pa-btn-start" onclick="PaPremiumUI.startExercise(\'' + exercise.id + '\')">Commencer l\'exercice</button>';
        html += '<button class="pa-btn-secondary" onclick="PaPremiumUI.logExercise(\'' + exercise.id + '\')">Marquer comme fait</button>';
        html += '</div>';

        html += '</div>';
        return html;
    }

    // =========================================================================
    // TIMER D'EXERCICE GUIDE
    // =========================================================================

    function startExercise(exerciseId) {
        var exercise = typeof PaTherapyLibrary !== 'undefined' ? PaTherapyLibrary.getExercise(exerciseId) : null;
        if (!exercise) return;

        var container = document.querySelector('.pa-ex-steps');
        if (!container) return;

        var stepIndex = 0;
        var steps = exercise.steps;

        function showStep(idx) {
            if (idx >= steps.length) {
                container.innerHTML = '<div class="pa-guided-complete">' +
                    '<div class="pa-complete-icon">✨</div>' +
                    '<h3>Exercice termine !</h3>' +
                    '<p>Prenez un moment pour observer comment vous vous sentez.</p>' +
                    '<button class="pa-btn-primary" onclick="PaPremiumUI.logExercise(\'' + exerciseId + '\')">Enregistrer dans mon journal</button>' +
                    '</div>';
                return;
            }

            var step = steps[idx];
            var durMatch = step.duration.match(/(\d+)/);
            var durSec = durMatch ? parseInt(durMatch[1]) * 60 : 120;

            container.innerHTML = '<div class="pa-guided-step">' +
                '<div class="pa-guided-progress"><div class="pa-guided-fill" style="width: ' + ((idx + 1) / steps.length * 100) + '%"></div></div>' +
                '<div class="pa-guided-step-num">Etape ' + (idx + 1) + '/' + steps.length + '</div>' +
                '<h3 class="pa-guided-title">' + step.title + '</h3>' +
                '<p class="pa-guided-instruction">' + step.instruction + '</p>' +
                '<div class="pa-guided-timer" id="guided-timer">' + formatTime(durSec) + '</div>' +
                '<div class="pa-guided-btns">' +
                (idx > 0 ? '<button class="pa-btn-secondary" onclick="PaPremiumUI._showGuidedStep(' + (idx - 1) + ')">← Precedent</button>' : '') +
                '<button class="pa-btn-primary" onclick="PaPremiumUI._showGuidedStep(' + (idx + 1) + ')">Suivant →</button>' +
                '</div>' +
                '</div>';

            // Timer
            var remaining = durSec;
            var timerEl = document.getElementById('guided-timer');
            var interval = setInterval(function() {
                remaining--;
                if (timerEl) timerEl.textContent = formatTime(remaining);
                if (remaining <= 0) {
                    clearInterval(interval);
                    if (timerEl) timerEl.textContent = 'Temps ecoule';
                }
            }, 1000);

            window._guidedInterval = interval;
        }

        // Expose pour les onclick
        window.PaPremiumUI._showGuidedStep = function(idx) {
            if (window._guidedInterval) clearInterval(window._guidedInterval);
            showStep(idx);
        };

        showStep(0);
    }

    function formatTime(seconds) {
        var m = Math.floor(seconds / 60);
        var s = seconds % 60;
        return m + ':' + (s < 10 ? '0' : '') + s;
    }

    // =========================================================================
    // ACTIONS & UTILS
    // =========================================================================

    function openExercise(exerciseId) {
        currentExercise = exerciseId;
        renderPremiumView();
        // Scroll to top
        var container = document.getElementById('view-psycho-audit');
        if (container) container.scrollTop = 0;
    }

    function backFromExercise() {
        currentExercise = null;
        renderPremiumView();
    }

    function selectProgram(programId) {
        currentProgram = programId;
        currentExercise = null;
        renderPremiumView();
    }

    function backFromProgram() {
        currentProgram = null;
        renderPremiumView();
    }

    function setFilter(filter) {
        exerciseFilter = filter;
        renderPremiumView();
    }

    function logMood(value, label) {
        var entry = { type: 'mood', value: value, label: label, date: new Date().toISOString() };
        var log = JSON.parse(localStorage.getItem('pa_mood_log') || '[]');
        log.unshift(entry);
        if (log.length > 100) log = log.slice(0, 100);
        localStorage.setItem('pa_mood_log', JSON.stringify(log));

        // Visual feedback
        var btns = document.querySelectorAll('.pa-mood-btn');
        btns.forEach(function(btn) { btn.style.opacity = '0.5'; });
        event.currentTarget.style.opacity = '1';
        event.currentTarget.style.border = '2px solid var(--primary, #8b5cf6)';
    }

    function logExercise(exerciseId) {
        var exercise = typeof PaTherapyLibrary !== 'undefined' ? PaTherapyLibrary.getExercise(exerciseId) : null;
        var entry = {
            exerciseId: exerciseId,
            name: exercise ? exercise.title : exerciseId,
            date: new Date().toISOString(),
            time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
        };
        var log = JSON.parse(localStorage.getItem('pa_exercise_log') || '[]');
        log.unshift(entry);
        if (log.length > 200) log = log.slice(0, 200);
        localStorage.setItem('pa_exercise_log', JSON.stringify(log));

        // Award XP if available
        if (typeof PaApi !== 'undefined') {
            var workspaceId = typeof ApiTokens !== 'undefined' ? ApiTokens.getWorkspaceId() : null;
            if (workspaceId) {
                Api.post('/gamification/workspace/' + workspaceId + '/xp', { reason: 'exercise_completed', amount: 10 }).catch(function() {});
            }
        }

        alert('Exercice enregistre ! +10 XP');
        backFromExercise();
    }

    function saveJournal() {
        var prompts = document.querySelectorAll('.pa-prompt-input');
        var gratitudes = [];
        for (var i = 1; i <= 3; i++) {
            var g = document.getElementById('gratitude-' + i);
            if (g && g.value.trim()) gratitudes.push(g.value.trim());
        }

        var entries = [];
        prompts.forEach(function(p) {
            if (p.value.trim()) entries.push(p.value.trim());
        });

        if (entries.length === 0 && gratitudes.length === 0) {
            alert('Ecrivez au moins une réflexion ou une gratitude avant de sauvegarder.');
            return;
        }

        var journal = {
            date: new Date().toISOString(),
            entries: entries,
            gratitudes: gratitudes
        };

        var log = JSON.parse(localStorage.getItem('pa_journal_log') || '[]');
        log.unshift(journal);
        if (log.length > 365) log = log.slice(0, 365);
        localStorage.setItem('pa_journal_log', JSON.stringify(log));

        alert('Journal sauvegarde ! Continuez cette pratique quotidienne pour des résultats optimaux.');
    }

    function getExerciseLog() {
        var today = new Date().toISOString().split('T')[0];
        var log = JSON.parse(localStorage.getItem('pa_exercise_log') || '[]');
        return log.filter(function(e) {
            return e.date && e.date.startsWith(today);
        });
    }

    function getRandomPrompts() {
        var allPrompts = [
            { icon: '🌅', text: 'Quelle est mon intention pour aujourd\'hui ?' },
            { icon: '💡', text: 'Qu\'ai-je appris sur moi-meme recemment ?' },
            { icon: '🌊', text: 'Quelle émotion m\'a traverse(e) le plus intensement aujourd\'hui ?' },
            { icon: '🔑', text: 'Si je pouvais changer une chose dans ma vie maintenant, ce serait...' },
            { icon: '🌿', text: 'Quel besoin ai-je neglige recemment ?' },
            { icon: '⚡', text: 'Qu\'est-ce qui me donne le plus d\'énergie en ce moment ?' },
            { icon: '🪞', text: 'Quel pattern repetitif ai-je observe dans mon comportement ?' },
            { icon: '🌍', text: 'Comment puis-je contribuer au bien-être de quelqu\'un aujourd\'hui ?' },
            { icon: '🦋', text: 'De quoi ai-je besoin pour me sentir en sécurité interieure ?' },
            { icon: '🎯', text: 'Suis-je en train de vivre selon mes valeurs profondes cette semaine ?' }
        ];

        // Shuffle & pick 3
        var shuffled = allPrompts.sort(function() { return 0.5 - Math.random(); });
        return shuffled.slice(0, 3);
    }

    function getTotalExerciseCount() {
        if (typeof PaTherapyLibrary === 'undefined') return 0;
        return PaTherapyLibrary.getAllExercises().length;
    }

    function getCategoryForExercise(exerciseId) {
        if (typeof PaTherapyLibrary === 'undefined') return null;
        var all = PaTherapyLibrary.getAllExercises();
        var found = all.find(function(e) { return e.id === exerciseId; });
        return found ? found.category : null;
    }

    // =========================================================================
    // API PUBLIQUE
    // =========================================================================

    return {
        renderPremiumView: renderPremiumView,
        switchTab: switchTab,
        openExercise: openExercise,
        backFromExercise: backFromExercise,
        selectProgram: selectProgram,
        backFromProgram: backFromProgram,
        setFilter: setFilter,
        startExercise: startExercise,
        logExercise: logExercise,
        logMood: logMood,
        saveJournal: saveJournal,
        _showGuidedStep: function() {} // placeholder, set dynamically
    };
})();

if (typeof window !== 'undefined') {
    window.PaPremiumUI = PaPremiumUI;
}

/**
 * Behavioral Insights Engine
 * Transforme les données comportementales brutes en portrait psychologique profond
 * ProductiveApp v5.0
 */
const BehavioralInsights = (function() {
    'use strict';

    // === CHRONOTYPES (modèle Dr. Michael Breus) ===
    const CHRONOTYPES = {
        lion: {
            name: 'Lion',
            icon: '🦁',
            subtitle: 'Prédateur de l\'aube',
            tagline: 'Ton cerveau est en feu avant 10h',
            description: 'Tu atteins ton pic cognitif entre 6h et 10h — quand la plupart des gens cherchent encore leur café. Les grandes décisions, les créations importantes, les défis complexes : donne-leur ton matin. L\'après-midi est pour les tâches répétitives. Résiste à l\'envie de travailler le soir : ça te coûte deux matins.',
            badge: '#F59E0B',
            superpower: 'Clarté et discipline matinale',
            kryptonite: 'Réunions du soir + alcool',
            percent: '15% de la population',
            advice: 'Bloque tes tâches cognitives avant 10h. Réunions : 9h–11h. Jamais après 20h.',
            condition: (d) => d.peakHour >= 4 && d.peakHour <= 9 && d.nightOwl < 15
        },
        bear: {
            name: 'Ours',
            icon: '🐻',
            subtitle: 'Rythme solaire',
            tagline: 'Tu es synchronisé avec le monde',
            description: 'Tu fonctionnes en harmonie avec le soleil. Productif le matin, collaboratif en milieu de journée, créatif en début d\'après-midi. 55% de la population fonctionne comme toi — et c\'est pour ça que les sociétés modernes sont calées sur ton rythme. Tu es l\'humain moyen dans le meilleur sens du terme.',
            badge: '#3B82F6',
            superpower: 'Adaptabilité sociale et rythmique',
            kryptonite: 'Décalage horaire émotionnel et voyages fréquents',
            percent: '55% de la population',
            advice: 'Focus profond : 9h–12h. Créativité : 14h–16h. Évite les décisions importantes après 20h.',
            condition: (d) => d.peakHour >= 8 && d.peakHour <= 14 && d.nightOwl < 25
        },
        wolf: {
            name: 'Loup',
            icon: '🐺',
            subtitle: 'Noctambule créatif',
            tagline: 'Ton cerveau s\'allume quand le monde dort',
            description: 'Les nuits te donnent une clarté particulière, un focus intense impossible en pleine journée. Tu penses différemment — souvent mieux — dans le silence nocturne. Le problème : le monde n\'est pas construit pour toi. Ta stratégie : négocier des plages horaires atypiques plutôt que te forcer dans un moule 9h-17h.',
            badge: '#8B5CF6',
            superpower: 'Créativité nocturne et pensée latérale',
            kryptonite: 'Réunions 8h + monde calibré pour les lions',
            percent: '20% de la population',
            advice: 'Bloque tes meilleures heures après 17h. Refuse les engagements matinaux si tu peux. Sieste 13h–14h.',
            condition: (d) => d.nightOwl > 28 || d.peakHour >= 18
        },
        dolphin: {
            name: 'Dauphin',
            icon: '🐬',
            subtitle: 'Éveilleur imprévisible',
            tagline: 'Ton rythme défie les catégories',
            description: 'Ton cerveau ne suit pas un patron linéaire. Des éclairs de brillance à des moments inattendus. Une fatigue qui arrive sans crier gare. Les dauphins dorment avec un seul hémisphère à la fois — toujours en demi-alerte. Cette hypervigilance est à la fois ta force créative et ton défi de récupération.',
            badge: '#10B981',
            superpower: 'Hypervigilance et créativité imprévisible',
            kryptonite: 'Routines rigides + sous-estimation du besoin de repos',
            percent: '10% de la population',
            advice: 'Note tes éclairs d\'inspiration immédiatement. Construis des rituels courts (pas des routines longues). Récupération = priorité.',
            condition: () => true
        }
    };

    // === ARCHÉTYPES DE PRODUCTIVITÉ ===
    const ARCHETYPES = {
        sprinter: {
            name: 'Le Sprinter',
            icon: '⚡',
            color: '#F59E0B',
            description: 'Tu travailles par explosions d\'intensité. Un sujet t\'absorbe totalement pendant quelques heures ou jours, puis tu passes à autre chose. Tes meilleures productions viennent en sessions marathon — mais attention à l\'épuisement post-sprint.',
            traits: ['Sessions d\'hyperfocus', 'Résultats concentrés', 'Récupération nécessaire'],
            condition: (d) => d.burstIndex >= 3.5 && d.completionRate > 55
        },
        marathonien: {
            name: 'Le Marathonien',
            icon: '🏃',
            color: '#3B82F6',
            description: 'Régulier, constant, implacable. Tu fais un peu chaque jour et les projets avancent inexorablement. Là où les sprinters brûlent puis s\'épuisent, tu continues. Ta régularité est une forme de discipline rare — et souvent sous-estimée.',
            traits: ['Rythme constant', 'Projets long terme', 'Faible risque de burn-out'],
            condition: (d) => d.burstIndex < 3 && d.completionRate > 55 && d.avgTasks >= 3
        },
        papillon: {
            name: 'Le Papillon',
            icon: '🦋',
            color: '#EC4899',
            description: 'Tu butines de projet en projet, apportant ta touche partout. Large curiosité, profondeur variable. Tu es le connecteur des idées — et parfois le briseur de trajectoires. Ton risque : rester éternellement en surface, à quelques pas de la maîtrise.',
            traits: ['Connexions créatives', 'Multi-projets', 'Profondeur à développer'],
            condition: (d) => d.projectCount >= 4 && d.completionRate < 52
        },
        architecte: {
            name: 'L\'Architecte',
            icon: '🏛️',
            color: '#6366F1',
            description: 'Peu d\'actions, mais chacune est mûrement réfléchie. Tu préfères ne rien faire plutôt que mal faire. Ta lenteur apparente cache une précision redoutable. Ton risque : la perfection comme excuse pour éviter l\'exécution.',
            traits: ['Haute qualité', 'Réflexion profonde', 'Peu de gaspillage'],
            condition: (d) => d.completionRate >= 72 && d.avgTasks < 3.5
        },
        deadlineDriver: {
            name: 'Deadline Driver',
            icon: '🚀',
            color: '#EF4444',
            description: 'Tu fonctionnes à l\'adrénaline de l\'urgence. La pression est ton carburant — pas une pathologie, une stratégie. Le problème : tu te mets délibérément dans cette situation. À long terme, le cortisol chronique a un coût.',
            traits: ['Haute performance sous pression', 'Procrastination stratégique', 'Risque cortisol'],
            condition: (d) => d.overdueRate >= 30 && d.completionRate >= 50
        },
        flux: {
            name: 'État de Flux',
            icon: '🌊',
            color: '#10B981',
            description: 'Tu alternes naturellement entre focus profond et récupération légère. Tu as trouvé un équilibre rare — celui entre performance et soutenabilité. Ce n\'est pas un manque d\'ambition, c\'est une sagesse fonctionnelle.',
            traits: ['Équilibre durable', 'Récupération intégrée', 'Haute soutenabilité'],
            condition: () => true
        }
    };

    // === STYLES FACE À LA PRESSION ===
    function getPressureStyle(overdue, completion) {
        if (overdue < 15 && completion >= 65) return {
            name: 'Planificateur Maître',
            icon: '📐',
            color: '#10B981',
            desc: 'Tu respectes tes engagements. Deadlines tenues, agenda honoré. C\'est une discipline émotionnelle rare — tu as appris à ne promettre que ce que tu peux tenir. Les autres peuvent compter sur toi.'
        };
        if (overdue >= 30 && completion >= 55) return {
            name: 'Deadline Driver',
            icon: '⏰',
            color: '#F59E0B',
            desc: 'La proximité de l\'échéance décuple ton énergie. Ce n\'est pas de la procrastination — c\'est de l\'optimisation de pression. Danger : cette stratégie épuise sur la durée et génère du stress chronique.'
        };
        if (overdue >= 28 && completion < 48) return {
            name: 'Paralysie Sélective',
            icon: '🌀',
            color: '#EF4444',
            desc: 'Certaines tâches déclenchent une résistance profonde. Ce n\'est pas de la paresse — c\'est un signal. Quelque chose dans ces tâches touche une zone sensible (peur de l\'échec, manque de sens, surcharge).'
        };
        if (overdue < 25 && completion >= 50 && completion < 65) return {
            name: 'Progressif Réaliste',
            icon: '📊',
            color: '#6366F1',
            desc: 'Tu ajustes continuellement tes attentes et tes capacités. Ni dans l\'urgence, ni dans la procrastination. Ton rapport à l\'engagement est sain — avec une légère marge d\'amélioration dans la finalisation.'
        };
        return {
            name: 'Flux Équilibré',
            icon: '⚖️',
            color: '#8B5CF6',
            desc: 'Ton rapport aux engagements est stable et non-anxieux. Tu navigues avec sérénité, en ajustant sans te juger. C\'est une maturité psychologique précieuse dans un monde qui valorise l\'urgence.'
        };
    }

    // === FENÊTRES D'EXCELLENCE ===
    function getOptimalWindows(hourlyActivity, weeklyHeatmap) {
        const totals = Array(24).fill(0);

        if (weeklyHeatmap && weeklyHeatmap.length === 7) {
            weeklyHeatmap.forEach(day => {
                if (Array.isArray(day)) {
                    day.forEach((v, h) => { totals[h] += (v || 0); });
                }
            });
        } else {
            (hourlyActivity || []).forEach((v, h) => { totals[h] = v || 0; });
        }

        const max = Math.max(...totals, 1);
        const normalized = totals.map(v => v / max);

        const windows = [];
        const used = new Set();

        const ranked = normalized.map((v, h) => ({ h, v })).sort((a, b) => b.v - a.v);

        for (const { h, v } of ranked) {
            if (windows.length >= 3) break;
            if (used.has(h) || used.has(h - 1) || used.has(h + 1)) continue;

            const label = h < 6 ? 'Nuit créative' :
                          h < 9 ? 'Réveil cognitif' :
                          h < 12 ? 'Prime Time' :
                          h < 14 ? 'Élan matinal tardif' :
                          h < 17 ? 'Fenêtre créative' :
                          h < 20 ? 'Boost vespéral' : 'Session nocturne';

            windows.push({
                start: h,
                end: (h + 2) % 24,
                label,
                intensity: v,
                rank: windows.length + 1
            });

            [-2, -1, 0, 1, 2].forEach(d => used.add((h + d + 24) % 24));
        }

        return windows;
    }

    // === MOMENTUM ===
    function getMomentum(count7d, count30d) {
        const avgWeek = count30d / 4.3;
        if (avgWeek < 1) return { label: 'Données insuffisantes', icon: '📊', color: '#6366F1', delta: 0, count7d };

        const ratio = count7d / avgWeek;
        if (ratio >= 1.4) return { label: 'En forte accélération', icon: '🚀', color: '#10B981', delta: Math.round((ratio - 1) * 100), count7d };
        if (ratio >= 1.1) return { label: 'En légère progression', icon: '📈', color: '#3B82F6', delta: Math.round((ratio - 1) * 100), count7d };
        if (ratio <= 0.6) return { label: 'En ralentissement notable', icon: '🔋', color: '#EF4444', delta: -Math.round((1 - ratio) * 100), count7d };
        if (ratio <= 0.85) return { label: 'Léger ralentissement', icon: '📉', color: '#F59E0B', delta: -Math.round((1 - ratio) * 100), count7d };
        return { label: 'Rythme stable', icon: '🎯', color: '#8B5CF6', delta: 0, count7d };
    }

    // === ANALYSE PRINCIPALE ===
    function analyze(rawData) {
        const d = rawData || {};

        // Normaliser les noms de champs (snake_case vs camelCase)
        const hourlyActivity = d.hourlyActivity || Array(24).fill(0);
        const weeklyHeatmap = d.weeklyHeatmap || null;
        const completionRate = d.completion_rate ?? d.completionRate ?? 0;
        const overdueRate = d.overdue_rate ?? d.overdueRate ?? 0;
        const nightOwl = d.night_owl_index ?? d.nightOwlIndex ?? 0;
        const burstIndex = d.burst_vs_steady_index ?? d.burstVsSteadyIndex ?? 1.5;
        const count7d = d.signals_count_7d ?? d.signalsCount7d ?? d.totalSignals7d ?? 0;
        const count30d = d.signals_count_30d ?? d.signalsCount30d ?? d.totalSignals30d ?? 0;
        const avgTasks = d.avgTasksPerDay ?? 3;
        const projectList = d.projectEngagement || [];
        const projectCount = Array.isArray(projectList) ? projectList.length : Object.keys(projectList).length;

        // Peak hour
        let peakHour = 9;
        let maxVal = 0;
        hourlyActivity.forEach((v, h) => {
            if (v > maxVal) { maxVal = v; peakHour = h; }
        });

        // Chronotype
        const chronoCtx = { peakHour, nightOwl };
        let chronotype = null;
        for (const [type, ct] of Object.entries(CHRONOTYPES)) {
            if (type !== 'dolphin' && ct.condition(chronoCtx)) {
                chronotype = { ...ct, type, peakHour };
                break;
            }
        }
        if (!chronotype) chronotype = { ...CHRONOTYPES.dolphin, type: 'dolphin', peakHour };

        // Archétype
        const archetypeCtx = { burstIndex, completionRate, projectCount, overdueRate, avgTasks };
        let archetype = null;
        for (const [key, at] of Object.entries(ARCHETYPES)) {
            if (key !== 'flux' && at.condition(archetypeCtx)) {
                archetype = { ...at, key };
                break;
            }
        }
        if (!archetype) archetype = { ...ARCHETYPES.flux, key: 'flux' };

        // Style pression
        const pressureStyle = getPressureStyle(overdueRate, completionRate);

        // Fenêtres
        const windows = getOptimalWindows(hourlyActivity, weeklyHeatmap);

        // Momentum
        const momentum = getMomentum(count7d, count30d);

        // Signature
        const signature = buildSignature(chronotype, archetype, pressureStyle, completionRate, peakHour);

        // Stats clés pour affichage
        const stats = {
            completionRate: Math.round(completionRate),
            overdueRate: Math.round(overdueRate),
            burstIndex: Math.round(burstIndex * 10) / 10,
            peakHour,
            nightOwl: Math.round(nightOwl),
            count7d,
            count30d
        };

        return { chronotype, archetype, pressureStyle, windows, momentum, signature, stats };
    }

    function buildSignature(chronotype, archetype, pressure, completion, peakHour) {
        const parts = [
            chronotype.name.toUpperCase(),
            archetype.name.replace('Le ', '').replace('L\'', '').toUpperCase(),
            pressure.name.toUpperCase(),
            `${completion}%`,
            `PIC ${peakHour}H`
        ];
        return parts.join(' · ');
    }

    return { analyze };
})();

if (typeof window !== 'undefined') window.BehavioralInsights = BehavioralInsights;

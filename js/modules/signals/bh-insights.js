/**
 * Behavioral Insights Engine v3.0 — Portrait vivant & joyeux
 * ProductiveApp v5.0
 */
const BehavioralInsights = (function() {
    'use strict';

    const CHRONOTYPES = {
        lion: {
            name: 'Lion', icon: '🦁', subtitle: 'Prédateur de l\'Aube',
            tagline: 'Ton cerveau est en feu avant 10h',
            description: 'Tu atteins ton pic cognitif entre 6h et 10h — quand la plupart des gens cherchent encore leur café. Les grandes décisions, les créations importantes, les défis complexes : donne-leur ton matin. L\'après-midi est pour les tâches répétitives.',
            badge: '#F59E0B', gradient: 'linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)',
            glowColor: 'rgba(245, 158, 11, 0.25)',
            superpower: 'Clarté et discipline matinale',
            kryptonite: 'Réunions du soir + alcool',
            percent: '15% de la population',
            advice: 'Bloque tes tâches cognitives avant 10h. Réunions : 9h–11h. Jamais après 20h.',
            gifts: ['Vision lucide au lever', 'Discipline naturelle sans effort', 'Leadership d\'avant-garde'],
            quote: 'Les grandes œuvres se construisent dans le silence du matin.',
            quoteAuthor: 'Sagesse du Lion',
            loveNote: 'Tu portes en toi la rare discipline de ceux qui créent pendant que les autres dorment. Ce n\'est pas une force que tu as acquise — c\'est qui tu es vraiment. Offre à ton matin ce que tu as de plus précieux : tes rêves les plus fous.',
            condition: (d) => d.peakHour >= 4 && d.peakHour <= 9 && d.nightOwl < 15
        },
        bear: {
            name: 'Ours', icon: '🐻', subtitle: 'Rythme Solaire',
            tagline: 'Tu es synchronisé avec le monde',
            description: 'Tu fonctionnes en harmonie avec le soleil. Productif le matin, collaboratif en milieu de journée, créatif en début d\'après-midi. 55% de la population fonctionne comme toi — et c\'est pour ça que les sociétés modernes sont calées sur ton rythme.',
            badge: '#3B82F6', gradient: 'linear-gradient(135deg, #3B82F6 0%, #06B6D4 100%)',
            glowColor: 'rgba(59, 130, 246, 0.25)',
            superpower: 'Adaptabilité sociale et rythmique',
            kryptonite: 'Décalage horaire émotionnel et voyages fréquents',
            percent: '55% de la population',
            advice: 'Focus profond : 9h–12h. Créativité : 14h–16h. Évite les décisions importantes après 20h.',
            gifts: ['Équilibre naturel profond', 'Pont entre les extrêmes', 'Présence stabilisante'],
            quote: 'Être en harmonie avec le monde, c\'est déjà un don extraordinaire.',
            quoteAuthor: 'Sagesse de l\'Ours',
            loveNote: 'Tu es ce pont rare entre les extrêmes — ni trop tôt, ni trop tard. Le monde a besoin de ton rythme ancré et de ta présence stabilisante. Ta régularité est une forme de générosité envers ceux qui t\'entourent.',
            condition: (d) => d.peakHour >= 8 && d.peakHour <= 14 && d.nightOwl < 25
        },
        wolf: {
            name: 'Loup', icon: '🐺', subtitle: 'Noctambule Créatif',
            tagline: 'Ton cerveau s\'allume quand le monde dort',
            description: 'Les nuits te donnent une clarté particulière, un focus intense impossible en pleine journée. Tu penses différemment — souvent mieux — dans le silence nocturne. Le problème : le monde n\'est pas construit pour toi. Ta stratégie : négocier des plages horaires atypiques.',
            badge: '#8B5CF6', gradient: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
            glowColor: 'rgba(139, 92, 246, 0.25)',
            superpower: 'Créativité nocturne et pensée latérale',
            kryptonite: 'Réunions 8h + monde calibré pour les lions',
            percent: '20% de la population',
            advice: 'Bloque tes meilleures heures après 17h. Refuse les engagements matinaux si tu peux. Sieste 13h–14h.',
            gifts: ['Vision nocturne unique', 'Pensée latérale profonde', 'Créativité sans frontières'],
            quote: 'Les plus belles créations naissent dans l\'obscurité étoilée.',
            quoteAuthor: 'Sagesse du Loup',
            loveNote: 'Tu penses là où les autres dorment. Tu vois ce que les autres ne peuvent pas encore voir. Ce n\'est pas un handicap — c\'est ta forme de génie particulière. Embrasse tes nuits comme des espaces sacrés de création.',
            condition: (d) => d.nightOwl > 28 || d.peakHour >= 18
        },
        dolphin: {
            name: 'Dauphin', icon: '🐬', subtitle: 'Éveilleur Imprévisible',
            tagline: 'Ton rythme défie les catégories',
            description: 'Ton cerveau ne suit pas un patron linéaire. Des éclairs de brillance à des moments inattendus. Une fatigue qui arrive sans crier gare. Cette hypervigilance est à la fois ta force créative et ton défi de récupération.',
            badge: '#10B981', gradient: 'linear-gradient(135deg, #10B981 0%, #3B82F6 100%)',
            glowColor: 'rgba(16, 185, 129, 0.25)',
            superpower: 'Hypervigilance et créativité imprévisible',
            kryptonite: 'Routines rigides + sous-estimation du repos',
            percent: '10% de la population',
            advice: 'Note tes éclairs d\'inspiration immédiatement. Construis des rituels courts. Récupération = priorité.',
            gifts: ['Hypervigilance créative', 'Connexions intuitives rares', 'Adaptabilité fluide'],
            quote: 'L\'imprévisible est la signature des esprits vraiment libres.',
            quoteAuthor: 'Sagesse du Dauphin',
            loveNote: 'Ton cerveau ne suit aucun manuel — et c\'est exactement ce qui te rend précieux(se). Dans un monde de routines, tu es une source d\'inspiration. Tes éclairs d\'inspiration valent plus que mille heures de routine.',
            condition: () => true
        }
    };

    const ARCHETYPES = {
        sprinter: {
            name: 'Le Sprinter', icon: '⚡', color: '#F59E0B',
            description: 'Tu travailles par explosions d\'intensité. Un sujet t\'absorbe totalement pendant quelques heures ou jours, puis tu passes à autre chose. Tes meilleures productions viennent en sessions marathon.',
            traits: ['Sessions d\'hyperfocus', 'Résultats concentrés', 'Récupération nécessaire'],
            loveNote: 'Tu peux accomplir en 3 heures ce que d\'autres font en 3 jours. Cette capacité de concentration totale est ton superpouvoir — et le monde a besoin de ce type d\'intensité.',
            condition: (d) => d.burstIndex >= 3.5 && d.completionRate > 55
        },
        marathonien: {
            name: 'Le Marathonien', icon: '🏃', color: '#3B82F6',
            description: 'Régulier, constant, implacable. Tu fais un peu chaque jour et les projets avancent inexorablement. Ta régularité est une forme de discipline rare — et souvent sous-estimée.',
            traits: ['Rythme constant', 'Projets long terme', 'Faible risque de burn-out'],
            loveNote: 'Ta régularité crée des miracles invisibles. Chaque petit pas que tu fais aujourd\'hui construit quelque chose d\'immense. C\'est la plus belle forme de courage : celle qui dure.',
            condition: (d) => d.burstIndex < 3 && d.completionRate > 55 && d.avgTasks >= 3
        },
        papillon: {
            name: 'Le Papillon', icon: '🦋', color: '#EC4899',
            description: 'Tu butines de projet en projet, apportant ta touche partout. Large curiosité, profondeur variable. Tu es le connecteur des idées — la personne qui fait le lien entre des mondes séparés.',
            traits: ['Connexions créatives', 'Multi-projets', 'Vision transversale'],
            loveNote: 'Tu es le lien entre des mondes qui ne se connaissent pas encore. Ta curiosité infinie est un cadeau pour ceux qui t\'entourent. Les papillons pollinisent — sans eux, rien ne fleurit.',
            condition: (d) => d.projectCount >= 4 && d.completionRate < 52
        },
        architecte: {
            name: 'L\'Architecte', icon: '🏛️', color: '#6366F1',
            description: 'Peu d\'actions, mais chacune est mûrement réfléchie. Tu préfères ne rien faire plutôt que mal faire. Ta lenteur apparente cache une précision redoutable.',
            traits: ['Haute qualité', 'Réflexion profonde', 'Peu de gaspillage'],
            loveNote: 'Chaque chose que tu crées est faite pour durer. Ta lenteur apparente cache une profondeur que peu atteignent. Tu construis pour l\'éternité — et ça, c\'est un don rare.',
            condition: (d) => d.completionRate >= 72 && d.avgTasks < 3.5
        },
        deadlineDriver: {
            name: 'Deadline Driver', icon: '🚀', color: '#EF4444',
            description: 'Tu fonctionnes à l\'adrénaline de l\'urgence. La pression est ton carburant — pas une pathologie, une stratégie. Tu te transcendes dans les moments où les autres paniquent.',
            traits: ['Performance sous pression', 'Procrastination stratégique', 'Dépassement de soi'],
            loveNote: 'Tu transcendes dans les moments où les autres paniquent. Cette capacité à te dépasser quand tout le monde abandonne est une forme rare de courage. Garde juste un œil sur ton énergie.',
            condition: (d) => d.overdueRate >= 30 && d.completionRate >= 50
        },
        flux: {
            name: 'État de Flux', icon: '🌊', color: '#10B981',
            description: 'Tu alternes naturellement entre focus profond et récupération légère. Tu as trouvé un équilibre rare — celui entre performance et soutenabilité. Ce n\'est pas un manque d\'ambition, c\'est une sagesse fonctionnelle.',
            traits: ['Équilibre durable', 'Récupération intégrée', 'Haute soutenabilité'],
            loveNote: 'Tu as trouvé ce que tant de gens cherchent toute leur vie : l\'équilibre entre performance et sérénité. Cette sagesse fonctionnelle est un trésor — protège-la.',
            condition: () => true
        }
    };

    function getPressureStyle(overdue, completion) {
        if (overdue < 15 && completion >= 65) return {
            name: 'Planificateur Maître', icon: '📐', color: '#10B981',
            desc: 'Tu respectes tes engagements. Deadlines tenues, agenda honoré. C\'est une discipline émotionnelle rare — tu as appris à ne promettre que ce que tu peux tenir.'
        };
        if (overdue >= 30 && completion >= 55) return {
            name: 'Deadline Driver', icon: '⏰', color: '#F59E0B',
            desc: 'La proximité de l\'échéance décuple ton énergie. Ce n\'est pas de la procrastination — c\'est de l\'optimisation de pression.'
        };
        if (overdue >= 28 && completion < 48) return {
            name: 'Paralysie Sélective', icon: '🌀', color: '#EF4444',
            desc: 'Certaines tâches déclenchent une résistance profonde. Ce n\'est pas de la paresse — c\'est un signal à écouter avec bienveillance.'
        };
        if (overdue < 25 && completion >= 50 && completion < 65) return {
            name: 'Progressif Réaliste', icon: '📊', color: '#6366F1',
            desc: 'Tu ajustes continuellement tes attentes et tes capacités. Ton rapport à l\'engagement est sain — tu avances à ton rythme.'
        };
        return {
            name: 'Flux Équilibré', icon: '⚖️', color: '#8B5CF6',
            desc: 'Ton rapport aux engagements est stable et non-anxieux. Tu navigues avec sérénité, en ajustant sans te juger. C\'est une maturité précieuse.'
        };
    }

    function getOptimalWindows(hourlyActivity, weeklyHeatmap) {
        const totals = Array(24).fill(0);
        if (weeklyHeatmap && weeklyHeatmap.length === 7) {
            weeklyHeatmap.forEach(day => {
                if (Array.isArray(day)) day.forEach((v, h) => { totals[h] += (v || 0); });
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
            const label = h < 6 ? 'Nuit créative' : h < 9 ? 'Réveil cognitif' :
                          h < 12 ? 'Prime Time ✨' : h < 14 ? 'Élan matinal tardif' :
                          h < 17 ? 'Fenêtre créative' : h < 20 ? 'Boost vespéral' : 'Session nocturne';
            windows.push({ start: h, end: (h + 2) % 24, label, intensity: v, rank: windows.length + 1 });
            [-2, -1, 0, 1, 2].forEach(d => used.add((h + d + 24) % 24));
        }
        return windows;
    }

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

    function analyze(rawData) {
        const d = rawData || {};
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

        let peakHour = 9, maxVal = 0;
        hourlyActivity.forEach((v, h) => { if (v > maxVal) { maxVal = v; peakHour = h; } });

        const chronoCtx = { peakHour, nightOwl };
        let chronotype = null;
        for (const [type, ct] of Object.entries(CHRONOTYPES)) {
            if (type !== 'dolphin' && ct.condition(chronoCtx)) { chronotype = { ...ct, type, peakHour }; break; }
        }
        if (!chronotype) chronotype = { ...CHRONOTYPES.dolphin, type: 'dolphin', peakHour };

        const archetypeCtx = { burstIndex, completionRate, projectCount, overdueRate, avgTasks };
        let archetype = null;
        for (const [key, at] of Object.entries(ARCHETYPES)) {
            if (key !== 'flux' && at.condition(archetypeCtx)) { archetype = { ...at, key }; break; }
        }
        if (!archetype) archetype = { ...ARCHETYPES.flux, key: 'flux' };

        const pressureStyle = getPressureStyle(overdueRate, completionRate);
        const windows = getOptimalWindows(hourlyActivity, weeklyHeatmap);
        const momentum = getMomentum(count7d, count30d);
        const signature = buildSignature(chronotype, archetype, pressureStyle, completionRate, peakHour);
        const stats = {
            completionRate: Math.round(completionRate), overdueRate: Math.round(overdueRate),
            burstIndex: Math.round(burstIndex * 10) / 10, peakHour, nightOwl: Math.round(nightOwl),
            count7d, count30d
        };

        return { chronotype, archetype, pressureStyle, windows, momentum, signature, stats };
    }

    function buildSignature(chronotype, archetype, pressure, completion, peakHour) {
        return [
            chronotype.name.toUpperCase(),
            archetype.name.replace('Le ', '').replace('L\'', '').toUpperCase(),
            pressure.name.toUpperCase(),
            `${completion}%`,
            `PIC ${peakHour}H`
        ].join(' · ');
    }

    return { analyze };
})();

if (typeof window !== 'undefined') window.BehavioralInsights = BehavioralInsights;

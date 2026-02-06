/**
 * PSYCHO-AUDIT QUESTION BANK - 80 questions across 10 axes
 * ProductiveApp v5.0
 */

const QUESTION_BANK = (function() {
    'use strict';

    const AXES = [
        { id: 'clarity', label: 'Clarté d\'intention', icon: '🎯', shortLabel: 'Clarté' },
        { id: 'alignment', label: 'Alignement action/vision', icon: '🧭', shortLabel: 'Alignement' },
        { id: 'energy', label: 'Énergie et rythme', icon: '⚡', shortLabel: 'Énergie' },
        { id: 'lucidity', label: 'Lucidité', icon: '🪞', shortLabel: 'Lucidité' },
        { id: 'discipline', label: 'Discipline', icon: '🏋️', shortLabel: 'Discipline' },
        { id: 'decision', label: 'Prise de décision', icon: '⚖️', shortLabel: 'Décision' },
        { id: 'relationships', label: 'Relations', icon: '🤝', shortLabel: 'Relations' },
        { id: 'resilience', label: 'Résilience', icon: '🛡️', shortLabel: 'Résilience' },
        { id: 'growth', label: 'Croissance', icon: '🌱', shortLabel: 'Croissance' },
        { id: 'impact', label: 'Impact', icon: '🌍', shortLabel: 'Impact' }
    ];

    const QUESTIONS = {
        clarity: [
            { id: 'clarity_1', text: 'Je sais exactement ce que je veux accomplir cette semaine.', positive: true },
            { id: 'clarity_2', text: 'Mes objectifs sont flous ou changent constamment.', positive: false },
            { id: 'clarity_3', text: 'Je peux expliquer clairement mes priorités à quelqu\'un.', positive: true },
            { id: 'clarity_4', text: 'Je me sens perdu(e) face à mes nombreuses tâches.', positive: false },
            { id: 'clarity_5', text: 'Je commence mes journées avec une intention précise.', positive: true },
            { id: 'clarity_6', text: 'Je fais souvent des choses sans savoir pourquoi.', positive: false },
            { id: 'clarity_7', text: 'Ma vision à long terme guide mes actions quotidiennes.', positive: true },
            { id: 'clarity_8', text: 'Je distingue clairement l\'urgent de l\'important.', positive: true }
        ],
        alignment: [
            { id: 'align_1', text: 'Mes actions quotidiennes reflètent mes valeurs profondes.', positive: true },
            { id: 'align_2', text: 'Je fais souvent des compromis qui me frustrent.', positive: false },
            { id: 'align_3', text: 'Mon travail contribue à mes objectifs de vie.', positive: true },
            { id: 'align_4', text: 'Je sens un décalage entre ce que je fais et ce que je veux.', positive: false },
            { id: 'align_5', text: 'Je refuse les demandes qui ne correspondent pas à mes priorités.', positive: true },
            { id: 'align_6', text: 'Je me disperse sur trop de projets différents.', positive: false },
            { id: 'align_7', text: 'Mon emploi du temps reflète ce qui compte vraiment pour moi.', positive: true },
            { id: 'align_8', text: 'Je termine la semaine avec le sentiment d\'avoir avancé.', positive: true }
        ],
        energy: [
            { id: 'energy_1', text: 'Je connais mes heures de haute performance et je les protège.', positive: true },
            { id: 'energy_2', text: 'Je me sens épuisé(e) en fin de journée.', positive: false },
            { id: 'energy_3', text: 'Je prends des pauses régulières pour recharger.', positive: true },
            { id: 'energy_4', text: 'Je travaille souvent au-delà de mes limites.', positive: false },
            { id: 'energy_5', text: 'Mon sommeil est suffisant et réparateur.', positive: true },
            { id: 'energy_6', text: 'Je néglige l\'exercice physique ou le mouvement.', positive: false },
            { id: 'energy_7', text: 'Je sais dire stop avant d\'atteindre l\'épuisement.', positive: true },
            { id: 'energy_8', text: 'Mon niveau d\'énergie est stable tout au long de la journée.', positive: true }
        ],
        lucidity: [
            { id: 'lucid_1', text: 'Je reconnais mes erreurs rapidement et j\'en tire des leçons.', positive: true },
            { id: 'lucid_2', text: 'J\'ai tendance à me mentir sur mes performances.', positive: false },
            { id: 'lucid_3', text: 'Je connais mes forces et mes faiblesses actuelles.', positive: true },
            { id: 'lucid_4', text: 'Je me trouve souvent des excuses pour mes échecs.', positive: false },
            { id: 'lucid_5', text: 'Je demande du feedback honnête et je l\'accepte.', positive: true },
            { id: 'lucid_6', text: 'Je suis dans le déni sur certains aspects de ma vie.', positive: false },
            { id: 'lucid_7', text: 'Je prends du recul pour analyser mes comportements.', positive: true },
            { id: 'lucid_8', text: 'Je suis capable de remettre en question mes certitudes.', positive: true }
        ],
        discipline: [
            { id: 'disc_1', text: 'Je respecte les engagements que je prends envers moi-même.', positive: true },
            { id: 'disc_2', text: 'Je procrastine souvent sur les tâches importantes.', positive: false },
            { id: 'disc_3', text: 'J\'ai des routines qui structurent mes journées.', positive: true },
            { id: 'disc_4', text: 'Je cède facilement aux distractions (réseaux, notifications).', positive: false },
            { id: 'disc_5', text: 'Je termine ce que je commence, même quand c\'est difficile.', positive: true },
            { id: 'disc_6', text: 'Je repousse régulièrement mes deadlines personnelles.', positive: false },
            { id: 'disc_7', text: 'Je maintiens mes bonnes habitudes sur le long terme.', positive: true },
            { id: 'disc_8', text: 'Je suis capable de résister aux gratifications immédiates.', positive: true }
        ],
        decision: [
            { id: 'decis_1', text: 'Je prends des décisions rapidement quand c\'est nécessaire.', positive: true },
            { id: 'decis_2', text: 'J\'hésite trop longtemps avant de me décider.', positive: false },
            { id: 'decis_3', text: 'J\'assume pleinement les conséquences de mes choix.', positive: true },
            { id: 'decis_4', text: 'J\'évite de prendre des décisions par peur de me tromper.', positive: false },
            { id: 'decis_5', text: 'Je sais trancher même avec des informations incomplètes.', positive: true },
            { id: 'decis_6', text: 'Je reviens souvent sur mes décisions après coup.', positive: false },
            { id: 'decis_7', text: 'Je me fie à mon intuition quand la logique ne suffit pas.', positive: true },
            { id: 'decis_8', text: 'Je ne laisse pas mes décisions en suspens trop longtemps.', positive: true }
        ],
        relationships: [
            { id: 'relat_1', text: 'Je communique clairement mes besoins aux autres.', positive: true },
            { id: 'relat_2', text: 'Je garde mes frustrations pour moi jusqu\'à exploser.', positive: false },
            { id: 'relat_3', text: 'Je sais déléguer et faire confiance aux autres.', positive: true },
            { id: 'relat_4', text: 'Je m\'isole quand je suis stressé(e) ou débordé(e).', positive: false },
            { id: 'relat_5', text: 'Je donne du feedback constructif à mon entourage.', positive: true },
            { id: 'relat_6', text: 'Mes relations professionnelles sont sources de tension.', positive: false },
            { id: 'relat_7', text: 'Je cultive activement mon réseau et mes connexions.', positive: true },
            { id: 'relat_8', text: 'Je suis présent(e) et à l\'écoute lors des échanges.', positive: true }
        ],
        resilience: [
            { id: 'resil_1', text: 'Je rebondis rapidement après un échec ou un revers.', positive: true },
            { id: 'resil_2', text: 'Les obstacles me découragent facilement.', positive: false },
            { id: 'resil_3', text: 'Je vois les difficultés comme des opportunités d\'apprendre.', positive: true },
            { id: 'resil_4', text: 'Je rumine longtemps mes erreurs passées.', positive: false },
            { id: 'resil_5', text: 'Je garde mon calme face à l\'imprévu.', positive: true },
            { id: 'resil_6', text: 'Le stress chronique affecte ma performance.', positive: false },
            { id: 'resil_7', text: 'J\'ai des stratégies pour gérer les moments difficiles.', positive: true },
            { id: 'resil_8', text: 'Je sais demander de l\'aide quand j\'en ai besoin.', positive: true }
        ],
        growth: [
            { id: 'growth_1', text: 'J\'apprends activement de nouvelles compétences.', positive: true },
            { id: 'growth_2', text: 'Je reste dans ma zone de confort la plupart du temps.', positive: false },
            { id: 'growth_3', text: 'Je cherche des défis qui me font progresser.', positive: true },
            { id: 'growth_4', text: 'Je résiste au changement et aux nouvelles méthodes.', positive: false },
            { id: 'growth_5', text: 'Je consacre du temps à mon développement personnel.', positive: true },
            { id: 'growth_6', text: 'Je n\'ai pas le temps de me former ou d\'apprendre.', positive: false },
            { id: 'growth_7', text: 'Je sollicite des mentors ou des experts pour progresser.', positive: true },
            { id: 'growth_8', text: 'Je mesure mes progrès et célèbre mes avancées.', positive: true }
        ],
        impact: [
            { id: 'impact_1', text: 'Mon travail a un sens et contribue à quelque chose de plus grand.', positive: true },
            { id: 'impact_2', text: 'Je doute souvent de l\'utilité de ce que je fais.', positive: false },
            { id: 'impact_3', text: 'Je mesure l\'impact concret de mes actions.', positive: true },
            { id: 'impact_4', text: 'Je fais beaucoup d\'efforts pour peu de résultats.', positive: false },
            { id: 'impact_5', text: 'Je crée de la valeur pour les autres (équipe, clients).', positive: true },
            { id: 'impact_6', text: 'Je me sens remplaçable ou insignifiant(e).', positive: false },
            { id: 'impact_7', text: 'Je vois clairement comment mon travail aide les autres.', positive: true },
            { id: 'impact_8', text: 'Je laisse une trace positive dans mes projets.', positive: true }
        ]
    };

    const RECOMMENDATIONS = {
        clarity: [
            'Chaque matin, écrivez 3 priorités et pourquoi elles comptent.',
            'Utilisez la méthode "5 pourquoi" pour clarifier vos motivations.',
            'Révisez vos objectifs hebdomadaires chaque dimanche soir.'
        ],
        alignment: [
            'Bloquez du temps pour vos "grosses pierres" en début de semaine.',
            'Dites non à une demande qui ne sert pas vos priorités cette semaine.',
            'Faites un audit de votre agenda : reflète-t-il vos vraies priorités ?'
        ],
        energy: [
            'Identifiez vos heures de haute énergie et protégez-les jalousement.',
            'Intégrez des micro-pauses de 5 min toutes les 90 minutes.',
            'Ajoutez 30 min d\'exercice ou de marche à votre routine quotidienne.'
        ],
        lucidity: [
            'Demandez un feedback honnête à un collègue ou proche cette semaine.',
            'Tenez un journal de réflexion sur vos décisions et leurs résultats.',
            'Identifiez un pattern répétitif dans vos comportements.'
        ],
        discipline: [
            'Créez une routine matinale non négociable de 30 minutes.',
            'Utilisez un bloqueur de distractions pendant vos heures de focus.',
            'Appliquez la règle des 2 minutes : faites-le maintenant si c\'est rapide.'
        ],
        decision: [
            'Fixez-vous une limite de temps pour prendre chaque décision.',
            'Utilisez la matrice décision : impact × probabilité de succès.',
            'Prenez une micro-décision que vous repoussez depuis trop longtemps.'
        ],
        relationships: [
            'Planifiez un moment de connexion authentique avec un collègue.',
            'Déléguez une tâche que vous avez tendance à garder pour vous.',
            'Exprimez une appréciation sincère à quelqu\'un cette semaine.'
        ],
        resilience: [
            'Identifiez votre stratégie de récupération après un échec.',
            'Pratiquez 10 min de méditation ou respiration guidée.',
            'Listez 3 difficultés passées que vous avez surmontées avec succès.'
        ],
        growth: [
            'Consacrez 30 min/jour à apprendre une nouvelle compétence.',
            'Sortez de votre zone de confort avec un petit défi cette semaine.',
            'Trouvez un mentor ou expert dans un domaine que vous voulez développer.'
        ],
        impact: [
            'Mesurez l\'impact concret d\'un de vos projets récents.',
            'Demandez à un bénéficiaire de votre travail comment vous l\'avez aidé.',
            'Identifiez une façon d\'augmenter votre contribution à l\'équipe.'
        ]
    };

    const CONFIG = {
        questionsPerAudit: 10,
        selectionMode: 'random'
    };

    const SCORING = {
        thresholds: { excellent: 80, solid: 60, progress: 40 },
        labels: {
            excellent: 'Excellent',
            solid: 'Solide',
            progress: 'En progression',
            develop: 'À développer'
        },
        colors: {
            excellent: '#22c55e',
            solid: '#f59e0b',
            develop: '#ef4444'
        }
    };

    function getRandomQuestions(count) {
        var selected = [];
        AXES.forEach(function(axis) {
            var axisQuestions = QUESTIONS[axis.id];
            var randomIndex = Math.floor(Math.random() * axisQuestions.length);
            selected.push({
                ...axisQuestions[randomIndex],
                axis: axis.id,
                label: axis.label
            });
        });
        return selected;
    }

    function getAllQuestions() {
        var all = [];
        AXES.forEach(function(axis) {
            QUESTIONS[axis.id].forEach(function(q) {
                all.push({ ...q, axis: axis.id, label: axis.label });
            });
        });
        return all;
    }

    function getQuestionsByAxis(axisId) {
        return QUESTIONS[axisId] || [];
    }

    return {
        AXES: AXES,
        QUESTIONS: QUESTIONS,
        RECOMMENDATIONS: RECOMMENDATIONS,
        CONFIG: CONFIG,
        SCORING: SCORING,
        getRandomQuestions: getRandomQuestions,
        getAllQuestions: getAllQuestions,
        getQuestionsByAxis: getQuestionsByAxis
    };
})();

if (typeof window !== 'undefined') {
    window.QUESTION_BANK = QUESTION_BANK;
}

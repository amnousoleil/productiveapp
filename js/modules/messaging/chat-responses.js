/**
 * CHAT RESPONSES - ProductiveApp v4.0
 * Logique des reponses IA predefinies
 */

const ChatResponses = (function() {
    'use strict';

    const RESPONSES = {
        greetings: [
            "Bonjour ! Je suis Mahayawen, votre guide spirituel productif. Comment puis-je vous aider aujourd'hui ?",
            "Salut ! Pret a booster votre productivite ? Que puis-je faire pour vous ?",
            "Hello ! Je suis la pour vous accompagner. Posez-moi vos questions !"
        ],
        help: [
            `Voici ce que je peux faire pour vous :

📋 **Gestion des taches**
- Creer, modifier ou supprimer des taches
- Definir des priorites et des deadlines
- Suivre votre progression

📊 **Productivite**
- Analyser vos habitudes de travail
- Suggerer des ameliorations
- Resumer vos activites

🎮 **Gamification**
- Expliquer le systeme de points
- Vous motiver avec des defis
- Celebrer vos accomplissements

💡 **Conseils**
- Techniques de productivite
- Organisation du travail
- Gestion du temps

Que souhaitez-vous explorer ?`
        ],
        tasksTips: [
            "💡 **Conseil :** Commencez par les taches urgentes le matin quand votre energie est au maximum !",
            "💡 **Astuce :** Utilisez la technique Pomodoro : 25 min de travail, 5 min de pause.",
            "💡 **Conseil :** Decomposez les grandes taches en sous-taches plus petites et gerables."
        ],
        productivity: [
            `🚀 **Conseils productivite :**

1. **Regle des 2 minutes** : Si une tache prend moins de 2 min, faites-la immediatement
2. **Time blocking** : Bloquez du temps pour chaque type de tache
3. **Deep work** : Reservez des creneaux sans interruption pour le travail complexe
4. **Review hebdo** : Faites le point chaque semaine sur vos accomplissements

Quel aspect souhaitez-vous approfondir ?`,
            `📈 **Pour ameliorer votre productivite :**

• Identifiez vos heures de peak performance
• Eliminez les distractions (notifications, reseaux sociaux)
• Utilisez la matrice d'Eisenhower (urgent/important)
• Celebrez vos petites victoires !

Besoin de plus de details sur une technique ?`
        ],
        galaxy: [
            `🌌 **Galaxy View** est votre espace de visualisation creatif !

C'est un tableau blanc interactif base sur Excalidraw ou vous pouvez :
- Creer des mind maps
- Dessiner des schemas
- Organiser visuellement vos idees
- Relier vos projets entre eux

Cliquez sur l'icone oeil d'Horus dans le header pour l'ouvrir !`
        ],
        settings: [
            `⚙️ **Parametres disponibles :**

- **Themes** : Executive, Ocean, Forest, Sunset
- **Notifications** : Personnalisez vos alertes
- **Sidebar** : Mode compact ou etendu
- **Donnees** : Export JSON, vidage du cache

Allez dans Parametres pour personnaliser votre experience !`
        ],
        motivation: [
            "🔥 Vous etes sur la bonne voie ! Chaque tache accomplie vous rapproche de vos objectifs.",
            "💪 La perseverance est la cle du succes. Continuez comme ca !",
            "⭐ N'oubliez pas : le progres, meme petit, reste du progres !",
            "🎯 Concentrez-vous sur une chose a la fois, et vous accomplirez des merveilles."
        ],
        unknown: [
            "Je ne suis pas sur de comprendre. Pouvez-vous reformuler ou me donner plus de contexte ?",
            "Hmm, je n'ai pas de reponse precise pour ca. Essayez de demander de l'aide sur les taches, la productivite ou les fonctionnalites.",
            "Je suis encore en apprentissage ! Pour l'instant, je peux vous aider avec vos taches, la productivite et les fonctionnalites de ProductiveApp."
        ]
    };

    function getTasksSummary() {
        if (typeof AppState === 'undefined' || !AppState.tasks) {
            return { urgent: 0, todo: 0, inProgress: 0, done: 0 };
        }
        var tasks = AppState.tasks || [];
        return {
            urgent: tasks.filter(function(t) { return t.priority && t.priority.level === 1 && t.status !== 'done'; }).length,
            todo: tasks.filter(function(t) { return t.status === 'todo'; }).length,
            inProgress: tasks.filter(function(t) { return t.status === 'inprogress'; }).length,
            done: tasks.filter(function(t) { return t.status === 'done'; }).length
        };
    }

    function getUserName() {
        if (typeof AppState !== 'undefined' && AppState.currentUser) {
            return AppState.currentUser.name || 'Utilisateur';
        }
        return 'Utilisateur';
    }

    function randomChoice(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    function generateTasksSummary() {
        var tasks = getTasksSummary();
        return '📊 **Resume de vos taches :**\n\n' +
            '🔴 Urgent : ' + tasks.urgent + ' tache(s)\n' +
            '📋 A faire : ' + tasks.todo + ' tache(s)\n' +
            '🔄 En cours : ' + tasks.inProgress + ' tache(s)\n' +
            '✅ Terminees : ' + tasks.done + ' tache(s)\n\n' +
            (tasks.urgent > 0 ? '⚠️ Vous avez des taches urgentes a traiter !' : '👍 Pas de taches urgentes pour le moment.') +
            '\n\nVoulez-vous voir les details ou creer une nouvelle tache ?';
    }

    function generate(userMessage) {
        var msg = userMessage.toLowerCase().trim();

        if (/^(salut|bonjour|hello|hi|hey|coucou|yo)/i.test(msg)) {
            return randomChoice(RESPONSES.greetings);
        }
        if (/aide|help|comment|quoi faire|que peux|fonctionnalit/i.test(msg)) {
            return RESPONSES.help[0];
        }
        if (/tâche|tache|task|todo|à faire|a faire/i.test(msg)) {
            if (/combien|résumé|resume|stat|nombre/i.test(msg)) {
                return generateTasksSummary();
            }
            return generateTasksSummary() + '\n\n' + randomChoice(RESPONSES.tasksTips);
        }
        if (/productiv|conseil|astuce|tip|améliorer|organis/i.test(msg)) {
            return randomChoice(RESPONSES.productivity);
        }
        if (/galaxy|galaxie|mind ?map|tableau|whiteboard|dessin/i.test(msg)) {
            return RESPONSES.galaxy[0];
        }
        if (/paramètre|setting|thème|theme|config/i.test(msg)) {
            return RESPONSES.settings[0];
        }
        if (/motiv|encourager|décourag|fatigue|dur|difficile/i.test(msg)) {
            return randomChoice(RESPONSES.motivation);
        }
        if (/merci|thank|génial|super|cool|parfait/i.test(msg)) {
            return 'Avec plaisir ' + getUserName() + ' ! N\'hesitez pas si vous avez d\'autres questions. 😊';
        }
        if (/bye|au revoir|à plus|a plus|ciao|bonne journée/i.test(msg)) {
            return 'A bientot ' + getUserName() + ' ! Bonne continuation et restez productif ! 🚀';
        }
        return randomChoice(RESPONSES.unknown);
    }

    function getHelpMessage() {
        return RESPONSES.help[0];
    }

    function getWelcomeMessage() {
        return 'Bonjour ' + getUserName() + ' ! 👋\n\nJe suis Mahayawen, votre guide spirituel productif. Je peux vous aider avec :\n• Resume de vos taches\n• Conseils de productivite\n• Questions sur les fonctionnalites\n\nComment puis-je vous aider aujourd\'hui ?';
    }

    function getClearedMessage() {
        return 'Bonjour ' + getUserName() + ' ! Historique efface. Comment puis-je vous aider ?';
    }

    return {
        generate: generate,
        getHelpMessage: getHelpMessage,
        getWelcomeMessage: getWelcomeMessage,
        getClearedMessage: getClearedMessage,
        getUserName: getUserName
    };
})();

if (typeof window !== 'undefined') {
    window.ChatResponses = ChatResponses;
}

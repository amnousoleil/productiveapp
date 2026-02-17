# Productive Core Backend

## REGLES CRITIQUES - NE PAS VIOLER

### Mot de passe
**NE JAMAIS CHANGER LE MOT DE PASSE** de `contact@mahagiri.fr` sans demande EXPLICITE et VALIDEE par l'utilisateur !
- Mot de passe actuel : `444@`
- Si l'utilisateur mentionne un probleme de connexion, DEMANDER D'ABORD avant de changer quoi que ce soit
- Cette regle s'applique a TOUTES les sessions Claude Code

### Coordination Multi-Sessions (OBLIGATOIRE)
**PLUSIEURS SESSIONS CLAUDE CODE TRAVAILLENT EN PARALLELE sur ce serveur.**
Une session GARDIEN coordonne toutes les autres. Avant de commencer :
1. **LIRE** `/root/.claude/projects/-root/memory/coordination.md` - Regles completes
2. **LIRE** `/root/.claude/projects/-root/memory/sessions-registry.md` - Qui fait quoi
3. **TOUJOURS relire** un fichier avant de le modifier (une autre session a pu le changer)
4. **Utiliser `Edit`** (remplacement cible) au lieu de `Write` (ecrasement complet)
5. **Apres modification TypeScript** : `npm run build && pm2 restart productive-core`
6. **Verifier logs** : `pm2 logs productive-core --lines 20` apres chaque restart
7. **NE JAMAIS modifier la DB** sans migration dans `src/migrations/`
8. **NE JAMAIS exposer** de secrets (.env, JWT, DB creds)
9. **Annoncer** a l'utilisateur : "J'ai lu les regles de coordination"

---

> **Version** : 3.1.0
> **Derniere mise a jour** : 2026-02-06
> **Statut** : Production STABLE

---

## Vue d'ensemble

Backend API Express/TypeScript pour ProductiveApp. Communique avec le frontend via API REST.

- **Port** : 3000
- **Base de donnees** : PostgreSQL 14+ (Drizzle ORM)
- **Frontend** : `/root/productive-app-frontend/`

---

## Architecture

```
/root/productive-core-backend/
├── src/
│   ├── index.ts                    # Point d'entree Express
│   ├── config/
│   │   ├── database.ts             # PostgreSQL (postgres-js + drizzle)
│   │   └── env.ts                  # Variables d'environnement
│   │
│   ├── middleware/
│   │   ├── auth.middleware.ts      # JWT validation
│   │   ├── error.middleware.ts     # Gestion erreurs
│   │   └── rateLimit.middleware.ts # Rate limiting
│   │
│   ├── modules/                    # === MODULES METIER ===
│   │   ├── accounting/             # Comptabilite, factures
│   │   ├── ai/                     # Chatbot IA, GPT-4
│   │   ├── analytics/              # Statistiques, metriques
│   │   ├── audit/                  # Psycho-Audit
│   │   ├── auth/                   # Authentification JWT
│   │   ├── canvases/               # Galaxie, tableaux blancs
│   │   ├── files/                  # Upload, stockage fichiers
│   │   ├── gamification/           # XP, badges, streaks
│   │   ├── messaging/              # Chat temps reel
│   │   ├── notes/                  # Notes, journal
│   │   ├── notifications/          # Notifications push
│   │   ├── onboarding/             # Parcours utilisateur
│   │   ├── plans/                  # Plans, abonnements
│   │   ├── projects/               # Projets, espaces
│   │   ├── reports/                # Rapports, exports
│   │   ├── signals/                # Signaux comportementaux
│   │   ├── tasks/                  # Taches Kanban
│   │   ├── users/                  # Utilisateurs, profils
│   │   └── workspaces/             # Espaces de travail
│   │
│   ├── db/
│   │   ├── migrations/             # Migrations SQL (001-012)
│   │   └── migrate.ts              # Script de migration
│   │
│   └── utils/                      # Fonctions utilitaires
│
├── uploads/                        # Fichiers uploades
├── exports/                        # Exports CSV/PDF
└── package.json
```

---

## Modules API

### Structure standard par module

Chaque module suit la meme structure :
```
modules/{module}/
├── index.ts              # Export public
├── {module}.types.ts     # Interfaces TypeScript
├── {module}.service.ts   # Logique metier
├── {module}.controller.ts # Handlers HTTP
└── {module}.routes.ts    # Routes Express
```

### Mapping Frontend <-> Backend

| Module Backend | Module Frontend | Description |
|----------------|-----------------|-------------|
| `accounting/` | `accounting/` | Comptabilite |
| `ai/` | `ai/` | Chatbot IA |
| `analytics/` | `analytics/` | Statistiques |
| `audit/` | `audit/` | Psycho-Audit |
| `auth/` | `auth/` | Authentification |
| `canvases/` | `canvases/` | Galaxie/Canvas |
| `files/` | `files/` | Fichiers |
| `gamification/` | `gamification/` | Gamification |
| `messaging/` | `messaging/` | Messagerie |
| `notes/` | `notes/` | Notes/Journal |
| `notifications/` | `notifications/` | Notifications |
| `onboarding/` | `onboarding/` | Onboarding |
| `plans/` | `plans/` | Plans |
| `projects/` | `projects/` | Projets |
| `reports/` | `reports/` | Rapports |
| `signals/` | `signals/` | Signaux |
| `tasks/` | `tasks/` | Taches |
| `users/` | `users/` | Utilisateurs |
| `workspaces/` | `workspaces/` | Workspaces |

---

## Endpoints principaux

### Auth (`/api/v1/auth`)
| Methode | Route | Description |
|---------|-------|-------------|
| POST | `/login` | Connexion, retourne JWT |
| POST | `/register` | Inscription |
| POST | `/refresh` | Rafraichir token |
| POST | `/logout` | Deconnexion |
| GET | `/me` | Info utilisateur courant |

### Tasks (`/api/v1/tasks/workspace/:id`)
| Methode | Route | Description |
|---------|-------|-------------|
| GET | `/` | Liste des taches |
| POST | `/` | Creer tache |
| PUT | `/:taskId` | Modifier tache |
| DELETE | `/:taskId` | Supprimer tache |
| GET | `/active-users` | Utilisateurs actifs |

### Accounting (`/api/v1/accounting/workspace/:id`)
| Methode | Route | Description |
|---------|-------|-------------|
| POST | `/invoices` | Creer facture |
| POST | `/invoices/scan` | Upload + extraction IA |
| GET | `/invoices` | Liste avec filtres |
| GET | `/analytics/dashboard` | Stats globales |
| POST | `/export` | Generer export |

---

## Commandes

```bash
# Demarrer le serveur
cd /root/productive-core-backend
npx tsx src/index.ts

# Mode watch
npx tsx watch src/index.ts

# Migrations
npx tsx src/db/migrate.ts

# Test API
curl http://localhost:3000/health
```

---

## Credentials test

- **Email** : `brice@mahagiri.fr` (ou autre utilisateur @mahagiri.fr)
- **Workspace ID** : `fd92221a-aaa2-42c9-9d06-f158b5adccc3`

Note: Les utilisateurs sont dans le domaine @mahagiri.fr

---

## Communication avec le Frontend

```
Frontend (8080) --> Nginx --> /api/* --> Backend (3000)
```

Le frontend appelle le backend via :
- Nginx proxy : `location /api/` -> `http://localhost:3000`

---

*Derniere mise a jour : 2026-02-06 - Architecture parallele Frontend/Backend*

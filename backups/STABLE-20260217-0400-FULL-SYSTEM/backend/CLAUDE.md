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

> **Version** : 3.2.0
> **Derniere mise a jour** : 2026-02-17
> **Statut** : Production STABLE

---

## 🟡 CHANTIER EN COURS : Intégration Stripe & Plans (2026-02-17)

### ✅ TERMINÉ - Backend Stripe

**Backup** : `/root/backups/stripe-integration-20260217_011353/`

**Fichiers créés dans `src/modules/billing/` :**
- `billing.plans.ts` — 4 plans (Free/Pro/Business/Enterprise) avec features et prix Stripe via env
- `billing.service.ts` — getOrCreateStripeCustomer, createCheckoutSession, createPortalSession, getUserBillingStatus, handlers webhooks (checkout.completed, subscription.updated/deleted, invoice.paid/failed)
- `billing.controller.ts` — 6 handlers : createCheckout, createPortal, getBillingStatus, getPlans, getStripeStatus, handleWebhook
- `billing.routes.ts` — Routes avec webhook sur `express.raw()` (obligatoire pour signature Stripe)
- `billing.middleware.ts` — `requireFeature(featureKey)`, `requireLimit(limitKey, getUsage)`, `attachPlanInfo`
- `index.ts` — Export public du module

**Migration exécutée** : `migrations/029_billing_stripe.sql`
- Colonnes ajoutées à `users` : stripe_customer_id, stripe_subscription_id, subscription_status, subscription_plan, subscription_interval, current_period_end, cancel_at_period_end
- Table créée : `billing_events` (audit trail webhooks, déduplication via stripe_event_id)
- Vue créée : `user_billing_summary`

**Intégré dans `src/index.ts`** :
```typescript
import { billingRoutes } from './modules/billing/index.js';
// ...
apiRouter.use('/billing', billingRoutes);
```

**Variables `.env` ajoutées** (à remplir avec les vraies clés Stripe) :
```
STRIPE_SECRET_KEY=          # Clé secrète Stripe (sk_live_... ou sk_test_...)
STRIPE_WEBHOOK_SECRET=      # whsec_... depuis dashboard Stripe
STRIPE_PRICE_PRO_MONTHLY=   # price_xxx
STRIPE_PRICE_PRO_YEARLY=    # price_xxx
STRIPE_PRICE_BUSINESS_MONTHLY= # price_xxx
STRIPE_PRICE_BUSINESS_YEARLY=  # price_xxx
FRONTEND_URL=https://giri-app.com
```

**Tests validés** :
- ✅ `GET /api/v1/billing/plans` → 4 plans retournés
- ✅ `GET /api/v1/billing/stripe-status` → `enabled: false` (clés vides, normal)
- ✅ `GET /api/v1/billing/status` → 401 (auth requise, normal)
- ✅ PM2 online, build TypeScript sans erreurs billing

### ✅ TERMINÉ - Frontend Billing

**Fichiers créés dans `/var/www/productiveapp/` :**
- `js/modules/billing/billing-api.js` — Appels API + `redirectToCheckout()` + `redirectToPortal()`
- `js/modules/billing/feature-gate.js` — `FeatureGate.requireFeature()`, `checkLimit()`, `gateElement()`, modale upgrade
- `js/modules/billing/billing-plans.js` — Page pricing (toggle mensuel/annuel, 4 cards, FAQ, banner plan actuel)
- `css/billing.css` — Design glassmorphism complet + modale feature-gate + responsive

**Intégrations :**
- `index.html` : +4 tags (1 CSS + 3 JS), +1 `<div id="view-billing">`
- `js/modules/router.js` : route `billing` → `view-billing` → `BillingPlansView.init()`
- `js/modules/sidebar/sidebar-core.js` : item "Abonnement" (icône credit-card) + routedViews

### ❌ À FAIRE - Configuration Stripe Dashboard

1. **Créer les produits** dans https://dashboard.stripe.com/products :
   - "Giri App Pro" (9.99€/mois, 95.90€/an)
   - "Giri App Business" (29.99€/mois, 287.90€/an)
2. **Copier les Price IDs** dans `.env`
3. **Configurer le webhook** : `https://giri-app.com/api/v1/billing/webhooks`
   - Events : checkout.session.completed, customer.subscription.*, invoice.payment_failed, invoice.paid
4. **Copier `STRIPE_WEBHOOK_SECRET`** dans `.env`
5. **Rebuild + restart** : `npm run build && pm2 restart productive-core`
6. **Configurer Customer Portal** dans Stripe Dashboard (pour `redirectToPortal`)
7. **Test end-to-end** : carte test `4242 4242 4242 4242`

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

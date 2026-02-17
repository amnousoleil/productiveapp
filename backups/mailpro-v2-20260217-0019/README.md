# BACKUP MAIL PRO V2 - Messagerie Bidirectionnelle

**Date** : 2026-02-17 00:19 UTC
**Objectif** : Backup complet avant transformation en messagerie bidirectionnelle avec adresses @giri-app.com

---

## 📦 CONTENU DU BACKUP

### Frontend (15 fichiers JS + 4 CSS)
```
frontend/
├── js/mail/
│   ├── mail-api.js              (3.4K)  - API backend
│   ├── mail-campaigns.js        (24K)   - Campagnes
│   ├── mail-composer-v7.js      (21K)   - Compositeur riche
│   ├── mail-composer.js         (5.7K)  - Compositeur basique
│   ├── mail-contacts.js         (1.9K)  - Contacts
│   ├── mail-detail.js           (5.4K)  - Détail email (nouveau v8.0)
│   ├── mail-header.js           (4.4K)  - Header compact (nouveau v8.0)
│   ├── mail-inbox.js            (13K)   - Ancien inbox
│   ├── mail-main.js             (2.4K)  - Orchestrateur (nouveau v8.0)
│   ├── mail-sent-list.js        (6.7K)  - Liste Gmail (nouveau v8.0)
│   ├── mail-stats.js            (4.1K)  - Statistiques
│   ├── mail-tabs.js             (4.2K)  - Navigation tabs (nouveau v8.0)
│   ├── mail-templates.js        (7.0K)  - Templates
│   └── mail-utils.js            (5.1K)  - Utilitaires (nouveau v8.0)
│
├── css/
│   ├── mail-premium-v7.css      - Ancien CSS v7.0
│   ├── mail-zen.css             - Nouveau CSS v8.0 (utilisé actuellement)
│   ├── mail.css                 - CSS original
│   └── mail-premium-v7_backup_* - Backup antérieur
│
└── index.html                   - Version actuelle avec scripts v8.0
```

### Backend (7 fichiers TypeScript)
```
backend/
└── src/modules/mail/
    ├── mail.routes.ts           - Routes API
    ├── mail.controller.ts       - Contrôleurs
    ├── mail.service.ts          - Logique métier
    ├── mail.types.ts            - Types TypeScript
    ├── notifications.ts         - Notifications mail
    ├── pool.ts                  - Pool de connexions
    └── index.ts                 - Point d'entrée
```

### Base de données
```
database/
├── sent_mails_schema.sql        (3.7K)  - Schéma table sent_mails
├── sent_mails_sample.sql        (132K)  - Sample de 42 emails
└── tables_list.txt              - Liste des 6 tables mail existantes
```

**Tables mail existantes** :
- `sent_mails` (42 emails)
- `email_templates`
- `email_campaigns`
- `mail_templates`
- `email_queue`
- `conversation_email_exports`
- `email_verification_tokens`

---

## 🔄 RESTAURATION

### Restauration complète (code + DB)
```bash
cd /var/www/productiveapp/backups/mailpro-v2-20260217-0019
./RESTORE.sh
```
⚠️  Demande confirmation pour la DB (écrasement)

### Restauration code seulement
```bash
cd /var/www/productiveapp/backups/mailpro-v2-20260217-0019
./RESTORE-CODE-ONLY.sh
```
✅ Restaure frontend + backend sans toucher à la DB

### Restauration DB seulement
```bash
cd /var/www/productiveapp/backups/mailpro-v2-20260217-0019
./RESTORE-DB-ONLY.sh
```
⚠️  DROP la table sent_mails et la recrée avec les données du backup

---

## 📊 ÉTAT ACTUEL

### Fonctionnalités existantes (V1)
✅ **Envoi d'emails** via Resend API
✅ **Liste compacte Gmail-style** (refonte v8.0 zen)
✅ **Recherche** en temps réel
✅ **Filtres** : Tous / Envoyés / Ouverts / Échecs
✅ **Détail email** en modal
✅ **Compositeur** avec éditeur riche
✅ **Templates** d'emails
✅ **Campagnes** emails
✅ **Contacts**
✅ **Stats** (envoyés, taux d'ouverture)
✅ **Multi-thèmes** (60 thèmes compatibles)

### Limitations actuelles
❌ **Pas de réception** d'emails
❌ **Pas d'adresses @giri-app.com** pour les utilisateurs
❌ **Pas de boîte de réception**
❌ **Pas de threading** (conversations)
❌ **Pas de dossiers** personnalisés
❌ **Pas de labels**
❌ **Pas de notifications** temps réel
❌ **Pas de recherche** avancée

---

## 🎯 OBJECTIF V2

Transformer Mail Pro en **messagerie bidirectionnelle complète** :

### Nouvelles fonctionnalités
1. **Adresses email** : Chaque utilisateur a `prenom@giri-app.com`
2. **Réception** : Webhook Resend → stockage DB → affichage
3. **Boîte de réception** : Tous les emails reçus
4. **Layout 3 colonnes** : Sidebar | Liste | Lecteur
5. **Threading** : Conversations regroupées
6. **Dossiers** : Inbox, Sent, Drafts, Trash, + personnalisés
7. **Labels** : Personnalisables avec couleurs
8. **Notifications** temps réel (WebSocket/SSE)
9. **Recherche** full-text avancée
10. **Répondre / Transférer** depuis l'app
11. **Raccourcis clavier**
12. **Signatures** HTML personnalisables
13. **Planification** d'envoi
14. **Brouillons** auto-sauvegardés

### Nouveau schéma DB
Table `emails` unifiée :
- `direction` : 'inbound' ou 'outbound'
- `thread_id` : Regroupement conversations
- `folder` : inbox, sent, drafts, trash, custom
- `labels` : JSONB array
- `is_read`, `is_starred`, `is_deleted`
- etc.

---

## 🚨 RÈGLES CRITIQUES

### Fichiers INTERDITS (ne PAS modifier)
- ❌ `auth.js`, `login.js`, `login-ui.js`, `login.css`
- ❌ Modules des autres sections (journal, tâches, teamtalk, etc.)
- ❌ Fichiers de thème globaux (sauf ajout de variables spécifiques)

### Compatibilité
- ✅ Conserver TOUS les emails envoyés existants (42 emails)
- ✅ Migration sans perte de données
- ✅ L'envoi d'email doit continuer à fonctionner
- ✅ Compatibilité avec les 60 thèmes existants

### Sécurité
- ✅ HTML sanitizé (DOMPurify)
- ✅ Iframe sandboxée pour rendu emails
- ✅ Webhook Resend signature vérifiée
- ✅ Images externes bloquées par défaut

---

## 📚 DOCUMENTATION LIÉE

- **Rapport v8.0** : `/tmp/MAILPRO_REFONTE_v8_RAPPORT.md`
- **Backup v8.0** : `backups/mailpro-refonte-20260216-2328/`
- **Instructions Resend** : À créer → `RESEND-SETUP.md`

---

## 🛠️ UTILISATION DES SCRIPTS

### Test de restauration (dry-run)
Avant de restaurer, vérifier le contenu :
```bash
# Vérifier les fichiers
ls -lR /var/www/productiveapp/backups/mailpro-v2-20260217-0019/

# Vérifier le schéma DB
cat /var/www/productiveapp/backups/mailpro-v2-20260217-0019/database/sent_mails_schema.sql

# Compter les emails du sample
grep "INSERT INTO" /var/www/productiveapp/backups/mailpro-v2-20260217-0019/database/sent_mails_sample.sql | wc -l
```

### Restauration progressive
1. **Code seulement** d'abord (test sans risque DB)
2. **Vérifier** que l'app fonctionne
3. **DB ensuite** si le code est OK

---

## ⚠️ EN CAS DE PROBLÈME

Si Mail Pro V2 casse l'application :

### Restauration rapide (< 2 minutes)
```bash
cd /var/www/productiveapp/backups/mailpro-v2-20260217-0019
./RESTORE.sh
```

### Restauration manuelle
```bash
# Frontend
cp -r frontend/js/mail/* /var/www/productiveapp/js/modules/mail/
cp frontend/css/*.css /var/www/productiveapp/css/

# Backend
cp -r backend/src/modules/mail/* /root/productive-core-backend/src/modules/mail/

# DB
sudo -u postgres psql -d productive_app -f database/sent_mails_schema.sql
sudo -u postgres psql -d productive_app -f database/sent_mails_sample.sql

# Services
cd /root/productive-core-backend
npm run build
pm2 restart productive-core
systemctl reload nginx
```

---

**Backup créé par** : Claude Code Session
**Timestamp** : 2026-02-17 00:19 UTC
**Version Mail Pro** : v8.0 ZEN (refonte récente)
**Prochaine version** : v2.0 Bidirectionnelle

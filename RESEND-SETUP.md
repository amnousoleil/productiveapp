# Configuration Resend pour Mail Pro V2 - Réception d'emails

**Date** : 2026-02-17
**Objectif** : Activer la réception d'emails sur le domaine giri-app.com via Resend

---

## ⚠️ IMPORTANT

Cette configuration **NE PEUT PAS** être automatisée. Elle doit être effectuée **manuellement** dans le dashboard Resend par un administrateur ayant accès au compte Resend et à la configuration DNS du domaine.

---

## 📋 ÉTAPE 1 : Vérifier le domaine

1. Se connecter au dashboard Resend : https://resend.com/domains
2. Vérifier que le domaine `giri-app.com` est bien présent et **vérifié** (badge vert)
3. Si le domaine n'est pas vérifié, suivre les instructions DNS de Resend

**Records DNS requis** (déjà en place normalement) :
```
Type: TXT
Name: _resend
Value: re_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

---

## 📋 ÉTAPE 2 : Activer l'inbound mail

### 2.1 Accéder aux paramètres du domaine

1. Dans https://resend.com/domains, cliquer sur `giri-app.com`
2. Aller dans l'onglet **"Inbound"**
3. Cliquer sur **"Enable Inbound"**

### 2.2 Configurer les DNS MX

Resend va afficher les **records MX** à ajouter dans votre configuration DNS. Exemple :

```
Type: MX
Priority: 10
Name: @
Value: inbound-smtp.resend.com
```

**Où ajouter ces records ?**
- Si le DNS est géré par Cloudflare → https://dash.cloudflare.com
- Si le DNS est géré par le registrar (OVH, Gandi, etc.) → Panel du registrar

### 2.3 Vérifier la configuration MX

Une fois les records MX ajoutés, attendre la propagation DNS (5-30 minutes).

Vérifier avec :
```bash
dig MX giri-app.com
```

Vous devriez voir :
```
giri-app.com.  300  IN  MX  10 inbound-smtp.resend.com.
```

---

## 📋 ÉTAPE 3 : Créer le webhook

### 3.1 Créer un webhook dans Resend

1. Aller dans https://resend.com/webhooks
2. Cliquer sur **"Create Webhook"**
3. Remplir le formulaire :

**Webhook URL** :
```
https://giri-app.com/api/v1/mail/inbound/webhook
```

**Events** (cocher uniquement) :
- ✅ `email.received`

**Description** (optionnel) :
```
Mail Pro V2 - Inbound emails
```

4. Cliquer sur **"Create"**

### 3.2 Noter le webhook secret

⚠️  **CRITIQUE** : Resend va afficher un **Webhook Secret** (une seule fois).

**Copier ce secret** et l'ajouter au fichier `.env` du backend :

```bash
cd /root/productive-core-backend
nano .env
```

Ajouter cette ligne :
```
RESEND_WEBHOOK_SECRET=whsec_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

Sauvegarder et quitter (`Ctrl+X`, `Y`, `Enter`).

### 3.3 Redémarrer le backend

```bash
pm2 restart productive-core
```

---

## 📋 ÉTAPE 4 : Tester la réception

### 4.1 Envoyer un email de test

Depuis votre boîte mail personnelle (Gmail, Outlook, etc.), envoyer un email à :

```
test@giri-app.com
```

Sujet : "Test réception Mail Pro V2"
Corps : "Ceci est un test"

### 4.2 Vérifier la réception dans Resend

1. Aller dans https://resend.com/emails
2. Vous devriez voir l'email reçu dans la liste
3. Cliquer dessus pour voir les détails

### 4.3 Vérifier le webhook

Dans le dashboard Resend :
1. Aller dans https://resend.com/webhooks
2. Cliquer sur le webhook créé
3. Onglet **"Deliveries"** → vous devriez voir une requête POST vers votre endpoint
4. Vérifier le **Status Code** : doit être **200 OK**

Si le status est **404** ou **500**, c'est que le backend n'est pas encore prêt.

### 4.4 Vérifier la base de données

Vérifier que l'email est bien stocké :

```bash
sudo -u postgres psql -d productive_app -c "SELECT * FROM emails WHERE direction='inbound' ORDER BY created_at DESC LIMIT 1;"
```

Vous devriez voir :
- `from_address` : votre email personnel
- `to_addresses` : `["test@giri-app.com"]`
- `subject` : "Test réception Mail Pro V2"
- `direction` : "inbound"

---

## 📋 ÉTAPE 5 : Attribuer les adresses @giri-app.com

### 5.1 Lister les utilisateurs existants

```bash
sudo -u postgres psql -d productive_app -c "SELECT user_id, name, email FROM users;"
```

### 5.2 Attribuer les adresses

**Option 1 : Automatique** (via migration SQL)
```sql
UPDATE users
SET email_address = LOWER(SPLIT_PART(name, ' ', 1)) || '@giri-app.com'
WHERE email_address IS NULL;
```

**Option 2 : Manuelle** (pour éviter les conflits)
```sql
UPDATE users SET email_address = 'maha@giri-app.com' WHERE user_id = 'user-001';
UPDATE users SET email_address = 'brice@giri-app.com' WHERE user_id = 'user-002';
UPDATE users SET email_address = 'lilian@giri-app.com' WHERE user_id = 'user-003';
-- etc.
```

### 5.3 Vérifier l'attribution

```bash
sudo -u postgres psql -d productive_app -c "SELECT user_id, name, email_address FROM users;"
```

---

## 📋 ÉTAPE 6 : Test end-to-end complet

### 6.1 Envoyer un email à un utilisateur réel

Envoyer un email à : `maha@giri-app.com` (ou le prénom d'un vrai utilisateur)

### 6.2 Se connecter à ProductiveApp

1. Ouvrir https://giri-app.com
2. Se connecter avec l'utilisateur concerné
3. Aller dans **Mail Pro**
4. Onglet **"Boîte de réception"**
5. L'email doit apparaître dans la liste

### 6.3 Tester la réponse

1. Cliquer sur l'email
2. Cliquer sur **"Répondre"**
3. Écrire une réponse
4. Envoyer

L'email doit arriver dans votre boîte personnelle avec :
- **From** : `maha@giri-app.com`
- **Subject** : `Re: ...`

---

## 🔒 SÉCURITÉ

### Vérification de signature webhook

Le backend **DOIT** vérifier la signature du webhook pour empêcher le spoofing.

Code de vérification (déjà implémenté dans le backend) :

```typescript
import crypto from 'crypto';

function verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}
```

### Rate limiting

Le webhook endpoint est protégé contre le spam :
- Max 100 emails/minute par IP
- Blocage automatique si dépassement

---

## 🐛 DÉPANNAGE

### Problème : L'email n'arrive pas dans Resend

**Vérifier** :
1. Les records MX sont corrects : `dig MX giri-app.com`
2. Le domaine est vérifié dans Resend (badge vert)
3. L'inbound est activé sur le domaine
4. L'email a bien été envoyé à `@giri-app.com` (pas `@giri.app`)

### Problème : Le webhook n'est pas appelé

**Vérifier** :
1. Le webhook est actif dans Resend
2. L'event `email.received` est coché
3. L'URL du webhook est correcte : `https://giri-app.com/api/v1/mail/inbound/webhook`
4. Le backend est en ligne : `curl https://giri-app.com/api/v1/health`

### Problème : Le webhook retourne 500

**Vérifier** :
1. Les logs backend : `pm2 logs productive-core`
2. La DB est accessible : `sudo -u postgres psql -d productive_app -c "SELECT 1;"`
3. Le secret webhook est correct dans `.env`

### Problème : L'email est reçu mais pas affiché

**Vérifier** :
1. L'email est dans la DB : `SELECT * FROM emails WHERE direction='inbound' ORDER BY created_at DESC LIMIT 5;`
2. Le `to_addresses` correspond à un `email_address` d'utilisateur
3. L'utilisateur est bien connecté et a les permissions

---

## 📊 MONITORING

### Vérifier les emails reçus

```sql
SELECT
  COUNT(*) as total,
  COUNT(CASE WHEN direction='inbound' THEN 1 END) as received,
  COUNT(CASE WHEN direction='outbound' THEN 1 END) as sent,
  MAX(created_at) as last_email
FROM emails;
```

### Vérifier les webhooks

Dans Resend :
1. https://resend.com/webhooks
2. Cliquer sur le webhook
3. Onglet "Deliveries"
4. Voir l'historique des appels (success/failed)

---

## ✅ CHECKLIST FINALE

Avant de considérer la configuration complète :

- [ ] Domaine `giri-app.com` vérifié dans Resend
- [ ] Records MX configurés et propagés
- [ ] Inbound activé sur le domaine
- [ ] Webhook créé avec l'URL correcte
- [ ] Webhook secret ajouté au `.env`
- [ ] Backend redémarré
- [ ] Test email envoyé et reçu dans Resend
- [ ] Webhook appelé avec succès (status 200)
- [ ] Email stocké dans la DB
- [ ] Adresses `@giri-app.com` attribuées aux utilisateurs
- [ ] Email visible dans l'interface Mail Pro
- [ ] Réponse testée et fonctionnelle

---

**Document créé par** : Claude Code Session
**Date** : 2026-02-17
**Version** : Mail Pro V2
**Prochaines étapes** : Tests en production avec vrais utilisateurs

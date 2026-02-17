# 🔒 N8N Backup Workflow - Configuration PostgreSQL

## Vue d'ensemble

Ce document décrit la configuration du workflow N8N pour gérer les sauvegardes automatiques de ProductiveApp dans PostgreSQL.

## Endpoint API

**URL**: `https://n8n.srv1053121.hstgr.cloud/webhook/backup`

## Actions supportées

### 1. Créer une sauvegarde

```json
POST /webhook/backup
{
    "action": "create_backup",
    "tenant_id": "digitalgiri",
    "timestamp": "2026-02-02T12:00:00.000Z",
    "data": {
        "tasks": [...],
        "projects": [...],
        "journal": [...]
    },
    "metadata": {
        "version": "3.0.0",
        "taskCount": 150,
        "projectCount": 11,
        "journalCount": 50
    }
}
```

### 2. Lister les sauvegardes

```json
POST /webhook/backup
{
    "action": "list",
    "tenant_id": "digitalgiri"
}
```

### 3. Restaurer une sauvegarde

```json
POST /webhook/backup
{
    "action": "restore",
    "tenant_id": "digitalgiri",
    "backup_id": "backup_123456789"
}
```

## Structure de la table PostgreSQL

```sql
CREATE TABLE backups (
    id SERIAL PRIMARY KEY,
    backup_id VARCHAR(100) UNIQUE NOT NULL,
    tenant_id VARCHAR(50) NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    user_id VARCHAR(50),
    data JSONB NOT NULL,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),

    INDEX idx_tenant (tenant_id),
    INDEX idx_timestamp (timestamp DESC)
);

-- Conserver seulement les 30 dernières sauvegardes par tenant
CREATE OR REPLACE FUNCTION cleanup_old_backups()
RETURNS TRIGGER AS $$
BEGIN
    DELETE FROM backups
    WHERE tenant_id = NEW.tenant_id
    AND id NOT IN (
        SELECT id FROM backups
        WHERE tenant_id = NEW.tenant_id
        ORDER BY timestamp DESC
        LIMIT 30
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_cleanup_backups
AFTER INSERT ON backups
FOR EACH ROW EXECUTE FUNCTION cleanup_old_backups();
```

## Configuration N8N Workflow

### Workflow "ProductiveApp Backup"

1. **Webhook Node** (Trigger)
   - Path: `/backup`
   - HTTP Method: POST
   - Response Mode: Immediate

2. **Switch Node** (Router par action)
   - Conditions:
     - `create_backup` → Branch 1
     - `list` → Branch 2
     - `restore` → Branch 3

3. **Branch 1: Create Backup**
   - **Function Node**: Générer backup_id unique
   - **PostgreSQL Node**: INSERT INTO backups
   - **Response Node**: { success: true, backup_id: "..." }

4. **Branch 2: List Backups**
   - **PostgreSQL Node**: SELECT * FROM backups WHERE tenant_id = $1 ORDER BY timestamp DESC LIMIT 30
   - **Response Node**: Array de backups

5. **Branch 3: Restore Backup**
   - **PostgreSQL Node**: SELECT data FROM backups WHERE backup_id = $1
   - **Response Node**: { success: true, data: {...} }

## Fréquence de sauvegarde

- **Auto-backup**: Toutes les 30 minutes (via le frontend)
- **Quick save**: Toutes les 5 minutes (localStorage)
- **Manual backup**: Sur demande utilisateur

## Récupération d'urgence

En cas de problème avec l'API:

1. Vérifier le quick save dans localStorage:
   ```javascript
   const saved = localStorage.getItem('productiveapp_quicksave');
   console.log(JSON.parse(saved));
   ```

2. Exporter les données JSON:
   - Clic sur "Export" dans le menu
   - Fichier `productiveapp_backup_YYYY-MM-DD.json`

3. Restaurer depuis PostgreSQL:
   ```sql
   SELECT data FROM backups
   WHERE tenant_id = 'digitalgiri'
   ORDER BY timestamp DESC
   LIMIT 1;
   ```

## Logs et monitoring

- Les backups sont loggés dans la console: `✅ Backup PostgreSQL créé`
- Erreurs: `❌ Erreur backup PostgreSQL: ...`
- Dashboard N8N pour monitoring des exécutions

---

*Dernière mise à jour: 2026-02-02*
*Version: 3.0.0*

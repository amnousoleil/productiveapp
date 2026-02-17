-- Migration 027: Ajout des types d'événements manquants au calendrier
-- Date: 2026-02-14
-- Description: Ajoute 'general', 'personal', 'urgent' à l'ENUM event_type

-- Ajouter les nouveaux types d'événements
ALTER TYPE event_type ADD VALUE IF NOT EXISTS 'general';
ALTER TYPE event_type ADD VALUE IF NOT EXISTS 'personal';
ALTER TYPE event_type ADD VALUE IF NOT EXISTS 'urgent';

-- Commentaire pour documentation
COMMENT ON TYPE event_type IS 'Types d''événements calendrier: meeting, deadline, reminder, availability, blocked, task_due, invoice_due, general, personal, urgent';

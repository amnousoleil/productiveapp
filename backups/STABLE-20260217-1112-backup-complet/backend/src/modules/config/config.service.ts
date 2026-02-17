import pool from './pool.js';
import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';

interface WorkspaceConfig {
  name?: string;
  logo_url?: string | null;
  primary_color?: string;
  default_theme?: string;
  timezone?: string;
  locale?: string;
}

// Récupérer le premier workspace d'un user
export async function getUserFirstWorkspace(userId: string): Promise<string | null> {
  const result = await pool.query(
    `SELECT w.id 
     FROM workspaces w
     LEFT JOIN workspace_members wm ON w.id = wm.workspace_id
     WHERE w.owner_id = $1 OR wm.user_id = $1
     ORDER BY w.created_at ASC
     LIMIT 1`,
    [userId]
  );

  return result.rows[0]?.id || null;
}

// Récupérer config workspace
export async function getWorkspaceConfig(workspaceId: string) {
  const result = await pool.query(
    `SELECT id, name, logo_url, primary_color, default_theme, timezone, locale,
     created_at, updated_at
     FROM workspaces WHERE id = $1`,
    [workspaceId]
  );

  if (result.rows.length === 0) {
    throw new Error('Workspace not found');
  }

  return result.rows[0];
}

// Mettre à jour config
export async function updateWorkspaceConfig(
  workspaceId: string,
  config: WorkspaceConfig
) {
  const fields = [];
  const values = [];
  let paramIndex = 1;

  // Construire query dynamique
  if (config.name !== undefined) {
    fields.push(`name = $${paramIndex++}`);
    values.push(config.name);
  }
  if (config.logo_url !== undefined) {
    fields.push(`logo_url = $${paramIndex++}`);
    values.push(config.logo_url);
  }
  if (config.primary_color !== undefined) {
    fields.push(`primary_color = $${paramIndex++}`);
    values.push(config.primary_color);
  }
  if (config.default_theme !== undefined) {
    fields.push(`default_theme = $${paramIndex++}`);
    values.push(config.default_theme);
  }
  if (config.timezone !== undefined) {
    fields.push(`timezone = $${paramIndex++}`);
    values.push(config.timezone);
  }
  if (config.locale !== undefined) {
    fields.push(`locale = $${paramIndex++}`);
    values.push(config.locale);
  }

  if (fields.length === 0) {
    throw new Error('No fields to update');
  }

  fields.push(`updated_at = NOW()`);
  values.push(workspaceId);

  const query = `
    UPDATE workspaces
    SET ${fields.join(', ')}
    WHERE id = $${paramIndex}
    RETURNING *
  `;

  const result = await pool.query(query, values);
  return result.rows[0];
}

// Upload logo vers local storage
export async function uploadLogoToLocal(file: Express.Multer.File): Promise<string> {
  // Générer filename unique
  const filename = `${crypto.randomBytes(16).toString('hex')}-${file.originalname}`;
  const uploadDir = '/var/www/productiveapp/uploads/logos';
  const filepath = path.join(uploadDir, filename);

  // Créer dossier si n'existe pas
  await fs.mkdir(uploadDir, { recursive: true });

  // Écrire fichier
  await fs.writeFile(filepath, file.buffer);

  // Retourner URL publique
  return `/uploads/logos/${filename}`;
}

import { Response } from 'express';
import type { AuthenticatedRequest } from '../../types/index.js';
import * as configService from './config.service.js';

// Helper pour récupérer workspace
async function getWorkspaceId(req: AuthenticatedRequest): Promise<string | null> {
  if (req.workspace?.id) return req.workspace.id;
  if (req.user?.id) return await configService.getUserFirstWorkspace(req.user.id);
  return null;
}

// GET /api/v1/config - Récupérer config workspace
export async function getConfig(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const workspaceId = await getWorkspaceId(req);
    
    if (!workspaceId) {
      res.status(400).json({ error: 'No workspace found' });
      return;
    }

    const config = await configService.getWorkspaceConfig(workspaceId);
    res.json({ success: true, data: config });
  } catch (error) {
    console.error('Get config error:', error);
    res.status(500).json({ error: 'Failed to get config' });
  }
}

// PUT /api/v1/config - Modifier config
export async function updateConfig(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const workspaceId = await getWorkspaceId(req);
    
    if (!workspaceId) {
      res.status(400).json({ error: 'No workspace found' });
      return;
    }

    const { name, primary_color, default_theme, timezone, locale } = req.body;

    const updated = await configService.updateWorkspaceConfig(workspaceId, {
      name,
      primary_color,
      default_theme,
      timezone,
      locale
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Update config error:', error);
    res.status(500).json({ error: 'Failed to update config' });
  }
}

// POST /api/v1/config/upload-logo - Upload logo
export async function uploadLogo(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const workspaceId = await getWorkspaceId(req);
    const file = req.file;

    if (!workspaceId || !file) {
      res.status(400).json({ error: 'Missing workspace or file' });
      return;
    }

    // Upload vers local storage
    const logoUrl = await configService.uploadLogoToLocal(file);

    // Sauvegarder URL en DB
    await configService.updateWorkspaceConfig(workspaceId, {
      logo_url: logoUrl
    });

    res.json({ success: true, data: { logo_url: logoUrl } });
  } catch (error) {
    console.error('Upload logo error:', error);
    res.status(500).json({ error: 'Failed to upload logo' });
  }
}

// DELETE /api/v1/config/logo - Supprimer logo
export async function deleteLogo(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const workspaceId = await getWorkspaceId(req);
    
    if (!workspaceId) {
      res.status(400).json({ error: 'No workspace found' });
      return;
    }

    await configService.updateWorkspaceConfig(workspaceId, {
      logo_url: null
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Delete logo error:', error);
    res.status(500).json({ error: 'Failed to delete logo' });
  }
}

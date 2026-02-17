/**
 * Module Comptabilité - Service FEC (Fichier des Écritures Comptables)
 * @description Génération du fichier FEC conforme à la norme française (article A.47 A-1 du LPF)
 *
 * Format: 18 colonnes séparées par des tabulations
 * Encodage: UTF-8 (ou ISO-8859-15 selon préférence)
 * Nom de fichier: {SIRET}FEC{YYYYMMDD}.txt
 *
 * Plan Comptable Général (PCG) utilisé:
 * - 401xxx : Fournisseurs
 * - 411xxx : Clients
 * - 512xxx : Banques
 * - 6xxxxx : Charges (dépenses)
 * - 7xxxxx : Produits (revenus)
 * - 44566x : TVA déductible
 * - 44571x : TVA collectée
 */
import { Pool } from 'pg';
import { FECGenerationResult } from './accounting.types.js';
export declare const initFECService: (dbPool: Pool) => void;
/**
 * Génère un fichier FEC complet pour un exercice fiscal
 *
 * Pour chaque facture, on crée 3 lignes d'écriture:
 * - Ligne 1: Compte tiers (401xxx fournisseur ou 411xxx client) au crédit/débit (TTC)
 * - Ligne 2: Compte de charge/produit (6xxx ou 7xxx) au débit/crédit (HT)
 * - Ligne 3: Compte de TVA (44566x déductible ou 44571x collectée) au débit/crédit
 *
 * Le fichier est écrit en UTF-8, tab-separated, avec BOM
 */
export declare const generateFEC: (workspaceId: string, year: number) => Promise<FECGenerationResult>;
//# sourceMappingURL=accounting.fec.d.ts.map
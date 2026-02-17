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
import * as fs from 'fs';
import * as path from 'path';
import { FECEntry, FECGenerationResult } from './accounting.types.js';

let pool: Pool;

export const initFECService = (dbPool: Pool): void => {
  pool = dbPool;
};

// ============================================
// COLONNES FEC
// ============================================

const FEC_HEADERS: string[] = [
  'JournalCode',
  'JournalLib',
  'EcritureNum',
  'EcritureDate',
  'CompteNum',
  'CompteLib',
  'CompAuxNum',
  'CompAuxLib',
  'PieceRef',
  'PieceDate',
  'EcritureLib',
  'Debit',
  'Credit',
  'EcritureLet',
  'DateLet',
  'ValidDate',
  'Montantdevise',
  'Idevise'
];

// ============================================
// CODES JOURNAUX
// ============================================

const JOURNAL_CODES = {
  ACHATS: { code: 'HA', lib: 'Journal des Achats' },
  VENTES: { code: 'VE', lib: 'Journal des Ventes' },
  BANQUE: { code: 'BQ', lib: 'Journal de Banque' },
  OD: { code: 'OD', lib: 'Opérations Diverses' }
} as const;

// ============================================
// MAPPAGE PCG
// ============================================

/**
 * Détermine le numéro de compte PCG en fonction du type et de la catégorie
 */
const getExpenseAccountCode = (categorySlug: string | null): string => {
  const mapping: Record<string, string> = {
    'fournitures-bureau': '606100',
    'logiciels': '605100',
    'hebergement': '613200',
    'repas': '625700',
    'transport': '625100',
    'telecom': '626000',
    'honoraires': '622600',
    'assurances': '616000',
    'impots': '635100',
    'frais-bancaires': '627000',
    'marketing': '623100',
    'formation': '618500',
    'autres-depenses': '608000'
  };
  return mapping[categorySlug || ''] || '607000';
};

const getRevenueAccountCode = (categorySlug: string | null): string => {
  const mapping: Record<string, string> = {
    'prestations-clients': '706000',
    'ventes-produits': '701000',
    'abonnements-recus': '708000',
    'autres-revenus': '758000'
  };
  return mapping[categorySlug || ''] || '700000';
};

const getExpenseAccountLib = (categorySlug: string | null): string => {
  const mapping: Record<string, string> = {
    'fournitures-bureau': 'Fournitures de bureau',
    'logiciels': 'Achats de logiciels',
    'hebergement': 'Hébergement et locations',
    'repas': 'Frais de restauration',
    'transport': 'Frais de transport',
    'telecom': 'Frais de télécommunication',
    'honoraires': 'Honoraires et commissions',
    'assurances': 'Primes d\'assurance',
    'impots': 'Impôts et taxes',
    'frais-bancaires': 'Frais bancaires',
    'marketing': 'Publicité et marketing',
    'formation': 'Frais de formation',
    'autres-depenses': 'Autres charges'
  };
  return mapping[categorySlug || ''] || 'Charges diverses';
};

const getRevenueAccountLib = (categorySlug: string | null): string => {
  const mapping: Record<string, string> = {
    'prestations-clients': 'Prestations de services',
    'ventes-produits': 'Ventes de produits',
    'abonnements-recus': 'Abonnements et redevances',
    'autres-revenus': 'Autres produits'
  };
  return mapping[categorySlug || ''] || 'Produits divers';
};

// ============================================
// GÉNÉRATION FEC
// ============================================

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
export const generateFEC = async (
  workspaceId: string,
  year: number
): Promise<FECGenerationResult> => {
  try {
    // Récupérer les paramètres de la société (SIRET)
    const settingsResult = await pool.query(
      `SELECT siret, company_name FROM company_settings
       WHERE workspace_id = $1`,
      [workspaceId]
    );

    const siret = settingsResult.rows[0]?.siret || '00000000000000';
    // companyName available via settingsResult.rows[0]?.company_name if needed

    // Récupérer toutes les factures validées/payées de l'année
    const invoicesResult = await pool.query(
      `SELECT
        i.id, i.type, i.fournisseur, i.reference,
        i.montant_ht, i.montant_tva, i.montant_ttc, i.tva_rate,
        i.date_facture, i.status, i.contact_id,
        c.slug as category_slug, c.name as category_name,
        ct.company as contact_company,
        ct.siret as contact_siret
       FROM invoices i
       LEFT JOIN accounting_categories c ON i.category_id = c.id
       LEFT JOIN contacts ct ON i.contact_id = ct.id
       WHERE i.workspace_id = $1
         AND EXTRACT(YEAR FROM i.date_facture) = $2
         AND i.status IN ('validated', 'paid')
       ORDER BY i.date_facture ASC, i.created_at ASC`,
      [workspaceId, year]
    );

    const entries: FECEntry[] = [];
    let ecritureNum = 1;

    for (const inv of invoicesResult.rows) {
      const isExpense = inv.type === 'expense';
      const dateStr = formatFECDate(new Date(inv.date_facture));
      const montantHT = parseFloat(inv.montant_ht);
      const montantTVA = parseFloat(inv.montant_tva);
      const montantTTC = parseFloat(inv.montant_ttc);
      const ecritureNumStr = padLeft(ecritureNum.toString(), 8, '0');
      const journal = isExpense ? JOURNAL_CODES.ACHATS : JOURNAL_CODES.VENTES;
      const pieceRef = inv.reference || `FA-${inv.id.substring(0, 8).toUpperCase()}`;
      const ecritureLib = `${inv.fournisseur} - ${pieceRef}`;
      const validDate = inv.status === 'paid' ? dateStr : '';
      const compAuxNum = inv.contact_siret || '';
      const compAuxLib = inv.contact_company || inv.fournisseur || '';

      // === Ligne 1: Compte tiers (TTC) ===
      if (isExpense) {
        // ACHAT: 401xxx (Fournisseurs) au Crédit pour TTC
        entries.push({
          JournalCode: journal.code,
          JournalLib: journal.lib,
          EcritureNum: ecritureNumStr,
          EcritureDate: dateStr,
          CompteNum: '401000',
          CompteLib: 'Fournisseurs',
          CompAuxNum: compAuxNum,
          CompAuxLib: compAuxLib,
          PieceRef: pieceRef,
          PieceDate: dateStr,
          EcritureLib: ecritureLib,
          Debit: formatAmount(0),
          Credit: formatAmount(montantTTC),
          EcritureLet: '',
          DateLet: '',
          ValidDate: validDate,
          Montantdevise: formatAmount(montantTTC),
          Idevise: 'EUR'
        });
      } else {
        // VENTE: 411xxx (Clients) au Débit pour TTC
        entries.push({
          JournalCode: journal.code,
          JournalLib: journal.lib,
          EcritureNum: ecritureNumStr,
          EcritureDate: dateStr,
          CompteNum: '411000',
          CompteLib: 'Clients',
          CompAuxNum: compAuxNum,
          CompAuxLib: compAuxLib,
          PieceRef: pieceRef,
          PieceDate: dateStr,
          EcritureLib: ecritureLib,
          Debit: formatAmount(montantTTC),
          Credit: formatAmount(0),
          EcritureLet: '',
          DateLet: '',
          ValidDate: validDate,
          Montantdevise: formatAmount(montantTTC),
          Idevise: 'EUR'
        });
      }

      // === Ligne 2: Compte de charge/produit (HT) ===
      if (isExpense) {
        // ACHAT: 6xxxxx au Débit pour HT
        const accountCode = getExpenseAccountCode(inv.category_slug);
        const accountLib = getExpenseAccountLib(inv.category_slug);
        entries.push({
          JournalCode: journal.code,
          JournalLib: journal.lib,
          EcritureNum: ecritureNumStr,
          EcritureDate: dateStr,
          CompteNum: accountCode,
          CompteLib: accountLib,
          CompAuxNum: '',
          CompAuxLib: '',
          PieceRef: pieceRef,
          PieceDate: dateStr,
          EcritureLib: ecritureLib,
          Debit: formatAmount(montantHT),
          Credit: formatAmount(0),
          EcritureLet: '',
          DateLet: '',
          ValidDate: validDate,
          Montantdevise: formatAmount(montantHT),
          Idevise: 'EUR'
        });
      } else {
        // VENTE: 7xxxxx au Crédit pour HT
        const accountCode = getRevenueAccountCode(inv.category_slug);
        const accountLib = getRevenueAccountLib(inv.category_slug);
        entries.push({
          JournalCode: journal.code,
          JournalLib: journal.lib,
          EcritureNum: ecritureNumStr,
          EcritureDate: dateStr,
          CompteNum: accountCode,
          CompteLib: accountLib,
          CompAuxNum: '',
          CompAuxLib: '',
          PieceRef: pieceRef,
          PieceDate: dateStr,
          EcritureLib: ecritureLib,
          Debit: formatAmount(0),
          Credit: formatAmount(montantHT),
          EcritureLet: '',
          DateLet: '',
          ValidDate: validDate,
          Montantdevise: formatAmount(montantHT),
          Idevise: 'EUR'
        });
      }

      // === Ligne 3: Compte TVA ===
      if (montantTVA > 0) {
        if (isExpense) {
          // ACHAT: 44566x (TVA déductible) au Débit
          const tvaAccount = getTVADeductibleAccount(parseFloat(inv.tva_rate));
          entries.push({
            JournalCode: journal.code,
            JournalLib: journal.lib,
            EcritureNum: ecritureNumStr,
            EcritureDate: dateStr,
            CompteNum: tvaAccount.code,
            CompteLib: tvaAccount.lib,
            CompAuxNum: '',
            CompAuxLib: '',
            PieceRef: pieceRef,
            PieceDate: dateStr,
            EcritureLib: ecritureLib,
            Debit: formatAmount(montantTVA),
            Credit: formatAmount(0),
            EcritureLet: '',
            DateLet: '',
            ValidDate: validDate,
            Montantdevise: formatAmount(montantTVA),
            Idevise: 'EUR'
          });
        } else {
          // VENTE: 44571x (TVA collectée) au Crédit
          const tvaAccount = getTVACollectedAccount(parseFloat(inv.tva_rate));
          entries.push({
            JournalCode: journal.code,
            JournalLib: journal.lib,
            EcritureNum: ecritureNumStr,
            EcritureDate: dateStr,
            CompteNum: tvaAccount.code,
            CompteLib: tvaAccount.lib,
            CompAuxNum: '',
            CompAuxLib: '',
            PieceRef: pieceRef,
            PieceDate: dateStr,
            EcritureLib: ecritureLib,
            Debit: formatAmount(0),
            Credit: formatAmount(montantTVA),
            EcritureLet: '',
            DateLet: '',
            ValidDate: validDate,
            Montantdevise: formatAmount(montantTVA),
            Idevise: 'EUR'
          });
        }
      }

      ecritureNum++;
    }

    // === Écrire le fichier ===
    const now = new Date();
    const dateTag = `${year}1231`; // Date de clôture exercice
    const cleanSiret = siret.replace(/[^0-9]/g, '').padEnd(14, '0');
    const filename = `${cleanSiret}FEC${dateTag}.txt`;

    const exportDir = process.env.EXPORT_DIR || './exports';
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir, { recursive: true });
    }

    const filepath = path.join(exportDir, filename);

    // Construire le contenu tab-separated
    const lines: string[] = [];

    // Ligne d'en-tête
    lines.push(FEC_HEADERS.join('\t'));

    // Lignes d'écritures
    for (const entry of entries) {
      const row = FEC_HEADERS.map(header => entry[header as keyof FECEntry] || '');
      lines.push(row.join('\t'));
    }

    const content = lines.join('\r\n');
    fs.writeFileSync(filepath, '\ufeff' + content, 'utf8'); // BOM UTF-8

    // Enregistrer l'export dans la base
    await pool.query(
      `INSERT INTO accounting_exports (workspace_id, type, format, file_url, filters, status)
       VALUES ($1, 'invoices', 'csv', $2, $3, 'completed')`,
      [workspaceId, filepath, JSON.stringify({ type: 'fec', year })]
    );

    return {
      filename,
      filepath,
      entry_count: entries.length,
      period: {
        year,
        start: `${year}-01-01`,
        end: `${year}-12-31`
      },
      generated_at: now.toISOString()
    };
  } catch (error) {
    throw new Error(`Erreur génération FEC: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
  }
};

// ============================================
// UTILITAIRES DE FORMATAGE
// ============================================

/**
 * Formate une date au format YYYYMMDD (norme FEC)
 */
const formatFECDate = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}${m}${d}`;
};

/**
 * Formate un montant avec virgule comme séparateur décimal (norme FEC française)
 * Les montants sont toujours positifs, signés par leur position Debit/Credit
 */
const formatAmount = (amount: number): string => {
  const abs = Math.abs(amount);
  return abs.toFixed(2).replace('.', ',');
};

/**
 * Pad left avec un caractère
 */
const padLeft = (str: string, length: number, char: string): string => {
  while (str.length < length) {
    str = char + str;
  }
  return str;
};

/**
 * Retourne le compte TVA déductible en fonction du taux
 */
const getTVADeductibleAccount = (rate: number): { code: string; lib: string } => {
  if (rate === 20) return { code: '445661', lib: 'TVA déductible 20%' };
  if (rate === 10) return { code: '445662', lib: 'TVA déductible 10%' };
  if (rate === 5.5) return { code: '445663', lib: 'TVA déductible 5,5%' };
  if (rate === 2.1) return { code: '445664', lib: 'TVA déductible 2,1%' };
  return { code: '445660', lib: `TVA déductible ${rate}%` };
};

/**
 * Retourne le compte TVA collectée en fonction du taux
 */
const getTVACollectedAccount = (rate: number): { code: string; lib: string } => {
  if (rate === 20) return { code: '445711', lib: 'TVA collectée 20%' };
  if (rate === 10) return { code: '445712', lib: 'TVA collectée 10%' };
  if (rate === 5.5) return { code: '445713', lib: 'TVA collectée 5,5%' };
  if (rate === 2.1) return { code: '445714', lib: 'TVA collectée 2,1%' };
  return { code: '445710', lib: `TVA collectée ${rate}%` };
};

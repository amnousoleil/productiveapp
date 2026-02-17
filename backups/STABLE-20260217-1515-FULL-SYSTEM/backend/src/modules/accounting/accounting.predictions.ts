/**
 * Module Comptabilité - Service Prédictions IA
 * @description Prédictions de trésorerie, détection d'anomalies et catégorisation intelligente
 * Utilise GPT-4o-mini pour le rapport coût/efficacité
 */

import { Pool } from 'pg';
import OpenAI from 'openai';
import {
  CashFlowForecast,
  CashFlowPrediction,
  AnomalyDetectionResult,
  Anomaly,
  SmartCategorization,
  AlertSeverity
} from './accounting.types.js';

let pool: Pool;
let openai: OpenAI | null = null;

export const initPredictionsService = (dbPool: Pool, openaiApiKey?: string): void => {
  pool = dbPool;
  if (openaiApiKey) {
    openai = new OpenAI({ apiKey: openaiApiKey });
  }
};

const MODEL = 'gpt-4o-mini';

// ============================================
// PRÉDICTION DE TRÉSORERIE
// ============================================

/**
 * Prédit les flux de trésorerie pour les N prochains mois
 * Utilise les données historiques + OpenAI pour une analyse contextuelle
 */
export const predictCashFlow = async (
  workspaceId: string,
  months: number = 6
): Promise<CashFlowForecast> => {
  try {
    // Récupérer les données historiques (12 derniers mois)
    const historicalResult = await pool.query(
      `SELECT
        EXTRACT(YEAR FROM date_facture)::int as year,
        EXTRACT(MONTH FROM date_facture)::int as month,
        COALESCE(SUM(CASE WHEN type = 'income' THEN montant_ttc ELSE 0 END), 0) as income,
        COALESCE(SUM(CASE WHEN type = 'expense' THEN montant_ttc ELSE 0 END), 0) as expense
       FROM invoices
       WHERE workspace_id = $1
         AND date_facture >= NOW() - INTERVAL '12 months'
         AND status IN ('validated', 'paid')
       GROUP BY EXTRACT(YEAR FROM date_facture), EXTRACT(MONTH FROM date_facture)
       ORDER BY year, month`,
      [workspaceId]
    );

    const historical = historicalResult.rows.map(row => ({
      year: row.year,
      month: row.month,
      income: parseFloat(row.income),
      expense: parseFloat(row.expense)
    }));

    // Récupérer le solde actuel
    const balanceResult = await pool.query(
      `SELECT
        COALESCE(SUM(CASE WHEN type = 'income' AND status = 'paid' THEN montant_ttc ELSE 0 END), 0)
        - COALESCE(SUM(CASE WHEN type = 'expense' AND status = 'paid' THEN montant_ttc ELSE 0 END), 0) as balance
       FROM invoices
       WHERE workspace_id = $1`,
      [workspaceId]
    );

    const currentBalance = parseFloat(balanceResult.rows[0].balance);

    // Factures en attente (non payées)
    const pendingResult = await pool.query(
      `SELECT
        type,
        COALESCE(SUM(montant_ttc), 0) as total,
        COUNT(*) as count
       FROM invoices
       WHERE workspace_id = $1
         AND status IN ('pending', 'validated')
       GROUP BY type`,
      [workspaceId]
    );

    const pendingData: Record<string, { total: number; count: number }> = {};
    for (const row of pendingResult.rows) {
      pendingData[row.type] = {
        total: parseFloat(row.total),
        count: parseInt(row.count, 10)
      };
    }

    // Construire le prompt pour l'IA
    const prompt = buildCashFlowPrompt(historical, currentBalance, pendingData, months);

    let predictions: CashFlowPrediction[];
    let summary: string;
    let riskLevel: 'low' | 'medium' | 'high';

    if (openai) {
      // Utiliser l'IA pour des prédictions contextuelles
      const aiResponse = await openai.chat.completions.create({
        model: MODEL,
        max_tokens: 2000,
        temperature: 0.3,
        messages: [
          {
            role: 'system',
            content: 'Tu es un expert-comptable et analyste financier. Réponds en JSON strict uniquement.'
          },
          { role: 'user', content: prompt }
        ]
      });

      const content = aiResponse.choices[0]?.message?.content || '';
      const parsed = parseAIJsonResponse(content);

      predictions = (parsed.predictions as CashFlowPrediction[]) || [];
      summary = (parsed.summary as string) || 'Analyse non disponible';
      riskLevel = (parsed.risk_level as 'low' | 'medium' | 'high') || 'medium';
    } else {
      // Fallback: prédiction statistique simple (moyenne mobile)
      const result = fallbackPrediction(historical, currentBalance, months);
      predictions = result.predictions;
      summary = result.summary;
      riskLevel = result.riskLevel;
    }

    return {
      workspace_id: workspaceId,
      generated_at: new Date().toISOString(),
      current_balance: currentBalance,
      predictions,
      summary,
      risk_level: riskLevel
    };
  } catch (error) {
    throw new Error(`Erreur prédiction trésorerie: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
  }
};

// ============================================
// DÉTECTION D'ANOMALIES
// ============================================

/**
 * Analyse statistique + IA pour détecter des anomalies dans les données comptables
 * (montants inhabituels, doublons suspects, tendances anormales)
 */
export const detectAnomalies = async (
  workspaceId: string
): Promise<AnomalyDetectionResult> => {
  try {
    const anomalies: Anomaly[] = [];

    // 1. Détecter les montants aberrants (> 3 écarts-types de la moyenne)
    const statsResult = await pool.query(
      `SELECT
        type,
        AVG(montant_ttc) as avg_amount,
        STDDEV(montant_ttc) as stddev_amount,
        COUNT(*) as count
       FROM invoices
       WHERE workspace_id = $1
         AND date_facture >= NOW() - INTERVAL '12 months'
       GROUP BY type`,
      [workspaceId]
    );

    const statsByType: Record<string, { avg: number; stddev: number }> = {};
    for (const row of statsResult.rows) {
      statsByType[row.type] = {
        avg: parseFloat(row.avg_amount) || 0,
        stddev: parseFloat(row.stddev_amount) || 0
      };
    }

    // Trouver les factures hors normes
    const outlierResult = await pool.query(
      `SELECT id, type, fournisseur, montant_ttc, date_facture, reference
       FROM invoices
       WHERE workspace_id = $1
         AND date_facture >= NOW() - INTERVAL '6 months'
       ORDER BY date_facture DESC`,
      [workspaceId]
    );

    for (const inv of outlierResult.rows) {
      const stats = statsByType[inv.type];
      if (!stats || stats.stddev === 0) continue;

      const amount = parseFloat(inv.montant_ttc);
      const deviation = Math.abs(amount - stats.avg) / stats.stddev;

      if (deviation > 3) {
        anomalies.push({
          type: 'montant_aberrant',
          severity: deviation > 5 ? 'critical' : 'warning',
          description: `Montant inhabituel: ${inv.fournisseur} - ${amount.toFixed(2)} EUR (${deviation.toFixed(1)}x l'écart-type)`,
          entity_id: inv.id,
          entity_type: 'invoice',
          expected_value: stats.avg,
          actual_value: amount,
          deviation_pct: ((amount - stats.avg) / stats.avg) * 100,
          recommendation: `Vérifier la facture ${inv.reference || inv.id.substring(0, 8)} de ${inv.fournisseur}. Le montant dévie significativement de la moyenne (${stats.avg.toFixed(2)} EUR).`
        });
      }
    }

    // 2. Détecter les doublons potentiels (même fournisseur + montant + date ±3j)
    const duplicateResult = await pool.query(
      `SELECT a.id as id_a, b.id as id_b,
              a.fournisseur, a.montant_ttc, a.date_facture,
              b.date_facture as date_b, a.reference as ref_a, b.reference as ref_b
       FROM invoices a
       JOIN invoices b ON a.workspace_id = b.workspace_id
         AND a.id < b.id
         AND a.fournisseur = b.fournisseur
         AND a.montant_ttc = b.montant_ttc
         AND ABS(EXTRACT(EPOCH FROM a.date_facture - b.date_facture)) < 259200
       WHERE a.workspace_id = $1
         AND a.date_facture >= NOW() - INTERVAL '6 months'`,
      [workspaceId]
    );

    for (const dup of duplicateResult.rows) {
      anomalies.push({
        type: 'doublon_suspect',
        severity: 'warning' as AlertSeverity,
        description: `Doublon potentiel: ${dup.fournisseur} - ${parseFloat(dup.montant_ttc).toFixed(2)} EUR le ${new Date(dup.date_facture).toLocaleDateString('fr-FR')} et ${new Date(dup.date_b).toLocaleDateString('fr-FR')}`,
        entity_id: dup.id_a,
        entity_type: 'invoice',
        expected_value: null,
        actual_value: parseFloat(dup.montant_ttc),
        deviation_pct: null,
        recommendation: `Vérifier les factures ${dup.ref_a || dup.id_a.substring(0, 8)} et ${dup.ref_b || dup.id_b.substring(0, 8)} de ${dup.fournisseur} pour un éventuel doublon.`
      });
    }

    // 3. Tendance mensuelle anormale (variation > 50% vs mois précédent)
    const trendResult = await pool.query(
      `SELECT
        EXTRACT(YEAR FROM date_facture)::int as year,
        EXTRACT(MONTH FROM date_facture)::int as month,
        SUM(CASE WHEN type = 'expense' THEN montant_ttc ELSE 0 END) as expense
       FROM invoices
       WHERE workspace_id = $1
         AND date_facture >= NOW() - INTERVAL '6 months'
       GROUP BY EXTRACT(YEAR FROM date_facture), EXTRACT(MONTH FROM date_facture)
       ORDER BY year, month`,
      [workspaceId]
    );

    const trendRows = trendResult.rows;
    for (let i = 1; i < trendRows.length; i++) {
      const prev = parseFloat(trendRows[i - 1].expense);
      const curr = parseFloat(trendRows[i].expense);

      if (prev > 0 && Math.abs(curr - prev) / prev > 0.5) {
        const variation = ((curr - prev) / prev) * 100;
        anomalies.push({
          type: 'variation_tendance',
          severity: Math.abs(variation) > 100 ? 'warning' : 'info',
          description: `Variation importante des dépenses: ${variation > 0 ? '+' : ''}${variation.toFixed(1)}% entre ${trendRows[i - 1].month}/${trendRows[i - 1].year} et ${trendRows[i].month}/${trendRows[i].year}`,
          entity_id: null,
          entity_type: 'trend',
          expected_value: prev,
          actual_value: curr,
          deviation_pct: variation,
          recommendation: `Les dépenses ont ${variation > 0 ? 'augmenté' : 'diminué'} de ${Math.abs(variation).toFixed(1)}%. Analyser les postes de dépenses pour comprendre cette variation.`
        });
      }
    }

    // 4. Enrichissement IA si disponible
    let aiSummary = `${anomalies.length} anomalie(s) détectée(s) par analyse statistique.`;

    if (openai && anomalies.length > 0) {
      try {
        const aiResponse = await openai.chat.completions.create({
          model: MODEL,
          max_tokens: 500,
          temperature: 0.3,
          messages: [
            {
              role: 'system',
              content: 'Tu es un expert-comptable. Résume les anomalies détectées en 2-3 phrases claires et actionables. Réponds en français.'
            },
            {
              role: 'user',
              content: `Voici les anomalies détectées dans les comptes:\n${JSON.stringify(anomalies.map(a => ({ type: a.type, description: a.description, severity: a.severity })), null, 2)}\n\nRésume et donne des recommandations prioritaires.`
            }
          ]
        });

        aiSummary = aiResponse.choices[0]?.message?.content || aiSummary;
      } catch {
        // Garder le résumé par défaut si l'IA échoue
      }
    }

    return {
      workspace_id: workspaceId,
      generated_at: new Date().toISOString(),
      anomalies,
      summary: aiSummary
    };
  } catch (error) {
    throw new Error(`Erreur détection anomalies: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
  }
};

// ============================================
// CATÉGORISATION INTELLIGENTE
// ============================================

/**
 * Suggère une catégorie comptable pour une dépense/revenu
 * Utilise l'IA pour analyser la description et le montant
 */
export const smartCategorize = async (
  description: string,
  amount: number,
  categories: Array<{ id: string; name: string; slug: string; type: string }>
): Promise<SmartCategorization> => {
  try {
    if (!openai) {
      // Fallback: catégorisation par mots-clés
      return keywordCategorize(description, amount, categories);
    }

    const categoryList = categories.map(c => `- ${c.slug}: ${c.name} (${c.type})`).join('\n');

    const response = await openai.chat.completions.create({
      model: MODEL,
      max_tokens: 300,
      temperature: 0.2,
      messages: [
        {
          role: 'system',
          content: 'Tu es un expert-comptable. Catégorise les dépenses/revenus. Réponds en JSON strict uniquement.'
        },
        {
          role: 'user',
          content: `Catégorise cette opération:
Description: "${description}"
Montant: ${amount.toFixed(2)} EUR

Catégories disponibles:
${categoryList}

Réponds au format JSON:
{
  "suggested_category": "slug de la catégorie la plus appropriée",
  "confidence": nombre entre 0 et 100,
  "reasoning": "explication courte",
  "alternatives": [{"category": "slug", "confidence": nombre}]
}`
        }
      ]
    });

    const content = response.choices[0]?.message?.content || '';
    const parsed = parseAIJsonResponse(content);

    return {
      suggested_category: (parsed.suggested_category as string) || categories[0]?.slug || 'autres-depenses',
      confidence: (parsed.confidence as number) || 50,
      reasoning: (parsed.reasoning as string) || 'Catégorisation par IA',
      alternatives: (parsed.alternatives as Array<{ category: string; confidence: number }>) || []
    };
  } catch (error) {
    // Fallback en cas d'erreur IA
    return keywordCategorize(description, amount, categories);
  }
};

// ============================================
// UTILITAIRES INTERNES
// ============================================

/**
 * Construit le prompt pour la prédiction de trésorerie
 */
const buildCashFlowPrompt = (
  historical: Array<{ year: number; month: number; income: number; expense: number }>,
  currentBalance: number,
  pending: Record<string, { total: number; count: number }>,
  months: number
): string => {
  const histStr = historical.map(h =>
    `${h.month}/${h.year}: revenus=${h.income.toFixed(2)}, dépenses=${h.expense.toFixed(2)}, solde=${(h.income - h.expense).toFixed(2)}`
  ).join('\n');

  const pendingIncome = pending['income']?.total || 0;
  const pendingExpense = pending['expense']?.total || 0;

  return `Analyse ces données financières et prédit les ${months} prochains mois.

Données historiques (12 derniers mois):
${histStr}

Situation actuelle:
- Solde: ${currentBalance.toFixed(2)} EUR
- Factures à recevoir (revenus en attente): ${pendingIncome.toFixed(2)} EUR (${pending['income']?.count || 0} factures)
- Factures à payer (dépenses en attente): ${pendingExpense.toFixed(2)} EUR (${pending['expense']?.count || 0} factures)

Réponds en JSON strict:
{
  "predictions": [
    {
      "month": "YYYY-MM",
      "predicted_income": nombre,
      "predicted_expense": nombre,
      "predicted_balance": nombre (solde cumulé),
      "confidence": nombre (0-100),
      "factors": ["facteur1", "facteur2"]
    }
  ],
  "summary": "résumé en 2-3 phrases",
  "risk_level": "low|medium|high"
}`;
};

/**
 * Prédiction de fallback par moyenne mobile si l'IA n'est pas disponible
 */
const fallbackPrediction = (
  historical: Array<{ year: number; month: number; income: number; expense: number }>,
  currentBalance: number,
  months: number
): { predictions: CashFlowPrediction[]; summary: string; riskLevel: 'low' | 'medium' | 'high' } => {
  const predictions: CashFlowPrediction[] = [];

  // Calculer la moyenne des 3 derniers mois disponibles
  const recent = historical.slice(-3);
  const avgIncome = recent.length > 0
    ? recent.reduce((sum, h) => sum + h.income, 0) / recent.length
    : 0;
  const avgExpense = recent.length > 0
    ? recent.reduce((sum, h) => sum + h.expense, 0) / recent.length
    : 0;

  let cumulativeBalance = currentBalance;
  const now = new Date();

  for (let i = 1; i <= months; i++) {
    const futureDate = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const monthStr = `${futureDate.getFullYear()}-${String(futureDate.getMonth() + 1).padStart(2, '0')}`;

    // Appliquer une légère variation saisonnière (±5%)
    const seasonalFactor = 1 + (Math.sin((futureDate.getMonth() / 12) * 2 * Math.PI) * 0.05);
    const predictedIncome = Math.round(avgIncome * seasonalFactor * 100) / 100;
    const predictedExpense = Math.round(avgExpense * seasonalFactor * 100) / 100;

    cumulativeBalance += predictedIncome - predictedExpense;

    predictions.push({
      month: monthStr,
      predicted_income: predictedIncome,
      predicted_expense: predictedExpense,
      predicted_balance: Math.round(cumulativeBalance * 100) / 100,
      confidence: Math.max(30, 80 - (i * 8)), // Confiance décroissante
      factors: ['moyenne_mobile_3_mois', 'ajustement_saisonnier']
    });
  }

  // Déterminer le niveau de risque
  const lastPrediction = predictions[predictions.length - 1];
  let riskLevel: 'low' | 'medium' | 'high' = 'low';
  if (lastPrediction) {
    if (lastPrediction.predicted_balance < 0) riskLevel = 'high';
    else if (lastPrediction.predicted_balance < currentBalance * 0.3) riskLevel = 'medium';
  }

  const summary = `Prédiction basée sur la moyenne mobile des 3 derniers mois. ` +
    `Revenu mensuel moyen: ${avgIncome.toFixed(2)} EUR, dépenses moyennes: ${avgExpense.toFixed(2)} EUR. ` +
    `Solde prévu à ${months} mois: ${lastPrediction?.predicted_balance.toFixed(2) || '0.00'} EUR.`;

  return { predictions, summary, riskLevel };
};

/**
 * Catégorisation par mots-clés si l'IA n'est pas disponible
 */
const keywordCategorize = (
  description: string,
  _amount: number,
  categories: Array<{ id: string; name: string; slug: string; type: string }>
): SmartCategorization => {
  const desc = description.toLowerCase();

  const keywordMap: Record<string, string[]> = {
    'fournitures-bureau': ['bureau', 'papier', 'stylo', 'cartouche', 'imprimante', 'fourniture'],
    'logiciels': ['saas', 'licence', 'abonnement', 'software', 'logiciel', 'app', 'cloud'],
    'hebergement': ['hébergement', 'hebergement', 'serveur', 'hosting', 'aws', 'ovh', 'gcp'],
    'repas': ['restaurant', 'repas', 'déjeuner', 'dîner', 'café', 'traiteur'],
    'transport': ['transport', 'sncf', 'train', 'avion', 'taxi', 'uber', 'essence', 'péage'],
    'telecom': ['téléphone', 'internet', 'mobile', 'sfr', 'orange', 'free', 'bouygues'],
    'honoraires': ['honoraires', 'avocat', 'comptable', 'consultant', 'conseil', 'prestation'],
    'assurances': ['assurance', 'mutuelle', 'prévoyance'],
    'frais-bancaires': ['banque', 'bancaire', 'commission', 'agios'],
    'marketing': ['publicité', 'marketing', 'google ads', 'facebook', 'campagne', 'flyer'],
    'formation': ['formation', 'cours', 'séminaire', 'conférence', 'workshop']
  };

  let bestSlug = 'autres-depenses';
  let bestScore = 0;

  for (const [slug, keywords] of Object.entries(keywordMap)) {
    let score = 0;
    for (const keyword of keywords) {
      if (desc.includes(keyword)) {
        score += 10;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestSlug = slug;
    }
  }

  const matchedCategory = categories.find(c => c.slug === bestSlug);
  const confidence = bestScore > 0 ? Math.min(bestScore * 5, 80) : 20;

  return {
    suggested_category: matchedCategory?.slug || bestSlug,
    confidence,
    reasoning: bestScore > 0
      ? `Catégorisation par mots-clés dans la description`
      : `Catégorie par défaut (aucun mot-clé reconnu)`,
    alternatives: categories
      .filter(c => c.slug !== bestSlug && c.type === 'expense')
      .slice(0, 3)
      .map(c => ({ category: c.slug, confidence: 10 }))
  };
};

/**
 * Parse une réponse JSON de l'IA en gérant les erreurs
 */
const parseAIJsonResponse = (content: string): Record<string, unknown> => {
  try {
    let cleanContent = content.trim();
    // Retirer les éventuels markdown code blocks
    if (cleanContent.startsWith('```')) {
      cleanContent = cleanContent.replace(/```json?\n?/g, '').replace(/```$/g, '').trim();
    }
    return JSON.parse(cleanContent);
  } catch {
    return {};
  }
};

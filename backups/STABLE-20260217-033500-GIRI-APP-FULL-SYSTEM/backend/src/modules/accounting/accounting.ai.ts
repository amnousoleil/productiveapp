/**
 * Module Comptabilité - Service IA
 * @description Extraction automatique de factures via GPT-4 Vision
 */

import OpenAI from 'openai';
import * as fs from 'fs';
import * as path from 'path';
import { AIExtractionResult } from './accounting.types.js';

let openai: OpenAI;

export const initAIService = (apiKey: string): void => {
  openai = new OpenAI({ apiKey });
};

const EXTRACTION_PROMPT = `Analyse cette image de facture et extrait les informations suivantes au format JSON strict:
{
  "fournisseur": "nom du fournisseur/vendeur",
  "reference": "numéro de facture",
  "date_facture": "YYYY-MM-DD",
  "date_echeance": "YYYY-MM-DD ou null",
  "montant_ht": nombre (montant hors taxes),
  "montant_tva": nombre (montant TVA),
  "montant_ttc": nombre (montant TTC),
  "tva_rate": nombre (taux TVA principal en %),
  "category_slug": "slug de catégorie suggérée",
  "line_items": [
    {
      "description": "description du produit/service",
      "quantity": nombre,
      "unit_price": nombre,
      "tva_rate": nombre
    }
  ]
}

Catégories disponibles (expense): fournitures-bureau, logiciels, hebergement, repas, transport, telecom, honoraires, assurances, impots, frais-bancaires, marketing, formation, autres-depenses
Catégories disponibles (income): prestations-clients, ventes-produits, abonnements-recus, autres-revenus

Réponds UNIQUEMENT avec le JSON, sans markdown ni texte additionnel.
Si une information n'est pas trouvée, utilise null pour les strings et 0 pour les nombres.`;

export const extractInvoiceFromImage = async (
  imagePath: string
): Promise<AIExtractionResult> => {
  try {
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');
    const ext = path.extname(imagePath).toLowerCase();
    const mimeType = ext === '.png' ? 'image/png' :
                     ext === '.webp' ? 'image/webp' : 'image/jpeg';

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: EXTRACTION_PROMPT },
            {
              type: 'image_url',
              image_url: {
                url: `data:${mimeType};base64,${base64Image}`,
                detail: 'high'
              }
            }
          ]
        }
      ]
    });

    const content = response.choices[0]?.message?.content || '';
    return parseAIResponse(content);
  } catch (error) {
    return {
      success: false,
      confidence: 0,
      data: {
        fournisseur: null, reference: null, date_facture: null, date_echeance: null,
        montant_ht: null, montant_tva: null, montant_ttc: null, tva_rate: null,
        category_slug: null, line_items: []
      },
      raw_text: '',
      errors: [error instanceof Error ? error.message : 'Erreur extraction IA']
    };
  }
};

export const extractInvoiceFromUrl = async (
  imageUrl: string
): Promise<AIExtractionResult> => {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: EXTRACTION_PROMPT },
            { type: 'image_url', image_url: { url: imageUrl, detail: 'high' } }
          ]
        }
      ]
    });

    const content = response.choices[0]?.message?.content || '';
    return parseAIResponse(content);
  } catch (error) {
    return {
      success: false,
      confidence: 0,
      data: {
        fournisseur: null, reference: null, date_facture: null, date_echeance: null,
        montant_ht: null, montant_tva: null, montant_ttc: null, tva_rate: null,
        category_slug: null, line_items: []
      },
      raw_text: '',
      errors: [error instanceof Error ? error.message : 'Erreur extraction IA']
    };
  }
};

const parseAIResponse = (content: string): AIExtractionResult => {
  const errors: string[] = [];

  try {
    // Nettoyer le contenu (enlever markdown si présent)
    let cleanContent = content.trim();
    if (cleanContent.startsWith('```')) {
      cleanContent = cleanContent.replace(/```json?\n?/g, '').replace(/```$/g, '').trim();
    }

    const parsed = JSON.parse(cleanContent);

    // Calculer le score de confiance
    const confidence = calculateConfidence(parsed);

    return {
      success: true,
      confidence,
      data: {
        fournisseur: parsed.fournisseur || null,
        reference: parsed.reference || null,
        date_facture: parsed.date_facture || null,
        date_echeance: parsed.date_echeance || null,
        montant_ht: parseFloat(parsed.montant_ht) || null,
        montant_tva: parseFloat(parsed.montant_tva) || null,
        montant_ttc: parseFloat(parsed.montant_ttc) || null,
        tva_rate: parseFloat(parsed.tva_rate) || null,
        category_slug: parsed.category_slug || null,
        line_items: Array.isArray(parsed.line_items) ? parsed.line_items.map((item: {
          description?: string;
          quantity?: number;
          unit_price?: number;
          tva_rate?: number;
        }) => ({
          description: item.description || '',
          quantity: parseFloat(String(item.quantity)) || 1,
          unit_price: parseFloat(String(item.unit_price)) || 0,
          tva_rate: parseFloat(String(item.tva_rate)) || 20
        })) : []
      },
      raw_text: content,
      errors
    };
  } catch {
    errors.push('Impossible de parser la réponse IA');
    return {
      success: false,
      confidence: 0,
      data: {
        fournisseur: null, reference: null, date_facture: null, date_echeance: null,
        montant_ht: null, montant_tva: null, montant_ttc: null, tva_rate: null,
        category_slug: null, line_items: []
      },
      raw_text: content,
      errors
    };
  }
};

const calculateConfidence = (data: Record<string, unknown>): number => {
  let score = 0;
  const weights: Record<string, number> = {
    fournisseur: 15,
    montant_ttc: 20,
    montant_ht: 15,
    montant_tva: 10,
    date_facture: 15,
    reference: 10,
    tva_rate: 5,
    category_slug: 5,
    line_items: 5
  };

  for (const [field, weight] of Object.entries(weights)) {
    const value = data[field];
    if (value !== null && value !== undefined && value !== '' && value !== 0) {
      if (field === 'line_items' && Array.isArray(value) && value.length > 0) {
        score += weight;
      } else if (field !== 'line_items') {
        score += weight;
      }
    }
  }

  return Math.min(score, 100);
};

export const reprocessInvoice = async (
  imageUrl: string
): Promise<AIExtractionResult> => {
  return extractInvoiceFromUrl(imageUrl);
};

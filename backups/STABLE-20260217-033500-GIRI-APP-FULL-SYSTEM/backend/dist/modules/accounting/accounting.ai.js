"use strict";
/**
 * Module Comptabilité - Service IA
 * @description Extraction automatique de factures via GPT-4 Vision
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.reprocessInvoice = exports.extractInvoiceFromUrl = exports.extractInvoiceFromImage = exports.initAIService = void 0;
const openai_1 = __importDefault(require("openai"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
let openai;
const initAIService = (apiKey) => {
    openai = new openai_1.default({ apiKey });
};
exports.initAIService = initAIService;
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
const extractInvoiceFromImage = async (imagePath) => {
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
    }
    catch (error) {
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
exports.extractInvoiceFromImage = extractInvoiceFromImage;
const extractInvoiceFromUrl = async (imageUrl) => {
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
    }
    catch (error) {
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
exports.extractInvoiceFromUrl = extractInvoiceFromUrl;
const parseAIResponse = (content) => {
    const errors = [];
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
                line_items: Array.isArray(parsed.line_items) ? parsed.line_items.map((item) => ({
                    description: item.description || '',
                    quantity: parseFloat(String(item.quantity)) || 1,
                    unit_price: parseFloat(String(item.unit_price)) || 0,
                    tva_rate: parseFloat(String(item.tva_rate)) || 20
                })) : []
            },
            raw_text: content,
            errors
        };
    }
    catch {
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
const calculateConfidence = (data) => {
    let score = 0;
    const weights = {
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
            }
            else if (field !== 'line_items') {
                score += weight;
            }
        }
    }
    return Math.min(score, 100);
};
const reprocessInvoice = async (imageUrl) => {
    return (0, exports.extractInvoiceFromUrl)(imageUrl);
};
exports.reprocessInvoice = reprocessInvoice;
//# sourceMappingURL=accounting.ai.js.map
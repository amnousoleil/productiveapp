"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.autoCalculateFromInvoices = exports.getAnnualSummary = exports.updateDeclaration = exports.createDeclaration = exports.getDeclarations = exports.simulateCotisations = exports.initURSSAFService = void 0;
let pool;
const initURSSAFService = (p) => { pool = p; };
exports.initURSSAFService = initURSSAFService;
// Taux URSSAF micro-entrepreneur 2026 (approximatifs)
const RATES = {
    'BIC_vente': { base: 12.3, formation: 0.1, cfe: 0.015 }, // Vente de marchandises
    'BIC_service': { base: 21.2, formation: 0.2, cfe: 0.044 }, // Prestations BIC
    'BNC': { base: 21.1, formation: 0.2, cfe: 0.034 }, // Prestations BNC
    'liberal_cipav': { base: 21.2, formation: 0.2, cfe: 0.034 }, // Professions liberales CIPAV
};
const simulateCotisations = async (_wid, params) => {
    const rates = RATES[params.activity_type] || RATES['BNC'];
    const ca = params.ca;
    const acreDiscount = params.acre ? 0.5 : 1; // ACRE = 50% reduction premiere annee
    const baseCotisation = Math.round(ca * (rates.base / 100) * acreDiscount * 100) / 100;
    const formation = Math.round(ca * (rates.formation / 100) * 100) / 100;
    const cfe = Math.round(ca * (rates.cfe / 100) * 100) / 100;
    const total = Math.round((baseCotisation + formation + cfe) * 100) / 100;
    const net = Math.round((ca - total) * 100) / 100;
    return {
        chiffre_affaires: ca, activity_type: params.activity_type, acre: params.acre || false,
        cotisations: { base: baseCotisation, formation, cfe, total },
        net_after_cotisations: net,
        taux_effectif: ca > 0 ? Math.round((total / ca) * 10000) / 100 : 0,
        quarter: params.quarter, year: params.year
    };
};
exports.simulateCotisations = simulateCotisations;
const getDeclarations = async (wid) => {
    return (await pool.query('SELECT * FROM fiscal_declarations WHERE workspace_id=$1 ORDER BY year DESC, quarter DESC', [wid])).rows;
};
exports.getDeclarations = getDeclarations;
const createDeclaration = async (wid, mid, data) => {
    const sim = await (0, exports.simulateCotisations)(wid, { ca: data.chiffre_affaires, activity_type: data.activity_type, acre: data.acre, quarter: data.quarter, year: data.year });
    return (await pool.query(`INSERT INTO fiscal_declarations (workspace_id, member_id, quarter, year, activity_type, chiffre_affaires, cotisations_amount, net_amount, status)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'draft')
     ON CONFLICT (workspace_id, quarter, year) DO UPDATE SET chiffre_affaires=EXCLUDED.chiffre_affaires, cotisations_amount=EXCLUDED.cotisations_amount, net_amount=EXCLUDED.net_amount, activity_type=EXCLUDED.activity_type, updated_at=NOW()
     RETURNING *`, [wid, mid, data.quarter, data.year, data.activity_type, data.chiffre_affaires, sim.cotisations.total, sim.net_after_cotisations])).rows[0];
};
exports.createDeclaration = createDeclaration;
const updateDeclaration = async (wid, id, data) => {
    const fields = [];
    const vals = [];
    let pi = 1;
    if (data.status) {
        fields.push(`status=$${pi++}`);
        vals.push(data.status);
    }
    if (data.notes !== undefined) {
        fields.push(`notes=$${pi++}`);
        vals.push(data.notes);
    }
    if (data.status === 'submitted') {
        fields.push(`submitted_at=$${pi++}`);
        vals.push(new Date().toISOString());
    }
    if (!fields.length)
        return (await pool.query('SELECT * FROM fiscal_declarations WHERE id=$1 AND workspace_id=$2', [id, wid])).rows[0];
    vals.push(id, wid);
    return (await pool.query(`UPDATE fiscal_declarations SET ${fields.join(', ')}, updated_at=NOW() WHERE id=$${pi++} AND workspace_id=$${pi} RETURNING *`, vals)).rows[0] || null;
};
exports.updateDeclaration = updateDeclaration;
const getAnnualSummary = async (wid, year) => {
    const decls = (await pool.query('SELECT * FROM fiscal_declarations WHERE workspace_id=$1 AND year=$2 ORDER BY quarter', [wid, year])).rows;
    const totalCA = decls.reduce((s, d) => s + parseFloat(d.chiffre_affaires || 0), 0);
    const totalCot = decls.reduce((s, d) => s + parseFloat(d.cotisations_amount || 0), 0);
    const totalNet = decls.reduce((s, d) => s + parseFloat(d.net_amount || 0), 0);
    // Plafonds micro-entrepreneur 2026
    const plafondBNC = 77700;
    const plafondBIC = 188700;
    const activityType = decls[0]?.activity_type || 'BNC';
    const plafond = activityType.startsWith('BIC_vente') ? plafondBIC : plafondBNC;
    return {
        year, declarations: decls, quarters_declared: decls.length,
        total_ca: totalCA, total_cotisations: totalCot, total_net: totalNet,
        plafond, plafond_utilise: plafond > 0 ? Math.round((totalCA / plafond) * 10000) / 100 : 0,
        alert: totalCA > plafond * 0.9 ? 'Attention: vous approchez du plafond micro-entrepreneur!' : null
    };
};
exports.getAnnualSummary = getAnnualSummary;
const autoCalculateFromInvoices = async (wid, quarter, year) => {
    const startMonth = (quarter - 1) * 3 + 1;
    const endMonth = startMonth + 2;
    const startDate = `${year}-${String(startMonth).padStart(2, '0')}-01`;
    const endDate = `${year}-${String(endMonth).padStart(2, '0')}-${endMonth === 2 ? 28 : [4, 6, 9, 11].includes(endMonth) ? 30 : 31}`;
    const r = await pool.query(`SELECT COALESCE(SUM(montant_ttc), 0) AS total FROM invoices WHERE workspace_id=$1 AND type='income' AND status='paid' AND date_facture >= $2 AND date_facture <= $3`, [wid, startDate, endDate]);
    return { quarter, year, chiffre_affaires: parseFloat(r.rows[0].total), start_date: startDate, end_date: endDate };
};
exports.autoCalculateFromInvoices = autoCalculateFromInvoices;
//# sourceMappingURL=urssaf.service.js.map
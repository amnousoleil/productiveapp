"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.signContract = exports.sendForSignature = exports.deleteContract = exports.updateContract = exports.getContract = exports.createContract = exports.listContracts = exports.deleteTemplate = exports.updateTemplate = exports.createTemplate = exports.listTemplates = exports.initContractsService = void 0;
let pool;
const initContractsService = (p) => { pool = p; };
exports.initContractsService = initContractsService;
const listTemplates = async (wid) => {
    return (await pool.query('SELECT * FROM contract_templates WHERE workspace_id = $1 ORDER BY name', [wid])).rows;
};
exports.listTemplates = listTemplates;
const createTemplate = async (wid, data) => {
    return (await pool.query(`INSERT INTO contract_templates (workspace_id, name, content, category, variables) VALUES ($1,$2,$3,$4,$5::jsonb) RETURNING *`, [wid, data.name, data.content, data.category || 'general', JSON.stringify(data.variables || {})])).rows[0];
};
exports.createTemplate = createTemplate;
const updateTemplate = async (wid, id, data) => {
    const fields = [];
    const vals = [];
    let pi = 1;
    for (const f of ['name', 'content', 'category']) {
        if (data[f] !== undefined) {
            fields.push(`${f} = $${pi++}`);
            vals.push(data[f]);
        }
    }
    if (data.variables !== undefined) {
        fields.push(`variables = $${pi++}::jsonb`);
        vals.push(JSON.stringify(data.variables));
    }
    if (!fields.length)
        return (await pool.query('SELECT * FROM contract_templates WHERE id=$1 AND workspace_id=$2', [id, wid])).rows[0];
    vals.push(id, wid);
    return (await pool.query(`UPDATE contract_templates SET ${fields.join(', ')}, updated_at=NOW() WHERE id=$${pi++} AND workspace_id=$${pi} RETURNING *`, vals)).rows[0] || null;
};
exports.updateTemplate = updateTemplate;
const deleteTemplate = async (wid, id) => {
    return ((await pool.query('DELETE FROM contract_templates WHERE id=$1 AND workspace_id=$2', [id, wid])).rowCount ?? 0) > 0;
};
exports.deleteTemplate = deleteTemplate;
const listContracts = async (wid, filters) => {
    const page = filters.page || 1, limit = Math.min(filters.limit || 20, 100), offset = (page - 1) * limit;
    let wc = 'WHERE c.workspace_id = $1';
    const p = [wid];
    let pi = 2;
    if (filters.status) {
        wc += ` AND c.status = $${pi++}`;
        p.push(filters.status);
    }
    if (filters.contactId) {
        wc += ` AND c.contact_id = $${pi++}`;
        p.push(filters.contactId);
    }
    const cnt = parseInt((await pool.query(`SELECT COUNT(*) FROM contracts c ${wc}`, p)).rows[0].count, 10);
    p.push(limit, offset);
    const r = await pool.query(`SELECT c.*, ct.name AS contact_name FROM contracts c LEFT JOIN contacts ct ON c.contact_id = ct.id ${wc} ORDER BY c.created_at DESC LIMIT $${pi++} OFFSET $${pi}`, p);
    return { data: r.rows, pagination: { page, limit, total: cnt, total_pages: Math.ceil(cnt / limit) } };
};
exports.listContracts = listContracts;
const createContract = async (wid, data) => {
    return (await pool.query(`INSERT INTO contracts (workspace_id, template_id, contact_id, title, content, start_date, end_date, value, currency, status)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'draft') RETURNING *`, [wid, data.template_id || null, data.contact_id || null, data.title, data.content, data.start_date || null, data.end_date || null, data.value ?? 0, data.currency || 'EUR'])).rows[0];
};
exports.createContract = createContract;
const getContract = async (wid, id) => {
    const r = await pool.query(`SELECT c.*, ct.name AS contact_name, ct.email AS contact_email FROM contracts c LEFT JOIN contacts ct ON c.contact_id = ct.id WHERE c.id=$1 AND c.workspace_id=$2`, [id, wid]);
    if (!r.rows[0])
        return null;
    const sigs = await pool.query('SELECT * FROM signature_requests WHERE contract_id = $1 ORDER BY created_at', [id]);
    return { ...r.rows[0], signatures: sigs.rows };
};
exports.getContract = getContract;
const updateContract = async (wid, id, data) => {
    const allowed = ['title', 'content', 'start_date', 'end_date', 'value', 'currency', 'status'];
    const fields = [];
    const vals = [];
    let pi = 1;
    for (const f of allowed) {
        if (data[f] !== undefined) {
            fields.push(`${f} = $${pi++}`);
            vals.push(data[f]);
        }
    }
    if (!fields.length)
        return (0, exports.getContract)(wid, id);
    vals.push(id, wid);
    return (await pool.query(`UPDATE contracts SET ${fields.join(', ')}, updated_at=NOW() WHERE id=$${pi++} AND workspace_id=$${pi} RETURNING *`, vals)).rows[0] || null;
};
exports.updateContract = updateContract;
const deleteContract = async (wid, id) => {
    return ((await pool.query('DELETE FROM contracts WHERE id=$1 AND workspace_id=$2 AND status = \'draft\'', [id, wid])).rowCount ?? 0) > 0;
};
exports.deleteContract = deleteContract;
const sendForSignature = async (wid, id, signerEmail, signerName) => {
    const contract = await pool.query('SELECT * FROM contracts WHERE id=$1 AND workspace_id=$2', [id, wid]);
    if (!contract.rows[0])
        throw new Error('Contrat non trouve');
    const token = require('crypto').randomBytes(32).toString('hex');
    const expires = new Date();
    expires.setDate(expires.getDate() + 30);
    const sig = await pool.query(`INSERT INTO signature_requests (workspace_id, contract_id, signer_email, signer_name, token, expires_at) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`, [wid, id, signerEmail, signerName, token, expires]);
    await pool.query(`UPDATE contracts SET status='sent', updated_at=NOW() WHERE id=$1`, [id]);
    return sig.rows[0];
};
exports.sendForSignature = sendForSignature;
const signContract = async (token) => {
    const sig = await pool.query('SELECT * FROM signature_requests WHERE token=$1 AND status=\'pending\'', [token]);
    if (!sig.rows[0])
        throw new Error('Lien de signature invalide ou expire');
    if (new Date(sig.rows[0].expires_at) < new Date())
        throw new Error('Lien expire');
    await pool.query(`UPDATE signature_requests SET status='signed', signed_at=NOW(), updated_at=NOW() WHERE id=$1`, [sig.rows[0].id]);
    const allSigs = await pool.query('SELECT * FROM signature_requests WHERE contract_id=$1', [sig.rows[0].contract_id]);
    const allSigned = allSigs.rows.every(s => s.status === 'signed' || s.id === sig.rows[0].id);
    if (allSigned) {
        await pool.query(`UPDATE contracts SET status='signed', signed_at=NOW(), updated_at=NOW() WHERE id=$1`, [sig.rows[0].contract_id]);
    }
    return { signed: true, all_signed: allSigned };
};
exports.signContract = signContract;
//# sourceMappingURL=contracts.service.js.map
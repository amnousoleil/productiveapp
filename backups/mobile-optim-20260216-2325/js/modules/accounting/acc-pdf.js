/**
 * ================================================
 * ACC-PDF - Generation PDF Factures/Devis/Avoirs
 * Utilise jsPDF v2.5.1 (window.jspdf.jsPDF)
 * ProductiveApp v5.0
 * ================================================
 */
const AccPDF = (function() {
    'use strict';

    function fmt(n) {
        return Number(n || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    function fmtEur(n) { return fmt(n) + ' \u20ac'; }

    function fmtDate(d) {
        if (!d) return '';
        return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }

    function getAccent() {
        return getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#d4af37';
    }

    function hexToRgb(hex) {
        hex = hex.replace('#', '');
        if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
        return [parseInt(hex.substr(0, 2), 16), parseInt(hex.substr(2, 2), 16), parseInt(hex.substr(4, 2), 16)];
    }

    function createDoc() {
        const jsPDF = window.jspdf?.jsPDF;
        if (!jsPDF) { console.error('[AccPDF] jsPDF non disponible'); return null; }
        return new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    }

    // ============================================
    // HEADER
    // ============================================
    function drawHeader(doc, title, settings, color) {
        const rgb = hexToRgb(color);
        doc.setFillColor(rgb[0], rgb[1], rgb[2]);
        doc.rect(0, 0, 210, 4, 'F');

        // Badge
        doc.setFillColor(rgb[0], rgb[1], rgb[2]);
        doc.roundedRect(140, 10, 55, 12, 3, 3, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(title, 167.5, 18, { align: 'center' });

        // Company
        doc.setTextColor(40, 40, 40);
        doc.setFontSize(16);
        doc.text(settings?.company || 'Mon Entreprise', 15, 18);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 100, 100);
        let y = 24;
        if (settings?.address) { doc.text(settings.address, 15, y); y += 4; }
        if (settings?.email) { doc.text(settings.email, 15, y); y += 4; }
        if (settings?.phone) { doc.text('T\u00e9l : ' + settings.phone, 15, y); y += 4; }
        if (settings?.siret) { doc.text('SIRET : ' + settings.siret, 15, y); y += 4; }
        if (settings?.tva_number) { doc.text('TVA : ' + settings.tva_number, 15, y); y += 4; }
        return Math.max(y + 4, 44);
    }

    // ============================================
    // CLIENT BLOCK
    // ============================================
    function drawClientBlock(doc, contact, y) {
        doc.setFillColor(245, 245, 245);
        doc.roundedRect(120, y, 75, 30, 2, 2, 'F');
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text('DESTINATAIRE', 125, y + 5);
        doc.setFontSize(10);
        doc.setTextColor(40, 40, 40);
        doc.setFont('helvetica', 'bold');
        doc.text(contact?.company || contact?.name || 'Client', 125, y + 11);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        let cy = y + 16;
        if (contact?.name && contact?.company) { doc.text(contact.name, 125, cy); cy += 4; }
        if (contact?.address) { doc.text(contact.address.substring(0, 35), 125, cy); cy += 4; }
        if (contact?.email) { doc.text(contact.email, 125, cy); cy += 4; }
        if (contact?.siret) { doc.text('SIRET : ' + contact.siret, 125, cy); }
        return y + 34;
    }

    // ============================================
    // DOCUMENT INFO
    // ============================================
    function drawDocInfo(doc, invoice, y, label) {
        doc.setFontSize(9);
        doc.setTextColor(80, 80, 80);
        const info = [
            [label || 'N\u00b0 Facture', invoice.reference || (invoice.id || '').substring(0, 8) || '-'],
            ['Date d\'\u00e9mission', fmtDate(invoice.date_facture)],
            ['Date d\'\u00e9ch\u00e9ance', fmtDate(invoice.date_echeance) || '-']
        ];
        info.forEach((line, i) => {
            doc.setFont('helvetica', 'bold');
            doc.text(line[0] + ' :', 15, y + i * 5);
            doc.setFont('helvetica', 'normal');
            doc.text(line[1], 55, y + i * 5);
        });
        return y + info.length * 5 + 6;
    }

    // ============================================
    // LINE ITEMS TABLE
    // ============================================
    function drawLineItems(doc, items, y, color) {
        const rgb = hexToRgb(color);
        const headers = ['Description', 'Qt\u00e9', 'PU HT', 'TVA', 'Total HT'];
        const xPos = [17, 110, 135, 157, 190];

        doc.setFillColor(rgb[0], rgb[1], rgb[2]);
        doc.rect(15, y, 180, 8, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        headers.forEach((h, i) => {
            doc.text(h, xPos[i], y + 5.5, { align: i === 0 ? 'left' : 'right' });
        });
        y += 10;

        doc.setTextColor(40, 40, 40);
        doc.setFont('helvetica', 'normal');
        (items || []).forEach((item, idx) => {
            if (y > 260) { doc.addPage(); y = 20; }
            if (idx % 2 === 0) {
                doc.setFillColor(250, 250, 250);
                doc.rect(15, y - 3, 180, 7, 'F');
            }
            const total = (item.quantity || 1) * (item.unit_price || 0);
            doc.setFontSize(8);
            doc.text((item.description || '').substring(0, 55), xPos[0], y + 1);
            doc.text(String(item.quantity || 1), xPos[1], y + 1, { align: 'right' });
            doc.text(fmt(item.unit_price || 0), xPos[2], y + 1, { align: 'right' });
            doc.text((item.tva_rate || 20) + '%', xPos[3], y + 1, { align: 'right' });
            doc.text(fmt(total), xPos[4], y + 1, { align: 'right' });
            y += 7;
        });
        doc.setDrawColor(200, 200, 200);
        doc.line(15, y, 195, y);
        return y + 4;
    }

    // ============================================
    // TOTALS
    // ============================================
    function drawTotals(doc, invoice, y, color) {
        const rgb = hexToRgb(color);
        const x = 140;
        doc.setFontSize(9);
        doc.setTextColor(80, 80, 80);
        doc.setFont('helvetica', 'normal');
        doc.text('Total HT', x, y);
        doc.text(fmtEur(invoice.montant_ht), 190, y, { align: 'right' });
        y += 6;
        doc.text('TVA (' + (invoice.tva_rate || 20) + '%)', x, y);
        doc.text(fmtEur(invoice.montant_tva), 190, y, { align: 'right' });
        y += 6;
        doc.setDrawColor(rgb[0], rgb[1], rgb[2]);
        doc.line(x, y - 2, 195, y - 2);
        doc.setFillColor(rgb[0], rgb[1], rgb[2]);
        doc.roundedRect(x - 2, y, 57, 10, 2, 2, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('TOTAL TTC', x + 2, y + 7);
        doc.text(fmtEur(invoice.montant_ttc), 190, y + 7, { align: 'right' });
        return y + 16;
    }

    function drawPaymentInfo(doc, settings, y) {
        if (y > 240) { doc.addPage(); y = 20; }
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.setFont('helvetica', 'bold');
        doc.text('INFORMATIONS DE PAIEMENT', 15, y);
        doc.setFont('helvetica', 'normal');
        y += 5;
        if (settings?.iban) { doc.text('IBAN : ' + settings.iban, 15, y); y += 4; }
        if (settings?.payment_conditions) { doc.text('Conditions : ' + settings.payment_conditions, 15, y); y += 4; }
        if (settings?.is_micro_entrepreneur) {
            y += 2;
            doc.setFontSize(7);
            doc.text('TVA non applicable, art. 293 B du CGI', 15, y);
        }
        return y + 4;
    }

    function drawFooter(doc, settings) {
        doc.setFontSize(7);
        doc.setTextColor(150, 150, 150);
        const txt = [settings?.company, settings?.siret ? 'SIRET ' + settings.siret : null].filter(Boolean).join(' - ');
        doc.text(txt, 105, 285, { align: 'center' });
    }

    // ============================================
    // FACTURE
    // ============================================
    function generateInvoicePDF(invoice, companySettings, contact) {
        const doc = createDoc();
        if (!doc) return;
        const color = getAccent();
        let y = drawHeader(doc, 'FACTURE', companySettings, color);
        y = drawClientBlock(doc, contact || { company: invoice.fournisseur }, y);
        y = drawDocInfo(doc, invoice, y, 'N\u00b0 Facture');
        y = drawLineItems(doc, invoice.line_items, y, color);
        y = drawTotals(doc, invoice, y, color);
        y = drawPaymentInfo(doc, companySettings, y);
        drawFooter(doc, companySettings);
        doc.save('Facture_' + (invoice.reference || (invoice.id || '').substring(0, 8) || 'brouillon') + '.pdf');
    }

    // ============================================
    // DEVIS
    // ============================================
    function generateQuotePDF(quote, companySettings, contact) {
        const doc = createDoc();
        if (!doc) return;
        const color = '#3b82f6';
        let y = drawHeader(doc, 'DEVIS', companySettings, color);
        y = drawClientBlock(doc, contact || { company: quote.fournisseur }, y);
        y = drawDocInfo(doc, quote, y, 'N\u00b0 Devis');
        y = drawLineItems(doc, quote.line_items, y, color);
        y = drawTotals(doc, quote, y, color);
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text('Devis valable 30 jours \u00e0 compter de la date d\'\u00e9mission.', 15, y);
        y += 10;
        if (y > 230) { doc.addPage(); y = 20; }
        doc.setFillColor(250, 250, 250);
        doc.roundedRect(15, y, 180, 35, 2, 2, 'F');
        doc.setFontSize(9);
        doc.setTextColor(80, 80, 80);
        doc.setFont('helvetica', 'bold');
        doc.text('Bon pour accord', 20, y + 8);
        doc.setFont('helvetica', 'normal');
        doc.text('Date : _______________', 20, y + 16);
        doc.text('Signature :', 20, y + 24);
        doc.setDrawColor(200, 200, 200);
        doc.line(60, y + 30, 150, y + 30);
        drawFooter(doc, companySettings);
        doc.save('Devis_' + (quote.reference || (quote.id || '').substring(0, 8) || 'brouillon') + '.pdf');
    }

    // ============================================
    // AVOIR
    // ============================================
    function generateCreditNotePDF(creditNote, companySettings, contact) {
        const doc = createDoc();
        if (!doc) return;
        const color = '#ef4444';
        let y = drawHeader(doc, 'AVOIR', companySettings, color);
        y = drawClientBlock(doc, contact || { company: creditNote.fournisseur }, y);
        y = drawDocInfo(doc, creditNote, y, 'N\u00b0 Avoir');
        if (creditNote.converted_from_id) {
            doc.setFontSize(9);
            doc.setTextColor(180, 60, 60);
            doc.text('R\u00e9f. facture d\'origine : ' + creditNote.converted_from_id.substring(0, 8), 15, y);
            y += 8;
        }
        y = drawLineItems(doc, creditNote.line_items, y, color);
        y = drawTotals(doc, { ...creditNote, montant_ht: -(creditNote.montant_ht||0), montant_tva: -(creditNote.montant_tva||0), montant_ttc: -(creditNote.montant_ttc||0) }, y, color);
        drawFooter(doc, companySettings);
        doc.save('Avoir_' + (creditNote.reference || (creditNote.id || '').substring(0, 8) || 'brouillon') + '.pdf');
    }

    // ============================================
    // RAPPEL
    // ============================================
    function generateReminderPDF(invoice, companySettings, contact) {
        const doc = createDoc();
        if (!doc) return;
        const color = '#f59e0b';
        let y = drawHeader(doc, 'RAPPEL', companySettings, color);
        y = drawClientBlock(doc, contact || { company: invoice.fournisseur }, y);
        doc.setFontSize(11);
        doc.setTextColor(40, 40, 40);
        doc.setFont('helvetica', 'bold');
        doc.text('Rappel de paiement', 15, y + 4);
        y += 12;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        const due = invoice.date_echeance ? new Date(invoice.date_echeance) : null;
        const daysOver = due ? Math.max(0, Math.floor((Date.now() - due.getTime()) / 86400000)) : 0;
        const lines = [
            'Madame, Monsieur,', '',
            'Sauf erreur de notre part, nous n\'avons pas re\u00e7u le r\u00e8glement',
            'de la facture suivante :', '',
            '    Facture N\u00b0 : ' + (invoice.reference || (invoice.id||'').substring(0, 8)),
            '    Date : ' + fmtDate(invoice.date_facture),
            '    Montant TTC : ' + fmtEur(invoice.montant_ttc),
            '    \u00c9ch\u00e9ance : ' + fmtDate(invoice.date_echeance),
            daysOver > 0 ? '    Retard : ' + daysOver + ' jours' : '', '',
            'Nous vous serions reconnaissants de bien vouloir proc\u00e9der',
            'au r\u00e8glement dans les meilleurs d\u00e9lais.', '',
            'Si votre paiement a d\u00e9j\u00e0 \u00e9t\u00e9 effectu\u00e9, veuillez ne pas',
            'tenir compte de ce rappel.', '',
            'Cordialement,'
        ];
        lines.forEach(l => { doc.text(l, 15, y); y += 5; });
        y = drawPaymentInfo(doc, companySettings, y + 4);
        drawFooter(doc, companySettings);
        doc.save('Rappel_' + (invoice.reference || (invoice.id||'').substring(0, 8) || 'brouillon') + '.pdf');
    }

    return { generateInvoicePDF, generateQuotePDF, generateCreditNotePDF, generateReminderPDF };
})();

window.AccPDF = AccPDF;

import PDFDocument from 'pdfkit';
import { DEFAULT_EUR_PER_STAR } from './config.js';
import { PAYOUT_FEES } from './constants.js';

const COMPANY = {
  name: 'COMMIT MEDIA SARL',
  registration: 'LU34811132',
  address: '147 route de Thionville',
  city: 'L-2611 Luxembourg',
  email: 'bob@openletz.com',
  brand: 'Gategram',
};

/**
 * Generate a payout invoice PDF as a Buffer.
 *
 * @param {object} params
 * @param {object} params.payout - Payout record from DB
 * @param {object} params.profile - Creator profile from DB
 * @param {object[]} params.purchases - Purchase records for this payout
 * @param {string} params.invoiceNumber - e.g. "GG-2026-0042"
 * @returns {Promise<Buffer>}
 */
export async function generateInvoicePdf({ payout, profile, purchases, invoiceNumber }) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 50, bufferPages: true });
      const chunks = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const eurPerStar = DEFAULT_EUR_PER_STAR;
      const totalStars = Number(payout.amount_stars || 0);
      const grossEur = Number((totalStars * eurPerStar).toFixed(2));
      const payoutMethod = profile?.payout_method || 'bank_transfer';
      const fee = PAYOUT_FEES[payoutMethod] || PAYOUT_FEES.bank_transfer;
      const feeEur = Number((grossEur * (fee.percent / 100) + fee.fixed_eur).toFixed(2));
      const netEur = Number((grossEur - feeEur).toFixed(2));
      const invoiceDate = payout.created_at ? new Date(payout.created_at).toLocaleDateString('en-GB') : new Date().toLocaleDateString('en-GB');

      // ── Header ──
      doc.fontSize(20).font('Helvetica-Bold').text('INVOICE', 50, 50);
      doc.fontSize(10).font('Helvetica').fillColor('#666666');
      doc.text(`${COMPANY.brand} — a brand of ${COMPANY.name}`, 50, 78);

      doc.fontSize(10).font('Helvetica-Bold').fillColor('#000000');
      doc.text(invoiceNumber, 400, 50, { align: 'right' });
      doc.font('Helvetica').fillColor('#666666');
      doc.text(`Date: ${invoiceDate}`, 400, 66, { align: 'right' });
      if (payout.paid_at) {
        doc.text(`Paid: ${new Date(payout.paid_at).toLocaleDateString('en-GB')}`, 400, 80, { align: 'right' });
      }

      // ── From / To ──
      const y1 = 120;
      doc.fontSize(9).font('Helvetica-Bold').fillColor('#999999').text('FROM', 50, y1);
      doc.font('Helvetica').fillColor('#000000').fontSize(10);
      doc.text(COMPANY.name, 50, y1 + 14);
      doc.fontSize(9).fillColor('#666666');
      doc.text(COMPANY.registration, 50, y1 + 28);
      doc.text(COMPANY.address, 50, y1 + 40);
      doc.text(COMPANY.city, 50, y1 + 52);
      doc.text(COMPANY.email, 50, y1 + 64);

      doc.fontSize(9).font('Helvetica-Bold').fillColor('#999999').text('TO', 300, y1);
      doc.font('Helvetica').fillColor('#000000').fontSize(10);
      doc.text(profile?.legal_name || `Creator ${payout.creator_id}`, 300, y1 + 14);
      doc.fontSize(9).fillColor('#666666');
      if (profile?.email) doc.text(profile.email, 300, y1 + 28);
      if (profile?.country) doc.text(`Country: ${profile.country}`, 300, y1 + 40);
      const payoutLabel = payoutMethod === 'paypal' ? 'PayPal' : 'SEPA Bank Transfer';
      doc.text(`Payout method: ${payoutLabel}`, 300, y1 + 52);
      if (profile?.payout_details) {
        const masked = payoutMethod === 'paypal'
          ? profile.payout_details
          : (profile.payout_details.length > 8
            ? profile.payout_details.slice(0, 4) + '****' + profile.payout_details.slice(-4)
            : profile.payout_details);
        doc.text(`Account: ${masked}`, 300, y1 + 64);
      }

      // ── Line items table ──
      const tableTop = y1 + 100;
      doc.fontSize(9).font('Helvetica-Bold').fillColor('#999999');
      doc.text('DESCRIPTION', 50, tableTop);
      doc.text('QTY', 300, tableTop, { width: 50, align: 'right' });
      doc.text('UNIT', 360, tableTop, { width: 60, align: 'right' });
      doc.text('AMOUNT', 430, tableTop, { width: 80, align: 'right' });

      doc.moveTo(50, tableTop + 14).lineTo(510, tableTop + 14).strokeColor('#e0e0e0').lineWidth(0.5).stroke();

      let rowY = tableTop + 22;
      doc.font('Helvetica').fillColor('#000000').fontSize(9);

      // Purchase line items (max 30 to fit page)
      const displayPurchases = (purchases || []).slice(0, 30);
      for (const p of displayPurchases) {
        const stars = Number(p.creator_share || 0);
        const eur = Number((stars * eurPerStar).toFixed(2));
        doc.text(String(p.product_title || p.product_id).slice(0, 40), 50, rowY, { width: 240 });
        doc.text(String(stars), 300, rowY, { width: 50, align: 'right' });
        doc.text(`${eurPerStar} EUR`, 360, rowY, { width: 60, align: 'right' });
        doc.text(`${eur.toFixed(2)} EUR`, 430, rowY, { width: 80, align: 'right' });
        rowY += 16;
        if (rowY > 680) break;
      }

      if (purchases && purchases.length > 30) {
        doc.fillColor('#999999').text(`... and ${purchases.length - 30} more items`, 50, rowY);
        rowY += 16;
      }

      // ── Totals ──
      rowY += 8;
      doc.moveTo(50, rowY).lineTo(510, rowY).strokeColor('#e0e0e0').lineWidth(0.5).stroke();
      rowY += 12;

      const labelX = 50;
      const valueX = 350;
      const valueW = 160;

      doc.font('Helvetica').fillColor('#000000').fontSize(10);
      doc.text(`Subtotal (${totalStars} Stars @ ${eurPerStar} EUR/Star)`, labelX, rowY);
      doc.text(`${grossEur.toFixed(2)} EUR`, valueX, rowY, { width: valueW, align: 'right' });
      rowY += 20;

      if (feeEur > 0) {
        const feeLabel = payoutMethod === 'paypal' ? 'PayPal fees' : 'Transfer fee';
        doc.fillColor('#c62828');
        doc.text(`${feeLabel} (${fee.description})`, labelX, rowY);
        doc.text(`-${feeEur.toFixed(2)} EUR`, valueX, rowY, { width: valueW, align: 'right' });
        rowY += 20;
      }

      doc.moveTo(50, rowY).lineTo(510, rowY).strokeColor('#7c3aed').lineWidth(1.5).stroke();
      rowY += 12;

      doc.font('Helvetica-Bold').fillColor('#7c3aed').fontSize(14);
      doc.text('TOTAL DUE', labelX, rowY);
      doc.text(`${netEur.toFixed(2)} EUR`, valueX, rowY, { width: valueW, align: 'right' });

      // ── Footer ──
      const footerY = 750;
      doc.fontSize(8).font('Helvetica').fillColor('#999999');
      doc.text(
        `${COMPANY.brand} is a brand of ${COMPANY.name} | ${COMPANY.registration} | ${COMPANY.address}, ${COMPANY.city}`,
        50, footerY, { width: 460, align: 'center' }
      );
      doc.text(
        'Platform fee (5%) already deducted from creator share. Transfer fees are charged by the payment provider, not by Gategram.',
        50, footerY + 12, { width: 460, align: 'center' }
      );

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Generate a unique invoice number.
 * Format: GG-YYYY-NNNNN (e.g., GG-2026-00042)
 */
export function generateInvoiceNumber(payoutId) {
  const year = new Date().getFullYear();
  const num = String(payoutId).padStart(5, '0');
  return `GG-${year}-${num}`;
}

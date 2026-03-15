export function toCsv(rows) {
  if (!rows.length) return '';
  const headers = Object.keys(rows[0]);
  const esc = (v) => {
    const s = v == null ? '' : String(v);
    if (/[,"\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };
  const lines = [headers.join(',')];
  for (const row of rows) lines.push(headers.map((h) => esc(row[h])).join(','));
  return `${lines.join('\n')}\n`;
}

export function payoutStatementRows(details) {
  if (!details?.payout) return [];
  const header = details.payout;
  const rows = (details.purchases || []).map((p) => ({
    payout_id: header.id,
    payout_created_at: header.created_at,
    payout_status: header.status,
    payout_paid_at: header.paid_at || '',
    creator_id: header.creator_id,
    payout_amount_stars: header.amount_stars,
    invoice_ref: header.invoice_ref || '',
    purchase_id: p.id,
    product_id: p.product_id,
    product_title: p.product_title || '',
    buyer_telegram_id: p.buyer_telegram_id,
    stars_paid: Number(p.stars_paid || 0),
    creator_share: Number(p.creator_share || 0),
    platform_fee: Number(p.platform_fee || 0),
    refunded: Number(p.refunded || 0),
    telegram_charge_id: p.telegram_charge_id || '',
    purchase_created_at: p.created_at,
  }));

  const totals = rows.reduce((acc, r) => {
    acc.stars_paid += Number(r.stars_paid || 0);
    acc.creator_share += Number(r.creator_share || 0);
    acc.platform_fee += Number(r.platform_fee || 0);
    acc.refunded += Number(r.refunded || 0);
    return acc;
  }, { stars_paid: 0, creator_share: 0, platform_fee: 0, refunded: 0 });

  rows.push({
    payout_id: header.id,
    payout_created_at: header.created_at,
    payout_status: header.status,
    payout_paid_at: header.paid_at || '',
    creator_id: header.creator_id,
    payout_amount_stars: header.amount_stars,
    invoice_ref: header.invoice_ref || '',
    purchase_id: 'TOTAL',
    product_id: '',
    product_title: `${rows.length} purchases`,
    buyer_telegram_id: '',
    stars_paid: totals.stars_paid,
    creator_share: totals.creator_share,
    platform_fee: totals.platform_fee,
    refunded: totals.refunded,
    telegram_charge_id: '',
    purchase_created_at: '',
  });

  return rows;
}

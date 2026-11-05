import { pctOf } from './money';
import { resolveExpiry } from './time';
import type { Basket, Catalog, Dh, FeeRules, Listing, OfferLine, PricedBase } from './types';

/** Food: the listings of basket.merchantId. Grocery/pharmacy: all listings of the scenario. */
export function offersFor(catalog: Catalog, basket: Basket): Listing[] {
  if (basket.scenario === 'food') {
    if (!basket.merchantId) return [];
    return catalog.listings.filter((l) => l.scenario === 'food' && l.merchantId === basket.merchantId);
  }
  return catalog.listings.filter((l) => l.scenario === basket.scenario);
}

function serviceFee(fees: FeeRules, itemsDh: Dh): Dh {
  const s = fees.service;
  if (s.kind === 'none') return 0;
  if (s.kind === 'fixed') return s.dh;
  return Math.min(s.maxDh, Math.max(s.minDh, pctOf(itemsDh, s.pct)));
}

/**
 * Prices one listing for the basket: sale prices (only while the sale promotion is unexpired),
 * completeness, items subtotal, delivery, service and small-order fee. No vouchers yet.
 * Every threshold in the app uses itemsDh (after sale prices, before vouchers) as its base.
 */
export function priceOffer(
  listing: Listing,
  basket: Basket,
  catalog: Catalog,
  nowMs: number,
  anchorMs: number,
): PricedBase {
  const missing: string[] = [];
  const lines: OfferLine[] = [];
  let itemsDh = 0;
  let saleSavingsDh = 0;

  for (const line of basket.lines) {
    const product = catalog.products.find((p) => p.id === line.productId);
    const regularDh = product?.prices[listing.id];
    if (!product || regularDh === undefined) {
      missing.push(line.productId);
      continue;
    }
    let unitDh = regularDh;
    const sale = product.sale?.[listing.id];
    if (sale) {
      const promo = catalog.promotions.find((p) => p.id === sale.promoId);
      if (promo && nowMs < resolveExpiry(promo.conditions.expiry, anchorMs)) unitDh = sale.saleDh;
    }
    const lineDh = unitDh * line.qty;
    lines.push({ productId: line.productId, qty: line.qty, unitDh, regularDh, lineDh });
    itemsDh += lineDh;
    saleSavingsDh += (regularDh - unitDh) * line.qty;
  }

  const small = listing.fees.smallOrder;
  return {
    listingId: listing.id,
    platformId: listing.platformId,
    merchantId: listing.merchantId,
    eta: listing.eta,
    complete: missing.length === 0,
    missing,
    lines,
    itemsDh,
    saleSavingsDh,
    deliveryDh: listing.fees.deliveryDh,
    serviceDh: serviceFee(listing.fees, itemsDh),
    smallOrderDh: small && itemsDh < small.belowDh ? small.feeDh : 0,
  };
}

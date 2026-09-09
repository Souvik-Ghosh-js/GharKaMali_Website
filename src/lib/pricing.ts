// Location-aware Mali visit CTA label: show the customer's ZONE price when we
// know their area (zones carry base_price); otherwise no price at all — a
// hardcoded global ₹349 was wrong for zones priced differently.
export const maliVisitPrice = (zone: any): number | null => {
  const p = Number(zone?.base_price);
  return Number.isFinite(p) && p > 0 ? Math.round(p) : null;
};

export const maliVisitLabel = (zone: any): string => {
  const p = maliVisitPrice(zone);
  return p ? `Book Mali Visit @ ₹${p}` : 'Book Mali Visit';
};

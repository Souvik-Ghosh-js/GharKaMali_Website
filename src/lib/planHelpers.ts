// Single source of truth for how plans are displayed everywhere on the site.
// Keeps price / visits / plants / description rendering consistent across the
// home page, plans page, booking flow, dashboard, and subscriptions.

// The admin's `description` free-text often hard-codes a "N visits/month" / "up to
// N plants" that drifts from the structured fields. Strip those phrases so the
// description is just the blurb; the real counts come from visits_per_month /
// max_plants (the source of truth) and are shown separately via planCoverageText.
export const cleanPlanDescription = (desc?: string): string =>
  (desc || '')
    .replace(/[—-]?\s*\d+\s*visits?\s*\/?\s*month/gi, '')
    .replace(/\.?\s*(up to|upto)\s*\d+\s*plants?\.?/gi, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/\s+([.,—-])/g, '$1')
    .replace(/[—-]\s*$/, '')
    .trim();

// "3 visits/month · up to 40 plants" built from the real structured fields.
export const planCoverageText = (plan: any): string => {
  const parts: string[] = [];
  if (plan?.visits_per_month) parts.push(`${plan.visits_per_month} visit${plan.visits_per_month > 1 ? 's' : ''}/month`);
  if (plan?.max_plants) parts.push(`up to ${plan.max_plants} plants`);
  return parts.join(' · ');
};

// On-demand plans use the zone's base_price when a location is selected;
// subscriptions always use the plan price. Formatted as a clean whole-rupee,
// comma-separated string (no stray ".00") so it never overflows price displays.
export const getPlanPrice = (plan: any, zone?: any): string => {
  const raw = plan?.plan_type !== 'subscription' && zone?.base_price != null ? zone.base_price : plan?.price;
  const num = Math.round(Number(raw) || 0);
  return num.toLocaleString('en-IN');
};

export const isAnnualPlan = (plan: any): boolean =>
  Number(plan?.duration_days) >= 360 ||
  /-annual$/i.test(plan?.slug || '') ||
  /\(annual\)/i.test(plan?.name || '');

// '/year' for annual subscriptions, '/mo' for monthly subscriptions, '/visit' for on-demand.
export const priceSuffix = (plan: any): string =>
  plan?.plan_type === 'subscription'
    ? isAnnualPlan(plan) ? '/year' : '/mo'
    : '/visit';

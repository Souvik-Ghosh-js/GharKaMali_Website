// Shared slug helpers so link builders and route resolvers always agree.
// Plans/categories have no stored slug, so we derive one from the name.

export const slugify = (s: string): string =>
  (s || '')
    .toLowerCase()
    .trim()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

export const planSlug = (plan: { name?: string } | null | undefined): string =>
  slugify(plan?.name || '');

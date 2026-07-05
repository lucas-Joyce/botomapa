// Single source of truth for the countries the app covers.
// Slug = URL path segment (/uk) and the key used across colorMaps, elections, data.
// `active`: Phase 0 ships the UK vertical slice only. The other four stay as
// stubs (routes still exist) but are surfaced as "coming soon" in the nav/landing
// until their data pipelines land — repurpose per country in Phase 5+.
export const countries = [
  { slug: 'uk',          name: 'United Kingdom', active: true  },
  { slug: 'usa',         name: 'United States',  active: false },
  { slug: 'france',      name: 'France',         active: false },
  { slug: 'germany',     name: 'Germany',        active: false },
  { slug: 'philippines', name: 'Philippines',    active: false },
]

export const countryBySlug = new Map(countries.map(c => [c.slug, c]))

// Derive the active country slug from a router pathname, or null off a country page.
export function countryFromPath(pathname) {
  const slug = pathname.split('/').filter(Boolean)[0]
  return countryBySlug.has(slug) ? slug : null
}

// Single source of truth for the countries the app covers.
// Slug = URL path segment (/uk) and the key used across colorMaps, elections, data.
export const countries = [
  { slug: 'uk',          name: 'United Kingdom' },
  { slug: 'usa',         name: 'United States'  },
  { slug: 'france',      name: 'France'         },
  { slug: 'germany',     name: 'Germany'        },
  { slug: 'philippines', name: 'Philippines'    },
]

export const countryBySlug = new Map(countries.map(c => [c.slug, c]))

// Derive the active country slug from a router pathname, or null off a country page.
export function countryFromPath(pathname) {
  const slug = pathname.split('/').filter(Boolean)[0]
  return countryBySlug.has(slug) ? slug : null
}

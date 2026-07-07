// Party registry + normalisation — the single source of truth for party IDENTITY
// (canonical code → display name) and for collapsing the many raw labels in the
// source data down to one code. Colour lives separately in colorMaps.js, keyed by
// these same codes; the two files MUST keep codes in sync.
//
// Why normalisation is a first-class deliverable (build-plan-v2 §3.5): the source
// CSVs label one party many ways ("Con"/"Conservative", "LD"/"Liberal Democrat"/
// "Lib", "Green"/"Green Party") — those variants collapse to one code.
//
// RULE — rebrands are NOT merged. A party keeps its contemporaneous identity for
// the election it contested, so UKIP (2015, 2017), the Brexit Party (2019) and
// Reform UK (2024) are THREE distinct codes, not one — preserving the cross-year
// swing story. The same rule applies to every country (e.g. France FN vs RN,
// En Marche vs Renaissance/Ensemble): never fold a rename into its successor.

export const parties = {
  uk: {
    CON:  { name: 'Conservative' },
    LAB:  { name: 'Labour' },
    LD:   { name: 'Liberal Democrats' },
    SNP:  { name: 'Scottish National Party' },
    GRN:  { name: 'Green' },
    UKIP:   { name: 'UK Independence Party' }, // 2015, 2017
    BREXIT: { name: 'Brexit Party' },          // 2019
    RUK:    { name: 'Reform UK' },             // 2024 — kept distinct from UKIP/Brexit by design
    PC:   { name: 'Plaid Cymru' },
    DUP:  { name: 'Democratic Unionist Party' },
    SF:   { name: 'Sinn Féin' },
    SDLP: { name: 'Social Democratic and Labour Party' },
    UUP:  { name: 'Ulster Unionist Party' },
    APNI: { name: 'Alliance' },
    OTH:  { name: 'Other' },
  },
  usa:     { DEM: { name: 'Democratic' }, REP: { name: 'Republican' }, OTH: { name: 'Other' } },
  france:  { NFP: { name: 'Nouveau Front Populaire' }, ENS: { name: 'Ensemble' }, RN: { name: 'Rassemblement National' }, LR: { name: 'Les Républicains' }, OTH: { name: 'Other' } },
  germany: { CDU: { name: 'CDU' }, CSU: { name: 'CSU' }, SPD: { name: 'SPD' }, GRN: { name: 'Grüne' }, FDP: { name: 'FDP' }, AFD: { name: 'AfD' }, LINKE: { name: 'Die Linke' }, BSW: { name: 'BSW' }, OTH: { name: 'Other' } },
  philippines: { PDPLABAN: { name: 'PDP–Laban' }, LP: { name: 'Liberal Party' }, NP: { name: 'Nacionalista' }, NPC: { name: 'NPC' }, LAKAS: { name: 'Lakas–CMD' }, OTH: { name: 'Other' } },
}

// Raw label (abbreviation, full name, or wide-CSV column key) → canonical code.
// Keys are lowercased; anything unmatched falls back to OTH. Extend per country as
// each country's cleaning script meets real data (UK is complete; others seeded).
const aliases = {
  uk: {
    con: 'CON', conservative: 'CON',
    lab: 'LAB', labour: 'LAB', 'labour and co-operative': 'LAB', 'lab co-op': 'LAB',
    ld: 'LD', lib: 'LD', 'liberal democrat': 'LD', 'liberal democrats': 'LD',
    snp: 'SNP', 'scottish national party': 'SNP',
    green: 'GRN', 'green party': 'GRN',
    ukip: 'UKIP', 'uk independence party': 'UKIP',
    brexit: 'BREXIT', brx: 'BREXIT', 'brexit party': 'BREXIT',
    reform: 'RUK', ruk: 'RUK', 'reform uk': 'RUK',
    pc: 'PC', 'plaid cymru': 'PC',
    dup: 'DUP',
    sf: 'SF', 'sinn féin': 'SF', 'sinn fein': 'SF',
    sdlp: 'SDLP',
    uup: 'UUP',
    alliance: 'APNI', apni: 'APNI',
  },
  usa: {
    dem: 'DEM', democrat: 'DEM', democratic: 'DEM',
    rep: 'REP', republican: 'REP', gop: 'REP',
  },
}

// Collapse a raw source label to a canonical party code for the given country.
export function normalizeParty(country, raw) {
  if (!raw) return 'OTH'
  const key = String(raw).trim().toLowerCase()
  return aliases[country]?.[key] ?? 'OTH'
}

// Display name for a canonical code (falls back to the code itself).
export function partyName(country, code) {
  return parties[country]?.[code]?.name ?? code
}

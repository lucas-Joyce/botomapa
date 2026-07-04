// Party colours — the SINGLE SOURCE OF TRUTH for map fills (build-plan-v2 §2.2).
// D3 reads these directly for `fill`; themeBridge.js mirrors the active palette
// into `--party-*` CSS custom properties so SCSS can reference the same values.
// Never hardcode a party hex in a component or a .scss file — add it here.
//
// Two palettes, from day one:
//   standard    — party brand colours
//   colourblind — Okabe–Ito, chosen to stay distinct under deuteranopia/protanopia
//
// Keys are short party codes; `OTHER` is the fallback for anything unmatched.
export const OTHER = 'OTH'

// Okabe–Ito reference (colourblind-safe): used to build the `colourblind` maps.
//   black #000000  orange #E69F00  sky #56B4E9  green #009E73
//   yellow #F0E442 blue #0072B2  vermillion #D55E00  purple #CC79A7

export const partyColors = {
  standard: {
    uk: {
      CON: '#0087DC', LAB: '#E4003B', LD: '#FAA61A', SNP: '#FDF23B',
      GRN: '#02A95B', RUK: '#12B6CF', PC: '#005B54', DUP: '#D46A4C',
      SF: '#326760', SDLP: '#2AA82C', UUP: '#48A5EE', APNI: '#F6CB2F',
      OTH: '#999999',
    },
    usa: {
      DEM: '#2E5EAA', REP: '#D22532', OTH: '#999999',
    },
    france: {
      NFP: '#CC2443', ENS: '#FFD800', RN: '#0D378A', LR: '#235CBA',
      OTH: '#999999',
    },
    germany: {
      CDU: '#000000', CSU: '#008AC5', SPD: '#E3000F', GRN: '#46962B',
      FDP: '#FFED00', AFD: '#009EE0', LINKE: '#BE3075', BSW: '#7D254F',
      OTH: '#999999',
    },
    // Provisional — PH is candidate/coalition-centric; palette firms up after
    // the Phase 1 data-availability spike (build-plan-v2 §3.6).
    philippines: {
      PDPLABAN: '#C8102E', LP: '#F9A01B', NP: '#1A4B8C', NPC: '#2E9E4B',
      LAKAS: '#7A1FA2', OTH: '#999999',
    },
  },

  colourblind: {
    uk: {
      CON: '#0072B2', LAB: '#D55E00', LD: '#E69F00', SNP: '#F0E442',
      GRN: '#009E73', RUK: '#56B4E9', PC: '#CC79A7', OTH: '#999999',
    },
    usa: {
      DEM: '#0072B2', REP: '#D55E00', OTH: '#999999',
    },
    france: {
      NFP: '#D55E00', ENS: '#F0E442', RN: '#0072B2', LR: '#56B4E9',
      OTH: '#999999',
    },
    germany: {
      CDU: '#000000', SPD: '#D55E00', GRN: '#009E73', FDP: '#F0E442',
      AFD: '#56B4E9', LINKE: '#CC79A7', BSW: '#E69F00', OTH: '#999999',
    },
    philippines: {
      PDPLABAN: '#D55E00', LP: '#E69F00', NP: '#0072B2', NPC: '#009E73',
      LAKAS: '#CC79A7', OTH: '#999999',
    },
  },
}

export const PALETTES = ['standard', 'colourblind']

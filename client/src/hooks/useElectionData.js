import { useMemo, useState } from 'react'

// Phase-0 guardrail stub (§3.3). Every view consumes ONE array of rows via a
// `Map` keyed by `constituencyId` (GSS code) — so no component ever calls
// `.find()` in a render/loop to match a region to its result.
//
// The fetch lands in Phase 1: cleaning scripts emit
// `server/data/processed/<electionId>.json`, served at `/api/:country`; the
// effect that fetches into `setRows` (asserting seat count + logging unmatched
// ids, §3.5) goes here. Until then `rows` stays `[]` and the Map is empty, so
// pages can wire against the contract before the data pipeline exists.
export function useElectionData(country) {
  const [rows] = useState([])

  // The Map is the single lookup every view reads, rebuilt only when rows change.
  const byId = useMemo(
    () => new Map(rows.map(d => [d.constituencyId, d])),
    [rows],
  )

  // `country` is echoed back as the dataset key the Phase-1 fetch selects by.
  return { country, rows, byId }
}

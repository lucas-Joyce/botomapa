import { useEffect, useMemo, useState } from 'react'

// Stable empty array so "no data" keeps a constant identity (byId memo stays put).
const EMPTY = []

// Fetches one election's processed rows and exposes them as a `Map` keyed by
// `constituencyId` (GSS code) — the single lookup every view reads (§3.3), so no
// component ever calls `.find()` in a render/draw loop.
//
// Data flows: clean-uk.js emits `server/data/processed/<electionId>.json`, served
// at `/api/:country/:electionId` (§1.2) through the Vite proxy. Pass the country
// (from the route) and the selected electionId (ViewContext.selectedYear).
//
// StrictMode-safe (viz/README.md §"StrictMode contract"): the effect returns
// cleanup that aborts the in-flight request and flips an `ignore` flag. State is
// set ONLY from async callbacks — never synchronously in the effect body — and
// `status` is derived in render, so the dev double-invoke can neither flash stale
// data nor trigger cascading renders.
export function useElectionData(country, electionId) {
  const [result, setResult] = useState({ electionId: null, rows: EMPTY, error: null })

  useEffect(() => {
    if (!country || !electionId) return
    let ignore = false
    const controller = new AbortController()

    fetch(`/api/${country}/${electionId}`, { signal: controller.signal })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status} for ${electionId}`)
        return res.json()
      })
      .then(rows => { if (!ignore) setResult({ electionId, rows, error: null }) })
      .catch(err => {
        if (ignore || err.name === 'AbortError') return   // stale/aborted — drop silently
        setResult({ electionId, rows: EMPTY, error: err })
      })

    return () => { ignore = true; controller.abort() }
  }, [country, electionId])

  // Only surface data once THIS election's response has landed — never flash the
  // previous election's rows while a new one loads (also covers StrictMode remount).
  const fresh = result.electionId === electionId
  const rows = fresh ? result.rows : EMPTY
  const error = fresh ? result.error : null
  const status = !country || !electionId ? 'idle'
    : !fresh ? 'loading'
    : error ? 'error' : 'ready'

  // The Map is the single lookup every view reads, rebuilt only when rows change.
  const byId = useMemo(() => new Map(rows.map(d => [d.constituencyId, d])), [rows])

  // Cheap early warning that a served file is stale/partial (§1.5): a UK election
  // must build exactly 650 unique constituency ids.
  useEffect(() => {
    if (status === 'ready' && country === 'uk' && byId.size !== 650) {
      console.warn(`useElectionData: ${electionId} built ${byId.size} unique ids, expected 650`)
    }
  }, [status, country, electionId, byId])

  return { country, electionId, rows, byId, status, error }
}

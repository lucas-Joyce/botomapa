import express from 'express'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PROCESSED_DIR = join(__dirname, 'data', 'processed')
const PORT = process.env.PORT || 3001

// Countries served by the API. UK is the only one with data in Phase 1;
// the rest 404 with a helpful message until their cleaning scripts land.
const COUNTRIES = new Set(['uk', 'usa', 'france', 'germany', 'philippines'])

const app = express()

// Health check — the Phase 0 exit criterion (reachable through the Vite proxy).
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'botomapa-server', time: new Date().toISOString() })
})

// GET /api/:country/:electionId -> server/data/processed/<electionId>.json
// Election-keyed, thin static-JSON server: no DB. The id (e.g. 'uk-2024') is the
// filename AND the client's ViewContext.selectedYear — one stable key, no implicit
// "newest" that drifts. clean-uk.js writes the file; this streams it verbatim.
app.get('/api/:country/:electionId', async (req, res) => {
  const country = req.params.country.toLowerCase()
  const electionId = req.params.electionId.toLowerCase()

  if (!COUNTRIES.has(country)) {
    return res.status(404).json({ error: `Unknown country '${country}'` })
  }
  // Must be '<country>-<year>': pins the route to the file naming AND blocks path
  // traversal (no '/', '..', or stray chars can reach readFile).
  if (!/^[a-z]+-\d{4}$/.test(electionId) || !electionId.startsWith(`${country}-`)) {
    return res.status(404).json({ error: `Invalid election id '${electionId}' for '${country}'` })
  }

  try {
    const raw = await readFile(join(PROCESSED_DIR, `${electionId}.json`), 'utf-8')
    res.type('application/json').send(raw)
  } catch (err) {
    if (err.code === 'ENOENT') {
      return res.status(404).json({
        error: `No processed data yet for '${electionId}'. Run the Phase 1 cleaning script.`,
      })
    }
    console.error(err)
    res.status(500).json({ error: 'Failed to read data' })
  }
})

app.listen(PORT, () => {
  console.log(`botomapa server → http://localhost:${PORT}`)
})

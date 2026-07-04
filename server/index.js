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

// GET /api/:country -> server/data/processed/:country.json
// Thin static-JSON server: no DB. The cleaning scripts (Phase 1+) write the files.
app.get('/api/:country', async (req, res) => {
  const country = req.params.country.toLowerCase()

  if (!COUNTRIES.has(country)) {
    return res.status(404).json({ error: `Unknown country '${country}'` })
  }

  try {
    const raw = await readFile(join(PROCESSED_DIR, `${country}.json`), 'utf-8')
    res.type('application/json').send(raw)
  } catch (err) {
    if (err.code === 'ENOENT') {
      return res.status(404).json({
        error: `No processed data yet for '${country}'. Run the Phase 1 cleaning script.`,
      })
    }
    console.error(err)
    res.status(500).json({ error: 'Failed to read data' })
  }
})

app.listen(PORT, () => {
  console.log(`botomapa server → http://localhost:${PORT}`)
})

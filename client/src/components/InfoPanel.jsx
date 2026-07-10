import '../styles/components/infoPanel.scss'

// `election` is optional — only the UK page passes it in Phase 1 (§1.6), to prove
// the data thread (fetch → Map) with numbers before any map is drawn. Other country
// pages omit it and see just the placeholder.
// A party colour swatch, reading the same `--party-*` custom property the map fills
// from (kept in sync by PaletteEmitter) so sidebar and map never disagree.
function Swatch({ party }) {
  return (
    <span
      className="info-panel__swatch"
      style={{ background: `var(--party-${party.toLowerCase()}, var(--party-oth))` }}
    />
  )
}

export default function InfoPanel({ country, viewMode, mapMode, election, hovered }) {
  const pct = (n) => `${(n * 100).toFixed(1)}%`
  return (
    <div className="info-panel">
      <div className="info-panel__header">
        <h2 className="info-panel__country">{country}</h2>
      </div>
      <p className="info-panel__placeholder">
        {viewMode} — {mapMode}
      </p>

      {/* Detail of the constituency under the pointer/keyboard focus (§2.3). */}
      {hovered && (
        <div className="info-panel__detail">
          <div className="info-panel__detail-name">{hovered.constituencyName}</div>
          <div className="info-panel__detail-region">{hovered.region}</div>
          <div className="info-panel__detail-stats">
            <span><Swatch party={hovered.winner} />{hovered.winner} won</span>
            <span>Maj {hovered.majority.toLocaleString()} ({pct(hovered.majorityShare)})</span>
            <span>Turnout {pct(hovered.turnout)}</span>
          </div>
          <ul className="info-panel__results">
            {hovered.results.map((r) => (
              <li key={r.party} className="info-panel__result-row">
                <Swatch party={r.party} />
                <span className="info-panel__result-party">{r.party}</span>
                <span className="info-panel__result-share">{pct(r.share)}</span>
                <span className="info-panel__result-votes">{r.votes.toLocaleString()}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {election && (
        <div className="info-panel__data">
          <div className="info-panel__data-head">
            <span className="info-panel__election">{election.electionId ?? '—'}</span>
            <span className={`info-panel__status info-panel__status--${election.status}`}>
              {election.status}
            </span>
          </div>

          {election.status === 'error' ? (
            <p className="info-panel__error">
              Failed to load: {String(election.error?.message ?? election.error)}
            </p>
          ) : (
            <>
              <p className="info-panel__seats">
                <strong>{election.seatCount}</strong> / 650 seats
              </p>
              <ul className="info-panel__tally">
                {election.winners.map(([party, seats]) => (
                  <li key={party} className="info-panel__tally-row">
                    <span>{party}</span>
                    <span>{seats}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  )
}

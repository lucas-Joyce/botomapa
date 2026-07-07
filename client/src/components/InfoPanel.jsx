import '../styles/components/infoPanel.scss'

// `election` is optional — only the UK page passes it in Phase 1 (§1.6), to prove
// the data thread (fetch → Map) with numbers before any map is drawn. Other country
// pages omit it and see just the placeholder.
export default function InfoPanel({ country, viewMode, mapMode, election }) {
  return (
    <div className="info-panel">
      <div className="info-panel__header">
        <h2 className="info-panel__country">{country}</h2>
      </div>
      <p className="info-panel__placeholder">
        {viewMode} — {mapMode}
      </p>

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

import '../styles/components/infoPanel.scss'

export default function InfoPanel({ country, viewMode, mapMode }) {
  return (
    <div className="info-panel">
      <div className="info-panel__header">
        <h2 className="info-panel__country">{country}</h2>
      </div>
      <p className="info-panel__placeholder">
        {viewMode} — {mapMode}
      </p>
    </div>
  )
}

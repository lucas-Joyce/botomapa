import '../styles/components/infoPanel.scss'

export default function InfoPanel({ country, year, data }) {
  return (
    <div className="info-panel">
      <div className="info-panel__header">
        <h2 className="info-panel__country">{country}</h2>
        <span className="info-panel__year">{year}</span>
      </div>

      {data?.parties && (
        <div className="info-panel__parties">
          {data.parties.map(party => (
            <div key={party.name} className="info-panel__party">
              <span
                className="info-panel__party-swatch"
                style={{ '--party-colour': party.colour }}
              />
              <span className="info-panel__party-name">{party.name}</span>
              <span className="info-panel__party-seats">{party.seats} seats</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

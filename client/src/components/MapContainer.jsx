import { useRef, useEffect } from 'react'
import * as d3 from 'd3'
import '../styles/components/mapContainer.scss'

export default function MapContainer({ children }) {
  const svgRef = useRef(null)
  const gRef = useRef(null)

  useEffect(() => {
    if (!svgRef.current) return

    const zoom = d3.zoom()
      .scaleExtent([1, 8])
      .on('zoom', (event) => {
        d3.select(gRef.current).attr('transform', event.transform)
      })

    d3.select(svgRef.current).call(zoom)

    return () => {
      d3.select(svgRef.current).on('.zoom', null)
    }
  }, [])

  return (
    <div className="map-container">
      <svg ref={svgRef} className="map-container__svg">
        <g ref={gRef}>{children}</g>
      </svg>
    </div>
  )
}

/server (Express + Node.js)
  /api
    /uk            → UK election data, seat counts, swing
    /usa           → US district/state results
    /philippines   → PH district/province results
    /germany       → German Bundestag results
	/france        → French results
  /data
    /geojson       → raw boundary files
    /topojson      → compressed boundary files
    /hexjson       → UK hex layout, custom hex layouts
    /processed     → cleaned election result CSVs/JSON

/client (React)
  /components
    /maps
      ChoroplethMap.jsx         → existing — standard geo map
      HexCartogram.jsx          → NEW — accepts country config object
      WaffleCartogram.jsx       → NEW — Nivo waffle wrapper
      DorlingCartogram.jsx      → STRETCH — circle/force layout
      ParliamentArc.jsx         → NEW — semicircle seat layout
    /controls
      CountrySelector.jsx
      ElectionYearSelector.jsx
      MetricSelector.jsx        → seats / swing / majority / turnout
      ColourModeToggle.jsx      → normal / colorblind-safe
    /shared
      Legend.jsx
      Tooltip.jsx
      SeatCounter.jsx
  /hooks
    useElectionData.js          → shared data fetching + caching
    useHexLayout.js             → hex position calculations
    useProjection.js            → d3-geo projection config per country
  /pages
    UK.jsx
    USA.jsx
    Philippines.jsx
    Germany.jsx
    France.jsx
  /config
    countries.js               → country config objects (hex count, projection, data path)
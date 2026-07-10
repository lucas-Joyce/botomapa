# ChoroplethMap.jsx

A D3-based choropleth map visualization component that renders election results as color-coded geographic regions.

## Props

- `country` (string): The country code (e.g., 'uk', 'france')
- `electionId` (string): The election identifier

## Usage

This component is designed to work within the MapContainer component structure, using data from `useElectionData()` hook. It follows the StrictMode contract where React owns the SVG shell and D3 owns its children.

## Implementation Details

- Uses D3.js for geographic mapping with `d3.geoPath`
- Colors constituencies based on winning party using a color scale
- Follows StrictMode contract by cleaning up before re-rendering
- Uses data join pattern (`enter/update/exit`) for efficient rendering
- Integrates with existing election data structure through `byId` Map from `useElectionData`
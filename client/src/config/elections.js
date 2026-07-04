// Elections per country, newest first, reaching back to at least 2015.
// Drives the year picker in the sidebar. Each `id` will map 1:1 to a processed
// dataset file (server/data/processed/<id>.json) once cleaning scripts land (Phase 1+).
//
// Map scope per country: constituency/state maps track the relevant tier —
// UK general, USA presidential (state), France legislative, Germany federal
// (Bundestag), Philippines general/midterm.
export const elections = {
  uk: [
    { id: 'uk-2024', year: 2024, date: '2024-07-04', type: 'General election' },
    { id: 'uk-2019', year: 2019, date: '2019-12-12', type: 'General election' },
    { id: 'uk-2017', year: 2017, date: '2017-06-08', type: 'General election' },
    { id: 'uk-2015', year: 2015, date: '2015-05-07', type: 'General election' },
  ],
  usa: [
    { id: 'usa-2024', year: 2024, date: '2024-11-05', type: 'Presidential' },
    { id: 'usa-2020', year: 2020, date: '2020-11-03', type: 'Presidential' },
    { id: 'usa-2016', year: 2016, date: '2016-11-08', type: 'Presidential' },
  ],
  france: [
    { id: 'france-2024', year: 2024, date: '2024-06-30', type: 'Legislative (snap)' },
    { id: 'france-2022', year: 2022, date: '2022-06-12', type: 'Legislative' },
    { id: 'france-2017', year: 2017, date: '2017-06-11', type: 'Legislative' },
  ],
  germany: [
    { id: 'germany-2025', year: 2025, date: '2025-02-23', type: 'Federal (Bundestag)' },
    { id: 'germany-2021', year: 2021, date: '2021-09-26', type: 'Federal (Bundestag)' },
    { id: 'germany-2017', year: 2017, date: '2017-09-24', type: 'Federal (Bundestag)' },
  ],
  philippines: [
    { id: 'philippines-2025', year: 2025, date: '2025-05-12', type: 'Midterm' },
    { id: 'philippines-2022', year: 2022, date: '2022-05-09', type: 'General' },
    { id: 'philippines-2019', year: 2019, date: '2019-05-13', type: 'Midterm' },
    { id: 'philippines-2016', year: 2016, date: '2016-05-09', type: 'General' },
  ],
}

export const electionsFor = (country) => elections[country] ?? []

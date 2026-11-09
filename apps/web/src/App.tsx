import { useState } from 'react'
import { SHIPS } from './ships'
import { Scene } from './Scene'

function App() {
  const [slug, setSlug] = useState(SHIPS[0].slug)
  const ship = SHIPS.find((s) => s.slug === slug)

  if (!ship) {
    return <p>Vaisseau introuvable</p>
  }

  return (
    <>
      <h1>StarNav</h1>
      <select value={slug} onChange={(e) => setSlug(e.target.value)}>
        {SHIPS.map((candidate) => (
          <option key={candidate.slug} value={candidate.slug}>{candidate.manufacturer} - {candidate.name}</option>
        ))}
      </select>
      <p>Capacité : {ship.cargoCapacity} SCU</p>
      <p>Nombre de grille : {ship.grids.length}</p>
      <table>
        <thead>
          <tr>
            <th>Grille</th>
            <th>Dimension</th>
            <th>Capacité</th>
            <th>Caisse max</th>
          </tr>
        </thead>
        <tbody>
          {ship.grids.map((grid) => <tr key={grid.id}>
            <td>{grid.id}</td>
            <td>{grid.size.x} x {grid.size.y} x {grid.size.z}</td>
            <td>{grid.scu}</td>
            <td>{grid.maxScuBox}</td>
          </tr>)}
        </tbody>
      </table>

      <Scene ship={ship} />
    </>
  )
}

export default App

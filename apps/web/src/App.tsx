import { useState } from "react"
import { SHIPS } from "./ships"
import { Scene } from "./Scene"

function Stat({ label, value, unit }: { label: string; value: number; unit?: string }) {
  return (
    <div className="rounded-md border border-line bg-bg/60 px-3 py-3">
      <p className="text-[10px] tracking-[0.15em] text-text/60">{label}</p>
      <p className="mt-1 font-mono text-xl tabular-nums text-text-strong">
        {value}
        {unit && <span className="ml-1 text-xs text-text/60">{unit}</span>}
      </p>
    </div>
  )
}

function App() {
  const [slug, setSlug] = useState(SHIPS[0].slug)
  const ship = SHIPS.find((s) => s.slug === slug)

  if (!ship) {
    return <p className="p-6">Vaisseau introuvable</p>
  }

  return (
    <div className="flex h-screen bg-bg text-text">
      <aside className="flex w-[22rem] shrink-0 flex-col border-r border-line bg-surface">
        <header className="border-b border-line px-6 py-5">
          <h1 className="text-2xl font-bold tracking-[0.2em] text-text-strong">
            STAR<span className="text-accent">NAV</span>
          </h1>
          <p className="mt-1 text-[10px] tracking-[0.25em] text-text/60">
            PLAN · TRADE · HAUL · OPTIMIZE
          </p>
        </header>

        <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-6">
          <section className="flex flex-col gap-2">
            <label htmlFor="ship" className="text-[11px] font-medium tracking-[0.15em] text-text/60">
              VAISSEAU
            </label>
            <select
              id="ship"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full rounded-md border border-line bg-bg px-3 py-2 text-sm text-text-strong outline-none transition focus:border-accent focus:ring-1 focus:ring-accent"
            >
              {SHIPS.map((candidate) => (
                <option key={candidate.slug} value={candidate.slug} className="bg-surface">
                  {candidate.manufacturer} — {candidate.name}
                </option>
              ))}
            </select>
          </section>

          <section className="grid grid-cols-2 gap-3">
            <Stat label="CAPACITÉ" value={ship.cargoCapacity} unit="SCU" />
            <Stat label="GRILLES" value={ship.grids.length} />
          </section>
        </div>
      </aside>

      <main className="relative flex-1">
        <Scene ship={ship} />

        <div className="pointer-events-none absolute left-8 top-8">
          <p className="text-[11px] tracking-[0.15em] text-text/60">
            {ship.manufacturer.toUpperCase()}
          </p>
          <p className="text-xl font-semibold text-text-strong">{ship.name}</p>
        </div>

        <p className="pointer-events-none absolute bottom-6 right-8 text-[11px] text-text/40">
          Clic-glisser pour tourner · Molette pour zoomer
        </p>
      </main>
    </div>
  )
}

export default App

import { type CargoGrid, type Ship } from "@starnav/shared";
import { createOccupancy, type Occupancy } from "./occupancy";
import { type Placement } from "./findPlacement";

export type GridState = { grid: CargoGrid; occ: Occupancy }
export type ShipState = { ship: Ship; grids: GridState[] }
export type ShipPlacement = Placement & { gridId: string}

export function createShipState(ship: Ship): ShipState {
    const grids = ship.grids.map((grid) => ({ grid, occ: createOccupancy(grid.size) }))
    return { ship, grids }
}
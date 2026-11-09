import { type ContainerSize, type CargoGrid, type Ship } from "@starnav/shared";
import { createOccupancy, type Occupancy } from "./occupancy";
import { findPlacement, type Placement } from "./findPlacement";

export type GridState = { grid: CargoGrid; occ: Occupancy }
export type ShipState = { ship: Ship; grids: GridState[] }
export type ShipPlacement = Placement & { gridId: string}

export function createShipState(ship: Ship): ShipState {
    const grids = ship.grids.map((grid) => ({ grid, occ: createOccupancy(grid.size) }))
    return { ship, grids }
}

export function findPlacementInShip(state: ShipState, size: ContainerSize): ShipPlacement | undefined {
    for (const gs of state.grids) {
        if (size > gs.grid.maxScuBox) {
            continue
        }

        const placementFound = findPlacement(gs.occ, size, gs.grid.maxSize)

        if (placementFound != undefined) {
            return {
                ...placementFound,
                gridId: gs.grid.id
            }
        }
    }

    return undefined
}
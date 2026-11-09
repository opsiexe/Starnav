import { CONTAINER_SIZES, type Ship } from "@starnav/shared";
import { createShipState, findPlacementInShip, placeInShip, type ShipPlacement } from "./ship";

export type LoadResult = { placements: ShipPlacement[]; loaded: number; missing: number }

export function planLoad(ship: Ship, quantity: number): LoadResult {
    const state = createShipState(ship)
    const placements: ShipPlacement[] = []
    let remaining = quantity

    const sizes = [...CONTAINER_SIZES].sort((a, b) => b - a)

    while(remaining > 0) {
        let found: ShipPlacement | undefined = undefined

        for(const size of sizes) {
            if (size > remaining) {
                continue
            } 

            found = findPlacementInShip(state, size)
            if(found !== undefined) {
                break
            }
        }

        if(found === undefined) {
            break
        }

        placeInShip(state, found)
        placements.push(found)
        remaining -= found.size
    }

    return {
        placements,
        loaded: quantity - remaining,
        missing: remaining
    }
}
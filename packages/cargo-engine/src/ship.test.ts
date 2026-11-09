import { describe, it, expect } from "vitest";
import { createShipState, findPlacementInShip, placeInShip } from "./ship";
import type { CargoGrid, Ship, Volume, ContainerSize } from "@starnav/shared";

function makeGrid(id: string, size: Volume, maxSize: Volume, maxScuBox: ContainerSize): CargoGrid {
    return {
        id,
        name: id,
        size,
        scu: size.x * size.y * size.z,
        maxScuBox,
        maxSize
    }
}

function makeShip(grids: CargoGrid[]): Ship {
    return{
        slug: "test-ship",
        name: "test-ship",
        manufacturer: "test-ship",
        cargoCapacity: grids.reduce((sum, grid) => sum + grid.scu, 0),
        grids: grids,
        wikiUuid: "test-ship"
    }
}

describe("createShipState", () => {
    it("creates one empty occupancy per grid", () => {
        const grid1 = makeGrid("grid-01", {x: 9, y: 4, z: 3}, {x: 2, y: 8, z: 2}, 32)
        const grid2 = makeGrid("grid-02", {x: 2, y: 4, z: 2}, {x: 2, y: 8, z: 2}, 32)
        const grids = [grid1, grid2]
        const ship = makeShip(grids)
        const state = createShipState(ship)

        expect(state.grids).toHaveLength(2)
        expect(state.grids[0].occ.taken.size).toBe(0)
        expect(state.grids[1].occ.taken.size).toBe(0)
        expect(state.grids[0].grid).toBe(grid1)
    })
})

describe("findPlacementInShip", () => {
    it("finds a spot and reports the grid id", () => {
        const grids = [makeGrid("grid-0", {x: 4, y: 4, z: 4}, {x: 4, y: 4, z: 4}, 16)]
        const ship = makeShip(grids)
        const state = createShipState(ship)

        expect(findPlacementInShip(state, 4)).toMatchObject({ gridId: "grid-0" })
    })

    it("rejects a container larger than the grid max container", () => {
        const grids = [makeGrid("grid-0", {x: 4, y: 4, z: 4}, {x: 4, y: 4, z: 4}, 2)]
        const ship = makeShip(grids)
        const state = createShipState(ship)
        
        expect(findPlacementInShip(state, 4)).toBeUndefined()
    })

    it("skips grids that cannot hold the container", () => {
        const grids = [makeGrid("grid-0", {x: 2, y: 4, z: 2}, {x: 2, y: 4, z: 2}, 2), makeGrid("grid-1", {x: 2, y: 4, z: 2}, {x: 2, y: 4, z: 2}, 16)]
        const ship = makeShip(grids)
        const state = createShipState(ship)

        expect(findPlacementInShip(state, 16)?.gridId).toBe("grid-1")
    })
})

describe("placeInShip", () => {
    it("marks cells only in the grid designated by the grid id", () => {
        const grids = [makeGrid("grid-0", {x: 2, y: 4, z: 2}, {x: 2, y: 4, z: 2}, 2), makeGrid("grid-1", {x: 2, y: 4, z: 2}, {x: 2, y: 4, z: 2}, 16)]
        const ship = makeShip(grids)
        const state = createShipState(ship)

        const placement = findPlacementInShip(state, 16)
        placeInShip(state, placement!)

        expect(state.grids[1].occ.taken.size).toBeGreaterThan(0)
        expect(state.grids[0].occ.taken.size).toBe(0)

        placement!
    })

    it("does not overlap containers placed with placeInShip", () => {
        const grids = [makeGrid("grid-0", {x: 2, y: 4, z: 2}, {x: 2, y: 4, z: 2}, 16),]
        const ship = makeShip(grids)
        const state = createShipState(ship)

        const placement = findPlacementInShip(state, 16)
        placeInShip(state, placement!)
        const placementNew = findPlacementInShip(state, 16)

        expect(placementNew).toBeUndefined()

        placement!
    })

    it("throws when placing in an unknown grid", () => {
        const grids = [makeGrid("grid-0", {x: 2, y: 4, z: 2}, {x: 2, y: 4, z: 2}, 16),]
        const ship = makeShip(grids)
        const state = createShipState(ship)

        const placement = { size: 24 as const, position: {x: 0, y: 0, z: 0}, dims: {x: 2, y: 2, z: 2}, gridId: "does-not-exist" }

        expect(() => placeInShip(state, placement)).toThrow()
    })
})
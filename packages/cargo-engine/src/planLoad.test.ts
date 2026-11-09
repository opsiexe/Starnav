import { type Volume, type ContainerSize, type CargoGrid, type Ship } from "@starnav/shared"
import { describe, it, expect } from "vitest"
import { planLoad } from "./planLoad"


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
        grids,
        wikiUuid: "test-ship"
    }
}

describe("planLoad", () => {
    it("loads the exact quantity when the ship has room", () => {
        const grids = [makeGrid("grid-0", {x: 4, y: 4, z: 4}, {x: 4, y: 4, z: 4}, 16)]
        const ship = makeShip(grids)
        const loadPlan = planLoad(ship, 16)

        expect(loadPlan).toMatchObject({
            loaded: 16,
            missing: 0,
        })
        expect(loadPlan.placements).toHaveLength(1)
    })

    it("uses the largest containers first", () => {
        const grids = [makeGrid("grid-0", {x: 4, y: 4, z: 4}, {x: 4, y: 4, z: 4}, 16)]
        const ship = makeShip(grids)
        const loadPlan = planLoad(ship, 20)
        
        expect(loadPlan.placements.map((p) => p.size)).toEqual([16, 4])
    })

    it("reports the missing quantity when the ship is too small", () => {
        const grids = [makeGrid("grid-0", {x: 2, y: 2, z: 2}, {x: 2, y: 2, z: 2}, 8)]
        const ship = makeShip(grids)
        const loadPlan = planLoad(ship, 12)

        expect(loadPlan).toMatchObject({
            loaded: 8,
            missing: 4
        })
    })

    it("falls back to smaller containers when larger ones are not accepted", () => {
        const grids = [makeGrid("grid-0", {x: 6, y: 1, z: 1}, {x: 6, y: 1, z: 1}, 2)]
        const ship = makeShip(grids)
        const loadPlan = planLoad(ship, 6)

        expect(loadPlan.placements).toHaveLength(3)
        expect(loadPlan).toMatchObject({
            loaded: 6,
            missing: 0,
        })
    })

    it("loads nothing for a quantity of zero", () => {
        const grids = [makeGrid("grid-0", {x: 4, y: 1, z: 1}, {x: 4, y: 1, z: 1}, 2)]
        const ship = makeShip(grids)
        const loadPlan = planLoad(ship, 0)

        expect(loadPlan).toMatchObject({
            loaded: 0,
            missing: 0,
        })
        expect(loadPlan.placements).toHaveLength(0)
    })
})
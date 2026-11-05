import { describe, it, expect } from "vitest";
import { cellsOf, createOccupancy, canPlace, place } from "./occupancy";

describe("cellsOf", () => {
    it("lists every cell covered by a container", () => {
        const expected = ["1,0,0", "2,0,0", "1,0,1", "2,0,1"]
        const cells = cellsOf({ x: 1, y: 0, z: 0 }, { x: 2, y: 1, z: 2 })
        expect(cells).toHaveLength(4)

        for(const entry of expected){
            expect(cells).toContain(entry)     
        }
    })

    it("returns a single cell for a 1x1x1 container", () => {
        const cells = cellsOf({x: 3, y: 2, z: 1}, {x: 1, y: 1, z: 1})
        expect(cells).toEqual(["3,2,1"])
    })
})

describe("createOccupancy", () => {
    it("creates an empty grid with the given size", () => {
        const size = {x: 2, y: 2, z: 1}
        const occ = createOccupancy(size)
        expect(occ.size).toEqual(size)
        expect(occ.taken.size).toBe(0)
    })

    it("creates independent grids", () => {
        const size = {x: 2, y: 2, z: 1}
        const a = createOccupancy(size)
        const b = createOccupancy(size)

        a.taken.add("0,0,0");

        expect(a.taken.size).toBe(1)
        expect(b.taken.size).toBe(0)
    })
})

describe("canPlace", () => {
    it("accepts a container in an empty grid", () => {
        const grid = createOccupancy({x: 2, y: 2, z: 2})
        expect(canPlace(grid, {x: 0, y: 0, z: 0}, {x: 1, y: 1, z: 1})).toBe(true)
    })

    it("accepts a container that fills the grid exactly", () => {
        const grid = createOccupancy({x: 2, y: 2, z: 2})
        expect(canPlace(grid, {x: 0, y: 0, z: 0}, {x: 2, y: 2, z: 2})).toBe(true)
    })

    it("rejects a container that goes past the grid limits", () => {
        const grid = createOccupancy({x: 2, y: 2, z: 2})
        expect(canPlace(grid, {x: 1, y: 0, z: 0}, {x: 2, y: 2, z: 2})).toBe(false)
    })

    it("rejects a container with a negative position", () => {
        const grid = createOccupancy({x: 2, y: 2, z: 2})
        expect(canPlace(grid, {x: -1, y: 0, z: 0}, {x: 1, y: 1, z: 1})).toBe(false)
    })

    it("accepts a container placed right next to another one", () => {
        const grid = createOccupancy({x: 4, y: 1, z: 1})
        place(grid, {x: 0, y: 0, z: 0}, {x: 2, y: 1, z: 1})
        expect(canPlace(grid,{ x: 2, y: 0, z: 0 }, {x: 2, y: 1, z: 1})).toBe(true)
    })

    it("rejects a container that overlaps an already placed one", () => {
        const grid = createOccupancy({x: 4, y: 1, z: 1})
        place(grid, {x: 0, y: 0, z: 0}, {x: 2, y: 1, z: 1})
        expect(canPlace(grid, { x: 1, y: 0, z: 0 }, {x: 2, y: 1, z: 1})).toBe(false)
    })
})

describe("place", () => {
    it("marks every cell of the container as taken", () => {
        const grid = createOccupancy({x: 2, y: 2, z: 2})
        place(grid, {x: 0, y: 0, z: 0}, {x: 2, y: 2, z: 2})
        expect(grid.taken.size).toBe(8)
    })

    it("keeps previously placed containers when placing another one", () => {
        const grid = createOccupancy({x: 2, y: 2, z: 2})
        place(grid, {x: 0, y: 0, z: 0}, {x: 1, y: 1, z: 1})
        place(grid, {x: 0, y: 1, z: 0}, {x: 2, y: 1, z: 1})
        expect(grid.taken.size).toBe(3)
    })
})
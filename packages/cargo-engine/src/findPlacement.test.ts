import { describe, it, expect } from "vitest";
import { createOccupancy, place } from "./occupancy";
import { findPlacement } from "./findPlacement"

describe("findPlacement", () => {
    it("places a container at the origin of an empty grid", () => {
        const grid = createOccupancy({x: 2, y: 2, z: 2})
        expect(findPlacement(grid, 8)).toMatchObject({position: {x: 0, y: 0, z: 0}, dims: {x: 2, y: 2, z: 2}})
    })

    it("returns undefined when the grid is full", () => {
        const grid = createOccupancy({x: 2, y: 2, z: 2})
        place(grid, {x: 0, y: 0, z: 0}, {x: 2, y: 2, z: 2})
        expect(findPlacement(grid, 1)).toBeUndefined()
    })

    it("rotates the container when the default orientation does not fit", () => {
        const grid = createOccupancy({x: 1, y: 2, z: 1})
        expect(findPlacement(grid, 2)).toMatchObject({dims: {x: 1, y: 2, z: 1}})
    })

    it("respects the grid max size", () => {
        const grid = createOccupancy({x: 4, y: 4, z: 4})
        expect(findPlacement(grid, 16, {x: 2, y: 8, z: 2})).toMatchObject({dims: {x: 2, y: 4, z: 2}})
    })

    it("finds the next free spot after a placed container", () => {
        const grid = createOccupancy({x: 4, y: 1, z: 1})
        place(grid, {x: 0, y: 0, z: 0}, {x: 2, y: 1, z: 1})
        expect(findPlacement(grid, 2)).toMatchObject({position: {x: 2, y: 0, z: 0}})
    })
})
import { describe, it, expect } from "vitest";
import { cellsOf } from "./occupancy";

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
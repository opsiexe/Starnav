import { expect, it, describe } from "vitest"
import { orientations } from "./orientations"

describe("orientations", () => {
    it("returns a single orientation for a 1 SCU container", () => {
        expect(orientations(1)).toEqual([{ x: 1, y: 1, z: 1 }])
    })

    it("returns three orientations for a 2 SCU container", () => {
        expect(orientations(2)).toHaveLength(3)
    })

    it("includes the lengthwise orientation of a 2 SCU container", () => {
        expect(orientations(2)).toContainEqual({x: 2, y: 1, z: 1})
    })

    it("returns a single orientation for a cubic 8 SCU container", () => {
        expect(orientations(8)).toEqual([{x: 2, y: 2, z: 2}])
    })

    it("returns three orientations for a 16 SCU container", () => {
        expect(orientations(16)).toHaveLength(3)
    })

    it("only allows a 32 SCU container lengthwise in a 2x8x2 grid", () => {
        expect(orientations(32, { x: 2, y: 8, z: 2})).toEqual([{ x: 2, y: 8, z: 2}])
    })

    it("only allows one orientation for a 16 SCU container in a 2x8x2 grid", () => {
        expect(orientations(16, { x: 2, y: 8, z: 2 })).toEqual([{ x: 2, y: 4, z: 2 }])
    })

    it("only allows one orientation for a 24 SCU container in a 2x8x2 grid", () => {
        expect(orientations(24, { x: 2, y: 8, z: 2 })).toEqual([{ x: 2, y: 6, z: 2 }])
    })

    it("allows a 2 SCU container in a 2x1x1 grid", () => {
        expect(orientations(2, { x: 2, y: 1, z: 1 })).toEqual([{ x: 2, y: 1, z: 1 }])
    })

    it("returns no orientation when the container is too big for the grid", () => {
        expect(orientations(4, { x: 2, y: 1, z: 1 })).toEqual([])
    })
})


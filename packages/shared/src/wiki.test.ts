import { describe, expect, it } from "vitest"
import { type RawGrid, RawShip, convertGrid, normalizeShip } from "./wiki"

const validGrid: RawGrid = {
    "width": 5,
    "height": 3.75,
    "length": 11.25,
    "scu": 108,
    "max_scu_box": 16,
    "max_size": {
        x: 2.5,
        y: 10,
        z: 2.5
    }
}

const validRawShip: RawShip ={
    "slug": "test-ship",
    "name": "Test Ship",
    "manufacturer": {
        "name": "Test Manufacturer"
    },
    "uuid": "ship-uuid-1",
    "cargo_capacity": 114,
    "cargo_grids": [
        validGrid,
        {
            "width": 2.5,
            "height": 3.75,
            "length": 1.25,
            "scu": 6,
            "max_scu_box": 2,
            "max_size": {
                x: 2.5,
                y: 1.25,
                z: 1.25
            }
        },
    ]
}

describe("convertGrid", () => {
    it("converts meters to cells and builds the grid id", () => {
        expect(convertGrid(validGrid, 0)).toMatchObject({
            "size": {
                x: 4,
                y: 9,
                z: 3
            },
            "maxSize": {
                x: 2,
                y: 8,
                z: 2
            },
            "id": "grid-0"
        })
    })

    it("throws when scu does not match the grid volume", () => {
        expect(() => convertGrid({ ...validGrid, scu: 100 }, 0)).toThrow("Mismatch")
    })

    it("throws when max_scu_box is not a valid container size", () => {
        expect(() => convertGrid({ ...validGrid, max_scu_box: 5}, 0)).toThrow("max_scu_box")
    })

    it("throws when a dimension is not a multiple of the cell size", () => {
        expect(() => convertGrid({ ...validGrid, width: 1.3}, 0)).toThrow("invalid value")
    })
});

describe("normalizeShip", () => {
    it("maps the raw ship fields to a Ship", () => {

        const ship = normalizeShip(validRawShip)

        expect(ship).toMatchObject({
            "slug": "test-ship",
            "name": "Test Ship",
            "cargoCapacity": 114,
            "manufacturer": "Test Manufacturer",
            "wikiUuid": "ship-uuid-1",
        });

        expect(ship.grids).toHaveLength(2)

        expect(ship.grids.map(g => g.id)).toEqual(["grid-0", "grid-1"])

    })

    it("throws when grid scu do not add up to cargo_capacity", () => {
        expect(() => normalizeShip({...validRawShip, cargo_capacity: 999})).toThrow("test-ship")
    })
})
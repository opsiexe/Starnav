import { readdirSync, readFileSync } from "node:fs";
import { describe, it, expect } from "vitest";
import type { Ship } from "./types";
import { isContainerSize } from "./containers";

const folder =  "../../data/ships"

const ships = readdirSync(folder).filter((file) => file.endsWith(".json")).map((file) => {
    const text = readFileSync(`${folder}/${file}`, "utf-8");
    return {
        file: file, ship: JSON.parse(text) as Ship 
    };
})

describe("ships data", () => {
    it("contains exactly the starter ships", () => {
        const slugs = ships.map((ship) => ship.ship.slug)
        const slugsExpected = ["misc-freelancer-max", "drak-caterpillar", "rsi-constellation-taurus", "misc-hull-a", "drak-cutlass-black"] 

        expect(slugs.sort()).toEqual(slugsExpected.sort())
    })

    it("has a file name matching the ship slug", () => {
        for(const entry of ships){
            expect(`${entry.ship.slug}.json`, entry.file).toBe(entry.file)
        }
    })

    it("has grid scu adding up to the cargo capacity", () => {
        for(const entry of ships){
            let sum = 0
            for(const grid of entry.ship.grids){
                sum += grid.scu
            }
            expect(sum, entry.file).toBe(entry.ship.cargoCapacity)
        }
    })

    it("has a volume equal to scu for every grid", () => {
        for(const entry of ships){
            for(const grid of entry.ship.grids){
                expect(grid.size.x * grid.size.y * grid.size.z, `${entry.file} ${grid.id}`).toBe(grid.scu)
            }
        }
    })

    it("has a valid max container size for every grid", () => {
        for(const entry of ships){
            for(const grid of entry.ship.grids){
                expect(isContainerSize(grid.maxScuBox), `${entry.file} ${grid.id}`).toBe(true)
            }
        }
    })

    it("has unique grid ids within each ship", () => {
        for(const entry of ships){
            const ids = entry.ship.grids.map((grid) => grid.id)
            expect(new Set(ids).size, entry.file).toBe(ids.length)
        }
    })
})
import { readdirSync, readFileSync } from "node:fs";
import { describe, it, expect } from "vitest";
import type { Ship } from "./types";

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
})
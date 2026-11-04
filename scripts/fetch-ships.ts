import { normalizeShip } from "../packages/shared/src/wiki";
import { mkdirSync, writeFileSync } from "node:fs";

const slugs = ["misc-freelancer-max", "drak-caterpill", "rsi-constellation-taurus", "misc-hull-a", "drak-cutlass-black"] 

async function main() {
    mkdirSync("data/ships", { recursive: true })

    let failure = 0

    for(const slug of slugs) {
        try {
            const response = await fetch(`https://api.star-citizen.wiki/api/vehicles/${slug}`)

            if(!response.ok) {
                throw new Error(`${response.status}`)
            }
            const json = await response.json()
            const ship = normalizeShip(json.data)
            writeFileSync(`data/ships/${slug}.json`, JSON.stringify(ship, null, 2) + "\n")
            
            console.log(`${ship.slug} - ok`);
        } catch(error) {
            console.error(`failed : ${slug}`, error instanceof Error ? error.message : error);
            failure += 1
        }
    }

    console.log(`Ship data retrieval, ${slugs.length - failure} out of ${slugs.length} successful !`)

    if(failure > 0) {
        process.exitCode = 1
    }
}

main()
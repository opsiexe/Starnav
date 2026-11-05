import type { ContainerSize, Volume } from "@starnav/shared" ;
import { canPlace, type Occupancy } from "./occupancy";
import { orientations } from "./orientations";

export type Placement = { size: ContainerSize; position: Volume; dims: Volume }

export function findPlacement(occ: Occupancy, size: ContainerSize, maxSize?: Volume): Placement | undefined {
    for(const dims of orientations(size, maxSize)) {
        for(let z = 0; z < occ.size.z; z++) {
            for(let y = 0; y < occ.size.y; y++) {
                for(let x =  0; x < occ.size.x; x++) {
                    const position = {x: x, y: y, z: z}
                    if(canPlace(occ, position, dims)) {
                        return {size, position, dims}
                    }
                }
            }
        }
    }

    return undefined
}
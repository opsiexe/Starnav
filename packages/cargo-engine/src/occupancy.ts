import type { Volume } from "@starnav/shared"

export type Occupancy = { size: Volume, taken: Set<string> }

export function cellsOf(position: Volume, dims: Volume): string[] {
    const keys: string[] = []

    for(let i = 0; i < dims.x; i++){
        for(let j = 0; j < dims.y; j++){
            for(let k = 0; k < dims.z; k++){
                keys.push(`${position.x + i},${position.y + j},${position.z + k}`)
            }
        }
    }

    return keys
}
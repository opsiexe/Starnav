import type { Volume } from "@starnav/shared"

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

export type Occupancy = { size: Volume, taken: Set<string> }

export function createOccupancy(size: Volume): Occupancy {
    return {
        size: size,
        taken: new Set<string>()
    }
}

export function canPlace(occ: Occupancy, position: Volume, dims: Volume): boolean {
    if(position.x < 0 || position.y < 0 || position.z < 0 || position.x + dims.x > occ.size.x || position.y + dims.y > occ.size.y || position.z + dims.z > occ.size.z){
        return false
    }

    for(const key of cellsOf(position, dims)){
        if(occ.taken.has(key)){
            return false
        }
    }

    return true
}

export function place(occ: Occupancy, position: Volume, dims: Volume): void {
    for(const key of cellsOf(position, dims)) {
        occ.taken.add(key)
    }
}
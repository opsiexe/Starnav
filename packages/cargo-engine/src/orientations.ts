import type { ContainerSize, Volume } from "@starnav/shared";
import { CONTAINER_DIMENSION } from "@starnav/shared";

export function orientations(size: ContainerSize, maxSize?: Volume): Volume[] {
    const { x, y ,z } = CONTAINER_DIMENSION[size]

    const candidates = [
        {x: x, y: y, z: z},
        {x: x, y: z, z: y},
        {x: y, y: x, z: z},
        {x: y, y: z, z: x},
        {x: z, y: y, z: x},
        {x: z, y: x, z: y},
    ]

    const seen = new Set<string>()
    const unique: Volume[] = []

    for(const candidate of candidates){
        const cle = `${candidate.x},${candidate.y},${candidate.z}`

        if(!seen.has(cle)){
            seen.add(cle)
            unique.push(candidate)
        }
    }

    if(!maxSize){
        return unique
    }
    
    return unique.filter((orientation) => orientation.x <= maxSize.x && orientation.y <= maxSize.y && orientation.z <= maxSize.z)
}
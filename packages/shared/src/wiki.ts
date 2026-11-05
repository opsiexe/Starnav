import { type Volume, isContainerSize } from "./containers";
import type { CargoGrid, Ship } from "./types";

export const CELL_SIZE_M: number = 1.25


export type RawGrid = {
    "width": number,
    "height": number,
    "length": number,
    "scu": number,
    "max_scu_box": number,
    "max_size": Volume,
}

type Manufacturer = {
    "name": string,
}

export type RawShip = {
    "slug": string,
    "name": string,
    "manufacturer": Manufacturer,
    "uuid": string,
    "cargo_capacity": number,
    "cargo_grids": RawGrid[]
}

function metersToCells(size: number): number {
    const cell = size/CELL_SIZE_M

    if(!Number.isInteger(cell)) {
        throw new Error(`invalid value : ${size}`)
    } else {
        return cell
    }
}

export function convertGrid(rawGrid: RawGrid, index: number): CargoGrid {

    if(!isContainerSize(rawGrid.max_scu_box)) {
        throw new Error(`Invalid value for max_scu_box for grid-${index}: ${rawGrid.max_scu_box}`)
    }

    const cargoGridConverted = {
        "id": `grid-${index}`,
        "name": `grid-${index}`,
        "size": {
            "x": metersToCells(rawGrid.width),
            "y": metersToCells(rawGrid.length),
            "z": metersToCells(rawGrid.height),
        },
        "scu": rawGrid.scu,
        "maxScuBox": rawGrid.max_scu_box,
        "maxSize": {
            "x": metersToCells(rawGrid.max_size.x),
            "y": metersToCells(rawGrid.max_size.y),
            "z": metersToCells(rawGrid.max_size.z),
        }
    }

    const computedScuSize = cargoGridConverted.size.x * cargoGridConverted.size.y * cargoGridConverted.size.z

    if(computedScuSize !== cargoGridConverted.scu) {
                throw new Error(`Mismatch between size and scu. value for grid-${index}: ${computedScuSize} != ${cargoGridConverted.scu}`)

    }

    return cargoGridConverted
}

export function normalizeShip(rawShip: RawShip): Ship {
    const grids = rawShip.cargo_grids.map(convertGrid);
    let computedTotalScu = 0

    for(const grid of grids) {
        computedTotalScu += grid.scu
    }

    if(computedTotalScu !== rawShip.cargo_capacity) {
        throw new Error(`Mismatch between computedTotalScu and theorical value for ${rawShip.slug}: ${computedTotalScu} != ${rawShip.cargo_capacity}`)
    }

    const normalizedShip = {
        "slug": rawShip.slug,
        "name": rawShip.name,
        "manufacturer": rawShip.manufacturer.name,
        "wikiUuid": rawShip.uuid,
        "cargoCapacity": rawShip.cargo_capacity,
        "grids": grids,
    }

    return normalizedShip
}

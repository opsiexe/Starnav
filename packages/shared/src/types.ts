import type { ContainerSize, Volume } from "./containers";

export const ACCESS_SIZE = ["back", "left", "right", "top", "bottom"] as const;
export type AccessSize = (typeof ACCESS_SIZE)[number];

export type CargoGrid = {
    uuid: string,
    name: string,
    size: Volume,
    scu: number,
    maxScuBox: ContainerSize,
    maxSize: Volume,
    accessSide?: AccessSize
}

export type Ship = {
    slug: string,
    name: string,
    manufacturer: string,
    wikiUuid: string,
    uexId?: number,
    cargoCapacity: number,
    grids: CargoGrid[]
}
export type Volume = {x: number, y: number, z: number};

export const CONTAINER_SIZES = [1, 2, 4, 8, 16, 24, 32] as const;
export type ContainerSize = (typeof CONTAINER_SIZES)[number];

export const FORMES: Record<ContainerSize, Volume> = {
    1: {x: 1, y: 1, z: 1},
    2: {x: 2, y: 1, z: 1},
    4: {x: 2, y: 1, z: 2},
    8: {x: 2, y: 2, z: 2},
    16: {x: 2, y: 4, z: 2},
    24: {x: 2, y: 6, z: 2},
    32: {x: 2, y: 8, z: 2}
};

export function isContainerSize(value: number): value is ContainerSize {
    return (CONTAINER_SIZES as readonly number[]).includes(value);
}
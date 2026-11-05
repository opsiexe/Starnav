import { describe, it, expect } from "vitest";
import { CONTAINER_SIZES, CONTAINER_DIMENSION, isContainerSize } from "./containers";

describe("container dimensions", () => {
    it("has dimensions whose volume equals the container size", () => {
        for(const containerSize of CONTAINER_SIZES) {
            const dimensions = CONTAINER_DIMENSION[containerSize]
            const volume = dimensions.x * dimensions.y * dimensions.z
            expect(volume).toBe(containerSize)
        }
    });
});

describe('isContainerSize', () => {
    it("accepts a valid container size", () => {
        expect(isContainerSize(16)).toBe(true)
    });
    
    it("rejects a value that is not a container size", () => {
        expect(isContainerSize(5)).toBe(false)
    })
})

import { OrbitControls, Edges } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import type { Ship, CargoGrid } from "@starnav/shared";

const GAP = 2;

function layoutGrids(ship: Ship): { grid: CargoGrid; offsetX: number}[] {
    const result: { grid: CargoGrid; offsetX: number}[] = []
    let offset = 0 

    for(const grid of ship.grids) {
        result.push({ grid, offsetX: offset})
        offset += grid.size.x + GAP
    }

    return result
}

export function Scene({ ship }: { ship: Ship }) {

    const placed = layoutGrids(ship)
    return (
    <Canvas style={{ height: 500 }} camera={{ position: [30, 30, 30] }}>
        <ambientLight intensity={0.6}/>
        <directionalLight position={[5, 10, 5]}/>
        <gridHelper args={[50, 50]} />
        {placed.map(({grid, offsetX}) => <mesh key={grid.id} position={[grid.size.x/2 + offsetX, grid.size.z/2, grid.size.y/2]}>
            <boxGeometry args={[grid.size.x, grid.size.z, grid.size.y]} />
            <meshBasicMaterial transparent opacity={0.05} color="white" />
            <Edges color="#00bfff" />
        </mesh>)}
        
        <OrbitControls/>
    </Canvas>
    ) 
}
import { OrbitControls, Edges } from "@react-three/drei"
import { Canvas } from "@react-three/fiber"
import type { Ship, CargoGrid } from "@starnav/shared"

// Repere : x = largeur, y = longueur, z = hauteur dans nos donnees.
// Three.js utilise y comme hauteur, donc on permute y et z au rendu.
const GAP = 2

function layoutGrids(ship: Ship): { items: { grid: CargoGrid; offsetX: number }[]; totalWidth: number } {
    const items: { grid: CargoGrid; offsetX: number }[] = []
    let offset = 0

    for (const grid of ship.grids) {
        items.push({ grid, offsetX: offset })
        offset += grid.size.x + GAP
    }

    return { items, totalWidth: Math.max(0, offset - GAP) }
}

export function Scene({ ship }: { ship: Ship }) {
    const { items, totalWidth } = layoutGrids(ship)

    return (
        <Canvas className="h-full w-full" camera={{ position: [32, 26, 36], fov: 45 }}>
            <ambientLight intensity={0.7} />
            <directionalLight position={[12, 20, 10]} intensity={1.2} />
            <gridHelper args={[160, 80, "#1C2A3A", "#101A26"]} />

            {items.map(({ grid, offsetX }) => (
                <mesh
                    key={grid.id}
                    position={[offsetX + grid.size.x / 2 - totalWidth / 2, grid.size.z / 2, 0]}
                >
                    <boxGeometry args={[grid.size.x, grid.size.z, grid.size.y]} />
                    <meshBasicMaterial transparent opacity={0.06} color="#29B6F6" />
                    <Edges color="#29B6F6" />
                </mesh>
            ))}

            <OrbitControls makeDefault />
        </Canvas>
    )
}

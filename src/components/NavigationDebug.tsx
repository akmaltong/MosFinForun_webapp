import { useEffect, useState } from 'react'
import { navNodes } from '../utils/navigation'

export function NavigationDebug() {
    // const { scene } = useThree()

    // Force re-render periodically to catch when navMesh is ready
    const [, setTick] = useState(0)
    useEffect(() => {
        const interval = setInterval(() => setTick(t => t + 1), 2000)
        return () => clearInterval(interval)
    }, [])

    /*
    // Create geometry for NavMesh visualization
    const navMeshGeometry = useMemo(() => {
        if (navMeshTriangles.length === 0) return null

        const positions: number[] = []
        navMeshTriangles.forEach(tri => {
            positions.push(tri.a.x, tri.a.y, tri.a.z)
            positions.push(tri.b.x, tri.b.y, tri.b.z)
            positions.push(tri.c.x, tri.c.y, tri.c.z)

            // Add closing line to loop the triangle visually (a-b, b-c, c-a)
            // Actually TRIANGLES draw mode fills it. For wireframe edge loop:
            positions.push(tri.a.x, tri.a.y, tri.a.z)
        })

        const geo = new THREE.BufferGeometry()
        geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
        geo.computeVertexNormals()
        return geo
    }, [navMeshTriangles.length])
    */

    return (
        <group>
            {/* Visual NavMesh (Purple Wireframe) - Disabled to save GPU
            {navMeshGeometry && (
                <mesh geometry={navMeshGeometry}>
                    <meshBasicMaterial color="#a020f0" wireframe transparent opacity={0.5} depthTest={false} />
                </mesh>
            )}
            */}

            {/* Draw Nodes (Old Graph - Optional, keep for reference) */}
            {navNodes.map(node => (
                <mesh key={node.id} position={node.position}>
                    <sphereGeometry args={[0.3, 16, 16]} />
                    <meshBasicMaterial color="#0088ff" transparent opacity={0.8} depthTest={false} />
                </mesh>
            ))}
        </group>
    )
}


import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

export interface NavMeshTriangle {
    id: number
    a: THREE.Vector3
    b: THREE.Vector3
    c: THREE.Vector3
    center: THREE.Vector3
    neighbors: number[] // indices of neighbor triangles
}

export let navMeshTriangles: NavMeshTriangle[] = []
let navMeshGraphReady = false

export function loadNavMesh(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const loader = new GLTFLoader()
        loader.load(url, (gltf) => {
            let foundMesh: THREE.Mesh | null = null
            gltf.scene.traverse((child) => {
                if (!foundMesh && child instanceof THREE.Mesh) {
                    foundMesh = child
                }
            })

            if (!foundMesh?.geometry) {
                console.error('❌ NavMesh loading failed: No mesh found in GLB')
                reject('No mesh found')
                return
            }

            // Assign to strongly typed variable for use
            const mesh: THREE.Mesh = foundMesh

            console.log('✅ NavMesh loaded from GLB')
            buildNavGraph(mesh.geometry)
            navMeshGraphReady = true
            resolve()
        }, undefined, (err) => {
            console.error('❌ Error loading NavMesh:', err)
            reject(err)
        })
    })
}

function buildNavGraph(geometry: THREE.BufferGeometry) {
    navMeshTriangles = []

    // Ensure we have position attribute
    const posAttr = geometry.attributes.position
    const indexAttr = geometry.index

    if (!posAttr) return

    // Helper to get vertex
    const getVertex = (i: number) => new THREE.Vector3().fromBufferAttribute(posAttr, i)

    // Extract triangles
    let triangleCount = 0

    if (indexAttr) {
        for (let i = 0; i < indexAttr.count; i += 3) {
            const a = getVertex(indexAttr.getX(i))
            const b = getVertex(indexAttr.getX(i + 1))
            const c = getVertex(indexAttr.getX(i + 2))

            const center = new THREE.Vector3().add(a).add(b).add(c).divideScalar(3)

            navMeshTriangles.push({
                id: triangleCount++,
                a, b, c,
                center,
                neighbors: []
            })
        }
    } else {
        // Non-indexed geometry
        for (let i = 0; i < posAttr.count; i += 3) {
            const a = getVertex(i)
            const b = getVertex(i + 1)
            const c = getVertex(i + 2)

            const center = new THREE.Vector3().add(a).add(b).add(c).divideScalar(3)

            navMeshTriangles.push({
                id: triangleCount++,
                a, b, c,
                center,
                neighbors: []
            })
        }
    }

    // Optimization: Use vertex map to find neighbors in O(N) instead of O(N^2)
    const vertexToTriangles = new Map<string, number[]>()

    // Hash function for vertex position (quantized)
    const hashVertex = (v: THREE.Vector3) => {
        const p = 100 // precision 0.01
        return `${Math.round(v.x * p)},${Math.round(v.y * p)},${Math.round(v.z * p)}`
    }

    // Map vertices to triangles
    navMeshTriangles.forEach(tri => {
        const verts = [tri.a, tri.b, tri.c]
        verts.forEach(v => {
            const key = hashVertex(v)
            if (!vertexToTriangles.has(key)) vertexToTriangles.set(key, [])
            vertexToTriangles.get(key)!.push(tri.id)
        })
    })

    console.log(`🌐 Building NavMesh graph for ${navMeshTriangles.length} triangles using optimized vertex map...`)

    // Build neighbors
    navMeshTriangles.forEach(tri => {
        const potentialNeighbors = new Map<number, number>() // neighborId -> sharedVerticesCount

        const verts = [tri.a, tri.b, tri.c]
        verts.forEach(v => {
            const key = hashVertex(v)
            const sharingTris = vertexToTriangles.get(key)
            if (sharingTris) {
                sharingTris.forEach(otherId => {
                    if (otherId !== tri.id) {
                        potentialNeighbors.set(otherId, (potentialNeighbors.get(otherId) || 0) + 1)
                    }
                })
            }
        })

        // If shared 2 vertices (an edge), it's a neighbor
        potentialNeighbors.forEach((count, otherId) => {
            if (count >= 2) {
                tri.neighbors.push(otherId)
            }
        })
    })

    console.log('✅ NavMesh Graph built!')
}

// Removed countSharedVertices helper as it is no longer needed
// function countSharedVertices(t1: NavMeshTriangle, t2: NavMeshTriangle, tol: number): number { ... }

const SPATIAL_CELL_SIZE = 5 // 5 meters cell size
const spatialHash = new Map<string, number[]>()

function hashPos(x: number, z: number) {
    return `${Math.floor(x / SPATIAL_CELL_SIZE)},${Math.floor(z / SPATIAL_CELL_SIZE)}`
}

function buildSpatialIndex() {
    spatialHash.clear()
    navMeshTriangles.forEach(tri => {
        // Add to buckets covered by bounding box
        const minX = Math.min(tri.a.x, tri.b.x, tri.c.x)
        const maxX = Math.max(tri.a.x, tri.b.x, tri.c.x)
        const minZ = Math.min(tri.a.z, tri.b.z, tri.c.z)
        const maxZ = Math.max(tri.a.z, tri.b.z, tri.c.z)

        const startX = Math.floor(minX / SPATIAL_CELL_SIZE)
        const endX = Math.floor(maxX / SPATIAL_CELL_SIZE)
        const startZ = Math.floor(minZ / SPATIAL_CELL_SIZE)
        const endZ = Math.floor(maxZ / SPATIAL_CELL_SIZE)

        for (let x = startX; x <= endX; x++) {
            for (let z = startZ; z <= endZ; z++) {
                const key = `${x},${z}`
                if (!spatialHash.has(key)) spatialHash.set(key, [])
                spatialHash.get(key)!.push(tri.id)
            }
        }
    })
    console.log(`spatial index built with cell size ${SPATIAL_CELL_SIZE}`)
}

export function findStartTriangle(pos: THREE.Vector3): number {
    if (!navMeshGraphReady) return -1

    // Lazy build index if needed
    if (spatialHash.size === 0 && navMeshTriangles.length > 0) {
        buildSpatialIndex()
    }

    const key = hashPos(pos.x, pos.z)
    const candidates = spatialHash.get(key) || []

    // Expand search to neighboring cells if no candidates
    let searchList = candidates.length > 0 ? candidates : []
    
    if (searchList.length === 0) {
        // Search neighboring cells
        for (let dx = -1; dx <= 1; dx++) {
            for (let dz = -1; dz <= 1; dz++) {
                const neighborKey = hashPos(pos.x + dx * 10, pos.z + dz * 10)
                const neighborCandidates = spatialHash.get(neighborKey) || []
                searchList.push(...neighborCandidates)
            }
        }
    }

    // Fallback to full search if still empty
    if (searchList.length === 0) {
        searchList = navMeshTriangles.map(t => t.id)
    }

    let closestId = -1
    let minDist = Infinity

    // Search all candidates and find closest
    for (const id of searchList) {
        const tri = navMeshTriangles[id]
        const dist = pos.distanceToSquared(tri.center)
        if (dist < minDist) {
            minDist = dist
            closestId = tri.id
        }
    }

    return closestId
}

export function findPathOnNavMesh(startPos: THREE.Vector3, endPos: THREE.Vector3): THREE.Vector3[] {
    if (!navMeshGraphReady) return []

    const startId = findStartTriangle(startPos)
    const endId = findStartTriangle(endPos)

    if (startId === -1 || endId === -1) {
        console.warn('⚠️ Start or end position not on NavMesh, using direct line')
        return [endPos]
    }
    
    if (startId === endId) return [endPos]

    // Project start and end positions to NavMesh surface
    const startTriangle = navMeshTriangles[startId]
    const endTriangle = navMeshTriangles[endId]
    
    const projectedStart = startTriangle.center.clone()
    const projectedEnd = endTriangle.center.clone()

    // A* Search over triangles
    const openSet = new Set<number>([startId])
    const cameFrom = new Map<number, number>()

    const gScore = new Map<number, number>()
    gScore.set(startId, 0)

    const fScore = new Map<number, number>()
    fScore.set(startId, projectedStart.distanceTo(projectedEnd))

    let iterations = 0
    const MAX_ITERATIONS = 500
    console.time('NavMesh Pathfinding')

    while (openSet.size > 0) {
        iterations++
        if (iterations > MAX_ITERATIONS) {
            console.timeEnd('NavMesh Pathfinding')
            console.warn(`⚠️ Pathfinding aborted: exceeded ${MAX_ITERATIONS} iterations.`)
            break
        }

        // Find node with lowest fScore
        let currentId = -1
        let minF = Infinity

        for (const id of openSet) {
            const f = fScore.get(id) || Infinity
            if (f < minF) {
                minF = f
                currentId = id
            }
        }

        if (currentId === endId) {
            console.timeEnd('NavMesh Pathfinding')
            console.log(`✅ Path found in ${iterations} iterations.`)
            // Reconstruct path
            const pathIds = [currentId]
            let pathSafety = 0

            // Reconstruct backwards until we hit startId or run out
            while (currentId !== startId && cameFrom.has(currentId)) {
                if (pathSafety++ > 5000) {
                    console.warn('⚠️ Path reconstruction infinite loop detected!')
                    break
                }
                currentId = cameFrom.get(currentId)!
                pathIds.unshift(currentId)
            }

            // Verify start
            if (pathIds[0] !== startId) {
                if (currentId === startId) {
                    pathIds.unshift(currentId)
                }
            }

            // Convert triangle centers to points
            const points = pathIds.map(id => navMeshTriangles[id].center.clone())

            // Add exact end
            points.push(endPos)

            return points
        }

        openSet.delete(currentId)

        const currentTri = navMeshTriangles[currentId]
        for (const neighborId of currentTri.neighbors) {
            // CRITICAL FIX: Do not allow going back to startId directly
            if (neighborId === startId) continue

            const tentativeG = (gScore.get(currentId) || 0) +
                currentTri.center.distanceTo(navMeshTriangles[neighborId].center)

            if (tentativeG < (gScore.get(neighborId) || Infinity)) {
                cameFrom.set(neighborId, currentId)
                gScore.set(neighborId, tentativeG)
                fScore.set(neighborId, tentativeG + navMeshTriangles[neighborId].center.distanceTo(navMeshTriangles[endId].center))

                openSet.add(neighborId)
            }
        }
    }

    console.warn(`⚠️ No path found after ${iterations} iterations (Search exhausted).`)
    return [] // No path found
}

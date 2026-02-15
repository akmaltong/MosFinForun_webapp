import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
// @ts-ignore
import { NavMesh, Polygon, Vector3 as YukaVector3 } from 'yuka'

let navMesh: any = null
let navMeshReady = false

export function loadNavMesh(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const loader = new GLTFLoader()
        loader.load(url, (gltf) => {
            let foundMesh: THREE.Mesh | undefined
            
            gltf.scene.traverse((child) => {
                if (!foundMesh && child instanceof THREE.Mesh) {
                    foundMesh = child
                }
            })

            if (!foundMesh) {
                console.error('❌ NavMesh loading failed: No mesh found')
                reject('No mesh found')
                return
            }

            const geometry = foundMesh.geometry
            console.log('✅ NavMesh GLB loaded')
            console.log('   Vertices:', geometry.attributes.position?.count || 0)
            console.log('   Indexed:', !!geometry.index)
            
            try {
                // Парсим геометрию точно как NavMeshLoader из Yuka
                const polygons = parseGeometry(geometry)
                console.log('   Polygons:', polygons.length)
                
                // Создаём NavMesh из полигонов
                navMesh = new NavMesh()
                navMesh.fromPolygons(polygons)
                
                // Apply penalties to conference hall regions to avoid routing through them
                applyConferenceHallPenalties(navMesh)

                navMeshReady = true
                console.log('✅ Yuka NavMesh built')
                console.log('   Regions:', navMesh.regions.length)
                console.log('   Graph nodes:', navMesh.graph.getNodeCount())
                
                // Выводим диапазон высот регионов
                let minY = Infinity, maxY = -Infinity
                for (const region of navMesh.regions) {
                    const y = region.centroid.y
                    if (y < minY) minY = y
                    if (y > maxY) maxY = y
                }
                console.log(`   Height range: Y=${minY.toFixed(2)} to Y=${maxY.toFixed(2)}`)
                
                // Считаем регионы выше 0.5
                let elevated = 0
                for (const region of navMesh.regions) {
                    if (region.centroid.y > 0.5) elevated++
                }
                console.log(`   Elevated regions (Y>0.5): ${elevated} of ${navMesh.regions.length}`)
                resolve()
            } catch (err) {
                console.error('❌ Failed to build Yuka NavMesh:', err)
                reject(err)
            }
        }, undefined, (err) => {
            console.error('❌ Error loading NavMesh GLB:', err)
            reject(err)
        })
    })
}

// Парсим BufferGeometry в массив Yuka Polygon - точно как в NavMeshLoader
function parseGeometry(geometry: THREE.BufferGeometry): any[] {
    const posAttr = geometry.attributes.position
    const indexAttr = geometry.index
    
    // Собираем вершины как Yuka Vector3
    const vertices: any[] = []
    for (let i = 0; i < posAttr.count; i++) {
        const v = new YukaVector3()
        v.x = posAttr.getX(i)
        v.y = posAttr.getY(i)
        v.z = posAttr.getZ(i)
        vertices.push(v)
    }
    
    // Создаём полигоны из треугольников
    const polygons: any[] = []
    
    if (indexAttr) {
        // Indexed geometry
        for (let i = 0; i < indexAttr.count; i += 3) {
            const a = indexAttr.getX(i)
            const b = indexAttr.getX(i + 1)
            const c = indexAttr.getX(i + 2)
            
            const contour = [vertices[a], vertices[b], vertices[c]]
            const polygon = new Polygon().fromContour(contour)
            polygons.push(polygon)
        }
    } else {
        // Non-indexed geometry
        for (let i = 0; i < vertices.length; i += 3) {
            const contour = [vertices[i], vertices[i + 1], vertices[i + 2]]
            const polygon = new Polygon().fromContour(contour)
            polygons.push(polygon)
        }
    }
    
    return polygons
}

export function findPathOnNavMesh(startPos: THREE.Vector3, endPos: THREE.Vector3): THREE.Vector3[] {
    if (!navMeshReady || !navMesh) {
        console.warn('⚠️ NavMesh not ready')
        return []
    }

    try {
        const from = new YukaVector3(startPos.x, startPos.y, startPos.z)
        const to = new YukaVector3(endPos.x, endPos.y, endPos.z)
        
        console.log(`🔍 Yuka Pathfinding:`)
        console.log(`   From: [${startPos.x.toFixed(1)}, ${startPos.y.toFixed(1)}, ${startPos.z.toFixed(1)}]`)
        console.log(`   To: [${endPos.x.toFixed(1)}, ${endPos.y.toFixed(1)}, ${endPos.z.toFixed(1)}]`)
        
        const path = navMesh.findPath(from, to)
        
        if (!path || path.length === 0) {
            console.warn('⚠️ No path found')
            return [endPos]
        }

        console.log(`✅ Path: ${path.length} points`)
        
        const threePath = path.map((p: any) => new THREE.Vector3(p.x, p.y, p.z))
        
        // Выводим все точки пути с высотой
        threePath.forEach((p: THREE.Vector3, i: number) => {
            console.log(`   [${i}]: x=${p.x.toFixed(1)}, Y=${p.y.toFixed(2)}, z=${p.z.toFixed(1)}`)
        })
        
        return threePath
    } catch (error) {
        console.error('❌ Pathfinding error:', error)
        return [endPos]
    }
}

/**
 * Increase edge costs for regions inside conference halls so pathfinding
 * prefers the main corridor instead of cutting through rooms.
 *
 * Conference hall bounding boxes (XZ plane):
 *  - Hall I:   X [-52, -33], Z [6, 24]
 *  - Hall II:  X [-49, -29], Z [-21, -3]
 *  - Hall III: X [-16, 4],   Z [6, 24]
 *  - Hall IV:  X [-16, 4],   Z [-21, -3]
 */
function applyConferenceHallPenalties(nm: any) {
    const halls = [
        { name: 'Hall I',   minX: -52, maxX: -33, minZ: 6,   maxZ: 24 },
        { name: 'Hall II',  minX: -49, maxX: -29, minZ: -21, maxZ: -3 },
        { name: 'Hall III', minX: -16, maxX: 4,   minZ: 6,   maxZ: 24 },
        { name: 'Hall IV',  minX: -16, maxX: 4,   minZ: -21, maxZ: -3 },
    ]

    const penaltyMultiplier = 5.0
    const hallRegions = new Set<number>()

    // Find which regions are inside conference halls
    for (let i = 0; i < nm.regions.length; i++) {
        const centroid = nm.regions[i].centroid
        for (const hall of halls) {
            if (centroid.x >= hall.minX && centroid.x <= hall.maxX &&
                centroid.z >= hall.minZ && centroid.z <= hall.maxZ) {
                hallRegions.add(i)
                break
            }
        }
    }

    // Increase cost of edges that pass through hall regions
    let penalized = 0
    const graph = nm.graph
    for (let nodeIdx = 0; nodeIdx < graph.getNodeCount(); nodeIdx++) {
        const edges: any[] = []
        graph.getEdgesOfNode(nodeIdx, edges)
        for (const edge of edges) {
            if (hallRegions.has(edge.from) || hallRegions.has(edge.to)) {
                edge.cost *= penaltyMultiplier
                penalized++
            }
        }
    }

    console.log(`🏛️ Conference hall penalties: ${hallRegions.size} regions, ${penalized} edges penalized (×${penaltyMultiplier})`)
}

export { navMesh }

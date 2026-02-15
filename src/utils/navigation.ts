import type { Route } from '../types'
import { hasObstacleBetween, getNearestWalkablePoint, isCollisionSystemReady } from './collisionDetection'
import * as THREE from 'three'
import { findPathOnNavMesh, loadNavMesh } from './navMeshSystem'

// Initialize NavMesh
let isNavMeshLoaded = false
export function initNavigation(url: string = 'Navmesh.glb') {
  if (!isNavMeshLoaded) {
    console.log('🚀 Loading NavMesh from:', url)
    loadNavMesh(url).then(() => {
      isNavMeshLoaded = true
      console.log('🚀 NavMesh loaded successfully')
    }).catch(e => console.error('🚀 NavMesh load FAILED:', e))
  }
}

// Auto-init
initNavigation()

interface NavNode {
  id: string
  position: [number, number, number]
}

// Enhanced navigation graph with corridor spine + branch corridors to rooms
// The building runs X: -128 to +56, with rooms branching off the main corridor (Z=0)
// Branches lead through doorways to zones on both sides (Z: -15 to +15)

export const navNodes: NavNode[] = [
  // ... (rest of old nodes kept for reference or fallback if needed, but calculateRoute will ignore them for now)
  { id: 'spine-1', position: [-127, 0, 0] },
]
// We can actually remove these if we are fully committed, but let's keep the structure valid to avoid breaking imports elsewhere for now.
export const navEdges: Record<string, string[]> = {}


/**
 * Calculate route between two points using the navigation graph (NavMesh).
 */
export function calculateRoute(
  from: [number, number, number],
  to: [number, number, number]
): Route {
  console.log('🗺️ Calculating route (NavMesh) from', from, 'to', to)

  // Use NavMesh if available
  if (isNavMeshLoaded) {
    const startVec = new THREE.Vector3(...from)
    const endVec = new THREE.Vector3(...to)

    // Check for NaN inputs
    if (isNaN(startVec.x) || isNaN(endVec.x)) {
      console.error("❌ calculateRoute: Start or End is NaN!")
      return { from, to, waypoints: [], distance: 0, estimatedTime: 0 }
    }

    // DEBUG: Re-enable pathfinding with safety limits
    let pathPoints: THREE.Vector3[] = []
    try {
      console.time('findPath')
      pathPoints = findPathOnNavMesh(startVec, endVec)
      console.timeEnd('findPath')
    } catch (e) {
      console.error('Pathfinding error:', e)
    }

    if (pathPoints.length > 0) {
      // Convert Vector3[] to [number, number, number][]
      const simpleWaypoints: [number, number, number][] = pathPoints.map(p => [p.x, p.y, p.z])

      // Add start point exactly
      simpleWaypoints.unshift(from)

      // Filter out any NaNs processing might have produced
      const validWaypoints = simpleWaypoints.filter(p => !isNaN(p[0]) && !isNaN(p[1]) && !isNaN(p[2]))

      // Yuka NavMesh already returns an optimized path via Funnel Algorithm
      // Do NOT simplify - it breaks the path by cutting through walls
      let simplified: [number, number, number][] = validWaypoints

      console.log('   ✅ NavMesh path found with nodes:', validWaypoints.length)

      // Calculate total distance
      let totalDistance = 0
      for (let i = 0; i < simplified.length - 1; i++) {
        totalDistance += calculateDistance(simplified[i], simplified[i + 1])
      }

      const estimatedTime = Math.ceil(totalDistance / 84)

      return {
        from,
        to,
        waypoints: simplified,
        distance: Math.round(totalDistance),
        estimatedTime
      }
    } else {
      console.warn('   ⚠️ No NavMesh path found, using direct line fallback')

      // Fallback: Direct line
      const directWaypoints: [number, number, number][] = [from, to]
      const dist = calculateDistance(from, to)

      return {
        from,
        to,
        waypoints: directWaypoints,
        distance: Math.round(dist),
        estimatedTime: Math.ceil(dist / 84)
      }
    }
  }

  // Fallback / Default behavior if NavMesh not loaded yet or failed
  // Return direct line for now to avoid crash, but it won't be good
  return {
    from,
    to,
    waypoints: [],
    distance: 0,
    estimatedTime: 0
  }
}

/**
 * Calculate distance between two points
 */
export function calculateDistance(
  from: [number, number, number],
  to: [number, number, number]
): number {
  return Math.sqrt(
    Math.pow(to[0] - from[0], 2) +
    Math.pow(to[1] - from[1], 2) +
    Math.pow(to[2] - from[2], 2)
  )
}

/**
 * Get direction from one point to another (in radians)
 */
export function getDirection(
  from: [number, number, number],
  to: [number, number, number]
): number {
  return Math.atan2(to[2] - from[2], to[0] - from[0])
}

/**
 * Check if user is near destination
 */
export function isNearDestination(
  userPos: [number, number, number],
  destination: [number, number, number],
  threshold: number = 5
): boolean {
  return calculateDistance(userPos, destination) < threshold
}

/**
 * Simplify path by removing collinear waypoints BUT only if shortcut is clear of obstacles.
 */
export function simplifyPath(points: [number, number, number][]): [number, number, number][] {
  if (points.length <= 2) return points

  // Optimization: Don't try simplify huge paths all at once if it lags?
  // But let's keep it simple.

  const result: [number, number, number][] = [points[0]]

  // Look ahead optimization
  // Instead of just i+1, try to connect to furthest visible point?
  // Standard String Pulling or Funnel is better, but this greedy approach works:
  // From 'current' (last added to result), try to connect to i+2, i+3...
  // If connection fails, add the previous point.

  // Greedy Simplification (Fan pattern)
  let currentStart = 0

  for (let i = 1; i < points.length; i++) {
    const startPoint = points[currentStart]
    const targetPoint = points[i]

    // Check if we can reach target directly from start
    // NOTE: This can be slow if we have 500 points.
    // Raycast per point.

    // Let's use hasObstacleBetween.
    const blocked = hasObstacleBetween(startPoint, targetPoint)

    if (blocked) {
      // We hit a wall. So the PREVIOUS point was the last valid one in this straight line.
      // Unless i-1 == currentStart (adjacent), which is always valid if NavMesh is valid.
      const lastValid = i - 1
      if (lastValid > currentStart) {
        result.push(points[lastValid])
        currentStart = lastValid
        i = lastValid // Backtrack to continue from here
      } else {
        // Adjacent block? Should not happen on valid NavMesh unless wall cuts triangle.
        // Just add current.
        result.push(points[i])
        currentStart = i
      }
    } else {
      // Path clear, continue extending...
      // Do nothing, just increment i in loop
    }
  }

  // Add last point
  result.push(points[points.length - 1])

  return result
}

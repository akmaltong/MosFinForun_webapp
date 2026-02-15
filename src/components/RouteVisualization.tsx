import { useMemo, useRef } from 'react'
import { useAppStore } from '../store/appStore'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'

/**
 * Build a simple piecewise-linear path
 */
function buildPath(points: THREE.Vector3[]): THREE.CurvePath<THREE.Vector3> {
  const path = new THREE.CurvePath<THREE.Vector3>()
  if (points.length < 2) return path

  for (let i = 0; i < points.length - 1; i++) {
    path.add(new THREE.LineCurve3(points[i].clone(), points[i + 1].clone()))
  }

  return path
}

/**
 * Flat arrow chevrons on the floor
 */
function FloorArrows({ path, pathLength }: { path: THREE.CurvePath<THREE.Vector3>; pathLength: number }) {
  const groupRef = useRef<THREE.Group>(null)

  const arrows = useMemo(() => {
    const spacing = 2.5 // Closer spacing
    const count = Math.max(5, Math.floor(pathLength / spacing))
    const items: { id: number; offset: number }[] = []
    for (let i = 0; i < count; i++) {
      items.push({ id: i, offset: i / count })
    }
    return items
  }, [pathLength])

  useFrame((_state, delta) => {
    if (!groupRef.current) return

    groupRef.current.children.forEach((arrow, i) => {
      const data = arrows[i]
      if (!data) return

      // Slower animation
      data.offset = (data.offset + delta * 0.08) % 1.0

      try {
        const t = Math.max(0.001, Math.min(0.999, data.offset))
        const point = path.getPointAt(t)
        const tangent = path.getTangentAt(t)

        // Place arrow slightly above the floor
        arrow.position.set(point.x, 0.15, point.z)

        // Rotate arrow to point along path direction
        arrow.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), tangent.normalize())

        // Fade in/out at edges for smooth look
        const edgeFade = Math.min(t * 5, (1 - t) * 5, 1)
        const opacity = 0.7 + edgeFade * 0.3
        const scale = 0.8 + edgeFade * 0.2
        arrow.scale.setScalar(scale);
        (arrow as any).material && ((arrow as any).material.opacity = opacity)
      } catch {
        // skip
      }
    })
  })

  return (
    <group ref={groupRef}>
      {arrows.map((item) => (
        <mesh key={item.id}>
          <coneGeometry args={[0.3, 0.7, 4]} />
          <meshStandardMaterial
            color="#ffffff"
            transparent
            opacity={0.9}
            emissive="#ffffff"
            emissiveIntensity={0.3}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  )
}

function PulsingDestination({ position }: { position: [number, number, number] }) {
  const ringRef = useRef<THREE.Mesh>(null)
  const pinRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (ringRef.current) {
      const scale = 1 + Math.sin(t * 2) * 0.15
      ringRef.current.scale.set(scale, scale, 1)
        ; (ringRef.current.material as THREE.MeshBasicMaterial).opacity = 0.3 + Math.sin(t * 2) * 0.1
    }
    if (pinRef.current) {
      pinRef.current.position.y = 1.5 + Math.sin(t * 1.5) * 0.3
    }
  })

  return (
    <group position={position}>
      <mesh ref={ringRef} position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.2, 1.8, 32]} />
        <meshBasicMaterial color="#4169E1" transparent opacity={0.3} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <mesh position={[0, 0.08, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.2, 32]} />
        <meshBasicMaterial color="#4169E1" transparent opacity={0.08} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <mesh ref={pinRef} position={[0, 1.5, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.4, 1.2, 16]} />
        <meshBasicMaterial color="#4169E1" transparent opacity={0.9} />
      </mesh>
      <mesh position={[0, 2.5, 0]}>
        <sphereGeometry args={[0.25, 16, 16]} />
        <meshBasicMaterial color="#6495ED" transparent opacity={0.9} />
      </mesh>
    </group>
  )
}

export default function RouteVisualization() {
  const currentRoute = useAppStore(state => state.currentRoute)
  const userLocation = useAppStore(state => state.userLocation)

  const { path, pathLength, floorLineGeometry, lineObject } = useMemo(() => {
    if (!currentRoute) {
      return { path: null, pathLength: 0, floorLineGeometry: null, lineObject: null }
    }

    // Use waypoints from route directly. They already contain start and end.
    const rawPoints = currentRoute.waypoints.map(p => new THREE.Vector3(...p))

    if (rawPoints.length < 2 || !rawPoints[0]) {
      return { path: null, pathLength: 0, floorLineGeometry: null, lineObject: null }
    }

    // Remove near-duplicate points
    const points: THREE.Vector3[] = [rawPoints[0]]
    for (let i = 1; i < rawPoints.length; i++) {
      if (rawPoints[i].distanceTo(points[points.length - 1]) > 1.0) {
        points.push(rawPoints[i])
      }
    }
    if (points.length < 2) {
      points.push(rawPoints[rawPoints.length - 1])
    }

    const curvePath = buildPath(points)
    const len = curvePath.getLength()

    // Create floor line points (all at y = 0.04 to be on the floor)
    const numPoints = Math.max(20, Math.floor(len * 2))
    const linePoints: THREE.Vector3[] = []
    for (let i = 0; i <= numPoints; i++) {
      try {
        const point = curvePath.getPointAt(i / numPoints)
        linePoints.push(new THREE.Vector3(point.x, 0.04, point.z))
      } catch {
        // skip
      }
    }

    const geo = new THREE.BufferGeometry().setFromPoints(linePoints)
    const line = new THREE.Line(
      geo,
      new THREE.LineBasicMaterial({
        color: "#4169E1",
        linewidth: 3,
        transparent: true,
        opacity: 0.8,
        depthWrite: false,
      })
    )
    
    return { path: curvePath, pathLength: len, floorLineGeometry: geo, lineObject: line }
  }, [currentRoute, userLocation])

  if (!path || !floorLineGeometry || !lineObject) return null

  return (
    <group>
      {/* Main path line on floor - blue like in video */}
      <primitive object={lineObject} />

      {/* Animated white chevron arrows on floor */}
      <FloorArrows path={path} pathLength={pathLength} />

      {/* Destination marker */}
      {currentRoute && (
        <PulsingDestination position={currentRoute.to} />
      )}
    </group>
  )
}

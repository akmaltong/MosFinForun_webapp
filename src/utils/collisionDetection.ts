import * as THREE from 'three'

let venueModel: THREE.Object3D | null = null
let raycaster: THREE.Raycaster | null = null
let wallMeshes: THREE.Mesh[] = []

/**
 * Инициализация системы проверки коллизий
 */
export function initCollisionDetection(model: THREE.Object3D) {
  venueModel = model
  raycaster = new THREE.Raycaster()

  wallMeshes = []
  let floorCount = 0
  let wallCount = 0

  // Strategy: Identify walls by geometry if possible, not just names.
  // But computing normals for every mesh is expensive. 
  // Let's refine the name filter first to be VERY permissive, 
  // and maybe check the bounding box or orientation?

  // Actually, let's keep it simple but broader.
  // We will assume EVERYTHING is a wall unless it's strictly a floor/ceiling.

  model.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      const name = child.name.toLowerCase()

      // Strict exclusion of floors
      const isFloor = name.includes('floor') ||
        name.includes('пол') ||
        name.includes('ground') ||
        name.includes('navmesh') ||
        name.includes('ceiling') ||
        name.includes('потолок')

      if (!isFloor) {
        // Additional check: if the mesh is flat and horizontal, it's likely not a wall.
        // But reading geometry data here might be slow or complex if not buffered.
        // Let's rely on the permissive filter for now.

        // Make sure material is double sided for raycasting if possible? 
        // Raycaster usually hits front faces. Walls usually have 'front' facing out.
        // If we are inside a room, we see backfaces? No, usually front faces.

        wallMeshes.push(child)
        wallCount++
      } else {
        floorCount++
      }
    }
  })

  console.log(`✅ Collision detection initialized (Aggressive Wall Mode):`)
  console.log(`   - Potential obstacles (Everything except 'floor'/'ceiling'): ${wallCount}`)
  console.log(`   - Ignored floors/ground: ${floorCount}`)
}

export function isCollisionSystemReady(): boolean {
  return wallMeshes.length > 0
}

/**
 * Проверка, есть ли препятствие между двумя точками
 * Использует raycasting для определения пересечений с геометрией
 */
export function hasObstacleBetween(
  from: [number, number, number],
  to: [number, number, number],
  heightOffset: number = 0.4 // Lowered to 0.4m to catch low obstacles (tables, islands)
): boolean {
  if (!venueModel || !raycaster || wallMeshes.length === 0) {
    console.log('⚠️ Collision detection not ready')
    return false // Если модель не загружена, считаем что препятствий нет
  }

  const start = new THREE.Vector3(from[0], from[1] + heightOffset, from[2])
  const end = new THREE.Vector3(to[0], to[1] + heightOffset, to[2])

  const direction = new THREE.Vector3().subVectors(end, start)
  const distance = direction.length()
  direction.normalize()

  raycaster.set(start, direction)
  raycaster.far = distance
  raycaster.near = 0.1 // Ignore objects too close to start (e.g. self)

  // DoubleSide check manually? No, Three.js raycaster respects material.side unless we force it?
  // Actually, raycaster hits respect triangle winding. To be safe, try to hit EVERYTHING.
  // Although performance hit, let's just use standard hit.

  const intersects = raycaster.intersectObjects(wallMeshes, false)

  // Если есть пересечения, проверим их
  // Нам нужно найти ПЕРВОЕ пересечение, которое является препятствием.
  // wallMeshes уже отфильтрованы, но вдруг там есть что-то прозрачное/фантомное?

  let blockingHit = null
  for (const hit of intersects) {
    // Check distance (must be within range, though far sets limit)
    if (hit.distance < distance - 0.5 && hit.distance > 0.1) {
      blockingHit = hit
      break // Found nearest blocking object
    }
  }

  if (blockingHit) {
    console.log(`🚫 Collision! Ray from [${from[0].toFixed(1)},${from[2].toFixed(1)}] -> [${to[0].toFixed(1)},${to[2].toFixed(1)}]`)
    console.log(`   Hit object: "${blockingHit.object.name}" at dist ${blockingHit.distance.toFixed(2)}m (path segment: ${distance.toFixed(2)}m)`)
    return true
  }

  return false
}

/**
 * Проверка, находится ли точка внутри проходимой зоны
 */
export function isPointWalkable(
  point: [number, number, number],
  checkRadius: number = 0.5
): boolean {
  if (!venueModel || !raycaster || wallMeshes.length === 0) {
    return true
  }

  // Проверяем несколько лучей вокруг точки
  const directions = [
    [1, 0, 0],
    [-1, 0, 0],
    [0, 0, 1],
    [0, 0, -1],
  ]

  const origin = new THREE.Vector3(point[0], point[1] + 0.75, point[2])

  for (const dir of directions) {
    const direction = new THREE.Vector3(dir[0], dir[1], dir[2])
    raycaster.set(origin, direction)
    raycaster.far = checkRadius

    const intersects = raycaster.intersectObjects(wallMeshes, false)

    if (intersects.length > 0 && intersects[0].distance < checkRadius) {
      return false // Слишком близко к стене
    }
  }

  return true
}

/**
 * Получить ближайшую проходимую точку к заданной
 */
export function getNearestWalkablePoint(
  point: [number, number, number],
  maxSearchRadius: number = 5
): [number, number, number] {
  if (isPointWalkable(point)) {
    return point
  }

  // Поиск по спирали
  const step = 0.5
  for (let radius = step; radius <= maxSearchRadius; radius += step) {
    const angles = Math.ceil(radius * 8) // Больше точек на большем радиусе

    for (let i = 0; i < angles; i++) {
      const angle = (i / angles) * Math.PI * 2
      const testPoint: [number, number, number] = [
        point[0] + Math.cos(angle) * radius,
        point[1],
        point[2] + Math.sin(angle) * radius,
      ]

      if (isPointWalkable(testPoint)) {
        return testPoint
      }
    }
  }

  return point // Если не нашли, возвращаем исходную
}

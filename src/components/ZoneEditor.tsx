import { useState, useEffect, useCallback, useMemo } from 'react'
import { useAppStore } from '../store/appStore'

interface POIData {
  cameraPosition: [number, number, number]
  targetPosition: [number, number, number]
  distance?: number
  azimuthDeg?: number
  elevationDeg?: number
}

function calculateDistance(pos1: [number, number, number], pos2: [number, number, number]): number {
  const dx = pos1[0] - pos2[0]
  const dy = pos1[1] - pos2[1]
  const dz = pos1[2] - pos2[2]
  return Math.sqrt(dx * dx + dy * dy + dz * dz)
}

function calculateAzimuthDeg(cameraPos: [number, number, number], targetPos: [number, number, number]): number {
  const dx = targetPos[0] - cameraPos[0]
  const dz = targetPos[2] - cameraPos[2]
  const angleRad = Math.atan2(dz, dx)
  let angleDeg = (angleRad * 180) / Math.PI
  if (angleDeg < 0) angleDeg += 360
  return angleDeg
}

function calculateElevationDeg(cameraPos: [number, number, number], targetPos: [number, number, number]): number {
  const dx = targetPos[0] - cameraPos[0]
  const dy = targetPos[1] - cameraPos[1]
  const dz = targetPos[2] - cameraPos[2]
  const horizontalDist = Math.sqrt(dx * dx + dz * dz)
  const angleRad = Math.atan2(dy, horizontalDist)
  return (angleRad * 180) / Math.PI
}

function calculateCameraPosition(targetPos: [number, number, number], distance: number, azimuthDeg: number, elevationDeg: number): [number, number, number] {
  const azimuthRad = (azimuthDeg * Math.PI) / 180
  const elevationRad = (elevationDeg * Math.PI) / 180

  const horizontalDist = distance * Math.cos(elevationRad)
  const dx = horizontalDist * Math.cos(azimuthRad)
  const dy = distance * Math.sin(elevationRad)
  const dz = horizontalDist * Math.sin(azimuthRad)

  return [
    targetPos[0] + dx,
    targetPos[1] + dy,
    targetPos[2] + dz
  ]
}

export default function ZoneEditor() {
  const zones = useAppStore(state => state.zones)
  const selectedZone = useAppStore(state => state.selectedZone)
  const setSelectedZone = useAppStore(state => state.setSelectedZone)
  const editMode = useAppStore(state => state.editMode)
  const setEditMode = useAppStore(state => state.setEditMode)
  const poiEditMode = useAppStore(state => state.poiEditMode)
  const setPoiEditMode = useAppStore(state => state.setPoiEditMode)
  const setViewMode = useAppStore(state => state.setViewMode)
  const setCameraTarget = useAppStore(state => state.setCameraTarget)
  const cameraPosition = useAppStore(state => state.cameraPosition)
  const cameraTargetPosition = useAppStore(state => state.cameraTargetPosition)
  const [editType, setEditType] = useState<'position' | 'poi'>('position')
  const [isPoiMode, setIsPoiMode] = useState(false)
  const [unsavedChanges, setUnsavedChanges] = useState(false)

  useEffect(() => {
    const newIsPoiMode = poiEditMode
    setIsPoiMode(newIsPoiMode)
    if (newIsPoiMode) {
      setEditType('poi')
    } else if (editMode) {
      setEditType('position')
    }
  }, [editMode, poiEditMode])

  useEffect(() => {
    if (poiEditMode) {
      setViewMode('angle')
    } else if (editMode) {
      setViewMode('top')
    }
  }, [editMode, poiEditMode, setViewMode])

  useEffect(() => {
    if (!editMode && !poiEditMode) {
      setSelectedZone(null)
    }
  }, [editMode, poiEditMode, setSelectedZone])

  const currentPoi = useMemo(() => {
    if (!selectedZone || !cameraPosition) return null

    const zonePos = selectedZone.position
    const camPos = cameraPosition as [number, number, number]
    const targetPos = (cameraTargetPosition as [number, number, number]) || zonePos

    const distance = calculateDistance(camPos, targetPos)
    const azimuthDeg = calculateAzimuthDeg(camPos, targetPos)
    const elevationDeg = calculateElevationDeg(camPos, targetPos)

    return {
      cameraPosition: [...camPos] as [number, number, number],
      targetPosition: [...targetPos] as [number, number, number],
      distance,
      azimuthDeg,
      elevationDeg
    }
  }, [selectedZone, cameraPosition, cameraTargetPosition])

  const handleSaveSingleZone = useCallback((zoneId: string) => {
    const currentZones = useAppStore.getState().zones
    const zone = currentZones.find(z => z.id === zoneId)
    if (!zone) return

    if (!currentPoi) {
      console.log('Нет текущей позиции камеры для сохранения')
      return
    }

    const newPoi: POIData = {
      cameraPosition: [...currentPoi.cameraPosition],
      targetPosition: [...currentPoi.targetPosition],
      distance: currentPoi.distance,
      azimuthDeg: currentPoi.azimuthDeg,
      elevationDeg: currentPoi.elevationDeg
    }

    console.log('Saving POI for zone:', zone.name, newPoi)
    console.log('Current camera position:', cameraPosition)

    const updatedZones = currentZones.map(z =>
      z.id === zoneId ? { ...z, poi: newPoi } : z
    )

    useAppStore.setState({ zones: updatedZones })

    // Update selected zone if it matches
    const currentSelected = useAppStore.getState().selectedZone
    if (currentSelected?.id === zoneId) {
      setSelectedZone({ ...currentSelected, poi: newPoi })
    }

    setUnsavedChanges(false)

    const code = `// Zone: ${zone.name}\n// POI Settings:\npoi: {\n  cameraPosition: [${newPoi.cameraPosition[0].toFixed(3)}, ${newPoi.cameraPosition[1].toFixed(3)}, ${newPoi.cameraPosition[2].toFixed(3)}],\n  targetPosition: [${newPoi.targetPosition[0].toFixed(3)}, ${newPoi.targetPosition[1].toFixed(3)}, ${newPoi.targetPosition[2].toFixed(3)}],\n  distance: ${(newPoi.distance ?? 0).toFixed(1)},\n  azimuthDeg: ${(newPoi.azimuthDeg ?? 0).toFixed(2)},\n  elevationDeg: ${(newPoi.elevationDeg ?? 0).toFixed(2)}\n}`

    navigator.clipboard.writeText(code).then(() => {
      console.log(`POI для ${zone.name} сохранен:`, newPoi)
    })
  }, [currentPoi, cameraPosition, setSelectedZone])

  const handleCaptureCurrentCamera = useCallback(() => {
    if (!currentPoi || !selectedZone) return

    const currentZones = useAppStore.getState().zones
    const updatedZones = currentZones.map(z =>
      z.id === selectedZone.id ? { ...z, poi: currentPoi } : z
    )

    useAppStore.setState({ zones: updatedZones })
    setSelectedZone({ ...selectedZone, poi: currentPoi })
    setUnsavedChanges(false)

    console.log('Captured camera POI:', currentPoi)
  }, [currentPoi, selectedZone, setSelectedZone])

  const handleZoneClick = useCallback((zone: typeof zones[0]) => {
    const currentSelected = useAppStore.getState().selectedZone
    if (currentSelected?.id === zone.id) {
      setSelectedZone(null)
      setUnsavedChanges(false)
      return
    }

    if (unsavedChanges) {
      if (!confirm('У вас есть несохраненные изменения! Продолжить без сохранения?')) {
        return
      }
    }

    // Always get the latest zone data from the store
    const latestZones = useAppStore.getState().zones
    const latestZone = latestZones.find(z => z.id === zone.id) || zone

    setSelectedZone(latestZone)
    setUnsavedChanges(false)

    if (latestZone.poi?.cameraPosition && latestZone.poi?.targetPosition) {
      console.log('Zone has POI, moving camera to it:', latestZone.poi)
      setCameraTarget(latestZone.id)
    } else {
      console.log('Zone has no POI, using zone position:', latestZone.position)
      setCameraTarget(latestZone.id)
    }
  }, [unsavedChanges, setSelectedZone, setCameraTarget])

  const handlePoiChange = useCallback((zoneId: string, property: 'distance' | 'azimuthDeg' | 'elevationDeg', value: number) => {
    const currentZones = useAppStore.getState().zones
    const zone = currentZones.find(z => z.id === zoneId)
    if (!zone) return

    const poi = zone.poi as POIData | undefined
    const targetPos = poi?.targetPosition || [...zone.position] as [number, number, number]
    const currentDistance = poi?.distance ?? 40
    const currentAzimuthDeg = poi?.azimuthDeg ?? 0
    const currentElevationDeg = poi?.elevationDeg ?? 45

    const newDistance = property === 'distance' ? value : currentDistance
    const newAzimuthDeg = property === 'azimuthDeg' ? value : currentAzimuthDeg
    const newElevationDeg = property === 'elevationDeg' ? value : currentElevationDeg

    const newCameraPosition = calculateCameraPosition(targetPos, newDistance, newAzimuthDeg, newElevationDeg)

    const newPoi: POIData = {
      cameraPosition: newCameraPosition,
      targetPosition: targetPos,
      distance: newDistance,
      azimuthDeg: newAzimuthDeg,
      elevationDeg: newElevationDeg
    }

    const updatedZones = currentZones.map(z =>
      z.id === zoneId ? { ...z, poi: newPoi } : z
    )

    useAppStore.setState({ zones: updatedZones })

    const currentSelected = useAppStore.getState().selectedZone
    if (currentSelected?.id === zoneId) {
      setSelectedZone({ ...currentSelected, poi: newPoi })
    }
    setUnsavedChanges(true)
  }, [setSelectedZone])

  const handleSaveCoordinates = useCallback(() => {
    if (unsavedChanges) {
      if (!confirm('У вас есть несохраненные изменения! Продолжить?')) {
        return
      }
    }

    const currentZones = useAppStore.getState().zones
    const code = `export const pois: POICamera[] = [\n${currentZones.map((zone, i) => {
      const poi = zone.poi as POIData | undefined
      return `  {\n` +
        `    id: 'poi-${zone.id.replace('zone-', '')}',\n` +
        `    name: '${zone.name}',\n` +
        `    color: '${zone.color}',\n` +
        `    cameraPosition: [${poi?.cameraPosition?.[0].toFixed(4) || 0}, ${poi?.cameraPosition?.[1].toFixed(4) || 0}, ${poi?.cameraPosition?.[2].toFixed(4) || 0}],\n` +
        `    targetPosition: [${poi?.targetPosition?.[0].toFixed(4) || 0}, ${poi?.targetPosition?.[1].toFixed(4) || 0}, ${poi?.targetPosition?.[2].toFixed(4) || 0}],\n` +
        `    description: 'POI: ${zone.name}'${poi ? `,\n    distance: ${poi.distance?.toFixed(4)},\n    azimuthDeg: ${poi.azimuthDeg?.toFixed(2)},\n    elevationDeg: ${poi.elevationDeg?.toFixed(2)}` : ''}\n` +
        `  }${i < currentZones.length - 1 ? ',' : ''}`
    }).join('\n')}\n];`

    navigator.clipboard.writeText(code).then(() => {
      alert('✅ Данные зон сохранены!\n\nПозиции и POI скопированы в буфер обмена.\nВставьте в src/data/poiData.ts')
    })
  }, [unsavedChanges])

  const handlePositionChange = useCallback((zoneId: string, axis: 'x' | 'y' | 'z', value: number) => {
    const currentZones = useAppStore.getState().zones
    const zone = currentZones.find(z => z.id === zoneId)
    if (!zone) return

    const newPosition: [number, number, number] = [...zone.position]
    const axisIndex = { x: 0, y: 1, z: 2 }[axis]
    newPosition[axisIndex] = value

    const updatedZones = currentZones.map(z =>
      z.id === zoneId ? { ...z, position: newPosition } : z
    )

    useAppStore.setState({ zones: updatedZones })

    const currentSelected = useAppStore.getState().selectedZone
    if (currentSelected?.id === zoneId) {
      setSelectedZone({ ...currentSelected, position: newPosition })
    }
  }, [setSelectedZone])

  const nudgePosition = useCallback((zoneId: string, axis: 'x' | 'y' | 'z', delta: number) => {
    const currentZones = useAppStore.getState().zones
    const zone = currentZones.find(z => z.id === zoneId)
    if (!zone) return

    const axisIndex = { x: 0, y: 1, z: 2 }[axis]
    handlePositionChange(zoneId, axis, zone.position[axisIndex] + delta)
  }, [handlePositionChange])

  const handlePreviewPOI = useCallback((zoneId: string) => {
    setCameraTarget(zoneId)
  }, [setCameraTarget])

  const handleTogglePositionMode = useCallback(() => {
    setEditType('position')
    setEditMode(true)
    setPoiEditMode(false)
  }, [setEditMode, setPoiEditMode])

  const handleTogglePoiMode = useCallback(() => {
    setEditType('poi')
    setEditMode(false)
    setPoiEditMode(true)
  }, [setEditMode, setPoiEditMode])

  const handleClose = useCallback(() => {
    if (unsavedChanges) {
      if (!confirm('У вас есть несохраненные изменения! Продолжить?')) {
        return
      }
    }
    setEditMode(false)
    setPoiEditMode(false)
    setSelectedZone(null)
  }, [setEditMode, setPoiEditMode, setSelectedZone, unsavedChanges])

  if (!editMode && !poiEditMode) {
    return null
  }

  const poisConfigured = zones.filter(z => z.poi?.cameraPosition && z.poi?.targetPosition).length

  return (
    <div className="fixed inset-0 z-50 overflow-hidden pointer-events-none bg-transparent">
      <div className="absolute right-4 top-20 bottom-4 w-96 bg-gray-900/95 backdrop-blur-md rounded-2xl shadow-2xl flex flex-col pointer-events-auto">
        <div className={`bg-gradient-to-r p-3 rounded-t-2xl flex items-center justify-between ${isPoiMode ? 'from-orange-600 to-red-600' : 'from-purple-600 to-pink-600'
          }`}>
          <div>
            <h2 className="text-lg font-bold text-white">
              {isPoiMode ? '🎥 Режим POI' : '✏️ Редактор зон'}
            </h2>
            <div className="text-xs text-white/70">
              Настроено: {poisConfigured}/{zones.length}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSaveCoordinates}
              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
              title="Сохранить все"
            >
              <span>💾</span>
            </button>
            <button
              onClick={handleClose}
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg font-medium transition-colors"
            >
              ✕ Закрыть
            </button>
          </div>
        </div>

        <div className="bg-gray-800 p-2 flex gap-2 border-b border-gray-700">
          <button
            onClick={handleTogglePositionMode}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${editType === 'position'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
          >
            📍 Позиции
          </button>
          <button
            onClick={handleTogglePoiMode}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${editType === 'poi'
                ? 'bg-orange-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
          >
            🎥 POI (камера)
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          {isPoiMode ? (
            <div className="bg-orange-900/30 border-orange-500/50 border rounded-lg p-2 mb-3">
              <h3 className="font-bold mb-1 text-sm text-orange-300">
                💡 Как настроить POI:
              </h3>
              <ol className="text-xs space-y-0.5 text-orange-200 list-decimal list-inside">
                <li>Кликните на зону в списке</li>
                <li>Камера переместится к зоне</li>
                <li>Настройте камеру вручную в сцене</li>
                <li>Нажмите "💾 Сохранить"</li>
                <li>Перейдите к следующей зоне</li>
              </ol>
              {unsavedChanges && (
                <div className="mt-2 text-yellow-300 text-xs font-bold">
                  ⚠️ Есть несохраненные изменения!
                </div>
              )}
            </div>
          ) : (
            <div className="bg-blue-900/30 border-blue-500/50 border rounded-lg p-2 mb-3">
              <h3 className="font-bold mb-1 text-sm text-blue-300">
                💡 Как настроить позиции:
              </h3>
              <ul className="text-xs space-y-0.5 text-blue-200">
                <li>• Кликните зону на карте слева</li>
                <li>• Стрелки ← → = X (лево/право)</li>
                <li>• Стрелки ↑ ↓ = Z (вперёд/назад)</li>
                <li>• 💾 когда закончите</li>
              </ul>
            </div>
          )}

          <div className="space-y-2">
            {zones.map(zone => {
              const isSelected = selectedZone?.id === zone.id
              const poi = zone.poi as POIData | undefined
              const hasPoi = !!poi?.cameraPosition && !!poi?.targetPosition

              return (
                <div
                  key={zone.id}
                  className={`bg-gray-800/90 rounded-lg p-2 border-2 transition-all cursor-pointer ${isSelected
                      ? `border-${isPoiMode ? 'orange' : 'purple'}-400 shadow-lg shadow-${isPoiMode ? 'orange' : 'purple'}-500/50`
                      : 'border-gray-700 hover:border-gray-600'
                    } ${hasPoi ? 'ring-1 ring-green-500/30' : ''}`}
                  onClick={() => handleZoneClick(zone)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: zone.color }}
                      />
                      <span className="font-bold text-white text-sm">{zone.name}</span>
                      {hasPoi && (
                        <span className="text-green-400 text-xs">✓</span>
                      )}
                    </div>
                  </div>

                  {isSelected && isPoiMode && (
                    <div className="space-y-2 mt-2 pt-2 border-t border-gray-700">
                      <div className="bg-gray-700/50 rounded p-2 mb-2">
                        <div className="text-xs text-gray-400">
                          <div>Камера: {poi?.cameraPosition?.map(v => v.toFixed(1)).join(', ') || 'не задано'}</div>
                          <div>Цель: {poi?.targetPosition?.map(v => v.toFixed(1)).join(', ') || 'не задано'}</div>
                        </div>
                      </div>

                      <div className="flex gap-2 mb-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleCaptureCurrentCamera()
                          }}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                          📸 Захватить камеру
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleSaveSingleZone(zone.id)
                          }}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                          💾 Сохранить
                        </button>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handlePreviewPOI(zone.id)
                        }}
                        className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 rounded-lg text-sm font-medium transition-colors mb-2"
                      >
                        🎬 Предпросмотр
                      </button>

                      <div>
                        <label className="text-xs text-gray-400 mb-1 block">
                          Дистанция: {poi?.distance?.toFixed(1) || '40'} м
                        </label>
                        <input
                          type="range"
                          min="5"
                          max="100"
                          step="1"
                          value={poi?.distance || 40}
                          onChange={(e) => {
                            e.stopPropagation()
                            handlePoiChange(zone.id, 'distance', parseFloat(e.target.value))
                          }}
                          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>

                      <div>
                        <label className="text-xs text-gray-400 mb-1 block">
                          Азимут: {(poi?.azimuthDeg || 0).toFixed(1)}°
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="360"
                          step="1"
                          value={poi?.azimuthDeg || 0}
                          onChange={(e) => {
                            e.stopPropagation()
                            handlePoiChange(zone.id, 'azimuthDeg', parseFloat(e.target.value))
                          }}
                          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>

                      <div>
                        <label className="text-xs text-gray-400 mb-1 block">
                          Возвышение: {(poi?.elevationDeg || 45).toFixed(1)}°
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="90"
                          step="1"
                          value={poi?.elevationDeg || 45}
                          onChange={(e) => {
                            e.stopPropagation()
                            handlePoiChange(zone.id, 'elevationDeg', parseFloat(e.target.value))
                          }}
                          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    </div>
                  )}

                  {isSelected && !isPoiMode && (
                    <div className="space-y-2 mt-2 pt-2 border-t border-gray-700">
                      <div>
                        <label className="text-xs text-gray-400 mb-1 block">
                          X: {zone.position[0].toFixed(1)}
                        </label>
                        <div className="flex gap-1">
                          <button
                            onClick={(e) => { e.stopPropagation(); nudgePosition(zone.id, 'x', -1) }}
                            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-1 rounded text-xs font-bold"
                          >
                            ← 1
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); nudgePosition(zone.id, 'x', -0.1) }}
                            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-1 rounded text-xs"
                          >
                            ← .1
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); nudgePosition(zone.id, 'x', 0.1) }}
                            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-1 rounded text-xs"
                          >
                            .1 →
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); nudgePosition(zone.id, 'x', 1) }}
                            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-1 rounded text-xs font-bold"
                          >
                            1 →
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="text-xs text-gray-400 mb-1 block">
                          Z: {zone.position[2].toFixed(1)}
                        </label>
                        <div className="flex gap-1">
                          <button
                            onClick={(e) => { e.stopPropagation(); nudgePosition(zone.id, 'z', -1) }}
                            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-1 rounded text-xs font-bold"
                          >
                            ↓ 1
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); nudgePosition(zone.id, 'z', -0.1) }}
                            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-1 rounded text-xs"
                          >
                            ↓ .1
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); nudgePosition(zone.id, 'z', 0.1) }}
                            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-1 rounded text-xs"
                          >
                            .1 ↑
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); nudgePosition(zone.id, 'z', 1) }}
                            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-1 rounded text-xs font-bold"
                          >
                            1 ↑
                          </button>
                        </div>
                      </div>

                      <div className="pt-1 text-xs text-gray-500 font-mono">
                        [{zone.position[0].toFixed(1)}, {zone.position[1].toFixed(1)}, {zone.position[2].toFixed(1)}]
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

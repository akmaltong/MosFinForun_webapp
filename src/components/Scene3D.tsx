import { OrbitControls, PerspectiveCamera, OrthographicCamera } from '@react-three/drei'
import { useThree, Canvas } from '@react-three/fiber'
import { Suspense, useEffect, useRef, useState, Component, type ReactNode } from 'react'
import * as THREE from 'three'
import { useAppStore } from '../store/appStore'
import VenueModelBaked from './VenueModelBaked'
import UserMarker from './UserMarker'
import ZoneMarkers from './ZoneMarkers'
import ZoneGeometry from './ZoneGeometry'
import FriendMarkers from './FriendMarkers'
import RouteVisualization from './RouteVisualization'
import { NavigationDebug } from './NavigationDebug'
import FirstPersonControls from './FirstPersonControls'
import CameraController, { setOrbitControls } from './CameraController'
import HDRIEnvironment from './HDRIEnvironment'
import Effects from './Effects'
import { NavMeshVisualizer } from './NavMeshVisualizer'

const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)

class CanvasErrorBoundary extends Component<{children: ReactNode}, {error: Error | null}> {
  state = { error: null as Error | null }
  static getDerivedStateFromError(error: Error) { return { error } }
  componentDidCatch(error: Error) { console.error('3D Scene error:', error) }
  render() {
    if (this.state.error) return <div style={{color:'red',padding:20}}>3D Error: {this.state.error.message}</div>
    return this.props.children
  }
}

function OrbitControlsWithRef({ viewMode }: { viewMode: string }) {
  const controlsRef = useRef<any>(null)
  const { camera } = useThree()
  const setCameraPosition = useAppStore(state => state.setCameraPosition)
  const setCameraTargetPosition = useAppStore(state => state.setCameraTargetPosition)
  const setViewMode = useAppStore(state => state.setViewMode)

  useEffect(() => {
    const controls = controlsRef.current
    if (controls) {
      setOrbitControls(controls)

      const handleChange = () => {
        const pos = camera.position
        setCameraPosition([pos.x, pos.y, pos.z])

        if (controls.target) {
          setCameraTargetPosition([controls.target.x, controls.target.y, controls.target.z])
        }
      }

      controls.addEventListener('change', handleChange)

      return () => {
        controls.removeEventListener('change', handleChange)
      }
    }
  }, [camera, setCameraPosition, setCameraTargetPosition])

  useEffect(() => {
    const controls = controlsRef.current
    if (controls && camera) {
      if (viewMode === 'top') {
        camera.position.set(0, 10, 0)
        camera.up.set(0, 1, 0)
        camera.lookAt(0, 0, 0)
        controls.target.set(0, 0, 0)
        controls.update()
      } else if (viewMode === 'angle') {
        controls.target.set(-41, -7, 6)
        controls.update()
      } else {
        controls.target.set(0, 0, 0)
        controls.update()
      }
    }
  }, [viewMode, camera])

  useEffect(() => {
    if (viewMode !== 'top') return

    const canvas = document.querySelector('canvas')
    if (!canvas) return

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 0) {
        setViewMode('angle')
      }
    }

    canvas.addEventListener('mousedown', handleMouseDown)
    return () => canvas.removeEventListener('mousedown', handleMouseDown)
  }, [viewMode, setViewMode])

  const isTopView = viewMode === 'top'

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.05}
      enableRotate={!isTopView}
      enablePan
      enableZoom
      minPolarAngle={0.1}
      maxPolarAngle={isTopView ? 0 : Math.PI * 0.45}
      mouseButtons={{
        LEFT: isTopView ? THREE.MOUSE.PAN : THREE.MOUSE.ROTATE,
        MIDDLE: THREE.MOUSE.DOLLY,
        RIGHT: THREE.MOUSE.PAN
      }}
    />
  )
}

function GLSettingsSync() {
  const { gl } = useThree()
  const toneMapping = useAppStore(state => state.toneMapping)
  const toneMappingExposure = useAppStore(state => state.toneMappingExposure)

  useEffect(() => {
    gl.toneMappingExposure = toneMappingExposure
  }, [gl, toneMappingExposure])

  useEffect(() => {
    switch (toneMapping) {
      case 'Linear':
        gl.toneMapping = THREE.LinearToneMapping; break
      case 'Reinhard':
        gl.toneMapping = THREE.ReinhardToneMapping; break
      default:
        gl.toneMapping = THREE.ACESFilmicToneMapping
    }
  }, [gl, toneMapping])

  return null
}

function SceneContent() {
  const viewMode = useAppStore(state => state.viewMode)

  return (
    <>
      <GLSettingsSync />
      {/* HDRI Environment - освещение и фон */}
      <Suspense fallback={null}>
        <HDRIEnvironment />
      </Suspense>

      {/* Модель */}
      <Suspense fallback={null}>
        <VenueModelBaked />
      </Suspense>

      {/* Геометрия зон для подсветки */}
      <Suspense fallback={null}>
        <ZoneGeometry />
      </Suspense>

      {/* NavMesh визуализация */}
      <Suspense fallback={null}>
        <NavMeshVisualizer />
      </Suspense>

      <UserMarker />
      <ZoneMarkers />
      <FriendMarkers />
      <RouteVisualization />
      <NavigationDebug />

      {viewMode === 'first-person' ? (
        <FirstPersonControls />
      ) : (
        <>
          <OrbitControlsWithRef viewMode={viewMode} />
          <CameraController />
        </>
      )}
    </>
  )
}

export default function Scene3D() {
  const viewMode = useAppStore(state => state.viewMode)
  const toneMapping = useAppStore(state => state.toneMapping)
  const toneMappingExposure = useAppStore(state => state.toneMappingExposure)
  const activeBottomPanel = useAppStore(state => state.activeBottomPanel)
  const setActiveBottomPanel = useAppStore(state => state.setActiveBottomPanel)
  const setIsFullscreen = useAppStore(state => state.setIsFullscreen)
  const [renderError, setRenderError] = useState<string | null>(null)

  useEffect(() => {
    const handleResize = () => {
      const canvas = document.querySelector('canvas')
      if (canvas) {
        canvas.style.width = '100%'
        canvas.style.height = '100%'
      }
    }

    window.addEventListener('resize', handleResize)
    handleResize()

    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    const handleDoubleClick = () => {
      if (!document.fullscreenElement) {
        const root = document.getElementById('root')
        if (root) {
          root.requestFullscreen().catch(err => {
            console.log(`Error: ${err.message}`)
          })
        }
      } else {
        document.exitFullscreen()
      }
    }

    const handleFullscreenChange = () => {
      const isFullscreen = !!document.fullscreenElement
      setIsFullscreen(isFullscreen)
    }

    const canvas = document.querySelector('canvas')
    if (canvas) {
      canvas.addEventListener('dblclick', handleDoubleClick)
      document.addEventListener('fullscreenchange', handleFullscreenChange)

      return () => {
        canvas.removeEventListener('dblclick', handleDoubleClick)
        document.removeEventListener('fullscreenchange', handleFullscreenChange)
      }
    }
  }, [setIsFullscreen])

  const handleSceneClick = () => {
    if (activeBottomPanel) {
      setActiveBottomPanel(null)
    }
  }

  const getCameraPosition = (): [number, number, number] => {
    switch (viewMode) {
      case 'top':
        return [0, 10, 0]
      case 'angle':
        return [-66, 241, 6]
      default:
        return [-66, 241, 6]
    }
  }

  const isOrthographic = viewMode === 'top'

  const getToneMapping = () => {
    switch (toneMapping) {
      case 'Linear':
        return THREE.LinearToneMapping
      case 'Reinhard':
        return THREE.ReinhardToneMapping
      case 'ACES':
      default:
        return THREE.ACESFilmicToneMapping
    }
  }

  if (renderError) {
    return (
      <div className="w-full h-full flex items-center justify-center" style={{background: '#0a0a0f', color: '#ff6b6b', padding: 20, textAlign: 'center'}}>
        <div>
          <p style={{fontSize: 18, marginBottom: 10}}>3D Error</p>
          <p style={{fontSize: 12, color: '#888'}}>{renderError}</p>
          <button onClick={() => { setRenderError(null); location.reload() }} style={{marginTop: 15, padding: '8px 20px', background: '#D4AF37', color: '#000', border: 'none', borderRadius: 8, cursor: 'pointer'}}>
            Перезагрузить
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full relative" onClick={handleSceneClick}>
      <CanvasErrorBoundary>
      <Canvas
        gl={{
          toneMapping: getToneMapping(),
          toneMappingExposure: toneMappingExposure,
          antialias: !isMobile,
          powerPreference: 'high-performance',
          failIfMajorPerformanceCaveat: false,
          alpha: false,
          stencil: false,
          depth: true,
        }}
        onCreated={(state) => {
          state.gl.shadowMap.enabled = false
          state.gl.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2))

          // Listen for WebGL context loss
          const canvas = state.gl.domElement
          canvas.addEventListener('webglcontextlost', (e) => {
            e.preventDefault()
            console.error('WebGL context lost')
            setRenderError('WebGL контекст потерян. Попробуйте перезагрузить страницу.')
          })
        }}
        dpr={isMobile ? [1, 1.5] : [1, 2]}
      >
        {isOrthographic ? (
          <OrthographicCamera
            makeDefault
            position={[0, 10, 0]}
            zoom={6.0}
            near={0.1}
            far={1000}
            up={[0, 1, 0]}
          />
        ) : (
          <PerspectiveCamera
            key={viewMode}
            makeDefault
            position={viewMode === 'first-person' ? undefined : getCameraPosition()}
            fov={viewMode === 'first-person' ? 75 : 55}
            near={0.5}
            far={2000}
          />
        )}

        <SceneContent />
        {!isMobile && <Effects />}
      </Canvas>
      </CanvasErrorBoundary>
    </div>
  )
}

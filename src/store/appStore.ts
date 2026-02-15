import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Zone, Event, Friend, Route, UserLocation, ViewMode, UIPanel, Notification } from '../types'

export type GraphicsQuality = 'high' | 'performance'
export type ToneMapping = 'ACES' | 'Linear' | 'Reinhard'
export type LightingPreset = 'studio' | 'architectural' | 'exhibition' | 'custom'
export type LightingMode = 'sky' | 'baked'

interface AppState {
  // User state
  userLocation: UserLocation | null
  setUserLocation: (location: UserLocation) => void

  // Zones
  zones: Zone[]
  setZones: (zones: Zone[]) => void
  selectedZone: Zone | null
  setSelectedZone: (zone: Zone | null) => void

  // Events
  events: Event[]
  selectedEvent: Event | null
  setSelectedEvent: (event: Event | null) => void
  favoriteEvents: string[]
  toggleFavoriteEvent: (eventId: string) => void

  // Friends
  friends: Friend[]
  selectedFriend: Friend | null
  setSelectedFriend: (friend: Friend | null) => void

  // Navigation
  currentRoute: Route | null
  setRoute: (route: Route | null) => void
  isNavigating: boolean
  setIsNavigating: (isNavigating: boolean) => void
  lastRouteDestination: [number, number, number] | null
  setLastRouteDestination: (position: [number, number, number] | null) => void

  // UI
  viewMode: ViewMode
  setViewMode: (mode: ViewMode) => void
  activePanel: UIPanel
  setActivePanel: (panel: UIPanel) => void
  showMiniMap: boolean
  toggleMiniMap: () => void
  showPOI: boolean
  togglePOI: () => void
  showFPS: boolean
  toggleFPS: () => void
  isFullscreen: boolean
  setIsFullscreen: (fullscreen: boolean) => void
  showUIInFullscreen: boolean
  toggleUIInFullscreen: () => void

  // Camera
  cameraTarget: string | null
  setCameraTarget: (target: string | null) => void
  cameraPosition: [number, number, number] | null
  setCameraPosition: (position: [number, number, number] | null) => void
  cameraTargetPosition: [number, number, number] | null
  setCameraTargetPosition: (position: [number, number, number] | null) => void
  // Overview camera reset trigger
  resetCameraToOverview: boolean
  setResetCameraToOverview: (reset: boolean) => void

  // Edit mode
  editMode: boolean
  setEditMode: (enabled: boolean) => void

  // POI Edit mode
  poiEditMode: boolean
  setPoiEditMode: (enabled: boolean) => void

  // Adjustments Toggle
  showAdjustments: boolean
  setShowAdjustments: (show: boolean) => void

  // Active bottom panel (which floating panel is open)
  activeBottomPanel: string | null
  setActiveBottomPanel: (panel: string | null) => void

  // AR
  arMode: boolean
  setArMode: (enabled: boolean) => void

  // Notifications
  notifications: Notification[]
  addNotification: (notification: Notification) => void
  removeNotification: (id: string) => void

  // Sun / Time of Day
  timeOfDay: number // 0-24 hours
  setTimeOfDay: (time: number) => void
  sunOrientation: number // 0-360 degrees
  setSunOrientation: (orientation: number) => void

  // Graphics Quality
  graphicsQuality: GraphicsQuality
  setGraphicsQuality: (quality: GraphicsQuality) => void

  // HDRI Environment Controls
  hdriFile: string
  setHdriFile: (file: string) => void
  showHdriBackground: boolean
  setShowHdriBackground: (show: boolean) => void
  hdriIntensity: number
  setHdriIntensity: (intensity: number) => void
  hdriRotation: number
  setHdriRotation: (rotation: number) => void
  hdriBlur: number
  setHdriBlur: (blur: number) => void
  
  // Per-environment settings
  neutralIntensity: number
  setNeutralIntensity: (intensity: number) => void
  neutralBlur: number
  setNeutralBlur: (blur: number) => void
  
  whiteIntensity: number
  setWhiteIntensity: (intensity: number) => void
  whiteBlur: number
  setWhiteBlur: (blur: number) => void
  
  skyIntensity: number
  setSkyIntensity: (intensity: number) => void
  skyBlur: number
  setSkyBlur: (blur: number) => void
  
  // Lighting Presets
  currentLightingPreset: string
  setCurrentLightingPreset: (preset: string) => void
  applyLightingPreset: (presetName: string) => void
  
  // Shadow Animation
  shadowAnimation: boolean
  setShadowAnimation: (enabled: boolean) => void
  shadowAnimationSpeed: number
  setShadowAnimationSpeed: (speed: number) => void
  shadowAnimationType: 'oscillate' | 'pulse' | 'breathe'
  setShadowAnimationType: (type: 'oscillate' | 'pulse' | 'breathe') => void
  
  // Neutral Lighting Controls
  neutralAmbientIntensity: number
  setNeutralAmbientIntensity: (intensity: number) => void
  neutralLightIntensity: number
  setNeutralLightIntensity: (intensity: number) => void
  neutralLightHeight: number
  setNeutralLightHeight: (height: number) => void
  neutralLightAngle: number
  setNeutralLightAngle: (angle: number) => void
  neutralHemisphereIntensity: number
  setNeutralHemisphereIntensity: (intensity: number) => void
  
  // Studio Lighting Controls
  studioKeyLightIntensity: number
  setStudioKeyLightIntensity: (intensity: number) => void
  studioKeyLightHeight: number
  setStudioKeyLightHeight: (height: number) => void
  studioKeyLightAngle: number
  setStudioKeyLightAngle: (angle: number) => void
  studioFillLightIntensity: number
  setStudioFillLightIntensity: (intensity: number) => void
  studioRimLightIntensity: number
  setStudioRimLightIntensity: (intensity: number) => void
  studioLightColor: string
  setStudioLightColor: (color: string) => void
  
  // Global Effects
  ssaaoEnabled: boolean
  setSsaaoEnabled: (enabled: boolean) => void

  // Shadow Controls
  shadowIntensity: number
  setShadowIntensity: (intensity: number) => void
  
  // Debug Mode
  debugMode: boolean
  setDebugMode: (enabled: boolean) => void

  // Tone Mapping
  toneMapping: ToneMapping
  setToneMapping: (toneMapping: ToneMapping) => void
  toneMappingExposure: number
  setToneMappingExposure: (exposure: number) => void

  // Post-processing effects
  dofEnabled: boolean
  setDofEnabled: (enabled: boolean) => void
  bloomIntensity: number
  setBloomIntensity: (intensity: number) => void
  bloomThreshold: number
  setBloomThreshold: (threshold: number) => void
  vignetteIntensity: number
  setVignetteIntensity: (intensity: number) => void
  chromaticAberration: number
  setChromaticAberration: (value: number) => void
  contactShadowsEnabled: boolean
  setContactShadowsEnabled: (enabled: boolean) => void

  // Color adjustments
  colorBrightness: number
  setColorBrightness: (brightness: number) => void
  colorContrast: number
  setColorContrast: (contrast: number) => void
  colorSaturation: number
  setColorSaturation: (saturation: number) => void

  // Night mode lighting
  nightLightsEnabled: boolean
  setNightLightsEnabled: (enabled: boolean) => void
  nightLightsIntensity: number
  setNightLightsIntensity: (intensity: number) => void

  // Material Settings
  materialColor: string
  setMaterialColor: (color: string) => void
  materialRoughness: number
  setMaterialRoughness: (roughness: number) => void
  materialMetalness: number
  setMaterialMetalness: (metalness: number) => void
  aoIntensity: number
  setAoIntensity: (intensity: number) => void
  envMapIntensity: number
  setEnvMapIntensity: (intensity: number) => void
  lightmapIntensity: number
  setLightmapIntensity: (intensity: number) => void

  // Lighting Mode
  lightingMode: LightingMode
  setLightingMode: (mode: LightingMode) => void

  // Lighting Preset
  lightingPreset: LightingPreset
  setLightingPreset: (preset: LightingPreset) => void

  // Zone Mesh Mapping
  zoneMeshMapping: Record<string, string>
  setZoneMeshMapping: (mapping: Record<string, string>) => void
}

export const useAppStore = create<AppState>()(persist((set) => ({
  // User
  userLocation: null,
  setUserLocation: (location) => set({ userLocation: location }),

  // Zones - initialized with empty array, will be loaded from mockData
  zones: [],
  selectedZone: null,
  setSelectedZone: (zone) => set({ selectedZone: zone }),
  setZones: (zones) => set({ zones }),

  // Events
  events: [],
  selectedEvent: null,
  setSelectedEvent: (event) => set({ selectedEvent: event }),
  favoriteEvents: [],
  toggleFavoriteEvent: (eventId) => set((state) => ({
    favoriteEvents: state.favoriteEvents.includes(eventId)
      ? state.favoriteEvents.filter(id => id !== eventId)
      : [...state.favoriteEvents, eventId]
  })),

  // Friends
  friends: [],
  selectedFriend: null,
  setSelectedFriend: (friend) => set({ selectedFriend: friend }),

  // Navigation
  currentRoute: null,
  setRoute: (route) => set({ currentRoute: route }),
  isNavigating: false,
  setIsNavigating: (isNavigating) => set({ isNavigating }),
  lastRouteDestination: null,
  setLastRouteDestination: (position) => set({ lastRouteDestination: position }),

  // UI
  viewMode: 'angle', // Главный вид - перспектива
  setViewMode: (mode) => set({ viewMode: mode }),
  activePanel: null,
  setActivePanel: (panel) => set({ activePanel: panel }),
  showMiniMap: true,
  toggleMiniMap: () => set((state) => ({ showMiniMap: !state.showMiniMap })),
  showPOI: false,
  togglePOI: () => set((state) => ({ showPOI: !state.showPOI })),
  showFPS: false,
  toggleFPS: () => set((state) => ({ showFPS: !state.showFPS })),
  isFullscreen: false,
  setIsFullscreen: (fullscreen) => set({ isFullscreen: fullscreen }),
  showUIInFullscreen: false,
  toggleUIInFullscreen: () => set((state) => ({ showUIInFullscreen: !state.showUIInFullscreen })),

  // AR
  arMode: false,
  setArMode: (enabled) => set({ arMode: enabled }),

  // Graphics Quality
  graphicsQuality: 'high',
  setGraphicsQuality: (quality) => set({ graphicsQuality: quality }),

  // HDRi Settings
  hdriFile: 'textures/env/kloppenheim_06_puresky_1k.hdr',
  setHdriFile: (file) => set({ hdriFile: file }),
  showHdriBackground: true,
  setShowHdriBackground: (show) => set({ showHdriBackground: show }),
  hdriIntensity: 1.0,
  setHdriIntensity: (intensity) => set({ hdriIntensity: intensity }),
  hdriRotation: 0,
  setHdriRotation: (rotation) => set({ hdriRotation: rotation }),
  hdriBlur: 0,
  setHdriBlur: (blur) => set({ hdriBlur: blur }),
  
  // Per-environment settings
  neutralIntensity: 0.8,
  setNeutralIntensity: (intensity) => set({ neutralIntensity: intensity }),
  neutralBlur: 0.2,
  setNeutralBlur: (blur) => set({ neutralBlur: blur }),
  
  whiteIntensity: 0.9,
  setWhiteIntensity: (intensity) => set({ whiteIntensity: intensity }),
  whiteBlur: 0.1,
  setWhiteBlur: (blur) => set({ whiteBlur: blur }),
  
  skyIntensity: 0.7,
  setSkyIntensity: (intensity) => set({ skyIntensity: intensity }),
  skyBlur: 0.3,
  setSkyBlur: (blur) => set({ skyBlur: blur }),
  
  // Lighting Presets (Model Viewer style)
  currentLightingPreset: 'neutral',
  setCurrentLightingPreset: (preset) => set({ currentLightingPreset: preset }),
  applyLightingPreset: (presetName) => {
    const presets = {
      neutral: { intensity: 1.0, rotation: 0, blur: 0.1 },
      studio: { intensity: 1.5, rotation: 45, blur: 0.05 },
      warehouse: { intensity: 0.8, rotation: 180, blur: 0.3 },
      outdoor: { intensity: 1.2, rotation: 270, blur: 0.2 }
    }
    
    const preset = presets[presetName as keyof typeof presets]
    if (preset) {
      set({ 
        hdriIntensity: preset.intensity,
        hdriRotation: preset.rotation,
        hdriBlur: preset.blur,
        currentLightingPreset: presetName
      })
    }
  },
  
  // Shadow Animation
  shadowAnimation: false,
  setShadowAnimation: (enabled) => set({ shadowAnimation: enabled }),
  shadowAnimationSpeed: 50,
  setShadowAnimationSpeed: (speed) => set({ shadowAnimationSpeed: speed }),
  shadowAnimationType: 'oscillate',
  setShadowAnimationType: (type) => set({ shadowAnimationType: type }),
  
  // Neutral Lighting Controls
  neutralAmbientIntensity: 0.6,
  setNeutralAmbientIntensity: (intensity) => set({ neutralAmbientIntensity: intensity }),
  neutralLightIntensity: 0.8,
  setNeutralLightIntensity: (intensity) => set({ neutralLightIntensity: intensity }),
  neutralLightHeight: 30,
  setNeutralLightHeight: (height) => set({ neutralLightHeight: height }),
  neutralLightAngle: 0,
  setNeutralLightAngle: (angle) => set({ neutralLightAngle: angle }),
  neutralHemisphereIntensity: 0.4,
  setNeutralHemisphereIntensity: (intensity) => set({ neutralHemisphereIntensity: intensity }),
  
  // Studio Lighting Controls
  studioKeyLightIntensity: 0.8,
  setStudioKeyLightIntensity: (intensity) => set({ studioKeyLightIntensity: intensity }),
  studioKeyLightHeight: 40,
  setStudioKeyLightHeight: (height) => set({ studioKeyLightHeight: height }),
  studioKeyLightAngle: 45,
  setStudioKeyLightAngle: (angle) => set({ studioKeyLightAngle: angle }),
  studioFillLightIntensity: 0.4,
  setStudioFillLightIntensity: (intensity) => set({ studioFillLightIntensity: intensity }),
  studioRimLightIntensity: 0.3,
  setStudioRimLightIntensity: (intensity) => set({ studioRimLightIntensity: intensity }),
  studioLightColor: '#ffffff',
  setStudioLightColor: (color) => set({ studioLightColor: color }),
  
  // Global Effects
  ssaaoEnabled: false, // Disabled by default for better performance
  setSsaaoEnabled: (enabled) => set({ ssaaoEnabled: enabled }),

  // Shadow Controls
  shadowIntensity: 0.3,
  setShadowIntensity: (intensity) => set({ shadowIntensity: intensity }),
  
  // Debug Mode
  debugMode: false,
  setDebugMode: (enabled) => set({ debugMode: enabled }),

  // Tone Mapping
  toneMapping: 'ACES',
  setToneMapping: (toneMapping) => set({ toneMapping }),
  toneMappingExposure: 1.0,
  setToneMappingExposure: (exposure) => set({ toneMappingExposure: exposure }),

  // Post-processing effects
  dofEnabled: false,
  setDofEnabled: (enabled) => set({ dofEnabled: enabled }),
  bloomIntensity: 0.5,
  setBloomIntensity: (intensity) => set({ bloomIntensity: intensity }),
  bloomThreshold: 0.9,
  setBloomThreshold: (threshold) => set({ bloomThreshold: threshold }),
  vignetteIntensity: 0.35,
  setVignetteIntensity: (intensity) => set({ vignetteIntensity: intensity }),
  chromaticAberration: 0.002,
  setChromaticAberration: (value) => set({ chromaticAberration: value }),
  contactShadowsEnabled: true,
  setContactShadowsEnabled: (enabled) => set({ contactShadowsEnabled: enabled }),

  // Color adjustments
  colorBrightness: 0.0,
  setColorBrightness: (brightness) => set({ colorBrightness: brightness }),
  colorContrast: 0.05,
  setColorContrast: (contrast) => set({ colorContrast: contrast }),
  colorSaturation: 0.1,
  setColorSaturation: (saturation) => set({ colorSaturation: saturation }),

  // Camera
  cameraTarget: null,
  setCameraTarget: (target) => set({ cameraTarget: target }),
  cameraPosition: null,
  setCameraPosition: (position) => set({ cameraPosition: position }),
  cameraTargetPosition: null,
  setCameraTargetPosition: (position) => set({ cameraTargetPosition: position }),
  // Overview camera reset
  resetCameraToOverview: false,
  setResetCameraToOverview: (reset) => set({ resetCameraToOverview: reset }),

  // Edit mode
  editMode: false,
  setEditMode: (enabled) => set({ editMode: enabled }),

  // POI Edit mode
  poiEditMode: false,
  setPoiEditMode: (enabled) => set({ poiEditMode: enabled }),

  // Adjustments Toggle
  showAdjustments: false,
  setShowAdjustments: (show) => set({ showAdjustments: show }),

  // Active bottom panel
  activeBottomPanel: null,
  setActiveBottomPanel: (panel) => set({ activeBottomPanel: panel }),

  // Notifications
  notifications: [],
  addNotification: (notification) => set((state) => ({
    notifications: [...state.notifications, notification]
  })),
  removeNotification: (id) => set((state) => ({
    notifications: state.notifications.filter(n => n.id !== id)
  })),

  // Sun / Time of Day
  timeOfDay: 14, // 2 PM default
  setTimeOfDay: (time) => set({ timeOfDay: time }),
  sunOrientation: 180,
  setSunOrientation: (orientation) => set({ sunOrientation: orientation }),

  // Night mode lighting
  nightLightsEnabled: true,
  setNightLightsEnabled: (enabled) => set({ nightLightsEnabled: enabled }),
  nightLightsIntensity: 1.0,
  setNightLightsIntensity: (intensity) => set({ nightLightsIntensity: intensity }),

  // Material Settings
  materialColor: '#d4d4d4',
  setMaterialColor: (color) => set({ materialColor: color }),
  materialRoughness: 0.7,
  setMaterialRoughness: (roughness) => set({ materialRoughness: roughness }),
  materialMetalness: 0.05,
  setMaterialMetalness: (metalness) => set({ materialMetalness: metalness }),
  aoIntensity: 1.5,
  setAoIntensity: (intensity) => set({ aoIntensity: intensity }),
  envMapIntensity: 0.4,
  setEnvMapIntensity: (intensity) => set({ envMapIntensity: intensity }),
  lightmapIntensity: 1.5,
  setLightmapIntensity: (intensity) => set({ lightmapIntensity: intensity }),
  lightingMode: 'baked' as LightingMode,
  setLightingMode: (mode) => set({ lightingMode: mode }),
  
  // Lighting Preset
  lightingPreset: 'studio',
  setLightingPreset: (preset) => set({ lightingPreset: preset }),

  // Zone Mesh Mapping
  zoneMeshMapping: {
    'Конференц-зал I': 'Конференц-зал_1',
    'Конференц-зал II': 'Конференц-зал_2',
    'Конференц-зал III': 'Конференц-зал_3',
    'Конференц-зал IV': 'Конференц-зал_4',
    'Овальный зал': 'Овальный_зал',
    'Зал пленарного заседания': 'Зал_пленарного_заседания',
    'VIP-зал': 'VIP-зал',
    'Арт-объект': 'Арт-объект',
    'Пресс-подход 1': 'Пресс-подход_1',
    'Пресс-подход 2': 'Пресс-подход_2',
    'Лаунж-зона 1': 'Лаунж-зона_1',
    'Лаунж-зона 2': 'Лаунж-зона_2',
    'Аккредитация': 'Аккредитация',
    'Инфо-стойка': 'Инфо-стойка',
    'Экспозиция': 'Экспозиция',
    'Фойе': 'Фойе',
    'Фото-зона': 'Фото-зона',
  },
  setZoneMeshMapping: (mapping) => set({ zoneMeshMapping: mapping }),
}), {
  name: 'mff-lighting-settings',
  version: 8,
  migrate: (persistedState: any, version: number) => {
    // v8: Reset all lighting defaults for Baked mode
    if (version < 8) {
      persistedState.lightingMode = 'baked'
      persistedState.materialColor = '#d4d4d4'
      persistedState.materialRoughness = 0.7
      persistedState.materialMetalness = 0.05
      persistedState.aoIntensity = 1.5
      persistedState.envMapIntensity = 0.4
      persistedState.lightmapIntensity = 1.5
      persistedState.hdriIntensity = 1.0
      persistedState.toneMappingExposure = 1.0
    }

    // List of available HDRI files
    const availableHdriFiles = [
      'textures/env/citrus_orchard_road_puresky_1k.hdr',
      'textures/env/env_map.hdr',
      'textures/env/kloppenheim_06_puresky_1k.hdr',
      'textures/env/qwantani_sunset_puresky_1k.hdr'
    ]

    if (persistedState.hdriFile && !availableHdriFiles.includes(persistedState.hdriFile)) {
      persistedState.hdriFile = 'textures/env/kloppenheim_06_puresky_1k.hdr'
    }

    return persistedState
  },
  partialize: (state) => ({
    // Only persist lighting settings
    timeOfDay: state.timeOfDay,
    sunOrientation: state.sunOrientation,
    hdriFile: state.hdriFile,
    hdriRotation: state.hdriRotation,
    hdriBlur: state.hdriBlur,
    nightLightsEnabled: state.nightLightsEnabled,
    nightLightsIntensity: state.nightLightsIntensity,
    materialColor: state.materialColor,
    materialRoughness: state.materialRoughness,
    materialMetalness: state.materialMetalness,
    aoIntensity: state.aoIntensity,
    envMapIntensity: state.envMapIntensity,
    lightmapIntensity: state.lightmapIntensity,
    lightingPreset: state.lightingPreset,
    lightingMode: state.lightingMode,
    graphicsQuality: state.graphicsQuality,
    showHdriBackground: state.showHdriBackground,
    hdriIntensity: state.hdriIntensity,
    toneMapping: state.toneMapping,
    toneMappingExposure: state.toneMappingExposure,
    dofEnabled: state.dofEnabled,
    bloomIntensity: state.bloomIntensity,
    bloomThreshold: state.bloomThreshold,
    vignetteIntensity: state.vignetteIntensity,
    chromaticAberration: state.chromaticAberration,
    contactShadowsEnabled: state.contactShadowsEnabled,
    colorBrightness: state.colorBrightness,
    colorContrast: state.colorContrast,
    colorSaturation: state.colorSaturation,
    currentLightingPreset: state.currentLightingPreset,
    shadowAnimation: state.shadowAnimation,
    shadowAnimationSpeed: state.shadowAnimationSpeed,
    shadowAnimationType: state.shadowAnimationType,
    neutralAmbientIntensity: state.neutralAmbientIntensity,
    neutralLightIntensity: state.neutralLightIntensity,
    neutralLightHeight: state.neutralLightHeight,
    neutralLightAngle: state.neutralLightAngle,
    neutralHemisphereIntensity: state.neutralHemisphereIntensity,
    studioKeyLightIntensity: state.studioKeyLightIntensity,
    studioKeyLightHeight: state.studioKeyLightHeight,
    studioKeyLightAngle: state.studioKeyLightAngle,
    studioFillLightIntensity: state.studioFillLightIntensity,
    studioRimLightIntensity: state.studioRimLightIntensity,
    studioLightColor: state.studioLightColor,
    ssaaoEnabled: state.ssaaoEnabled,
    shadowIntensity: state.shadowIntensity,
    debugMode: state.debugMode,
    neutralIntensity: state.neutralIntensity,
    neutralBlur: state.neutralBlur,
    whiteIntensity: state.whiteIntensity,
    whiteBlur: state.whiteBlur,
    skyIntensity: state.skyIntensity,
    skyBlur: state.skyBlur,
  }),
}))

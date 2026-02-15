# Netlify 5 Million Devs - Визуальный анализ

## Источники
- Проект: https://www.littleworkshop.fr/projects/5milliondevs/
- Студия: Little Workshop (Paris)
- Награды: FWA Site of the Day

## Обзор проекта

Gamified 3D experience в стиле Marble Madness для празднования 5 миллионов разработчиков Netlify. Создан студией Little Workshop за 8 недель двумя разработчиками.

## Технический стек

### Основные технологии
- **Three.js** - 3D рендеринг
- **Custom render pipeline** - собственный рендер пайплайн
- **Custom shaders** - кастомные шейдеры
- **Rapier** - физический движок (Rust через WASM)
- **CSS 3D transforms** - для интеграции 2D UI с 3D

### Workflow
1. Дизайн уровней в **Unity**
2. Оптимизация через **Blender** pipeline
3. Экспорт в **GLTF** для браузера
4. Загрузка и рендеринг в Three.js

## Визуальный стиль

### Общая эстетика
- **Playful & Vibrant** - игривый и яркий
- **Digital Playground** - цифровая игровая площадка
- **Isometric view** - изометрическая перспектива
- **Arcade feel** - аркадное ощущение
- **Cartoon/Stylized** - мультяшный стилизованный вид

### Цветовая палитра
Судя по описанию "vibrant and playful art direction":
- Яркие, насыщенные цвета
- Высокий контраст
- Чистые, четкие оттенки
- Возможно градиенты для акцентов
- Светлый, оптимистичный тон

### Характеристики визуала
- **Smooth performance** - плавная производительность на desktop и mobile
- **Polished feel** - отполированное ощущение
- **Clean aesthetics** - чистая эстетика
- **Bouncy physics** - упругая физика

## Освещение

### Предполагаемая схема освещения

Основываясь на описании "playful" и "vibrant", вероятная схема:

#### 1. Ambient Light
```javascript
// Яркое окружающее освещение для мультяшного вида
<ambientLight intensity={0.8} color="#ffffff" />
```

#### 2. Directional Light (Key Light)
```javascript
// Основной направленный свет с мягкими тенями
<directionalLight
  position={[10, 20, 10]}
  intensity={1.5}
  castShadow
  shadow-mapSize={[2048, 2048]}
  shadow-bias={-0.0001}
/>
```

#### 3. Hemisphere Light
```javascript
// Для мягкого заполняющего света
<hemisphereLight
  skyColor="#87ceeb"  // Светло-голубой
  groundColor="#ffffff"
  intensity={0.6}
/>
```

#### 4. Rim Lighting (возможно)
```javascript
// Для выделения контуров объектов
<directionalLight
  position={[-5, 5, -5]}
  intensity={0.4}
  color="#a0d8ff"
/>
```

### Характеристики освещения
- **Soft shadows** - мягкие тени (не резкие)
- **High ambient** - высокое окружающее освещение
- **Minimal contrast** - минимальный контраст теней
- **Bright overall** - общая яркость
- **No dramatic shadows** - без драматичных теней

## Материалы

### Тип материалов

Судя по стилю "playful" и "vibrant", вероятно используются:

#### 1. Toon/Cel Shading (основной стиль)
```javascript
// Custom toon shader material
const toonMaterial = new THREE.ShaderMaterial({
  uniforms: {
    uColor: { value: new THREE.Color('#ff6b6b') },
    uLightPosition: { value: new THREE.Vector3(10, 20, 10) },
    uSteps: { value: 3 }, // Количество градаций цвета
  },
  vertexShader: `
    varying vec3 vNormal;
    varying vec3 vPosition;
    
    void main() {
      vNormal = normalize(normalMatrix * normal);
      vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform vec3 uColor;
    uniform vec3 uLightPosition;
    uniform float uSteps;
    
    varying vec3 vNormal;
    varying vec3 vPosition;
    
    void main() {
      vec3 lightDir = normalize(uLightPosition - vPosition);
      float NdotL = dot(vNormal, lightDir);
      
      // Toon shading - дискретные уровни освещения
      float intensity = floor(NdotL * uSteps) / uSteps;
      intensity = max(intensity, 0.3); // Минимальная яркость
      
      vec3 color = uColor * intensity;
      gl_FragColor = vec4(color, 1.0);
    }
  `
})
```

#### 2. Flat Shading с яркими цветами
```javascript
// MeshToonMaterial для простых объектов
const material = new THREE.MeshToonMaterial({
  color: '#4ecdc4',
  gradientMap: createToonGradient(3), // 3 уровня
})

function createToonGradient(steps) {
  const colors = new Uint8Array(steps)
  for (let i = 0; i < steps; i++) {
    colors[i] = (i / steps) * 255
  }
  const gradientMap = new THREE.DataTexture(
    colors, 
    steps, 
    1, 
    THREE.LuminanceFormat
  )
  gradientMap.needsUpdate = true
  return gradientMap
}
```

#### 3. Outline/Contour Shader
```javascript
// Для контуров объектов (cartoon style)
const outlineMaterial = new THREE.ShaderMaterial({
  side: THREE.BackSide,
  uniforms: {
    uThickness: { value: 0.03 },
    uColor: { value: new THREE.Color('#000000') }
  },
  vertexShader: `
    uniform float uThickness;
    
    void main() {
      vec3 newPosition = position + normal * uThickness;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
    }
  `,
  fragmentShader: `
    uniform vec3 uColor;
    
    void main() {
      gl_FragColor = vec4(uColor, 1.0);
    }
  `
})
```

### Характеристики материалов

#### Marble (шарик)
```javascript
const marbleMaterial = new THREE.MeshStandardMaterial({
  color: '#ffffff',
  metalness: 0.1,
  roughness: 0.2,
  envMapIntensity: 1.5,
  // Возможно с custom shader для toon эффекта
})
```

#### Level Geometry (уровни)
```javascript
const levelMaterial = new THREE.MeshToonMaterial({
  color: '#colorful', // Разные цвета для разных секций
  flatShading: true,
  // Или custom toon shader
})
```

#### Interactive Elements (интерактивные элементы)
```javascript
// Bounce pads, elevators, etc.
const interactiveMaterial = new THREE.MeshToonMaterial({
  color: '#vibrant',
  emissive: '#glow',
  emissiveIntensity: 0.3,
})
```

## Custom Render Pipeline

### Возможные компоненты

#### 1. Toon Rendering Pass
```javascript
// Custom pass для toon эффекта
class ToonRenderPass extends Pass {
  constructor() {
    super()
    this.material = new THREE.ShaderMaterial({
      uniforms: {
        tDiffuse: { value: null },
        uSteps: { value: 4 },
        uOutlineThickness: { value: 1.0 },
        uOutlineColor: { value: new THREE.Color('#000000') }
      },
      vertexShader: toonVertexShader,
      fragmentShader: toonFragmentShader
    })
  }
  
  render(renderer, writeBuffer, readBuffer) {
    this.material.uniforms.tDiffuse.value = readBuffer.texture
    // Render to writeBuffer
  }
}
```

#### 2. Outline Pass
```javascript
// Для контуров объектов
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass'

const outlinePass = new OutlinePass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  scene,
  camera
)
outlinePass.edgeStrength = 3.0
outlinePass.edgeGlow = 0.0
outlinePass.edgeThickness = 1.0
outlinePass.visibleEdgeColor.set('#000000')
```

#### 3. Color Grading
```javascript
// Для яркой, насыщенной палитры
const colorGradingPass = new ShaderPass({
  uniforms: {
    tDiffuse: { value: null },
    uSaturation: { value: 1.3 },
    uBrightness: { value: 0.1 },
    uContrast: { value: 1.1 }
  },
  vertexShader: defaultVertexShader,
  fragmentShader: colorGradingFragmentShader
})
```

#### 4. Anti-aliasing
```javascript
// FXAA или SMAA для smooth edges
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader'

const fxaaPass = new ShaderPass(FXAAShader)
fxaaPass.material.uniforms['resolution'].value.x = 1 / window.innerWidth
fxaaPass.material.uniforms['resolution'].value.y = 1 / window.innerHeight
```

## Постпроцессинг эффекты

### Вероятный EffectComposer setup

```javascript
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass'

const composer = new EffectComposer(renderer)

// 1. Основной рендер
const renderPass = new RenderPass(scene, camera)
composer.addPass(renderPass)

// 2. Outline для cartoon стиля
const outlinePass = new OutlinePass(
  new THREE.Vector2(width, height),
  scene,
  camera
)
composer.addPass(outlinePass)

// 3. Легкий bloom для свечения
const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(width, height),
  0.3,  // strength - низкая для subtle эффекта
  0.4,  // radius
  0.85  // threshold
)
composer.addPass(bloomPass)

// 4. Color grading для vibrant цветов
const colorGradingPass = new ShaderPass(ColorGradingShader)
composer.addPass(colorGradingPass)

// 5. FXAA для smooth edges
const fxaaPass = new ShaderPass(FXAAShader)
composer.addPass(fxaaPass)
```

## Тени

### Настройки теней

```javascript
// Renderer
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap // Мягкие тени

// Directional Light
directionalLight.castShadow = true
directionalLight.shadow.mapSize.width = 2048
directionalLight.shadow.mapSize.height = 2048
directionalLight.shadow.camera.near = 0.5
directionalLight.shadow.camera.far = 500
directionalLight.shadow.bias = -0.0001
directionalLight.shadow.radius = 2 // Для мягкости

// Объекты
mesh.castShadow = true
mesh.receiveShadow = true
```

### Характеристики теней
- **Soft shadows** - мягкие, не резкие
- **Subtle** - ненавязчивые
- **High resolution** - высокое разрешение (2048x2048)
- **Minimal darkness** - минимальная темнота

## Оптимизация для мобильных

### Адаптивные настройки

```javascript
const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)

// Качество теней
const shadowMapSize = isMobile ? 1024 : 2048

// Pixel ratio
renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 2 : 2))

// Постпроцессинг
if (isMobile) {
  // Упрощенный pipeline
  composer.addPass(renderPass)
  composer.addPass(fxaaPass)
} else {
  // Полный pipeline
  composer.addPass(renderPass)
  composer.addPass(outlinePass)
  composer.addPass(bloomPass)
  composer.addPass(colorGradingPass)
  composer.addPass(fxaaPass)
}
```

## Примеры кода

### Полный setup сцены

```javascript
import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass'

// Scene setup
const scene = new THREE.Scene()
scene.background = new THREE.Color('#87ceeb') // Sky blue

// Camera - isometric style
const camera = new THREE.OrthographicCamera(
  -10, 10, 10, -10, 0.1, 1000
)
camera.position.set(10, 10, 10)
camera.lookAt(0, 0, 0)

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 1.2

// Lighting
const ambientLight = new THREE.AmbientLight('#ffffff', 0.8)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight('#ffffff', 1.5)
directionalLight.position.set(10, 20, 10)
directionalLight.castShadow = true
directionalLight.shadow.mapSize.set(2048, 2048)
directionalLight.shadow.bias = -0.0001
directionalLight.shadow.radius = 2
scene.add(directionalLight)

const hemisphereLight = new THREE.HemisphereLight(
  '#87ceeb', // sky
  '#ffffff', // ground
  0.6
)
scene.add(hemisphereLight)

// Toon Material
const toonMaterial = new THREE.MeshToonMaterial({
  color: '#4ecdc4',
  gradientMap: createToonGradient(3)
})

// Geometry
const geometry = new THREE.BoxGeometry(2, 2, 2)
const mesh = new THREE.Mesh(geometry, toonMaterial)
mesh.castShadow = true
mesh.receiveShadow = true
scene.add(mesh)

// Post-processing
const composer = new EffectComposer(renderer)
const renderPass = new RenderPass(scene, camera)
composer.addPass(renderPass)

const outlinePass = new OutlinePass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  scene,
  camera
)
outlinePass.edgeStrength = 3.0
outlinePass.edgeThickness = 1.0
outlinePass.visibleEdgeColor.set('#000000')
composer.addPass(outlinePass)

// Animation loop
function animate() {
  requestAnimationFrame(animate)
  composer.render()
}
animate()
```

### Toon Gradient Helper

```javascript
function createToonGradient(steps = 3) {
  const colors = new Uint8Array(steps)
  
  for (let i = 0; i < steps; i++) {
    // Создаем дискретные уровни яркости
    colors[i] = Math.floor((i / (steps - 1)) * 255)
  }
  
  const gradientMap = new THREE.DataTexture(
    colors,
    steps,
    1,
    THREE.LuminanceFormat
  )
  gradientMap.minFilter = THREE.NearestFilter
  gradientMap.magFilter = THREE.NearestFilter
  gradientMap.needsUpdate = true
  
  return gradientMap
}
```

### Custom Toon Shader

```javascript
const ToonShader = {
  uniforms: {
    uColor: { value: new THREE.Color('#4ecdc4') },
    uLightPosition: { value: new THREE.Vector3(10, 20, 10) },
    uSteps: { value: 3 },
    uAmbient: { value: 0.3 },
    uOutlineColor: { value: new THREE.Color('#000000') },
    uOutlineThickness: { value: 0.03 }
  },
  
  vertexShader: `
    varying vec3 vNormal;
    varying vec3 vPosition;
    varying vec3 vViewPosition;
    
    void main() {
      vNormal = normalize(normalMatrix * normal);
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      vPosition = mvPosition.xyz;
      vViewPosition = -mvPosition.xyz;
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  
  fragmentShader: `
    uniform vec3 uColor;
    uniform vec3 uLightPosition;
    uniform float uSteps;
    uniform float uAmbient;
    
    varying vec3 vNormal;
    varying vec3 vPosition;
    varying vec3 vViewPosition;
    
    void main() {
      // Normalize vectors
      vec3 normal = normalize(vNormal);
      vec3 lightDir = normalize(uLightPosition - vPosition);
      vec3 viewDir = normalize(vViewPosition);
      
      // Diffuse lighting
      float NdotL = max(dot(normal, lightDir), 0.0);
      
      // Toon shading - дискретные уровни
      float intensity = floor(NdotL * uSteps) / uSteps;
      intensity = max(intensity, uAmbient);
      
      // Rim lighting для контура
      float rim = 1.0 - max(dot(viewDir, normal), 0.0);
      rim = smoothstep(0.6, 1.0, rim);
      
      // Final color
      vec3 color = uColor * intensity + vec3(rim * 0.2);
      
      gl_FragColor = vec4(color, 1.0);
    }
  `
}
```

## Применение в вашем проекте

### Интеграция toon стиля

```javascript
// В VenueModel.tsx
import { useMemo } from 'react'
import * as THREE from 'three'

function VenueModel() {
  const toonMaterial = useMemo(() => {
    const gradientMap = createToonGradient(4)
    
    return new THREE.MeshToonMaterial({
      color: '#bcbcbc',
      gradientMap: gradientMap,
      // Или custom shader для большего контроля
    })
  }, [])
  
  // Применить к модели
  // ...
}
```

### Добавление outline эффекта

```javascript
// В Effects.tsx
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass'
import { useThree } from '@react-three/fiber'

function Effects() {
  const { scene, camera, size } = useThree()
  
  return (
    <EffectComposer>
      <renderPass />
      
      {/* Outline для cartoon стиля */}
      <outlinePass
        args={[new THREE.Vector2(size.width, size.height), scene, camera]}
        edgeStrength={3.0}
        edgeThickness={1.0}
        visibleEdgeColor="#000000"
      />
      
      {/* Остальные эффекты */}
      <bloom intensity={0.3} />
      <fxaa />
    </EffectComposer>
  )
}
```

## Ключевые выводы

### Визуальный стиль
1. **Toon/Cel shading** - основа визуального стиля
2. **Vibrant colors** - яркие, насыщенные цвета
3. **Soft shadows** - мягкие, ненавязчивые тени
4. **High ambient light** - высокое окружающее освещение
5. **Outline/contours** - контуры для cartoon эффекта

### Освещение
1. **Bright overall** - общая яркость сцены
2. **Minimal contrast** - минимальный контраст теней
3. **Multiple light sources** - ambient + directional + hemisphere
4. **Soft shadow mapping** - PCFSoftShadowMap

### Материалы
1. **MeshToonMaterial** - для простых объектов
2. **Custom toon shaders** - для продвинутого контроля
3. **Gradient maps** - для дискретных уровней освещения
4. **Outline shaders** - для контуров

### Производительность
1. **Optimized for mobile** - оптимизация для мобильных
2. **Adaptive quality** - адаптивное качество
3. **Efficient pipeline** - эффективный render pipeline
4. **Smooth 60fps** - плавные 60 FPS

---

*Документ создан: 2026-02-13*
*Статус: Анализ на основе доступной информации*

# 3D Landing Page Techniques - Исследование

## Источники
- CodeSandbox пример: https://codesandbox.io/p/sandbox/chocolate-landing-page-8n3vsz
- Codrops Tutorial: https://tympanus.net/codrops/2019/12/16/scroll-refraction-and-shader-effects-in-three-js-and-react/
- React Three Fiber документация: https://r3f.docs.pmnd.rs/

## Обзор

3D landing pages с прокруткой - популярная техника для создания впечатляющих веб-сайтов. Основные компоненты:
- React Three Fiber для декларативного Three.js
- Scroll-based анимации
- Смешивание HTML и Canvas
- Shader эффекты (рефракция, искажения)
- Lazy loading через React.Suspense

## Технологический стек

### Основные библиотеки
```json
{
  "react": "^18.x",
  "three": "^0.150+",
  "@react-three/fiber": "^8.x",
  "@react-three/drei": "^9.x",
  "react-spring": "^9.x" // для анимаций (опционально)
}
```

### Дополнительные инструменты
- GSAP - для сложных timeline анимаций
- Leva - для debug GUI
- Theatre.js - для camera fly-through анимаций
- Framer Motion - для DOM анимаций

## Архитектура Scroll Rig

### Концепция

Создание декларативной системы прокрутки, где:
- Контент разделен на виртуальные секции
- Каждая секция = 100vh
- Количество страниц определяет длину прокрутки
- Canvas синхронизирован с DOM scroll

### Базовая структура

```javascript
import { Canvas } from '@react-three/fiber'
import { useRef, useEffect } from 'react'

// Глобальное состояние для scroll
const state = {
  top: { current: 0 },
  pages: 3, // количество страниц
  sections: 3, // количество секций
  zoom: 1
}

function App() {
  const scrollArea = useRef()
  
  const onScroll = (e) => {
    state.top.current = e.target.scrollTop
  }
  
  // Синхронизация при первом рендере
  useEffect(() => {
    onScroll({ target: scrollArea.current })
  }, [])
  
  return (
    <>
      {/* Canvas для 3D */}
      <Canvas 
        orthographic 
        camera={{ zoom: 1, position: [0, 0, 500] }}
      >
        <Scene />
      </Canvas>
      
      {/* Scroll область */}
      <div 
        ref={scrollArea} 
        onScroll={onScroll}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          overflow: 'auto'
        }}
      >
        {/* Определяет высоту прокрутки */}
        <div style={{ height: `${state.pages * 100}vh` }} />
      </div>
    </>
  )
}
```

### Почему не эмулировать scroll?

- Сохраняются нативные браузерные семантики
- Работает accessibility (screen readers)
- Работают нативные жесты (touch, trackpad)
- Работает keyboard navigation
- Работает browser history (back/forward)

## Block Component - Декларативные секции

### Концепция

Block - переиспользуемый компонент для размещения контента по секциям:
- `offset` - индекс секции (0 = начало, 2 = конец при 3 секциях)
- `factor` - скорость и направление прокрутки
- Поддержка вложенности (nested blocks)

### Реализация

```javascript
import { useRef, createContext, useContext } from 'react'
import { useFrame, useThree } from '@react-three/fiber'

const offsetContext = createContext(0)

function Block({ children, offset, factor = 1, ...props }) {
  const ref = useRef()
  const { offset: parentOffset, sectionHeight } = useBlock()
  
  // Если offset не указан, использовать родительский
  offset = offset !== undefined ? offset : parentOffset
  
  // Lerp анимация каждый кадр
  useFrame(() => {
    const curY = ref.current.position.y
    const curTop = state.top.current
    const targetY = (curTop / state.zoom) * factor
    ref.current.position.y = lerp(curY, targetY, 0.1)
  })
  
  return (
    <offsetContext.Provider value={offset}>
      {/* Внешняя группа - целевая позиция */}
      <group {...props} position={[0, -sectionHeight * offset * factor, 0]}>
        {/* Внутренняя группа - анимированная */}
        <group ref={ref}>
          {children}
        </group>
      </group>
    </offsetContext.Provider>
  )
}

// Утилита для lerp
function lerp(start, end, t) {
  return start * (1 - t) + end * t
}
```

### useBlock Hook

```javascript
function useBlock() {
  const { viewport } = useThree()
  const offset = useContext(offsetContext)
  
  const canvasWidth = viewport.width / state.zoom
  const canvasHeight = viewport.height / state.zoom
  const sectionHeight = canvasHeight * ((state.pages - 1) / (state.sections - 1))
  
  const viewportWidth = viewport.width
  const viewportHeight = viewport.height
  
  return {
    offset,
    canvasWidth,
    canvasHeight,
    sectionHeight,
    viewportWidth,
    viewportHeight
  }
}
```

### Использование

```javascript
function Scene() {
  return (
    <>
      {/* Секция 0 - начало */}
      <Block offset={0} factor={1}>
        <ChocolateBar position={[0, 0, 0]} />
      </Block>
      
      {/* Секция 1 - середина, быстрее */}
      <Block offset={1} factor={1.5}>
        <ChocolatePieces />
        
        {/* Вложенный блок - обратное направление */}
        <Block factor={-0.5}>
          <FloatingText />
        </Block>
      </Block>
      
      {/* Секция 2 - конец */}
      <Block offset={2} factor={1}>
        <CallToAction />
      </Block>
    </>
  )
}
```

## Смешивание HTML и Canvas

### Html компонент из Drei

```javascript
import { Html } from '@react-three/drei'

function TextOverlay() {
  const { offset } = useBlock()
  
  return (
    <group position={[0, 0, 0]}>
      {/* HTML синхронизирован с 3D позицией */}
      <Html
        center
        distanceFactor={10}
        transform
        occlude // скрывается за 3D объектами
      >
        <div className="content">
          <h1>Premium Chocolate</h1>
          <p>Handcrafted with love</p>
        </div>
      </Html>
    </group>
  )
}
```

### Позиционирование HTML

```javascript
// За canvas (для layout)
<Html prepend>
  <div className="background-text">
    Background content
  </div>
</Html>

// Перед canvas (для интерактивных элементов)
<Html>
  <button onClick={handleClick}>
    Click me
  </button>
</Html>

// Центрированный
<Html center>
  <h1>Centered Title</h1>
</Html>

// С трансформацией (следует за 3D объектом)
<Html transform>
  <div>Follows 3D object</div>
</Html>
```

### CSS для HTML в Canvas

```css
/* Стили применяются как обычно */
.content {
  color: white;
  font-family: 'Helvetica', sans-serif;
  text-align: center;
  pointer-events: auto; /* для интерактивности */
}

.content h1 {
  font-size: 4rem;
  margin: 0;
  text-transform: uppercase;
}
```

## Загрузка ресурсов через Suspense

### Концепция

React.Suspense позволяет:
- Контролировать загрузку асинхронных ресурсов
- Показывать fallback во время загрузки
- Кэшировать загруженные ресурсы
- Обрабатывать ошибки

### Базовое использование

```javascript
import { Suspense } from 'react'
import { useLoader } from '@react-three/fiber'
import { TextureLoader } from 'three'

function ChocolateBar() {
  // Suspends компонент до загрузки текстуры
  const texture = useLoader(TextureLoader, '/chocolate-texture.jpg')
  
  return (
    <mesh>
      <boxGeometry args={[2, 0.5, 1]} />
      <meshStandardMaterial map={texture} />
    </mesh>
  )
}

function App() {
  return (
    <Canvas>
      <Suspense fallback={<Loader />}>
        <ChocolateBar />
        <OtherAsyncContent />
      </Suspense>
    </Canvas>
  )
}

function Loader() {
  return (
    <Html center>
      <div className="loader">Loading...</div>
    </Html>
  )
}
```

### Продвинутое использование

```javascript
import { useProgress } from '@react-three/drei'

function LoadingScreen() {
  const { progress, active } = useProgress()
  
  return (
    <Html center>
      <div className="loading-screen">
        <h2>Loading Experience</h2>
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${progress}%` }}
          />
        </div>
        <p>{Math.round(progress)}%</p>
      </div>
    </Html>
  )
}

function App() {
  return (
    <Canvas>
      <Suspense fallback={<LoadingScreen />}>
        <Scene />
        <StartupAnimation />
      </Suspense>
    </Canvas>
  )
}
```

### Множественные Suspense границы

```javascript
function App() {
  return (
    <Canvas>
      {/* Критичные ресурсы */}
      <Suspense fallback={<CriticalLoader />}>
        <MainContent />
        
        {/* Некритичные ресурсы */}
        <Suspense fallback={null}>
          <OptionalEffects />
        </Suspense>
      </Suspense>
    </Canvas>
  )
}
```

## Shader эффекты привязанные к Scroll

### Базовый кастомный материал

```javascript
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { shaderMaterial } from '@react-three/drei'
import { extend } from '@react-three/fiber'

const CustomMaterial = shaderMaterial(
  {
    uTime: 0,
    uScale: 1,
    uShift: 0,
    uTexture: null
  },
  // Vertex Shader
  `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  // Fragment Shader
  `
    uniform float uTime;
    uniform float uScale;
    uniform float uShift;
    uniform sampler2D uTexture;
    varying vec2 vUv;
    
    void main() {
      // UV zoom эффект
      vec2 uv = vUv;
      uv = (uv - 0.5) * (1.0 - uScale * 0.2) + 0.5;
      
      // RGB shift
      float shift = uShift * 0.01;
      vec4 r = texture2D(uTexture, uv + vec2(shift, 0.0));
      vec4 g = texture2D(uTexture, uv);
      vec4 b = texture2D(uTexture, uv - vec2(shift, 0.0));
      
      gl_FragColor = vec4(r.r, g.g, b.b, 1.0);
    }
  `
)

extend({ CustomMaterial })

function ScrollShaderMesh() {
  const materialRef = useRef()
  const { offset, viewportHeight } = useBlock()
  const lastTop = useRef(0)
  
  useFrame(() => {
    const top = state.top.current
    const offsetFactor = offset / (state.sections - 1)
    
    // Scale привязан к позиции в секции
    materialRef.current.uScale = lerp(
      materialRef.current.uScale,
      offsetFactor - top / ((state.pages - 1) * viewportHeight),
      0.1
    )
    
    // Shift привязан к скорости прокрутки
    materialRef.current.uShift = lerp(
      materialRef.current.uShift,
      (top - lastTop.current) / 150,
      0.1
    )
    
    lastTop.current = top
  })
  
  return (
    <mesh>
      <planeGeometry args={[5, 5]} />
      <customMaterial ref={materialRef} uTexture={texture} />
    </mesh>
  )
}
```

### RGB Shift эффект

```glsl
// Fragment Shader
uniform float uShift;
uniform sampler2D uTexture;
varying vec2 vUv;

void main() {
  float shift = uShift * 0.02;
  
  // Сдвиг каналов в разные стороны
  float r = texture2D(uTexture, vUv + vec2(shift, 0.0)).r;
  float g = texture2D(uTexture, vUv).g;
  float b = texture2D(uTexture, vUv - vec2(shift, 0.0)).b;
  
  gl_FragColor = vec4(r, g, b, 1.0);
}
```

### Warping эффект

```glsl
// Fragment Shader
uniform float uWarp;
uniform sampler2D uTexture;
varying vec2 vUv;

void main() {
  vec2 uv = vUv;
  
  // Искажение на основе расстояния от центра
  vec2 center = vec2(0.5);
  vec2 offset = uv - center;
  float dist = length(offset);
  
  // Применить искажение
  uv = center + offset * (1.0 + uWarp * dist);
  
  vec4 color = texture2D(uTexture, uv);
  gl_FragColor = color;
}
```

### UV Zoom эффект

```glsl
// Fragment Shader
uniform float uZoom;
uniform sampler2D uTexture;
varying vec2 vUv;

void main() {
  vec2 uv = vUv;
  
  // Zoom от центра
  uv = (uv - 0.5) * (1.0 - uZoom) + 0.5;
  
  vec4 color = texture2D(uTexture, uv);
  gl_FragColor = color;
}
```

## Рефракция (Diamonds эффект)

### Концепция

Multiside refraction - техника от Jesper Vos для создания эффекта преломления света через грани объекта (алмазы, стекло).

### Базовая реализация

```javascript
import { useFBO } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'

function Diamond({ geometry, ...props }) {
  const { scene, camera, gl } = useThree()
  const fbo = useFBO(1024, 1024)
  const materialRef = useRef()
  
  useFrame(() => {
    // Рендер сцены в текстуру
    gl.setRenderTarget(fbo)
    gl.render(scene, camera)
    gl.setRenderTarget(null)
    
    // Обновить текстуру в материале
    if (materialRef.current) {
      materialRef.current.envMap = fbo.texture
    }
  })
  
  return (
    <mesh {...props} geometry={geometry}>
      <meshPhysicalMaterial
        ref={materialRef}
        transmission={1}
        thickness={0.5}
        roughness={0}
        envMapIntensity={1}
      />
    </mesh>
  )
}
```

### Instanced вариант (множество алмазов)

```javascript
import { useRef, useMemo } from 'react'
import { InstancedMesh, Object3D } from 'three'

function Diamonds({ count = 50 }) {
  const meshRef = useRef()
  const { offset } = useBlock()
  
  // Создать позиции для инстансов
  const positions = useMemo(() => {
    const temp = new Object3D()
    const positions = []
    
    for (let i = 0; i < count; i++) {
      temp.position.set(
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20 + offset * 10,
        (Math.random() - 0.5) * 10
      )
      temp.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      )
      temp.scale.setScalar(Math.random() * 0.5 + 0.5)
      temp.updateMatrix()
      
      positions.push(temp.matrix.clone())
    }
    
    return positions
  }, [count, offset])
  
  // Применить матрицы к инстансам
  useEffect(() => {
    positions.forEach((matrix, i) => {
      meshRef.current.setMatrixAt(i, matrix)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
  }, [positions])
  
  return (
    <instancedMesh ref={meshRef} args={[null, null, count]}>
      <octahedronGeometry args={[0.5, 0]} />
      <meshPhysicalMaterial
        transmission={1}
        thickness={0.3}
        roughness={0}
        metalness={0}
        envMapIntensity={2}
      />
    </instancedMesh>
  )
}
```

## Анимации привязанные к Scroll

### Вращение объекта

```javascript
function RotatingCross() {
  const ref = useRef()
  const { viewportHeight } = useBlock()
  
  useFrame(() => {
    const top = state.top.current
    const progress = top / ((state.pages - 1) * viewportHeight)
    const targetRotation = progress * Math.PI * 2
    
    ref.current.rotation.z = lerp(
      ref.current.rotation.z,
      targetRotation,
      0.1
    )
  })
  
  return (
    <group ref={ref}>
      <mesh>
        <boxGeometry args={[5, 0.5, 0.5]} />
        <meshStandardMaterial color="white" />
      </mesh>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <boxGeometry args={[5, 0.5, 0.5]} />
        <meshStandardMaterial color="white" />
      </mesh>
    </group>
  )
}
```

### Fade in/out по секциям

```javascript
function FadingObject() {
  const ref = useRef()
  const { offset, sectionHeight } = useBlock()
  
  useFrame(() => {
    const top = state.top.current
    const sectionTop = offset * sectionHeight
    const distance = Math.abs(top - sectionTop)
    const fadeDistance = sectionHeight * 0.5
    
    const opacity = 1 - Math.min(distance / fadeDistance, 1)
    ref.current.material.opacity = opacity
  })
  
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial transparent opacity={1} />
    </mesh>
  )
}
```

### Parallax эффект

```javascript
function ParallaxLayer({ speed = 1, children }) {
  const ref = useRef()
  
  useFrame(() => {
    const top = state.top.current
    ref.current.position.y = (top / state.zoom) * speed
  })
  
  return <group ref={ref}>{children}</group>
}

// Использование
<>
  <ParallaxLayer speed={0.5}>
    <BackgroundElements />
  </ParallaxLayer>
  
  <ParallaxLayer speed={1}>
    <MainContent />
  </ParallaxLayer>
  
  <ParallaxLayer speed={1.5}>
    <ForegroundElements />
  </ParallaxLayer>
</>
```

## Responsive дизайн

### Адаптация под размер экрана

```javascript
function ResponsiveScene() {
  const { viewport, size } = useThree()
  const isMobile = size.width < 768
  
  return (
    <>
      <ChocolateBar 
        scale={isMobile ? 0.5 : 1}
        position={isMobile ? [0, 0, 0] : [2, 0, 0]}
      />
      
      {!isMobile && <AdditionalDetails />}
    </>
  )
}
```

### useBlock с responsive данными

```javascript
function useBlock() {
  const { viewport, size } = useThree()
  const offset = useContext(offsetContext)
  
  const isMobile = size.width < 768
  const isTablet = size.width >= 768 && size.width < 1024
  
  const canvasWidth = viewport.width / state.zoom
  const canvasHeight = viewport.height / state.zoom
  
  // Адаптивные margins
  const margin = isMobile ? 1 : isTablet ? 2 : 3
  const contentMaxWidth = isMobile ? canvasWidth * 0.9 : canvasWidth * 0.6
  
  return {
    offset,
    canvasWidth,
    canvasHeight,
    margin,
    contentMaxWidth,
    isMobile,
    isTablet,
    // ...
  }
}
```

## Оптимизация производительности

### 1. Frustum Culling

```javascript
function OptimizedContent() {
  const { offset, sectionHeight } = useBlock()
  const [visible, setVisible] = useState(true)
  
  useFrame(() => {
    const top = state.top.current
    const sectionTop = offset * sectionHeight
    const distance = Math.abs(top - sectionTop)
    
    // Скрыть если далеко от текущей секции
    setVisible(distance < sectionHeight * 2)
  })
  
  if (!visible) return null
  
  return <ExpensiveContent />
}
```

### 2. LOD (Level of Detail)

```javascript
import { Detailed } from '@react-three/drei'

function LODModel() {
  return (
    <Detailed distances={[0, 10, 20]}>
      <HighPolyModel />
      <MediumPolyModel />
      <LowPolyModel />
    </Detailed>
  )
}
```

### 3. Instancing для повторяющихся объектов

```javascript
// Вместо множества отдельных mesh
{chocolatePieces.map((piece, i) => (
  <ChocolatePiece key={i} {...piece} />
))}

// Использовать instancing
<Instances limit={100}>
  <boxGeometry />
  <meshStandardMaterial />
  
  {chocolatePieces.map((piece, i) => (
    <Instance key={i} {...piece} />
  ))}
</Instances>
```

## Пример: Chocolate Landing Page

### Структура

```javascript
function ChocolateLanding() {
  return (
    <>
      <Canvas orthographic camera={{ zoom: 1, position: [0, 0, 500] }}>
        <Suspense fallback={<Loader />}>
          <Scene />
        </Suspense>
      </Canvas>
      
      <ScrollArea pages={4} />
    </>
  )
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      
      {/* Секция 1: Hero */}
      <Block offset={0} factor={1}>
        <ChocolateBar />
        <Html center>
          <h1>Premium Chocolate</h1>
        </Html>
      </Block>
      
      {/* Секция 2: Features */}
      <Block offset={1} factor={1.2}>
        <ChocolatePieces />
        <Block factor={-0.5}>
          <FloatingIngredients />
        </Block>
      </Block>
      
      {/* Секция 3: Process */}
      <Block offset={2} factor={1}>
        <ProductionAnimation />
      </Block>
      
      {/* Секция 4: CTA */}
      <Block offset={3} factor={0.8}>
        <CallToAction />
      </Block>
      
      {/* Декоративные элементы */}
      <Diamonds count={30} />
      <ParticleSystem />
    </>
  )
}
```

### Chocolate Bar с shader эффектами

```javascript
function ChocolateBar() {
  const texture = useLoader(TextureLoader, '/chocolate-texture.jpg')
  const normalMap = useLoader(TextureLoader, '/chocolate-normal.jpg')
  const roughnessMap = useLoader(TextureLoader, '/chocolate-roughness.jpg')
  
  const materialRef = useRef()
  const { offset, viewportHeight } = useBlock()
  
  useFrame(() => {
    const top = state.top.current
    const progress = top / viewportHeight
    
    // Анимация roughness при прокрутке
    if (materialRef.current) {
      materialRef.current.roughness = lerp(0.3, 0.8, progress)
    }
  })
  
  return (
    <mesh>
      <boxGeometry args={[4, 1, 0.5]} />
      <meshStandardMaterial
        ref={materialRef}
        map={texture}
        normalMap={normalMap}
        roughnessMap={roughnessMap}
        metalness={0.1}
      />
    </mesh>
  )
}
```

## Best Practices

### 1. Структура проекта
```
src/
├── components/
│   ├── Scene.jsx
│   ├── blocks/
│   │   ├── HeroBlock.jsx
│   │   ├── FeaturesBlock.jsx
│   │   └── CTABlock.jsx
│   ├── effects/
│   │   ├── Diamonds.jsx
│   │   └── Particles.jsx
│   └── ui/
│       ├── Loader.jsx
│       └── ScrollIndicator.jsx
├── hooks/
│   ├── useBlock.js
│   └── useScroll.js
├── shaders/
│   ├── customMaterial.js
│   └── refractionShader.js
└── utils/
    ├── lerp.js
    └── state.js
```

### 2. Производительность
- Используйте `useMemo` для тяжелых вычислений
- Применяйте `useCallback` для функций в useFrame
- Ограничивайте количество объектов в сцене
- Используйте instancing для повторяющихся элементов
- Оптимизируйте текстуры (размер, формат)

### 3. Accessibility
- Размещайте интерактивные элементы в DOM (не в Canvas)
- Используйте semantic HTML
- Добавляйте alt текст для изображений
- Обеспечьте keyboard navigation
- Тестируйте со screen readers

### 4. Mobile оптимизация
- Уменьшайте количество объектов на мобильных
- Снижайте разрешение текстур
- Упрощайте шейдеры
- Отключайте тяжелые эффекты
- Тестируйте на реальных устройствах

## Заключение

3D landing pages с прокруткой - мощная техника для создания запоминающихся веб-сайтов. Ключевые моменты:

- Декларативный подход через React Three Fiber
- Композиция через переиспользуемые компоненты
- Синхронизация Canvas и DOM scroll
- Shader эффекты для визуального интереса
- Оптимизация для производительности

---

*Документ создан: 2026-02-13*
*Статус: Готов к использованию*

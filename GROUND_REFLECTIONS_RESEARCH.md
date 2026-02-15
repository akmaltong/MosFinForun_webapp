# Ground Reflections и Video Textures - Исследование

## Источники
- CodeSandbox пример: https://codesandbox.io/p/sandbox/ground-reflections-and-video-textures-bfplr
- Документация Drei: https://drei.docs.pmnd.rs/shaders/mesh-reflector-material
- Vanilla JS реализация: https://gist.github.com/vasnakos/c66d62459749a4fd27c155d39c6ba84b

## Что такое MeshReflectorMaterial

MeshReflectorMaterial - это материал для Three.js, который добавляет реалистичные отражения на любую поверхность (обычно пол/землю). Материал учитывает шероховатость поверхности для более реалистичного эффекта.

### Ключевые особенности
- Расширяет `THREE.MeshStandardMaterial` (принимает все его свойства)
- Добавляет размытые отражения с настраиваемой интенсивностью
- Учитывает roughness (шероховатость) поверхности
- Поддерживает карты искажений (distortion maps)
- Работает с depth buffer для реалистичного затухания отражений
- Оптимизирован для производительности

## Параметры MeshReflectorMaterial

### Основные параметры

```javascript
<MeshReflectorMaterial
  // Размытие отражений [ширина, высота], 0 = без размытия
  blur={[0, 0]}
  
  // Как сильно размытие смешивается с roughness поверхности (0-1)
  mixBlur={0}
  
  // Сила отражений (0-1)
  mixStrength={1}
  
  // Контраст отражений (0-1)
  mixContrast={1}
  
  // Разрешение off-buffer текстуры (меньше = быстрее, больше = качественнее)
  resolution={256}
  
  // Отражение окружения: 0 = цвета текстур, 1 = цвета environment
  mirror={0}
  
  // Масштаб глубины (0 = без учета глубины)
  depthScale={0}
  
  // Нижний порог для интерполяции depthTexture
  minDepthThreshold={0.9}
  
  // Верхний порог для интерполяции depthTexture
  maxDepthThreshold={1}
  
  // Bias для depthTexture перед расчетом размытия (0-1)
  depthToBlurRatioBias={0.25}
  
  // Величина искажения на основе distortionMap
  distortion={1}
  
  // Текстура искажений (красный канал используется как карта искажений)
  distortionMap={distortionTexture}
  
  // Смещение виртуальной камеры для отражений
  reflectorOffset={0.2}
/>
```

## Vanilla JavaScript реализация

### Инициализация

```javascript
const {
  DepthFormat, DepthTexture, LinearFilter, Matrix4, MeshStandardMaterial,
  PerspectiveCamera, Plane, UnsignedShortType, Vector3, Vector4, WebGLRenderTarget
} = THREE;

class MeshReflectorMaterial extends MeshStandardMaterial {
  constructor(renderer, camera, scene, object, {
    mixBlur = 0,
    mixStrength = 1,
    resolution = 256,
    blur = [0, 0],
    minDepthThreshold = 0.9,
    maxDepthThreshold = 1,
    depthScale = 0,
    depthToBlurRatioBias = 0.25,
    mirror = 0,
    distortion = 1,
    mixContrast = 1,
    distortionMap,
    reflectorOffset = 0,
    bufferSamples = 8,
    planeNormal = new Vector3(0, 0, 1)
  } = {}) {
    super();
    
    this.gl = renderer;
    this.camera = camera;
    this.scene = scene;
    this.parent = object;
    
    this.hasBlur = blur[0] + blur[1] > 0;
    this.reflectorPlane = new Plane();
    this.normal = new Vector3();
    this.reflectorWorldPosition = new Vector3();
    this.cameraWorldPosition = new Vector3();
    this.rotationMatrix = new Matrix4();
    this.lookAtPosition = new Vector3(0, -1, 0);
    this.clipPlane = new Vector4();
    this.view = new Vector3();
    this.target = new Vector3();
    this.q = new Vector4();
    this.textureMatrix = new Matrix4();
    this.virtualCamera = new PerspectiveCamera();
    this.reflectorOffset = reflectorOffset;
    this.planeNormal = planeNormal;
    
    this.setupBuffers(resolution, blur, bufferSamples);
    
    // Настройка свойств для шейдера
    this.reflectorProps = {
      mirror,
      textureMatrix: this.textureMatrix,
      mixBlur,
      tDiffuse: this.fbo1.texture,
      tDepth: this.fbo1.depthTexture,
      tDiffuseBlur: this.fbo2.texture,
      hasBlur: this.hasBlur,
      mixStrength,
      minDepthThreshold,
      maxDepthThreshold,
      depthScale,
      depthToBlurRatioBias,
      distortion,
      distortionMap,
      mixContrast,
      'defines-USE_BLUR': this.hasBlur ? '' : undefined,
      'defines-USE_DEPTH': depthScale > 0 ? '' : undefined,
      'defines-USE_DISTORTION': distortionMap ? '' : undefined,
    };
  }
}
```

### Настройка буферов

```javascript
setupBuffers(resolution, blur, bufferSamples) {
  const parameters = {
    minFilter: LinearFilter,
    magFilter: LinearFilter,
    encoding: this.gl.outputEncoding,
  };
  
  // Основной FBO с depth texture
  const fbo1 = new WebGLRenderTarget(resolution, resolution, parameters);
  fbo1.depthBuffer = true;
  fbo1.depthTexture = new DepthTexture(resolution, resolution);
  fbo1.depthTexture.format = DepthFormat;
  fbo1.depthTexture.type = UnsignedShortType;
  
  // Второй FBO для размытия
  const fbo2 = new WebGLRenderTarget(resolution, resolution, parameters);
  
  // Multisampling для WebGL2
  if (this.gl.capabilities.isWebGL2) {
    fbo1.samples = bufferSamples;
  }
  
  this.fbo1 = fbo1;
  this.fbo2 = fbo2;
  
  // Kawase Blur для эффективного размытия
  this.kawaseBlurPass = new POSTPROCESSING.KawaseBlurPass();
  this.kawaseBlurPass.setSize(blur[0], blur[1]);
}
```

### Метод обновления (вызывать каждый кадр)

```javascript
update() {
  if (this.parent.material !== this) return;
  
  this.parent.visible = false;
  const currentXrEnabled = this.gl.xr.enabled;
  const currentShadowAutoUpdate = this.gl.shadowMap.autoUpdate;
  
  this.beforeRender();
  this.gl.xr.enabled = false;
  this.gl.shadowMap.autoUpdate = false;
  this.gl.setRenderTarget(this.fbo1);
  this.gl.state.buffers.depth.setMask(true);
  if (!this.gl.autoClear) this.gl.clear();
  
  // Рендер отражения
  this.gl.render(this.scene, this.virtualCamera);
  
  // Применить размытие если нужно
  if (this.hasBlur) {
    this.kawaseBlurPass.render(this.gl, this.fbo1, this.fbo2);
  }
  
  this.gl.xr.enabled = currentXrEnabled;
  this.gl.shadowMap.autoUpdate = currentShadowAutoUpdate;
  this.parent.visible = true;
  this.gl.setRenderTarget(null);
}
```

## Как работает технология

### 1. Виртуальная камера
Создается виртуальная камера, которая отражается относительно плоскости отражения:
- Позиция камеры отражается через плоскость
- Up вектор также отражается
- Используется oblique projection для корректного clipping

### 2. Render-to-Texture
- Сцена рендерится с точки зрения виртуальной камеры в off-screen текстуру
- Сохраняется depth buffer для расчета затухания
- Применяется Kawase Blur для размытия отражений

### 3. Shader модификация
- Vertex shader: вычисляет UV координаты для отражения через textureMatrix
- Fragment shader: смешивает отражение с базовым цветом материала
- Учитывает roughness, depth, normal maps для реализма

### 4. Depth-based falloff
```glsl
#ifdef USE_DEPTH
  vec4 depth = texture2DProj(tDepth, new_vUv);
  depthFactor = smoothstep(minDepthThreshold, maxDepthThreshold, 1.0-(depth.r * depth.a));
  depthFactor *= depthScale;
  depthFactor = max(0.0001, min(1.0, depthFactor));
  
  #ifdef USE_BLUR
    blur = blur * min(1.0, depthFactor + depthToBlurRatioBias);
    merge = merge * min(1.0, depthFactor + 0.5);
  #else
    merge = merge * depthFactor;
  #endif
#endif
```

### 5. Roughness integration
```glsl
float reflectorRoughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
  vec4 reflectorTexelRoughness = texture2D(roughnessMap, vUv);
  reflectorRoughnessFactor *= reflectorTexelRoughness.g;
#endif

#ifdef USE_BLUR
  blurFactor = min(1.0, mixBlur * reflectorRoughnessFactor);
  merge = mix(merge, blur, blurFactor);
#endif
```

## Производительность

### Оптимизации
- Используется низкое разрешение для off-screen рендера (256-512px обычно достаточно)
- Kawase Blur - эффективный алгоритм размытия
- Multisampling только для WebGL2
- Отражающий объект скрывается при рендере отражения
- Проверка видимости: не рендерить если отражатель смотрит в другую сторону

### Проблемы производительности
- На мобильных устройствах может работать медленно (12 FPS на Android)
- Постпроцессинг + Reflector может снизить FPS с 60 до 15
- Решение: уменьшить resolution, отключить blur, использовать SSR вместо этого

## Video Textures

### Использование видео как текстуры

```javascript
// Создать video элемент
const video = document.createElement('video');
video.src = 'path/to/video.mp4';
video.loop = true;
video.muted = true;
video.play();

// Создать VideoTexture
const videoTexture = new THREE.VideoTexture(video);
videoTexture.minFilter = THREE.LinearFilter;
videoTexture.magFilter = THREE.LinearFilter;

// Использовать как обычную текстуру
const material = new THREE.MeshBasicMaterial({
  map: videoTexture
});

// Или с MeshReflectorMaterial
const reflectorMaterial = new MeshReflectorMaterial(renderer, camera, scene, mesh, {
  mixStrength: 1,
  blur: [400, 100],
  resolution: 512
});
// Видео будет отражаться на поверхности
```

### Комбинация Video + Reflections

```javascript
// Видео на экране/объекте
const videoMesh = new THREE.Mesh(
  new THREE.PlaneGeometry(16, 9),
  new THREE.MeshBasicMaterial({ map: videoTexture })
);
scene.add(videoMesh);

// Отражающий пол
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(100, 100),
  new MeshReflectorMaterial(renderer, camera, scene, floor, {
    blur: [400, 100],
    resolution: 1024,
    mixStrength: 0.8,
    mixBlur: 1,
    depthScale: 1,
    minDepthThreshold: 0.4,
    maxDepthThreshold: 1.4
  })
);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

// Видео будет отражаться на полу в реальном времени
```

## Примеры настроек

### Глянцевый пол (зеркальный)
```javascript
{
  blur: [0, 0],
  mixBlur: 0,
  mixStrength: 1,
  mixContrast: 1,
  resolution: 1024,
  mirror: 0,
  depthScale: 0,
  roughness: 0.1
}
```

### Матовый пол с размытием
```javascript
{
  blur: [400, 100],
  mixBlur: 1,
  mixStrength: 0.5,
  mixContrast: 1,
  resolution: 512,
  mirror: 0,
  depthScale: 1,
  minDepthThreshold: 0.4,
  maxDepthThreshold: 1.4,
  roughness: 0.8
}
```

### Мокрый асфальт
```javascript
{
  blur: [200, 50],
  mixBlur: 0.5,
  mixStrength: 0.3,
  mixContrast: 1.2,
  resolution: 512,
  mirror: 0.1,
  depthScale: 0.5,
  minDepthThreshold: 0.7,
  maxDepthThreshold: 1,
  roughness: 0.6,
  metalness: 0.1
}
```

## Альтернативы

### 1. Screen Space Reflections (SSR)
- Более реалистичные отражения
- Работает для любых поверхностей, не только плоских
- Более требовательна к производительности
- Пример: https://github.com/0beqz/screen-space-reflections

### 2. Environment Maps
- Быстрее всего
- Менее реалистично (статичное окружение)
- Подходит для общих отражений

### 3. Planar Reflections (Three.js Reflector)
- Базовая реализация в Three.js
- Без размытия и roughness по умолчанию
- Проще, но менее гибкая

## Применение в проекте

### Потенциальные сценарии
- Отражающие полы в интерьерах
- Мокрые поверхности (дождь, лужи)
- Зеркала и стеклянные поверхности
- Видео-экраны с отражениями на полу
- Архитектурная визуализация

### Интеграция
1. Добавить MeshReflectorMaterial класс в проект
2. Подключить postprocessing библиотеку для Kawase Blur
3. Создать отражающую поверхность (обычно пол)
4. Вызывать `material.update()` в render loop
5. Настроить параметры для желаемого эффекта

### Требования
- Three.js r124+
- Postprocessing библиотека (для Kawase Blur)
- WebGL2 для multisampling (опционально)
- Достаточная производительность GPU

## Заметки

- MeshReflectorMaterial изначально из библиотеки @react-three/drei
- Существуют vanilla JS порты для использования без React
- Требует вызова update() каждый кадр
- Может сильно влиять на производительность при высоких настройках
- Лучше всего работает на плоских поверхностях
- Для криволинейных поверхностей лучше использовать SSR или environment maps

---

*Документ создан: 2026-02-13*
*Статус: Готов к использованию*

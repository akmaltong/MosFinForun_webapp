# Правильное запекание Lightmap в Blender для Three.js

## Источники
- [Lightmap Baking in Blender for Three.js](https://www.pixel-capture.com/tutorials/lightmap-baking-in-blender)
- [Blender Lightmap Baking Explained](https://www.sabbirz.com/blog-3d/blender-lightmap-baking-explained)

## Ключевые принципы

### ⚠️ ВАЖНО для Three.js:
1. **32-bit Float HDR** - обязательно для качественного lightmap
2. **Color Space: Non-Color** - для lightmap текстуры
3. **UV2** - Three.js использует второй UV канал для lightmap
4. **Bake Type: Combined** с Direct + Indirect
5. **Сохранять в HDR или EXR** формате

## Подготовка сцены

### Шаг 1: Дублируйте файл
```
File → Save As → SM_MFF_lightmap_baking.blend
```
**Всегда работайте на копии!**

### Шаг 2: Примените модификаторы
```
1. Выберите объект
2. Object → Apply → All Modifiers
```

### Шаг 3: Нормализуйте Scale
```
1. Выберите объект
2. Проверьте Scale в Properties (должен быть 1, 1, 1)
3. Если нет: Ctrl+A → All Transforms
```

### Шаг 4: Проверьте нормали
```
1. Viewport Overlays → Face Orientation (включить)
2. Синий = правильно, Красный = перевернуто
3. Если красный: Edit Mode → A → Mesh → Normals → Flip
```

## Настройка UV для Lightmap

### Вариант A: Создать отдельный UV2 (Рекомендуется)

```
1. Object Data Properties → UV Maps
2. Нажмите + (Add UV Map)
3. Переименуйте в "UVMap_Lightmap"
4. Выберите этот UV Map (сделайте активным)
5. Edit Mode → A (выбрать все)
6. U → Lightmap Pack
   - Share Tex Space: ON
   - New Image: OFF
   - Image Size: 2048 или 4096
   - Pack Quality: 12
   - Margin: 0.01
```

**Почему отдельный UV2?**
- Three.js использует UV2 для lightmap
- UV1 остается для обычных текстур (BaseColor, Normal и т.д.)
- Меньше искажений

### Вариант B: Использовать существующий UV

Если у вас уже есть хороший UV:
```
1. Можно использовать тот же UV для lightmap
2. В Three.js скопируем UV1 в UV2
```

## Настройка освещения

### Рекомендуемая схема для интерьера:

```
1. Sun Light (основной свет):
   - Strength: 5.0
   - Angle: 0.526 (30°)
   - Rotation: настройте направление

2. Area Lights (заполняющий свет):
   - 2-3 Area Light
   - Strength: 50-100
   - Size: 2-5 метров
   - Расположите в ключевых местах

3. World Environment (HDRI):
   - Strength: 0.5-1.0
   - Или просто Background с цветом неба
```

## Настройка Cycles

```
Render Properties:
┌─────────────────────────────────┐
│ Render Engine: Cycles           │
│ Device: GPU Compute             │
│                                 │
│ Sampling:                       │
│ - Render: 256-512 (для финала)  │
│ - Render: 128 (для теста)       │
│                                 │
│ Light Paths:                    │
│ - Max Bounces: 12               │
│ - Diffuse: 4                    │
│ - Glossy: 4                     │
│ - Transmission: 12              │
│                                 │
│ Denoising: ON ✓                 │
└─────────────────────────────────┘
```

## Создание Image для запекания

### Для Lightmap (ВАЖНО!):

```
1. Shading workspace
2. Shader Editor → Add → Texture → Image Texture
3. New Image:
   ┌─────────────────────────────────┐
   │ Name: Lightmap                  │
   │ Width: 2048 (или 4096)          │
   │ Height: 2048 (или 4096)         │
   │ Color: Black                    │
   │ Alpha: OFF                      │
   │ Generated Type: Blank           │
   │ 32-bit Float: ON ✓ (ВАЖНО!)    │
   └─────────────────────────────────┘
4. Выберите этот Image Texture node (белая рамка)
```

**Почему 32-bit Float?**
- Это HDR формат
- Сохраняет полный диапазон яркости
- Критично для качественного lightmap

## Запекание Lightmap

### Настройки Bake:

```
Render Properties → Bake:
┌─────────────────────────────────┐
│ Bake Type: Combined             │
│                                 │
│ Influence:                      │
│ ☑ Direct                        │
│ ☑ Indirect                      │
│ ☐ Diffuse (выключить!)          │
│ ☐ Glossy (выключить!)           │
│ ☐ Transmission (выключить!)     │
│                                 │
│ Contributions:                  │
│ ☐ Color (выключить!)            │
│                                 │
│ Selected to Active: OFF         │
│ Margin: 16 px                   │
│ Clear Image: ON                 │
└─────────────────────────────────┘
```

### Процесс запекания:

```
1. Выберите объект
2. Убедитесь что Image Texture node активен (белая рамка)
3. Убедитесь что выбран правильный UV Map (UVMap_Lightmap)
4. Render Properties → Bake → Bake
5. Ждите завершения (20-60 минут в зависимости от samples)
```

## Сохранение Lightmap

### ВАЖНО: Сохранить в HDR/EXR!

```
Image Editor:
1. Image → Save As
2. Формат: OpenEXR (.exr) или Radiance HDR (.hdr)
3. Color Depth: Float (Full)
4. Codec: ZIP (lossless)
5. Имя: SM_MFF_Lightmap.exr
6. Путь: public/textures/venue/
```

**Почему EXR/HDR?**
- Сохраняет полный динамический диапазон
- PNG/JPG обрежут яркие области
- Критично для реалистичного освещения

## Запекание других карт

### AO (Ambient Occlusion):

```
Bake Type: Ambient Occlusion
Settings:
- Samples: 128
- Distance: 0.2
- Only Local: OFF
- Margin: 16

Сохранить как: SM_MFF_AO.png (PNG, 8-bit, Non-Color)
```

### BaseColor (Diffuse):

```
Bake Type: Diffuse
Influence:
- ☐ Direct
- ☐ Indirect
- ☑ Color (только цвет!)
Samples: 64
Margin: 16

Сохранить как: SM_MFF_BaseColor.png (PNG, 8-bit, sRGB)
```

### Normal:

```
Bake Type: Normal
Space: Tangent
Samples: 64
Margin: 16

Сохранить как: SM_MFF_Normal.png (PNG, 16-bit, Non-Color)
```

## Экспорт модели

### Вариант 1: Без встроенных текстур (Рекомендуется)

```
File → Export → glTF 2.0 (.glb)
┌─────────────────────────────────┐
│ Format: glTF Binary (.glb)      │
│                                 │
│ Include:                        │
│ ☑ Selected Objects              │
│                                 │
│ Transform:                      │
│ ☑ +Y Up                         │
│                                 │
│ Geometry:                       │
│ ☑ Apply Modifiers               │
│ ☑ UVs                           │
│ ☑ Normals                       │
│ ☑ Tangents                      │
│                                 │
│ Material:                       │
│ ☑ Materials: Export             │
│ Images: None (текстуры отдельно)│
└─────────────────────────────────┘
```

### Вариант 2: Со встроенными текстурами

```
Images: glTF Embedded
(Текстуры встроятся в GLB, но файл будет больше)
```

## Применение в Three.js

### Загрузка EXR lightmap:

```typescript
import { EXRLoader } from 'three/examples/jsm/loaders/EXRLoader'
import { useLoader } from '@react-three/fiber'

// Загрузка EXR lightmap
const lightMap = useLoader(EXRLoader, '/textures/venue/SM_MFF_Lightmap.exr')

// Применение к материалу
child.material = new THREE.MeshStandardMaterial({
  map: baseColorTexture,
  aoMap: aoTexture,
  aoMapIntensity: 2.5,
  lightMap: lightMap,  // EXR lightmap
  lightMapIntensity: 1.0,
  normalMap: normalTexture,
  // ...
})

// UV2 для lightmap
if (child.geometry.attributes.uv) {
  child.geometry.attributes.uv2 = child.geometry.attributes.uv
}
```

### Или PNG lightmap (если не хотите EXR):

```typescript
import { useTexture } from '@react-three/drei'

const textures = useTexture({
  lightMap: '/textures/venue/SM_MFF_Lightmap.png',
  // ...
})

// Настройка encoding для PNG lightmap
textures.lightMap.encoding = THREE.sRGBEncoding
```

## Проверка качества

### В Blender:

```
1. Viewport Shading → Rendered
2. Проверьте что освещение выглядит реалистично
3. Нет артефактов, швов, темных пятен
```

### В Three.js:

```
1. Загрузите модель с lightmap
2. Проверьте что освещение соответствует Blender
3. Настройте lightMapIntensity если нужно
```

## Troubleshooting

### Проблема: Lightmap слишком темный

**Решение:**
```
В Blender:
- Увеличьте Strength освещения
- Увеличьте Samples до 512
- Включите Denoising

В Three.js:
- Увеличьте lightMapIntensity до 1.5-2.0
```

### Проблема: Швы на lightmap

**Решение:**
```
- Увеличьте Margin до 32px
- Проверьте UV развертку (нет перекрытий)
- Используйте Lightmap Pack для UV
```

### Проблема: Пятна и артефакты

**Решение:**
```
- Увеличьте Samples до 512
- Включите Denoising
- Проверьте нормали (Face Orientation)
```

### Проблема: Lightmap не загружается в Three.js

**Решение:**
```
- Проверьте что файл .exr или .hdr
- Используйте EXRLoader для .exr
- Проверьте пути к файлам
- Проверьте UV2 (должен быть установлен)
```

## Оптимизация

### Размеры текстур:

- **Desktop**: 2048x2048 или 4096x4096
- **Mobile**: 1024x1024 или 2048x2048

### Сжатие:

```bash
# Конвертация EXR в сжатый формат
exrenvmap -c zip SM_MFF_Lightmap.exr SM_MFF_Lightmap_compressed.exr
```

### Комбинирование каналов:

```
Можно упаковать несколько карт в один файл:
- R: Metallic
- G: Roughness  
- B: AO
- A: (не используется)
```

## Рекомендуемый workflow

1. **Подготовка** (30 мин):
   - Дублировать файл
   - Применить модификаторы
   - Проверить scale и нормали
   - Создать UV2 для lightmap

2. **Настройка освещения** (30 мин):
   - Добавить Sun Light
   - Добавить Area Lights
   - Настроить HDRI/World
   - Проверить в Rendered view

3. **Запекание** (1-2 часа):
   - Создать 32-bit Float image
   - Настроить Cycles (256-512 samples)
   - Запечь Lightmap (Combined)
   - Запечь AO, BaseColor, Normal

4. **Сохранение** (10 мин):
   - Lightmap → .exr (32-bit Float)
   - AO → .png (8-bit, Non-Color)
   - BaseColor → .png (8-bit, sRGB)
   - Normal → .png (16-bit, Non-Color)

5. **Экспорт** (5 мин):
   - Экспортировать GLB без текстур
   - Скопировать текстуры в public/textures/venue/

6. **Интеграция** (30 мин):
   - Загрузить EXR lightmap через EXRLoader
   - Применить к материалу
   - Настроить intensities
   - Проверить результат

## Итоговый чеклист

- [ ] Файл дублирован
- [ ] Модификаторы применены
- [ ] Scale нормализован (1,1,1)
- [ ] Нормали проверены (синие)
- [ ] UV2 создан (Lightmap Pack)
- [ ] Освещение настроено
- [ ] Cycles настроен (256+ samples, GPU, Denoising)
- [ ] 32-bit Float image создан
- [ ] Lightmap запечен (Combined, Direct+Indirect)
- [ ] Lightmap сохранен в .exr
- [ ] AO запечен и сохранен
- [ ] BaseColor запечен и сохранен
- [ ] Normal запечен и сохранен
- [ ] GLB экспортирован
- [ ] Текстуры скопированы в проект
- [ ] EXRLoader настроен в Three.js
- [ ] Материалы применены
- [ ] Результат проверен

---

*Следуйте этой инструкции шаг за шагом для профессионального результата!*

# Применение запеченных текстур и экспорт

## У вас есть 3 текстуры:

1. **SM_MFF.002_Bake1_CyclesBake_COMBINED** - Combined (цвет + свет + тени)
2. **SM_MFF.002_Bake1_PBR_Ambient Occlusion** - AO (затемнение углов)
3. **SM_MFF.002_Bake1_PBR_Lightmap** - Lightmap (освещение)

## Вариант 1: Экспорт текстур без применения к модели (БЫСТРО)

### Шаг 1: Сохраните текстуры

```
1. Image Editor (переключите любую область на Image Editor)
2. Выберите текстуру из выпадающего списка
3. Image → Save As
4. Сохраните каждую:
   - SM_MFF_Combined.png (Combined)
   - SM_MFF_AO.png (Ambient Occlusion)
   - SM_MFF_Lightmap.png (Lightmap)
5. Путь: выберите удобную папку
```

### Шаг 2: Скопируйте в проект

```powershell
# Windows PowerShell
cd C:\Users\akmal\Desktop\ПРОЕКТЫ_Forum_navigation_app\forum-nav-app5_backup_v1_20260212_193914

# Создайте папку
New-Item -ItemType Directory -Force -Path "public\textures\venue"

# Скопируйте текстуры
Copy-Item "C:\Path\To\Saved\Textures\*.png" -Destination "public\textures\venue\"
```

### Шаг 3: Экспортируйте модель как есть

```
File → Export → glTF 2.0 (.glb/.gltf)
Format: glTF Binary (.glb)
Include: Selected Objects (или все)
Transform: +Y Up
Geometry: Apply Modifiers
Material: Export
→ Export glTF 2.0
```

## Вариант 2: Применить текстуры к модели и экспортировать (ПРАВИЛЬНО)

### Шаг 1: Создайте новый материал с текстурами

```
1. Выберите объект
2. Shading workspace
3. В Shader Editor:
   - Удалите старые nodes (кроме Material Output)
   - Или создайте новый материал
```

### Шаг 2: Настройте материал

#### Вариант A: Combined + AO (простой)

```
Shader Editor:

1. Add (Shift+A) → Texture → Image Texture
   - Open → выберите Combined текстуру
   - Color Space: sRGB
   - Назовите node: "Combined"

2. Add → Texture → Image Texture
   - Open → выберите AO текстуру
   - Color Space: Non-Color Data
   - Назовите node: "AO"

3. Add → Shader → Principled BSDF (если нет)

4. Add → Color → MixRGB
   - Blend Type: Multiply
   - Fac: 1.0

5. Подключите:
   Combined (Color) → MixRGB (Color1)
   AO (Color) → MixRGB (Color2)
   MixRGB (Color) → Principled BSDF (Base Color)
   Principled BSDF (BSDF) → Material Output (Surface)

6. Для UV2 (AO):
   - Add → Input → UV Map
   - UV Map → выберите UVMap (или UVMap.001)
   - UV Map (UV) → AO Image Texture (Vector)
```

#### Вариант B: Только Combined (самый простой)

```
Shader Editor:

1. Add → Texture → Image Texture
   - Open → Combined
   - Color Space: sRGB

2. Add → Shader → Principled BSDF

3. Подключите:
   Image Texture (Color) → Principled BSDF (Base Color)
   Principled BSDF (BSDF) → Material Output (Surface)
```

#### Вариант C: Lightmap + AO + BaseColor (полный контроль)

```
Shader Editor:

1. BaseColor Image Texture (sRGB)
2. AO Image Texture (Non-Color)
3. Lightmap Image Texture (sRGB)

4. MixRGB (Multiply):
   BaseColor → Color1
   AO → Color2
   → Result1

5. MixRGB (Multiply):
   Result1 → Color1
   Lightmap → Color2
   → Principled BSDF (Base Color)
```

### Шаг 3: Проверьте результат

```
1. Viewport Shading → Material Preview (Z → 2)
2. Или Rendered (Z → 8)
3. Модель должна выглядеть с текстурами
```

### Шаг 4: Экспортируйте GLB с текстурами

```
File → Export → glTF 2.0 (.glb/.gltf)

Настройки:
┌─────────────────────────────────────┐
│ Format: glTF Binary (.glb)          │
│                                     │
│ Include:                            │
│ ☑ Selected Objects                  │
│ ☑ Visible Objects                   │
│ ☐ Renderable Objects                │
│ ☑ Active Collection                 │
│                                     │
│ Transform:                          │
│ ☑ +Y Up                             │
│                                     │
│ Geometry:                           │
│ ☑ Apply Modifiers                   │
│ ☑ UVs                               │
│ ☑ Normals                           │
│ ☑ Tangents                          │
│ ☑ Vertex Colors                     │
│ ☐ Loose Edges                       │
│ ☐ Loose Points                      │
│                                     │
│ Material:                           │
│ ☑ Materials: Export                 │
│ ☑ Images: Automatic                 │
│   (текстуры будут встроены в .glb)  │
│                                     │
│ Compression:                        │
│ ☐ Draco (для меньшего размера)      │
│                                     │
└─────────────────────────────────────┘

→ Export glTF 2.0
```

### Шаг 5: Скопируйте в проект

```powershell
# Скопируйте новый .glb файл
Copy-Item "C:\Path\To\Exported\SM_MFF.glb" -Destination "public\SM_MFF.glb"
```

## Вариант 3: Экспорт текстур отдельно (РЕКОМЕНДУЮ для Three.js)

Это лучший вариант для веб-приложения!

### Шаг 1: Сохраните текстуры с правильными именами

```
Image Editor:

1. Выберите Combined:
   Image → Save As
   - Имя: SM_MFF_Combined.png
   - Format: PNG
   - Color Space: sRGB
   - Compression: 15%

2. Выберите AO:
   Image → Save As
   - Имя: SM_MFF_AO.png
   - Format: PNG
   - Color Space: Non-Color Data (ВАЖНО!)
   - Compression: 15%

3. Выберите Lightmap:
   Image → Save As
   - Имя: SM_MFF_Lightmap.png
   - Format: PNG
   - Color Space: sRGB
   - Compression: 15%
```

### Шаг 2: Скопируйте текстуры в проект

```powershell
# Создайте папку
New-Item -ItemType Directory -Force -Path "public\textures\venue"

# Скопируйте текстуры
Copy-Item "C:\Path\To\Textures\SM_MFF_*.png" -Destination "public\textures\venue\"
```

### Шаг 3: Экспортируйте модель БЕЗ текстур

```
File → Export → glTF 2.0 (.glb)
Format: glTF Binary (.glb)
Material: Export
Images: None (текстуры загрузим отдельно в Three.js)
→ Export
```

Или используйте существующий SM_MFF.glb (не нужно экспортировать заново).

### Шаг 4: Используйте в Three.js

Код уже готов в `VenueModelBaked.tsx`! Просто обновите пути к текстурам:

```typescript
const textures = useTexture({
  combined: '/textures/venue/SM_MFF_Combined.png',
  aoMap: '/textures/venue/SM_MFF_AO.png',
  lightMap: '/textures/venue/SM_MFF_Lightmap.png',
})
```

## Быстрый способ (для вас)

### 1. Сохраните текстуры (5 минут)

```
Image Editor → выберите каждую текстуру → Image → Save As:

- SM_MFF_Combined.png (sRGB)
- SM_MFF_AO.png (Non-Color Data)
- SM_MFF_Lightmap.png (sRGB)

Сохраните в удобную папку
```

### 2. Скопируйте в проект (1 минута)

```powershell
# В PowerShell
cd C:\Users\akmal\Desktop\ПРОЕКТЫ_Forum_navigation_app\forum-nav-app5_backup_v1_20260212_193914

# Создайте папку
New-Item -ItemType Directory -Force -Path "public\textures\venue"

# Скопируйте (замените путь на ваш)
Copy-Item "C:\Users\akmal\Path\To\Textures\SM_MFF_*.png" -Destination "public\textures\venue\"
```

### 3. Обновите VenueModelBaked.tsx (готово!)

Файл уже создан, просто используйте его:

```typescript
// В Scene3D.tsx замените:
import VenueModelBaked from './VenueModelBaked'

// <VenueModel />
<VenueModelBaked />
```

### 4. Выберите вариант применения

Откройте `VenueModelBaked.tsx` и выберите один из вариантов:

**Вариант 1: Combined + AO (точный результат из Blender)**
```typescript
const textures = useTexture({
  combined: '/textures/venue/SM_MFF_Combined.png',
  aoMap: '/textures/venue/SM_MFF_AO.png',
})

child.material = new THREE.MeshBasicMaterial({
  map: textures.combined,
  aoMap: textures.aoMap,
  aoMapIntensity: 1.0,
})
```

**Вариант 2: Только AO + динамическое освещение (гибкость)**
```typescript
const aoTexture = useTexture('/textures/venue/SM_MFF_AO.png')

child.material = new THREE.MeshStandardMaterial({
  color: new THREE.Color(materialColor),
  aoMap: aoTexture,
  aoMapIntensity: 2.5,
  roughness: materialRoughness,
  metalness: materialMetalness,
})
```

## Проверка Color Space (ВАЖНО!)

При сохранении текстур убедитесь:

| Текстура | Color Space |
|----------|-------------|
| Combined | sRGB |
| Lightmap | sRGB |
| AO | Non-Color Data ⚠️ |

Неправильный Color Space = неправильные цвета!

## Troubleshooting

### Проблема: Не могу найти текстуры в Image Editor

**Решение:**
```
1. Image Editor → выпадающий список (Browse Image)
2. Найдите текстуры с именами:
   - SM_MFF.002_Bake1_CyclesBake_COMBINED
   - SM_MFF.002_Bake1_PBR_Ambient Occlusion
   - SM_MFF.002_Bake1_PBR_Lightmap
```

### Проблема: Текстуры не применяются к модели

**Решение:**
```
1. Убедитесь что UV развертка есть
2. Проверьте что Image Texture nodes подключены
3. Viewport Shading → Material Preview
```

### Проблема: Экспорт GLB очень большой

**Решение:**
```
1. Используйте Draco compression при экспорте
2. Или экспортируйте текстуры отдельно (Вариант 3)
3. Сожмите PNG текстуры перед копированием
```

## Рекомендация

**Используйте Вариант 3: Экспорт текстур отдельно**

Почему:
1. ✅ Меньший размер файлов
2. ✅ Гибкость в Three.js
3. ✅ Можно менять текстуры без переэкспорта модели
4. ✅ Лучшая производительность
5. ✅ Проще отладка

## Следующие шаги

1. Сохраните 3 текстуры из Blender
2. Скопируйте в `public/textures/venue/`
3. Обновите `Scene3D.tsx` (используйте `VenueModelBaked`)
4. Выберите вариант в `VenueModelBaked.tsx`
5. Проверьте в браузере
6. Настройте `aoMapIntensity` если нужно

---

**Готов помочь с любым шагом!**

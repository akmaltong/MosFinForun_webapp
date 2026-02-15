# Запекание текстур в Blender с Ucupaint

## Что такое Ucupaint?

**Ucupaint** - это мощный аддон для Blender, который позволяет:
- Запекать различные типы карт (AO, Normal, Curvature, и т.д.)
- Работать с многослойными материалами
- Создавать процедурные текстуры
- Экспортировать карты для игровых движков

## Установка Ucupaint

### Способ 1: Через Blender Extensions (Blender 4.2+)

1. Откройте Blender
2. Edit → Preferences → Get Extensions
3. Найдите "Ucupaint"
4. Нажмите Install

### Способ 2: Ручная установка

1. Скачайте с GitHub: https://github.com/ucupumar/ucupaint
2. Edit → Preferences → Add-ons → Install
3. Выберите скачанный .zip файл
4. Включите аддон "Ucupaint"

## Подготовка модели

### 1. Откройте вашу модель

```
File → Open → SM_MFF.blend
```

### 2. Проверьте UV развертку

**Важно:** Модель должна иметь правильную UV развертку!

```
1. Выберите объект
2. Переключитесь в Edit Mode (Tab)
3. UV Editing workspace
4. Проверьте что UV не перекрываются
```

### 3. Создайте UV2 для Lightmap (опционально)

Если нужна отдельная UV для lightmap:

```
1. В Edit Mode выберите всю геометрию (A)
2. UV → Smart UV Project
3. В Object Data Properties → UV Maps
4. Переименуйте в "UVMap_Lightmap"
```

## Настройка освещения для запекания

### 1. Создайте финальную сцену освещения

Используйте одну из схем освещения:
- Studio Lighting (3-point)
- Architectural Lighting (Sun)
- Exhibition Lighting (Bright)
- Custom Lighting

### 2. Настройте Cycles Render

```
Render Properties:
- Render Engine: Cycles
- Device: GPU Compute (если есть)
- Samples: 128-256 (для запекания)
```

### 3. Настройте World Environment

```
World Properties:
- Color: Sky Texture или HDRI
- Strength: 1.0
```

## Запекание с Ucupaint

### 1. Активируйте Ucupaint

```
1. Выберите объект
2. Shading workspace
3. В боковой панели (N) найдите вкладку "Ucupaint"
```

### 2. Создайте Ucupaint Layer

```
1. В панели Ucupaint нажмите "New Yp Material"
2. Или конвертируйте существующий: "Convert to Yp Material"
```

### 3. Настройте разрешение текстур

```
Ucupaint Panel → Settings:
- Width: 2048 или 4096
- Height: 2048 или 4096
- Color Space: sRGB для Color, Non-Color для остальных
```

## Запекание карт

### 1. Ambient Occlusion (AO)

**Самая важная карта для устранения light bleeding!**

```
1. Ucupaint Panel → Bake
2. Bake Type: Ambient Occlusion
3. Настройки:
   - Samples: 128
   - Distance: 0.2 (для интерьера)
   - Only Local: Off
4. Нажмите "Bake"
5. Сохраните: Image → Save As → "SM_MFF_AO.png"
```

**Параметры AO:**
- Distance: 0.1-0.5 (меньше = только близкие углы)
- Samples: 64-256 (больше = качественнее, но медленнее)

### 2. Lightmap (Запеченное освещение)

```
1. Bake Type: Combined или Diffuse
2. Настройки:
   - Influence: Direct + Indirect
   - Samples: 256-512
   - Denoising: On
3. Нажмите "Bake"
4. Сохраните: "SM_MFF_Lightmap.png"
```

**Важно:** Для lightmap используйте UV2 если создали!

### 3. Base Color (Цвет)

```
1. Bake Type: Diffuse
2. Настройки:
   - Influence: Color only
   - Samples: 64
3. Нажмите "Bake"
4. Сохраните: "SM_MFF_BaseColor.png"
```

### 4. Normal Map (Нормали)

```
1. Bake Type: Normal
2. Настройки:
   - Space: Tangent
   - Samples: 64
3. Нажмите "Bake"
4. Сохраните: "SM_MFF_Normal.png"
```

**Важно:** Установите Color Space: Non-Color!

### 5. Roughness (Шероховатость)

```
1. Bake Type: Roughness
2. Настройки:
   - Samples: 64
3. Нажмите "Bake"
4. Сохраните: "SM_MFF_Roughness.png"
```

**Важно:** Color Space: Non-Color!

### 6. Metallic (Металличность)

```
1. Bake Type: Metallic
2. Настройки:
   - Samples: 64
3. Нажмите "Bake"
4. Сохраните: "SM_MFF_Metallic.png"
```

**Важно:** Color Space: Non-Color!

## Альтернатива: Стандартное запекание Blender

Если Ucupaint не работает, используйте встроенное запекание:

### 1. Подготовка

```
1. Выберите объект
2. Shading workspace
3. Создайте новую Image Texture в материале
4. Выберите эту текстуру в Node Editor
```

### 2. Настройки запекания

```
Render Properties → Bake:
- Bake Type: выберите нужный тип
- Output: выберите созданную текстуру
- Margin: 16px (для избежания швов)
- Clear Image: On
```

### 3. Запекание AO

```
Bake Type: Ambient Occlusion
Settings:
- Samples: 128
- Distance: 0.2
Нажмите "Bake"
```

### 4. Запекание Lightmap

```
Bake Type: Combined
Influence:
- Direct Lighting: On
- Indirect Lighting: On
- Color: Off
Samples: 256
Нажмите "Bake"
```

### 5. Сохранение

```
Image Editor → Image → Save As
Формат: PNG
Color Space: правильный для типа карты
```

## Экспорт текстур

### Структура файлов

```
public/textures/venue/
├── SM_MFF_BaseColor.png      (sRGB)
├── SM_MFF_AO.png              (Non-Color)
├── SM_MFF_Lightmap.png        (sRGB)
├── SM_MFF_Normal.png          (Non-Color)
├── SM_MFF_Roughness.png       (Non-Color)
└── SM_MFF_Metallic.png        (Non-Color)
```

### Настройки экспорта

```
Image → Save As:
- Format: PNG
- Color Depth: 8-bit (для Color, AO, Lightmap)
- Color Depth: 16-bit (для Normal, если нужна точность)
- Compression: 15% (баланс качество/размер)
```

## Применение в Three.js

### 1. Загрузка текстур

```typescript
// В VenueModel.tsx
import { useTexture } from '@react-three/drei'

const textures = useTexture({
  map: '/textures/venue/SM_MFF_BaseColor.png',
  aoMap: '/textures/venue/SM_MFF_AO.png',
  lightMap: '/textures/venue/SM_MFF_Lightmap.png',
  normalMap: '/textures/venue/SM_MFF_Normal.png',
  roughnessMap: '/textures/venue/SM_MFF_Roughness.png',
  metalnessMap: '/textures/venue/SM_MFF_Metallic.png',
})
```

### 2. Применение к материалу

```typescript
const material = new THREE.MeshStandardMaterial({
  map: textures.map,
  aoMap: textures.aoMap,
  aoMapIntensity: 2.5,  // Усиливаем AO!
  lightMap: textures.lightMap,
  lightMapIntensity: 1.0,
  normalMap: textures.normalMap,
  normalScale: new THREE.Vector2(1, 1),
  roughnessMap: textures.roughnessMap,
  roughness: 1.0,  // Используем карту
  metalnessMap: textures.metalnessMap,
  metalness: 1.0,  // Используем карту
  envMapIntensity: 1.2,
})
```

### 3. Важно для UV2 (Lightmap)

```typescript
// Если lightmap использует UV2
child.geometry.attributes.uv2 = child.geometry.attributes.uv
```

## Оптимизация

### Размеры текстур

**Для веб-приложения:**
- Desktop: 2048x2048
- Mobile: 1024x1024
- Используйте сжатие (KTX2, Basis)

### Комбинирование каналов

**Упакуйте карты в один файл:**
```
RGB: BaseColor
A: AO

Или:
R: Metallic
G: Roughness
B: AO
```

### Сжатие

```bash
# Используйте gltf-transform для сжатия
npm install -g @gltf-transform/cli

gltf-transform optimize input.glb output.glb \
  --texture-compress webp
```

## Проверка результата

### В Blender

```
1. Shading workspace
2. Viewport Shading: Material Preview
3. Проверьте что текстуры применились
4. Проверьте швы и артефакты
```

### В Three.js

```
1. Загрузите модель с текстурами
2. Проверьте что AO затемняет углы
3. Проверьте что lightmap добавляет освещение
4. Проверьте что нет швов на UV
```

## Troubleshooting

### Проблема: Швы на текстурах

**Решение:**
```
Bake Settings:
- Margin: 16px или больше
- Clear Image: On
```

### Проблема: Темные пятна

**Решение:**
```
AO Settings:
- Distance: уменьшите до 0.1
- Only Local: включите
```

### Проблема: Размытые текстуры

**Решение:**
```
- Увеличьте разрешение до 4096x4096
- Проверьте UV развертку (нет растяжений)
```

### Проблема: Lightmap слишком темный

**Решение:**
```
- Увеличьте Samples до 512
- Включите Denoising
- Увеличьте освещение в сцене
```

## Workflow

### Полный процесс:

1. **Подготовка** (30 мин)
   - Проверка UV
   - Настройка освещения
   - Установка Ucupaint

2. **Запекание** (1-2 часа)
   - AO (10 мин)
   - Lightmap (30-60 мин)
   - BaseColor (5 мин)
   - Normal (10 мин)
   - Roughness (5 мин)
   - Metallic (5 мин)

3. **Экспорт** (10 мин)
   - Сохранение текстур
   - Копирование в проект
   - Настройка Color Space

4. **Интеграция** (30 мин)
   - Загрузка в Three.js
   - Применение к материалу
   - Тестирование

5. **Оптимизация** (30 мин)
   - Сжатие текстур
   - Комбинирование каналов
   - Тестирование производительности

## Результат

После запекания вы получите:
- ✅ Реалистичное освещение (lightmap)
- ✅ Затемнение углов и стыков (AO)
- ✅ Детальные нормали (normal map)
- ✅ Правильные материалы (roughness, metallic)
- ✅ Нет light bleeding
- ✅ Высокая производительность (статические текстуры)

## Ссылки

- Ucupaint GitHub: https://github.com/ucupumar/ucupaint
- Ucupaint Docs: https://ucupumar.github.io/ucupaint-wiki/
- Blender Baking: https://docs.blender.org/manual/en/latest/render/cycles/baking.html
- Three.js Textures: https://threejs.org/docs/#api/en/textures/Texture

---

*Документ создан: 2026-02-13*
*Статус: Готов к использованию*

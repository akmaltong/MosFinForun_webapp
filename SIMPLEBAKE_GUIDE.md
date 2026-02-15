# SimpleBake - Руководство по типам запекания

## Что такое Combined?

**Combined** - это полное запекание всего освещения и материалов в одну текстуру.

### Combined содержит:

1. **Direct Lighting** - прямое освещение от источников света (Sun, Point, Spot)
2. **Indirect Lighting** - непрямое освещение (отраженный свет, Global Illumination)
3. **Diffuse Color** - цвет материала
4. **Shadows** - тени от объектов
5. **Ambient Occlusion** - затемнение в углах (если включено)
6. **Environment Lighting** - освещение от HDRI/World

**По сути Combined = BaseColor + Lighting + Shadows + AO**

## Разница между картами

### 1. AO (Ambient Occlusion)
```
Содержит: Только затемнение в углах и стыках
Цвет: Черно-белая карта
Использование: Умножается на другие карты для затемнения углов
```

### 2. Lightmap (обычно это Diffuse без Color)
```
Содержит: Только освещение (Direct + Indirect)
Цвет: Обычно белый/серый с цветным оттенком от света
Использование: Умножается на BaseColor для добавления освещения
```

### 3. Combined
```
Содержит: ВСЁ вместе (Color + Lighting + Shadows + AO)
Цвет: Полноцветная карта с финальным результатом
Использование: Может использоваться как единственная текстура
```

## Что использовать для Three.js?

### Вариант 1: Combined как единственная текстура (ПРОСТОЙ)

Используйте Combined как map, без других карт:

```typescript
const material = new THREE.MeshBasicMaterial({
  map: textures.combined,  // Combined содержит всё
})
```

**Плюсы:**
- ✅ Очень просто
- ✅ Одна текстура
- ✅ Быстрая загрузка
- ✅ Отличная производительность

**Минусы:**
- ❌ Нельзя менять освещение
- ❌ Нельзя настраивать материал
- ❌ Статичный результат

### Вариант 2: Раздельные карты (ГИБКИЙ) ⭐ РЕКОМЕНДУЕТСЯ

Используйте AO + Lightmap + BaseColor отдельно:

```typescript
const material = new THREE.MeshStandardMaterial({
  map: textures.baseColor,      // Цвет материала
  aoMap: textures.ao,            // Затемнение углов
  aoMapIntensity: 2.5,
  lightMap: textures.lightmap,   // Запеченное освещение
  lightMapIntensity: 1.0,
  // + можно добавить динамическое освещение
})
```

**Плюсы:**
- ✅ Гибкая настройка
- ✅ Можно менять интенсивность AO и Lightmap
- ✅ Можно добавить динамическое освещение
- ✅ Можно менять цвет материала

**Минусы:**
- ❌ Больше текстур (больше памяти)
- ❌ Чуть сложнее настройка

### Вариант 3: Combined + AO (КОМПРОМИСС)

Используйте Combined как map + AO для усиления углов:

```typescript
const material = new THREE.MeshStandardMaterial({
  map: textures.combined,        // Combined как основа
  aoMap: textures.ao,            // AO для усиления углов
  aoMapIntensity: 1.5,           // Меньше чем обычно
})
```

## Рекомендации для вашего проекта

### Для устранения light bleeding используйте:

**Вариант A: Только AO (без Combined/Lightmap)**
```typescript
const material = new THREE.MeshStandardMaterial({
  color: new THREE.Color(materialColor),
  aoMap: textures.ao,
  aoMapIntensity: 2.5,  // Сильное затемнение углов
  roughness: materialRoughness,
  metalness: materialMetalness,
  envMapIntensity: 1.2,
})
// + динамическое освещение из LightingSystem
```

**Плюсы:**
- ✅ Решает light bleeding
- ✅ Можно менять освещение в реальном времени
- ✅ Гибкая настройка
- ✅ Меньше текстур

**Вариант B: AO + Combined**
```typescript
const material = new THREE.MeshBasicMaterial({
  map: textures.combined,  // Финальный результат из Blender
  aoMap: textures.ao,      // Усиление затемнения
  aoMapIntensity: 1.0,
})
```

**Плюсы:**
- ✅ Точное соответствие Blender рендеру
- ✅ Реалистичное освещение
- ✅ Решает light bleeding

**Минусы:**
- ❌ Нельзя менять освещение
- ❌ Статичный результат

## SimpleBake настройки для разных карт

### Для AO:
```
Bake Type: Ambient Occlusion
View From: Combined
Samples: 128
Denoiser: OpenImageDenoise
```

### Для Lightmap (Diffuse без Color):
```
Bake Type: Diffuse
View From: Combined
Включить: Direct, Indirect, Transmission
Выключить: Color
Samples: 256
Denoiser: OpenImageDenoise
```

### Для Combined:
```
Bake Type: Combined
View From: Combined
Включить: Direct, Indirect, Diffuse, Glossy, Transmission
Samples: 256
Denoiser: OpenImageDenoise
```

### Для BaseColor (Diffuse Color):
```
Bake Type: Diffuse
View From: Combined
Включить: Color
Выключить: Direct, Indirect
Samples: 64
```

## Что запечь для вашего проекта?

### Минимальный набор (РЕКОМЕНДУЮ):
1. **AO** - для устранения light bleeding ⭐
2. **Combined** - для реалистичного вида

### Полный набор (если нужна гибкость):
1. **AO** - затемнение углов
2. **Lightmap** (Diffuse без Color) - освещение
3. **BaseColor** (Diffuse Color) - цвет материала
4. **Normal** - детали поверхности
5. **Roughness** - шероховатость
6. **Metallic** - металличность

## Применение в Three.js

### Вариант 1: Combined + AO (простой)

Обновите `VenueModelBaked.tsx`:

```typescript
import { useEffect } from 'react'
import { useGLTF, useTexture } from '@react-three/drei'
import * as THREE from 'three'

function LoadedModel() {
  const gltf = useGLTF('/SM_MFF.glb')
  
  // Загружаем только Combined и AO
  const textures = useTexture({
    combined: '/textures/venue/SM_MFF_Combined.png',
    aoMap: '/textures/venue/SM_MFF_AO.png',
  })

  useEffect(() => {
    if (!gltf?.scene) return
    
    gltf.scene.traverse((child: any) => {
      if (child.isMesh) {
        // Используем Combined как основу + AO для усиления
        child.material = new THREE.MeshBasicMaterial({
          map: textures.combined,
          aoMap: textures.aoMap,
          aoMapIntensity: 1.5,
        })
        
        // UV2 для AO
        if (child.geometry.attributes.uv) {
          child.geometry.attributes.uv2 = child.geometry.attributes.uv
        }
        
        child.castShadow = true
        child.receiveShadow = true
      }
    })
  }, [gltf, textures])

  return <primitive object={gltf.scene} />
}

export default function VenueModelBaked() {
  return <LoadedModel />
}
```

### Вариант 2: Только AO + динамическое освещение

```typescript
import { useEffect } from 'react'
import { useGLTF, useTexture } from '@react-three/drei'
import * as THREE from 'three'
import { useAppStore } from '../store/appStore'

function LoadedModel() {
  const gltf = useGLTF('/SM_MFF.glb')
  const materialColor = useAppStore(state => state.materialColor)
  const materialRoughness = useAppStore(state => state.materialRoughness)
  const materialMetalness = useAppStore(state => state.materialMetalness)
  
  // Загружаем только AO
  const aoTexture = useTexture('/textures/venue/SM_MFF_AO.png')

  useEffect(() => {
    if (!gltf?.scene) return
    
    gltf.scene.traverse((child: any) => {
      if (child.isMesh) {
        // PBR материал с AO + динамическое освещение
        child.material = new THREE.MeshStandardMaterial({
          color: new THREE.Color(materialColor),
          aoMap: aoTexture,
          aoMapIntensity: 2.5,  // Сильное затемнение углов
          roughness: materialRoughness,
          metalness: materialMetalness,
          envMapIntensity: 1.2,
        })
        
        // UV2 для AO
        if (child.geometry.attributes.uv) {
          child.geometry.attributes.uv2 = child.geometry.attributes.uv
        }
        
        child.castShadow = true
        child.receiveShadow = true
      }
    })
  }, [gltf, aoTexture, materialColor, materialRoughness, materialMetalness])

  return <primitive object={gltf.scene} />
}

export default function VenueModelBaked() {
  return <LoadedModel />
}
```

## Сравнение результатов

### Combined:
- Точное соответствие Blender рендеру
- Статичное освещение
- Не нужно настраивать LightingSystem

### AO + динамическое освещение:
- Можно менять освещение в реальном времени
- Гибкая настройка
- Нужно настроить LightingSystem

### AO + Lightmap + BaseColor:
- Максимальная гибкость
- Можно настраивать каждый аспект
- Больше текстур

## Мои рекомендации

### Для вашего проекта (устранение light bleeding):

**Используйте Вариант 2: Только AO + динамическое освещение**

Почему:
1. ✅ AO решает проблему light bleeding
2. ✅ Можно менять освещение (у вас 4 preset'а)
3. ✅ Можно настраивать материал через UI
4. ✅ Меньше текстур = быстрее загрузка
5. ✅ Гибкость для будущих изменений

### Если нужен точный результат из Blender:

**Используйте Вариант 1: Combined + AO**

Почему:
1. ✅ Точное соответствие рендеру
2. ✅ Реалистичное освещение
3. ✅ AO усиливает затемнение
4. ✅ Простая настройка

## Следующие шаги

1. Скопируйте запеченные текстуры в `public/textures/venue/`:
   - `SM_MFF_AO.png`
   - `SM_MFF_Combined.png` (если используете)

2. Выберите вариант применения (1 или 2)

3. Обновите `VenueModelBaked.tsx` соответствующим кодом

4. В `Scene3D.tsx` замените:
   ```typescript
   import VenueModelBaked from './VenueModelBaked'
   // <VenueModel /> → <VenueModelBaked />
   ```

5. Проверьте результат в браузере

6. Настройте `aoMapIntensity` если нужно

---

**Какой вариант хотите использовать?**
1. Combined + AO (точный результат из Blender)
2. Только AO + динамическое освещение (гибкость)

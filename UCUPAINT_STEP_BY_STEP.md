# Ucupaint: Пошаговая инструкция для SM_MFF

## Подготовка

### 1. Установка Ucupaint

**Blender 4.2+:**
```
1. Edit → Preferences
2. Get Extensions (вкладка слева)
3. Поиск: "Ucupaint"
4. Install
5. Перезапустите Blender
```

**Blender 3.x - 4.1:**
```
1. Скачайте: https://github.com/ucupumar/ucupaint/releases
2. Edit → Preferences → Add-ons
3. Install → выберите .zip файл
4. Включите галочку "Node: Ucupaint"
```

### 2. Откройте модель

```
File → Open → SM_MFF.blend
```

### 3. Проверьте UV

```
1. Выберите объект
2. Tab (Edit Mode)
3. UV Editing workspace (вверху)
4. Убедитесь что UV развертка есть и не перекрывается
```

**Если UV нет или плохая:**
```
1. В Edit Mode: A (выбрать все)
2. U → Smart UV Project
3. Island Margin: 0.02
4. OK
```

## Настройка сцены

### 1. Настройте освещение

**Вариант A: HDRI (Рекомендуется)**
```
1. Shading workspace
2. World Properties (иконка глобуса)
3. Surface → Background
4. Color → Environment Texture
5. Open → выберите .hdr файл
6. Strength: 1.0
```

**Вариант B: Sun Light**
```
1. Add → Light → Sun
2. Strength: 5.0
3. Angle: 0.526 (30°)
4. Rotation: настройте направление
```

### 2. Настройте Cycles

```
Render Properties:
- Render Engine: Cycles
- Device: GPU Compute (если есть GPU)
- Samples:
  - Viewport: 32
  - Render: 128 (для быстрого теста)
  - Render: 256-512 (для финала)
```

## Работа с Ucupaint

### 1. Активация Ucupaint

```
1. Выберите объект (SM_MFF)
2. Shading workspace
3. Нажмите N (боковая панель справа)
4. Найдите вкладку "Ucupaint"
```

### 2. Создание Yp Material

**Если материал уже есть:**
```
1. В панели Ucupaint нажмите "Convert to Yp Material"
2. Подтвердите конвертацию
```

**Если материала нет:**
```
1. В панели Ucupaint нажмите "New Yp Material"
2. Материал создастся автоматически
```

### 3. Настройка разрешения

```
Ucupaint Panel → Settings (иконка шестеренки):
- Width: 2048
- Height: 2048
- Color Depth: 8 bit (для Color, AO, Lightmap)
- Color Depth: 16 bit (для Normal - опционально)
```

## Запекание карт

### КАРТА 1: Ambient Occlusion (AO) ⭐ ВАЖНЕЙШАЯ!

```
1. Ucupaint Panel → Bake (иконка печки)
2. Bake Type: Ambient Occlusion
3. Настройки:
   ┌─────────────────────────────────┐
   │ Samples: 128                    │
   │ Distance: 0.2                   │
   │ Only Local: OFF                 │
   │ Margin: 16                      │
   │ Clear Image: ON                 │
   └─────────────────────────────────┘
4. Нажмите "Bake Ambient Occlusion"
5. Ждите завершения (5-10 минут)
6. Image Editor → Image → Save As
   - Имя: SM_MFF_AO.png
   - Формат: PNG
   - Color Space: Non-Color Data ⚠️
   - Путь: public/textures/venue/
7. Save Image
```

**Параметры AO:**
- **Distance 0.1** - только очень близкие углы (резкий AO)
- **Distance 0.2** - средние углы (рекомендуется)
- **Distance 0.5** - широкие области (мягкий AO)

### КАРТА 2: Lightmap (Combined)

```
1. Ucupaint Panel → Bake
2. Bake Type: Combined
3. Настройки:
   ┌─────────────────────────────────┐
   │ Samples: 256                    │
   │ Influence:                      │
   │   ☑ Direct Lighting             │
   │   ☑ Indirect Lighting           │
   │   ☐ Color                       │
   │   ☐ Diffuse                     │
   │   ☐ Glossy                      │
   │   ☐ Transmission                │
   │ Margin: 16                      │
   │ Clear Image: ON                 │
   │ Denoise: ON ⚠️                  │
   └─────────────────────────────────┘
4. Нажмите "Bake Combined"
5. Ждите завершения (20-40 минут)
6. Save As:
   - Имя: SM_MFF_Lightmap.png
   - Color Space: sRGB
   - Путь: public/textures/venue/
```

**Для более качественного Lightmap:**
- Samples: 512 (дольше, но качественнее)
- Denoise: ON (обязательно!)

### КАРТА 3: Base Color

```
1. Ucupaint Panel → Bake
2. Bake Type: Diffuse
3. Настройки:
   ┌─────────────────────────────────┐
   │ Samples: 64                     │
   │ Influence:                      │
   │   ☐ Direct                      │
   │   ☐ Indirect                    │
   │   ☑ Color                       │
   │ Margin: 16                      │
   │ Clear Image: ON                 │
   └─────────────────────────────────┘
4. Нажмите "Bake Diffuse"
5. Ждите завершения (2-5 минут)
6. Save As:
   - Имя: SM_MFF_BaseColor.png
   - Color Space: sRGB
   - Путь: public/textures/venue/
```

### КАРТА 4: Normal Map

```
1. Ucupaint Panel → Bake
2. Bake Type: Normal
3. Настройки:
   ┌─────────────────────────────────┐
   │ Samples: 64                     │
   │ Normal Space: Tangent ⚠️        │
   │ Normal Swizzle: +X +Y +Z        │
   │ Margin: 16                      │
   │ Clear Image: ON                 │
   └─────────────────────────────────┘
4. Нажмите "Bake Normal"
5. Ждите завершения (5-10 минут)
6. Save As:
   - Имя: SM_MFF_Normal.png
   - Color Space: Non-Color Data ⚠️
   - Путь: public/textures/venue/
```

**Важно:** Normal Space должен быть Tangent для Three.js!

### КАРТА 5: Roughness

```
1. Ucupaint Panel → Bake
2. Bake Type: Roughness
3. Настройки:
   ┌─────────────────────────────────┐
   │ Samples: 64                     │
   │ Margin: 16                      │
   │ Clear Image: ON                 │
   └─────────────────────────────────┘
4. Нажмите "Bake Roughness"
5. Ждите завершения (2-5 минут)
6. Save As:
   - Имя: SM_MFF_Roughness.png
   - Color Space: Non-Color Data ⚠️
   - Путь: public/textures/venue/
```

### КАРТА 6: Metallic

```
1. Ucupaint Panel → Bake
2. Bake Type: Emit (для Metallic)
3. Настройки:
   ┌─────────────────────────────────┐
   │ Samples: 64                     │
   │ Margin: 16                      │
   │ Clear Image: ON                 │
   └─────────────────────────────────┘
4. Нажмите "Bake Emit"
5. Ждите завершения (2-5 минут)
6. Save As:
   - Имя: SM_MFF_Metallic.png
   - Color Space: Non-Color Data ⚠️
   - Путь: public/textures/venue/
```

## Проверка в Blender

### 1. Создайте тестовый материал

```
1. Shading workspace
2. Создайте новый материал "Test_Baked"
3. Добавьте Image Texture nodes для каждой карты
4. Подключите:
   - BaseColor → Base Color
   - AO → смешайте с Base Color (Multiply)
   - Lightmap → смешайте с результатом (Multiply)
   - Normal → Normal input
   - Roughness → Roughness
   - Metallic → Metallic
```

### 2. Проверьте результат

```
1. Viewport Shading: Material Preview (Z → 2)
2. Проверьте:
   ✓ Углы затемнены (AO работает)
   ✓ Освещение реалистичное (Lightmap)
   ✓ Нет швов на UV
   ✓ Цвета правильные
```

## Копирование в проект

### Windows PowerShell:

```powershell
# Перейдите в папку проекта
cd C:\Users\akmal\Desktop\ПРОЕКТЫ_Forum_navigation_app\forum-nav-app5_backup_v1_20260212_193914

# Создайте директорию
New-Item -ItemType Directory -Force -Path "public\textures\venue"

# Скопируйте текстуры из Blender
# (замените путь на ваш путь к Blender проекту)
Copy-Item "C:\Path\To\Blender\Project\textures\venue\*.png" -Destination "public\textures\venue\"
```

### Или вручную:

```
1. Откройте папку с Blender проектом
2. Найдите папку textures/venue/
3. Скопируйте все .png файлы
4. Вставьте в: forum-nav-app5_backup_v1_20260212_193914\public\textures\venue\
```

## Применение в Three.js

Создайте новый файл `src/components/VenueModelBaked.tsx`:

```typescript
import { useEffect } from 'react'
import { useGLTF, useTexture } from '@react-three/drei'
import * as THREE from 'three'
import { useAppStore } from '../store/appStore'

function LoadedModel() {
  const gltf = useGLTF('/SM_MFF.glb')
  const { scene } = gltf
  
  const materialColor = useAppStore(state => state.materialColor)
  const materialRoughness = useAppStore(state => state.materialRoughness)
  const materialMetalness = useAppStore(state => state.materialMetalness)
  
  // Загружаем запеченные текстуры
  const textures = useTexture({
    map: '/textures/venue/SM_MFF_BaseColor.png',
    aoMap: '/textures/venue/SM_MFF_AO.png',
    lightMap: '/textures/venue/SM_MFF_Lightmap.png',
    normalMap: '/textures/venue/SM_MFF_Normal.png',
    roughnessMap: '/textures/venue/SM_MFF_Roughness.png',
    metalnessMap: '/textures/venue/SM_MFF_Metallic.png',
  })

  useEffect(() => {
    if (!gltf?.scene) return
    
    gltf.scene.traverse((child: any) => {
      if (child.isMesh) {
        // Создаем материал с запеченными текстурами
        const bakedMaterial = new THREE.MeshStandardMaterial({
          // Base Color
          map: textures.map,
          color: new THREE.Color(materialColor),
          
          // AO - КЛЮЧЕВАЯ КАРТА для устранения light bleeding!
          aoMap: textures.aoMap,
          aoMapIntensity: 2.5,  // Усиливаем затемнение углов
          
          // Lightmap - запеченное освещение
          lightMap: textures.lightMap,
          lightMapIntensity: 1.0,
          
          // Normal Map
          normalMap: textures.normalMap,
          normalScale: new THREE.Vector2(1, 1),
          
          // Roughness
          roughnessMap: textures.roughnessMap,
          roughness: materialRoughness,
          
          // Metallic
          metalnessMap: textures.metalnessMap,
          metalness: materialMetalness,
          
          // Environment
          envMapIntensity: 1.2,
          
          // Другие настройки
          side: THREE.DoubleSide,
        })
        
        // Для lightmap нужен UV2
        if (child.geometry.attributes.uv) {
          child.geometry.attributes.uv2 = child.geometry.attributes.uv
        }
        
        child.material = bakedMaterial
        child.castShadow = true
        child.receiveShadow = true
      }
    })
  }, [gltf, textures, materialColor, materialRoughness, materialMetalness])

  return <primitive object={scene} />
}

export default function VenueModelBaked() {
  return <LoadedModel />
}
```

### Обновите Scene3D.tsx:

```typescript
// Замените импорт
// import VenueModel from './VenueModel'
import VenueModelBaked from './VenueModelBaked'

// В JSX замените
// <VenueModel />
<VenueModelBaked />
```

## Настройка интенсивности

### Если углы слишком темные:

```typescript
aoMapIntensity: 2.0,      // Было 2.5
lightMapIntensity: 1.2,   // Было 1.0
```

### Если углы все еще светлые:

```typescript
aoMapIntensity: 3.0,      // Было 2.5
lightMapIntensity: 0.8,   // Было 1.0
```

### Если общая сцена темная:

```typescript
lightMapIntensity: 1.5,   // Увеличить
// И/или уменьшить ambient освещение в LightingSystem
<ambientLight intensity={0.3} />  // Было 0.25
```

## Troubleshooting

### Проблема: Ucupaint не появляется в панели

**Решение:**
```
1. Edit → Preferences → Add-ons
2. Найдите "Ucupaint"
3. Убедитесь что галочка включена
4. Перезапустите Blender
```

### Проблема: "Convert to Yp Material" не работает

**Решение:**
```
1. Удалите существующий материал
2. Создайте новый: "New Yp Material"
3. Настройте материал заново
```

### Проблема: Запекание очень долгое

**Решение:**
```
1. Уменьшите Samples:
   - AO: 64 (вместо 128)
   - Lightmap: 128 (вместо 256)
2. Уменьшите разрешение:
   - 1024x1024 (вместо 2048x2048)
3. Включите GPU в Cycles:
   - Device: GPU Compute
```

### Проблема: Швы на текстурах

**Решение:**
```
1. Увеличьте Margin: 32 (вместо 16)
2. Проверьте UV развертку (нет перекрытий)
3. Используйте Smart UV Project с большим Island Margin
```

### Проблема: AO слишком темный

**Решение в Blender:**
```
Distance: 0.1 (вместо 0.2)
```

**Решение в Three.js:**
```typescript
aoMapIntensity: 1.5 (вместо 2.5)
```

### Проблема: Lightmap слишком темный

**Решение в Blender:**
```
1. Увеличьте освещение в сцене
2. Samples: 512 (больше света соберется)
3. Denoise: ON
```

**Решение в Three.js:**
```typescript
lightMapIntensity: 1.5 (вместо 1.0)
```

### Проблема: Текстуры не загружаются в Three.js

**Решение:**
```
1. Проверьте пути к файлам
2. Проверьте что файлы в public/textures/venue/
3. Проверьте консоль браузера на ошибки
4. Проверьте Color Space (sRGB vs Non-Color)
```

## Чеклист

### Перед запеканием:
- [ ] Ucupaint установлен и активен
- [ ] Модель открыта в Blender
- [ ] UV развертка проверена
- [ ] Освещение настроено
- [ ] Cycles включен (GPU)
- [ ] Разрешение установлено (2048x2048)

### Запекание:
- [ ] AO запечен (Non-Color Data)
- [ ] Lightmap запечен (sRGB, Denoise ON)
- [ ] BaseColor запечен (sRGB)
- [ ] Normal запечен (Non-Color Data, Tangent)
- [ ] Roughness запечен (Non-Color Data)
- [ ] Metallic запечен (Non-Color Data)

### После запекания:
- [ ] Все текстуры сохранены в .png
- [ ] Color Space правильный для каждой карты
- [ ] Текстуры скопированы в public/textures/venue/
- [ ] VenueModelBaked.tsx создан
- [ ] Scene3D.tsx обновлен
- [ ] Проверено в браузере

### Результат:
- [ ] Углы затемнены (нет light bleeding)
- [ ] Освещение реалистичное
- [ ] Нет швов на UV
- [ ] Производительность хорошая
- [ ] FPS стабильный

## Время выполнения

- Подготовка: 15 минут
- Запекание AO: 5-10 минут
- Запекание Lightmap: 20-40 минут
- Запекание остальных: 15-25 минут
- Интеграция: 15 минут

**Общее время: ~70-105 минут**

## Следующие шаги

1. Установите Ucupaint
2. Откройте SM_MFF.blend
3. Следуйте инструкциям выше
4. Запеките все 6 карт
5. Скопируйте в проект
6. Создайте VenueModelBaked.tsx
7. Проверьте результат
8. Настройте интенсивность

---

*Готово к использованию!*
*Если возникнут вопросы - спрашивайте!*

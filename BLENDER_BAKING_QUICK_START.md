# Быстрый старт: Запекание текстур в Blender

## Вариант 1: Автоматический скрипт (Рекомендуется)

### Шаг 1: Подготовка

1. Откройте вашу модель в Blender: `SM_MFF.blend`
2. Выберите объекты для запекания (или оставьте пустым для всех)
3. Убедитесь что UV развертка правильная

### Шаг 2: Настройка скрипта

Откройте `blender_bake_textures.py` и настройте:

```python
# Разрешение текстур
TEXTURE_SIZE = 2048  # Измените на 1024 или 4096

# Путь для сохранения
OUTPUT_DIR = "//textures/venue/"

# Имя модели
MODEL_NAME = "SM_MFF"

# Какие карты запекать
BAKE_MAPS = {
    'AO': True,              # Ambient Occlusion - ВАЖНО!
    'LIGHTMAP': True,        # Освещение
    'BASECOLOR': True,       # Цвет
    'NORMAL': True,          # Нормали
    'ROUGHNESS': True,       # Шероховатость
    'METALLIC': True,        # Металличность
}
```

### Шаг 3: Запуск

**Из командной строки:**
```bash
blender SM_MFF.blend --background --python blender_bake_textures.py
```

**Из Blender:**
1. Scripting workspace
2. Open → `blender_bake_textures.py`
3. Run Script (Alt+P)

### Шаг 4: Результат

Текстуры будут сохранены в:
```
textures/venue/
├── SM_MFF_AO.png
├── SM_MFF_Lightmap.png
├── SM_MFF_BaseColor.png
├── SM_MFF_Normal.png
├── SM_MFF_Roughness.png
└── SM_MFF_Metallic.png
```

## Вариант 2: Ручное запекание

### 1. Ambient Occlusion (AO) - САМОЕ ВАЖНОЕ!

```
1. Выберите объект
2. Shading workspace
3. Создайте новую Image: Image → New (2048x2048, Non-Color)
4. Добавьте Image Texture node, выберите созданную текстуру
5. Render Properties → Bake:
   - Type: Ambient Occlusion
   - Samples: 128
   - Distance: 0.2
   - Margin: 16
6. Bake
7. Image → Save As → SM_MFF_AO.png
```

### 2. Lightmap

```
1. Создайте новую Image (2048x2048, sRGB)
2. Bake:
   - Type: Combined
   - Influence: Direct + Indirect
   - Samples: 256
   - Margin: 16
3. Save As → SM_MFF_Lightmap.png
```

### 3. Base Color

```
1. Создайте новую Image (2048x2048, sRGB)
2. Bake:
   - Type: Diffuse
   - Influence: Color only
   - Samples: 64
3. Save As → SM_MFF_BaseColor.png
```

### 4. Normal Map

```
1. Создайте новую Image (2048x2048, Non-Color)
2. Bake:
   - Type: Normal
   - Space: Tangent
   - Samples: 64
3. Save As → SM_MFF_Normal.png
```

### 5. Roughness

```
1. Создайте новую Image (2048x2048, Non-Color)
2. Bake:
   - Type: Roughness
   - Samples: 64
3. Save As → SM_MFF_Roughness.png
```

### 6. Metallic

```
1. Создайте новую Image (2048x2048, Non-Color)
2. Bake:
   - Type: Emit (для metallic)
   - Samples: 64
3. Save As → SM_MFF_Metallic.png
```

## Вариант 3: С Ucupaint

### Установка

```
Edit → Preferences → Get Extensions → "Ucupaint" → Install
```

### Использование

```
1. Выберите объект
2. Shading workspace
3. Боковая панель (N) → Ucupaint
4. New Yp Material
5. Settings:
   - Width: 2048
   - Height: 2048
6. Bake → выберите тип → Bake
7. Сохраните каждую текстуру
```

## Копирование в проект

### Windows:
```powershell
# Создайте директорию
mkdir public\textures\venue

# Скопируйте текстуры
copy textures\venue\*.png public\textures\venue\
```

### Linux/Mac:
```bash
# Создайте директорию
mkdir -p public/textures/venue

# Скопируйте текстуры
cp textures/venue/*.png public/textures/venue/
```

## Применение в Three.js

Обновите `src/components/VenueModel.tsx`:

```typescript
import { useTexture } from '@react-three/drei'

function LoadedModel() {
  const gltf = useGLTF('/SM_MFF.glb')
  
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
    gltf.scene.traverse((child: any) => {
      if (child.isMesh) {
        child.material = new THREE.MeshStandardMaterial({
          map: textures.map,
          aoMap: textures.aoMap,
          aoMapIntensity: 2.5,  // ВАЖНО: усиливаем AO!
          lightMap: textures.lightMap,
          lightMapIntensity: 1.0,
          normalMap: textures.normalMap,
          roughnessMap: textures.roughnessMap,
          roughness: 1.0,
          metalnessMap: textures.metalnessMap,
          metalness: 1.0,
          envMapIntensity: 1.2,
        })
        
        // Для lightmap нужен UV2
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
```

## Проверка

1. Откройте http://localhost:3000/
2. Проверьте что текстуры загрузились
3. Углы должны быть затемнены (AO)
4. Освещение должно быть реалистичным (Lightmap)
5. Не должно быть светлых полос

## Troubleshooting

### Текстуры не загружаются

```typescript
// Проверьте пути
console.log('Textures:', textures)

// Проверьте что файлы существуют в public/textures/venue/
```

### Швы на текстурах

```
Увеличьте Margin в настройках запекания:
- Margin: 32 (вместо 16)
```

### Слишком темно

```typescript
// Уменьшите AO intensity
aoMapIntensity: 1.5  // Вместо 2.5

// Или увеличьте lightMap intensity
lightMapIntensity: 1.5  // Вместо 1.0
```

### Слишком светло (light bleeding)

```typescript
// Увеличьте AO intensity
aoMapIntensity: 3.0  // Вместо 2.5

// Или уменьшите ambient освещение
<ambientLight intensity={0.2} />
```

## Оптимизация

### Сжатие текстур

```bash
# Установите ImageMagick
# Windows: choco install imagemagick
# Mac: brew install imagemagick

# Сжатие PNG
magick convert SM_MFF_AO.png -quality 85 SM_MFF_AO_compressed.png
```

### Уменьшение размера

```bash
# Resize до 1024x1024 для мобильных
magick convert SM_MFF_AO.png -resize 1024x1024 SM_MFF_AO_1k.png
```

## Время запекания

- AO: ~5-10 минут
- Lightmap: ~20-40 минут (зависит от samples)
- BaseColor: ~2-5 минут
- Normal: ~5-10 минут
- Roughness: ~2-5 минут
- Metallic: ~2-5 минут

**Общее время: ~40-80 минут**

## Следующие шаги

1. Запеките текстуры в Blender
2. Скопируйте в `public/textures/venue/`
3. Обновите `VenueModel.tsx`
4. Проверьте результат
5. Настройте `aoMapIntensity` и `lightMapIntensity`
6. Оптимизируйте размеры текстур

---

*Документ создан: 2026-02-13*
*Готов к использованию*

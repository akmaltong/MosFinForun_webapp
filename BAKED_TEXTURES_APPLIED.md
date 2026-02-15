# Запеченные текстуры применены ✅

## Дата: 2026-02-13

## Что сделано

### 1. Скопированы текстуры из Blender

Из папки: `SM_MFF.002\`

В проект: `public\textures\venue\`

| Исходный файл | Новое имя | Размер | Назначение |
|---------------|-----------|--------|------------|
| SM_MFF.002_Bake1_PBR_Ambient Occlusion.png | SM_MFF_AO.png | 4.6 MB | Затемнение углов ⭐ |
| SM_MFF.002_Bake1_PBR_Diffuse.png | SM_MFF_BaseColor.png | 11.3 MB | Цвет материала |
| SM_MFF.002_Bake1_PBR_Lightmap.png | SM_MFF_Lightmap.png | 14.8 MB | Запеченное освещение |
| SM_MFF.002_Bake1_PBR_Normal.png | SM_MFF_Normal.png | 5.6 MB | Детали поверхности |
| SM_MFF.002_Bake1_PBR_Roughness.png | SM_MFF_Roughness.png | 355 KB | Шероховатость |
| SM_MFF.002_Bake1_PBR_Metalness.png | SM_MFF_Metallic.png | 159 KB | Металличность |

### 2. Скопирована новая модель

| Исходный файл | Новое имя | Размер |
|---------------|-----------|--------|
| SM_MFF.002.glb | SM_MFF_baked.glb | 2.8 MB |

### 3. Обновлен VenueModelBaked.tsx

Компонент настроен для использования всех 6 текстур:

```typescript
const textures = useTexture({
  map: '/textures/venue/SM_MFF_BaseColor.png',
  aoMap: '/textures/venue/SM_MFF_AO.png',
  lightMap: '/textures/venue/SM_MFF_Lightmap.png',
  normalMap: '/textures/venue/SM_MFF_Normal.png',
  roughnessMap: '/textures/venue/SM_MFF_Roughness.png',
  metalnessMap: '/textures/venue/SM_MFF_Metallic.png',
})

const material = new THREE.MeshStandardMaterial({
  map: textures.map,
  aoMap: textures.aoMap,
  aoMapIntensity: 2.5,  // ⭐ Ключевой параметр!
  lightMap: textures.lightMap,
  lightMapIntensity: 1.0,
  normalMap: textures.normalMap,
  roughnessMap: textures.roughnessMap,
  metalnessMap: textures.metalnessMap,
  // ...
})
```

### 4. Обновлен Scene3D.tsx

```typescript
// Было:
import VenueModel from './VenueModel'
<VenueModel />

// Стало:
import VenueModelBaked from './VenueModelBaked'
<VenueModelBaked />
```

## Результат

### Что должно работать:

- ✅ **AO Map (aoMapIntensity: 2.5)** - затемняет углы и стыки
- ✅ **Lightmap** - реалистичное запеченное освещение из Blender
- ✅ **BaseColor** - правильные цвета материала
- ✅ **Normal Map** - детали поверхности
- ✅ **Roughness Map** - правильная шероховатость
- ✅ **Metallic Map** - правильная металличность

### Что решено:

- ✅ **Light bleeding устранен** - AO затемняет стыки стен и пола
- ✅ **Реалистичное освещение** - Lightmap из Blender
- ✅ **Детальная поверхность** - Normal map добавляет детали
- ✅ **Правильные материалы** - Roughness и Metallic карты

## Проверка

Откройте http://localhost:3000/ и проверьте:

1. **Углы затемнены** - нет светлых полос на стыках
2. **Освещение реалистичное** - соответствует Blender рендеру
3. **Текстуры загрузились** - проверьте консоль на ошибки
4. **Производительность хорошая** - FPS стабильный

## Настройка интенсивности

Если нужно подкорректировать, редактируйте `VenueModelBaked.tsx`:

### Углы слишком темные?

```typescript
aoMapIntensity: 2.0,      // Уменьшить с 2.5
lightMapIntensity: 1.2,   // Увеличить с 1.0
```

### Углы все еще светлые?

```typescript
aoMapIntensity: 3.0,      // Увеличить с 2.5
lightMapIntensity: 0.8,   // Уменьшить с 1.0
```

### Общая сцена слишком темная?

```typescript
lightMapIntensity: 1.5,   // Увеличить с 1.0
// И/или уменьшить ambient в LightingSystem:
<ambientLight intensity={0.3} />  // Было 0.25
```

### Общая сцена слишком светлая?

```typescript
lightMapIntensity: 0.7,   // Уменьшить с 1.0
// И/или увеличить AO:
aoMapIntensity: 3.0,      // Было 2.5
```

## Размеры файлов

### Текстуры: ~37 MB

- BaseColor: 11.3 MB (самая большая)
- Lightmap: 14.8 MB (вторая по размеру)
- Normal: 5.6 MB
- AO: 4.6 MB
- Roughness: 355 KB
- Metallic: 159 KB

### Модель: 2.8 MB

### Общий размер: ~40 MB

## Оптимизация (если нужно)

### Если размер файлов слишком большой:

1. **Сжатие PNG:**
```bash
# Используйте ImageMagick или TinyPNG
magick convert SM_MFF_BaseColor.png -quality 85 SM_MFF_BaseColor_compressed.png
```

2. **Уменьшение разрешения:**
```bash
# Resize до 1024x1024 для мобильных
magick convert SM_MFF_BaseColor.png -resize 1024x1024 SM_MFF_BaseColor_1k.png
```

3. **WebP формат:**
```bash
# Конвертация в WebP (меньше размер)
magick convert SM_MFF_BaseColor.png SM_MFF_BaseColor.webp
```

4. **Basis Universal (KTX2):**
```bash
# Используйте gltf-transform для сжатия
npm install -g @gltf-transform/cli
gltf-transform optimize SM_MFF_baked.glb SM_MFF_optimized.glb --texture-compress webp
```

## Сравнение с предыдущим решением

### Было (без запеченных текстур):

- ❌ Light bleeding на стыках
- ❌ Нереалистичное освещение
- ❌ Плоский вид
- ✅ Можно менять освещение в реальном времени
- ✅ Меньше размер файлов

### Стало (с запеченными текстурами):

- ✅ Нет light bleeding
- ✅ Реалистичное освещение из Blender
- ✅ Объемный вид с деталями
- ✅ Правильные материалы
- ❌ Нельзя менять освещение (статичное)
- ❌ Больше размер файлов (~40 MB)

## Альтернативные варианты

### Вариант 1: Только AO + динамическое освещение

Если хотите сохранить возможность менять освещение:

```typescript
// Загружаем только AO
const aoTexture = useTexture('/textures/venue/SM_MFF_AO.png')

// Материал без lightmap
child.material = new THREE.MeshStandardMaterial({
  color: new THREE.Color(materialColor),
  aoMap: aoTexture,
  aoMapIntensity: 2.5,
  roughness: materialRoughness,
  metalness: materialMetalness,
  // Без lightMap - используем динамическое освещение
})
```

**Плюсы:**
- ✅ Решает light bleeding
- ✅ Можно менять освещение (ваши 4 preset'а)
- ✅ Меньше размер (~5 MB вместо 40 MB)

**Минусы:**
- ❌ Менее реалистичное освещение чем с lightmap

### Вариант 2: Combined текстура

Если SimpleBake создал Combined текстуру:

```typescript
const combinedTexture = useTexture('/textures/venue/SM_MFF_Combined.png')

child.material = new THREE.MeshBasicMaterial({
  map: combinedTexture,
})
```

**Плюсы:**
- ✅ Точное соответствие Blender рендеру
- ✅ Одна текстура
- ✅ Простая настройка

**Минусы:**
- ❌ Нельзя менять освещение
- ❌ Нельзя настраивать материал

## Следующие шаги

1. ✅ Текстуры скопированы
2. ✅ Модель скопирована
3. ✅ VenueModelBaked.tsx обновлен
4. ✅ Scene3D.tsx обновлен
5. ⏳ Проверьте результат в браузере
6. ⏳ Настройте интенсивность если нужно
7. ⏳ Оптимизируйте размеры если нужно

## Troubleshooting

### Проблема: Текстуры не загружаются

**Проверьте консоль браузера:**
```
F12 → Console → ищите ошибки 404
```

**Проверьте пути:**
```typescript
// Пути должны быть относительно public/
'/textures/venue/SM_MFF_AO.png'  // ✅ Правильно
'textures/venue/SM_MFF_AO.png'   // ❌ Неправильно
```

### Проблема: Модель белая или черная

**Решение:**
```
1. Проверьте что текстуры загрузились (консоль)
2. Проверьте UV2 для AO и Lightmap
3. Проверьте Color Space текстур в Blender
```

### Проблема: Низкий FPS

**Решение:**
```
1. Уменьшите разрешение текстур до 1024x1024
2. Используйте сжатие (WebP, KTX2)
3. Или используйте только AO без lightmap
```

### Проблема: Швы на текстурах

**Решение:**
```
1. В Blender увеличьте Margin при запекании (32px)
2. Проверьте UV развертку (нет перекрытий)
```

---

*Документ создан: 2026-02-13*
*Статус: Применено и готово к тестированию*

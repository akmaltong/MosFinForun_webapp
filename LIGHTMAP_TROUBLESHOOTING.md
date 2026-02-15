# Lightmap не запекается - Решение проблем

## Частые причины и решения

### ПРИЧИНА 1: Нет освещения в сцене ⭐ САМАЯ ЧАСТАЯ!

**Проверка:**
```
1. Viewport Shading → Rendered (Z → 8)
2. Видите ли вы освещение на модели?
3. Если модель черная или очень темная - нет освещения!
```

**Решение A - Добавить Sun Light:**
```
1. Add (Shift+A) → Light → Sun
2. Properties панель (справа):
   - Strength: 5.0 (или больше)
   - Angle: 0.526
3. Поверните Sun (R + X/Y/Z + угол)
4. Проверьте в Rendered view
```

**Решение B - Добавить HDRI:**
```
1. Shading workspace
2. World Properties (иконка глобуса)
3. Surface → Background
4. Нажмите на точку рядом с Color
5. Environment Texture
6. Open → выберите .hdr файл
7. Strength: 1.0 или больше
```

**Решение C - Увеличить World Strength:**
```
World Properties:
- Background → Strength: 2.0 или 3.0
```

### ПРИЧИНА 2: Cycles не настроен правильно

**Проверка:**
```
Render Properties:
- Render Engine: должен быть Cycles (не Eevee!)
```

**Решение:**
```
Render Properties:
- Render Engine: Cycles
- Device: GPU Compute (если есть)
- Samples: минимум 128
```

### ПРИЧИНА 3: Нет UV развертки

**Проверка:**
```
1. Edit Mode (Tab)
2. UV Editing workspace
3. Видите ли UV в UV Editor?
4. Если пусто - нет UV!
```

**Решение:**
```
1. Edit Mode (Tab)
2. Select All (A)
3. U → Smart UV Project
4. Island Margin: 0.02
5. OK
```

### ПРИЧИНА 4: Неправильные настройки Bake

**Для Ucupaint:**
```
Bake Type: Combined (не Diffuse!)

Influence (должны быть включены):
☑ Direct Lighting
☑ Indirect Lighting
☐ Color (выключить!)
☐ Diffuse (выключить!)
☐ Glossy (выключить!)
☐ Transmission (выключить!)
```

**Для стандартного Blender Bake:**
```
Render Properties → Bake:
- Bake Type: Combined
- Influence:
  ☑ Direct
  ☑ Indirect
  ☐ Color
```

### ПРИЧИНА 5: Samples слишком низкие

**Решение:**
```
Render Properties → Sampling:
- Render Samples: минимум 128
- Для качественного lightmap: 256-512
```

### ПРИЧИНА 6: Объект не выбран

**Решение:**
```
1. Убедитесь что объект выбран (оранжевый контур)
2. В Outliner объект должен быть подсвечен
3. Если несколько объектов - выберите все (A в Object Mode)
```

### ПРИЧИНА 7: Материал не настроен для запекания

**Для Ucupaint:**
```
1. Убедитесь что создали Yp Material
2. Ucupaint Panel → "New Yp Material"
3. Или "Convert to Yp Material"
```

**Для стандартного Bake:**
```
1. Shading workspace
2. Создайте Image Texture node
3. Выберите этот node (должен быть активным)
4. Создайте новую Image в этом node
```

### ПРИЧИНА 8: Denoise блокирует запекание

**Решение:**
```
Попробуйте отключить Denoise:
Render Properties → Sampling:
- Denoise: OFF (временно)

После успешного запекания можно включить обратно
```

## Пошаговая диагностика

### ШАГ 1: Проверьте освещение

```
1. Viewport Shading → Rendered (Z → 8)
2. Модель должна быть освещена
3. Если черная:
   - Add → Light → Sun
   - Strength: 5.0
   - Проверьте снова
```

### ШАГ 2: Проверьте Cycles

```
Render Properties:
- Engine: Cycles ✓
- Device: GPU Compute ✓
- Samples: 128+ ✓
```

### ШАГ 3: Проверьте UV

```
1. Edit Mode (Tab)
2. UV Editing workspace
3. Если пусто:
   - A (select all)
   - U → Smart UV Project
```

### ШАГ 4: Попробуйте стандартное запекание

Если Ucupaint не работает, используйте встроенное:

```
1. Shading workspace
2. Выберите объект
3. Добавьте Image Texture node в материал
4. Создайте новую Image (2048x2048, sRGB)
5. Выберите этот node (активный)
6. Render Properties → Bake:
   - Type: Combined
   - Direct: ON
   - Indirect: ON
   - Color: OFF
   - Samples: 256
   - Margin: 16
7. Нажмите "Bake"
```

### ШАГ 5: Проверьте консоль Blender

```
Window → Toggle System Console (Windows)
или
Terminal (Mac/Linux)

Ищите ошибки во время запекания
```

## Альтернативный метод: Стандартное запекание

Если Ucupaint совсем не работает:

### 1. Подготовка

```
1. Выберите объект
2. Shading workspace
3. Убедитесь что материал есть
```

### 2. Создание Image для запекания

```
1. В Shader Editor добавьте Image Texture node (Shift+A)
2. New Image:
   - Name: Lightmap
   - Width: 2048
   - Height: 2048
   - Color: Black
   - Alpha: OFF
   - Generated Type: Blank
   - Float Buffer: OFF
3. Выберите этот node (он должен быть активным - белая рамка)
```

### 3. Настройка Bake

```
Render Properties → Bake:
┌─────────────────────────────────┐
│ Bake Type: Combined             │
│                                 │
│ Influence:                      │
│ ☑ Direct                        │
│ ☑ Indirect                      │
│ ☐ Diffuse                       │
│ ☐ Glossy                        │
│ ☐ Transmission                  │
│ ☐ Emit                          │
│                                 │
│ Contributions:                  │
│ ☐ Color                         │
│                                 │
│ Selected to Active: OFF         │
│ Margin: 16 px                   │
│ Clear Image: ON                 │
└─────────────────────────────────┘
```

### 4. Запекание

```
1. Убедитесь что объект выбран
2. Убедитесь что Image Texture node активен
3. Render Properties → Bake → "Bake"
4. Ждите завершения (20-40 минут)
```

### 5. Сохранение

```
1. Image Editor
2. Image → Save As
3. Имя: SM_MFF_Lightmap.png
4. Format: PNG
5. Color Space: sRGB
6. Save Image
```

## Быстрый тест освещения

Перед запеканием lightmap, сделайте быстрый тест:

### Тест 1: Запеките Diffuse Color

```
Bake Type: Diffuse
Influence: Color only
Samples: 32
→ Bake

Если это работает - проблема в освещении для Combined
Если не работает - проблема в UV или настройках
```

### Тест 2: Запеките AO

```
Bake Type: Ambient Occlusion
Samples: 64
→ Bake

Если работает - UV и настройки OK
Проблема точно в освещении
```

## Минимальная сцена для теста

Создайте простую тестовую сцену:

```
1. Новый файл Blender
2. Удалите куб (X)
3. Add → Mesh → Plane
4. Add → Light → Sun (Strength: 5.0)
5. Выберите Plane
6. Создайте материал
7. Попробуйте запечь Combined
```

Если это работает - проблема в вашей модели SM_MFF.

## Настройки для гарантированного результата

### Минимальная конфигурация:

```
ОСВЕЩЕНИЕ:
- Sun Light: Strength 5.0

CYCLES:
- Engine: Cycles
- Device: GPU
- Samples: 128

BAKE:
- Type: Combined
- Direct: ON
- Indirect: ON
- Color: OFF
- Margin: 16
- Clear: ON

UV:
- Smart UV Project
- Island Margin: 0.02
```

## Если ничего не помогает

### Вариант 1: Используйте только AO

```
AO карта уже решает проблему light bleeding!
Можно обойтись без lightmap:

В VenueModelBaked.tsx:
- Используйте только aoMap
- Увеличьте aoMapIntensity до 3.0
- Используйте динамическое освещение из LightingSystem
```

### Вариант 2: Запеките в другом софте

```
- Substance Painter
- Marmoset Toolbag
- xNormal
```

### Вариант 3: Используйте Irradiance Volumes

```
В Three.js можно использовать:
- LightProbe
- Irradiance volumes
- Вместо запеченного lightmap
```

## Контрольный список

Проверьте все пункты:

- [ ] Cycles включен (не Eevee)
- [ ] Есть освещение (Sun или HDRI)
- [ ] Strength освещения > 1.0
- [ ] В Rendered view модель освещена
- [ ] UV развертка существует
- [ ] UV не перекрывается
- [ ] Объект выбран
- [ ] Материал существует
- [ ] Image Texture node создан и активен
- [ ] Bake Type: Combined
- [ ] Direct + Indirect включены
- [ ] Color выключен
- [ ] Samples >= 128
- [ ] Margin = 16
- [ ] Clear Image включен

## Частые ошибки

### ❌ "Bake failed: no objects to bake"
**Решение:** Выберите объект

### ❌ "Bake failed: no UV map"
**Решение:** Создайте UV (U → Smart UV Project)

### ❌ "Bake failed: no active image"
**Решение:** Создайте Image Texture node и выберите его

### ❌ Запекание завершается мгновенно
**Решение:** Нет освещения или неправильные настройки

### ❌ Результат полностью черный
**Решение:** Нет освещения в сцене

### ❌ Результат полностью белый
**Решение:** Слишком сильное освещение (уменьшите Strength)

## Рекомендуемый порядок действий

1. **Проверьте освещение** - самая частая причина
2. **Попробуйте стандартное запекание** - если Ucupaint глючит
3. **Уменьшите Samples до 64** - для быстрого теста
4. **Запеките на простом кубе** - проверьте что вообще работает
5. **Если ничего не помогает** - используйте только AO

---

*Напишите какая именно ошибка или что происходит при попытке запекания!*

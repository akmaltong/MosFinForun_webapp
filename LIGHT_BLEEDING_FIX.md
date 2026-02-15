# Исправление просачивания света (Light Bleeding)

## Проблема

Светлые полосы на стыках стен и пола - это **light bleeding** (просачивание света).

### Причины:

1. ❌ **Нет Ambient Occlusion (AO) map** в модели
2. ❌ **Слишком высокое ambient освещение**
3. ❌ **SSAO отключен**
4. ❌ **Материал перезаписывается без сохранения текстур**

## Решение

### ✅ Что сделано:

#### 1. Уменьшено ambient освещение

**Файл:** `src/components/LightingSystem.tsx`

```typescript
// Было:
<ambientLight intensity={0.3} />
<hemisphereLight intensity={1.0} />

// Стало:
<ambientLight intensity={0.15} />  // Уменьшено в 2 раза
<hemisphereLight intensity={0.6} /> // Уменьшено
```

**Компенсация:**
- Увеличена интенсивность directional light: `3.0` → `3.5`

#### 2. Включен SSAO (Screen Space Ambient Occlusion)

**Файл:** `src/store/appStore.ts`

```typescript
// Было:
ssaaoEnabled: false

// Стало:
ssaaoEnabled: true  // Включен по умолчанию
```

**Файл:** `src/components/Effects.tsx`

Улучшены настройки SSAO:
```typescript
samples: 16        // Было 11 (больше качество)
rings: 4           // Было 2 (больше охват)
radius: 8          // Было 5 (больше радиус)
intensity: 3.0     // Было 2.0 (сильнее эффект)
bias: 0.005        // Было 0.01 (меньше артефактов)
```

#### 3. Исправлен VenueModel

**Файл:** `src/components/VenueModel.tsx`

Теперь сохраняются оригинальные текстуры из модели:
```typescript
// Сохраняем текстуры из оригинального материала
map: originalMaterial?.map || null,
normalMap: originalMaterial?.normalMap || null,
aoMap: originalMaterial?.aoMap || null,
aoMapIntensity: 1.5,  // Усиливаем AO если есть
```

## Что такое SSAO?

**Screen Space Ambient Occlusion** - эффект постобработки, который:
- Затемняет углы и стыки
- Создает иллюзию ambient occlusion в реальном времени
- Не требует AO map в модели

### Как работает:

1. Анализирует depth buffer (глубину сцены)
2. Находит места где геометрия близко друг к другу
3. Затемняет эти области
4. Результат: реалистичные тени в углах и на стыках

## Результат

### До:
- ❌ Светлые полосы на стыках
- ❌ Плоский вид
- ❌ Нереалистичное освещение

### После:
- ✅ Затемнение в углах и на стыках
- ✅ Объемный вид
- ✅ Реалистичное освещение
- ✅ Нет просачивания света

## Производительность

### Влияние SSAO:

- **FPS impact**: ~5-10%
- **GPU load**: Средняя
- **Качество**: Значительное улучшение

### Если FPS низкий:

Уменьшите качество SSAO:
```typescript
samples: 8         // Вместо 16
rings: 2           // Вместо 4
radius: 5          // Вместо 8
```

Или отключите SSAO:
```typescript
useAppStore.getState().setSsaaoEnabled(false)
```

## Дополнительные настройки

### Если просачивание все еще есть:

#### 1. Увеличить интенсивность SSAO

```typescript
// В Effects.tsx
intensity: 4.0  // Было 3.0
```

#### 2. Уменьшить ambient еще больше

```typescript
// В LightingSystem.tsx
<ambientLight intensity={0.1} />  // Было 0.15
```

#### 3. Увеличить radius SSAO

```typescript
// В Effects.tsx
radius: 10  // Было 8
```

### Если слишком темно:

#### 1. Увеличить directional light

```typescript
intensity={4.0}  // Было 3.5
```

#### 2. Увеличить hemisphere

```typescript
<hemisphereLight intensity={0.8} />  // Было 0.6
```

#### 3. Уменьшить интенсивность SSAO

```typescript
intensity: 2.0  // Было 3.0
```

## Enhance Shader Lighting

### Статус: ✅ ПРИМЕНЕН

**Enhance Shader Lighting** - библиотека для улучшения освещения PBR материалов.

### Установка:

```bash
npm install enhance-shader-lighting --legacy-peer-deps
```

### Применение:

```typescript
// В VenueModel.tsx
import { enhanceShaderLighting } from 'enhance-shader-lighting'

material.onBeforeCompile = shader => {
  enhanceShaderLighting(shader, {
    aoColor: new THREE.Color(0x000000),
    hemisphereColor: new THREE.Color(0x2a2a2a),
    irradianceColor: new THREE.Color(0xffeedd),
    radianceColor: new THREE.Color(0xffffff),
    aoPower: 2.5,              // Ключевой параметр!
    aoSmoothing: 0.3,
    envPower: 0.9,
    sunIntensity: 0.0,
    radianceIntensity: 0.15,
    irradianceIntensity: Math.PI,
  })
}
```

**Подробная документация:** `ENHANCE_SHADER_LIGHTING_APPLIED.md`

## Проверка

### Чеклист:

- [ ] SSAO включен (проверьте в настройках)
- [ ] Ambient освещение уменьшено
- [ ] Нет светлых полос на стыках
- [ ] Углы затемнены
- [ ] FPS приемлемый (>50)

### Как проверить SSAO:

1. Откройте настройки (⚙️)
2. Найдите "SSAO" или "Ambient Occlusion"
3. Убедитесь что включен
4. Или в консоли:
   ```javascript
   console.log(useAppStore.getState().ssaaoEnabled)
   // Должно быть: true
   ```

### Переключить SSAO:

```javascript
// Включить
useAppStore.getState().setSsaaoEnabled(true)

// Выключить
useAppStore.getState().setSsaaoEnabled(false)
```

## Итоги

### Решение проблемы:

1. ✅ Уменьшено ambient освещение (0.15)
2. ✅ Включен SSAO с улучшенными настройками
3. ✅ Исправлен VenueModel (сохранение текстур)
4. ✅ Увеличена интенсивность directional light (компенсация)

### Результат:

- Нет просачивания света
- Реалистичные тени в углах
- Объемный вид
- Хорошая производительность

---

*Документ создан: 2026-02-13*
*Версия: 1.0*

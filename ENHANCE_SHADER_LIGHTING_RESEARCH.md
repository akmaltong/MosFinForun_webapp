# Enhance Shader Lighting - Исследование

## Источники
- GitHub репозиторий: https://github.com/0beqz/enhance-shader-lighting
- NPM пакет: https://www.npmjs.com/package/enhance-shader-lighting
- Автор: 0beqz (тот же автор Screen Space Reflections и MeshReflectorMaterial)

## Что такое Enhance Shader Lighting

Библиотека для улучшения освещения в Three.js, особенно при работе с PBR материалами (MeshStandardMaterial, MeshPhysicalMaterial) и lightmaps. Решает проблему того, что lightmapping плохо работает с PBR материалами без дополнительных настроек.

### Основная идея
Предоставить множество опций для настройки освещения, чтобы определенная комбинация параметров давала реалистичный результат, максимально приближенный к рендеру из Blender.

## Установка и использование

### Установка
```bash
npm i enhance-shader-lighting
```

### Базовое использование
```javascript
import { enhanceShaderLighting } from "enhance-shader-lighting"

// Применить к материалу
material.onBeforeCompile = shader => enhanceShaderLighting(shader, options)
```

### Важно
- Three.js версия 0.151.0 (выпущена 30.03.2023) пока не поддерживается
- Работает через модификацию шейдера материала в onBeforeCompile

## Параметры

### Полный список опций с дефолтными значениями

```javascript
const options = {
  // === ЦВЕТА ===
  
  // Цвет в темных областях (тени), обычно синеватый или черный
  aoColor: new THREE.Color(0x000000),
  
  // Цвет для очень темных мест, обычно синеватый (влияние неба)
  hemisphereColor: new THREE.Color(0xffffff),
  
  // Средний цвет сцены, симулирует цвет отраженного света
  irradianceColor: new THREE.Color(0xffffff),
  
  // Цвет прямого отражения неба, обычно синеватый
  radianceColor: new THREE.Color(0xffffff),
  
  // === МОЩНОСТЬ И ИНТЕНСИВНОСТЬ ===
  
  // Чем выше, тем меньше затененные области освещаются окружением
  aoPower: 1,
  
  // Сглаживание AO
  aoSmoothing: 0,
  
  // Гамма AO освещения
  aoMapGamma: 1,
  
  // Гамма lightmap освещения
  lightMapGamma: 1,
  
  // Насыщенность lightmap освещения
  lightMapSaturation: 1,
  
  // Экспонента для environment освещения
  envPower: 1,
  
  // Экспонента для roughness материала
  roughnessPower: 1,
  
  // Дополнительная сила солнечного света
  sunIntensity: 0,
  
  // Контраст диффузной текстуры
  mapContrast: 1,
  
  // Контраст lightmap
  lightMapContrast: 1,
  
  // Чем выше, тем контрастнее environment освещение
  smoothingPower: 0.25,
  
  // Влияние непрямого environment освещения (обычно Math.PI)
  irradianceIntensity: Math.PI,
  
  // Влияние прямого environment освещения (близко к 0 для интерьеров)
  radianceIntensity: 1,
  
  // === ОПТИМИЗАЦИЯ ===
  
  // Если true, значения передаются как константы (быстрее, но нельзя менять в runtime)
  hardcodeValues: false
}
```

## Детальное описание параметров

### Цветовые параметры

#### aoColor
Цвет, преобладающий в темных областях (тени). Зависит от сцены:
- Синеватый цвет для сцен с голубым небом
- Черный для темных сцен
- Теплый оттенок для сцен с теплым освещением

```javascript
aoColor: new THREE.Color(0x0a1428) // Темно-синий для дневной сцены
```

#### hemisphereColor
Цвет, к которому сходятся очень темные места. В типичных сценах с солнцем и голубым небом темные места более синие (влияние неба, а не солнца).

```javascript
hemisphereColor: new THREE.Color(0x4a7ba7) // Синеватый для неба
```

#### irradianceColor
Средний цвет сцены. Симулирует цвет отраженного света (light bounce).

```javascript
irradianceColor: new THREE.Color(0xffeedd) // Теплый для интерьера
```

#### radianceColor
Цвет прямого отражения неба. Должен быть синеватым, похожим на небо.

```javascript
radianceColor: new THREE.Color(0x87ceeb) // Sky blue
```

### Параметры мощности

#### aoPower
Чем выше значение, тем меньше затененные области будут освещены environment lighting.

```javascript
aoPower: 2.0 // Более темные тени
aoPower: 0.5 // Более светлые тени
```

#### aoSmoothing
Степень сглаживания ambient occlusion.

```javascript
aoSmoothing: 0.5 // Мягкие переходы AO
```

#### envPower
Экспонента для environment освещения. Контролирует общую яркость окружающего освещения.

```javascript
envPower: 1.5 // Более яркое окружение
envPower: 0.7 // Более темное окружение
```

#### roughnessPower
Экспонента для roughness материала. Влияет на то, как шероховатость влияет на освещение.

```javascript
roughnessPower: 1.2 // Усиливает эффект roughness
roughnessPower: 0.8 // Ослабляет эффект roughness
```

#### sunIntensity
Дополнительная интенсивность солнечного света. Умножает environment освещение освещенных мест (рассчитанных через AO map).

```javascript
sunIntensity: 2.0 // Яркое солнце
sunIntensity: 0.0 // Без дополнительного солнца
```

### Параметры гаммы и контраста

#### aoMapGamma
Гамма-коррекция для AO освещения.

```javascript
aoMapGamma: 2.2 // Стандартная sRGB гамма
aoMapGamma: 1.0 // Линейная
```

#### lightMapGamma
Гамма-коррекция для lightmap освещения.

```javascript
lightMapGamma: 2.2 // Стандартная sRGB гамма
```

#### lightMapSaturation
Насыщенность цветов lightmap.

```javascript
lightMapSaturation: 1.5 // Более насыщенные цвета
lightMapSaturation: 0.5 // Менее насыщенные цвета
```

#### mapContrast
Контраст диффузной текстуры.

```javascript
mapContrast: 1.2 // Повышенный контраст
mapContrast: 0.8 // Пониженный контраст
```

#### lightMapContrast
Контраст lightmap.

```javascript
lightMapContrast: 1.5 // Более контрастный lightmap
```

### Параметры интенсивности

#### smoothingPower
Чем выше значение, тем контрастнее environment освещение вдоль сцены.

```javascript
smoothingPower: 0.5 // Более контрастное освещение
smoothingPower: 0.1 // Более плавное освещение
```

#### irradianceIntensity
Влияние непрямого environment освещения. Обычно Math.PI для всех сценариев.

```javascript
irradianceIntensity: Math.PI // Стандарт
irradianceIntensity: Math.PI * 0.5 // Слабее
```

#### radianceIntensity
Влияние прямого environment освещения. Обычно близко к 0 для интерьеров, так как большинство объектов не подвержены прямому environment освещению.

```javascript
radianceIntensity: 1.0 // Экстерьер (улица)
radianceIntensity: 0.1 // Интерьер (помещение)
```

## Как это работает

### 1. Модификация шейдера
Библиотека модифицирует шейдер материала через `onBeforeCompile`, добавляя:
- Дополнительные uniforms для всех параметров
- Кастомные расчеты освещения
- Интеграцию AO с environment lighting
- Сглаживание environment lighting

### 2. AO и Environment Lighting
Ключевое улучшение - учет AO при расчете environment освещения:
```glsl
// Псевдокод
float ao = texture2D(aoMap, vUv).r;
ao = pow(ao, aoPower);
ao = smoothAO(ao, aoSmoothing);

vec3 envLight = calculateEnvLight();
envLight *= ao; // AO влияет на environment освещение
```

### 3. Lightmap обработка
Вместо добавления lightmap к `reflectedLight.indirectDiffuse`, библиотека:
- Умножает цвет lightmap на диффузный цвет
- Применяет гамма-коррекцию
- Применяет контраст и насыщенность

```glsl
// Псевдокод
vec3 lightMapColor = texture2D(lightMap, vUv2).rgb;
lightMapColor = pow(lightMapColor, vec3(lightMapGamma));
lightMapColor = adjustContrast(lightMapColor, lightMapContrast);
lightMapColor = adjustSaturation(lightMapColor, lightMapSaturation);

diffuseColor.rgb *= lightMapColor;
```

### 4. Сглаживание освещения
Применяется сглаживание environment освещения вдоль сцены для более плавных переходов:
```glsl
// Псевдокод
float smoothFactor = pow(someValue, smoothingPower);
envLight = mix(envLight, smoothedEnvLight, smoothFactor);
```

## Мотивация и проблема

### Проблема с Lightmapping в Three.js
- Lightmapping хорошо работает с non-PBR материалами (MeshBasicMaterial)
- С PBR материалами (MeshStandardMaterial) требуется много настроек
- Стандартное поведение не дает реалистичного результата

### Что улучшает библиотека
1. Учитывает AO при расчете environment освещения
2. Сглаживает environment освещение вдоль сцены
3. Умножает lightmap на диффузный цвет вместо добавления
4. Применяет цветокоррекцию к lightmap
5. Дает множество опций для настройки под разные сценарии

### Цель
Максимально приблизиться к рендеру из Blender через множество опций настройки освещения.

## Примеры настроек

### Экстерьер (улица, день)
```javascript
{
  aoColor: new THREE.Color(0x0a1428),
  hemisphereColor: new THREE.Color(0x4a7ba7),
  irradianceColor: new THREE.Color(0xffffff),
  radianceColor: new THREE.Color(0x87ceeb),
  aoPower: 1.5,
  aoSmoothing: 0.3,
  envPower: 1.2,
  sunIntensity: 1.5,
  smoothingPower: 0.25,
  irradianceIntensity: Math.PI,
  radianceIntensity: 1.0
}
```

### Интерьер (помещение)
```javascript
{
  aoColor: new THREE.Color(0x000000),
  hemisphereColor: new THREE.Color(0x2a2a2a),
  irradianceColor: new THREE.Color(0xffeedd),
  radianceColor: new THREE.Color(0xffffff),
  aoPower: 2.0,
  aoSmoothing: 0.5,
  envPower: 0.8,
  sunIntensity: 0.0,
  smoothingPower: 0.4,
  irradianceIntensity: Math.PI,
  radianceIntensity: 0.1,
  lightMapGamma: 2.2,
  lightMapSaturation: 1.2
}
```

### Ночная сцена
```javascript
{
  aoColor: new THREE.Color(0x000510),
  hemisphereColor: new THREE.Color(0x0a0a1a),
  irradianceColor: new THREE.Color(0x4a5a7a),
  radianceColor: new THREE.Color(0x1a2a4a),
  aoPower: 2.5,
  aoSmoothing: 0.2,
  envPower: 0.5,
  sunIntensity: 0.0,
  smoothingPower: 0.3,
  irradianceIntensity: Math.PI * 0.3,
  radianceIntensity: 0.2
}
```

### Высококонтрастная сцена
```javascript
{
  aoPower: 3.0,
  aoSmoothing: 0.0,
  envPower: 1.5,
  sunIntensity: 2.0,
  mapContrast: 1.5,
  lightMapContrast: 1.8,
  smoothingPower: 0.5,
  irradianceIntensity: Math.PI * 1.2
}
```

## Оптимизация

### hardcodeValues
Если установить `hardcodeValues: true`, все значения будут переданы как константы в шейдер вместо uniforms:

```javascript
material.onBeforeCompile = shader => enhanceShaderLighting(shader, {
  ...options,
  hardcodeValues: true
})
```

**Преимущества:**
- Немного быстрее (компилятор шейдеров может оптимизировать константы)
- Меньше uniforms для передачи

**Недостатки:**
- Нельзя менять значения в runtime
- Нужно пересоздавать материал для изменения параметров

### Рекомендации
- Используйте `hardcodeValues: false` во время разработки для настройки
- Переключите на `hardcodeValues: true` в продакшене для небольшого прироста производительности

## Workflow

### 1. Подготовка в Blender
```
1. Создать сцену в Blender
2. Настроить освещение
3. Запечь lightmap и AO map
4. Экспортировать модель с UV2 для lightmap
5. Сделать референсный рендер для сравнения
```

### 2. Настройка в Three.js
```javascript
// Загрузить модель
const gltf = await loader.loadAsync('model.glb');
const model = gltf.scene;

// Применить enhance-shader-lighting ко всем материалам
model.traverse(child => {
  if (child.isMesh && child.material.isMeshStandardMaterial) {
    child.material.onBeforeCompile = shader => {
      enhanceShaderLighting(shader, {
        // Начать с дефолтных значений
        aoColor: new THREE.Color(0x000000),
        hemisphereColor: new THREE.Color(0xffffff),
        // ... остальные параметры
      });
    };
    
    // Важно: пометить материал для обновления
    child.material.needsUpdate = true;
  }
});
```

### 3. Итеративная настройка
```javascript
// Создать GUI для настройки в реальном времени
const gui = new dat.GUI();

const params = {
  aoPower: 1,
  aoSmoothing: 0,
  envPower: 1,
  sunIntensity: 0,
  // ... остальные параметры
};

// Добавить контролы
gui.add(params, 'aoPower', 0, 5).onChange(updateMaterial);
gui.add(params, 'aoSmoothing', 0, 1).onChange(updateMaterial);
// ...

function updateMaterial() {
  model.traverse(child => {
    if (child.isMesh && child.material.isMeshStandardMaterial) {
      child.material.onBeforeCompile = shader => {
        enhanceShaderLighting(shader, params);
      };
      child.material.needsUpdate = true;
    }
  });
}
```

### 4. Сравнение с референсом
- Загрузить референсный рендер из Blender
- Сравнить визуально
- Настроить параметры для максимального соответствия
- Сохранить финальные значения

## Важные заметки

### Философия
Реализация полностью произвольная и не следует каким-либо научным статьям. Все было реализовано на основе того, насколько хорошо воспринимается сцена и насколько она похожа на референс из Blender.

### Требования
- Three.js (версия до r151)
- Модель с запеченными lightmap и/или AO map
- UV2 для lightmap (если используется)
- PBR материал (MeshStandardMaterial или MeshPhysicalMaterial)

### Ограничения
- Работает только с материалами, поддерживающими `onBeforeCompile`
- Требует ручной настройки параметров для каждой сцены
- Может потребоваться время на подбор правильных значений

## Связь с другими технологиями

### Комбинация с SSGI
```javascript
// Сначала enhance-shader-lighting для базового освещения
material.onBeforeCompile = shader => {
  enhanceShaderLighting(shader, lightingOptions);
};

// Затем SSGI как постпроцессинг для GI
const ssgiPass = new SSGIPass(scene, camera, options);
composer.addPass(ssgiPass);
```

### Комбинация с MeshReflectorMaterial
```javascript
// Для пола - MeshReflectorMaterial
const floorMaterial = new MeshReflectorMaterial(renderer, camera, scene, floor, {
  blur: [400, 100],
  mixStrength: 0.5
});

// Для остальных объектов - enhance-shader-lighting
otherMeshes.forEach(mesh => {
  mesh.material.onBeforeCompile = shader => {
    enhanceShaderLighting(shader, options);
  };
});
```

## Применение в проекте

### Сценарии использования
- Архитектурная визуализация с запеченным освещением
- Игровые сцены с lightmaps
- Интерьерные визуализации
- Любые сцены, где нужно улучшить PBR материалы с lightmaps

### Преимущества
- Более реалистичное освещение без дополнительных расчетов в runtime
- Гибкая настройка под любую сцену
- Работает с существующими lightmaps из Blender
- Не требует изменения геометрии или текстур

### Недостатки
- Требует ручной настройки параметров
- Работает только со статическим освещением (lightmaps)
- Не подходит для динамического освещения

---

*Документ создан: 2026-02-13*
*Статус: Готов к использованию*

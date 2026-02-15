# SSGI (Screen-Space Global Illumination) - Исследование

## Источники
- Pull Request: https://github.com/mrdoob/three.js/pull/31839
- Демо: https://rawcdn.githack.com/mrdoob/three.js/dev/examples/webgpu_postprocessing_ssgi.html

## Что такое SSGI

SSGINode - новая нода для Three.js, реализующая глобальное освещение в экранном пространстве (Screen-Space Global Illumination).

### Основные возможности
- **Непрямое освещение в реальном времени** (indirect illumination)
- **Ambient Occlusion** (затенение окружающей среды)
- Использует информацию из экранного пространства (screen-space)
- Работает с **WebGPU**
- Применяется как **постпроцессинг эффект**

## Визуальный эффект

SSGI добавляет реалистичное отражение света от поверхностей:
- Цветной свет от стен отражается на соседние объекты
- Красная стена создает красноватый оттенок на белых объектах рядом
- Зеленая стена создает зеленоватый оттенок
- Улучшает реализм освещения без трассировки лучей

## Тестовая сцена: Cornell Box

В PR используется классическая тестовая сцена Cornell Box для демонстрации эффекта.

### Структура сцены

```javascript
// Красная стена (левая)
let geo = new THREE.PlaneGeometry(1, 1);
let mat = new THREE.MeshPhysicalMaterial({ color: "#ff0000" });
let mesh = new THREE.Mesh(geo, mat);
mesh.scale.set(20, 15, 1);
mesh.rotation.y = Math.PI * 0.5;
mesh.position.set(-10, 7.5, 0);
mesh.receiveShadow = true;
scene.add(mesh);

// Зеленая стена (правая)
mat = new THREE.MeshPhysicalMaterial({ color: "#00ff00" });
mesh = new THREE.Mesh(geo, mat);
mesh.scale.set(20, 15, 1);
mesh.rotation.y = Math.PI * -0.5;
mesh.position.set(10, 7.5, 0);
mesh.receiveShadow = true;
scene.add(mesh);

// Белые стены (пол, потолок, задняя)
mat = new THREE.MeshPhysicalMaterial({ color: "#fff" });

// Пол
mesh = new THREE.Mesh(geo, mat);
mesh.scale.set(20, 20, 1);
mesh.rotation.x = Math.PI * -0.5;
mesh.receiveShadow = true;
scene.add(mesh);

// Задняя стена
mesh = new THREE.Mesh(geo, mat);
mesh.scale.set(15, 20, 1);
mesh.rotation.z = Math.PI * -0.5;
mesh.position.set(0, 7.5, -10);
mesh.receiveShadow = true;
scene.add(mesh);

// Потолок
mesh = new THREE.Mesh(geo, mat);
mesh.scale.set(20, 20, 1);
mesh.rotation.x = Math.PI * 0.5;
mesh.position.set(0, 15, 0);
mesh.receiveShadow = true;
scene.add(mesh);
```

### Объекты в сцене

```javascript
// Высокий бокс
geo = new THREE.BoxGeometry(5, 7, 5);
mesh = new THREE.Mesh(geo, mat);
mesh.rotation.y = Math.PI * 0.25;
mesh.position.set(-3, 3.5, -2);
mesh.castShadow = true;
mesh.receiveShadow = true;
scene.add(mesh);

// Низкий бокс
geo = new THREE.BoxGeometry(4, 4, 4);
mesh = new THREE.Mesh(geo, mat);
mesh.rotation.y = Math.PI * -0.1;
mesh.position.set(4, 2, 4);
mesh.castShadow = true;
mesh.receiveShadow = true;
scene.add(mesh);

// Абажур лампы
mesh = new THREE.Mesh(
    new THREE.CylinderGeometry(2.5, 2.5, 1, 64), 
    new THREE.MeshBasicMaterial()
);
mesh.position.y = 15;
scene.add(mesh);
```

### Освещение

```javascript
// Основной точечный свет
let light = new THREE.PointLight("#ffffff", 100);
light.position.set(0, 13, 0);
light.distance = 100;
light.castShadow = true;
light.shadow.mapSize.width = 1024;
light.shadow.mapSize.height = 1024;
light.shadow.bias = -0.002;
scene.add(light);

// Ambient свет
light = new THREE.AmbientLight("#0c0c0c");
scene.add(light);
```

## Технические детали

### Исправленный баг
В PR также исправлен баг, где количество шагов в экранном пространстве уменьшало эффективный радиус, потому что радиус шага делился на количество шагов дважды.

### Требования
- **WebGPU** поддержка
- Three.js (dev версия)
- Постпроцессинг pipeline

## Преимущества SSGI

1. **Производительность**: Работает в реальном времени без трассировки лучей
2. **Реализм**: Добавляет непрямое освещение и цветовой перенос
3. **Простота**: Использует screen-space данные, не требует сложных расчетов
4. **Ambient Occlusion**: Встроенная поддержка затенения

## Применение в проекте

### Потенциальные сценарии использования
- Улучшение визуального качества интерьерных сцен
- Реалистичное освещение архитектурных визуализаций
- Добавление глубины и объема в 3D сцены
- Цветовой перенос от окружающих объектов

### Следующие шаги
1. Проверить совместимость с текущим проектом
2. Изучить API SSGINode
3. Протестировать производительность
4. Интегрировать в постпроцессинг pipeline

## Заметки

- Cornell Box - идеальная тестовая сцена для демонстрации GI эффектов
- Эффект особенно заметен на цветовом переносе от красной и зеленой стен
- Требуется WebGPU, что может ограничить поддержку браузеров

---

*Документ создан: 2026-02-13*
*Статус: В разработке*

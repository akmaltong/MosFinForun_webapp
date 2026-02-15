# Blender POI Camera Scripts

Эти скрипты создают и экспортируют данные POI (Point of Interest) с камерами для Three.js приложения.

## Скрипты

### 1. `blender_create_poi_cameras.py`
Создает камеры для каждой зоны (пустышки ZONE_*) в Blender.

**Использование:**
1. Откройте модель в Blender
2. Убедитесь, что у вас есть пустышки ZONE_* (созданные с помощью `blender_create_sample_zones.py`)
3. Перейдите на вкладку Scripting
4. Нажмите "Open" и выберите этот файл
5. Нажмите кнопку "Run Script"
6. Скрипт создаст камеры CAMEREA_* для каждой зоны
7. Данные сохранятся в `poi_camera_targets.json`
8. JavaScript код для mockData.ts будет показан в текстовом редакторе

**Что делает скрипт:**
- Находит все объекты ZONE_*
- Для каждой зоны создает камеру с именем CAMERA_*
- Камера позиционируется на расстоянии 5 единиц от зоны и 2 единицы выше
- Добавляет TrackTo constraint, чтобы камера смотрела на зону
- Экспортирует данные в JSON файл
- Генерирует TypeScript код для использования в проекте

### 2. `blender_export_poi_cameras.py`
Экспортирует данные существующих камер в Blender.

**Использование:**
1. Откройте модель в Blender
2. Убедитесь, что у вас есть камеры CAMERA_* и зоны ZONE_*
3. Перейдите на вкладку Scripting
4. Нажмите "Open" и выберите этот файл
5. Нажмите кнопку "Run Script"
6. Данные сохранятся в `poi_camera_export.json`
7. JavaScript код будет показан в текстовом редакторе

**Что делает скрипт:**
- Находит все камеры CAMERA_*
- Определяет их таргеты (zones)
- Экспортирует координаты камеры и таргета
- Генерирует TypeScript код для использования в проекте

## Формат данных

### POI Camera Interface (TypeScript)
```typescript
export interface POICamera {
  id: string
  name: string
  color: string
  cameraPosition: [number, number, number]
  targetPosition: [number, number, number]
  description: string
}
```

### JSON Output
```json
{
  "model_file": "SM_MFF.glb",
  "total_pois": 19,
  "pois": [
    {
      "id": "poi-1",
      "original_name": "CAMERA_Аккредитация",
      "display_name": "Аккредитация",
      "camera_name": "CAMERA_Аккредитация",
      "target_name": "ZONE_Аккредитация",
      "camera_position": {
        "x": -132.695,
        "y": -0.082,
        "z": -6.858
      },
      "target_position": {
        "x": -127.695,
        "y": -0.082,
        "z": -6.858
      },
      "blender_camera_coords": [-132.695, -0.082, -6.858],
      "blender_target_coords": [-127.695, -0.082, -6.858]
    }
  ]
}
```

## Интеграция с проектом

1. Запустите один из скриптов в Blender
2. Скопируйте сгенерированный JavaScript код из текстового редактора Blender
3. Вставьте в `forum-nav-app/src/data/poiData.ts`
4. Перезагрузите страницу в браузере

## Использование в приложении

```typescript
import { poisData } from './data/mockData'

// Пример использования камеры POI
function flyToPOI(poiId: string) {
  const poi = poisData.find(p => p.id === poiId)
  if (!poi) return
  
  // Используйте poi.cameraPosition для позиции камеры
  // Используйте poi.targetPosition для точки, куда смотрит камера
  camera.position.set(...poi.cameraPosition)
  camera.lookAt(...poi.targetPosition)
}
```

## Настройка камер в Blender

После создания камер вы можете настроить их вручную:

1. Выберите камеру CAMERA_*
2. Измените позицию (Location)
3. Измените настройки камеры в панели Camera:
   - Lens (фокусное расстояние)
   - Clip Start (ближняя плоскость отсечения)
   - Clip End (дальняя плоскость отсечения)
4. Запустите `blender_export_poi_cameras.py` для экспорта обновленных данных

## Troubleshooting

**Проблема:** "No ZONE_* Empty objects found!"
**Решение:** Сначала создайте зоны с помощью `blender_create_sample_zones.py`

**Проблема:** Камеры не смотрят на зоны
**Решение:** Проверьте TrackTo constraint на камере. Убедитесь, что target установлен на правильную зону

**Проблема:** Камеры слишком близко или далеко
**Решение:** Отредактируйте камеру в Blender (переместите её) и экспортируйте снова

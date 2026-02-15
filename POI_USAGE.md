# POI Camera Scripts - Инструкция по использованию

## Что было создано:

### Blender Скрипты:
1. **blender_create_poi_cameras.py** - Создает камеры для каждой зоны (ZONE_*)
2. **blender_export_poi_cameras.py** - Экспортирует существующие камеры в JSON

### Проект:
1. **src/types/index.ts** - Добавлен интерфейс POICamera
2. **src/data/poiData.ts** - Данные POI камер
3. **BLENDER_POI_GUIDE.md** - Полная документация

## Быстрый старт:

### Вариант 1: Создать новые камеры
1. Откройте файл модели в Blender
2. Убедитесь, что есть пустышки ZONE_*
3. Откройте вкладку Scripting → Open → `blender_create_poi_cameras.py`
4. Нажмите Run Script
5. Скопируйте JavaScript код из текстового редактора Blender
6. Замените содержимое `forum-nav-app/src/data/poiData.ts`
7. Перезагрузите приложение

### Вариант 2: Экспортировать существующие камеры
1. Откройте модель в Blender
2. Откройте вкладку Scripting → Open → `blender_export_poi_cameras.py`
3. Нажмите Run Script
4. Скопируйте JavaScript код
5. Вставьте в `forum-nav-app/src/data/poiData.ts`
6. Перезагрузите приложение

## Структура данных:

Каждый POI содержит:
- `cameraPosition` - [x, y, z] координаты камеры
- `targetPosition` - [x, y, z] координаты цели (куда смотрит камера)

## Использование в коде:

```typescript
import { poisData } from './data/mockData'

// Получить POI по ID
const poi = poisData.find(p => p.id === 'poi-1')

// Установить камеру
camera.position.set(...poi.cameraPosition)
camera.lookAt(...poi.targetPosition)
```

## Файлы в проекте:
- `C:\Windows\System32\forum-nav-app\blender_create_poi_cameras.py` - Создать камеры
- `C:\Windows\System32\forum-nav-app\blender_export_poi_cameras.py` - Экспортировать камеры
- `C:\Windows\System32\forum-nav-app\BLENDER_POI_GUIDE.md` - Документация
- `C:\Windows\System32\forum-nav-app\src\data/poiData.ts` - Данные POI

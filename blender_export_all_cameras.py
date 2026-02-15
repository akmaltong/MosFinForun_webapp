"""
Blender Script: Export All Cameras to POI Format
Экспортирует ВСЕ камеры из сцены в формат для Three.js

КАК ИСПОЛЬЗОВАТЬ:
1. Откройте вашу модель в Blender
2. Перейдите на вкладку Scripting
3. Нажмите "Open" и выберите этот файл
4. Нажмите "Run Script" (или Alt+P)
5. Данные будут экспортированы в JSON и показаны в текстовом редакторе
"""

import bpy
import json
import os
import math
from mathutils import Vector


def calculate_distance(pos1, pos2):
    """Рассчитать расстояние между двумя точками"""
    dx = pos1.x - pos2.x
    dy = pos1.y - pos2.y
    dz = pos1.z - pos2.z
    return math.sqrt(dx * dx + dy * dy + dz * dz)


def calculate_azimuth_deg(camera_pos, target_pos):
    """Рассчитать азимут (угол в горизонтальной плоскости) в градусах"""
    dx = target_pos.x - camera_pos.x
    dz = target_pos.z - camera_pos.z
    angle_rad = math.atan2(dz, dx)
    angle_deg = math.degrees(angle_rad)
    if angle_deg < 0:
        angle_deg += 360
    return angle_deg


def calculate_elevation_deg(camera_pos, target_pos):
    """Рассчитать возвышение (угол вертикали) в градусах"""
    dx = target_pos.x - camera_pos.x
    dy = target_pos.y - camera_pos.y
    dz = target_pos.z - camera_pos.z
    horizontal_dist = math.sqrt(dx * dx + dz * dz)
    angle_rad = math.atan2(dy, horizontal_dist)
    return math.degrees(angle_rad)


def export_all_cameras():
    """Экспорт всех камер из сцены"""

    pois = []
    output_lines = []

    output_lines.append("=" * 80)
    output_lines.append("ЭКСПОРТ ВСЕХ КАМЕР ИЗ BLENDER")
    output_lines.append("=" * 80)
    output_lines.append("")

    # Получить все камеры
    cameras = [obj for obj in bpy.context.scene.objects if obj.type == "CAMERA"]

    if not cameras:
        output_lines.append("❌ Камеры не найдены в сцене!")
        output_lines.append("   Убедитесь, что у вас есть хотя бы одна камера.")
        return output_lines, None

    output_lines.append(f"📷 Найдено камер: {len(cameras)}")
    output_lines.append("")

    # Цвета для POI (циклически)
    colors = [
        "#9933cc",
        "#33cccc",
        "#cc6600",
        "#00ccff",
        "#4ecdc4",
        "#0088ff",
        "#45b7d1",
        "#96ceb4",
        "#ff6b35",
        "#ffd700",
        "#cc0066",
        "#ff69b4",
        "#9b59b6",
        "#8e44ad",
        "#e74c3c",
        "#c0392b",
        "#ff4444",
        "#44ff44",
        "#4444ff",
        "#ffff44",
    ]

    # Получить все таргеты (Empty объекты, Mesh объекты и т.д.)
    all_objects = {obj.name: obj for obj in bpy.context.scene.objects}

    for i, camera_obj in enumerate(cameras):
        camera_name = camera_obj.name
        camera_loc = camera_obj.matrix_world.translation

        # Найти таргет камеры
        target_loc = None
        target_name = None

        # 1. Проверить TrackTo constraint
        if "TrackTo" in camera_obj.constraints:
            target_obj = camera_obj.constraints["TrackTo"].target
            if target_obj:
                target_loc = target_obj.matrix_world.translation
                target_name = target_obj.name

        # 2. Проверить Locked Track constraint
        if target_loc is None and "LockedTrack" in camera_obj.constraints:
            target_obj = camera_obj.constraints["LockedTrack"].target
            if target_obj:
                target_loc = target_obj.matrix_world.translation
                target_name = target_obj.name

        # 3. Проверить Follow Path constraint
        if target_loc is None and "FollowPath" in camera_obj.constraints:
            target_obj = camera_obj.constraints["FollowPath"].target
            if target_obj:
                target_loc = target_obj.matrix_world.translation
                target_name = target_obj.name

        # 4. Если нет constraint, вычислить таргет из направления камеры
        if target_loc is None:
            # Получить матрицу камеры и вычислить направление взгляда
            forward = camera_obj.matrix_world @ Vector((0, 0, -1))
            target_loc = camera_loc + (forward - camera_loc).normalized() * 10.0
            target_name = "Вычислено из направления камеры"

        # Вычислить параметры
        distance = calculate_distance(camera_loc, target_loc)
        azimuth_deg = calculate_azimuth_deg(camera_loc, target_loc)
        elevation_deg = calculate_elevation_deg(camera_loc, target_loc)

        # Определить имя зоны (попробовать извлечь из названия камеры)
        zone_name = camera_name
        if "POI_Camera_ZONE_" in camera_name:
            zone_name = camera_name.replace("POI_Camera_ZONE_", "")
        elif "CAMERA_" in camera_name:
            zone_name = camera_name.replace("CAMERA_", "")

        poi_id = f"poi-{i + 1}"
        color = colors[i % len(colors)]

        # Создать POI данные
        poi_data = {
            "id": poi_id,
            "name": zone_name,
            "color": color,
            "camera_position": [
                round(camera_loc.x, 4),
                round(camera_loc.y, 4),
                round(camera_loc.z, 4),
            ],
            "target_position": [
                round(target_loc.x, 4),
                round(target_loc.y, 4),
                round(target_loc.z, 4),
            ],
            "description": f"POI: {zone_name}",
            "distance": round(distance, 4),
            "azimuth_deg": round(azimuth_deg, 2),
            "elevation_deg": round(elevation_deg, 2),
            "blender_camera_name": camera_name,
            "blender_target_name": target_name,
        }

        pois.append(poi_data)

        output_lines.append(f"✅ Камера #{i + 1}: {camera_name}")
        output_lines.append(f"   Зона: {zone_name}")
        output_lines.append(f"   Таргет: {target_name}")
        output_lines.append(
            f"   Позиция камеры: ({camera_loc.x:.2f}, {camera_loc.y:.2f}, {camera_loc.z:.2f})"
        )
        output_lines.append(
            f"   Таргет: ({target_loc.x:.2f}, {target_loc.y:.2f}, {target_loc.z:.2f})"
        )
        output_lines.append(f"   Дистанция: {distance:.2f} м")
        output_lines.append(f"   Азимут: {azimuth_deg:.2f}°")
        output_lines.append(f"   Возвышение: {elevation_deg:.2f}°")
        output_lines.append("")

    # Сортировать по имени зоны
    pois.sort(key=lambda x: x["name"])

    # Создать JSON вывод
    output_json = {
        "total_pois": len(pois),
        "pois": pois,
        "note": "Экспортировано из Blender для Three.js",
    }

    # Получить директорию для сохранения
    if bpy.data.filepath:
        output_dir = os.path.dirname(bpy.data.filepath)
    else:
        output_dir = os.path.expanduser("~")

    output_file = os.path.join(output_dir, "poi_cameras_export.json")

    # Сохранить JSON
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(output_json, f, indent=2, ensure_ascii=False)

    output_lines.append("=" * 80)
    output_lines.append(f"✅ Успешно экспортировано: {len(pois)} POI")
    output_lines.append(f"📁 JSON файл: {output_file}")
    output_lines.append("=" * 80)
    output_lines.append("")
    output_lines.append("=" * 80)
    output_lines.append("JAVASCRIPT КОД ДЛЯ poiData.ts")
    output_lines.append("=" * 80)
    output_lines.append("")
    output_lines.append("import type { POICamera } from '../types'")
    output_lines.append("")
    output_lines.append("export const pois: POICamera[] = [")

    for i, poi in enumerate(pois):
        output_lines.append(f"  {{")
        output_lines.append(f"    id: '{poi['id']}',")
        output_lines.append(f"    name: '{poi['name']}',")
        output_lines.append(f"    color: '{poi['color']}',")
        output_lines.append(
            f"    cameraPosition: [{poi['camera_position'][0]}, {poi['camera_position'][1]}, {poi['camera_position'][2]}],"
        )
        output_lines.append(
            f"    targetPosition: [{poi['target_position'][0]}, {poi['target_position'][1]}, {poi['target_position'][2]}],"
        )
        output_lines.append(f"    description: 'POI: {poi['name']}',")
        output_lines.append(f"    distance: {poi['distance']},")
        output_lines.append(f"    azimuthDeg: {poi['azimuth_deg']},")
        output_lines.append(f"    elevationDeg: {poi['elevation_deg']}")
        output_lines.append(f"  }}{',' if i < len(pois) - 1 else ''}")

    output_lines.append("]")
    output_lines.append("")
    output_lines.append("=" * 80)
    output_lines.append("")
    output_lines.append("ИНСТРУКЦИЯ:")
    output_lines.append(
        "1. Скопируйте весь код выше (от 'import type { POICamera }' до концa)"
    )
    output_lines.append(
        "2. Замените содержимое файла forum-nav-app/src/data/poiData.ts"
    )
    output_lines.append("3. Сохраните файл")
    output_lines.append("4. Обновите страницу в браузере")
    output_lines.append("")

    return output_lines, output_file


# Запуск скрипта
if __name__ == "__main__":
    try:
        output_lines, output_file = export_all_cameras()

        # Создать текстовый блок для отображения результатов
        text_name = "POI_CAMERAS_EXPORT"

        # Удалить старый текст если есть
        if text_name in bpy.data.texts:
            bpy.data.texts.remove(bpy.data.texts[text_name])

        # Создать новый текст
        text_block = bpy.data.texts.new(text_name)
        text_block.write("\n".join(output_lines))

        # Показать в текстовом редакторе
        for area in bpy.context.screen.areas:
            if area.type == "TEXT_EDITOR":
                area.spaces[0].text = text_block
                break

        # Вывести в консоль
        print("\n" + "\n".join(output_lines))

        # Показать всплывающее сообщение
        def show_message(message="", title="Готово", icon="INFO"):
            def draw(self, context):
                for line in message.split("\n"):
                    if line.strip():
                        self.layout.label(text=line)

            bpy.context.window_manager.popup_menu(draw, title=title, icon=icon)

        show_message(
            f"Экспорт камер завершен!\n{len(bpy.context.scene.objects)} камер экспортировано\nJSON сохранен:\n{output_file}",
            title="Экспорт камер",
            icon="CHECKMARK",
        )

    except Exception as e:
        error_msg = f"ОШИБКА: {str(e)}\n\n"
        import traceback

        error_msg += traceback.format_exc()

        print(error_msg)

        # Создать текст ошибки
        if "POI_ERROR" in bpy.data.texts:
            bpy.data.texts.remove(bpy.data.texts["POI_ERROR"])
        error_text = bpy.data.texts.new("POI_ERROR")
        error_text.write(error_msg)

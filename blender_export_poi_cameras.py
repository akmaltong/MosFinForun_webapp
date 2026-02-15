"""
Blender Script: Export POI Camera Data
Exports all camera objects and their targets to JSON for Three.js

HOW TO USE:
1. Open your model in Blender
2. Make sure you have cameras (CAMERA_*) and zone empties (ZONE_*)
3. Go to Scripting tab
4. Click "Open" and select this file
5. Click "Run Script" button
6. POI data will be exported to JSON
"""

import bpy
import json
import os


def export_poi_cameras():
    """Export all POI cameras and their targets"""

    pois = []
    output_lines = []

    output_lines.append("=" * 70)
    output_lines.append("BLENDER POI CAMERA EXPORT")
    output_lines.append("=" * 70)
    output_lines.append("")

    # Get all zone empties
    zone_empties = {
        obj.name: obj
        for obj in bpy.context.scene.objects
        if obj.type == "EMPTY" and obj.name.startswith("ZONE_")
    }

    # Get all cameras
    cameras = [
        obj
        for obj in bpy.context.scene.objects
        if obj.type == "CAMERA" and obj.name.startswith("CAMERA_")
    ]

    if not cameras:
        output_lines.append("❌ No CAMERA_* objects found!")
        output_lines.append(
            "   Run blender_create_poi_cameras.py first to create cameras"
        )
        return output_lines

    if not zone_empties:
        output_lines.append("⚠️  No ZONE_* Empty objects found!")
        output_lines.append("   Cameras exist but no targets found")

    # Sort cameras by name
    cameras.sort(key=lambda x: x.name)

    for i, camera_obj in enumerate(cameras):
        camera_name = camera_obj.name
        poi_id = f"poi-{i + 1}"

        # Extract zone name from camera name
        # CAMERA_Конференц_зал_1 -> Конференц зал 1
        zone_name_part = camera_name.replace("CAMERA_", "").replace("_", " ")

        # Get camera position
        cam_loc = camera_obj.matrix_world.translation
        cam_rot = camera_obj.rotation_euler

        # Get camera data properties
        camera_data = camera_obj.data

        # Find target (from TrackTo constraint or by name matching)
        target_loc = None
        target_name = None

        # Check TrackTo constraint
        if "TrackTo" in camera_obj.constraints:
            target_obj = camera_obj.constraints["TrackTo"].target
            if target_obj:
                target_loc = target_obj.matrix_world.translation
                target_name = target_obj.name

        # Fallback: try to find matching zone by name
        if target_loc is None and zone_name_part:
            zone_candidates = [
                name
                for name in zone_empties.keys()
                if zone_name_part in name.replace("_", " ")
            ]
            if zone_candidates:
                target_obj = zone_empties[zone_candidates[0]]
                target_loc = target_obj.matrix_world.translation
                target_name = target_obj.name

        # If still no target, use camera rotation to calculate look-at point
        if target_loc is None:
            # Calculate a point 5 units in front of camera
            forward = camera_obj.matrix_world @ Vector((0, 0, -1))
            target_loc = cam_loc + (forward - cam_loc).normalized() * 5.0
            target_name = "Calculated from camera direction"

        # Create POI data
        poi_data = {
            "id": poi_id,
            "original_name": camera_name,
            "display_name": zone_name_part,
            "camera_name": camera_name,
            "target_name": target_name if target_name else "Unknown",
            "camera_position": {
                "x": round(cam_loc.x, 3),
                "y": round(cam_loc.y, 3),
                "z": round(cam_loc.z, 3),
            },
            "camera_rotation": {
                "x": round(cam_rot.x, 3),
                "y": round(cam_rot.y, 3),
                "z": round(cam_rot.z, 3),
            },
            "target_position": {
                "x": round(target_loc.x, 3),
                "y": round(target_loc.y, 3),
                "z": round(target_loc.z, 3),
            },
            "blender_camera_coords": [
                round(cam_loc.x, 3),
                round(cam_loc.y, 3),
                round(cam_loc.z, 3),
            ],
            "blender_target_coords": [
                round(target_loc.x, 3),
                round(target_loc.y, 3),
                round(target_loc.z, 3),
            ],
            "camera_settings": {
                "lens": getattr(camera_data, "lens", 35),
                "sensor_fit": getattr(camera_data, "sensor_fit", "HORIZONTAL"),
                "clip_start": getattr(camera_data, "clip_start", 0.1),
                "clip_end": getattr(camera_data, "clip_end", 1000.0),
            },
        }

        pois.append(poi_data)

        output_lines.append(f"✅ Found: {camera_name}")
        output_lines.append(f"   Target: {target_name}")
        output_lines.append(
            f"   Camera at: ({cam_loc.x:.2f}, {cam_loc.y:.2f}, {cam_loc.z:.2f})"
        )
        output_lines.append(
            f"   Looking at: ({target_loc.x:.2f}, {target_loc.y:.2f}, {target_loc.z:.2f})"
        )
        output_lines.append("")

    # Prepare output
    output = {
        "model_file": os.path.basename(bpy.data.filepath)
        if bpy.data.filepath
        else "unsaved.blend",
        "total_pois": len(pois),
        "pois": pois,
        "note": "POI camera data exported for Three.js application",
    }

    # Get output directory
    if bpy.data.filepath:
        output_dir = os.path.dirname(bpy.data.filepath)
    else:
        output_dir = os.path.expanduser("~")

    output_file = os.path.join(output_dir, "poi_camera_export.json")

    # Write to JSON file
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(output, f, indent=2, ensure_ascii=False)

    output_lines.append("=" * 70)
    output_lines.append(f"Total POIs exported: {len(pois)}")
    output_lines.append("")
    output_lines.append(f"SUCCESS! Saved to: {output_file}")
    output_lines.append("=" * 70)
    output_lines.append("")
    output_lines.append("JAVASCRIPT CODE FOR mockData.ts:")
    output_lines.append("=" * 70)
    output_lines.append("")
    output_lines.append("export const pois: POI[] = [")

    colors = [
        "#ff4444",
        "#44ff44",
        "#4444ff",
        "#ffff44",
        "#ff44ff",
        "#44ffff",
        "#ff8844",
        "#44ff88",
        "#8844ff",
        "#ff44ff",
        "#44ffff",
        "#ffaa00",
    ]

    for i, poi in enumerate(pois):
        poi_id = poi["id"]
        name = poi["display_name"]
        cam_x = poi["camera_position"]["x"]
        cam_y = poi["camera_position"]["y"]
        cam_z = poi["camera_position"]["z"]
        target_x = poi["target_position"]["x"]
        target_y = poi["target_position"]["y"]
        target_z = poi["target_position"]["z"]
        color = colors[i % len(colors)]

        output_lines.append(f"  {{")
        output_lines.append(f"    id: '{poi_id}',")
        output_lines.append(f"    name: '{name}',")
        output_lines.append(f"    color: '{color}',")
        output_lines.append(f"    cameraPosition: [{cam_x}, {cam_y}, {cam_z}],")
        output_lines.append(
            f"    targetPosition: [{target_x}, {target_y}, {target_z}],"
        )
        output_lines.append(f"    description: 'POI: {name}'")
        output_lines.append(f"  }}{(',' if i < len(pois) - 1 else '')}")

    output_lines.append("];")
    output_lines.append("")
    output_lines.append("=" * 70)
    output_lines.append("")
    output_lines.append("ИНСТРУКЦИЯ:")
    output_lines.append("1. Скопируйте код выше (от 'export const pois' до '];')")
    output_lines.append("2. Вставьте в forum-nav-app/src/data/mockData.ts")
    output_lines.append("3. Замените или добавьте массив pois")
    output_lines.append("4. Перезагрузите страницу в браузере")
    output_lines.append("")
    output_lines.append(f"JSON файл сохранен: {output_file}")

    return output_lines, output_file


# Run the script
if __name__ == "__main__":
    try:
        output_lines, output_file = export_poi_cameras()

        # Create new text datablock to show results
        text_name = "POI_EXPORT_RESULTS"

        # Remove old text if exists
        if text_name in bpy.data.texts:
            bpy.data.texts.remove(bpy.data.texts[text_name])

        # Create new text
        text_block = bpy.data.texts.new(text_name)
        text_block.write("\n".join(output_lines))

        # Try to show in text editor
        for area in bpy.context.screen.areas:
            if area.type == "TEXT_EDITOR":
                area.spaces[0].text = text_block
                break

        # Also print to console
        print("\n".join(output_lines))

        # Show popup message
        def show_message(message="", title="Script Finished", icon="INFO"):
            def draw(self, context):
                lines = message.split("\n")
                for line in lines:
                    if line.strip():
                        self.layout.label(text=line)

            bpy.context.window_manager.popup_menu(draw, title=title, icon=icon)

        show_message(
            f"POI Export Complete!\n{len(bpy.context.scene.objects)} cameras exported\nJSON saved to:\n{output_file}",
            title="POI Export Complete",
            icon="CHECKMARK",
        )

    except Exception as e:
        error_msg = f"ERROR: {str(e)}\n\n"
        import traceback

        error_msg += traceback.format_exc()

        # Create error text
        if "POI_ERROR_LOG" in bpy.data.texts:
            bpy.data.texts.remove(bpy.data.texts["POI_ERROR_LOG"])
        error_text = bpy.data.texts.new("POI_ERROR_LOG")
        error_text.write(error_msg)

        print(error_msg)

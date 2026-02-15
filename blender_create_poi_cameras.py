"""
Blender Script: Create Camera Targets for POI (Points of Interest)
Creates camera targets for each Empty object zone and exports POI data

HOW TO USE:
1. Open your model in Blender
2. Make sure you have Empty objects for zones (ZONE_*)
3. Go to Scripting tab
4. Click "Open" and select this file
5. Click "Run Script" button
6. POI data will be exported to JSON
"""

import bpy
import json
import os
import math
from mathutils import Vector


def create_camera_targets():
    """Create camera targets for all zone Empty objects"""

    zones = []
    pois = []
    output_lines = []

    output_lines.append("=" * 70)
    output_lines.append("BLENDER CAMERA TARGET CREATION - POI EXPORT")
    output_lines.append("=" * 70)
    output_lines.append("")

    # Get all Empty objects (zones)
    empties = [
        obj
        for obj in bpy.context.scene.objects
        if (obj.type == "EMPTY" and obj.name.startswith("ZONE_"))
    ]

    if not empties:
        output_lines.append("❌ No ZONE_* Empty objects found!")
        output_lines.append("   Create zones first with blender_create_sample_zones.py")
        return output_lines

    # Sort by name
    empties.sort(key=lambda x: x.name)

    # Find or create collection for camera targets
    collection_name = "POI_Cameras"
    if collection_name not in bpy.data.collections:
        poi_collection = bpy.data.collections.new(collection_name)
        bpy.context.scene.collection.children.link(poi_collection)
    else:
        poi_collection = bpy.data.collections[collection_name]

    created_count = 0
    updated_count = 0

    for i, zone_empty in enumerate(empties):
        zone_name = zone_empty.name.replace("ZONE_", "").replace("_", " ")
        zone_id = f"poi-{i + 1}"

        # Get zone location
        zone_loc = zone_empty.matrix_world.translation

        # Calculate camera position (offset from zone)
        # Default offset: 5 units back and 2 units up
        offset = Vector((-5.0, 0.0, 2.0))

        # Apply rotation from zone if any
        if zone_empty.rotation_euler != (0, 0, 0):
            offset = offset.rotate(zone_empty.rotation_euler)

        camera_loc = zone_loc + offset

        # Check if camera already exists for this zone
        camera_name = f"CAMERA_{zone_empty.name.replace('ZONE_', '')}"

        if camera_name in bpy.data.objects:
            camera_obj = bpy.data.objects[camera_name]
            camera = camera_obj.data
            updated_count += 1
            output_lines.append(f"🔄 Updated: {camera_name}")
        else:
            # Create new camera
            camera_data = bpy.data.cameras.new(name=camera_name)
            camera_obj = bpy.data.objects.new(camera_name, camera_data)
            poi_collection.objects.link(camera_obj)
            created_count += 1
            output_lines.append(f"✅ Created: {camera_name}")

        # Set camera position
        camera_obj.location = camera_loc

        # Track to zone (make camera look at zone)
        # Using constraint for tracking
        if camera_obj.constraints.get("TrackTo") is None:
            track_constraint = camera_obj.constraints.new(type="TRACK_TO")
            track_constraint.target = zone_empty
            track_constraint.track_axis = "TRACK_NEGATIVE_Z"
            track_constraint.up_axis = "UP_Y"
        else:
            camera_obj.constraints["TrackTo"].target = zone_empty

        # Set camera properties
        camera_data.lens = 35  # Default lens
        camera_data.sensor_fit = "HORIZONTAL"
        camera_data.clip_start = 0.1
        camera_data.clip_end = 1000.0

        # Get rotation from camera (now that it's tracking)
        cam_rot_euler = camera_obj.rotation_euler

        # Create POI data
        poi_data = {
            "id": zone_id,
            "original_name": zone_empty.name,
            "display_name": zone_name,
            "camera_name": camera_name,
            "camera_position": {
                "x": round(camera_loc.x, 3),
                "y": round(camera_loc.y, 3),
                "z": round(camera_loc.z, 3),
            },
            "camera_rotation": {
                "x": round(cam_rot_euler.x, 3),
                "y": round(cam_rot_euler.y, 3),
                "z": round(cam_rot_euler.z, 3),
            },
            "target_position": {
                "x": round(zone_loc.x, 3),
                "y": round(zone_loc.y, 3),
                "z": round(zone_loc.z, 3),
            },
            "blender_camera_coords": [
                round(camera_loc.x, 3),
                round(camera_loc.y, 3),
                round(camera_loc.z, 3),
            ],
            "blender_target_coords": [
                round(zone_loc.x, 3),
                round(zone_loc.y, 3),
                round(zone_loc.z, 3),
            ],
            "offset": {
                "x": round(offset.x, 3),
                "y": round(offset.y, 3),
                "z": round(offset.z, 3),
            },
            "camera_settings": {
                "lens": camera_data.lens,
                "clip_start": camera_data.clip_start,
                "clip_end": camera_data.clip_end,
            },
        }

        pois.append(poi_data)
        zones.append(zone_name)

        output_lines.append(f"   Target: {zone_name}")
        output_lines.append(
            f"   Camera at: ({camera_loc.x:.2f}, {camera_loc.y:.2f}, {camera_loc.z:.2f})"
        )
        output_lines.append(
            f"   Looking at: ({zone_loc.x:.2f}, {zone_loc.y:.2f}, {zone_loc.z:.2f})"
        )
        output_lines.append("")

    # Prepare output
    output = {
        "model_file": os.path.basename(bpy.data.filepath)
        if bpy.data.filepath
        else "unsaved.blend",
        "total_pois": len(pois),
        "pois": pois,
        "note": "POI data with camera targets for Three.js application",
    }

    # Get output directory
    if bpy.data.filepath:
        output_dir = os.path.dirname(bpy.data.filepath)
    else:
        output_dir = os.path.expanduser("~")

    output_file = os.path.join(output_dir, "poi_camera_targets.json")

    # Write to JSON file
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(output, f, indent=2, ensure_ascii=False)

    output_lines.append("=" * 70)
    output_lines.append(f"Created: {created_count} cameras")
    output_lines.append(f"Updated: {updated_count} cameras")
    output_lines.append(f"Total POIs: {len(pois)}")
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
        zone_id = poi["id"]
        name = poi["display_name"]
        cam_x = poi["camera_position"]["x"]
        cam_y = poi["camera_position"]["y"]
        cam_z = poi["camera_position"]["z"]
        target_x = poi["target_position"]["x"]
        target_y = poi["target_position"]["y"]
        target_z = poi["target_position"]["z"]
        color = colors[i % len(colors)]

        output_lines.append(f"  {{")
        output_lines.append(f"    id: '{zone_id}',")
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
        output_lines, output_file = create_camera_targets()

        # Create new text datablock to show results
        text_name = "POI_CAMERA_TARGETS_RESULTS"

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
            f"POI Camera Targets Complete!\nJSON saved to:\n{output_file}",
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

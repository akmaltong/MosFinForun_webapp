"""
Blender Script: Extract Zone Coordinates
Finds all Empty objects in scene and exports their coordinates to JSON

HOW TO USE:
1. Open your model in Blender
2. Go to Scripting tab
3. Click "Open" and select this file
4. Click "Run Script" button
5. Check the new text file in Text Editor with results
"""

import bpy
import json
import os
import sys

def extract_zone_coordinates():
    """Extract coordinates from all Empty objects in the scene"""
    
    zones = []
    empties_found = 0
    output_lines = []
    
    output_lines.append("="*70)
    output_lines.append("BLENDER ZONE EXTRACTION RESULTS")
    output_lines.append("="*70)
    output_lines.append("")
    
    # Iterate through all objects in the scene
    for obj in bpy.context.scene.objects:
        # Check if object is an Empty OR starts with ZONE_
        if obj.type == 'EMPTY' or obj.name.startswith('ZONE_'):
            empties_found += 1
            
            # Get world coordinates
            location = obj.matrix_world.translation
            
            zone_data = {
                'name': obj.name,
                'type': obj.type,
                'location': {
                    'x': round(location.x, 3),
                    'y': round(location.y, 3),
                    'z': round(location.z, 3)
                },
                'rotation': {
                    'x': round(obj.rotation_euler.x, 3),
                    'y': round(obj.rotation_euler.y, 3),
                    'z': round(obj.rotation_euler.z, 3)
                }
            }
            
            zones.append(zone_data)
            output_lines.append(f"Found: {obj.name} at ({location.x:.3f}, {location.y:.3f}, {location.z:.3f})")
    
    # Sort by name
    zones.sort(key=lambda x: x['name'])
    
    output_lines.append("")
    output_lines.append(f"Total zones found: {empties_found}")
    output_lines.append("")
    
    # Prepare output
    output = {
        'scene_name': bpy.context.scene.name,
        'total_empties': empties_found,
        'zones': zones,
        'note': 'Coordinates are in Blender world space'
    }
    
    # Get the directory of the blend file (or home directory if not saved)
    if bpy.data.filepath:
        output_dir = os.path.dirname(bpy.data.filepath)
    else:
        output_dir = os.path.expanduser('~')
    
    output_file = os.path.join(output_dir, 'zone_coordinates.json')
    
    # Write to JSON file
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(output, f, indent=2, ensure_ascii=False)
    
    output_lines.append("="*70)
    output_lines.append(f"SUCCESS! Saved to: {output_file}")
    output_lines.append("="*70)
    output_lines.append("")
    output_lines.append("JAVASCRIPT CODE FOR mockData.ts:")
    output_lines.append("="*70)
    output_lines.append("")
    output_lines.append("export const zones: Zone[] = [")
    
    colors = ['#0066cc', '#00cc66', '#cc6600', '#cc0066', '#ffaa00', '#9933cc', '#33cccc', 
              '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#ffd700', '#ff69b4',
              '#8e44ad', '#e74c3c', '#00ccff', '#0088ff', '#0099ff']
    
    for i, zone in enumerate(zones):
        zone_id = f"zone-{i+1}"
        name = zone['name'].replace('ZONE_', '').replace('_', ' ')
        x = zone['location']['x']
        y = zone['location']['y']
        z = zone['location']['z']
        color = colors[i % len(colors)]
        
        output_lines.append(f"  {{")
        output_lines.append(f"    id: '{zone_id}',")
        output_lines.append(f"    name: '{name}',")
        output_lines.append(f"    color: '{color}',")
        output_lines.append(f"    position: [{x}, {y}, {z}],")
        output_lines.append(f"    description: 'Описание {name}',")
        output_lines.append(f"    type: 'conference'")
        output_lines.append(f"  }}{(',' if i < len(zones)-1 else '')}")
    
    output_lines.append("];")
    output_lines.append("")
    output_lines.append("="*70)
    output_lines.append("")
    output_lines.append("ИНСТРУКЦИЯ:")
    output_lines.append("1. Скопируйте код выше (от 'export const zones' до '];')")
    output_lines.append("2. Вставьте в forum-nav-app/src/data/mockData.ts")
    output_lines.append("3. Замените существующий массив zones")
    output_lines.append("4. Перезагрузите страницу в браузере")
    output_lines.append("")
    output_lines.append(f"JSON файл сохранен: {output_file}")
    
    return output_lines, output_file

# Run the extraction
if __name__ == "__main__":
    try:
        output_lines, output_file = extract_zone_coordinates()
        
        # Create new text datablock to show results
        text_name = "ZONE_EXTRACTION_RESULTS"
        
        # Remove old text if exists
        if text_name in bpy.data.texts:
            bpy.data.texts.remove(bpy.data.texts[text_name])
        
        # Create new text
        text_block = bpy.data.texts.new(text_name)
        text_block.write('\n'.join(output_lines))
        
        # Try to show in text editor
        for area in bpy.context.screen.areas:
            if area.type == 'TEXT_EDITOR':
                area.spaces[0].text = text_block
                break
        
        # Also print to console (if visible)
        print('\n'.join(output_lines))
        
        # Show popup message
        def show_message(message = "", title = "Script Finished", icon = 'INFO'):
            def draw(self, context):
                lines = message.split('\n')
                for line in lines:
                    self.layout.label(text=line)
            bpy.context.window_manager.popup_menu(draw, title = title, icon = icon)
        
        show_message(f"SUCCESS!\nFound {len(bpy.context.scene.objects)} objects\nResults in Text Editor: {text_name}\nJSON saved to:\n{output_file}", 
                    title="Zone Extraction Complete", icon='CHECKMARK')
        
    except Exception as e:
        error_msg = f"ERROR: {str(e)}"
        
        # Create error text
        if "ERROR_LOG" in bpy.data.texts:
            bpy.data.texts.remove(bpy.data.texts["ERROR_LOG"])
        error_text = bpy.data.texts.new("ERROR_LOG")
        error_text.write(error_msg)
        
        print(error_msg)
        import traceback
        traceback.print_exc()

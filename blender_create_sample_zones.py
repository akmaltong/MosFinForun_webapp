"""
Blender Script: Create Sample Zone Empties
Creates Empty objects at key positions in your model for testing

HOW TO USE:
1. Open your model in Blender
2. Select the main floor/ground object
3. Go to Scripting tab
4. Click "Open" and select this file
5. Click "Run Script" button
6. Empty objects will be created at calculated positions
7. Adjust their positions manually to match your halls
"""

import bpy
import math

def create_zone_empties():
    """Create Empty objects for zones based on model bounds"""
    
    # Get all mesh objects
    mesh_objects = [obj for obj in bpy.context.scene.objects if obj.type == 'MESH']
    
    if not mesh_objects:
        print("❌ No mesh objects found in scene!")
        return
    
    # Calculate bounding box of all meshes
    min_x = min_y = min_z = float('inf')
    max_x = max_y = max_z = float('-inf')
    
    for obj in mesh_objects:
        for vertex in obj.bound_box:
            world_vertex = obj.matrix_world @ bpy.context.object.data.vertices[0].co
            min_x = min(min_x, world_vertex.x)
            max_x = max(max_x, world_vertex.x)
            min_y = min(min_y, world_vertex.y)
            max_y = max(max_y, world_vertex.y)
            min_z = min(min_z, world_vertex.z)
            max_z = max(max_z, world_vertex.z)
    
    center_x = (min_x + max_x) / 2
    center_y = (min_y + max_y) / 2
    center_z = min_z  # Ground level
    
    width = max_x - min_x
    depth = max_y - min_y
    
    print(f"Model bounds: X={min_x:.2f} to {max_x:.2f}, Y={min_y:.2f} to {max_y:.2f}")
    print(f"Center: ({center_x:.2f}, {center_y:.2f}, {center_z:.2f})")
    print(f"Dimensions: {width:.2f} x {depth:.2f}")
    
    # Define zone positions (adjust these based on your layout)
    zones_to_create = [
        {
            'name': 'ZONE_MainHall',
            'position': (center_x, center_y, center_z),
            'description': 'Main Conference Hall'
        },
        {
            'name': 'ZONE_HallA',
            'position': (min_x + width * 0.25, center_y + depth * 0.2, center_z),
            'description': 'Hall A'
        },
        {
            'name': 'ZONE_HallB',
            'position': (max_x - width * 0.25, center_y + depth * 0.2, center_z),
            'description': 'Hall B'
        },
        {
            'name': 'ZONE_Exhibition',
            'position': (center_x, min_y + depth * 0.2, center_z),
            'description': 'Exhibition Area'
        },
        {
            'name': 'ZONE_FoodCourt',
            'position': (min_x + width * 0.2, min_y + depth * 0.3, center_z),
            'description': 'Food Court'
        },
        {
            'name': 'ZONE_Registration',
            'position': (center_x, max_y - depth * 0.1, center_z),
            'description': 'Registration Desk'
        },
        {
            'name': 'ZONE_Lounge',
            'position': (max_x - width * 0.2, min_y + depth * 0.3, center_z),
            'description': 'Lounge Area'
        }
    ]
    
    # Create collection for zones
    collection_name = "Zones"
    if collection_name not in bpy.data.collections:
        zone_collection = bpy.data.collections.new(collection_name)
        bpy.context.scene.collection.children.link(zone_collection)
    else:
        zone_collection = bpy.data.collections[collection_name]
    
    created_count = 0
    
    # Create Empty objects
    for zone_info in zones_to_create:
        # Check if already exists
        if zone_info['name'] in bpy.data.objects:
            print(f"⚠️ {zone_info['name']} already exists, skipping...")
            continue
        
        # Create Empty
        empty = bpy.data.objects.new(zone_info['name'], None)
        empty.empty_display_type = 'PLAIN_AXES'
        empty.empty_display_size = 2.0
        
        # Set location
        empty.location = zone_info['position']
        
        # Add custom property for description
        empty['description'] = zone_info['description']
        
        # Link to collection
        zone_collection.objects.link(empty)
        
        created_count += 1
        print(f"✅ Created: {zone_info['name']} at {zone_info['position']}")
    
    print(f"\n{'='*60}")
    print(f"✅ Created {created_count} zone markers")
    print(f"📍 Now adjust their positions to match your actual halls!")
    print(f"{'='*60}\n")

# Run the script
if __name__ == "__main__":
    try:
        create_zone_empties()
        
        # Show popup
        def show_message(message = "", title = "Script Finished", icon = 'INFO'):
            def draw(self, context):
                self.layout.label(text=message)
            bpy.context.window_manager.popup_menu(draw, title = title, icon = icon)
        
        show_message("Zone markers created! Adjust their positions as needed.", 
                    title="Zones Created", icon='CHECKMARK')
        
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
        import traceback
        traceback.print_exc()

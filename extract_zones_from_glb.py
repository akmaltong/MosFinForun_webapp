"""
Extract ZONE_ empties from GLB file without Blender
Reads SM_MFF.glb and extracts all objects starting with ZONE_
"""

import struct
import json
import os

def read_glb_file(filename):
    """Read and parse GLB file structure"""
    
    with open(filename, 'rb') as f:
        # Read GLB header
        magic = f.read(4)
        if magic != b'glTF':
            print("❌ Not a valid GLB file!")
            return None
        
        version = struct.unpack('<I', f.read(4))[0]
        length = struct.unpack('<I', f.read(4))[0]
        
        print(f"✅ GLB File Version: {version}")
        print(f"📦 File Length: {length} bytes")
        
        # Read JSON chunk
        json_chunk_length = struct.unpack('<I', f.read(4))[0]
        json_chunk_type = f.read(4)
        
        if json_chunk_type != b'JSON':
            print("❌ Invalid chunk type!")
            return None
        
        json_data = f.read(json_chunk_length).decode('utf-8')
        gltf = json.loads(json_data)
        
        return gltf

def extract_zones(gltf_data):
    """Extract all nodes with names starting with ZONE_"""
    
    zones = []
    
    if 'nodes' not in gltf_data:
        print("❌ No nodes found in GLB file")
        return zones
    
    print(f"\n📍 Found {len(gltf_data['nodes'])} total nodes in scene")
    print("🔍 Looking for ZONE_ objects...\n")
    
    for i, node in enumerate(gltf_data['nodes']):
        name = node.get('name', f'Node_{i}')
        
        # Check if name starts with ZONE_
        if name.startswith('ZONE_'):
            # Get translation (position)
            translation = node.get('translation', [0, 0, 0])
            rotation = node.get('rotation', [0, 0, 0, 1])
            scale = node.get('scale', [1, 1, 1])
            
            zone_data = {
                'id': f"zone-{len(zones)+1}",
                'original_name': name,
                'display_name': name.replace('ZONE_', '').replace('_', ' '),
                'position': {
                    'x': round(translation[0], 3),
                    'y': round(translation[1], 3),
                    'z': round(translation[2], 3)
                },
                'blender_coords': translation,
                'rotation': rotation,
                'scale': scale
            }
            
            zones.append(zone_data)
            print(f"✅ Found: {name}")
            print(f"   Position: X={translation[0]:.3f}, Y={translation[1]:.3f}, Z={translation[2]:.3f}")
    
    return zones

def generate_typescript_code(zones):
    """Generate TypeScript code for mockData.ts"""
    
    print("\n" + "="*70)
    print("📋 TypeScript код для src/data/mockData.ts:")
    print("="*70 + "\n")
    
    print("export const zones: Zone[] = [")
    
    # Default colors for different zone types
    colors = ['#0066cc', '#00cc66', '#cc6600', '#cc0066', '#ffaa00', '#9933cc', '#33cccc', 
              '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7']
    
    for i, zone in enumerate(zones):
        color = colors[i % len(colors)]
        
        # Convert Blender coords to app coords
        # Blender: X=right, Y=forward, Z=up
        # App: X=right, Y=up, Z=forward
        x = zone['blender_coords'][0]
        y = zone['blender_coords'][2]  # Blender Z -> App Y
        z = zone['blender_coords'][1]  # Blender Y -> App Z
        
        print(f"  {{")
        print(f"    id: '{zone['id']}',")
        print(f"    name: '{zone['display_name']}',")
        print(f"    color: '{color}',")
        print(f"    position: [{x}, {y}, {z}],")
        print(f"    description: 'Описание зоны {zone['display_name']}',")
        print(f"    type: 'conference'  // Измените тип: conference | exhibition | food | registration | lounge | other")
        print(f"  }}{(',' if i < len(zones)-1 else '')}")
    
    print("];")
    print("\n" + "="*70 + "\n")

def main():
    glb_file = 'SM_MFF.glb'
    
    if not os.path.exists(glb_file):
        print(f"❌ File {glb_file} not found!")
        print("📁 Current directory:", os.getcwd())
        return
    
    print(f"📂 Reading {glb_file}...\n")
    
    # Read GLB file
    gltf_data = read_glb_file(glb_file)
    
    if not gltf_data:
        return
    
    # Extract zones
    zones = extract_zones(gltf_data)
    
    if not zones:
        print("\n⚠️ No ZONE_ objects found in the model!")
        print("Make sure your empty objects are named like: ZONE_MainHall, ZONE_HallA, etc.")
        return
    
    print(f"\n🎉 SUCCESS! Found {len(zones)} zones!")
    
    # Save to JSON
    output_data = {
        'model_file': glb_file,
        'total_zones': len(zones),
        'zones': zones,
        'note': 'Coordinates are converted from Blender to app coordinate system'
    }
    
    output_file = 'zone_coordinates.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(output_data, f, indent=2, ensure_ascii=False)
    
    print(f"💾 Saved to: {output_file}")
    
    # Generate TypeScript code
    generate_typescript_code(zones)
    
    print("✅ Done! Copy the TypeScript code above into src/data/mockData.ts")

if __name__ == "__main__":
    main()

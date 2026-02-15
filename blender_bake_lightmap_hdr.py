"""
Blender Script: Автоматическое создание HDR Lightmap

ИСПОЛЬЗОВАНИЕ:
1. Откройте модель в Blender
2. Выберите объект для запекания
3. Scripting workspace → Text Editor → Open → выберите этот файл
4. Нажмите "Run Script" (или Alt+P)
5. Скрипт создаст HDR image и настроит запекание
6. Нажмите Render → Bake для запуска

ВАЖНО: Перед запуском убедитесь что:
- Объект выбран
- У объекта есть UV развертка
- Cycles включен
"""

import bpy

# ═══════════════════════════════════════════════════════════════
# НАСТРОЙКИ (можно изменить)
# ═══════════════════════════════════════════════════════════════

LIGHTMAP_NAME = "Lightmap_HDR"
LIGHTMAP_WIDTH = 2048
LIGHTMAP_HEIGHT = 2048
SAMPLES = 256  # Увеличьте до 512 для финального качества
MARGIN = 16  # Увеличьте до 32 если есть швы

# ═══════════════════════════════════════════════════════════════
# СКРИПТ
# ═══════════════════════════════════════════════════════════════

def setup_lightmap_baking():
    """Настройка запекания HDR Lightmap"""
    
    # Проверка что объект выбран
    if not bpy.context.active_object:
        print("❌ ОШИБКА: Не выбран объект!")
        print("   Выберите объект и запустите скрипт снова")
        return False
    
    obj = bpy.context.active_object
    print(f"✓ Выбран объект: {obj.name}")
    
    # Проверка что это Mesh
    if obj.type != 'MESH':
        print(f"❌ ОШИБКА: Объект {obj.name} не является Mesh!")
        return False
    
    # Проверка UV
    if not obj.data.uv_layers:
        print("❌ ОШИБКА: У объекта нет UV развертки!")
        print("   Создайте UV развертку: Edit Mode → U → Smart UV Project")
        return False
    
    print(f"✓ UV развертка найдена: {len(obj.data.uv_layers)} каналов")
    
    # ═══════════════════════════════════════════════════════════════
    # 1. НАСТРОЙКА CYCLES
    # ═══════════════════════════════════════════════════════════════
    
    print("\n📋 Настройка Cycles...")
    
    scene = bpy.context.scene
    scene.render.engine = 'CYCLES'
    
    # GPU если доступен
    if bpy.context.preferences.addons['cycles'].preferences.has_active_device():
        scene.cycles.device = 'GPU'
        print("✓ Cycles: GPU Compute")
    else:
        scene.cycles.device = 'CPU'
        print("✓ Cycles: CPU")
    
    # Samples
    scene.cycles.samples = SAMPLES
    print(f"✓ Samples: {SAMPLES}")
    
    # Denoising
    scene.cycles.use_denoising = True
    print("✓ Denoising: ON")
    
    # ═══════════════════════════════════════════════════════════════
    # 2. СОЗДАНИЕ HDR IMAGE
    # ═══════════════════════════════════════════════════════════════
    
    print(f"\n📋 Создание HDR image: {LIGHTMAP_NAME}...")
    
    # Удалить старый image если существует
    if LIGHTMAP_NAME in bpy.data.images:
        old_image = bpy.data.images[LIGHTMAP_NAME]
        bpy.data.images.remove(old_image)
        print(f"✓ Удален старый image: {LIGHTMAP_NAME}")
    
    # Создать новый 32-bit Float image
    lightmap_image = bpy.data.images.new(
        name=LIGHTMAP_NAME,
        width=LIGHTMAP_WIDTH,
        height=LIGHTMAP_HEIGHT,
        alpha=False,
        float_buffer=True,  # ⚠️ ВАЖНО: 32-bit Float!
        is_data=False
    )
    
    # Заполнить черным
    lightmap_image.generated_color = (0, 0, 0, 1)
    
    print(f"✓ Создан HDR image: {LIGHTMAP_WIDTH}x{LIGHTMAP_HEIGHT}, 32-bit Float")
    
    # ═══════════════════════════════════════════════════════════════
    # 3. НАСТРОЙКА МАТЕРИАЛА
    # ═══════════════════════════════════════════════════════════════
    
    print("\n📋 Настройка материала...")
    
    # Создать материал если нет
    if not obj.data.materials:
        mat = bpy.data.materials.new(name="BakeMaterial")
        mat.use_nodes = True
        obj.data.materials.append(mat)
        print("✓ Создан новый материал")
    else:
        mat = obj.data.materials[0]
        if not mat.use_nodes:
            mat.use_nodes = True
        print(f"✓ Используется материал: {mat.name}")
    
    # Получить node tree
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    
    # Удалить старый Image Texture node для lightmap если есть
    for node in nodes:
        if node.type == 'TEX_IMAGE' and node.image == lightmap_image:
            nodes.remove(node)
    
    # Создать Image Texture node
    img_node = nodes.new(type='ShaderNodeTexImage')
    img_node.image = lightmap_image
    img_node.name = "Lightmap_Bake_Target"
    img_node.label = "Lightmap (Bake Target)"
    img_node.location = (0, 0)
    
    # ВАЖНО: Выбрать node для запекания
    nodes.active = img_node
    
    print("✓ Image Texture node создан и выбран")
    
    # ═══════════════════════════════════════════════════════════════
    # 4. НАСТРОЙКА BAKE
    # ═══════════════════════════════════════════════════════════════
    
    print("\n📋 Настройка Bake...")
    
    scene.render.bake.use_pass_direct = True
    scene.render.bake.use_pass_indirect = True
    scene.render.bake.use_pass_diffuse = False
    scene.render.bake.use_pass_glossy = False
    scene.render.bake.use_pass_transmission = False
    scene.render.bake.use_pass_emit = False
    scene.render.bake.use_pass_color = False
    
    scene.render.bake.margin = MARGIN
    scene.render.bake.use_clear = True
    
    print("✓ Bake Type: Combined")
    print("✓ Influence: Direct + Indirect")
    print(f"✓ Margin: {MARGIN}px")
    
    # ═══════════════════════════════════════════════════════════════
    # ГОТОВО!
    # ═══════════════════════════════════════════════════════════════
    
    print("\n" + "═" * 60)
    print("✅ НАСТРОЙКА ЗАВЕРШЕНА!")
    print("═" * 60)
    print("\nТеперь:")
    print("1. Render Properties → Bake → Bake Type: Combined")
    print("2. Нажмите 'Bake' для запуска")
    print(f"3. Ждите завершения (~{SAMPLES // 4}-{SAMPLES // 2} минут)")
    print("4. Image Editor → Image → Save As → OpenEXR (.exr)")
    print("5. Сохраните как: SM_MFF_Lightmap.exr")
    print("\n" + "═" * 60)
    
    return True

# ═══════════════════════════════════════════════════════════════
# ЗАПУСК
# ═══════════════════════════════════════════════════════════════

if __name__ == "__main__":
    print("\n" + "═" * 60)
    print("  BLENDER HDR LIGHTMAP BAKING SETUP")
    print("═" * 60 + "\n")
    
    success = setup_lightmap_baking()
    
    if not success:
        print("\n❌ Настройка не завершена. Исправьте ошибки и запустите снова.")

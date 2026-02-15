"""
Blender Script: Автоматическое запекание текстур для Three.js
Использование: blender --background your_model.blend --python blender_bake_textures.py
"""

import bpy
import os

# ============================================================================
# НАСТРОЙКИ
# ============================================================================

# Разрешение текстур
TEXTURE_SIZE = 2048  # 1024, 2048, 4096

# Путь для сохранения текстур
OUTPUT_DIR = "//textures/venue/"  # // = относительно .blend файла

# Имя модели (префикс для файлов)
MODEL_NAME = "SM_MFF"

# Какие карты запекать
BAKE_MAPS = {
    'AO': True,              # Ambient Occlusion
    'LIGHTMAP': True,        # Combined lighting
    'BASECOLOR': True,       # Diffuse color
    'NORMAL': True,          # Normal map
    'ROUGHNESS': True,       # Roughness map
    'METALLIC': True,        # Metallic map
}

# Настройки запекания
BAKE_SETTINGS = {
    'AO': {
        'samples': 128,
        'distance': 0.2,
        'margin': 16,
    },
    'LIGHTMAP': {
        'samples': 256,
        'margin': 16,
    },
    'BASECOLOR': {
        'samples': 64,
        'margin': 16,
    },
    'NORMAL': {
        'samples': 64,
        'margin': 16,
    },
    'ROUGHNESS': {
        'samples': 64,
        'margin': 16,
    },
    'METALLIC': {
        'samples': 64,
        'margin': 16,
    },
}

# ============================================================================
# ФУНКЦИИ
# ============================================================================

def setup_render_settings():
    """Настройка Cycles для запекания"""
    print("Настройка Cycles...")
    
    # Cycles
    bpy.context.scene.render.engine = 'CYCLES'
    bpy.context.scene.cycles.device = 'GPU'
    bpy.context.scene.cycles.samples = 128
    
    # Denoising
    bpy.context.scene.cycles.use_denoising = True
    
    print("✓ Cycles настроен")


def create_output_directory():
    """Создание директории для текстур"""
    output_path = bpy.path.abspath(OUTPUT_DIR)
    os.makedirs(output_path, exist_ok=True)
    print(f"✓ Директория создана: {output_path}")
    return output_path


def get_selected_objects():
    """Получение выбранных объектов"""
    objects = [obj for obj in bpy.context.selected_objects if obj.type == 'MESH']
    
    if not objects:
        print("⚠ Нет выбранных mesh объектов, используем все mesh в сцене")
        objects = [obj for obj in bpy.context.scene.objects if obj.type == 'MESH']
    
    print(f"✓ Найдено объектов: {len(objects)}")
    return objects


def create_image(name, size, color_space='sRGB'):
    """Создание новой текстуры"""
    image = bpy.data.images.new(
        name=name,
        width=size,
        height=size,
        alpha=False,
        float_buffer=False
    )
    image.colorspace_settings.name = color_space
    image.file_format = 'PNG'
    return image


def setup_bake_material(obj, image):
    """Настройка материала для запекания"""
    # Получаем или создаем материал
    if not obj.data.materials:
        mat = bpy.data.materials.new(name=f"{obj.name}_Material")
        obj.data.materials.append(mat)
    else:
        mat = obj.data.materials[0]
    
    # Включаем nodes
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    
    # Создаем Image Texture node для запекания
    bake_node = nodes.new('ShaderNodeTexImage')
    bake_node.name = 'BakeTarget'
    bake_node.image = image
    bake_node.select = True
    nodes.active = bake_node
    
    return mat


def bake_ao(objects, output_path):
    """Запекание Ambient Occlusion"""
    print("\n=== Запекание AO ===")
    
    settings = BAKE_SETTINGS['AO']
    image_name = f"{MODEL_NAME}_AO"
    
    # Создаем текстуру
    image = create_image(image_name, TEXTURE_SIZE, 'Non-Color Data')
    
    # Настраиваем объекты
    for obj in objects:
        bpy.context.view_layer.objects.active = obj
        setup_bake_material(obj, image)
    
    # Настройки запекания
    bpy.context.scene.render.bake.use_pass_direct = False
    bpy.context.scene.render.bake.use_pass_indirect = False
    bpy.context.scene.render.bake.use_pass_color = False
    bpy.context.scene.cycles.samples = settings['samples']
    bpy.context.scene.render.bake.margin = settings['margin']
    
    # Запекаем
    bpy.ops.object.bake(type='AO')
    
    # Сохраняем
    filepath = os.path.join(output_path, f"{image_name}.png")
    image.filepath_raw = filepath
    image.save()
    
    print(f"✓ AO сохранен: {filepath}")


def bake_lightmap(objects, output_path):
    """Запекание Lightmap (Combined)"""
    print("\n=== Запекание Lightmap ===")
    
    settings = BAKE_SETTINGS['LIGHTMAP']
    image_name = f"{MODEL_NAME}_Lightmap"
    
    # Создаем текстуру
    image = create_image(image_name, TEXTURE_SIZE, 'sRGB')
    
    # Настраиваем объекты
    for obj in objects:
        bpy.context.view_layer.objects.active = obj
        setup_bake_material(obj, image)
    
    # Настройки запекания
    bpy.context.scene.render.bake.use_pass_direct = True
    bpy.context.scene.render.bake.use_pass_indirect = True
    bpy.context.scene.render.bake.use_pass_color = False
    bpy.context.scene.cycles.samples = settings['samples']
    bpy.context.scene.render.bake.margin = settings['margin']
    
    # Запекаем
    bpy.ops.object.bake(type='COMBINED')
    
    # Сохраняем
    filepath = os.path.join(output_path, f"{image_name}.png")
    image.filepath_raw = filepath
    image.save()
    
    print(f"✓ Lightmap сохранен: {filepath}")


def bake_basecolor(objects, output_path):
    """Запекание Base Color"""
    print("\n=== Запекание Base Color ===")
    
    settings = BAKE_SETTINGS['BASECOLOR']
    image_name = f"{MODEL_NAME}_BaseColor"
    
    # Создаем текстуру
    image = create_image(image_name, TEXTURE_SIZE, 'sRGB')
    
    # Настраиваем объекты
    for obj in objects:
        bpy.context.view_layer.objects.active = obj
        setup_bake_material(obj, image)
    
    # Настройки запекания
    bpy.context.scene.render.bake.use_pass_direct = False
    bpy.context.scene.render.bake.use_pass_indirect = False
    bpy.context.scene.render.bake.use_pass_color = True
    bpy.context.scene.cycles.samples = settings['samples']
    bpy.context.scene.render.bake.margin = settings['margin']
    
    # Запекаем
    bpy.ops.object.bake(type='DIFFUSE')
    
    # Сохраняем
    filepath = os.path.join(output_path, f"{image_name}.png")
    image.filepath_raw = filepath
    image.save()
    
    print(f"✓ Base Color сохранен: {filepath}")


def bake_normal(objects, output_path):
    """Запекание Normal Map"""
    print("\n=== Запекание Normal ===")
    
    settings = BAKE_SETTINGS['NORMAL']
    image_name = f"{MODEL_NAME}_Normal"
    
    # Создаем текстуру
    image = create_image(image_name, TEXTURE_SIZE, 'Non-Color Data')
    
    # Настраиваем объекты
    for obj in objects:
        bpy.context.view_layer.objects.active = obj
        setup_bake_material(obj, image)
    
    # Настройки запекания
    bpy.context.scene.render.bake.normal_space = 'TANGENT'
    bpy.context.scene.cycles.samples = settings['samples']
    bpy.context.scene.render.bake.margin = settings['margin']
    
    # Запекаем
    bpy.ops.object.bake(type='NORMAL')
    
    # Сохраняем
    filepath = os.path.join(output_path, f"{image_name}.png")
    image.filepath_raw = filepath
    image.save()
    
    print(f"✓ Normal сохранен: {filepath}")


def bake_roughness(objects, output_path):
    """Запекание Roughness"""
    print("\n=== Запекание Roughness ===")
    
    settings = BAKE_SETTINGS['ROUGHNESS']
    image_name = f"{MODEL_NAME}_Roughness"
    
    # Создаем текстуру
    image = create_image(image_name, TEXTURE_SIZE, 'Non-Color Data')
    
    # Настраиваем объекты
    for obj in objects:
        bpy.context.view_layer.objects.active = obj
        setup_bake_material(obj, image)
    
    # Настройки запекания
    bpy.context.scene.cycles.samples = settings['samples']
    bpy.context.scene.render.bake.margin = settings['margin']
    
    # Запекаем
    bpy.ops.object.bake(type='ROUGHNESS')
    
    # Сохраняем
    filepath = os.path.join(output_path, f"{image_name}.png")
    image.filepath_raw = filepath
    image.save()
    
    print(f"✓ Roughness сохранен: {filepath}")


def bake_metallic(objects, output_path):
    """Запекание Metallic"""
    print("\n=== Запекание Metallic ===")
    
    settings = BAKE_SETTINGS['METALLIC']
    image_name = f"{MODEL_NAME}_Metallic"
    
    # Создаем текстуру
    image = create_image(image_name, TEXTURE_SIZE, 'Non-Color Data')
    
    # Настраиваем объекты
    for obj in objects:
        bpy.context.view_layer.objects.active = obj
        setup_bake_material(obj, image)
    
    # Настройки запекания
    bpy.context.scene.cycles.samples = settings['samples']
    bpy.context.scene.render.bake.margin = settings['margin']
    
    # Запекаем
    bpy.ops.object.bake(type='EMIT')  # Metallic через Emit
    
    # Сохраняем
    filepath = os.path.join(output_path, f"{image_name}.png")
    image.filepath_raw = filepath
    image.save()
    
    print(f"✓ Metallic сохранен: {filepath}")


# ============================================================================
# ГЛАВНАЯ ФУНКЦИЯ
# ============================================================================

def main():
    """Главная функция запекания"""
    print("\n" + "="*60)
    print("АВТОМАТИЧЕСКОЕ ЗАПЕКАНИЕ ТЕКСТУР")
    print("="*60)
    
    # Настройка
    setup_render_settings()
    output_path = create_output_directory()
    objects = get_selected_objects()
    
    if not objects:
        print("✗ Ошибка: нет объектов для запекания!")
        return
    
    # Запекание карт
    if BAKE_MAPS['AO']:
        bake_ao(objects, output_path)
    
    if BAKE_MAPS['LIGHTMAP']:
        bake_lightmap(objects, output_path)
    
    if BAKE_MAPS['BASECOLOR']:
        bake_basecolor(objects, output_path)
    
    if BAKE_MAPS['NORMAL']:
        bake_normal(objects, output_path)
    
    if BAKE_MAPS['ROUGHNESS']:
        bake_roughness(objects, output_path)
    
    if BAKE_MAPS['METALLIC']:
        bake_metallic(objects, output_path)
    
    print("\n" + "="*60)
    print("✓ ЗАПЕКАНИЕ ЗАВЕРШЕНО!")
    print(f"✓ Текстуры сохранены в: {output_path}")
    print("="*60 + "\n")


# ============================================================================
# ЗАПУСК
# ============================================================================

if __name__ == "__main__":
    main()

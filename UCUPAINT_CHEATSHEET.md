# Ucupaint - Шпаргалка

## Быстрый старт

### 1. Установка
```
Edit → Preferences → Get Extensions → "Ucupaint" → Install
```

### 2. Активация
```
1. Выбрать объект
2. N (боковая панель)
3. Вкладка "Ucupaint"
4. "New Yp Material" или "Convert to Yp Material"
```

### 3. Настройка
```
Settings → Width: 2048, Height: 2048
```

## Запекание (порядок важен!)

### 1. AO (10 мин) ⭐
```
Bake → Ambient Occlusion
Samples: 128, Distance: 0.2, Margin: 16
Save As: SM_MFF_AO.png (Non-Color Data)
```

### 2. Lightmap (30 мин)
```
Bake → Combined
Samples: 256, Direct+Indirect, Denoise: ON, Margin: 16
Save As: SM_MFF_Lightmap.png (sRGB)
```

### 3. BaseColor (5 мин)
```
Bake → Diffuse
Samples: 64, Color only, Margin: 16
Save As: SM_MFF_BaseColor.png (sRGB)
```

### 4. Normal (10 мин)
```
Bake → Normal
Samples: 64, Space: Tangent, Margin: 16
Save As: SM_MFF_Normal.png (Non-Color Data)
```

### 5. Roughness (5 мин)
```
Bake → Roughness
Samples: 64, Margin: 16
Save As: SM_MFF_Roughness.png (Non-Color Data)
```

### 6. Metallic (5 мин)
```
Bake → Emit
Samples: 64, Margin: 16
Save As: SM_MFF_Metallic.png (Non-Color Data)
```

## Color Space (важно!)

| Карта | Color Space |
|-------|-------------|
| BaseColor | sRGB |
| Lightmap | sRGB |
| AO | Non-Color Data |
| Normal | Non-Color Data |
| Roughness | Non-Color Data |
| Metallic | Non-Color Data |

## Копирование в проект

```powershell
# Windows
Copy-Item "путь\к\blender\textures\venue\*.png" -Destination "public\textures\venue\"
```

## Применение в Three.js

```typescript
// В Scene3D.tsx замените:
// import VenueModel from './VenueModel'
import VenueModelBaked from './VenueModelBaked'

// <VenueModel />
<VenueModelBaked />
```

## Настройка интенсивности

```typescript
// В VenueModelBaked.tsx:

// Углы слишком темные?
aoMapIntensity: 2.0,      // Уменьшить
lightMapIntensity: 1.2,   // Увеличить

// Углы слишком светлые?
aoMapIntensity: 3.0,      // Увеличить
lightMapIntensity: 0.8,   // Уменьшить
```

## Troubleshooting

| Проблема | Решение |
|----------|---------|
| Ucupaint не видно | Preferences → Add-ons → включить |
| Долгое запекание | Samples ↓, Resolution ↓, GPU ON |
| Швы на текстурах | Margin: 32, проверить UV |
| AO слишком темный | Distance: 0.1 или aoMapIntensity ↓ |
| Lightmap темный | Samples ↑, освещение ↑, Denoise ON |

## Время

- AO: 5-10 мин
- Lightmap: 20-40 мин
- Остальные: 15-25 мин
- **Всего: ~40-75 мин**

## Чеклист

- [ ] Ucupaint установлен
- [ ] UV развертка проверена
- [ ] Освещение настроено
- [ ] Cycles GPU включен
- [ ] Все 6 карт запечены
- [ ] Color Space правильный
- [ ] Текстуры в public/textures/venue/
- [ ] VenueModelBaked используется
- [ ] Результат проверен

---

**Полная инструкция:** `UCUPAINT_STEP_BY_STEP.md`

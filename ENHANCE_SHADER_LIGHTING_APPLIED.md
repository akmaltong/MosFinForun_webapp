# Enhance Shader Lighting - Применено

## Статус: ❌ НЕ СОВМЕСТИМО

Дата: 2026-02-13

## Проблема

Библиотека `enhance-shader-lighting` несовместима с Three.js 0.170.0:

```
Uncaught TypeError: Cannot read properties of undefined (reading 'replace')
```

Библиотека требует Three.js < 0.151.0, проект использует 0.170.0.

## Альтернативное решение

Вместо enhance-shader-lighting применены следующие методы:

### 1. Усиленный AO Map Intensity

**Файл:** `src/components/VenueModel.tsx`

```typescript
aoMapIntensity: 2.5  // Сильное затемнение углов и стыков
```

### 2. Уменьшенное Ambient освещение

**Файл:** `src/components/LightingSystem.tsx`

```typescript
<ambientLight intensity={0.25} />      // Было 0.5
<hemisphereLight intensity={0.5} />    // Было 0.7
<directionalLight intensity={3.2} />   // Увеличено для компенсации
```

### 3. Усиленные Contact Shadows

**Файл:** `src/components/GroundContactShadows.tsx`

```typescript
opacity: 0.6,        // Было 0.35
blur: 1.5,           // Было 2.5 (более четкие тени)
resolution: 1024,    // Было 512 (выше качество)
```

## Результат

Комбинация этих трех методов должна:
- ✅ Затемнить углы через усиленный AO
- ✅ Затемнить стыки через уменьшенный ambient
- ✅ Добавить мягкие тени на контактах через ContactShadows

## Если нужно больше затемнения

### Увеличить AO:
```typescript
aoMapIntensity: 3.0  // Было 2.5
```

### Уменьшить ambient:
```typescript
<ambientLight intensity={0.2} />  // Было 0.25
```

### Усилить ContactShadows:
```typescript
opacity: 0.8  // Было 0.6
```

## Если слишком темно

### Уменьшить AO:
```typescript
aoMapIntensity: 2.0  // Было 2.5
```

### Увеличить ambient:
```typescript
<ambientLight intensity={0.3} />  // Было 0.25
```

### Ослабить ContactShadows:
```typescript
opacity: 0.4  // Было 0.6
```

---

*Документ обновлен: 2026-02-13*
*Статус: Альтернативное решение применено*

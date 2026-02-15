# Решение проблемы просачивания света

## Проблема
Светлые полосы на стыках стен и пола (light bleeding)

## Решение: ✅ Комбинация методов

### Что сделано:

1. **Усилен AO Map Intensity**
   ```typescript
   aoMapIntensity: 2.5  // Сильное затемнение углов
   ```

2. **Уменьшено ambient освещение**
   - Ambient: 0.25 (было 0.5)
   - Hemisphere: 0.5 (было 0.7)
   - Directional: 3.2 (увеличено для компенсации)

3. **Усилены Contact Shadows**
   - Opacity: 0.6 (было 0.35)
   - Blur: 1.5 (более четкие тени)
   - Resolution: 1024 (выше качество)

## Почему не enhance-shader-lighting?

Библиотека несовместима с Three.js 0.170.0:
```
Uncaught TypeError: Cannot read properties of undefined (reading 'replace')
```

## Как настроить

### Углы слишком темные?
```typescript
aoMapIntensity: 2.0  // Уменьшить
<ambientLight intensity={0.3} />  // Увеличить
```

### Углы все еще светлые?
```typescript
aoMapIntensity: 3.0  // Увеличить
<ambientLight intensity={0.2} />  // Уменьшить
opacity: 0.8  // ContactShadows
```

## Документация

- **Альтернативное решение:** `ENHANCE_SHADER_LIGHTING_APPLIED.md`
- **Исследование библиотеки:** `ENHANCE_SHADER_LIGHTING_RESEARCH.md`
- **История попыток:** `LIGHT_BLEEDING_FIX.md`

## Проверка

1. Откройте http://localhost:3000/
2. Выберите "Базовое" освещение (Custom preset)
3. Проверьте стыки стен и пола
4. Углы должны быть затемнены
5. Не должно быть светлых полос

---

*Решение применено: 2026-02-13*

import { CSSProperties } from 'react'

// Unified glass panel style for all panels (side and bottom)
export const glassPanelStyle: CSSProperties = {
  backgroundColor: 'rgba(40, 40, 40, 0.4)',
  backdropFilter: 'blur(12px) saturate(180%) brightness(0.7)',
  WebkitBackdropFilter: 'blur(12px) saturate(180%) brightness(0.7)',
  borderRadius: '25px',
  border: '1px solid rgba(255,255,255,0.15)',
  boxShadow: 'inset 0 1px 0 0 rgba(255,255,255,0.1), inset 0 -1px 0 0 rgba(0,0,0,0.2), 0 8px 32px rgba(0,0,0,0.4)',
}

// For bottom panels with additional properties and stronger blur
export const bottomPanelStyle: CSSProperties = {
  backgroundColor: 'rgba(40, 40, 40, 0.4)',
  backdropFilter: 'blur(30px) saturate(180%) brightness(0.7)',
  WebkitBackdropFilter: 'blur(30px) saturate(180%) brightness(0.7)',
  borderRadius: '25px',
  border: '1px solid rgba(255,255,255,0.15)',
  boxShadow: 'inset 0 1px 0 0 rgba(255,255,255,0.1), inset 0 -1px 0 0 rgba(0,0,0,0.2), 0 8px 32px rgba(0,0,0,0.4)',
  padding: '12px 16px',
  maxWidth: '700px',
  position: 'relative',
}

// For settings panel with scroll
export const settingsPanelStyle: CSSProperties = {
  ...bottomPanelStyle,
  maxHeight: '400px',
  overflowY: 'auto',
}

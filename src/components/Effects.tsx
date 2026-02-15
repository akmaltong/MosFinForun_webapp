import { Suspense } from 'react'
import {
  Bloom,
  EffectComposer as R3FEffectComposer,
  BrightnessContrast,
  SMAA,
  SSAO,
  Vignette,
  HueSaturation,
} from '@react-three/postprocessing'
import { useAppStore } from '../store/appStore'
import { BlendFunction } from 'postprocessing'

function EffectsPipeline() {
  const bloomIntensity = useAppStore(state => state.bloomIntensity)
  const bloomThreshold = useAppStore(state => state.bloomThreshold)
  const ssaaoEnabled = useAppStore(state => state.ssaaoEnabled)
  const colorBrightness = useAppStore(state => state.colorBrightness)
  const colorContrast = useAppStore(state => state.colorContrast)
  const colorSaturation = useAppStore(state => state.colorSaturation)
  const vignetteIntensity = useAppStore(state => state.vignetteIntensity)

  return (
    <R3FEffectComposer multisampling={0} enableNormalPass={ssaaoEnabled}>
      {ssaaoEnabled ? (
        <SSAO
          samples={16}
          rings={4}
          distanceThreshold={0.8}
          distanceFalloff={0.2}
          rangeThreshold={0.02}
          rangeFalloff={0.01}
          luminanceInfluence={0.5}
          radius={8}
          intensity={3.0}
          bias={0.005}
          color={undefined}
        />
      ) : <></>}

      {bloomIntensity > 0 ? (
        <Bloom
          luminanceThreshold={bloomThreshold}
          mipmapBlur={false}
          intensity={bloomIntensity}
          radius={0.5}
        />
      ) : <></>}

      {vignetteIntensity > 0 ? (
        <Vignette
          offset={0.5}
          darkness={vignetteIntensity}
          blendFunction={BlendFunction.NORMAL}
        />
      ) : <></>}

      {(Math.abs(colorBrightness) > 0.01 || Math.abs(colorContrast) > 0.01) ? (
        <BrightnessContrast
          brightness={colorBrightness}
          contrast={colorContrast}
        />
      ) : <></>}

      {Math.abs(colorSaturation) > 0.01 ? (
        <HueSaturation
          saturation={colorSaturation}
          blendFunction={BlendFunction.NORMAL}
        />
      ) : <></>}

      <SMAA />
    </R3FEffectComposer>
  )
}

export default function Effects() {
  return (
    <Suspense fallback={null}>
      <EffectsPipeline />
    </Suspense>
  )
}

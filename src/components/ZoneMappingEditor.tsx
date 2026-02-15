import { useState } from 'react'
import { useAppStore } from '../store/appStore'
import { zones } from '../data/mockData'

export default function ZoneMappingEditor() {
  const zoneMeshMapping = useAppStore(state => state.zoneMeshMapping)
  const setZoneMeshMapping = useAppStore(state => state.setZoneMeshMapping)
  const [expandedZone, setExpandedZone] = useState<string | null>(null)

  const handleMeshNameChange = (zoneName: string, newMeshName: string) => {
    setZoneMeshMapping({
      ...zoneMeshMapping,
      [zoneName]: newMeshName
    })
  }

  const handleReset = () => {
    const defaultMapping: Record<string, string> = {
      'Конференц-зал I': 'Конференц-зал_1',
      'Конференц-зал II': 'Конференц-зал_2',
      'Конференц-зал III': 'Конференц-зал_3',
      'Конференц-зал IV': 'Конференц-зал_4',
      'Овальный зал': 'Овальный_зал',
      'Зал пленарного заседания': 'Зал_пленарного_заседания',
      'VIP-зал': 'VIP-зал',
      'Арт-объект': 'Арт-объект',
      'Пресс-подход 1': 'Пресс-подход_1',
      'Пресс-подход 2': 'Пресс-подход_2',
      'Лаунж-зона 1': 'Лаунж-зона_1',
      'Лаунж-зона 2': 'Лаунж-зона_2',
      'Аккредитация': 'Аккредитация',
      'Инфо-стойка': 'Инфо-стойка',
      'Экспозиция': 'Экспозиция',
      'Фойе': 'Фойе',
      'Фото-зона': 'Фото-зона',
    }
    setZoneMeshMapping(defaultMapping)
  }

  return (
    <div className="bg-gray-900 rounded-lg p-4 max-h-96 overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-white font-semibold">Маппинг зон на меши</h3>
        <button
          onClick={handleReset}
          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition"
        >
          Сброс
        </button>
      </div>

      <div className="space-y-2">
        {zones.map(zone => (
          <div key={zone.id} className="bg-gray-800 rounded p-2">
            <button
              onClick={() => setExpandedZone(expandedZone === zone.name ? null : zone.name)}
              className="w-full text-left flex items-center justify-between hover:bg-gray-700 p-2 rounded transition"
            >
              <span className="text-white font-medium">{zone.name}</span>
              <span className="text-gray-400 text-sm">
                {expandedZone === zone.name ? '▼' : '▶'}
              </span>
            </button>

            {expandedZone === zone.name && (
              <div className="mt-2 p-2 bg-gray-700 rounded">
                <label className="block text-gray-300 text-sm mb-1">Имя меша в Zones.glb:</label>
                <input
                  type="text"
                  value={zoneMeshMapping[zone.name] || ''}
                  onChange={(e) => handleMeshNameChange(zone.name, e.target.value)}
                  className="w-full px-2 py-1 bg-gray-600 text-white rounded text-sm border border-gray-500 focus:border-blue-500 focus:outline-none"
                  placeholder="Введите имя меша"
                />
                <p className="text-gray-400 text-xs mt-1">
                  Текущее значение: <code className="bg-gray-600 px-1 rounded">{zoneMeshMapping[zone.name]}</code>
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

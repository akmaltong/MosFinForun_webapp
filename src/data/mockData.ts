import type { Zone, Event, Friend } from '../types'
import { pois } from './poiData'

const poiMap = new Map(pois.map(poi => [poi.name, poi]))

export const zones: Zone[] = [
  {
    id: 'zone-1',
    name: 'VIP-зал',
    color: '#ffd700',
    position: [52.066, 0.019, 0.779],
    description: 'Приватные встречи, переговоры и отдых VIP-персон (спикеры, министры, инвесторы). По приглашениям.',
    type: 'lounge',
    floor: '1 этаж, изолированная зона',
    equipment: ['Комфортная мебель', 'Отдельный вход', 'Охрана'],
    poi: poiMap.get('VIP_зона')
  },
  {
    id: 'zone-2',
    name: 'Аккредитация',
    color: '#9933cc',
    position: [-127.695, -0.082, -6.942],
    description: 'Первая точка контакта. Получение бейджа, навигация, информация.',
    type: 'registration',
    floor: '1 этаж, главный вход',
    equipment: ['Стойки аккредитации', 'Навигационные стенды', 'Металлодетекторы'],
    poi: poiMap.get('Аккредитация')
  },
  {
    id: 'zone-3',
    name: 'Арт-объект',
    color: '#96ceb4',
    position: [-17.487, 0.039, 2.465],
    description: 'Место для памятных фотографий участников с фирменным оформлением форума.',
    type: 'other',
    floor: '1 этаж',
    equipment: ['Арт-инсталляции', 'Баннеры', 'Специальное освещение'],
    poi: poiMap.get('Арт_объект')
  },
  {
    id: 'zone-4',
    name: 'Пресс-подход 1',
    color: '#e74c3c',
    position: [-70.494, 0.030, -4.725],
    description: 'Краткие комментарии спикеров после выступлений. Фото-зона с баннером (Прессвол).',
    type: 'other',
    floor: '1 этаж, примыкает к ЗПЗ',
    equipment: ['Профессиональное освещение', 'Фон с логотипом', 'Место для операторов'],
    poi: poiMap.get('ЗОНА ПРЕСС ПОДХОДА_1')
  },
  {
    id: 'zone-5',
    name: 'Пресс-подход 2',
    color: '#c0392b',
    position: [-71.147, 0.030, 7.861],
    description: 'Краткие комментарии спикеров после выступлений. Фото-зона с баннером (Прессвол).',
    type: 'other',
    floor: '1 этаж, примыкает к ЗПЗ',
    equipment: ['Профессиональное освещение', 'Фон с логотипом', 'Место для операторов'],
    poi: poiMap.get('ЗОНА ПРЕСС ПОДХОДА_2')
  },
  {
    id: 'zone-6',
    name: 'Зал пленарного заседания',
    color: '#ff6b35',
    position: [30.267, 0.456, 1.719],
    description: 'Главная сцена форума. Ключевые выступления, открытие/закрытие.',
    type: 'conference',
    capacity: 680,
    floor: '1 этаж, центр',
    equipment: ['Подиум', 'Экраны 8x4.5м (2 шт.)', 'ТВ-позиции', 'Синхронный перевод'],
    poi: poiMap.get('Зал_Пленарного_Заседания')
  },
  {
    id: 'zone-7',
    name: 'Инфо-стойка',
    color: '#00ccff',
    position: [-63.039, 0.053, -4.444],
    description: 'Навигация, информация и помощь участникам форума.',
    type: 'other',
    floor: '1 этаж',
    equipment: ['Информационные материалы', 'Планшеты навигации'],
    poi: poiMap.get('Инфо-стойка')
  },
  {
    id: 'zone-8',
    name: 'Конференц-зал I',
    color: '#0088ff',
    position: [-42.434, 0.111, 15.028],
    description: 'Параллельные тематические сессии (финтех, ESG, инвестиции).',
    type: 'conference',
    capacity: 110,
    floor: '2 этаж',
    equipment: ['Экран 4.5x2.5м', 'Трибуна', 'Микрофоны', 'Флипчарты'],
    poi: poiMap.get('Конференц_зал 1')
  },
  {
    id: 'zone-9',
    name: 'Конференц-зал II',
    color: '#4ecdc4',
    position: [-38.756, 0.111, -11.400],
    description: 'Параллельные тематические сессии (финтех, ESG, инвестиции).',
    type: 'conference',
    capacity: 110,
    floor: '2 этаж',
    equipment: ['Экран 4.5x2.5м', 'Трибуна', 'Микрофоны', 'Флипчарты'],
    poi: poiMap.get('Конференц_зал 2')
  },
  {
    id: 'zone-10',
    name: 'Конференц-зал III',
    color: '#45b7d1',
    position: [-6.192, 0.111, 14.388],
    description: 'Параллельные тематические сессии (финтех, ESG, инвестиции).',
    type: 'conference',
    capacity: 110,
    floor: '1 этаж',
    equipment: ['Экран 5.5x3м', 'Трибуна', 'Микрофоны', 'Флипчарты'],
    poi: poiMap.get('Конференц_зал 3')
  },
  {
    id: 'zone-11',
    name: 'Конференц-зал IV',
    color: '#96ceb4',
    position: [-6.264, 0.111, -10.895],
    description: 'Параллельные тематические сессии (финтех, ESG, инвестиции).',
    type: 'conference',
    capacity: 110,
    floor: '1 этаж',
    equipment: ['Экран 5.5x3м', 'Трибуна', 'Микрофоны', 'Флипчарты'],
    poi: poiMap.get('Конференц_зал 4')
  },
  {
    id: 'zone-12',
    name: 'Лаунж-зона 1',
    color: '#45b7d1',
    position: [-22.792, 0.066, -7.632],
    description: 'Неформальное пространство для нетворкинга, неспешных бесед, работы.',
    type: 'lounge',
    floor: '2 этаж',
    equipment: ['Диваны', 'Кресла', 'Яндекс.Станция Алиса'],
    poi: poiMap.get('Лайндж_зона_1')
  },
  {
    id: 'zone-13',
    name: 'Лаунж-зона 2',
    color: '#4ecdc4',
    position: [-24.793, 0.068, 11.824],
    description: 'Неформальное пространство для нетворкинга, неспешных бесед, работы.',
    type: 'lounge',
    floor: '2 этаж',
    equipment: ['Диваны', 'Зарядные стойки', 'Кофейные столики'],
    poi: poiMap.get('Лайндж_зона_2')
  },
  {
    id: 'zone-14',
    name: 'Овальный зал',
    color: '#cc6600',
    position: [-62.340, 0.019, 12.455],
    description: 'Динамичные обсуждения с модератором и экспертами.',
    type: 'conference',
    capacity: 100,
    floor: '1 этаж, отдельный кластер',
    equipment: ['Стулья амфитеатром', 'Демонстрационные экраны'],
    poi: poiMap.get('Овальный зал')
  },
  {
    id: 'zone-15',
    name: 'Переговорная 1',
    color: '#8e44ad',
    position: [-70.673, 0.019, -14.370],
    description: 'Быстрые деловые встречи, интервью, рабочие созвоны.',
    type: 'conference',
    floor: '1 этаж, у залов',
    equipment: ['Стол', '6 стульев', 'Монитор'],
    poi: poiMap.get('Переговорная_1')
  },
  {
    id: 'zone-16',
    name: 'Переговорная 2',
    color: '#9b59b6',
    position: [-64.919, 0.019, -15.099],
    description: 'Быстрые деловые встречи, интервью, рабочие созвоны.',
    type: 'conference',
    floor: '1 этаж, у залов',
    equipment: ['Стол', '4 стула', 'Монитор'],
    poi: poiMap.get('Переговорная_2')
  },
  {
    id: 'zone-17',
    name: 'Экспозиция',
    color: '#cc0066',
    position: [-29.288, 0.119, 2.094],
    description: 'Выставка компаний-партнеров. Демонстрация продуктов, услуг, B2B-коммуникация.',
    type: 'exhibition',
    floor: '1 этаж, по периметру',
    equipment: ['Стенды 30-50 кв.м', 'Демо-зоны', 'Переговорные'],
    poi: poiMap.get('Стенд_спонсора')
  },
  {
    id: 'zone-18',
    name: 'Фойе',
    color: '#33cccc',
    position: [-87.889, 0.019, 1.460],
    description: 'Пространство для встреч и ожидания.',
    type: 'lounge',
    floor: '1 этаж',
    poi: poiMap.get('Фойе')
  },
  {
    id: 'zone-19',
    name: 'Фото-зона',
    color: '#ff69b4',
    position: [2.896, 0.348, 1.442],
    description: 'Место для памятных фотографий участников форума.',
    type: 'other',
    floor: '1 этаж',
    equipment: ['Арт-инсталляция', 'Проф. свет'],
    poi: poiMap.get('Фото_зона')
  }
]

const now = new Date()
const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

export const events: Event[] = [
  {
    id: 'event-1',
    title: 'Открытие форума',
    description: 'Торжественное открытие Московского Финансового Форума',
    zoneId: 'zone-6',
    startTime: new Date(today.getTime() + 9 * 3600000),
    endTime: new Date(today.getTime() + 10 * 3600000),
    status: 'upcoming',
    tags: ['пленарная', 'открытие'],
    speakers: ['Иванов И.И.', 'Петрова А.С.'],
    capacity: 500
  },
  {
    id: 'event-2',
    title: 'Цифровизация банковского сектора',
    description: 'Обсуждение трендов цифровой трансформации',
    zoneId: 'zone-9',
    startTime: new Date(today.getTime() + 10.5 * 3600000),
    endTime: new Date(today.getTime() + 12 * 3600000),
    status: 'upcoming',
    tags: ['цифровизация', 'банки'],
    speakers: ['Сидоров П.К.'],
    capacity: 150
  },
  {
    id: 'event-3',
    title: 'ESG и устойчивое развитие',
    description: 'Экологические и социальные аспекты финансов',
    zoneId: 'zone-8',
    startTime: new Date(today.getTime() + 10.5 * 3600000),
    endTime: new Date(today.getTime() + 12 * 3600000),
    status: 'upcoming',
    tags: ['ESG', 'устойчивость'],
    speakers: ['Кузнецова М.В.'],
    capacity: 150
  },
  {
    id: 'event-4',
    title: 'Кофе-брейк',
    description: 'Перерыв на кофе и нетворкинг',
    zoneId: 'zone-13',
    startTime: new Date(today.getTime() + 12 * 3600000),
    endTime: new Date(today.getTime() + 13 * 3600000),
    status: 'upcoming',
    tags: ['перерыв', 'нетворкинг']
  },
  {
    id: 'event-5',
    title: 'Инвестиции в инновации',
    description: 'Венчурные инвестиции и стартапы',
    zoneId: 'zone-10',
    startTime: new Date(today.getTime() + 13 * 3600000),
    endTime: new Date(today.getTime() + 14.5 * 3600000),
    status: 'upcoming',
    tags: ['инвестиции', 'стартапы'],
    speakers: ['Петров А.А.'],
    capacity: 150
  },
  {
    id: 'event-6',
    title: 'Криптовалюты и регулирование',
    description: 'Правовые аспекты цифровых активов',
    zoneId: 'zone-11',
    startTime: new Date(today.getTime() + 13 * 3600000),
    endTime: new Date(today.getTime() + 14.5 * 3600000),
    status: 'upcoming',
    tags: ['крипто', 'регулирование'],
    speakers: ['Смирнова О.П.'],
    capacity: 150
  },
  {
    id: 'event-7',
    title: 'Панельная дискуссия: Будущее финансов',
    description: 'Обсуждение ключевых трендов финансовой индустрии',
    zoneId: 'zone-14',
    startTime: new Date(today.getTime() + 14.5 * 3600000),
    endTime: new Date(today.getTime() + 15.5 * 3600000),
    status: 'upcoming',
    tags: ['панельная', 'дискуссия'],
    speakers: ['Иванов И.И.', 'Петрова А.С.', 'Сидоров П.К.'],
    capacity: 200
  },
  {
    id: 'event-8',
    title: 'Закрытие форума',
    description: 'Подведение итогов и награждение',
    zoneId: 'zone-6',
    startTime: new Date(today.getTime() + 16 * 3600000),
    endTime: new Date(today.getTime() + 17 * 3600000),
    status: 'upcoming',
    tags: ['пленарная', 'закрытие'],
    capacity: 500
  }
]

export const friends: Friend[] = [
  {
    id: 'friend-1',
    name: 'Алексей Смирнов',
    location: {
      position: [-43.756, 0, -14.4],
      rotation: 0,
      timestamp: new Date()
    },
    isOnline: true
  },
  {
    id: 'friend-2',
    name: 'Мария Кузнецова',
    location: {
      position: [27.267, 0, -1.781],
      rotation: Math.PI / 2,
      timestamp: new Date()
    },
    isOnline: true
  },
  {
    id: 'friend-3',
    name: 'Дмитрий Попов',
    location: {
      position: [-22.993, 0, 7.124],
      rotation: 0,
      timestamp: new Date()
    },
    isOnline: true
  },
  {
    id: 'friend-4',
    name: 'Елена Волкова',
    location: {
      position: [-63.34, 0, -12.545],
      rotation: Math.PI,
      timestamp: new Date(Date.now() - 300000)
    },
    isOnline: false
  }
]

export const poisData = pois

export interface WeatherData {
  temperature: number
  humidity: number
  precipitation: number
  windSpeed: number
  condition: 'sunny' | 'cloudy' | 'rainy' | 'stormy' | 'partly-cloudy'
  uvIndex: number
  pressure: number
  timestamp: Date
}

export interface ForecastDay {
  date: Date
  high: number
  low: number
  precipitation: number
  condition: WeatherData['condition']
  humidity: number
}

export interface Alert {
  id: string
  type: 'frost' | 'drought' | 'rain' | 'pest' | 'disease' | 'harvest'
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  description: string
  timestamp: Date
  isRead: boolean
}

export interface Recommendation {
  id: string
  category: 'irrigation' | 'fertilization' | 'pest-control' | 'harvest' | 'pruning' | 'general'
  title: string
  description: string
  priority: 'low' | 'medium' | 'high'
  weatherBased: boolean
  icon: string
}

export interface FarmPlot {
  id: string
  name: string
  altitude: number
  area: number
  coffeeVariety: string
  plantAge: number
  lastHarvest?: Date
}

export interface UserPreferences {
  notifications: boolean
  alertTypes: Alert['type'][]
  temperatureUnit: 'celsius' | 'fahrenheit'
  language: 'es' | 'en'
}

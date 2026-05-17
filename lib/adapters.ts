/**
 * Adaptadores: convierte los datos del backend al formato que esperan los componentes del front
 */
import type { AlertaAPI, RecomendacionAPI, ClimaResponse, PronosticoResponse } from './api'
import type { WeatherData, Alert, Recommendation, ForecastDay } from './types'

// ─── Código de clima Open-Meteo → condición del front ────────────────────────

function codigoACondicion(codigo: number | undefined): WeatherData['condition'] {
  if (codigo === undefined || codigo === null) return 'partly-cloudy'
  if ([0].includes(codigo)) return 'sunny'
  if ([1, 2].includes(codigo)) return 'partly-cloudy'
  if ([3, 45, 48].includes(codigo)) return 'cloudy'
  if ([51, 53, 55, 61, 63, 80, 81].includes(codigo)) return 'rainy'
  if ([65, 82, 95, 96, 99].includes(codigo)) return 'stormy'
  return 'partly-cloudy'
}

// ─── Clima actual ─────────────────────────────────────────────────────────────

export function adaptarClima(data: ClimaResponse): WeatherData {
  if (!data || !data.clima) {
    return {
      temperature: 0, humidity: 0, precipitation: 0, windSpeed: 0,
      condition: 'partly-cloudy', uvIndex: 0, pressure: 1013,
      timestamp: new Date()
    }
  }
  const { clima, consultado_en } = data

  // Intentar usar consultado_en para mostrar la hora exacta del refresco
  let ts = new Date()
  if (consultado_en) {
    const d = new Date(consultado_en)
    if (!isNaN(d.getTime())) ts = d
  } else if (clima.timestamp) {
    const d = new Date(clima.timestamp)
    if (!isNaN(d.getTime())) ts = d
  }

  return {
    temperature: Math.round(clima.temperatura || 0),
    humidity: Math.round(clima.humedad || 0),
    precipitation: Math.round(clima.lluvia || 0),
    windSpeed: Math.round(clima.viento || 0),
    condition: codigoACondicion(clima.codigoClima),
    uvIndex: 0,
    pressure: 1013,
    timestamp: ts,
  }
}

// ─── Alertas ─────────────────────────────────────────────────────────────────

function nivelASeverity(nivel: AlertaAPI['nivel']): Alert['severity'] {
  if (nivel === 'critico') return 'critical'
  if (nivel === 'advertencia') return 'high'
  return 'low'
}

function tipoAType(tipo: string): Alert['type'] {
  const t = (tipo || '').toLowerCase()
  if (t === 'helada') return 'frost'
  if (t === 'sequia') return 'drought'
  if (t.includes('lluvia')) return 'rain'
  if (t === 'roya' || t.includes('plaga')) return 'disease'
  if (t === 'monitoreo' || t.includes('cosecha')) return 'harvest'
  return 'rain'
}

function extraerTitulo(mensaje: string = ''): { title: string; description: string } {
  const msg = mensaje || ''
  const match = msg.match(/^\[(.+?)\]\s*(.+)$/)
  if (match) return { title: match[1], description: match[2] }
  return { title: msg.split('.')[0] || msg || 'Alerta Climática', description: msg }
}

export function adaptarAlertas(alertasAPI: AlertaAPI[] = []): Alert[] {
  if (!alertasAPI || !Array.isArray(alertasAPI)) return []
  return alertasAPI.map((a) => {
    const { title, description } = extraerTitulo(a.mensaje)
    return {
      id: a.id || Math.random().toString(),
      type: tipoAType(a.tipo_alerta),
      severity: nivelASeverity(a.nivel),
      title,
      description,
      timestamp: a.creada_en ? new Date(a.creada_en) : new Date(),
      isRead: false,
    }
  })
}

// ─── Recomendaciones ─────────────────────────────────────────────────────────

function tipoACategory(tipo: string): Recommendation['category'] {
  const t = (tipo || '').toLowerCase()
  if (t === 'riego') return 'irrigation'
  if (t === 'fertilizacion') return 'fertilization'
  if (t === 'fungicida' || t === 'roya' || t.includes('plaga')) return 'pest-control'
  if (t === 'cosecha') return 'harvest'
  if (t === 'poda') return 'pruning'
  return 'general'
}

function prioridadAFront(p: RecomendacionAPI['prioridad']): Recommendation['priority'] {
  if (p === 'urgente' || p === 'alta') return 'high'
  if (p === 'normal') return 'medium'
  return 'low'
}

function tipoAIcon(tipo: string): string {
  const t = (tipo || '').toLowerCase()
  if (t === 'riego' || t === 'sequia') return 'droplets'
  if (t === 'fungicida' || t === 'roya') return 'bug'
  if (t === 'fertilizacion') return 'leaf'
  if (t === 'cosecha') return 'coffee'
  return 'waves'
}

export function adaptarRecomendaciones(recs: RecomendacionAPI[] = []): Recommendation[] {
  if (!recs || !Array.isArray(recs)) return []
  return recs.map((r) => ({
    id: r.id || Math.random().toString(),
    category: tipoACategory(r.tipo),
    title: r.titulo || 'Recomendación',
    description: r.descripcion_ia || r.descripcion || '',
    priority: prioridadAFront(r.prioridad),
    weatherBased: true,
    icon: tipoAIcon(r.tipo),
  }))
}

// ─── Pronóstico 7 días ────────────────────────────────────────────────────────

export function adaptarPronostico(data: PronosticoResponse): ForecastDay[] {
  if (!data || !data.pronostico || !Array.isArray(data.pronostico)) return []
  return data.pronostico.map((d) => ({
    date: d.fecha ? new Date(d.fecha + 'T12:00:00') : new Date(),
    high: Math.round(d.temp_max || 0),
    low: Math.round(d.temp_min || 0),
    precipitation: d.prob_lluvia ?? Math.min(100, Math.round((d.lluvia_total || 0) * 3)),
    condition: codigoACondicion(d.codigoClima),
    humidity: Math.round(((d.humedad_max || 70) + (d.humedad_min || 50)) / 2),
  }))
}

// ─── Pronóstico horario ───────────────────────────────────────────────────────

export function adaptarHorario(data: PronosticoResponse) {
  if (!data || !data.pronosticoHorario || !Array.isArray(data.pronosticoHorario)) return []
  return data.pronosticoHorario.map((h) => ({
    hour: h.hour || 0,
    temperature: h.temperature || 0,
    precipitation: h.precipitation || 0,
    humidity: h.humidity || 0,
  }))
}

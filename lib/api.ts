import { Platform } from 'react-native'

/**
 * CafeClima — Cliente API
 * Conecta con el backend Node.js/Express
 *
 * En desarrollo con emulador Android: usa 10.0.2.2
 * En desarrollo con celular físico:   usa la IP local del PC (ej: 192.168.1.X)
 * En desarrollo web:                  usa localhost
 * En producción:                       usa la URL del servidor desplegado
 */

// ← Cambia esto según tu entorno
const BASE_URL = Platform.select({
  android: 'http://10.0.2.2:3000/api',
  ios: 'http://localhost:3000/api',
  web: 'http://localhost:3000/api',
  default: 'http://localhost:3000/api',
})

// ─── HELPERS ──────────────────────────────────────────────────────────────────

let _token: string | null = null

export function setToken(token: string | null) {
  _token = token
  if (!token && Platform.OS === 'web') {
    // Limpiar almacenamiento local en web si es necesario
    try {
      localStorage.removeItem('cafeclima_token')
    } catch (e) {}
  }
}

export function getToken() {
  return _token
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  if (_token) {
    headers['Authorization'] = `Bearer ${_token}`
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: { ...headers, ...(options.headers as Record<string, string> || {}) },
  })

  const data = await res.json()

  if (!res.ok) {
    throw new Error(data.error || `Error ${res.status}`)
  }

  return data as T
}

// ─── AUTH ──────────────────────────────────────────────────────────────────────

export interface LoginResponse {
  token: string
  refresh_token: string
  usuario: {
    id: string
    correo: string
    perfil: { nombre: string; telefono?: string; municipio?: string } | null
  }
}

export interface RegisterResponse {
  mensaje: string
  usuario: {
    id: string
    correo: string
    perfil: { nombre: string } | null
  }
}

export const auth = {
  login: (correo: string, contrasena: string) =>
    request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ correo, contrasena }),
    }),

  registro: (nombre: string, correo: string, contrasena: string) =>
    request<RegisterResponse>('/auth/registro', {
      method: 'POST',
      body: JSON.stringify({ nombre, correo, contrasena }),
    }),

  perfil: () => request<{ usuario: any }>('/auth/perfil'),

  actualizarPerfil: (data: { nombre?: string; telefono?: string; municipio?: string }) =>
    request<{ usuario: any }>('/auth/perfil', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  logout: () => request<{ mensaje: string }>('/auth/logout', { method: 'POST' }),
}

// ─── FINCAS ───────────────────────────────────────────────────────────────────

export interface Finca {
  id: string
  nombre: string
  latitud: number
  longitud: number
  altitud_msnm?: number
  hectareas?: number
  variedad_cafe?: string
  creada_en: string
}

export const fincas = {
  listar: () => request<{ fincas: Finca[] }>('/fincas'),

  crear: (data: {
    nombre: string
    latitud: number
    longitud: number
    altitud_msnm?: number
    hectareas?: number
    variedad_cafe?: string
  }) =>
    request<{ finca: Finca }>('/fincas', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  editar: (id: string, data: Partial<Omit<Finca, 'id' | 'creada_en'>>) =>
    request<{ finca: Finca }>(`/fincas/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  eliminar: (id: string) =>
    request<{ mensaje: string }>(`/fincas/${id}`, { method: 'DELETE' }),
}

// ─── CLIMA ────────────────────────────────────────────────────────────────────

export interface ClimaResponse {
  finca: { id: string; nombre: string; variedad_cafe: string; altitud_msnm: number; municipio: string }
  clima: {
    temperatura: number
    sensacion_termica: number
    humedad: number
    lluvia: number
    viento: number
    rafagas: number
    codigoClima: number
    nubosidad: number
    timestamp: string
  }
  alertas: AlertaAPI[]
  alertasPredichas: AlertaAPI[]
  recomendaciones: RecomendacionAPI[]
  recomendacionesPreventivas: RecomendacionAPI[]
  consultado_en: string
}

export interface AlertaAPI {
  id: string
  finca_id: string
  tipo_alerta: string
  nivel: 'critico' | 'advertencia' | 'informativo'
  mensaje: string
  activa: boolean
  creada_en: string
  resuelta_en?: string
  fecha_predicha?: string
  condicion?: string
}

export interface RecomendacionAPI {
  id: string
  finca_id: string
  tipo: string
  prioridad: 'urgente' | 'alta' | 'normal' | 'info'
  titulo: string
  descripcion: string
  descripcion_ia?: string
  leida: boolean
  aplicada: boolean
  es_prediccion: boolean
  creada_en: string
}

export interface PronosticoResponse {
  finca: { id: string; nombre: string }
  pronostico: {
    fecha: string
    temp_max: number
    temp_min: number
    lluvia_total: number
    prob_lluvia?: number
    viento_max: number
    rafagas_max?: number
    codigoClima?: number
    humedad_max?: number
    humedad_min?: number
  }[]
  pronosticoHorario: {
    time: string
    hour: number
    temperature: number
    precipitation: number
    humidity: number
    codigoClima?: number
    viento: number
  }[]
  alertasPredichas: AlertaAPI[]
  recomendacionesPreventivas: RecomendacionAPI[]
}

export const clima = {
  consultar: (fincaId: string, refresh = false) =>
    request<ClimaResponse>(`/clima/${fincaId}?t=${Date.now()}${refresh ? '&refresh=true' : ''}`),

  historial: (fincaId: string) =>
    request<{ historial: any[] }>(`/clima/${fincaId}/historial`),

  pronostico: (fincaId: string) =>
    request<PronosticoResponse>(`/clima/${fincaId}/pronostico?t=${Date.now()}`),
}

// ─── ALERTAS ──────────────────────────────────────────────────────────────────

export const alertas = {
  listar: (fincaId: string, soloActivas = true) =>
    request<{ alertas: AlertaAPI[] }>(
      `/alertas/${fincaId}${soloActivas ? '' : '?activas=false'}`
    ),

  resolver: (alertaId: string) =>
    request<{ alerta: AlertaAPI }>(`/alertas/${alertaId}/resolver`, {
      method: 'PATCH',
    }),
}

// ─── RECOMENDACIONES ──────────────────────────────────────────────────────────

export const recomendaciones = {
  listar: (fincaId: string) =>
    request<{ recomendaciones: RecomendacionAPI[] }>(`/recomendaciones/${fincaId}`),

  marcarLeida: (recId: string) =>
    request<{ recomendacion: RecomendacionAPI }>(`/recomendaciones/${recId}/leer`, {
      method: 'PATCH',
    }),

  marcarAplicada: (recId: string) =>
    request<{ recomendacion: RecomendacionAPI }>(`/recomendaciones/${recId}/aplicar`, {
      method: 'PATCH',
    }),
}

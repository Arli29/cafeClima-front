/**
 * Estado global de la app — sin librerías externas, solo React Context
 * Guarda: sesión del usuario, finca activa, datos de clima
 */
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { setToken, auth } from './api'
import type { Finca, ClimaResponse, PronosticoResponse } from './api'
import { Platform } from 'react-native'

interface AppState {
  // Auth
  token: string | null
  usuario: { id: string; correo: string; nombre: string } | null
  // Finca
  fincaActiva: Finca | null
  // Datos cargados
  climaData: ClimaResponse | null
  pronosticoData: PronosticoResponse | null
  // UI
  isLoadingClima: boolean
  errorClima: string | null
}

interface AppActions {
  login: (token: string, usuario: AppState['usuario']) => void
  logout: () => Promise<void>
  updateUsuario: (usuario: AppState['usuario']) => void
  setFincaActiva: (finca: Finca | null) => void
  setClimaData: (data: ClimaResponse | null) => void
  setPronosticoData: (data: PronosticoResponse | null) => void
  setLoadingClima: (v: boolean) => void
  setErrorClima: (e: string | null) => void
}

const AppContext = createContext<(AppState & AppActions) | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  // Inicialización síncrona para evitar parpadeos o bloqueos
  const [state, setState] = useState<AppState>(() => {
    let token = null
    let usuario = null

    if (Platform.OS === 'web') {
      try {
        token = localStorage.getItem('cafeclima_token')
        const savedUser = localStorage.getItem('cafeclima_user')
        if (savedUser) usuario = JSON.parse(savedUser)
      } catch (e) {}
    }

    if (token) setToken(token)

    return {
      token,
      usuario,
      fincaActiva: null,
      climaData: null,
      pronosticoData: null,
      isLoadingClima: false,
      errorClima: null,
    }
  })

  const login = useCallback((token: string, usuario: AppState['usuario']) => {
    setToken(token)
    if (Platform.OS === 'web') {
      try {
        localStorage.setItem('cafeclima_token', token)
        localStorage.setItem('cafeclima_user', JSON.stringify(usuario))
      } catch (e) {}
    }
    setState((s) => ({ ...s, token, usuario }))
  }, [])

  const logout = useCallback(async () => {
    // 1. Intentar avisar al backend
    try {
      await auth.logout()
    } catch (e) {}

    // 2. Limpiar almacenamiento
    setToken(null)
    if (Platform.OS === 'web') {
      try {
        localStorage.removeItem('cafeclima_token')
        localStorage.removeItem('cafeclima_user')
        // En web, la forma más segura de limpiar TODO es recargar
        window.location.href = '/'
        return // La página se recargará, no hace falta seguir
      } catch (e) {}
    }

    // 3. Resetear estado (para mobile)
    setState({
      token: null,
      usuario: null,
      fincaActiva: null,
      climaData: null,
      pronosticoData: null,
      isLoadingClima: false,
      errorClima: null,
    })
  }, [])

  const updateUsuario = useCallback((usuario: AppState['usuario']) => {
    if (Platform.OS === 'web' && usuario) {
      try {
        localStorage.setItem('cafeclima_user', JSON.stringify(usuario))
      } catch (e) {}
    }
    setState((s) => ({ ...s, usuario }))
  }, [])

  const setFincaActiva = useCallback((finca: Finca | null) => {
    setState((s) => ({ ...s, fincaActiva: finca, climaData: null, pronosticoData: null }))
  }, [])

  const setClimaData = useCallback((data: ClimaResponse | null) => {
    setState((s) => ({ ...s, climaData: data }))
  }, [])

  const setPronosticoData = useCallback((data: PronosticoResponse | null) => {
    setState((s) => ({ ...s, pronosticoData: data }))
  }, [])

  const setLoadingClima = useCallback((v: boolean) => {
    setState((s) => ({ ...s, isLoadingClima: v }))
  }, [])

  const setErrorClima = useCallback((e: string | null) => {
    setState((s) => ({ ...s, errorClima: e }))
  }, [])

  return (
    <AppContext.Provider value={{ ...state, login, logout, updateUsuario, setFincaActiva, setClimaData, setPronosticoData, setLoadingClima, setErrorClima }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp debe usarse dentro de AppProvider')
  return ctx
}

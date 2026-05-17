/**
 * Estado global de la app — sin librerías externas, solo React Context
 * Guarda: sesión del usuario, finca activa, datos de clima
 */
import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react'
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
  isInitialized: boolean
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
  const [state, setState] = useState<AppState>({
    token: null,
    usuario: null,
    fincaActiva: null,
    climaData: null,
    pronosticoData: null,
    isLoadingClima: false,
    errorClima: null,
    isInitialized: false,
  })

  // Al cargar la app, intentar recuperar el token de localStorage (Web)
  useEffect(() => {
    if (Platform.OS === 'web') {
      try {
        const savedToken = localStorage.getItem('cafeclima_token')
        const savedUser = localStorage.getItem('cafeclima_user')
        if (savedToken && savedUser) {
          const user = JSON.parse(savedUser)
          setToken(savedToken)
          setState(s => ({ ...s, token: savedToken, usuario: user, isInitialized: true }))
        } else {
          setState(s => ({ ...s, isInitialized: true }))
        }
      } catch (e) {
        setState(s => ({ ...s, isInitialized: true }))
      }
    } else {
      setState(s => ({ ...s, isInitialized: true }))
    }
  }, [])

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
    // Intentar avisar al backend (opcional, no bloqueante)
    try {
      if (state.token) {
        await auth.logout()
      }
    } catch (e) {
      console.warn('[Store] Logout endpoint error:', e)
    }

    // Limpiar siempre localmente
    setToken(null)
    if (Platform.OS === 'web') {
      try {
        localStorage.removeItem('cafeclima_token')
        localStorage.removeItem('cafeclima_user')
        // Forzar recarga en web para limpiar cache y sockets si los hubiera
        window.location.href = '/'
      } catch (e) {}
    }

    setState({
      token: null,
      usuario: null,
      fincaActiva: null,
      climaData: null,
      pronosticoData: null,
      isLoadingClima: false,
      errorClima: null,
      isInitialized: true,
    })
  }, [state.token])

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

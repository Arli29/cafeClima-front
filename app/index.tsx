import React, { useState, useEffect, useCallback, useRef } from 'react'
import { View, StyleSheet, SafeAreaView, ActivityIndicator, Text } from 'react-native'
import { AuthScreen } from '@/components/AuthScreen'
import { HomeTab } from '@/components/HomeTab'
import { ForecastTab } from '@/components/ForecastTab'
import { FarmTab } from '@/components/FarmTab'
import { AlertsTab } from '@/components/AlertsTab'
import { SettingsTab } from '@/components/SettingsTab'
import { BottomNavigation, TabType } from '@/components/BottomNavigation'
import { AppHeader } from '@/components/AppHeader'
import { AlertDetailModal } from '@/components/AlertDetailModal'
import { RecommendationDetailModal } from '@/components/RecommendationDetailModal'
import { AppAlert } from '@/components/AppAlert'
import { useApp } from '@/lib/store'
import {
  fincas as fincasApi,
  clima as climaApi,
  alertas as alertasApi,
  recomendaciones as recsApi
} from '@/lib/api'
import {
  adaptarClima, adaptarAlertas, adaptarRecomendaciones,
  adaptarPronostico, adaptarHorario,
} from '@/lib/adapters'
import type { Alert, WeatherData, ForecastDay, Recommendation } from '@/lib/types'
import type { Finca } from '@/lib/api'
import { colors } from '@/lib/theme'

export default function App() {
  const {
    token, usuario, logout, isInitialized,
    fincaActiva, setFincaActiva,
    climaData, setClimaData,
    pronosticoData, setPronosticoData,
    isLoadingClima, setLoadingClima,
  } = useApp()

  const isAuthenticated = !!token

  const [activeTab, setActiveTab] = useState<TabType>('home')
  const [isRefreshing, setIsRefreshing] = useState(false)

  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null)
  const [alertModalVisible, setAlertModalVisible] = useState(false)

  const [selectedRec, setSelectedRec] = useState<Recommendation | null>(null)
  const [recModalVisible, setRecModalVisible] = useState(false)

  const [misFincas, setMisFincas] = useState<Finca[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [localRecs, setLocalRecs] = useState<Recommendation[]>([])

  const dismissedItems = useRef<Set<string>>(new Set())

  // ── Cargar fincas al autenticar ──────────────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated) {
      setMisFincas([])
      setAlerts([])
      setLocalRecs([])
      dismissedItems.current.clear()
      return
    }

    fincasApi.listar()
      .then(res => {
        const lista = res.fincas || []
        setMisFincas(lista)
        if (lista.length > 0 && !fincaActiva) {
          setFincaActiva(lista[0])
        }
      })
      .catch(err => {
        // Error silencioso al cargar fincas — se mostrará la pantalla vacía
        console.error('[App] Error cargando fincas:', err)
      })
  }, [isAuthenticated])

  // ── Consultar clima cuando hay finca activa ───────────────────────────────
  const fetchClima = useCallback(async (forceRefresh = false) => {
    if (!fincaActiva || !isAuthenticated) return
    setLoadingClima(true)
    try {
      const [dataClima, dataPronostico] = await Promise.all([
        climaApi.consultar(fincaActiva.id, forceRefresh),
        climaApi.pronostico(fincaActiva.id),
      ])

      setClimaData(dataClima)
      setPronosticoData(dataPronostico)

      const todasAlertasRaw = [
        ...(dataClima?.alertas || []),
        ...(dataClima?.alertasPredichas || []),
      ]
      const alertasFiltradas = adaptarAlertas(todasAlertasRaw).filter(
        a => !dismissedItems.current.has(`alerta:${a.title}:${a.description}`)
      )
      setAlerts(alertasFiltradas)

      const todasRecsRaw = [
        ...(dataClima?.recomendaciones || []),
        ...(dataClima?.recomendacionesPreventivas || []),
      ]
      const recsFiltradas = adaptarRecomendaciones(todasRecsRaw).filter(
        r => !dismissedItems.current.has(`rec:${r.title}`)
      )
      setLocalRecs(recsFiltradas)

    } catch (err: any) {
      console.error('[App] Error cargando clima:', err)

      // Solo mostrar alerta si es un refresh manual, no en carga automática silenciosa
      if (forceRefresh) {
        const msg = err.message?.toLowerCase().includes('network') || err.message?.toLowerCase().includes('connect')
          ? 'No se pudo conectar con el servidor. Verifica tu internet.'
          : 'No se pudieron actualizar los datos climáticos. Intenta de nuevo.'
        AppAlert.alert('Error al actualizar', msg)
      }
    } finally {
      setLoadingClima(false)
    }
  }, [fincaActiva, isAuthenticated])

  useEffect(() => {
    if (fincaActiva && isAuthenticated) fetchClima()
  }, [fincaActiva, isAuthenticated])

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchClima(true)
    setIsRefreshing(false)
  }

  const handleAlertClick = (alert: Alert) => {
    setSelectedAlert(alert)
    setAlertModalVisible(true)
  }

  const handleRecClick = (rec: Recommendation) => {
    setSelectedRec(rec)
    setRecModalVisible(true)
  }

  const handleMarkAlertRead = async (id: string) => {
    const alert = alerts.find(a => a.id === id)
    if (alert) {
      dismissedItems.current.add(`alerta:${alert.title}:${alert.description}`)
      setAlerts(prev => prev.filter(a => a.id !== id))
      try {
        await alertasApi.resolver(id)
      } catch (e) {
        // Silencioso — el dismiss ya se aplicó localmente
      }
    }
  }

  const handleMarkRecDone = async (id: string) => {
    const rec = localRecs.find(r => r.id === id)
    if (rec) {
      dismissedItems.current.add(`rec:${rec.title}`)
      setLocalRecs(prev => prev.filter(r => r.id !== id))
      try {
        await recsApi.marcarAplicada(id)
      } catch (e) {
        // Silencioso
      }
    }
  }

  const handleLogout = async () => {
    await logout()
  }

  const handleFincaCreada = async (finca: Finca) => {
    setMisFincas(prev => [...prev, finca])
    setFincaActiva(finca)
  }

  const handleFincaActualizada = (finca: Finca) => {
    setMisFincas(prev => prev.map(f => f.id === finca.id ? finca : f))
    if (fincaActiva?.id === finca.id) setFincaActiva(finca)
  }

  const handleFincaEliminada = (id: string) => {
    const resto = misFincas.filter(f => f.id !== id)
    setMisFincas(resto)
    if (fincaActiva?.id === id) {
      setFincaActiva(resto[0] ?? null)
      setClimaData(null)
      setPronosticoData(null)
      setAlerts([])
      setLocalRecs([])
    }
  }

  // ── Derivar datos ─────────────────────────────────────────────────────────
  const weather: WeatherData = climaData
    ? adaptarClima(climaData)
    : { temperature: 0, humidity: 0, precipitation: 0, windSpeed: 0, condition: 'partly-cloudy', uvIndex: 0, pressure: 1013, timestamp: new Date() }

  const forecast: ForecastDay[] = pronosticoData ? adaptarPronostico(pronosticoData) : []
  const hourlyData = pronosticoData ? adaptarHorario(pronosticoData) : []

  const unreadAlerts = alerts.length
  const locationName = fincaActiva
    ? `${fincaActiva.nombre} · ${fincaActiva.altitud_msnm ?? '?'} msnm`
    : 'Sierra Nevada, Magdalena'

  // Pantalla de carga inicial
  if (!isInitialized) {
    return (
      <View style={[styles.loadingCenter, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    )
  }

  if (!isAuthenticated) {
    return <AuthScreen onAuthenticated={() => {}} />
  }

  const renderTab = () => {
    switch (activeTab) {
      case 'home':
        return isLoadingClima && !climaData ? (
          <View style={styles.loadingCenter}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Consultando clima de tu finca...</Text>
          </View>
        ) : (
          <HomeTab
            weather={weather}
            forecast={forecast}
            alerts={alerts}
            recommendations={localRecs}
            onAlertClick={handleAlertClick}
            onRecommendationClick={handleRecClick}
            isRefreshing={isRefreshing}
            onRefresh={handleRefresh}
            location={locationName}
          />
        )
      case 'forecast':
        return <ForecastTab forecast={forecast} hourlyData={hourlyData} />
      case 'farm':
        return (
          <FarmTab
            fincas={misFincas}
            fincaActiva={fincaActiva}
            recommendations={localRecs}
            onFincaCreada={handleFincaCreada}
            onFincaActualizada={handleFincaActualizada}
            onFincaEliminada={handleFincaEliminada}
            onFincaSeleccionada={setFincaActiva}
          />
        )
      case 'alerts':
        return <AlertsTab initialAlerts={alerts} />
      case 'settings':
        return <SettingsTab onLogout={handleLogout} usuario={usuario} />
      default:
        return null
    }
  }

  return (
    <SafeAreaView style={styles.root}>
      <AppHeader activeTab={activeTab} isRefreshing={isRefreshing} onRefresh={handleRefresh} />
      <View style={styles.content}>{renderTab()}</View>
      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} alertCount={unreadAlerts} />

      <AlertDetailModal
        alert={selectedAlert}
        visible={alertModalVisible}
        onClose={() => setAlertModalVisible(false)}
        onMarkAsRead={handleMarkAlertRead}
      />

      <RecommendationDetailModal
        recommendation={selectedRec}
        visible={recModalVisible}
        onClose={() => setRecModalVisible(false)}
        onMarkAsDone={handleMarkRecDone}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1 },
  loadingCenter: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { fontSize: 14, color: colors.mutedForeground },
})

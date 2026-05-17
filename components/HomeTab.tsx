import React from 'react'
import { ScrollView, StyleSheet, RefreshControl } from 'react-native'
import { CurrentWeather } from './CurrentWeather'
import { WeeklyForecast } from './WeeklyForecast'
import { AlertsList } from './AlertsList'
import { RecommendationsList } from './RecommendationsList'
import type { WeatherData, ForecastDay, Alert, Recommendation } from '@/lib/types'
import { colors, spacing } from '@/lib/theme'

interface Props {
  weather: WeatherData
  forecast: ForecastDay[]
  alerts: Alert[]
  recommendations: Recommendation[]
  onAlertClick: (alert: Alert) => void
  onRecommendationClick: (rec: Recommendation) => void
  isRefreshing: boolean
  onRefresh: () => void
  location: string
}

export function HomeTab({
  weather, forecast, alerts, recommendations,
  onAlertClick, onRecommendationClick,
  isRefreshing, onRefresh, location
}: Props) {
  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={onRefresh}
          tintColor={colors.primary}
          colors={[colors.primary]}
        />
      }
    >
      <CurrentWeather weather={weather} location={location} />
      <WeeklyForecast forecast={forecast} />
      <AlertsList alerts={alerts} onAlertClick={onAlertClick} />
      <RecommendationsList
        recommendations={recommendations}
        onRecommendationClick={onRecommendationClick}
      />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.xl, gap: spacing.xl, paddingBottom: 32 },
})

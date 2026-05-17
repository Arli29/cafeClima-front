import React from 'react'
import { ScrollView, View, Text, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import type { ForecastDay } from '@/lib/types'
import { colors, spacing, radius, fontSize } from '@/lib/theme'

interface Props {
  forecast: ForecastDay[]
  hourlyData: { hour: number; temperature: number; precipitation: number; humidity: number }[]
}

const conditionIcons: Record<string, string> = {
  sunny: 'sunny',
  cloudy: 'cloud',
  rainy: 'rainy',
  stormy: 'thunderstorm',
  'partly-cloudy': 'partly-sunny',
}
const conditionLabels: Record<string, string> = {
  sunny: 'Soleado',
  cloudy: 'Nublado',
  rainy: 'Lluvioso',
  stormy: 'Tormentoso',
  'partly-cloudy': 'Parcialmente nublado',
}
const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

export function ForecastTab({ forecast, hourlyData }: Props) {
  const currentHour = new Date().getHours()
  const next12 = hourlyData.slice(currentHour, currentHour + 12)

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Hourly */}
      <Text style={styles.sectionTitle}>Próximas 12 horas</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hourlyScroll}>
        {next12.map((item, i) => {
          const displayHour = (currentHour + i) % 24
          const isNow = i === 0
          return (
            <View key={i} style={[styles.hourCard, isNow && styles.hourCardActive]}>
              <Text style={[styles.hourLabel, isNow && styles.hourLabelActive]}>
                {isNow ? 'Ahora' : `${displayHour}:00`}
              </Text>
              <Ionicons name="thermometer-outline" size={22} color={isNow ? colors.primary : colors.foreground} style={{ marginVertical: 6 }} />
              <Text style={[styles.hourTemp, isNow && styles.hourTempActive]}>{Math.round(item.temperature)}°</Text>
              {item.precipitation > 5 && (
                <View style={styles.hourRain}>
                  <Ionicons name="water" size={10} color={colors.rain} />
                  <Text style={styles.hourRainText}>{Math.round(item.precipitation)}%</Text>
                </View>
              )}
            </View>
          )
        })}
      </ScrollView>

      {/* Extended */}
      <Text style={[styles.sectionTitle, { marginTop: spacing.md }]}>Pronóstico extendido</Text>
      <View style={styles.extCard}>
        {forecast.map((day, i) => {
          const isToday = i === 0
          const dayName = isToday ? 'Hoy' : dayNames[day.date.getDay()]
          const dateStr = `${day.date.getDate()} ${monthNames[day.date.getMonth()]}`
          return (
            <View key={i} style={[styles.extRow, i > 0 && styles.extRowBorder]}>
              <View style={styles.extDayCol}>
                <Text style={[styles.extDayName, isToday && styles.extDayNameActive]}>{dayName}</Text>
                <Text style={styles.extDate}>{dateStr}</Text>
              </View>
              <View style={styles.extIconCol}>
                <Ionicons name={conditionIcons[day.condition] as any} size={22} color={isToday ? colors.primary : colors.foreground} />
              </View>
              <View style={styles.extRainCol}>
                <Ionicons name="water" size={14} color={colors.rain} />
                <Text style={styles.extRainText}>{day.precipitation}%</Text>
              </View>
              <View style={styles.extTempCol}>
                <Text style={styles.extHigh}>{day.high}°</Text>
                <Text style={styles.extLow}>{day.low}°</Text>
              </View>
            </View>
          )
        })}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.xl, paddingBottom: 32 },
  sectionTitle: { fontSize: fontSize.lg, fontWeight: '600', color: colors.foreground, marginBottom: spacing.md },
  hourlyScroll: { marginHorizontal: -spacing.xl, paddingHorizontal: spacing.xl },
  hourCard: {
    width: 68,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.md,
    alignItems: 'center',
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  hourCardActive: {
    backgroundColor: `${colors.primary}12`,
    borderColor: `${colors.primary}40`,
  },
  hourLabel: { fontSize: fontSize.xs, fontWeight: '500', color: colors.mutedForeground },
  hourLabelActive: { color: colors.primary },
  hourTemp: { fontSize: fontSize.sm, fontWeight: '600', color: colors.foreground },
  hourTempActive: { color: colors.primary },
  hourRain: { flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: 3 },
  hourRainText: { fontSize: 10, color: colors.rain },
  extCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    overflow: 'hidden',
  },
  extRow: { flexDirection: 'row', alignItems: 'center', padding: spacing.md },
  extRowBorder: { borderTopWidth: 1, borderTopColor: colors.border },
  extDayCol: { width: 90 },
  extDayName: { fontSize: fontSize.base, fontWeight: '500', color: colors.foreground },
  extDayNameActive: { color: colors.primary },
  extDate: { fontSize: fontSize.xs, color: colors.mutedForeground },
  extIconCol: { flex: 1, alignItems: 'center' },
  extRainCol: { flexDirection: 'row', alignItems: 'center', gap: 2, width: 50 },
  extRainText: { fontSize: fontSize.sm, color: colors.rain },
  extTempCol: { flexDirection: 'row', gap: 8, width: 60, justifyContent: 'flex-end' },
  extHigh: { fontSize: fontSize.base, fontWeight: '700', color: colors.foreground },
  extLow: { fontSize: fontSize.base, color: colors.mutedForeground },
})

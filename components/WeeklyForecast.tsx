import React from 'react'
import { View, Text, ScrollView, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import type { ForecastDay } from '@/lib/types'
import { colors, spacing, radius, fontSize } from '@/lib/theme'

interface Props {
  forecast: ForecastDay[]
}

const conditionIcons: Record<string, string> = {
  sunny: 'sunny',
  cloudy: 'cloud',
  rainy: 'rainy',
  stormy: 'thunderstorm',
  'partly-cloudy': 'partly-sunny',
}

const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

export function WeeklyForecast({ forecast }: Props) {
  return (
    <View>
      <Text style={styles.sectionTitle}>Pronóstico semanal</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll}>
        {forecast.map((day, i) => {
          const isToday = i === 0
          const dayName = isToday ? 'Hoy' : dayNames[day.date.getDay()]

          return (
            <View key={i} style={[styles.card, isToday && styles.cardActive]}>
              <Text style={[styles.dayName, isToday && styles.dayNameActive]}>{dayName}</Text>
              <Ionicons
                name={conditionIcons[day.condition] as any}
                size={24}
                color={isToday ? colors.primary : colors.foreground}
                style={styles.icon}
              />
              <Text style={[styles.high, isToday && styles.highActive]}>{day.high}°</Text>
              <Text style={styles.low}>{day.low}°</Text>
              {day.precipitation > 0 && (
                <View style={styles.rainRow}>
                  <Ionicons name="water" size={10} color={colors.rain} />
                  <Text style={styles.rainText}>{day.precipitation}%</Text>
                </View>
              )}
            </View>
          )
        })}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  sectionTitle: { fontSize: fontSize.lg, fontWeight: '600', color: colors.foreground, marginBottom: spacing.md },
  scroll: { marginHorizontal: -spacing.xl, paddingHorizontal: spacing.xl },
  card: {
    width: 72,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.md,
    alignItems: 'center',
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  cardActive: {
    backgroundColor: `${colors.primary}12`,
    borderColor: `${colors.primary}40`,
  },
  dayName: { fontSize: fontSize.xs, fontWeight: '600', color: colors.mutedForeground },
  dayNameActive: { color: colors.primary },
  icon: { marginVertical: spacing.sm },
  high: { fontSize: fontSize.base, fontWeight: '700', color: colors.foreground },
  highActive: { color: colors.primary },
  low: { fontSize: fontSize.xs, color: colors.mutedForeground },
  rainRow: { flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: 4 },
  rainText: { fontSize: 10, color: colors.rain },
})

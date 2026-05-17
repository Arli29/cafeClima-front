import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import type { WeatherData } from '@/lib/types'
import { colors, spacing, radius, fontSize } from '@/lib/theme'

interface Props {
  weather: WeatherData
  location: string
}

const conditionLabels: Record<WeatherData['condition'], string> = {
  sunny: 'Soleado',
  cloudy: 'Nublado',
  rainy: 'Lluvioso',
  stormy: 'Tormentoso',
  'partly-cloudy': 'Parcialmente nublado',
}

const conditionIcons: Record<WeatherData['condition'], string> = {
  sunny: 'sunny',
  cloudy: 'cloud',
  rainy: 'rainy',
  stormy: 'thunderstorm',
  'partly-cloudy': 'partly-sunny',
}

export function CurrentWeather({ weather, location }: Props) {
  const dateToFormat = weather.timestamp instanceof Date ? weather.timestamp : new Date(weather.timestamp)

  const formatted = new Intl.DateTimeFormat('es-CO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(dateToFormat)

  return (
    <View style={styles.card}>
      {/* Background icon */}
      <View style={styles.bgIcon}>
        <Ionicons name={conditionIcons[weather.condition] as any} size={120} color="rgba(255,255,255,0.12)" />
      </View>

      <View style={styles.row}>
        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={14} color="rgba(255,255,255,0.85)" />
          <Text style={styles.location}>{location}</Text>
        </View>
        <Ionicons name={conditionIcons[weather.condition] as any} size={56} color="rgba(255,255,255,0.9)" />
      </View>

      <Text style={styles.date}>{formatted}</Text>

      <View style={styles.tempRow}>
        <Text style={styles.temp}>{weather.temperature}</Text>
        <Text style={styles.unit}>°C</Text>
      </View>
      <Text style={styles.condition}>{conditionLabels[weather.condition]}</Text>

      <View style={styles.divider} />

      <View style={styles.stats}>
        <StatItem icon="water-outline" label="Humedad" value={`${weather.humidity}%`} />
        <StatItem icon="partly-sunny-outline" label="Viento" value={`${weather.windSpeed} km/h`} />
        <StatItem icon="umbrella-outline" label="Lluvia" value={`${weather.precipitation}%`} />
      </View>
    </View>
  )
}

function StatItem({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={statStyles.item}>
      <Ionicons name={icon as any} size={18} color="rgba(255,255,255,0.75)" />
      <Text style={statStyles.label}>{label}</Text>
      <Text style={statStyles.value}>{value}</Text>
    </View>
  )
}

const statStyles = StyleSheet.create({
  item: { alignItems: 'center', gap: 2 },
  label: { fontSize: fontSize.xs, color: 'rgba(255,255,255,0.7)' },
  value: { fontSize: fontSize.sm, fontWeight: '600', color: '#fff' },
})

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.primary,
    borderRadius: radius.xl,
    padding: spacing.xl,
    overflow: 'hidden',
    position: 'relative',
  },
  bgIcon: {
    position: 'absolute',
    top: -10,
    right: -10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  location: { fontSize: fontSize.sm, color: 'rgba(255,255,255,0.85)', fontWeight: '500' },
  date: { fontSize: fontSize.xs, color: 'rgba(255,255,255,0.65)', marginTop: 2, textTransform: 'capitalize' },
  tempRow: { flexDirection: 'row', alignItems: 'flex-start', marginTop: spacing.md },
  temp: { fontSize: 64, fontWeight: '700', color: '#fff', lineHeight: 72 },
  unit: { fontSize: 24, color: '#fff', marginTop: 8 },
  condition: { fontSize: fontSize.lg, color: 'rgba(255,255,255,0.85)', marginTop: 2 },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.2)', marginVertical: spacing.lg },
  stats: { flexDirection: 'row', justifyContent: 'space-around' },
})

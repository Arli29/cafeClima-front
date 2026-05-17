import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import type { Recommendation } from '@/lib/types'
import { colors, spacing, radius, fontSize } from '@/lib/theme'

interface Props {
  recommendations: Recommendation[]
  onRecommendationClick?: (rec: Recommendation) => void
}

const priorityBg: Record<Recommendation['priority'], string> = {
  low: colors.muted,
  medium: `${colors.warning}25`,
  high: `${colors.primary}20`,
}
const priorityColor: Record<Recommendation['priority'], string> = {
  low: colors.mutedForeground,
  medium: colors.warning,
  high: colors.primary,
}
const priorityLabel: Record<Recommendation['priority'], string> = {
  low: 'Baja',
  medium: 'Media',
  high: 'Alta',
}
const categoryLabel: Record<Recommendation['category'], string> = {
  irrigation: 'Riego',
  fertilization: 'Fertilización',
  'pest-control': 'Control de plagas',
  harvest: 'Cosecha',
  pruning: 'Poda',
  general: 'General',
}
const recIcons: Record<string, string> = {
  droplets: 'water-outline',
  bug: 'bug-outline',
  leaf: 'leaf-outline',
  coffee: 'cafe-outline',
  waves: 'waves-outline',
}

export function RecommendationsList({ recommendations, onRecommendationClick }: Props) {
  if (recommendations.length === 0) return null

  return (
    <View>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Recomendaciones</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{recommendations.length}</Text>
        </View>
      </View>

      {recommendations.map((rec) => (
        <TouchableOpacity
          key={rec.id}
          style={styles.card}
          onPress={() => onRecommendationClick?.(rec)}
          activeOpacity={0.7}
        >
          <View style={styles.iconBox}>
            <Ionicons
              name={(recIcons[rec.icon] || 'leaf-outline') as any}
              size={20}
              color={colors.primary}
            />
          </View>

          <View style={styles.body}>
            <View style={styles.titleRow}>
              <Text style={styles.title} numberOfLines={1}>
                {rec.title}
              </Text>
              <Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} />
            </View>

            <Text style={styles.desc} numberOfLines={2}>
              {rec.description}
            </Text>

            <View style={styles.tags}>
              <View style={[styles.tag, { backgroundColor: priorityBg[rec.priority] }]}>
                <Text style={[styles.tagText, { color: priorityColor[rec.priority] }]}>
                  {priorityLabel[rec.priority]}
                </Text>
              </View>
              <Text style={styles.category}>{categoryLabel[rec.category]}</Text>
              {rec.weatherBased && (
                <View style={styles.weatherTag}>
                  <Ionicons name="cloud-outline" size={10} color={colors.rain} />
                  <Text style={styles.weatherTagText}>Clima</Text>
                </View>
              )}
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: spacing.md },
  sectionTitle: { fontSize: fontSize.lg, fontWeight: '600', color: colors.foreground },
  badge: {
    backgroundColor: `${colors.primary}20`,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primary,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    gap: spacing.md,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: `${colors.primary}10`,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  body: { flex: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  title: { flex: 1, fontSize: fontSize.base, fontWeight: '600', color: colors.foreground },
  desc: { fontSize: fontSize.sm, color: colors.mutedForeground, marginTop: 4, lineHeight: 18 },
  tags: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 8 },
  tag: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: radius.full },
  tagText: { fontSize: 10, fontWeight: '700' },
  category: { fontSize: 11, color: colors.mutedForeground, fontWeight: '500' },
  weatherTag: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  weatherTagText: { fontSize: 10, color: colors.rain, fontWeight: '600' },
})

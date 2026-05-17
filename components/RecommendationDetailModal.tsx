import React from 'react'
import { Modal, View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import type { Recommendation } from '@/lib/types'
import { colors, spacing, radius, fontSize } from '@/lib/theme'

interface Props {
  recommendation: Recommendation | null
  visible: boolean
  onClose: () => void
  onMarkAsDone: (id: string) => void
}

const categoryLabel: Record<Recommendation['category'], string> = {
  irrigation: 'Riego',
  fertilization: 'Fertilización',
  'pest-control': 'Control de plagas',
  harvest: 'Cosecha',
  pruning: 'Poda',
  general: 'General',
}

const priorityLabel: Record<Recommendation['priority'], string> = {
  low: 'Prioridad Baja',
  medium: 'Prioridad Media',
  high: 'Prioridad Alta',
}

const recIcons: Record<string, string> = {
  droplets: 'water',
  bug: 'bug',
  leaf: 'leaf',
  coffee: 'cafe',
  waves: 'waves',
}

export function RecommendationDetailModal({ recommendation, visible, onClose, onMarkAsDone }: Props) {
  if (!recommendation) return null

  const handleDone = () => {
    onMarkAsDone(recommendation.id)
    onClose()
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.header}>
            <View style={styles.titleArea}>
              <View style={styles.iconBox}>
                <Ionicons
                  name={(recIcons[recommendation.icon] || 'leaf') as any}
                  size={24}
                  color={colors.primary}
                />
              </View>
              <View>
                <Text style={styles.category}>{categoryLabel[recommendation.category]}</Text>
                <Text style={styles.title}>{recommendation.title}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={colors.mutedForeground} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            <View style={styles.priorityRow}>
              <Ionicons name="alert-circle-outline" size={16} color={colors.mutedForeground} />
              <Text style={styles.priorityText}>{priorityLabel[recommendation.priority]}</Text>
              {recommendation.weatherBased && (
                <View style={styles.weatherTag}>
                  <Ionicons name="cloud-outline" size={12} color={colors.rain} />
                  <Text style={styles.weatherTagText}>Basado en clima actual</Text>
                </View>
              )}
            </View>

            <Text style={styles.description}>{recommendation.description}</Text>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.doneBtn} onPress={handleDone}>
              <Ionicons name="checkmark-circle" size={20} color="#fff" />
              <Text style={styles.doneBtnText}>Marcar como realizada</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  card: {
    backgroundColor: colors.card,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.xl,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xl,
  },
  titleArea: {
    flexDirection: 'row',
    gap: spacing.md,
    flex: 1,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: `${colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  category: {
    fontSize: fontSize.xs,
    color: colors.primary,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.foreground,
    marginTop: 2,
  },
  closeBtn: {
    padding: 4,
  },
  body: {
    marginBottom: spacing.xl,
  },
  priorityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: spacing.lg,
  },
  priorityText: {
    fontSize: fontSize.sm,
    color: colors.mutedForeground,
  },
  weatherTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: `${colors.rain}10`,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.full,
    marginLeft: spacing.sm,
  },
  weatherTagText: {
    fontSize: 10,
    color: colors.rain,
    fontWeight: '600',
  },
  description: {
    fontSize: fontSize.base,
    color: colors.foreground,
    lineHeight: 24,
  },
  footer: {
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  doneBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  doneBtnText: {
    color: '#fff',
    fontSize: fontSize.base,
    fontWeight: '700',
  },
})

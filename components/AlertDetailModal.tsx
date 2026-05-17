import React from 'react'
import { Modal, View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import type { Alert } from '@/lib/types'
import { colors, spacing, radius, fontSize } from '@/lib/theme'

interface Props {
  alert: Alert | null
  visible: boolean
  onClose: () => void
  onMarkAsRead: (id: string) => void
}

const alertIcons: Record<Alert['type'], string> = {
  frost: 'snow',
  drought: 'sunny',
  rain: 'rainy',
  pest: 'bug',
  disease: 'warning',
  harvest: 'cafe',
}
const severityColor: Record<Alert['severity'], string> = {
  low: colors.success,
  medium: colors.warning,
  high: colors.accent,
  critical: colors.destructive,
}
const severityBg: Record<Alert['severity'], string> = {
  low: colors.successLight,
  medium: colors.warningLight,
  high: colors.accentLight,
  critical: colors.destructiveLight,
}
const severityLabel: Record<Alert['severity'], string> = {
  low: 'Baja',
  medium: 'Media',
  high: 'Alta',
  critical: 'Crítica',
}

export function AlertDetailModal({ alert, visible, onClose, onMarkAsRead }: Props) {
  if (!alert) return null

  const handleMarkRead = () => {
    onMarkAsRead(alert.id)
    onClose()
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.handle} />
        <View style={styles.headerRow}>
          <Text style={styles.title} numberOfLines={2}>{alert.title}</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={22} color={colors.foreground} />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
          {/* Icon + severity */}
          <View style={[styles.iconSection, { backgroundColor: severityBg[alert.severity] }]}>
            <View style={[styles.iconCircle, { backgroundColor: `${severityColor[alert.severity]}25` }]}>
              <Ionicons name={alertIcons[alert.type] as any} size={32} color={severityColor[alert.severity]} />
            </View>
            <View style={[styles.severityBadge, { backgroundColor: `${severityColor[alert.severity]}20` }]}>
              <Text style={[styles.severityText, { color: severityColor[alert.severity] }]}>
                Severidad {severityLabel[alert.severity]}
              </Text>
            </View>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Descripción</Text>
            <Text style={styles.description}>{alert.description}</Text>
          </View>

          {/* Timestamp */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Fecha y hora</Text>
            <Text style={styles.metaText}>
              {new Intl.DateTimeFormat('es-CO', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              }).format(alert.timestamp)}
            </Text>
          </View>

          {/* Status */}
          <View style={styles.statusRow}>
            <Ionicons
              name={alert.isRead ? 'checkmark-circle' : 'ellipse-outline'}
              size={16}
              color={alert.isRead ? colors.success : colors.mutedForeground}
            />
            <Text style={[styles.statusText, alert.isRead && { color: colors.success }]}>
              {alert.isRead ? 'Leída' : 'Sin leer'}
            </Text>
          </View>
        </ScrollView>

        {!alert.isRead && (
          <TouchableOpacity style={styles.markReadBtn} onPress={handleMarkRead}>
            <Ionicons name="checkmark-circle-outline" size={18} color="#fff" />
            <Text style={styles.markReadText}>Marcar como leída</Text>
          </TouchableOpacity>
        )}
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.xl, paddingTop: spacing.md },
  handle: { width: 40, height: 4, backgroundColor: colors.border, borderRadius: 2, alignSelf: 'center', marginBottom: spacing.xl },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.xl },
  title: { flex: 1, fontSize: fontSize.xl, fontWeight: '700', color: colors.foreground, marginRight: spacing.md },
  closeBtn: { padding: 4 },
  iconSection: {
    alignItems: 'center',
    padding: spacing.xxl,
    borderRadius: radius.xl,
    marginBottom: spacing.xl,
    gap: spacing.md,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  severityBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: radius.full },
  severityText: { fontSize: fontSize.sm, fontWeight: '600' },
  section: { marginBottom: spacing.xl },
  sectionLabel: { fontSize: fontSize.xs, fontWeight: '600', color: colors.mutedForeground, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 },
  description: { fontSize: fontSize.base, color: colors.foreground, lineHeight: 22 },
  metaText: { fontSize: fontSize.base, color: colors.foreground, textTransform: 'capitalize' },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: spacing.xl },
  statusText: { fontSize: fontSize.sm, color: colors.mutedForeground },
  markReadBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    height: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  markReadText: { color: '#fff', fontWeight: '600', fontSize: fontSize.base },
})

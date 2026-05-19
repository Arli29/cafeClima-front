import React, { useState } from 'react'
import { ScrollView, View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import type { Alert } from '@/lib/types'
import { AlertDetailModal } from './AlertDetailModal'
import { colors, spacing, radius, fontSize } from '@/lib/theme'

interface Props {
  initialAlerts: Alert[]
}

const alertIcons: Record<Alert['type'], string> = {
  frost: 'snow-outline',
  drought: 'sunny-outline',
  rain: 'rainy-outline',
  pest: 'bug-outline',
  disease: 'warning-outline',
  harvest: 'cafe-outline',
}

const severityBg: Record<Alert['severity'], string> = {
  low: `${colors.success}20`,
  medium: `${colors.warning}20`,
  high: `${colors.accent}20`,
  critical: `${colors.destructive}20`,
}
const severityColor: Record<Alert['severity'], string> = {
  low: colors.success,
  medium: colors.warning,
  high: colors.accent,
  critical: colors.destructive,
}
const severityLabel: Record<Alert['severity'], string> = {
  low: 'Baja',
  medium: 'Media',
  high: 'Alta',
  critical: 'Crítica',
}

function formatTimeAgo(date: Date): string {
  const diffMs = Date.now() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  if (diffMins < 60) return `hace ${diffMins} min`
  if (diffHours < 24) return `hace ${diffHours}h`
  return `hace ${Math.floor(diffHours / 24)}d`
}

export function AlertsTab({ initialAlerts }: Props) {
  const [alerts, setAlerts] = useState(initialAlerts)
  const [selected, setSelected] = useState<Alert | null>(null)

  const handleMarkAsRead = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, isRead: true } : a))
  }

  const unread = alerts.filter(a => !a.isRead).length

  return (
    <>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.summaryRow}>
          <Text style={styles.subtitle}>{alerts.length} alertas total</Text>
          {unread > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unread} sin leer</Text>
            </View>
          )}
        </View>

        {alerts.length === 0 && (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Ionicons name="checkmark-circle-outline" size={36} color={colors.success} />
            </View>
            <Text style={styles.emptyTitle}>Todo en orden</Text>
            <Text style={styles.emptyDesc}>No tienes alertas activas por el momento.</Text>
          </View>
        )}

        {alerts.map(alert => (
          <TouchableOpacity
            key={alert.id}
            style={[
              styles.card,
              { borderLeftColor: severityColor[alert.severity] },
              !alert.isRead && styles.cardUnread,
            ]}
            onPress={() => setSelected(alert)}
            activeOpacity={0.75}
          >
            <View style={[styles.iconBox, { backgroundColor: severityBg[alert.severity] }]}>
              <Ionicons name={alertIcons[alert.type] as any} size={20} color={severityColor[alert.severity]} />
            </View>
            <View style={styles.body}>
              <View style={styles.titleRow}>
                <Text style={[styles.alertTitle, !alert.isRead && styles.alertTitleBold]} numberOfLines={1}>
                  {alert.title}
                </Text>
                {!alert.isRead && <View style={styles.dot} />}
              </View>
              <Text style={styles.desc} numberOfLines={2}>{alert.description}</Text>
              <View style={styles.footerRow}>
                <View style={[styles.severityTag, { backgroundColor: severityBg[alert.severity] }]}>
                  <Text style={[styles.severityText, { color: severityColor[alert.severity] }]}>
                    {severityLabel[alert.severity]}
                  </Text>
                </View>
                <Text style={styles.time}>{formatTimeAgo(alert.timestamp)}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <AlertDetailModal
        alert={selected}
        visible={!!selected}
        onClose={() => setSelected(null)}
        onMarkAsRead={handleMarkAsRead}
      />
    </>
  )
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.xl, paddingBottom: 32, gap: spacing.sm },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  subtitle: { fontSize: fontSize.sm, color: colors.mutedForeground },
  badge: { backgroundColor: `${colors.destructive}20`, borderRadius: radius.full, paddingHorizontal: 8, paddingVertical: 2 },
  badgeText: { fontSize: fontSize.xs, fontWeight: '600', color: colors.destructive },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    gap: spacing.md,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: radius.full,
    backgroundColor: `${colors.success}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: { fontSize: fontSize.lg, fontWeight: '600', color: colors.foreground },
  emptyDesc: { fontSize: fontSize.sm, color: colors.mutedForeground, textAlign: 'center' },
  card: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    gap: spacing.md,
  },
  cardUnread: { backgroundColor: colors.card },
  iconBox: { width: 40, height: 40, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  body: { flex: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  alertTitle: { flex: 1, fontSize: fontSize.sm, color: colors.foreground },
  alertTitleBold: { fontWeight: '600' },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.destructive },
  desc: { fontSize: fontSize.xs, color: colors.mutedForeground, marginTop: 3 },
  footerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 },
  severityTag: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: radius.full },
  severityText: { fontSize: 10, fontWeight: '500' },
  time: { fontSize: fontSize.xs, color: colors.mutedForeground },
})

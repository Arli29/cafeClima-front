import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import type { Alert } from '@/lib/types'
import { colors, spacing, radius, fontSize } from '@/lib/theme'

interface Props {
  alerts: Alert[]
  onAlertClick?: (alert: Alert) => void
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

const severityBorder: Record<Alert['severity'], string> = {
  low: colors.success,
  medium: colors.warning,
  high: colors.accent,
  critical: colors.destructive,
}

function formatTimeAgo(date: Date): string {
  const diffMs = Date.now() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  if (diffMins < 60) return `hace ${diffMins} min`
  if (diffHours < 24) return `hace ${diffHours}h`
  return `hace ${Math.floor(diffHours / 24)}d`
}

export function AlertsList({ alerts, onAlertClick }: Props) {
  const unreadCount = alerts.filter((a) => !a.isRead).length

  return (
    <View>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Alertas</Text>
        {unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{unreadCount} nuevas</Text>
          </View>
        )}
      </View>

      {alerts.slice(0, 3).map((alert) => (
        <TouchableOpacity
          key={alert.id}
          style={[
            styles.card,
            { borderLeftColor: severityBorder[alert.severity] },
            !alert.isRead && styles.cardUnread,
          ]}
          onPress={() => onAlertClick?.(alert)}
          activeOpacity={0.75}
        >
          <View style={[styles.iconBox, { backgroundColor: severityBg[alert.severity] }]}>
            <Ionicons name={alertIcons[alert.type] as any} size={18} color={severityColor[alert.severity]} />
          </View>
          <View style={styles.content}>
            <View style={styles.titleRow}>
              <Text style={[styles.alertTitle, !alert.isRead && styles.alertTitleBold]} numberOfLines={1}>
                {alert.title}
              </Text>
              <Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} />
            </View>
            <Text style={styles.desc} numberOfLines={2}>{alert.description}</Text>
            <Text style={styles.time}>{formatTimeAgo(alert.timestamp)}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  sectionTitle: { fontSize: fontSize.lg, fontWeight: '600', color: colors.foreground },
  badge: {
    backgroundColor: `${colors.destructive}20`,
    borderRadius: radius.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: { fontSize: fontSize.xs, fontWeight: '600', color: colors.destructive },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    gap: spacing.md,
  },
  cardUnread: { backgroundColor: colors.card },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  content: { flex: 1 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  alertTitle: { fontSize: fontSize.sm, color: colors.foreground, flex: 1, marginRight: 4 },
  alertTitleBold: { fontWeight: '600' },
  desc: { fontSize: fontSize.xs, color: colors.mutedForeground, marginTop: 2 },
  time: { fontSize: fontSize.xs, color: colors.mutedForeground, marginTop: 4 },
})

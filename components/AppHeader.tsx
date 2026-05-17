import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { TabType } from './BottomNavigation'
import { colors, fontSize, spacing } from '@/lib/theme'

const titles: Record<TabType, string> = {
  home: 'CafeClima',
  forecast: 'Pronóstico',
  farm: 'Mi Finca',
  alerts: 'Alertas',
  settings: 'Ajustes',
}

interface Props {
  activeTab: TabType
  isRefreshing: boolean
  onRefresh: () => void
}

export function AppHeader({ activeTab, isRefreshing, onRefresh }: Props) {
  return (
    <View style={styles.header}>
      <View style={styles.left}>
        {activeTab === 'home' && (
          <View style={styles.logoIcon}>
            <Ionicons name="cafe" size={18} color={colors.primary} />
          </View>
        )}
        <Text style={styles.title}>{titles[activeTab]}</Text>
      </View>
      {activeTab === 'home' && (
        <TouchableOpacity
          onPress={onRefresh}
          disabled={isRefreshing}
          style={styles.refreshButton}
        >
          <Ionicons
            name="refresh"
            size={20}
            color={colors.mutedForeground}
            style={isRefreshing ? { opacity: 0.4 } : undefined}
          />
        </TouchableOpacity>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  left: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: `${colors.primary}18`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: fontSize.lg, fontWeight: '700', color: colors.foreground },
  refreshButton: { padding: 8 },
})

import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors, fontSize } from '@/lib/theme'

export type TabType = 'home' | 'forecast' | 'farm' | 'alerts' | 'settings'

interface Tab {
  id: TabType
  label: string
  icon: string
  iconActive: string
}

const tabs: Tab[] = [
  { id: 'home', label: 'Inicio', icon: 'home-outline', iconActive: 'home' },
  { id: 'forecast', label: 'Pronóstico', icon: 'calendar-outline', iconActive: 'calendar' },
  { id: 'farm', label: 'Finca', icon: 'leaf-outline', iconActive: 'leaf' },
  { id: 'alerts', label: 'Alertas', icon: 'notifications-outline', iconActive: 'notifications' },
  { id: 'settings', label: 'Ajustes', icon: 'settings-outline', iconActive: 'settings' },
]

interface Props {
  activeTab: TabType
  onTabChange: (tab: TabType) => void
  alertCount?: number
}

export function BottomNavigation({ activeTab, onTabChange, alertCount = 0 }: Props) {
  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id
        const showBadge = tab.id === 'alerts' && alertCount > 0

        return (
          <TouchableOpacity
            key={tab.id}
            style={styles.tab}
            onPress={() => onTabChange(tab.id)}
            activeOpacity={0.7}
          >
            {isActive && <View style={styles.activeIndicator} />}
            <View style={styles.iconWrapper}>
              <Ionicons
                name={(isActive ? tab.iconActive : tab.icon) as any}
                size={22}
                color={isActive ? colors.primary : colors.mutedForeground}
              />
              {showBadge && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{alertCount > 9 ? '9+' : alertCount}</Text>
                </View>
              )}
            </View>
            <Text style={[styles.label, isActive && styles.labelActive]}>{tab.label}</Text>
          </TouchableOpacity>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    height: 64,
    paddingBottom: 4,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 4,
  },
  activeIndicator: {
    position: 'absolute',
    top: 0,
    width: 32,
    height: 2,
    backgroundColor: colors.primary,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
  },
  iconWrapper: { position: 'relative' },
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.destructive,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: { color: '#fff', fontSize: 9, fontWeight: '700' },
  label: { fontSize: fontSize.xs, color: colors.mutedForeground, marginTop: 2 },
  labelActive: { color: colors.primary, fontWeight: '600' },
})

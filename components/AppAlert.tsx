/**
 * AppAlert — reemplaza Alert.alert de RN para funcionar bien en web y móvil.
 * Uso: AppAlert.alert(title, message, buttons?)
 * También exporta <AppAlertProvider> para uso declarativo.
 */
import React, { useState, useCallback } from 'react'
import {
  Modal, View, Text, TouchableOpacity, StyleSheet, Platform,
} from 'react-native'
import { colors, spacing, radius, fontSize } from '@/lib/theme'

export interface AlertButton {
  text: string
  onPress?: () => void
  style?: 'default' | 'cancel' | 'destructive'
}

interface AlertState {
  visible: boolean
  title: string
  message?: string
  buttons: AlertButton[]
}

// Singleton ref para la función imperativa
let _showAlert: ((title: string, message?: string, buttons?: AlertButton[]) => void) | null = null

export const AppAlert = {
  alert: (title: string, message?: string, buttons?: AlertButton[]) => {
    if (_showAlert) {
      _showAlert(title, message, buttons)
    } else {
      // Fallback si el provider no está montado aún
      if (Platform.OS === 'web') {
        window.alert(message ? `${title}\n${message}` : title)
        buttons?.find(b => b.style !== 'cancel')?.onPress?.()
      }
    }
  },
}

/* ── Provider: montar UNA vez en _layout.tsx ── */
export function AppAlertProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AlertState>({
    visible: false,
    title: '',
    message: undefined,
    buttons: [],
  })

  const showAlert = useCallback(
    (title: string, message?: string, buttons?: AlertButton[]) => {
      setState({
        visible: true,
        title,
        message,
        buttons: buttons ?? [{ text: 'OK', style: 'default' }],
      })
    },
    []
  )

  // Registrar función global
  React.useEffect(() => {
    _showAlert = showAlert
    return () => { _showAlert = null }
  }, [showAlert])

  const handleButton = (btn: AlertButton) => {
    setState(s => ({ ...s, visible: false }))
    // Pequeño delay para que el modal cierre antes del callback
    setTimeout(() => btn.onPress?.(), 150)
  }

  return (
    <>
      {children}
      <Modal
        visible={state.visible}
        transparent
        animationType="fade"
        onRequestClose={() => {
          const cancel = state.buttons.find(b => b.style === 'cancel')
          if (cancel) handleButton(cancel)
          else setState(s => ({ ...s, visible: false }))
        }}
      >
        <View style={styles.overlay}>
          <View style={styles.card}>
            <Text style={styles.title}>{state.title}</Text>
            {!!state.message && (
              <Text style={styles.message}>{state.message}</Text>
            )}
            <View style={[
              styles.buttonsRow,
              state.buttons.length > 2 && styles.buttonsCol,
            ]}>
              {state.buttons.map((btn, i) => (
                <TouchableOpacity
                  key={i}
                  style={[
                    styles.btn,
                    state.buttons.length === 1 && styles.btnFull,
                    state.buttons.length > 2 && styles.btnFullWidth,
                    btn.style === 'destructive' && styles.btnDestructive,
                    btn.style === 'cancel' && styles.btnCancel,
                  ]}
                  onPress={() => handleButton(btn)}
                  activeOpacity={0.75}
                >
                  <Text style={[
                    styles.btnText,
                    btn.style === 'destructive' && styles.btnTextDestructive,
                    btn.style === 'cancel' && styles.btnTextCancel,
                  ]}>
                    {btn.text}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: spacing.xxl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 10,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.foreground,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  message: {
    fontSize: fontSize.base,
    color: colors.mutedForeground,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.xl,
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  buttonsCol: {
    flexDirection: 'column',
  },
  btn: {
    flex: 1,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
  btnFull: {
    flex: 1,
  },
  btnFullWidth: {
    flex: undefined,
    width: '100%',
  },
  btnDestructive: {
    backgroundColor: colors.destructiveLight,
    borderWidth: 1,
    borderColor: `${colors.destructive}40`,
  },
  btnCancel: {
    backgroundColor: colors.muted,
  },
  btnText: {
    fontSize: fontSize.base,
    fontWeight: '600',
    color: '#fff',
  },
  btnTextDestructive: {
    color: colors.destructive,
  },
  btnTextCancel: {
    color: colors.foreground,
  },
})

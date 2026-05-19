import React, { useState } from 'react'
import {
  ScrollView, View, Text, TouchableOpacity, Switch, StyleSheet,
  Modal, TextInput, ActivityIndicator, Platform
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors, spacing, radius, fontSize } from '@/lib/theme'
import { auth } from '@/lib/api'
import { useApp } from '@/lib/store'
import { AppAlert } from '@/components/AppAlert'

interface Props {
  onLogout?: () => void
  usuario?: { id: string; correo: string; nombre: string } | null
}

export function SettingsTab({ onLogout, usuario }: Props) {
  const { updateUsuario } = useApp()
  const [notifications, setNotifications] = useState(true)
  const [alertRain, setAlertRain] = useState(true)
  const [alertPest, setAlertPest] = useState(true)
  const [alertFrost, setAlertFrost] = useState(true)

  const [editModalVisible, setEditModalVisible] = useState(false)
  const [editName, setEditName] = useState(usuario?.nombre || '')
  const [isSaving, setIsSaving] = useState(false)

  const handleLogout = () => {
    AppAlert.alert(
      'Cerrar sesión',
      '¿Estás seguro que deseas salir de tu cuenta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar sesión',
          style: 'destructive',
          onPress: onLogout,
        },
      ]
    )
  }

  const handleUpdateProfile = async () => {
    if (!editName.trim()) {
      AppAlert.alert('Campo requerido', 'El nombre no puede estar vacío.')
      return
    }
    setIsSaving(true)
    try {
      await auth.actualizarPerfil({ nombre: editName.trim() })
      if (usuario) {
        updateUsuario({ ...usuario, nombre: editName.trim() })
      }
      setEditModalVisible(false)
      AppAlert.alert('¡Listo!', 'Tu perfil fue actualizado correctamente.')
    } catch (err: any) {
      const msg = err.message?.toLowerCase().includes('network') || err.message?.toLowerCase().includes('connect')
        ? 'No se pudo conectar con el servidor. Verifica tu internet.'
        : err.message || 'No se pudo actualizar el perfil. Intenta de nuevo.'
      AppAlert.alert('Error al actualizar', msg)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Perfil */}
        {usuario && (
          <>
            <Text style={styles.groupLabel}>Cuenta</Text>
            <View style={styles.card}>
              <TouchableOpacity style={styles.row} onPress={() => {
                setEditName(usuario.nombre)
                setEditModalVisible(true)
              }}>
                <View style={[styles.iconBox, { backgroundColor: `${colors.primary}15` }]}>
                  <Ionicons name="person-outline" size={20} color={colors.primary} />
                </View>
                <View style={styles.rowText}>
                  <Text style={styles.rowTitle}>{usuario.nombre}</Text>
                  <Text style={styles.rowSub}>{usuario.correo}</Text>
                </View>
                <Ionicons name="create-outline" size={18} color={colors.mutedForeground} />
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* Notifications */}
        <Text style={styles.groupLabel}>Notificaciones</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={[styles.iconBox, { backgroundColor: `${colors.primary}15` }]}>
              <Ionicons name="notifications-outline" size={20} color={colors.primary} />
            </View>
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>Notificaciones push</Text>
              <Text style={styles.rowSub}>Recibir alertas en tu dispositivo</Text>
            </View>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: colors.border, true: `${colors.primary}60` }}
              thumbColor={notifications ? colors.primary : '#f4f3f4'}
            />
          </View>
        </View>

        {/* Alert types */}
        <Text style={styles.groupLabel}>Tipos de alertas</Text>
        <View style={styles.card}>
          <SwitchRow label="Alertas de lluvia" value={alertRain} onChange={setAlertRain} />
          <View style={styles.divider} />
          <SwitchRow label="Plagas y enfermedades" value={alertPest} onChange={setAlertPest} />
          <View style={styles.divider} />
          <SwitchRow label="Heladas" value={alertFrost} onChange={setAlertFrost} />
        </View>

        {/* Acerca de */}
        <Text style={styles.groupLabel}>Acerca de</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={[styles.iconBox, { backgroundColor: `${colors.primary}15` }]}>
              <Ionicons name="cafe-outline" size={20} color={colors.primary} />
            </View>
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>CafeClima</Text>
              <Text style={styles.rowSub}>Versión 1.0.0 · Sierra Nevada de Santa Marta</Text>
            </View>
          </View>
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={colors.destructive} />
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Account Edit Modal */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHandle} />
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Editar Perfil</Text>
            <TouchableOpacity onPress={() => setEditModalVisible(false)}>
              <Ionicons name="close" size={24} color={colors.foreground} />
            </TouchableOpacity>
          </View>

          <View style={{ gap: spacing.md }}>
            <View>
              <Text style={styles.inputLabel}>Nombre completo</Text>
              <TextInput
                style={styles.textInput}
                value={editName}
                onChangeText={setEditName}
                placeholder="Tu nombre"
                placeholderTextColor={colors.mutedForeground}
                {...(Platform.OS === 'web' ? {
                  outlineStyle: 'none',
                  outline: 'none',
                  boxShadow: 'none',
                } as any : {})}
              />
            </View>

            <View>
              <Text style={styles.inputLabel}>Correo electrónico (no editable)</Text>
              <TextInput
                style={[styles.textInput, { backgroundColor: colors.muted, color: colors.mutedForeground }]}
                value={usuario?.correo}
                editable={false}
              />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.saveBtn, isSaving && { opacity: 0.7 }]}
            onPress={handleUpdateProfile}
            disabled={isSaving}
          >
            {isSaving
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.saveBtnText}>Guardar Cambios</Text>
            }
          </TouchableOpacity>
        </View>
      </Modal>
    </>
  )
}

function SwitchRow({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <View style={styles.row}>
      <View style={styles.rowText}>
        <Text style={styles.rowTitle}>{label}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: colors.border, true: `${colors.primary}60` }}
        thumbColor={value ? colors.primary : '#f4f3f4'}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.xl, paddingBottom: 40, gap: spacing.sm },
  groupLabel: { fontSize: fontSize.xs, fontWeight: '600', color: colors.mutedForeground, textTransform: 'uppercase', letterSpacing: 0.8, marginTop: spacing.sm, marginBottom: 6 },
  card: { backgroundColor: colors.card, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.cardBorder, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, gap: spacing.md },
  iconBox: { width: 36, height: 36, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  rowText: { flex: 1 },
  rowTitle: { fontSize: fontSize.base, color: colors.foreground, fontWeight: '500' },
  rowSub: { fontSize: fontSize.xs, color: colors.mutedForeground, marginTop: 1 },
  divider: { height: 1, backgroundColor: colors.border, marginLeft: 52 },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm,
    marginTop: spacing.md, padding: spacing.md, borderRadius: radius.lg,
    borderWidth: 1, borderColor: `${colors.destructive}30`, backgroundColor: colors.destructiveLight,
  },
  logoutText: { fontSize: fontSize.base, color: colors.destructive, fontWeight: '600' },
  modalContainer: { flex: 1, backgroundColor: colors.background, padding: spacing.xl },
  modalHandle: { width: 40, height: 4, backgroundColor: colors.border, borderRadius: 2, alignSelf: 'center', marginBottom: spacing.xl },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: fontSize.xl, fontWeight: '700', color: colors.foreground },
  inputLabel: { fontSize: fontSize.sm, fontWeight: '500', color: colors.foreground, marginBottom: 8 },
  textInput: {
    backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.md, paddingHorizontal: spacing.md, height: 48,
    fontSize: fontSize.base, color: colors.foreground
  },
  saveBtn: {
    backgroundColor: colors.primary, borderRadius: radius.md, height: 48,
    alignItems: 'center', justifyContent: 'center', marginTop: 32
  },
  saveBtnText: { color: '#fff', fontSize: fontSize.base, fontWeight: '600' },
})

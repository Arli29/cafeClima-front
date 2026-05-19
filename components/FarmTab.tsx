import React, { useState, useEffect } from 'react'
import {
  ScrollView, View, Text, TouchableOpacity, StyleSheet, Modal,
  TextInput, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import type { Recommendation } from '@/lib/types'
import type { Finca } from '@/lib/api'
import { fincas as fincasApi } from '@/lib/api'
import { RecommendationsList } from './RecommendationsList'
import { colors, spacing, radius, fontSize } from '@/lib/theme'
import { AppAlert } from '@/components/AppAlert'

interface Props {
  fincas: Finca[]
  fincaActiva: Finca | null
  recommendations: Recommendation[]
  onFincaCreada: (finca: Finca) => void
  onFincaActualizada: (finca: Finca) => void
  onFincaEliminada: (id: string) => void
  onFincaSeleccionada: (finca: Finca) => void
}

export function FarmTab({ fincas, fincaActiva, recommendations, onFincaCreada, onFincaActualizada, onFincaEliminada, onFincaSeleccionada }: Props) {
  const [formVisible, setFormVisible] = useState(false)
  const [editingFinca, setEditingFinca] = useState<Finca | null>(null)
  const [detailFinca, setDetailFinca] = useState<Finca | null>(null)

  const handleOpenAdd = () => {
    setEditingFinca(null)
    setFormVisible(true)
  }

  const handleOpenEdit = (finca: Finca) => {
    setEditingFinca(finca)
    setDetailFinca(null)
    setFormVisible(true)
  }

  const handleSave = async (data: any) => {
    try {
      if (editingFinca) {
        const res = await fincasApi.editar(editingFinca.id, data)
        onFincaActualizada(res.finca)
        AppAlert.alert('¡Listo!', 'Los datos de tu finca fueron actualizados.')
      } else {
        const res = await fincasApi.crear(data)
        onFincaCreada(res.finca)
        AppAlert.alert('Finca registrada', 'Tu finca fue registrada exitosamente. Ya puedes consultar el clima.')
      }
      setFormVisible(false)
    } catch (err: any) {
      const msg = err.message?.toLowerCase().includes('network') || err.message?.toLowerCase().includes('connect')
        ? 'No se pudo conectar con el servidor. Verifica tu internet.'
        : err.message || 'No se pudo guardar la finca. Intenta de nuevo.'
      AppAlert.alert('Error', msg)
    }
  }

  const handleDelete = (id: string) => {
    AppAlert.alert(
      'Eliminar finca',
      '¿Estás seguro? Se borrarán todos los datos climáticos y alertas asociadas a esta finca.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await fincasApi.eliminar(id)
              onFincaEliminada(id)
              setDetailFinca(null)
            } catch (err: any) {
              const msg = err.message?.toLowerCase().includes('network')
                ? 'Sin conexión. Intenta de nuevo.'
                : err.message || 'No se pudo eliminar la finca.'
              AppAlert.alert('Error al eliminar', msg)
            }
          },
        },
      ]
    )
  }

  const currentFinca = fincas && fincas.length > 0 ? fincas[0] : null

  return (
    <>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Mi Finca</Text>
          {!currentFinca && (
            <TouchableOpacity style={styles.addBtn} onPress={handleOpenAdd}>
              <Ionicons name="add" size={16} color={colors.primary} />
              <Text style={styles.addBtnText}>Registrar</Text>
            </TouchableOpacity>
          )}
        </View>

        {!currentFinca ? (
          <TouchableOpacity style={styles.emptyCard} onPress={handleOpenAdd}>
            <View style={styles.emptyIcon}>
              <Ionicons name="leaf-outline" size={28} color={colors.primary} />
            </View>
            <Text style={styles.emptyTitle}>Registra tu finca</Text>
            <Text style={styles.emptyDesc}>Para ver el clima y recibir recomendaciones, primero registra los datos de tu finca.</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.plotCard, styles.plotCardActive]}
            onPress={() => setDetailFinca(currentFinca)}
            activeOpacity={0.75}
          >
            <View style={styles.plotMain}>
              <View style={styles.plotNameRow}>
                <Text style={styles.plotName}>{currentFinca.nombre}</Text>
                <View style={styles.activeBadge}>
                  <Text style={styles.activeBadgeText}>Configurada</Text>
                </View>
              </View>
              <View style={styles.plotMeta}>
                {currentFinca.altitud_msnm && (
                  <View style={styles.metaItem}>
                    <Ionicons name="trending-up-outline" size={14} color={colors.mutedForeground} />
                    <Text style={styles.metaText}>{currentFinca.altitud_msnm} msnm</Text>
                  </View>
                )}
                {currentFinca.variedad_cafe && (
                  <View style={styles.metaItem}>
                    <Ionicons name="cafe-outline" size={14} color={colors.mutedForeground} />
                    <Text style={styles.metaText}>{currentFinca.variedad_cafe}</Text>
                  </View>
                )}
                {currentFinca.hectareas && (
                  <View style={styles.metaItem}>
                    <Ionicons name="resize-outline" size={14} color={colors.mutedForeground} />
                    <Text style={styles.metaText}>{currentFinca.hectareas} ha</Text>
                  </View>
                )}
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.mutedForeground} />
          </TouchableOpacity>
        )}

        {recommendations && recommendations.length > 0 && (
          <View style={{ marginTop: spacing.sm }}>
            <RecommendationsList recommendations={recommendations} />
          </View>
        )}
      </ScrollView>

      <FincaFormModal
        visible={formVisible}
        finca={editingFinca}
        onClose={() => setFormVisible(false)}
        onSave={handleSave}
      />

      <FincaDetailModal
        finca={detailFinca}
        onClose={() => setDetailFinca(null)}
        onEdit={handleOpenEdit}
        onDelete={handleDelete}
      />
    </>
  )
}

/* ── Finca Form Modal ── */
function FincaFormModal({ visible, finca, onClose, onSave }: {
  visible: boolean
  finca: Finca | null
  onClose: () => void
  onSave: (data: any) => Promise<void>
}) {
  const [form, setForm] = useState({
    nombre: '', latitud: '', longitud: '', altitud_msnm: '', hectareas: '', variedad_cafe: 'Castillo'
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (visible) {
      if (finca) {
        setForm({
          nombre: finca.nombre || '',
          latitud: finca.latitud?.toString() || '',
          longitud: finca.longitud?.toString() || '',
          altitud_msnm: finca.altitud_msnm?.toString() || '',
          hectareas: finca.hectareas?.toString() || '',
          variedad_cafe: finca.variedad_cafe || 'Castillo'
        })
      } else {
        setForm({ nombre: '', latitud: '', longitud: '', altitud_msnm: '', hectareas: '', variedad_cafe: 'Castillo' })
      }
    }
  }, [visible, finca])

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }))

  const handleGetCurrentLocation = () => {
    if (Platform.OS === 'web') {
      if (!navigator.geolocation) {
        AppAlert.alert('No disponible', 'Tu navegador no soporta geolocalización.')
        return
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          set('latitud', pos.coords.latitude.toFixed(6))
          set('longitud', pos.coords.longitude.toFixed(6))
        },
        () => {
          AppAlert.alert(
            'Sin permiso de ubicación',
            'No se pudo obtener tu ubicación. Asegúrate de dar permisos al navegador e inténtalo de nuevo.'
          )
        }
      )
    } else {
      // En móvil nativo usaría expo-location; por ahora informamos
      AppAlert.alert('GPS', 'Usa el mapa para ingresar las coordenadas de tu finca manualmente.')
    }
  }

  const handleSubmit = async () => {
    if (!form.nombre.trim()) {
      AppAlert.alert('Campo requerido', 'El nombre de la finca es obligatorio.')
      return
    }
    if (!form.latitud || !form.longitud) {
      AppAlert.alert('Ubicación requerida', 'Debes ingresar la latitud y longitud de tu finca.')
      return
    }
    const lat = parseFloat(form.latitud)
    const lng = parseFloat(form.longitud)
    if (isNaN(lat) || isNaN(lng)) {
      AppAlert.alert('Coordenadas inválidas', 'La latitud y longitud deben ser números válidos. Ejemplo: 11.2408, -74.1990')
      return
    }
    setLoading(true)
    await onSave({
      nombre: form.nombre.trim(),
      latitud: lat,
      longitud: lng,
      altitud_msnm: form.altitud_msnm ? parseFloat(form.altitud_msnm) : undefined,
      hectareas: form.hectareas ? parseFloat(form.hectareas) : undefined,
      variedad_cafe: form.variedad_cafe || 'Castillo',
    })
    setLoading(false)
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={modalStyles.container}>
          <View style={modalStyles.handle} />
          <View style={modalStyles.headerRow}>
            <Text style={modalStyles.title}>{finca ? 'Editar Finca' : 'Nueva Finca'}</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.foreground} />
            </TouchableOpacity>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            <ModalInput
              label="Nombre de la finca *"
              placeholder="Ej: Finca El Paraíso"
              value={form.nombre}
              onChangeText={(v: string) => set('nombre', v)}
            />
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm, marginBottom: spacing.md }}>
              <View style={{ flex: 1 }}>
                <ModalInput
                  label="Latitud *"
                  placeholder="11.2408"
                  value={form.latitud}
                  onChangeText={(v: string) => set('latitud', v)}
                  keyboardType="decimal-pad"
                  containerStyle={{ marginBottom: 0 }}
                />
              </View>
              <View style={{ flex: 1 }}>
                <ModalInput
                  label="Longitud *"
                  placeholder="-74.1990"
                  value={form.longitud}
                  onChangeText={(v: string) => set('longitud', v)}
                  keyboardType="decimal-pad"
                  containerStyle={{ marginBottom: 0 }}
                />
              </View>
              <TouchableOpacity style={styles.gpsBtn} onPress={handleGetCurrentLocation}>
                <Ionicons name="locate" size={20} color={colors.primary} />
              </TouchableOpacity>
            </View>
            <ModalInput label="Altitud (msnm)" placeholder="1450" value={form.altitud_msnm} onChangeText={(v: string) => set('altitud_msnm', v)} keyboardType="numeric" />
            <ModalInput label="Área (hectáreas)" placeholder="2.5" value={form.hectareas} onChangeText={(v: string) => set('hectareas', v)} keyboardType="decimal-pad" />
            <ModalInput label="Variedad de café" placeholder="Castillo, Caturra, Colombia..." value={form.variedad_cafe} onChangeText={(v: string) => set('variedad_cafe', v)} />
          </ScrollView>
          <TouchableOpacity
            style={[modalStyles.submitBtn, loading && { opacity: 0.7 }]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={modalStyles.submitText}>{finca ? 'Guardar Cambios' : 'Registrar Finca'}</Text>
            }
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  )
}

/* ── Finca Detail Modal ── */
function FincaDetailModal({ finca, onClose, onEdit, onDelete }: {
  finca: Finca | null
  onClose: () => void
  onEdit: (f: Finca) => void
  onDelete: (id: string) => void
}) {
  if (!finca) return null
  return (
    <Modal visible={!!finca} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={modalStyles.container}>
        <View style={modalStyles.handle} />
        <View style={modalStyles.headerRow}>
          <Text style={modalStyles.title}>{finca.nombre}</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color={colors.foreground} />
          </TouchableOpacity>
        </View>
        <View style={detailStyles.grid}>
          <DetailItem icon="location-outline" label="Latitud / Longitud" value={`${finca.latitud}, ${finca.longitud}`} />
          {finca.altitud_msnm != null && <DetailItem icon="trending-up-outline" label="Altitud" value={`${finca.altitud_msnm} msnm`} />}
          {finca.hectareas != null && <DetailItem icon="resize-outline" label="Área" value={`${finca.hectareas} ha`} />}
          {finca.variedad_cafe && <DetailItem icon="cafe-outline" label="Variedad" value={finca.variedad_cafe} />}
        </View>
        <View style={{ marginTop: 24, gap: spacing.md }}>
          <TouchableOpacity style={detailStyles.editBtn} onPress={() => onEdit(finca)}>
            <Ionicons name="create-outline" size={18} color={colors.foreground} />
            <Text style={detailStyles.editBtnText}>Editar información</Text>
          </TouchableOpacity>
          <TouchableOpacity style={detailStyles.deleteBtn} onPress={() => onDelete(finca.id)}>
            <Ionicons name="trash-outline" size={18} color={colors.destructive} />
            <Text style={detailStyles.deleteBtnText}>Eliminar finca</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )
}

function ModalInput({ label, placeholder, value, onChangeText, keyboardType, containerStyle }: any) {
  return (
    <View style={[{ marginBottom: spacing.md }, containerStyle]}>
      <Text style={{ fontSize: fontSize.sm, fontWeight: '500', color: colors.foreground, marginBottom: 6 }}>{label}</Text>
      <TextInput
        style={{
          borderWidth: 1, borderColor: colors.border, borderRadius: radius.md,
          paddingHorizontal: spacing.md, height: 44, fontSize: fontSize.base,
          color: colors.foreground, backgroundColor: colors.card,
          ...Platform.select({ web: { outlineStyle: 'none', outline: 'none', boxShadow: 'none' } as any }),
        }}
        placeholder={placeholder}
        placeholderTextColor={colors.mutedForeground}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
      />
    </View>
  )
}

function DetailItem({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={detailStyles.item}>
      <Ionicons name={icon as any} size={18} color={colors.primary} />
      <View>
        <Text style={detailStyles.itemLabel}>{label}</Text>
        <Text style={detailStyles.itemValue}>{value}</Text>
      </View>
    </View>
  )
}

const detailStyles = StyleSheet.create({
  grid: { gap: spacing.md, marginTop: spacing.sm },
  item: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md, backgroundColor: colors.muted, borderRadius: radius.md },
  itemLabel: { fontSize: fontSize.xs, color: colors.mutedForeground },
  itemValue: { fontSize: fontSize.base, fontWeight: '500', color: colors.foreground },
  editBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm,
    padding: spacing.md, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card,
  },
  editBtnText: { fontSize: fontSize.base, color: colors.foreground, fontWeight: '500' },
  deleteBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm,
    padding: spacing.md, borderRadius: radius.md,
    borderWidth: 1, borderColor: `${colors.destructive}40`, backgroundColor: colors.destructiveLight,
  },
  deleteBtnText: { fontSize: fontSize.base, color: colors.destructive, fontWeight: '500' },
})

const modalStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.xl, paddingTop: spacing.md },
  handle: { width: 40, height: 4, backgroundColor: colors.border, borderRadius: 2, alignSelf: 'center', marginBottom: spacing.xl },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xl },
  title: { fontSize: fontSize.xl, fontWeight: '700', color: colors.foreground },
  submitBtn: { backgroundColor: colors.primary, borderRadius: radius.md, height: 46, alignItems: 'center', justifyContent: 'center', marginTop: spacing.xl },
  submitText: { color: '#fff', fontWeight: '600', fontSize: fontSize.base },
})

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.xl, gap: spacing.xl, paddingBottom: 32 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontSize: fontSize.lg, fontWeight: '600', color: colors.foreground },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  addBtnText: { fontSize: fontSize.sm, color: colors.primary, fontWeight: '500' },
  emptyCard: { borderWidth: 2, borderStyle: 'dashed', borderColor: colors.border, borderRadius: radius.xl, padding: 32, alignItems: 'center', backgroundColor: colors.card },
  emptyIcon: { width: 56, height: 56, borderRadius: radius.full, backgroundColor: `${colors.primary}15`, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md },
  emptyTitle: { fontSize: fontSize.base, fontWeight: '600', color: colors.foreground },
  emptyDesc: { fontSize: fontSize.sm, color: colors.mutedForeground, textAlign: 'center', marginTop: 4 },
  plotCard: { backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.md, borderWidth: 1, borderColor: colors.cardBorder, flexDirection: 'row', alignItems: 'center' },
  plotCardActive: { borderColor: `${colors.primary}50`, backgroundColor: `${colors.primary}08` },
  plotMain: { flex: 1 },
  plotNameRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: 4 },
  plotName: { fontSize: fontSize.base, fontWeight: '600', color: colors.foreground },
  activeBadge: { backgroundColor: `${colors.primary}20`, borderRadius: radius.full, paddingHorizontal: 8, paddingVertical: 2 },
  activeBadgeText: { fontSize: 10, fontWeight: '600', color: colors.primary },
  plotMeta: { flexDirection: 'row', gap: spacing.md, flexWrap: 'wrap' },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  metaText: { fontSize: fontSize.xs, color: colors.mutedForeground },
  gpsBtn: { width: 44, height: 44, borderRadius: radius.md, backgroundColor: `${colors.primary}15`, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: `${colors.primary}30` },
})

import React, { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors, spacing, radius, fontSize } from '@/lib/theme'
import { auth } from '@/lib/api'
import { useApp } from '@/lib/store'
import { AppAlert } from '@/components/AppAlert'

type AuthMode = 'login' | 'register'

interface AuthScreenProps {
  onAuthenticated: () => void
}

export function AuthScreen({ onAuthenticated }: AuthScreenProps) {
  const { login } = useApp()
  const [mode, setMode] = useState<AuthMode>('login')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    nombre: '', email: '', password: '', confirmPassword: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = (): boolean => {
    const e: Record<string, string> = {}
    if (mode === 'register') {
      if (!formData.nombre.trim()) e.nombre = 'El nombre es requerido'
      if (formData.password !== formData.confirmPassword)
        e.confirmPassword = 'Las contraseñas no coinciden'
    }
    if (!formData.email.trim()) e.email = 'El correo es requerido'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) e.email = 'Correo inválido'
    if (!formData.password) e.password = 'La contraseña es requerida'
    else if (formData.password.length < 6) e.password = 'Mínimo 6 caracteres'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) return
    setIsLoading(true)
    try {
      if (mode === 'login') {
        const res = await auth.login(formData.email, formData.password)
        if (Platform.OS === 'web') {
          try { localStorage.setItem('cafeclima_token', res.token) } catch (e) {}
        }
        login(res.token, {
          id: res.usuario.id,
          correo: res.usuario.correo,
          nombre: res.usuario.perfil?.nombre || res.usuario.correo,
        })
        onAuthenticated()
      } else {
        await auth.registro(formData.nombre, formData.email, formData.password)
        const res = await auth.login(formData.email, formData.password)
        login(res.token, {
          id: res.usuario.id,
          correo: res.usuario.correo,
          nombre: res.usuario.perfil?.nombre || formData.nombre,
        })
        onAuthenticated()
      }
    } catch (err: any) {
      // Mensajes más amigables según el error
      const rawMsg: string = err.message || ''
      let title = mode === 'login' ? 'Error al iniciar sesión' : 'Error al registrarse'
      let msg = 'Ocurrió un error inesperado. Intenta de nuevo.'

      if (rawMsg.toLowerCase().includes('contraseña') || rawMsg.toLowerCase().includes('password') || rawMsg.toLowerCase().includes('credentials') || rawMsg.toLowerCase().includes('invalid')) {
        msg = 'Correo o contraseña incorrectos. Verifica tus datos.'
      } else if (rawMsg.toLowerCase().includes('correo') || rawMsg.toLowerCase().includes('email') || rawMsg.toLowerCase().includes('already') || rawMsg.toLowerCase().includes('existe')) {
        msg = 'Este correo ya está registrado. Intenta iniciar sesión.'
      } else if (rawMsg.toLowerCase().includes('network') || rawMsg.toLowerCase().includes('servidor') || rawMsg.toLowerCase().includes('connect')) {
        title = 'Sin conexión'
        msg = 'No se pudo conectar con el servidor. Verifica tu internet e intenta de nuevo.'
      } else if (rawMsg) {
        msg = rawMsg
      }

      AppAlert.alert(title, msg, [{ text: 'Entendido', style: 'default' }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }))
  }

  const switchMode = () => {
    setMode(mode === 'login' ? 'register' : 'login')
    setErrors({})
    setFormData({ nombre: '', email: '', password: '', confirmPassword: '' })
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.logoSection}>
          <View style={styles.logoIcon}>
            <Ionicons name="cafe" size={40} color={colors.primary} />
          </View>
          <Text style={styles.appName}>CafeClima</Text>
          <Text style={styles.tagline}>Tu asistente climático para el café</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            {mode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
          </Text>
          <Text style={styles.cardSubtitle}>
            {mode === 'login'
              ? 'Ingresa tus credenciales para continuar'
              : 'Completa el formulario para registrarte'}
          </Text>

          {mode === 'register' && (
            <InputField
              label="Nombre completo"
              icon="person-outline"
              placeholder="Juan Carlos Pérez"
              value={formData.nombre}
              onChangeText={(v) => handleChange('nombre', v)}
              error={errors.nombre}
            />
          )}

          <InputField
            label="Correo electrónico"
            icon="mail-outline"
            placeholder="tu@correo.com"
            value={formData.email}
            onChangeText={(v) => handleChange('email', v)}
            error={errors.email}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <InputField
            label="Contraseña"
            icon="lock-closed-outline"
            placeholder="••••••••"
            value={formData.password}
            onChangeText={(v) => handleChange('password', v)}
            error={errors.password}
            secureTextEntry={!showPassword}
            rightIcon={
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={18}
                  color={colors.mutedForeground}
                />
              </TouchableOpacity>
            }
          />

          {mode === 'register' && (
            <InputField
              label="Confirmar contraseña"
              icon="lock-closed-outline"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChangeText={(v) => handleChange('confirmPassword', v)}
              error={errors.confirmPassword}
              secureTextEntry={!showPassword}
            />
          )}

          <TouchableOpacity
            style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.submitButtonText}>
                {mode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
              </Text>
            )}
          </TouchableOpacity>

          <View style={styles.switchRow}>
            <Text style={styles.switchText}>
              {mode === 'login' ? '¿No tienes cuenta? ' : '¿Ya tienes cuenta? '}
            </Text>
            <TouchableOpacity onPress={switchMode}>
              <Text style={styles.switchAction}>
                {mode === 'login' ? 'Regístrate' : 'Inicia Sesión'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.footer}>Sierra Nevada de Santa Marta, Colombia</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

function InputField({ label, icon, placeholder, value, onChangeText, error, secureTextEntry, keyboardType, autoCapitalize = 'none', rightIcon }: any) {
  return (
    <View style={inputStyles.wrapper}>
      <Text style={inputStyles.label}>{label}</Text>
      <View style={[inputStyles.inputRow, error ? inputStyles.inputError : null]}>
        <Ionicons name={icon} size={16} color={colors.mutedForeground} style={inputStyles.leftIcon} />
        <TextInput
          style={[
            inputStyles.input,
            { backgroundColor: 'transparent' },
            Platform.OS === 'web' && { outlineStyle: 'none', outline: 'none', boxShadow: 'none' } as any
          ]}
          placeholder={placeholder}
          placeholderTextColor={colors.mutedForeground}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
          autoComplete="off"
        />
        {rightIcon && <View style={inputStyles.rightIcon}>{rightIcon}</View>}
      </View>
      {error ? <Text style={inputStyles.errorText}>{error}</Text> : null}
    </View>
  )
}

const inputStyles = StyleSheet.create({
  wrapper: { marginBottom: spacing.md },
  label: { fontSize: fontSize.sm, fontWeight: '500', color: colors.foreground, marginBottom: 6 },
  inputRow: {
    flexDirection: 'row', alignItems: 'center', borderWidth: 1,
    borderColor: colors.border, borderRadius: radius.md,
    backgroundColor: colors.card, paddingHorizontal: spacing.md, height: 44,
  },
  inputError: { borderColor: colors.destructive },
  leftIcon: { marginRight: spacing.sm },
  input: { flex: 1, fontSize: fontSize.base, color: colors.foreground },
  rightIcon: { padding: 4 },
  errorText: { fontSize: fontSize.xs, color: colors.destructive, marginTop: 4 },
})

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  scroll: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: spacing.xl, paddingVertical: 40 },
  logoSection: { alignItems: 'center', marginBottom: 32 },
  logoIcon: {
    width: 80, height: 80, borderRadius: radius.xl,
    backgroundColor: `${colors.primary}18`,
    alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md,
  },
  appName: { fontSize: fontSize.xxl, fontWeight: '700', color: colors.foreground },
  tagline: { fontSize: fontSize.sm, color: colors.mutedForeground, marginTop: 4 },
  card: {
    backgroundColor: colors.card, borderRadius: radius.xl,
    padding: spacing.xl, borderWidth: 1, borderColor: colors.cardBorder,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  cardTitle: { fontSize: fontSize.xl, fontWeight: '600', color: colors.foreground, textAlign: 'center' },
  cardSubtitle: { fontSize: fontSize.sm, color: colors.mutedForeground, textAlign: 'center', marginTop: 4, marginBottom: spacing.xl },
  submitButton: {
    backgroundColor: colors.primary, borderRadius: radius.md,
    height: 46, alignItems: 'center', justifyContent: 'center', marginTop: spacing.sm,
  },
  submitButtonDisabled: { opacity: 0.7 },
  submitButtonText: { color: '#fff', fontWeight: '600', fontSize: fontSize.base },
  switchRow: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.xl },
  switchText: { fontSize: fontSize.sm, color: colors.mutedForeground },
  switchAction: { fontSize: fontSize.sm, color: colors.primary, fontWeight: '600' },
  footer: { fontSize: fontSize.xs, color: colors.mutedForeground, textAlign: 'center', marginTop: 32 },
})

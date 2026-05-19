import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { AppProvider } from '@/lib/store'
import { AppAlertProvider } from '@/components/AppAlert'

export default function RootLayout() {
  return (
    <AppProvider>
      <AppAlertProvider>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false }} />
      </AppAlertProvider>
    </AppProvider>
  )
}

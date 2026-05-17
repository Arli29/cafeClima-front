import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { AppProvider } from '@/lib/store'

export default function RootLayout() {
  return (
    <AppProvider>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }} />
    </AppProvider>
  )
}

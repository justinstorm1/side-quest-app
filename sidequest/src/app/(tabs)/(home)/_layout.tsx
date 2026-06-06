import { Stack } from 'expo-router'

export default function HomeLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen 
        name='index'
      />
      <Stack.Screen 
        name='quest'
        options={{
          headerTitle: "",
          headerTransparent: true,
          presentation: "pageSheet"
        }}
      />
    </Stack>
  )
}
import { Stack } from "expo-router";
import { ConvexProviderWithAuth, ConvexReactClient } from 'convex/react';
import { ConvexAuthProvider } from "@convex-dev/auth/react";

const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL!);

function InitialLayout() {
  return (
    <Stack>
      <Stack.Protected guard={true}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack.Protected>
    </Stack>
  )
}

export default function RootLayout() {
  return (
    <ConvexAuthProvider client={convex}>
      <InitialLayout />
    </ConvexAuthProvider>
  )
}
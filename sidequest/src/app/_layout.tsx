import { useEffect, useLayoutEffect } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { ConvexReactClient } from "convex/react";
import { ConvexAuthProvider, useConvexAuth } from "@convex-dev/auth/react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import './global.css';

const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL!);

function InitialLayout() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const router = useRouter();
  const segments = useSegments();

  useLayoutEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "(auth)";
    const inTabsGroup = segments[0] === "(tabs)";

    if (isAuthenticated && inAuthGroup) {
      router.replace("/(tabs)/(home)");
    } else if (!isAuthenticated && inTabsGroup) {
      router.replace("/(auth)/sign-in");
    }
  }, [isAuthenticated, isLoading, segments]);

  if (isLoading) return null;

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <ConvexAuthProvider client={convex} storage={AsyncStorage}>
      <InitialLayout />
    </ConvexAuthProvider>
  );
}
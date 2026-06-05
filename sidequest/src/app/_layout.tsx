import { useEffect, useLayoutEffect } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { ConvexReactClient } from "convex/react";
import { ConvexAuthProvider, useConvexAuth } from "@convex-dev/auth/react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import './global.css';
import * as SecureStore from 'expo-secure-store'
import { Platform } from "react-native";


const storage = {
  async getItem(key: string) {
    if (Platform.OS === "web") {
      return localStorage.getItem(key);
    }
    return AsyncStorage.getItem(key);
  },

  async setItem(key: string, value: string) {
    if (Platform.OS === "web") {
      localStorage.setItem(key, value);
      return;
    }
    await AsyncStorage.setItem(key, value);
  },

  async removeItem(key: string) {
    if (Platform.OS === "web") {
      localStorage.removeItem(key);
      return;
    }
    await AsyncStorage.removeItem(key);
  },
};

const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL!);

function InitialLayout() {
  const { isAuthenticated, isLoading } = useConvexAuth();

  return (
    <Stack>
      <Stack.Protected guard={!isAuthenticated}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      </Stack.Protected>
      <Stack.Protected guard={!!isAuthenticated}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack.Protected>
    </Stack>
  );
}

function replaceURL(url: string) {
  if (typeof window !== "undefined") {
    window.history.replaceState({}, "", url);
  }
}

export default function RootLayout() {
  return (
    <ConvexAuthProvider client={convex} storage={storage} replaceURL={replaceURL}>
      <InitialLayout />
    </ConvexAuthProvider>
  );
}
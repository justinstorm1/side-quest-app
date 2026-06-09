import { useEffect, useLayoutEffect } from "react";
import { DarkTheme, DefaultTheme, Stack, ThemeProvider, useRouter, useSegments } from "expo-router";
import { ConvexReactClient, useQueries, useQuery } from "convex/react";
import { ConvexAuthProvider, useConvexAuth } from "@convex-dev/auth/react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import './global.css';
import * as NavigationBar from 'expo-navigation-bar';
import { Appearance, Platform } from "react-native";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { api } from "../../convex/_generated/api";


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
  const isInGroup = useQuery(api.users.currentUser)?.groupId;

  useEffect(() => {
    const hideNavBar = async () => {
      await NavigationBar.NavigationBar.setHidden(true);
    };

    hideNavBar();
  }, []);


  return (
    <Stack>
      <Stack.Protected guard={!isAuthenticated}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      </Stack.Protected>
      <Stack.Protected guard={!!isAuthenticated}>
        <Stack.Screen name="(tabs)" options={{ headerTitle: "", headerShown: false }} />
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
    <KeyboardProvider>
      <ConvexAuthProvider client={convex} storage={storage} replaceURL={replaceURL}>
        <InitialLayout />
      </ConvexAuthProvider>
    </KeyboardProvider>
  );
}
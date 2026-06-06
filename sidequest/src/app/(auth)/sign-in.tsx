import { View, Text, Pressable, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthActions } from '@convex-dev/auth/react';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

export default function SignIn() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { signIn } = useAuthActions();

  const handleOAuth = async (provider: 'github' | 'google' | 'apple') => {
    try {
      const redirectUrl = AuthSession.makeRedirectUri();
      const { redirect } = await signIn(provider, { redirectTo: redirectUrl });
      if (redirect) {
        const result = await WebBrowser.openAuthSessionAsync(
          redirect.toString(),
          redirectUrl
        );
        if (result.type === 'success') {
          // Extract the `code` param from the redirect URL and finalize sign-in
          const url = new URL(result.url);
          const code = url.searchParams.get('code');
          if (code) {
            await signIn(provider, { code });
          }
        }
      }
    } catch (e) {
      console.error(`Error signing in with ${provider}:`, e);
    }
  };

  return (
    <SafeAreaView className="flex-1 dark:bg-black">
      <View className="flex-1 items-center justify-center px-5">
        <View className="gap-4 w-full">
          <Pressable
            className="w-full h-16 bg-white dark:bg-black border border-gray-500 rounded-full flex-row items-center justify-center"
            onPress={() => handleOAuth('google')}
          >
            <Ionicons name="logo-google" size={28} color={isDark ? 'white' : 'black'} />
            <Text className="text-lg font-medium text-gray-800 dark:text-gray-200 ml-2">
              Google
            </Text>
          </Pressable>

          <Pressable
            className="w-full h-16 bg-white dark:bg-black border border-gray-500 rounded-full flex-row items-center justify-center"
            onPress={() => handleOAuth('github')}
          >
            <Ionicons name="logo-github" size={28} color={isDark ? 'white' : 'black'} />
            <Text className="text-lg font-medium text-gray-800 dark:text-gray-200 ml-2">
              GitHub
            </Text>
          </Pressable>

          <Pressable
            className="w-full h-16 bg-white dark:bg-black border border-gray-500 rounded-full flex-row items-center justify-center"
            onPress={() => handleOAuth('apple')}
          >
            <Ionicons name="logo-apple" size={28} color={isDark ? 'white' : 'black'} />
            <Text className="text-lg font-medium text-gray-800 dark:text-gray-200 ml-2">
              Apple
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
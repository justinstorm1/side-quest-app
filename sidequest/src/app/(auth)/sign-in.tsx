import { View, Text, TextInput, Pressable, Image, useColorScheme } from 'react-native'
import React from 'react'
import GithubIcon from '@/assets/images/githubicon.webp'
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SignIn() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    return (
        <SafeAreaView className="flex-1">
            <View className="flex-1 items-center justify-center px-5 dark:bg-black">

                <View className="gap-4 w-full">
                    <Pressable className="w-full h-16 bg-white dark:bg-black shadow-lg dark:shadow-white rounded-full flex-row items-center justify-center">
                        <Ionicons name="logo-github" size={28} color={isDark ? 'white' : 'black'} />
                        <Text className="text-lg font-medium text-gray-800 dark:text-gray-200 ml-2">Sign in with GitHub</Text>
                    </Pressable>
                    <Pressable className="w-full h-16 bg-white dark:bg-black shadow-lg dark:shadow-white rounded-full flex-row items-center justify-center">
                        <Ionicons name="logo-apple" size={28} color={isDark ? 'white' : 'black'} />
                        <Text className="text-lg font-medium text-gray-800 dark:text-gray-200 ml-2">Sign in with Apple</Text>
                    </Pressable>
                </View>

            </View>
        </SafeAreaView>
    )
}
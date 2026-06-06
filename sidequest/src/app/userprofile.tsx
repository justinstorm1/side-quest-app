import { View, Text, ScrollView, Platform, Pressable, useColorScheme } from 'react-native'
import React from 'react'
import ProfileScreen from '@/components/ProfileScreen'
import { Stack, useLocalSearchParams } from 'expo-router'
import { Id } from '../../convex/_generated/dataModel';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function UserProfile() {
    const { userId } = useLocalSearchParams();
    const instes = useSafeAreaInsets();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === "dark";

    return (
        <>
            <Stack.Screen 
                options={{
                    headerTitle: "",
                    headerTransparent: true,
                    headerBackButtonMenuEnabled: false,
                    headerBackButtonDisplayMode: "minimal",
                    headerTintColor: isDark ? '#fff' : '#000'
                }}
            />
            <ScrollView className='bg-slate-100 dark:bg-slate-900' style={{ paddingTop: Platform.OS === "android" ? instes.top + 8 : 0}} contentInsetAdjustmentBehavior="automatic">
                <ProfileScreen userId={userId as Id<"users">} />
            </ScrollView>
        </>
    )
}
import { View, Text, ScrollView, Platform, Pressable, useColorScheme, Share } from 'react-native'
import React from 'react'
import ProfileScreen from '@/components/ProfileScreen'
import { Stack, useLocalSearchParams } from 'expo-router'
import { Id } from '../../convex/_generated/dataModel';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

export default function UserProfile() {
    const { userId } = useLocalSearchParams();
    const user = useQuery(api.users.getUser, { userId: userId as Id<"users"> }); 
    const instes = useSafeAreaInsets();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === "dark";

    const shareProfile = async () => {
        if (!user) return;
        const link = Linking.createURL(`/userprofile?userId=${user._id}`);
        await Share.share({
          message: `Check out ${user.name}'s profile on SideQuest! ${link}`,
          url: link,
          title: user.name ?? 'SideQuest Profile',
        });
    };

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
            {Platform.OS === 'ios' && (
                <Stack.Toolbar placement='right'>
                    <Stack.Toolbar.Button icon={'square.and.arrow.up'} onPress={shareProfile} />
                </Stack.Toolbar>
            )}
            <ScrollView className='bg-slate-100 dark:bg-slate-900' style={{ paddingTop: Platform.OS === "android" ? instes.top + 8 : 0}} contentInsetAdjustmentBehavior="automatic">
                <ProfileScreen userId={userId as Id<"users">} />
            </ScrollView>
        </>
    )
}
import { View, Text, ScrollView, Platform, Pressable, Share, Alert } from 'react-native'
import React from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import ProfileScreen from '@/components/ProfileScreen';
import { Id } from '../../../../convex/_generated/dataModel';
import { Ionicons } from '@expo/vector-icons';
import { useAuthActions } from '@convex-dev/auth/react';
import { Stack } from 'expo-router';
import * as Linking from 'expo-linking';

export default function profile() {
  const { signOut } = useAuthActions();
  const insets = useSafeAreaInsets();
  const user = useQuery(api.users.currentUser);

  const shareProfile = async () => {
    if (!user) return;
    const link = Linking.createURL(`/userprofile?userId=${user._id}`);
    await Share.share({
      message: `Check out ${user.name}'s profile on SideQuest! ${link}`,
      url: link,
      title: user.name ?? 'SideQuest Profile',
    });
  };

  const signOutAlert = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      {
        text: "Cancel",
        style: 'cancel'
      },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: signOut
      }
    ])
  }

   return (
    <>
      <Stack.Screen 
        options={{
          headerTransparent: true,
          headerTitle: ""
        }}
      />
      {Platform.OS === 'ios' ? (
        <Stack.Toolbar placement='right'>
          <Stack.Toolbar.Button icon={'square.and.arrow.up'} onPress={shareProfile} />
          <Stack.Toolbar.Menu icon={'ellipsis'}>
            <Stack.Toolbar.MenuAction 
              destructive 
              icon={'rectangle.portrait.and.arrow.forward'} 
              onPress={signOutAlert}
            >
              Sign Out
            </Stack.Toolbar.MenuAction>
          </Stack.Toolbar.Menu>
        </Stack.Toolbar>
      ) : (
        <Pressable 
          className='z-[100] absolute top-3 right-3 items-center justify-center w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800'
          onPress={signOutAlert}
        >
          <Ionicons name='log-out-outline' color={'#ff0000'} size={22} />
        </Pressable>
      )}
      <ScrollView className='bg-slate-100 dark:bg-slate-900' style={{ paddingTop: Platform.OS == "android" ? insets.top + 8 : 0 }} contentInsetAdjustmentBehavior="automatic">
          <ProfileScreen userId={user?._id as Id<"users">} />
      </ScrollView>
    </>
    )
}
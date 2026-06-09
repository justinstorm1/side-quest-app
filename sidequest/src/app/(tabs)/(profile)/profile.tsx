import { View, Text, ScrollView, Platform, Pressable, Share, Alert, useColorScheme } from 'react-native'
import React, { useState } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import ProfileScreen from '@/components/ProfileScreen';
import { Id } from '../../../../convex/_generated/dataModel';
import { Ionicons } from '@expo/vector-icons';
import { useAuthActions } from '@convex-dev/auth/react';
import { Stack } from 'expo-router';
import * as Linking from 'expo-linking';
import * as Jetpack from '@expo/ui/jetpack-compose';
import settingsIcon from '@expo/material-symbols/settings.xml';
import signOutIcon from '@expo/material-symbols/logout.xml';

export default function profile() {
  const { signOut } = useAuthActions();
  const insets = useSafeAreaInsets();
  const user = useQuery(api.users.currentUser);

  const isDark = useColorScheme() === 'dark';

  const [menuExpanded, setMenuExpanded] = useState(false);

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
      {Platform.OS === 'ios' && (
        <Stack.Toolbar placement='right'>
          <Stack.Toolbar.Button icon={'square.and.arrow.up'} onPress={shareProfile} />
          <Stack.Toolbar.Menu icon={'ellipsis'}>
            <Stack.Toolbar.MenuAction icon={'gearshape'}>
              Settings
            </Stack.Toolbar.MenuAction>
            <Stack.Toolbar.MenuAction 
              destructive 
              icon={'rectangle.portrait.and.arrow.forward'} 
              onPress={signOutAlert}
            >
              Sign Out
            </Stack.Toolbar.MenuAction>
          </Stack.Toolbar.Menu>
        </Stack.Toolbar>
      )} 
      {Platform.OS === "android" && (
        <View className='z-[100] flex-row gap-3 absolute right-3' style={{ top: insets.top + 8 }}>
          <Pressable 
            className='items-center justify-center w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-800'
            onPress={shareProfile}
          >
            <Ionicons name='share-outline' color={isDark ? '#fff' : '#000'} size={24} />
          </Pressable>
          <Jetpack.Host matchContents>
            <Jetpack.DropdownMenu expanded={menuExpanded} onDismissRequest={() => setMenuExpanded(false)}>
              <Jetpack.DropdownMenu.Trigger>
                <Jetpack.RNHostView matchContents>
                  <Pressable 
                    className='items-center justify-center w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-800'
                    onPress={() => setMenuExpanded(true)}
                  >
                    <Ionicons name='ellipsis-horizontal' color={isDark ? '#fff' : '#000'} size={24} />
                  </Pressable>
                </Jetpack.RNHostView>
              </Jetpack.DropdownMenu.Trigger>
              <Jetpack.DropdownMenu.Items>
                <Jetpack.DropdownMenuItem>
                  <Jetpack.DropdownMenuItem.LeadingIcon>
                    <Jetpack.Icon source={settingsIcon} size={24} />
                  </Jetpack.DropdownMenuItem.LeadingIcon>
                  <Jetpack.DropdownMenuItem.Text>
                    <Jetpack.Text>Settings</Jetpack.Text>
                  </Jetpack.DropdownMenuItem.Text>
                  <Jetpack.HorizontalDivider />
                </Jetpack.DropdownMenuItem>
                <Jetpack.DropdownMenuItem 
                  elementColors={{ leadingIconColor: "#ee4545", textColor: "#ee4545" }}
                  onClick={signOutAlert}
                >
                  <Jetpack.DropdownMenuItem.LeadingIcon>
                    <Jetpack.Icon source={signOutIcon} size={24} />
                  </Jetpack.DropdownMenuItem.LeadingIcon>
                  <Jetpack.DropdownMenuItem.Text>
                    <Jetpack.Text>Sign Out</Jetpack.Text>
                  </Jetpack.DropdownMenuItem.Text>
                </Jetpack.DropdownMenuItem>
              </Jetpack.DropdownMenu.Items>     
            </Jetpack.DropdownMenu>
          </Jetpack.Host>
        </View>
      )}
      <ScrollView className='bg-slate-100 dark:bg-slate-900' style={{ paddingTop: Platform.OS == "android" ? insets.top + 8 : 0 }} contentInsetAdjustmentBehavior="automatic">
          <ProfileScreen userId={user?._id as Id<"users">} />
      </ScrollView>
    </>
    )
}
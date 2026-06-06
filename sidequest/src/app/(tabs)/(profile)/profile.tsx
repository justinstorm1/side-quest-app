import { View, Text, ScrollView, Platform, Pressable } from 'react-native'
import React from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import ProfileScreen from '@/components/ProfileScreen';
import { Id } from '../../../../convex/_generated/dataModel';
import { Ionicons } from '@expo/vector-icons';
import { useAuthActions } from '@convex-dev/auth/react';

export default function profile() {
  const { signOut } = useAuthActions();
  const insets = useSafeAreaInsets();
  const user = useQuery(api.users.currentUser);

   return (
      <ScrollView className='bg-slate-100 dark:bg-slate-900' style={{ paddingTop: Platform.OS == "android" ? insets.top + 8 : 0 }} contentInsetAdjustmentBehavior="automatic">
          <ProfileScreen userId={user?._id as Id<"users">} />
          <Pressable className='absolute right-5' onPress={signOut}>
            <Ionicons
              name='log-out-outline'
              color={'#e84545'}
              size={24}
            />
          </Pressable>
      </ScrollView>
    )
}
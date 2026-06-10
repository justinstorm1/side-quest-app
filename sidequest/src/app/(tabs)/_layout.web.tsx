import { View, Text } from 'react-native'
import React from 'react'
import { Tabs } from 'expo-router'
import Onboarding from '@/components/Onboarding';
import JoinGroup from '@/components/JoinGroup';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';

export default function WebTabsLayout() {
  const user = useQuery(api.users.currentUser);

  if (user === undefined) return null; // loading

  if (!user?.name || !user?.icon) {
    return <Onboarding />;
  } else if (!user.groupId) {
    return <JoinGroup />
  }
  
  return (
    <Tabs>
        <Tabs.Screen name='(home)' options={{ headerShown: false }} />
        <Tabs.Screen name='(messages)' options={{ headerShown: false }} />
        <Tabs.Screen name='(profile)' options={{ headerShown: false }} />
        <Tabs.Screen name='(search)' options={{ headerShown: false }} />
    </Tabs>
  )
}
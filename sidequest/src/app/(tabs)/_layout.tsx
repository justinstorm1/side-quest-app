import { View, Text } from 'react-native'
import React from 'react'
import { NativeTabs } from 'expo-router/unstable-native-tabs'
import Onboarding from '@/components/Onboarding';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';

export default function TabsLayout() {
  const user = useQuery(api.users.currentUser);

  if (user === undefined) return null; // loading

  if (!user?.name || !user?.icon) {
    return <Onboarding />;
  }
    
  return (
    <NativeTabs minimizeBehavior="onScrollDown" tintColor="#9179f5">
        <NativeTabs.Trigger name="(home)">
          <NativeTabs.Trigger.Icon sf="house.fill" md={"home"} />
            <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="(profile)">
          <NativeTabs.Trigger.Icon sf="person.fill" md={"person"}/>
            <NativeTabs.Trigger.Label>Profile</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="(search)" role="search">
          <NativeTabs.Trigger.Icon sf="magnifyingglass" md={"search"} />
            <NativeTabs.Trigger.Label>Search</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
    </NativeTabs>
  )
}
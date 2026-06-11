import { View, Text, useColorScheme, StyleSheet } from 'react-native'
import React from 'react'
import { Tabs } from 'expo-router'
import Onboarding from '@/components/Onboarding';
import JoinGroup from '@/components/JoinGroup';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

export default function WebTabsLayout() {
  const isDark = useColorScheme() === 'dark';

  const user = useQuery(api.users.currentUser);
  const group = useQuery(api.groups.getCurrentUserGroup);

  if (user === undefined) return null; // loading

  if (!user?.name || !user?.icon) {
    return <Onboarding />;
  } else if (!user.groupId) {
    return <JoinGroup />
  }
  
  return (
    <Tabs 
      screenOptions={{ 
        tabBarStyle: {
          position: "absolute",
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          elevation: 0,
        },
        tabBarInactiveTintColor: isDark ? '#fff' : '#000',
        tabBarBackground: () => (
          <BlurView 
            style={StyleSheet.absoluteFill}
            tint={isDark ? 'dark' : 'light'}
            intensity={80}
          />
        )
      }}
    >
      <Tabs.Screen 
        name='(home)' 
        options={{ 
          headerShown: false,
          title: "Home",
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name='home-outline' color={color} size={size} />
          )
        }}
      />
      <Tabs.Screen 
        name='(rankings)'
        options={{
          headerShown: false,
          title: "Rankings",
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name='bar-chart-outline' color={color} size={size} />
          )
        }}
      />
      <Tabs.Screen 
        name='(chats)' 
        options={{ 
          headerShown: false,
          title: "Chats",
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name='chatbubble-outline' color={color} size={size} />
          )
        }} 
      />
      <Tabs.Screen 
        name='(group)' 
        options={{ 
          headerShown: false,
          title: "Group",
          href: user._id === group?.leaderId ? undefined : null,
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name='people-outline' color={color} size={size} />
          )
        }} 
      />
      <Tabs.Screen 
        name='(profile)' 
        options={{ 
          headerShown: false,
          title: "Profile",
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name='person-outline' color={color} size={size} />
          )
        }} 
      />
      <Tabs.Screen 
        name='(search)' 
        options={{ 
          headerShown: false,
          title: "Search",
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name='search-outline' color={color} size={size} />
          )
        }}
      />
    </Tabs>
  )
}
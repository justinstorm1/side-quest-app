import { View, Text } from 'react-native'
import React from 'react'
import { Tabs } from 'expo-router'

export default function WebTabsLayout() {
  return (
    <Tabs>
        <Tabs.Screen name='(home)' options={{ headerShown: false }} />
        <Tabs.Screen name='(messages)' options={{ headerShown: false }} />
        <Tabs.Screen name='(profile)' options={{ headerShown: false }} />
        <Tabs.Screen name='(search)' options={{ headerShown: false }} />
    </Tabs>
  )
}
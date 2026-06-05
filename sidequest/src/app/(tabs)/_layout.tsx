import { View, Text } from 'react-native'
import React from 'react'
import { NativeTabs } from 'expo-router/unstable-native-tabs'

export default function TabsLayout() {
  return (
    <NativeTabs>
        <NativeTabs.Trigger name="(home)">
          <NativeTabs.Trigger.Icon sf="house" />
            <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
    </NativeTabs>
  )
}
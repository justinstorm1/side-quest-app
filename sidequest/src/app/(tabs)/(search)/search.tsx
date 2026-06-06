import { View, Text, ScrollView, Pressable, Platform, useColorScheme } from 'react-native'
import React from 'react'
import { router, Stack } from 'expo-router'
import { useQuery } from 'convex/react'
import { api } from '../../../../convex/_generated/api'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export default function search() {
  const users = useQuery(api.users.getAllUsers);
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <>
      <Stack.Screen 
        options={{
          headerTransparent: true,
          headerTitle: "Search",
          headerTintColor: isDark ? '#fff' : '#000'
        }}
      />
      <Stack.SearchBar 
        placeholder='Search'
        placement='automatic'
      />
      <View className="flex-1 bg-slate-200 dark:bg-slate-800">
        <ScrollView contentInsetAdjustmentBehavior="automatic" style={{ paddingTop: Platform.OS === "android" ? insets.top + 70 : 0 }} className="flex-1 px-5">

          <View className='gap-4'>
            {users?.map(user => (
              <Pressable key={user._id} className='p-5 bg-gray-500' onPress={() => router.push({ pathname: "/userprofile", params: { userId: user._id }})}>
                <Text className='text-xl font-bold dark:text-white'>{user.name}</Text>
              </Pressable>
            ))}
          </View>

        </ScrollView>
      </View>
    </>
  )
}
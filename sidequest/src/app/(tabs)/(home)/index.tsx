import { View, Text, Pressable } from 'react-native'
import React from 'react'
import { useAuthActions } from '@convex-dev/auth/react'

export default function index() {
  const { signOut } = useAuthActions();

  return (
    <View className='flex-1 items-center justify-center'>
      <Text>index</Text>
      <Pressable onPress={async () => await signOut()}>
        <Text>Sign Out</Text>
      </Pressable>
    </View>
  )
}
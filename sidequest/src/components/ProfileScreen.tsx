import { View, Text, ScrollView, Pressable, useColorScheme } from 'react-native'
import React from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { useMediaLibraryPermissions } from 'expo-image-picker';
import { SymbolView } from 'expo-symbols';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen({ userId }: { userId: Id<"users"> }) {
  const insets = useSafeAreaInsets();

  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const currentUser = useQuery(api.users.currentUser);
  if (!currentUser) return null;

  const user = useQuery(api.users.getUser, { userId });
  const globalRank = useQuery(api.users.getGlobalRank, { userId: userId });

  const follow = useMutation(api.users.followUser);
  const unfollow = useMutation(api.users.unfollowUser);
  
  if (!user) return null;

  const level = Math.floor((user.points ?? 0) / 200) + 1;

  const isFollowing = user.followers?.includes(currentUser._id);
  
  const isMe = user._id === currentUser._id;

  const handleFollowUser = async () => {
    try {
        await follow({
            followedId: user._id,
        })
    } catch (e) {
        console.log("Error following user", e);
    }
  }

  const handleUnfollowUser = async () => {
    try {
        await unfollow({
            unfollowedId: user._id,
        })
    } catch (e) {
        console.log("Error unfollowing user", e);
    }
  }
  

  return (

        <View className='w-full'>

            <View className='mx-auto w-[175] h-[175] rounded-full bg-slate-200 dark:bg-slate-800 items-center justify-center'>
                <Text className='text-[100px]'>{user.icon}</Text>
            </View>

            <Text className='text-center mt-3 font-bold dark:text-white text-xl'>{user.name}</Text>

            <View className='mx-auto gap-7 flex-row items-center mt-5'>
                <View>
                    <Text className='font-bold text-xl dark:text-white text-center'>{user.following?.length ?? 0}</Text>
                    <Text className='font-bold text-lg dark:text-white'>Following</Text>
                </View>
                <View className='w-[1] h-[12] bg-gray-500 rounded-full' />
                <View>
                    <Text className='font-bold text-xl dark:text-white text-center'>{user.followers?.length ?? 0}</Text>
                    <Text className='font-bold text-lg dark:text-white'>Followers</Text>
                </View>
            </View>

            <View className='mx-auto gap-7 flex-row items-center mt-5'>
                <Text className='font-bold text-lg dark:text-white'>🌎 #{globalRank}</Text>
                <View className='w-[1] h-[12] bg-gray-500 rounded-full' />
                <Text className='font-bold text-lg dark:text-white'>{user.points}⚡️</Text>
                <View className='w-[1] h-[12] bg-gray-500 rounded-full' />
                <Text className='font-bold text-lg dark:text-white'>Level {level}</Text>
            </View>


            {!isMe && (
                <View className="mx-auto flex-row gap-2 mt-5">
                    {isFollowing ? (
                        <Pressable className='flex-row items-center gap-2 bg-slate-200 dark:bg-slate-800 rounded-full px-5 py-2' onPress={handleUnfollowUser}>
                            <Text className='text-xl font-bold dark:text-white'>Unflollow</Text>
                        </Pressable>
                    ) : (
                        <Pressable className='flex-row items-center gap-2 bg-purple-400 rounded-full px-5 py-2' onPress={handleFollowUser}>
                            <SymbolView 
                                name={{ ios: "checkmark", android: "check" }}
                                size={20}
                                tintColor={'#fff'}
                            />
                            <Text className='text-xl text-white font-bold'>Follow</Text>
                        </Pressable>
                    )}
                    <Pressable className='flex-row items-center gap-2 bg-slate-200 dark:bg-slate-800 rounded-full px-5 py-2'>
                        <Ionicons name='paper-plane' color={isDark ? '#fff' : '#000'} size={18} />
                        <Text className='text-xl font-bold dark:text-white'>Message</Text>
                    </Pressable>
                </View>
            )}


        </View>
  )
}
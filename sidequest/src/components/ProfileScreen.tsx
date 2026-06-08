import { View, Text, Pressable } from 'react-native'
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { SymbolView } from 'expo-symbols';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'nativewind';
import { router } from 'expo-router';

export default function ProfileScreen({ userId }: { userId: Id<"users"> }) {
  const { colorScheme: scheme } = useColorScheme();
  const isDark = scheme === "dark";

  const currentUser = useQuery(api.users.currentUser);
  const user = useQuery(api.users.getUser, { userId });
  const globalRank = useQuery(api.users.getGlobalRank, { userId });

  const follow = useMutation(api.users.followUser);
  const unfollow = useMutation(api.users.unfollowUser);

  const getOrCreate = useMutation(api.messages.getOrCreateConversation);

  const handleMessage = async () => {
    const convId = await getOrCreate({ otherUserId: user?._id! });
    router.push(`/(tabs)/(messages)/conversation?id=${convId}` as any);
  };

  if (!currentUser || !user) return null;

  const level = Math.floor((user.points ?? 0) / 200) + 1;
  const progressPct = Math.round(((user.points ?? 0) % 200) / 200 * 100);
  const isFollowing = user.followers?.includes(currentUser._id);
  const isMe = user._id === currentUser._id;

  return (
    <View className="w-full pb-6">

      {/* ── Avatar ── */}
      <View className="items-center pt-6 pb-4">
        <View className="w-28 h-28 rounded-full bg-slate-200 dark:bg-slate-800 border-4 border-white dark:border-slate-700 items-center justify-center shadow-sm mb-3">
          <Text style={{ fontSize: 64 }}>{user.icon}</Text>
        </View>
        <Text className="text-slate-900 dark:text-white text-2xl font-black">{user.name}</Text>

        {/* Level + XP bar */}
        <View className="mt-2 items-center gap-1 w-48">
          <View className="flex-row items-center justify-between w-full px-1">
            <Text className="text-slate-400 dark:text-slate-500 text-xs font-semibold">Level {level}</Text>
            <Text className="text-slate-400 dark:text-slate-500 text-xs">{user.points ?? 0} XP</Text>
          </View>
          <View className="h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <View className="h-full bg-indigo-500 rounded-full" style={{ width: `${progressPct}%` }} />
          </View>
        </View>
      </View>

      {/* ── Stats row ── */}
      <View className="flex-row mx-5 gap-3 mb-5">
        {[
          { label: 'Rank', value: `#${globalRank ?? '—'}`, icon: '🌎' },
          { label: 'Followers', value: String(user.followers?.length ?? 0), icon: '👥' },
          { label: 'Following', value: String(user.following?.length ?? 0), icon: '➕' },
        ].map((s) => (
          <View
            key={s.label}
            className="flex-1 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-3 items-center"
          >
            <Text className="text-base mb-0.5">{s.icon}</Text>
            <Text className="text-slate-900 dark:text-white font-black text-lg leading-none">{s.value}</Text>
            <Text className="text-slate-400 dark:text-slate-500 text-xs mt-0.5">{s.label}</Text>
          </View>
        ))}
      </View>

      {/* ── Action buttons ── */}
      {!isMe && (
        <View className="flex-row gap-3 mx-5">
          {isFollowing ? (
            <Pressable
              onPress={() => unfollow({ unfollowedId: user._id })}
              className="flex-1 flex-row items-center justify-center gap-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl py-3 active:opacity-70"
            >
              <Ionicons name="checkmark" size={16} color={isDark ? '#94a3b8' : '#64748b'} />
              <Text className="text-slate-600 dark:text-slate-300 font-bold text-base">Following</Text>
            </Pressable>
          ) : (
            <Pressable
              onPress={() => follow({ followedId: user._id })}
              className="flex-1 flex-row items-center justify-center gap-2 bg-indigo-500 rounded-2xl py-3 active:opacity-80"
            >
              <Ionicons name="person-add" size={16} color="white" />
              <Text className="text-white font-bold text-base">Follow</Text>
            </Pressable>
          )}
          <Pressable className="flex-1 flex-row items-center justify-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl py-3 active:opacity-70" onPress={handleMessage}>
            <Ionicons name="paper-plane" size={16} color={isDark ? '#818cf8' : '#6366f1'} />
            <Text className="text-indigo-600 dark:text-indigo-400 font-bold text-base">Message</Text>
          </Pressable>
        </View>
      )}

    </View>
  );
}
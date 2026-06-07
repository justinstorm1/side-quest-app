import { View, Text, ScrollView, Pressable, useColorScheme } from 'react-native'
import { useState } from 'react'
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { Ionicons } from '@expo/vector-icons';

const DIFF: Record<string, { label: string; color: string; bg: string }> = {
  easy:   { label: 'Easy',   color: 'text-green-600 dark:text-green-400',  bg: 'bg-green-100 dark:bg-green-950'  },
  medium: { label: 'Medium', color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-100 dark:bg-orange-950' },
  hard:   { label: 'Hard',   color: 'text-red-600 dark:text-red-400',      bg: 'bg-red-100 dark:bg-red-950'      },
};

const FILTERS = ['All', 'Easy', 'Medium', 'Hard'];

export default function Index() {
  const insets = useSafeAreaInsets();
  const user = useQuery(api.users.currentUser);
  const quests = useQuery(api.quests.getAllQuests);
  const isDark = useColorScheme() === 'dark';
  const [filter, setFilter] = useState('All');

  const points = user?.points ?? 0;
  const level = Math.floor(points / 200) + 1;
  const progressPct = Math.round(((points % 200) / 200) * 100);

  const filtered = quests?.filter((q) =>
    filter === 'All' ? true : q.difficultly === filter.toLowerCase()
  ) ?? [];

  return (
    <View className="flex-1 bg-slate-100 dark:bg-slate-900">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: insets.bottom + 40 }}
      >

        {/* ── Header ── */}
        <View className="flex-row justify-between items-center px-5 mb-5">
          <Pressable
            className="flex-row gap-3 items-center"
            onPress={() => router.push('/(tabs)/(profile)/profile')}
          >
            <View className="h-11 w-11 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 items-center justify-center">
              <Text className="text-xl">{user?.icon}</Text>
            </View>
            <View>
              <Text className="text-slate-400 dark:text-slate-500 text-[10px] font-semibold uppercase tracking-widest">Welcome back</Text>
              <Text className="text-slate-900 dark:text-white font-bold text-base leading-tight">{user?.name}</Text>
            </View>
          </Pressable>
          <View className="flex-row items-center gap-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-3.5 py-2">
            <Text className="text-slate-900 dark:text-white font-black text-base">{points}</Text>
            <Text className="text-base">⚡️</Text>
          </View>
        </View>

        {/* ── Level bar ── */}
        <View className="mx-5 mb-5">
          <View className="flex-row justify-between mb-1.5">
            <Text className="text-slate-500 dark:text-slate-400 text-xs font-semibold">Level {level}</Text>
            <Text className="text-slate-400 dark:text-slate-500 text-xs">{points % 200} / 200 XP</Text>
          </View>
          <View className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <View className="h-full bg-indigo-500 rounded-full" style={{ width: `${progressPct}%` }} />
          </View>
        </View>

        {/* ── Daily challenge ── */}
        <View className="mx-5 mb-5 bg-indigo-500 rounded-2xl p-4 flex-row items-center gap-3 overflow-hidden">
          <View className="absolute -right-3 -top-3 w-20 h-20 rounded-full bg-indigo-400 opacity-25" />
          <Text className="text-3xl">⚔️</Text>
          <View className="flex-1">
            <Text className="text-indigo-200 text-[10px] font-bold tracking-widest uppercase">Daily Challenge</Text>
            <Text className="text-white font-bold text-sm mt-0.5">Complete 3 quests today</Text>
          </View>
          <Text className="text-indigo-200 font-bold text-sm">+200 XP</Text>
        </View>

        {/* ── Filter pills ── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}
          className="mb-4"
        >
          {FILTERS.map((f) => (
            <Pressable
              key={f}
              onPress={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full border ${
                filter === f
                  ? 'bg-indigo-500 border-indigo-500'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
              }`}
            >
              <Text className={`text-sm font-semibold ${filter === f ? 'text-white' : 'text-slate-600 dark:text-slate-300'}`}>
                {f}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* ── Quest count ── */}
        <View className="flex-row justify-between items-center px-5 mb-3">
          <Text className="text-slate-900 dark:text-white font-bold text-base">
            {filter === 'All' ? 'All Quests' : `${filter} Quests`}
          </Text>
          <Text className="text-slate-400 dark:text-slate-500 text-sm">{filtered.length} available</Text>
        </View>

        {/* ── Quest list ── */}
        <View className="px-5 gap-2">
          {filtered.map((q) => {
            const d = DIFF[q.difficultly ?? 'easy'];
            return (
              <Pressable
                key={q._id}
                onPress={() => router.push(`/(tabs)/(home)/quest?id=${q._id}` as any)}
                className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 flex-row items-center gap-3 active:opacity-70"
              >
                {/* Icon */}
                <View className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-700 items-center justify-center border border-slate-100 dark:border-slate-600 shrink-0">
                  <Text className="text-2xl">{q.icon ?? '🎯'}</Text>
                </View>

                {/* Info */}
                <View className="flex-1 gap-0.5">
                  <Text className="text-slate-900 dark:text-white font-bold text-sm leading-tight" numberOfLines={1}>
                    {q.title}
                  </Text>
                  <Text className="text-slate-400 dark:text-slate-500 text-xs leading-snug" numberOfLines={1}>
                    {q.description}
                  </Text>
                  <View className="flex-row items-center gap-1.5 mt-1">
                    {q.difficultly && (
                      <View className={`px-2 py-0.5 rounded-full ${d.bg}`}>
                        <Text className={`text-[10px] font-bold ${d.color}`}>{d.label}</Text>
                      </View>
                    )}
                    {q.needsLocationVerification && (
                      <View className="flex-row items-center gap-0.5">
                        <Ionicons name="location" size={10} color={isDark ? '#64748b' : '#94a3b8'} />
                        <Text className="text-slate-400 dark:text-slate-500 text-[10px]">
                          {q.locationThresholdMiles ?? 100} mi
                        </Text>
                      </View>
                    )}
                    {q.needsImageVerification && (
                      <View className="flex-row items-center gap-0.5">
                        <Ionicons name="camera" size={10} color={isDark ? '#64748b' : '#94a3b8'} />
                        <Text className="text-slate-400 dark:text-slate-500 text-[10px]">Photo</Text>
                      </View>
                    )}
                  </View>
                </View>

                {/* XP */}
                <View className="items-end shrink-0">
                  <Text className="text-indigo-600 dark:text-indigo-400 font-black text-base">+{q.points ?? 0}</Text>
                  <Text className="text-slate-400 dark:text-slate-500 text-[10px]">XP</Text>
                </View>
              </Pressable>
            );
          })}

          {filtered.length === 0 && quests !== undefined && (
            <View className="items-center py-16">
              <Text className="text-4xl mb-3">🗺️</Text>
              <Text className="text-slate-500 dark:text-slate-400 font-semibold">No quests found</Text>
            </View>
          )}
        </View>

      </ScrollView>
    </View>
  );
}
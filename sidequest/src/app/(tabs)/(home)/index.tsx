import { View, Text, ScrollView, Pressable, Platform, useColorScheme, Dimensions } from 'react-native'
import React, { useState } from 'react'
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const SAMPLE_QUESTS = [
  { id: '1', title: 'Morning Run', desc: 'Run 1 mile before 9am', points: 50, difficulty: 'Easy', icon: '🏃', lat: 40.7128, lng: -74.006 },
  { id: '2', title: 'Read 30 Minutes', desc: 'Read any book for 30 mins', points: 75, difficulty: 'Easy', icon: '📚', lat: 40.7128, lng: -74.006 },
  { id: '3', title: 'Cook a New Recipe', desc: "Try something you've never made", points: 120, difficulty: 'Medium', icon: '🍳', lat: 40.7128, lng: -74.006 },
  { id: '4', title: 'No Screen Hour', desc: 'One full hour, no screens', points: 100, difficulty: 'Hard', icon: '🧘', lat: 40.7128, lng: -74.006 },
];

const DIFF: Record<string, { bg: string; text: string; dot: string }> = {
  Easy:   { bg: 'bg-green-100 dark:bg-green-950', text: 'text-green-700 dark:text-green-400', dot: 'bg-green-500' },
  Medium: { bg: 'bg-orange-100 dark:bg-orange-950', text: 'text-orange-700 dark:text-orange-400', dot: 'bg-orange-500' },
  Hard:   { bg: 'bg-red-100 dark:bg-red-950', text: 'text-red-700 dark:text-red-400', dot: 'bg-red-500' },
};

export default function Index() {
  const insets = useSafeAreaInsets();
  const user = useQuery(api.users.currentUser);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [completedIds] = useState<string[]>([]);

  const points = user?.points ?? 0;
  const level = Math.floor(points / 200) + 1;
  const progressPct = Math.round(((points % 200) / 200) * 100);
  const streak = 4;

  return (
    <View className="flex-1 bg-slate-100 dark:bg-slate-900">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: insets.bottom + 40 }}
        showsVerticalScrollIndicator={false}
      >

        {/* ── Header ── */}
        <View className="flex-row justify-between items-center px-5 mb-6">
          <Pressable
            className="flex-row gap-3 items-center"
            onPress={() => router.push('/(tabs)/(profile)/profile')}
          >
            <View className="h-12 w-12 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 items-center justify-center shadow-sm">
              <Text className="text-2xl">{user?.icon}</Text>
            </View>
            <View>
              <Text className="uppercase text-slate-400 dark:text-slate-500 font-bold text-[10px] tracking-widest">
                Welcome Back
              </Text>
              <Text className="text-slate-900 dark:text-white font-bold text-lg leading-tight">
                {user?.name}
              </Text>
            </View>
          </Pressable>

          <View className="flex-row items-center bg-white dark:bg-slate-800 ps-4 pe-2 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700">
            <Text className="text-slate-900 dark:text-white font-black text-xl">{points}⚡️</Text>
          </View>
        </View>

        {/* ── Level + Progress card ── */}
        <View className="mx-5 mb-4 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-5">
          <View className="flex-row justify-between items-start mb-4">
            <View>
              <Text className="text-slate-400 dark:text-slate-500 text-xs font-semibold tracking-widest uppercase mb-0.5">
                Your Level
              </Text>
              <Text className="text-slate-900 dark:text-white text-3xl font-black">
                Level {level}
              </Text>
            </View>
            <View className="bg-indigo-50 dark:bg-indigo-950 rounded-2xl px-4 py-2 border border-indigo-100 dark:border-indigo-900 items-center">
              <Text className="text-indigo-500 dark:text-indigo-400 text-xs font-bold tracking-widest uppercase">XP</Text>
              <Text className="text-indigo-600 dark:text-indigo-300 text-xl font-black">{points}</Text>
            </View>
          </View>

          <View className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden mb-2">
            <View
              className="h-full bg-indigo-500 rounded-full"
              style={{ width: `${progressPct}%` }}
            />
          </View>
          <Text className="text-slate-400 dark:text-slate-500 text-xs">
            {points % 200} / 200 XP to Level {level + 1}
          </Text>
        </View>

        {/* ── Stats row ── */}
        <View className="flex-row gap-3 mx-5 mb-6">
          {[
            { label: 'Completed', value: String(completedIds.length), icon: 'checkmark.circle.fill' as const, emoji: '✅' },
            { label: 'Day Streak', value: `${streak}`, emoji: '🔥', icon: null },
            { label: 'This Week', value: '3', emoji: '📅', icon: null },
          ].map((s) => (
            <View
              key={s.label}
              className="flex-1 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-3.5 items-center"
            >
              <Text className="text-2xl mb-1">{s.emoji}</Text>
              <Text className="text-slate-900 dark:text-white font-black text-lg leading-none">{s.value}</Text>
              <Text className="text-slate-400 dark:text-slate-500 text-[11px] mt-1 text-center">{s.label}</Text>
            </View>
          ))}
        </View>

        {/* ── Daily Challenge ── */}
        <View className="mx-5 mb-6 bg-indigo-500 rounded-3xl p-5 flex-row items-center gap-4 overflow-hidden">
          <View className="absolute -right-4 -top-4 w-28 h-28 rounded-full bg-indigo-400 opacity-30" />
          <View className="absolute right-8 -bottom-6 w-20 h-20 rounded-full bg-indigo-600 opacity-40" />
          <Text className="text-4xl">⚔️</Text>
          <View className="flex-1">
            <Text className="text-indigo-200 text-[10px] font-bold tracking-widest uppercase mb-0.5">
              Daily Challenge
            </Text>
            <Text className="text-white font-black text-base leading-snug">Complete 3 quests today</Text>
            <Text className="text-indigo-200 text-sm mt-0.5">+200 bonus XP</Text>
          </View>
          <View className="bg-white/20 rounded-2xl px-3 py-2 border border-white/30">
            <Text className="text-white font-bold text-sm">Go →</Text>
          </View>
        </View>

        {/* ── Active Quests ── */}
        <View className="flex-row justify-between items-center px-5 mb-3">
          <Text className="text-slate-900 dark:text-white font-black text-lg">Active Quests</Text>
          <Pressable>
            <Text className="text-indigo-500 dark:text-indigo-400 text-sm font-semibold">See all →</Text>
          </Pressable>
        </View>

        <View className="gap-2.5 px-5">
          {SAMPLE_QUESTS.map((q) => {
            const done = completedIds.includes(q.id);
            const d = DIFF[q.difficulty];
            return (
              <Pressable
                key={q.id}
                onPress={() => !done && router.push(`/(tabs)/(home)/quest?id=${q.id}` as any)}
                //onPress={() => !done && router.push(`/(tabs)/(home)/quest`)}
                className={`bg-white dark:bg-slate-800 rounded-2xl border p-4 flex-row items-center gap-3.5 active:opacity-70
                  ${done ? 'border-green-200 dark:border-green-900 opacity-60' : 'border-slate-200 dark:border-slate-700'}`}
              >
                {/* Icon */}
                <View className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-700 items-center justify-center border border-slate-100 dark:border-slate-600">
                  <Text className="text-3xl">{done ? '✅' : q.icon}</Text>
                </View>

                {/* Info */}
                <View className="flex-1 gap-0.5">
                  <Text className="text-slate-900 dark:text-white font-bold text-base leading-tight">
                    {q.title}
                  </Text>
                  <Text className="text-slate-400 dark:text-slate-500 text-sm leading-snug">
                    {q.desc}
                  </Text>
                  <View className="flex-row items-center gap-1.5 mt-1">
                    <View className={`flex-row items-center gap-1 px-2 py-0.5 rounded-full ${d.bg}`}>
                      <View className={`w-1.5 h-1.5 rounded-full ${d.dot}`} />
                      <Text className={`text-xs font-semibold ${d.text}`}>{q.difficulty}</Text>
                    </View>
                    <Text className="text-slate-300 dark:text-slate-600 text-xs">•</Text>
                    <Text className="text-slate-400 dark:text-slate-500 text-xs">📍 ~2 mi away</Text>
                  </View>
                </View>

                {/* XP + chevron */}
                <View className="items-end gap-1">
                  <View className="bg-indigo-50 dark:bg-indigo-950 rounded-xl px-2.5 py-1 border border-indigo-100 dark:border-indigo-900">
                    <Text className="text-indigo-600 dark:text-indigo-400 font-black text-sm">+{q.points}</Text>
                    <Text className="text-indigo-400 dark:text-indigo-500 text-[10px] text-center">XP</Text>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={14}
                    color={isDark ? '#475569' : '#cbd5e1'}
                  />
                </View>
              </Pressable>
            );
          })}
        </View>

      </ScrollView>
    </View>
  );
}
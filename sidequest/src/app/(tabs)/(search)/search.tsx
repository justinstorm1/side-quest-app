import { View, Text, ScrollView, Pressable, Platform, useColorScheme, TextInput } from 'react-native'
import React, { useState, useMemo } from 'react'
import { router, Stack } from 'expo-router'
import { useQuery } from 'convex/react'
import { api } from '../../../../convex/_generated/api'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'

export default function Search() {
  const users = useQuery(api.users.getAllUsers);
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    if (!users) return [];
    if (!query.trim()) return users;
    const q = query.toLowerCase();
    return users.filter((u) => u.name?.toLowerCase().includes(q));
  }, [users, query]);

  return (
    <>
      <Stack.Screen
        options={{
          headerTransparent: true,
          headerTitle: 'Search',
          headerTintColor: isDark ? '#fff' : '#000',
        }}
        />
        {/* iOS search wired up */}
        {Platform.OS === 'ios' && (
          <Stack.SearchBar
            placeholder="Search players…"
            placement="automatic"
            onChangeText={(e) => setQuery(e.nativeEvent.text)}
          />
        )}

      <View className="flex-1 bg-slate-100 dark:bg-slate-900">
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            paddingTop: Platform.OS === 'android' ? insets.top + 70 : 8,
            paddingBottom: insets.bottom + 32,
            paddingHorizontal: 20,
          }}
        >
          {/* Search bar (Android only — iOS uses Stack.SearchBar) */}
          {Platform.OS === 'android' && (
            <View className="flex-row items-center bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 px-3 mb-5 h-12">
              <Ionicons name="search" size={18} color={isDark ? '#64748b' : '#94a3b8'} />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Search players…"
                placeholderTextColor={isDark ? '#475569' : '#94a3b8'}
                className="flex-1 ml-2 text-slate-900 dark:text-white text-base"
                autoCapitalize="none"
                autoCorrect={false}
                />
              {query.length > 0 && (
                <Pressable onPress={() => setQuery('')}>
                  <Ionicons name="close-circle" size={18} color={isDark ? '#64748b' : '#94a3b8'} />
                </Pressable>
              )}
            </View>
          )}


          {/* Results count */}
          {query.trim().length > 0 && (
            <Text className="text-slate-400 dark:text-slate-500 text-xs font-semibold uppercase tracking-widest mb-3">
              {filtered.length} result{filtered.length !== 1 ? 's' : ''}
            </Text>
          )}

          {!query.trim() && (
            <Text className="text-slate-400 dark:text-slate-500 text-xs font-semibold uppercase tracking-widest mb-3">
              All Players
            </Text>
          )}

          {/* User list */}
          <View className="gap-2.5">
            {filtered.length === 0 && users !== undefined ? (
              <View className="items-center py-16">
                <Text className="text-4xl mb-3">🔍</Text>
                <Text className="text-slate-500 dark:text-slate-400 font-semibold text-base">No players found</Text>
                <Text className="text-slate-400 dark:text-slate-500 text-sm mt-1">Try a different name</Text>
              </View>
            ) : (
              filtered.map((user, index) => (
                <Pressable
                  key={user._id}
                  onPress={() => router.push(`/userprofile?userId=${user._id}` as any)}
                  className="flex-row items-center gap-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-3.5 active:opacity-70"
                >
                  {/* Rank badge */}
                  <View className="w-6 items-center">
                    {index === 0 && !query.trim() ? (
                      <Text className="text-base">🥇</Text>
                    ) : index === 1 && !query.trim() ? (
                      <Text className="text-base">🥈</Text>
                    ) : index === 2 && !query.trim() ? (
                      <Text className="text-base">🥉</Text>
                    ) : (
                      <Text className="text-slate-400 dark:text-slate-500 text-xs font-bold">#{index + 1}</Text>
                    )}
                  </View>

                  {/* Avatar */}
                  <View className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 items-center justify-center">
                    <Text className="text-2xl">{user.icon}</Text>
                  </View>

                  {/* Info */}
                  <View className="flex-1">
                    <Text className="text-slate-900 dark:text-white font-bold text-base">{user.name}</Text>
                    <Text className="text-slate-400 dark:text-slate-500 text-xs mt-0.5">
                      Level {Math.floor((user.points ?? 0) / 200) + 1}
                    </Text>
                  </View>

                  {/* XP */}
                  <View className="items-end gap-1">
                    <View className="bg-indigo-50 dark:bg-indigo-950 rounded-xl px-2.5 py-1 border border-indigo-100 dark:border-indigo-900">
                      <Text className="text-indigo-600 dark:text-indigo-400 font-black text-sm">{user.points ?? 0}</Text>
                    </View>
                    <Text className="text-slate-400 dark:text-slate-500 text-[10px]">⚡️ XP</Text>
                  </View>

                  <Ionicons name="chevron-forward" size={14} color={isDark ? '#475569' : '#cbd5e1'} />
                </Pressable>
              ))
            )}
          </View>
        </ScrollView>
      </View>
    </>
  );
}
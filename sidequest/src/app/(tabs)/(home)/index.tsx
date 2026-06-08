import { View, Text, ScrollView, Pressable, useColorScheme } from 'react-native'
import { useState, useEffect } from 'react'
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  interpolate,
} from 'react-native-reanimated';

const DIFF: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  easy:   { label: 'Easy',   color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950',  dot: '#10b981' },
  medium: { label: 'Medium', color: 'text-amber-600 dark:text-amber-400',     bg: 'bg-amber-50 dark:bg-amber-950',      dot: '#f59e0b' },
  hard:   { label: 'Hard',   color: 'text-rose-600 dark:text-rose-400',       bg: 'bg-rose-50 dark:bg-rose-950',        dot: '#f43f5e' },
};

const FILTERS = ['All', 'Easy', 'Medium', 'Hard'];

function QuestCard({ q, isDark, index }: { q: any; isDark: boolean; index: number }) {
  const d = DIFF[q.difficultly ?? 'easy'];
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(16);

  useEffect(() => {
    opacity.value = withDelay(index * 40, withTiming(1, { duration: 300 }));
    translateY.value = withDelay(index * 40, withSpring(0, { damping: 20, stiffness: 140 }));
  }, []);

  const cardStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
  }));

  return (
    <Animated.View style={cardStyle}>
      <Pressable
        onPressIn={() => { scale.value = withSpring(0.98, { damping: 20 }); }}
        onPressOut={() => { scale.value = withSpring(1, { damping: 15 }); }}
        onPress={() => router.push(`/(tabs)/(home)/quest?id=${q._id}` as any)}
        style={{
          backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.9)',
          borderRadius: 20,
          borderWidth: 1,
          borderColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)',
          padding: 14,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
        }}
      >
        {/* Icon */}
        <View style={{
          width: 52, height: 52,
          borderRadius: 16,
          backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
          alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Text style={{ fontSize: 26 }}>{q.icon ?? '🎯'}</Text>
        </View>

        {/* Info */}
        <View style={{ flex: 1, gap: 2 }}>
          <Text
            style={{ fontSize: 14, fontWeight: '700', color: isDark ? '#f1f5f9' : '#0f172a', letterSpacing: -0.2 }}
            numberOfLines={1}
          >
            {q.title}
          </Text>
          <Text
            style={{ fontSize: 12, color: isDark ? '#64748b' : '#94a3b8', lineHeight: 16 }}
            numberOfLines={1}
          >
            {q.description}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
            {q.difficultly && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 7, paddingVertical: 2, borderRadius: 20, backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)' }}>
                <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: d.dot }} />
                <Text style={{ fontSize: 10, fontWeight: '700', color: isDark ? '#94a3b8' : '#64748b', letterSpacing: 0.3 }}>
                  {d.label.toUpperCase()}
                </Text>
              </View>
            )}
            {q.needsLocationVerification && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                <Ionicons name="location" size={10} color={isDark ? '#475569' : '#94a3b8'} />
                <Text style={{ fontSize: 10, color: isDark ? '#475569' : '#94a3b8' }}>{q.locationThresholdMiles ?? 100}mi</Text>
              </View>
            )}
            {q.needsImageVerification && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                <Ionicons name="camera" size={10} color={isDark ? '#475569' : '#94a3b8'} />
                <Text style={{ fontSize: 10, color: isDark ? '#475569' : '#94a3b8' }}>Photo</Text>
              </View>
            )}
          </View>
        </View>

        {/* XP badge */}
        <View style={{
          alignItems: 'center',
          backgroundColor: isDark ? 'rgba(99,102,241,0.15)' : 'rgba(99,102,241,0.08)',
          borderRadius: 12,
          paddingHorizontal: 10, paddingVertical: 6,
          flexShrink: 0,
        }}>
          <Text style={{ fontSize: 15, fontWeight: '900', color: isDark ? '#818cf8' : '#6366f1', letterSpacing: -0.5 }}>
            +{q.points ?? 0}
          </Text>
          <Text style={{ fontSize: 9, fontWeight: '700', color: isDark ? '#4f46e5' : '#a5b4fc', letterSpacing: 1 }}>XP</Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

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

  // Header entrance
  const headerOpacity = useSharedValue(0);
  const headerY = useSharedValue(-10);
  useEffect(() => {
    headerOpacity.value = withTiming(1, { duration: 500 });
    headerY.value = withSpring(0, { damping: 20 });
  }, []);
  const headerStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: headerY.value }],
  }));

  const bg = isDark ? '#080b12' : '#f1f0eb';
  const cardBg = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.92)';
  const border = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)';
  const textPrimary = isDark ? '#f1f5f9' : '#0f172a';
  const textMuted = isDark ? '#475569' : '#94a3b8';

  return (
    <View style={{ flex: 1, backgroundColor: bg }}>

      {/* Ambient glow */}
      <View style={{
        position: 'absolute', top: -80, right: -60,
        width: 280, height: 280, borderRadius: 140,
        backgroundColor: isDark ? 'rgba(99,102,241,0.06)' : 'rgba(99,102,241,0.05)',
      }} />
      <View style={{
        position: 'absolute', top: 200, left: -80,
        width: 200, height: 200, borderRadius: 100,
        backgroundColor: isDark ? 'rgba(168,85,247,0.04)' : 'rgba(168,85,247,0.03)',
      }} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: insets.bottom + 48, gap: 0 }}
      >

        {/* ── Header ── */}
        <Animated.View style={[headerStyle, { paddingHorizontal: 20, marginBottom: 20 }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Pressable
              onPress={() => router.push('/(tabs)/(profile)/profile')}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}
            >
              <View style={{
                width: 42, height: 42, borderRadius: 21,
                backgroundColor: cardBg,
                borderWidth: 1, borderColor: border,
                alignItems: 'center', justifyContent: 'center',
              }}>
                <Text style={{ fontSize: 20 }}>{user?.icon}</Text>
              </View>
              <View>
                <Text style={{ fontSize: 10, fontWeight: '700', letterSpacing: 1.5, color: textMuted, textTransform: 'uppercase' }}>
                  Welcome back
                </Text>
                <Text style={{ fontSize: 16, fontWeight: '800', color: textPrimary, letterSpacing: -0.3 }}>
                  {user?.name}
                </Text>
              </View>
            </Pressable>

            <View style={{
              flexDirection: 'row', alignItems: 'center', gap: 4,
              backgroundColor: cardBg, borderWidth: 1, borderColor: border,
              borderRadius: 16, paddingHorizontal: 14, paddingVertical: 9,
            }}>
              <Text style={{ fontSize: 16, fontWeight: '900', color: textPrimary }}>{points}</Text>
              <Text style={{ fontSize: 15 }}>⚡️</Text>
            </View>
          </View>
        </Animated.View>

        {/* ── Level card ── */}
        <Animated.View style={[headerStyle, { paddingHorizontal: 20, marginBottom: 16 }]}>
          <View style={{
            backgroundColor: cardBg,
            borderRadius: 24, borderWidth: 1, borderColor: border,
            padding: 18,
          }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 14 }}>
              <View>
                <Text style={{ fontSize: 11, fontWeight: '700', letterSpacing: 1.5, color: textMuted, textTransform: 'uppercase', marginBottom: 2 }}>
                  Your Level
                </Text>
                <Text style={{ fontSize: 30, fontWeight: '900', color: textPrimary, letterSpacing: -1 }}>
                  Level {level}
                </Text>
              </View>
              <View style={{
                backgroundColor: isDark ? 'rgba(99,102,241,0.15)' : 'rgba(99,102,241,0.08)',
                borderRadius: 14, paddingHorizontal: 14, paddingVertical: 8, alignItems: 'center',
              }}>
                <Text style={{ fontSize: 10, fontWeight: '700', letterSpacing: 1.5, color: isDark ? '#818cf8' : '#6366f1', textTransform: 'uppercase' }}>
                  Total XP
                </Text>
                <Text style={{ fontSize: 22, fontWeight: '900', color: isDark ? '#818cf8' : '#6366f1', letterSpacing: -0.5 }}>
                  {points}
                </Text>
              </View>
            </View>

            {/* Progress bar */}
            <View style={{ height: 6, backgroundColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)', borderRadius: 3, overflow: 'hidden', marginBottom: 8 }}>
              <View style={{
                height: '100%', width: `${progressPct}%`,
                backgroundColor: '#6366f1', borderRadius: 3,
              }} />
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 11, color: textMuted, fontWeight: '500' }}>
                {points % 200} / 200 XP
              </Text>
              <Text style={{ fontSize: 11, color: textMuted, fontWeight: '500' }}>
                Level {level + 1} →
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* ── Daily challenge ── */}
        <Animated.View style={[headerStyle, { paddingHorizontal: 20, marginBottom: 20 }]}>
          <View style={{
            borderRadius: 20, overflow: 'hidden',
            backgroundColor: '#6366f1',
            padding: 16,
            flexDirection: 'row', alignItems: 'center', gap: 14,
          }}>
            {/* Decorative circles */}
            <View style={{ position: 'absolute', right: -20, top: -20, width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(255,255,255,0.07)' }} />
            <View style={{ position: 'absolute', right: 30, bottom: -30, width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.05)' }} />

            <View style={{
              width: 44, height: 44, borderRadius: 14,
              backgroundColor: 'rgba(255,255,255,0.15)',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <Text style={{ fontSize: 22 }}>⚔️</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 10, fontWeight: '700', letterSpacing: 1.5, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', marginBottom: 2 }}>
                Daily Challenge
              </Text>
              <Text style={{ fontSize: 14, fontWeight: '700', color: '#fff' }}>
                Complete 3 quests today
              </Text>
            </View>
            <View style={{
              backgroundColor: 'rgba(255,255,255,0.15)',
              borderRadius: 12, paddingHorizontal: 12, paddingVertical: 6,
            }}>
              <Text style={{ fontSize: 13, fontWeight: '800', color: '#fff' }}>+200 XP</Text>
            </View>
          </View>
        </Animated.View>

        {/* ── Filters ── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}
          style={{ marginBottom: 16 }}
        >
          {FILTERS.map((f) => (
            <Pressable
              key={f}
              onPress={() => setFilter(f)}
              style={{
                paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20,
                backgroundColor: filter === f
                  ? '#6366f1'
                  : cardBg,
                borderWidth: 1,
                borderColor: filter === f ? '#6366f1' : border,
              }}
            >
              <Text style={{
                fontSize: 13, fontWeight: '600',
                color: filter === f ? '#fff' : textMuted,
                letterSpacing: 0.1,
              }}>
                {f}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* ── Quest list header ── */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 12 }}>
          <Text style={{ fontSize: 15, fontWeight: '800', color: textPrimary, letterSpacing: -0.3 }}>
            {filter === 'All' ? 'All Quests' : `${filter} Quests`}
          </Text>
          <Text style={{ fontSize: 12, color: textMuted, fontWeight: '500' }}>
            {filtered.length} available
          </Text>
        </View>

        {/* ── Quest cards ── */}
        <View style={{ paddingHorizontal: 20, gap: 8 }}>
          {filtered.map((q, i) => (
            <QuestCard key={q._id} q={q} isDark={isDark} index={i} />
          ))}

          {filtered.length === 0 && quests !== undefined && (
            <View style={{ alignItems: 'center', paddingVertical: 60 }}>
              <Text style={{ fontSize: 40, marginBottom: 12 }}>🗺️</Text>
              <Text style={{ fontSize: 15, fontWeight: '600', color: textMuted }}>No quests found</Text>
            </View>
          )}
        </View>

      </ScrollView>
    </View>
  );
}
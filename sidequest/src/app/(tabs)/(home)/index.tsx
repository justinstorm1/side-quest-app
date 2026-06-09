import { View, Text, ScrollView, Pressable, useColorScheme, Platform } from 'react-native'
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
} from 'react-native-reanimated';

// ─── Palette ──────────────────────────────────────────────────────────────────
// One strong purple accent, everything else is near-black or slate.
// Dark mode is the primary experience.
const C = {
  // Backgrounds
  bgDeep:    '#07060f',   // near-black with a hint of violet
  bgSurface: '#0f0d1a',   // cards / panels
  bgRaised:  '#181525',   // elevated elements
  bgChip:    '#1e1b30',   // small chips/tags

  // Purple accent family
  violet:    '#7c3aed',   // primary action (vibrant violet)
  violetMid: '#6d28d9',   // pressed / border
  violetGlow:'rgba(124,58,237,0.18)',
  violetDim: 'rgba(124,58,237,0.10)',
  lilac:     '#a78bfa',   // secondary text accent
  lavender:  '#c4b5fd',   // highlight text

  // Difficulty
  easy:      '#34d399',
  medium:    '#fbbf24',
  hard:      '#f87171',

  // Text
  textHi:    '#f0ebff',   // primary
  textMid:   '#8b7fb8',   // secondary
  textLo:    '#3d3560',   // muted / placeholder

  // Borders
  borderLo:  'rgba(124,58,237,0.12)',
  borderMid: 'rgba(124,58,237,0.25)',
  borderHi:  'rgba(124,58,237,0.55)',
};

// Light overrides
const CL = {
  bgDeep:    '#f5f3ff',
  bgSurface: '#ede9fe',
  bgRaised:  '#fff',
  bgChip:    '#e9e3ff',
  violet:    '#7c3aed',
  violetMid: '#6d28d9',
  violetGlow:'rgba(124,58,237,0.10)',
  violetDim: 'rgba(124,58,237,0.06)',
  lilac:     '#7c3aed',
  lavender:  '#6d28d9',
  easy:      '#059669',
  medium:    '#d97706',
  hard:      '#dc2626',
  textHi:    '#1e0a3c',
  textMid:   '#6d28d9',
  textLo:    '#a78bfa',
  borderLo:  'rgba(109,40,217,0.10)',
  borderMid: 'rgba(109,40,217,0.20)',
  borderHi:  'rgba(109,40,217,0.45)',
};

const DIFF_DOT: Record<string, keyof typeof C> = {
  easy: 'easy', medium: 'medium', hard: 'hard',
};
const DIFF_LABEL: Record<string, string> = {
  easy: 'Easy', medium: 'Med', hard: 'Hard',
};

const FILTERS = ['All', 'Easy', 'Medium', 'Hard'];

// ─── Stat pill ────────────────────────────────────────────────────────────────
function StatPill({ icon, value, label, t }: { icon: string; value: string | number; label: string; t: typeof C }) {
  return (
    <View style={{
      flex: 1, alignItems: 'center', justifyContent: 'center',
      paddingVertical: 12,
      borderRightWidth: 1, borderRightColor: t.borderLo,
    }}>
      <Text style={{ fontSize: 18, marginBottom: 1 }}>{icon}</Text>
      <Text style={{ fontSize: 17, fontWeight: '900', color: t.lavender, letterSpacing: -0.5 }}>
        {value}
      </Text>
      <Text style={{ fontSize: 9, fontWeight: '700', color: t.textMid, letterSpacing: 1.2, textTransform: 'uppercase' }}>
        {label}
      </Text>
    </View>
  );
}

// ─── Quest card — editorial left-bar style ────────────────────────────────────
function QuestCard({ q, t, index }: { q: any; t: typeof C; index: number }) {
  const scale  = useSharedValue(1);
  const opacity = useSharedValue(0);
  const tx = useSharedValue(24);

  useEffect(() => {
    opacity.value = withDelay(index * 55, withTiming(1, { duration: 320 }));
    tx.value      = withDelay(index * 55, withSpring(0, { damping: 22, stiffness: 160 }));
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateX: tx.value }, { scale: scale.value }],
  }));

  const diff = q.difficultly ?? 'easy';
  const diffColor = t[DIFF_DOT[diff] as keyof typeof C] as string;

  return (
    <Animated.View style={animStyle}>
      <Pressable
        onPressIn={() => { scale.value = withSpring(0.975, { damping: 18 }); }}
        onPressOut={() => { scale.value = withSpring(1,     { damping: 14 }); }}
        onPress={() => router.push(`/(tabs)/(home)/quest?id=${q._id}` as any)}
        style={{
          flexDirection: 'row',
          backgroundColor: t.bgSurface,
          borderRadius: 18,
          overflow: 'hidden',
          borderWidth: 1,
          borderColor: t.borderLo,
        }}
      >
        {/* Left accent bar — colored by difficulty */}
        <View style={{ width: 4, backgroundColor: diffColor, borderRadius: 2 }} />

        {/* Main content */}
        <View style={{ flex: 1, padding: 14, flexDirection: 'row', gap: 12, alignItems: 'center' }}>

          {/* Icon box */}
          <View style={{
            width: 48, height: 48, borderRadius: 14,
            backgroundColor: t.bgChip,
            alignItems: 'center', justifyContent: 'center',
            borderWidth: 1, borderColor: t.borderLo,
            flexShrink: 0,
          }}>
            <Text style={{ fontSize: 24 }}>{q.icon ?? '🎯'}</Text>
          </View>

          {/* Text block */}
          <View style={{ flex: 1, gap: 3 }}>
            <Text
              style={{ fontSize: 14, fontWeight: '800', color: t.textHi, letterSpacing: -0.3 }}
              numberOfLines={1}
            >
              {q.title}
            </Text>
            <Text
              style={{ fontSize: 12, color: t.textMid, lineHeight: 16 }}
              numberOfLines={1}
            >
              {q.description}
            </Text>

            {/* Meta row */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 3 }}>
              {/* Diff chip */}
              {q.difficultly && (
                <View style={{
                  flexDirection: 'row', alignItems: 'center', gap: 4,
                  backgroundColor: t.bgChip,
                  paddingHorizontal: 7, paddingVertical: 3, borderRadius: 20,
                }}>
                  <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: diffColor }} />
                  <Text style={{ fontSize: 10, fontWeight: '700', color: t.textMid, letterSpacing: 0.4 }}>
                    {DIFF_LABEL[diff]}
                  </Text>
                </View>
              )}
              {q.needsLocationVerification && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                  <Ionicons name="location" size={10} color={t.textLo} />
                  <Text style={{ fontSize: 10, color: t.textLo }}>{q.locationThresholdMiles ?? 100}mi</Text>
                </View>
              )}
              {q.needsImageVerification && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                  <Ionicons name="camera" size={10} color={t.textLo} />
                  <Text style={{ fontSize: 10, color: t.textLo }}>Photo</Text>
                </View>
              )}
            </View>
          </View>

          {/* XP column */}
          <View style={{ alignItems: 'center', gap: 1, flexShrink: 0 }}>
            <View style={{
              backgroundColor: t.violetDim,
              borderWidth: 1, borderColor: t.borderMid,
              borderRadius: 10, paddingHorizontal: 9, paddingVertical: 5,
              alignItems: 'center',
            }}>
              <Text style={{ fontSize: 15, fontWeight: '900', color: t.lavender, letterSpacing: -0.4 }}>
                +{q.points ?? 0}
              </Text>
              <Text style={{ fontSize: 8, fontWeight: '800', color: t.lilac, letterSpacing: 1.5 }}>XP</Text>
            </View>
          </View>

        </View>
      </Pressable>
    </Animated.View>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function Index() {
  const insets   = useSafeAreaInsets();
  const user     = useQuery(api.users.currentUser);
  const quests   = useQuery(api.quests.getAllQuests);
  const isDark   = useColorScheme() === 'dark';
  const t        = isDark ? C : CL;
  const [filter, setFilter] = useState('All');

  const points      = user?.points ?? 0;
  const level       = Math.floor(points / 200) + 1;
  const progressPct = Math.round(((points % 200) / 200) * 100);
  const toNext      = 200 - (points % 200);

  const filtered = quests?.filter((q) =>
    filter === 'All' ? true : q.difficultly === filter.toLowerCase()
  ) ?? [];

  // Staggered entrance
  const a0 = useSharedValue(0);
  const a1 = useSharedValue(0);
  const a2 = useSharedValue(0);
  useEffect(() => {
    a0.value = withTiming(1, { duration: 400 });
    a1.value = withDelay(80,  withTiming(1, { duration: 400 }));
    a2.value = withDelay(160, withTiming(1, { duration: 400 }));
  }, []);
  const s0 = useAnimatedStyle(() => ({ opacity: a0.value, transform: [{ translateY: (1 - a0.value) * -12 }] }));
  const s1 = useAnimatedStyle(() => ({ opacity: a1.value, transform: [{ translateY: (1 - a1.value) * -10 }] }));
  const s2 = useAnimatedStyle(() => ({ opacity: a2.value, transform: [{ translateY: (1 - a2.value) * -8  }] }));

  return (
    <View style={{ flex: 1, backgroundColor: t.bgDeep }}>

      {/* ── Background glow blobs ── */}
      <View style={{
        position: 'absolute', top: -100, right: -100,
        width: 320, height: 320, borderRadius: 160,
        backgroundColor: isDark ? 'rgba(124,58,237,0.07)' : 'rgba(124,58,237,0.05)',
      }} />
      <View style={{
        position: 'absolute', top: 350, left: -120,
        width: 260, height: 260, borderRadius: 130,
        backgroundColor: isDark ? 'rgba(109,40,217,0.04)' : 'rgba(109,40,217,0.03)',
      }} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + 14,
          paddingBottom: insets.bottom + 56,
          gap: 0,
        }}
      >

        {/* ════════════════════════════════════════
            HEADER  —  identity + XP counter
        ════════════════════════════════════════ */}
        <Animated.View style={[s0, { paddingHorizontal: 20, marginBottom: 18 }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>

            {/* Avatar + name */}
            <Pressable
              onPress={() => router.push('/(tabs)/(profile)/profile')}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 11 }}
            >
              {/* Glowing avatar ring */}
              <View style={{
                padding: 2,
                borderRadius: 24,
                borderWidth: 1.5,
                borderColor: t.borderHi,
                backgroundColor: t.violetGlow,
              }}>
                <View style={{
                  width: 40, height: 40, borderRadius: 20,
                  backgroundColor: t.bgRaised,
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  <Text style={{ fontSize: 20 }}>{user?.icon}</Text>
                </View>
              </View>

              <View>
                <Text style={{
                  fontSize: 10, fontWeight: '700', letterSpacing: 1.8,
                  color: t.textMid, textTransform: 'uppercase',
                }}>
                  Hey there
                </Text>
                <Text style={{
                  fontSize: 18, fontWeight: '900', color: t.textHi,
                  letterSpacing: -0.5, lineHeight: 21,
                }}>
                  {user?.name}
                </Text>
              </View>
            </Pressable>

            {/* XP counter — big typographic treatment */}
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{
                fontSize: 28, fontWeight: '900', color: t.lavender,
                letterSpacing: -1, lineHeight: 30,
              }}>
                {points}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Text style={{ fontSize: 9, fontWeight: '800', color: t.textMid, letterSpacing: 1.5 }}>XP</Text>
                <Text style={{ fontSize: 12 }}>⚡️</Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* ════════════════════════════════════════
            LEVEL STRIP  —  horizontal stat bar
        ════════════════════════════════════════ */}
        <Animated.View style={[s1, { marginHorizontal: 20, marginBottom: 18 }]}>
          <View style={{
            backgroundColor: t.bgSurface,
            borderRadius: 20,
            borderWidth: 1, borderColor: t.borderLo,
            overflow: 'hidden',
          }}>
            {/* Stat pills row */}
            <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: t.borderLo }}>
              <StatPill icon="🏅" value={`Lv ${level}`} label="Level"   t={t} />
              <StatPill icon="⚔️" value={filtered.length}  label="Active" t={t} />
              <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 12 }}>
                <Text style={{ fontSize: 18, marginBottom: 1 }}>🔥</Text>
                <Text style={{ fontSize: 17, fontWeight: '900', color: t.lavender, letterSpacing: -0.5 }}>
                  {toNext}
                </Text>
                <Text style={{ fontSize: 9, fontWeight: '700', color: t.textMid, letterSpacing: 1.2, textTransform: 'uppercase' }}>
                  To Lv {level + 1}
                </Text>
              </View>
            </View>

            {/* Progress track */}
            <View style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 7 }}>
                <Text style={{ fontSize: 10, fontWeight: '700', color: t.textMid, letterSpacing: 0.4 }}>
                  Level {level} Progress
                </Text>
                <Text style={{ fontSize: 10, fontWeight: '800', color: t.lilac }}>
                  {progressPct}%
                </Text>
              </View>

              {/* Segmented progress bar */}
              <View style={{ height: 8, backgroundColor: t.bgChip, borderRadius: 4, overflow: 'hidden', flexDirection: 'row', gap: 2 }}>
                {Array.from({ length: 10 }).map((_, i) => {
                  const filled = i < Math.round(progressPct / 10);
                  return (
                    <View
                      key={i}
                      style={{
                        flex: 1, height: '100%',
                        backgroundColor: filled ? t.violet : 'transparent',
                        borderRadius: 2,
                        opacity: filled ? (0.5 + i * 0.055) : 1,
                      }}
                    />
                  );
                })}
              </View>

              <Text style={{ fontSize: 10, color: t.textLo, marginTop: 6, fontWeight: '600' }}>
                {points % 200} / 200 XP earned this level
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* ════════════════════════════════════════
            DAILY CHALLENGE  —  full-bleed banner
        ════════════════════════════════════════ */}
        <Animated.View style={[s2, { marginHorizontal: 20, marginBottom: 22 }]}>
          <Pressable style={{
            borderRadius: 22,
            overflow: 'hidden',
            borderWidth: 1,
            borderColor: t.borderHi,
          }}>
            {/* Gradient-like layered background */}
            <View style={{
              backgroundColor: t.violet,
              padding: 18,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 14,
            }}>
              {/* Decorative concentric arcs (top-right corner) */}
              <View style={{ position: 'absolute', right: -40, top: -40, width: 130, height: 130, borderRadius: 65, borderWidth: 24, borderColor: 'rgba(255,255,255,0.05)' }} />
              <View style={{ position: 'absolute', right: -10, top: -10, width: 80,  height: 80,  borderRadius: 40, borderWidth: 16, borderColor: 'rgba(255,255,255,0.05)' }} />
              <View style={{ position: 'absolute', left: 0, bottom: -20, width: 120, height: 120, borderRadius: 60, borderWidth: 20, borderColor: 'rgba(0,0,0,0.1)' }} />

              {/* Icon */}
              <View style={{
                width: 52, height: 52, borderRadius: 16,
                backgroundColor: 'rgba(0,0,0,0.2)',
                alignItems: 'center', justifyContent: 'center',
                borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
              }}>
                <Text style={{ fontSize: 26 }}>⚔️</Text>
              </View>

              {/* Text */}
              <View style={{ flex: 1 }}>
                <Text style={{
                  fontSize: 10, fontWeight: '800', letterSpacing: 2,
                  color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase', marginBottom: 3,
                }}>
                  Daily Challenge
                </Text>
                <Text style={{ fontSize: 16, fontWeight: '900', color: '#fff', letterSpacing: -0.3, lineHeight: 20 }}>
                  Complete 3 quests today
                </Text>
              </View>

              {/* Reward */}
              <View style={{
                backgroundColor: 'rgba(0,0,0,0.25)',
                borderRadius: 14, paddingHorizontal: 12, paddingVertical: 8,
                alignItems: 'center',
                borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
              }}>
                <Text style={{ fontSize: 16, fontWeight: '900', color: '#fff', letterSpacing: -0.4 }}>+200</Text>
                <Text style={{ fontSize: 8, fontWeight: '800', color: 'rgba(255,255,255,0.55)', letterSpacing: 1.5 }}>XP</Text>
              </View>
            </View>
          </Pressable>
        </Animated.View>

        {/* ════════════════════════════════════════
            FILTER CHIPS
        ════════════════════════════════════════ */}
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
                paddingHorizontal: 18, paddingVertical: 8, borderRadius: 22,
                backgroundColor: filter === f ? t.violet : t.bgChip,
                borderWidth: 1.5,
                borderColor: filter === f ? t.violet : t.borderMid,
              }}
            >
              <Text style={{
                fontSize: 13, fontWeight: '700',
                color: filter === f ? '#fff' : t.textMid,
                letterSpacing: 0.2,
              }}>
                {f}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* ════════════════════════════════════════
            QUEST LOG HEADER
        ════════════════════════════════════════ */}
        <View style={{
          flexDirection: 'row', alignItems: 'center',
          paddingHorizontal: 20, marginBottom: 12, gap: 10,
        }}>
          {/* Decorative accent line */}
          <View style={{ width: 3, height: 18, borderRadius: 2, backgroundColor: t.violet }} />
          <Text style={{ fontSize: 16, fontWeight: '900', color: t.textHi, letterSpacing: -0.3, flex: 1 }}>
            {filter === 'All' ? 'All Quests' : `${filter} Quests`}
          </Text>
          <View style={{
            backgroundColor: t.bgChip,
            borderRadius: 10, paddingHorizontal: 9, paddingVertical: 4,
            borderWidth: 1, borderColor: t.borderLo,
          }}>
            <Text style={{ fontSize: 11, color: t.textMid, fontWeight: '700' }}>
              {filtered.length} available
            </Text>
          </View>
        </View>

        {/* ════════════════════════════════════════
            QUEST CARDS
        ════════════════════════════════════════ */}
        <View style={{ paddingHorizontal: 20, gap: 10 }}>
          {filtered.map((q, i) => (
            <QuestCard key={q._id} q={q} t={t} index={i} />
          ))}

          {filtered.length === 0 && quests !== undefined && (
            <View style={{ alignItems: 'center', paddingVertical: 60 }}>
              <Text style={{ fontSize: 42, marginBottom: 12 }}>🗺️</Text>
              <Text style={{ fontSize: 14, fontWeight: '700', color: t.textMid, letterSpacing: 0.2 }}>
                No quests found
              </Text>
            </View>
          )}
        </View>

      </ScrollView>
    </View>
  );
}
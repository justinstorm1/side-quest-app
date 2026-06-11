import {
  View,
  Text,
  ScrollView,
  useColorScheme,
  Dimensions,
  Platform,
  StyleSheet,
  Alert,
} from 'react-native';
import { useEffect } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  useAnimatedScrollHandler,
} from 'react-native-reanimated';
import { Stack } from 'expo-router';
import { BlurView } from 'expo-blur';

const MEDAL: Record<number, string> = { 1: '👑', 2: '🥈', 3: '🥉' };
const RANK_COLOR: Record<number, string> = {
  1: '#fbbf24',
  2: '#94a3b8',
  3: '#c47a3a',
};
const STEP_H: Record<number, number> = { 1: 90, 2: 62, 3: 46 };
const AVATAR_SIZE: Record<number, number> = { 1: 68, 2: 54, 3: 46 };
const AVATAR_FONT: Record<number, number> = { 1: 32, 2: 24, 3: 20 };

function levelFromPoints(pts: number) {
  return Math.floor((pts ?? 0) / 200) + 1;
}

// ─── Podium Column ────────────────────────────────────────────────────────────
function PodiumColumn({
  user,
  rank,
  delay,
  isMe,
}: {
  user: any;
  rank: number;
  delay: number;
  isMe: boolean;
}) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(50);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 400 }));
    translateY.value = withDelay(delay, withSpring(0, { damping: 16, stiffness: 110 }));
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const col = RANK_COLOR[rank];
  const isFirst = rank === 1;
  const stepH = STEP_H[rank];
  const avatarSize = AVATAR_SIZE[rank];
  const avatarFont = AVATAR_FONT[rank];

  return (
    <Animated.View style={[animStyle, { flex: 1, alignItems: 'center' }]}>
      <Text style={{ fontSize: isFirst ? 22 : 16, marginBottom: 6 }}>
        {MEDAL[rank]}
      </Text>

      <View
        style={{
          padding: isFirst ? 3 : 2,
          borderRadius: 999,
          borderWidth: isFirst ? 2.5 : 1.5,
          borderColor: col,
          backgroundColor: `${col}22`,
          marginBottom: 8,
          shadowColor: col,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: isFirst ? 0.8 : 0.4,
          shadowRadius: isFirst ? 16 : 8,
        }}
      >
        <View
          style={{
            width: avatarSize,
            height: avatarSize,
            borderRadius: 999,
            backgroundColor: '#181525',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ fontSize: avatarFont }}>{user.icon}</Text>
        </View>
      </View>

      {isMe && (
        <View className="bg-violet-600 rounded-md px-1.5 py-0.5 mb-1">
          <Text className="text-white text-[8px] font-black tracking-widest">YOU</Text>
        </View>
      )}

      <Text
        className="text-white font-extrabold text-center px-1 mb-1.5"
        style={{ fontSize: isFirst ? 13 : 11, letterSpacing: -0.2 }}
        numberOfLines={1}
      >
        {user.name}
      </Text>

      <View
        style={{
          backgroundColor: `${col}18`,
          borderWidth: 1,
          borderColor: `${col}55`,
          borderRadius: 999,
          paddingHorizontal: 10,
          paddingVertical: 3,
          marginBottom: 8,
        }}
      >
        <Text style={{ fontSize: isFirst ? 12 : 10, fontWeight: '900', color: col }}>
          {user.points ?? 0} XP
        </Text>
      </View>

      <View
        style={{
          width: '100%',
          height: stepH,
          backgroundColor: '#0f0d1a',
          borderTopLeftRadius: 12,
          borderTopRightRadius: 12,
          borderWidth: 1,
          borderBottomWidth: 0,
          borderColor: `${col}30`,
          alignItems: 'center',
          justifyContent: 'flex-start',
          paddingTop: 12,
          shadowColor: col,
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.25,
          shadowRadius: 10,
        }}
      >
        <Text
          style={{
            fontSize: isFirst ? 26 : 20,
            fontWeight: '900',
            color: col,
            opacity: 0.75,
            letterSpacing: -1,
          }}
        >
          {rank}
        </Text>
      </View>
    </Animated.View>
  );
}

// ─── Rank Row (4th+) ──────────────────────────────────────────────────────────
function RankRow({
  user,
  rank,
  isMe,
  index,
}: {
  user: any;
  rank: number;
  isMe: boolean;
  index: number;
}) {
  const opacity = useSharedValue(0);
  const translateX = useSharedValue(24);

  useEffect(() => {
    opacity.value = withDelay(index * 55, withTiming(1, { duration: 300 }));
    translateX.value = withDelay(index * 55, withSpring(0, { damping: 22, stiffness: 160 }));
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateX: translateX.value }],
  }));

  const level = levelFromPoints(user.points ?? 0);

  return (
    <Animated.View style={animStyle}>
      <View
        className="flex-row items-center rounded-2xl px-3.5 py-3 gap-3 overflow-hidden"
        style={{
          backgroundColor: isMe ? 'rgba(124,58,237,0.10)' : '#0f0d1a',
          borderWidth: 1,
          borderColor: isMe ? 'rgba(124,58,237,0.55)' : 'rgba(124,58,237,0.12)',
        }}
      >
        {isMe && (
          <View className="absolute left-0 top-0 bottom-0 w-[3px] bg-violet-600" />
        )}

        <Text
          className="font-black text-right"
          style={{
            width: 26,
            fontSize: 13,
            color: isMe ? '#a78bfa' : '#3d3560',
            letterSpacing: -0.4,
          }}
        >
          {rank}
        </Text>

        <View
          className="w-11 h-11 rounded-xl items-center justify-center"
          style={{
            backgroundColor: '#1e1b30',
            borderWidth: 1,
            borderColor: isMe ? 'rgba(124,58,237,0.35)' : 'rgba(124,58,237,0.12)',
          }}
        >
          <Text className="text-xl">{user.icon}</Text>
        </View>

        <View className="flex-1">
          <View className="flex-row items-center gap-1.5">
            <Text
              className="text-white font-extrabold"
              style={{ fontSize: 14, letterSpacing: -0.2 }}
              numberOfLines={1}
            >
              {user.name}
            </Text>
            {isMe && (
              <View className="bg-violet-600 rounded-md px-1.5 py-0.5">
                <Text className="text-white text-[8px] font-black tracking-widest">YOU</Text>
              </View>
            )}
          </View>
          <Text className="text-[11px] font-semibold mt-0.5" style={{ color: '#7c3aed' }}>
            Level {level}
          </Text>
        </View>

        <View className="items-end">
          <Text
            className="font-black"
            style={{
              fontSize: 15,
              color: isMe ? '#c4b5fd' : '#8b7fb8',
              letterSpacing: -0.4,
            }}
          >
            {user.points ?? 0}
          </Text>
          <Text className="text-[9px] font-bold tracking-widest" style={{ color: '#3d3560' }}>
            XP
          </Text>
        </View>
      </View>
    </Animated.View>
  );
}

function GroupLeaderboard() {
  const insets = useSafeAreaInsets();
  const currentUser = useQuery(api.users.currentUser);
  const data = useQuery(api.groups.getCurrentUserGroup);

  const members = data?.members ?? [];
  const group = data;
  const top3 = members.slice(0, 3);
  const rest = members.slice(3);
  
  // FIXED: Changed 'u' to 'u._id' because members are now objects
  const myRank = members.findIndex(u => u._id === currentUser?._id) + 1;
  const loading = data === undefined || currentUser === undefined;

  const headerA = useSharedValue(0);
  useEffect(() => {
    headerA.value = withTiming(1, { duration: 500 });
  }, []);
  const headerStyle = useAnimatedStyle(() => ({
    opacity: headerA.value,
    transform: [{ translateY: (1 - headerA.value) * -12 }],
  }));

  return (
    <View>
      <Animated.View style={[headerStyle, { paddingHorizontal: 20, marginBottom: 24 }]}>
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-[10px] font-bold tracking-[2px] uppercase mb-1" style={{ color: '#8b7fb8' }}>
              {group?.name ?? 'Your Group'} • {group?.joinCode}
            </Text>
            <Text className="text-white font-black text-3xl" style={{ letterSpacing: -1 }}>
              Leaderboard
            </Text>
          </View>

          {myRank > 0 && (
            <View
              className="items-center px-4 py-2.5 rounded-2xl"
              style={{
                backgroundColor: 'rgba(124,58,237,0.12)',
                borderWidth: 1.5,
                borderColor: 'rgba(124,58,237,0.5)',
                shadowColor: '#7c3aed',
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.45,
                shadowRadius: 14,
              }}
            >
              <Text className="text-[9px] font-extrabold tracking-[1.5px] uppercase mb-0.5" style={{ color: '#8b7fb8' }}>
                Your Rank
              </Text>
              <Text className="font-black text-xl" style={{ color: '#c4b5fd', letterSpacing: -0.8 }}>
                #{myRank}
              </Text>
            </View>
          )}
        </View>
      </Animated.View>

      {/* ── Podium ── */}
      {top3.length >= 2 && (
        <View className="mx-5 mb-2">
          <View className="flex-row items-center gap-2 mb-5">
            <View className="w-[3px] h-4 rounded-full bg-violet-600" />
            <Text className="text-[11px] font-extrabold tracking-[1.5px] uppercase" style={{ color: '#8b7fb8' }}>
              Top Players
            </Text>
            <View
              className="rounded-lg px-2 py-0.5 ml-1"
              style={{
                backgroundColor: '#1e1b30',
                borderWidth: 1,
                borderColor: 'rgba(124,58,237,0.15)',
              }}
            >
              <Text className="text-[10px] font-bold" style={{ color: '#8b7fb8' }}>
                {members.length} members
              </Text>
            </View>
          </View>

          {/* Podium: 2nd | 1st | 3rd */}
          <View className="flex-row items-end gap-1.5">
            {top3[1] && (
              <PodiumColumn
                user={top3[1]} rank={2} delay={120}
                isMe={top3[1]?._id === currentUser?._id} // FIXED
              />
            )}
            <PodiumColumn
              user={top3[0]} rank={1} delay={0}
              isMe={top3[0]?._id === currentUser?._id} // FIXED
            />
            {top3[2] && (
              <PodiumColumn
                user={top3[2]} rank={3} delay={220}
                isMe={top3[2]?._id === currentUser?._id} // FIXED
              />
            )}
          </View>
        </View>
      )}

      {/* Solo state */}
      {!loading && members.length === 1 && (
        <View className="items-center py-10">
          <Text className="text-5xl mb-3">🏆</Text>
          <Text className="text-white font-bold text-sm" style={{ color: '#8b7fb8' }}>
            You're the only one here — share your code!
          </Text>
        </View>
      )}

      {/* ── Rest of list ── */}
      {rest.length > 0 && (
        <View className="px-5 mt-6">
          <View className="flex-row items-center gap-2 mb-3">
            <View className="w-[3px] h-4 rounded-full bg-violet-600" />
            <Text className="text-[11px] font-extrabold tracking-[1.5px] uppercase" style={{ color: '#8b7fb8' }}>
              Rankings
            </Text>
          </View>
          <View className="gap-2">
            {rest.map((u, i) => (
              <RankRow
                key={u._id} // FIXED: Used u._id instead of the whole object
                user={u}
                rank={i + 4}
                isMe={u._id === currentUser?._id} // FIXED
                index={i}
              />
            ))}
          </View>
        </View>
      )}

      {/* Empty state */}
      {!loading && members.length === 0 && (
        <View className="items-center py-20 px-10">
          <Text className="text-5xl mb-4">👥</Text>
          <Text className="text-white font-black text-base mb-1.5 text-center">
            No members yet
          </Text>
          <Text className="text-sm text-center leading-5" style={{ color: '#8b7fb8' }}>
            Share your group code to invite people
          </Text>
        </View>
      )}
    </View>
  );
}


export default function Group() {
  const isDark = useColorScheme() == 'dark';
  const user = useQuery(api.users.currentUser);
  const group = useQuery(api.groups.getCurrentUserGroup);

  const leaveGroup = useMutation(api.groups.leaveGroup);
  const deleteGroup = useMutation(api.groups.deleteGroup);

  const isGroupLeader = user?._id === group?.leaderId;

  const width = Dimensions.get('screen').width;

  const insets = useSafeAreaInsets();

  const handleLeaveGroup = () => {
    Alert.alert("Leave Group", `Are you sure you want to leave the ${group?.name} group? This action cannot be undone.`, [
      {
        text: 'Cancel',
        style: 'cancel'
      },
      {
        text: 'Leave',
        style: 'destructive',
        onPress: async () => {
          try {
            await leaveGroup();
          } catch (e) {
            console.log("Error leaving group", e);
          }
        }
      }
    ])
  }

  const handleDeleteGroup = () => {
    Alert.alert("Deleting Group", `Are you sure you want to delete the ${group?.name} group? This action cannot be undone.`, [
      {
        text: 'Cancel',
        style: 'cancel'
      },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteGroup();
          } catch (e) {
            console.log("Error deleting group", e);
          }
        }
      }
    ])
  }


  return (
    <>
      <Stack.Screen 
        options={{
          headerShown: true,
          headerTransparent: Platform.OS === 'ios' ? true : false,
          headerTitle: "Group",
          headerTintColor: isDark ? '#fff' : '#000',
          headerBackground: Platform.OS !== "ios" ? () => (
            <BlurView 
              style={StyleSheet.absoluteFill}
              intensity={80}
              tint={isDark ? 'dark' : 'light'}
            />
          ) : undefined
        }}
      />

      <Stack.Toolbar placement='right'>
        <Stack.Toolbar.Button icon={'person.badge.plus.fill'} separateBackground />
        <Stack.Toolbar.Menu icon={'ellipsis'}>
          {isGroupLeader && (
            <Stack.Toolbar.MenuAction icon={'pencil'}>
              Edit Group
            </Stack.Toolbar.MenuAction>
          )}

          {isGroupLeader ? (
            <Stack.Toolbar.MenuAction icon={'crown'}>
              Promote
            </Stack.Toolbar.MenuAction>
          ) : (
            <Stack.Toolbar.MenuAction icon={'door.left.hand.open'} destructive onPress={handleLeaveGroup}>
              Leave Group
            </Stack.Toolbar.MenuAction>
          )}

          {isGroupLeader && (
            <Stack.Toolbar.MenuAction destructive icon={'trash'} onPress={handleDeleteGroup}>
              Delete Group
            </Stack.Toolbar.MenuAction>
          )}
        </Stack.Toolbar.Menu>
      </Stack.Toolbar>

      {/* ─── PAGER ─── */}
      <ScrollView style={{ paddingTop: Platform.OS !== "ios" ? insets.top : 8 }} className='bg-[#07060f]' contentInsetAdjustmentBehavior='automatic'>
        <GroupLeaderboard />
      </ScrollView>
    </>
  );
}
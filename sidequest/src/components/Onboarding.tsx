import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Animated,
  Dimensions,
} from 'react-native';
import { useState, useRef } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ICONS = [
  '🐶','🐱','🦊','🐻','🐼','🐯','🦁','🐺','🦄','🐸',
  '🦋','🐝','🦅','🦉','🐬','🦈','🐙','🌵','🔥','⚡',
  '🌙','⭐','🌊','❄️','🍄','🌈','🎯','💎','🎸','🚀',
];

const GROUP_ICONS = ['🏆','⚔️','🛡️','🌍','🎮','🧠','💡','🎯','🔥','⚡','🌊','🚀'];

const { width } = Dimensions.get('window');
const ICON_SIZE = (width - 48 - 40) / 6;
const GROUP_ICON_SIZE = (width - 48 - 40) / 6;

type Step = 'profile' | 'group';
type GroupTab = 'join' | 'create';

export default function Onboarding() {
  const insets = useSafeAreaInsets();

  // ── Step state ──────────────────────────────────────────────────────────────
  const [step, setStep] = useState<Step>('profile');

  // ── Profile step ─────────────────────────────────────────────────────────────
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('');
  const [profileError, setProfileError] = useState('');
  const completeProfile = useMutation(api.users.completeProfile);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const iconAnims = useRef(ICONS.map(() => new Animated.Value(1))).current;

  // ── Group step ───────────────────────────────────────────────────────────────
  const me = useQuery(api.users.currentUser);
  const [groupTab, setGroupTab] = useState<GroupTab>('join');
  const [groupError, setGroupError] = useState('');
  const [loading, setLoading] = useState(false);

  // Join
  const [joinCode, setJoinCode] = useState('');
  const joinGroup = useMutation(api.groups.joinGroup);

  // Create
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [groupIcon, setGroupIcon] = useState('');
  const createGroup = useMutation(api.groups.createGroup);
  const groupIconAnims = useRef(GROUP_ICONS.map(() => new Animated.Value(1))).current;

  // ── Animations ───────────────────────────────────────────────────────────────
  const handleIconPress = (emoji: string, index: number) => {
    setIcon(emoji);
    Animated.sequence([
      Animated.timing(iconAnims[index], { toValue: 0.8, duration: 80, useNativeDriver: true }),
      Animated.spring(iconAnims[index], { toValue: 1, friction: 4, useNativeDriver: true }),
    ]).start();
  };

  const handleGroupIconPress = (emoji: string, index: number) => {
    setGroupIcon(emoji);
    Animated.sequence([
      Animated.timing(groupIconAnims[index], { toValue: 0.8, duration: 80, useNativeDriver: true }),
      Animated.spring(groupIconAnims[index], { toValue: 1, friction: 4, useNativeDriver: true }),
    ]).start();
  };

  const bounceButton = (anim: Animated.Value, cb: () => void) => {
    Animated.sequence([
      Animated.timing(anim, { toValue: 0.97, duration: 100, useNativeDriver: true }),
      Animated.spring(anim, { toValue: 1, friction: 4, useNativeDriver: true }),
    ]).start(cb);
  };

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handleProfileContinue = async () => {
    if (!name.trim()) return setProfileError('Choose a username');
    if (!icon) return setProfileError('Pick an icon first');
    setProfileError('');
    bounceButton(scaleAnim, async () => {
      await completeProfile({ name: name.trim(), icon });
      setStep('group');
    });
  };

  const handleJoin = async () => {
    const code = joinCode.trim().toUpperCase();
    if (code.length < 6) return setGroupError('Enter a valid 6-character code');
    setGroupError('');
    setLoading(true);
    const result = await joinGroup({ joinCode: code });
    setLoading(false);
    if (!result?.success) setGroupError('Group not found — check your code');
    // On success, parent layout detects groupId and routes to home
  };

  const handleCreate = async () => {
    if (!groupName.trim()) return setGroupError('Give your group a name');
    if (!groupIcon) return setGroupError('Pick a group icon');
    setGroupError('');
    setLoading(true);
    const result = await createGroup({
      name: groupName.trim(),
      description: groupDescription.trim() || undefined,
      icon: groupIcon,
    });
    setLoading(false);
    if (!result?.success) setGroupError('Something went wrong — try again');
    // On success, parent layout detects groupId and routes to home
  };

  // ── Background blobs (shared) ─────────────────────────────────────────────
  const Blobs = () => (
    <>
      <View style={{
        position: 'absolute', top: -80, left: -60,
        width: 280, height: 280, borderRadius: 140,
        backgroundColor: '#1a0a3e', opacity: 0.8,
      }} />
      <View style={{
        position: 'absolute', top: 120, right: -80,
        width: 240, height: 240, borderRadius: 120,
        backgroundColor: '#0d1f3e', opacity: 0.6,
      }} />
    </>
  );

  // ════════════════════════════════════════════════════════════════════════════
  // STEP 1 — PROFILE
  // ════════════════════════════════════════════════════════════════════════════
  if (step === 'profile') {
    return (
      <View style={{ flex: 1, backgroundColor: '#080810' }}>
        <Blobs />
        <ScrollView
          contentContainerStyle={{
            paddingTop: insets.top + 24,
            paddingBottom: insets.bottom + 32,
            paddingHorizontal: 24,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={{ marginBottom: 36 }}>
            <Text style={{
              fontSize: 13, fontWeight: '600', letterSpacing: 3,
              color: '#6c6cff', textTransform: 'uppercase', marginBottom: 12,
            }}>
              Step 1 of 2
            </Text>
            <Text style={{
              fontSize: 34, fontWeight: '800', color: '#ffffff',
              letterSpacing: -0.5, lineHeight: 40,
            }}>
              Create your{'\n'}profile
            </Text>
            <Text style={{ fontSize: 15, color: '#8888aa', marginTop: 8, lineHeight: 22 }}>
              Pick an icon and username — this is how others will see you.
            </Text>
          </View>

          {/* Icon Preview */}
          <View style={{ alignItems: 'center', marginBottom: 32 }}>
            <View style={{
              width: 100, height: 100, borderRadius: 32,
              backgroundColor: icon ? '#1a1a2e' : '#111122',
              borderWidth: 1.5,
              borderColor: icon ? '#6c6cff' : '#222233',
              alignItems: 'center', justifyContent: 'center',
              shadowColor: icon ? '#6c6cff' : 'transparent',
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.5, shadowRadius: 20,
            }}>
              {icon
                ? <Text style={{ fontSize: 52 }}>{icon}</Text>
                : <Text style={{ fontSize: 28, opacity: 0.2 }}>?</Text>
              }
            </View>
            {(name.trim() || icon) ? (
              <Text style={{
                marginTop: 12, fontSize: 17, fontWeight: '700',
                color: '#ffffff', letterSpacing: 0.2,
              }}>
                {name.trim() || '···'}
              </Text>
            ) : null}
          </View>

          {/* Icon Grid */}
          <View style={{
            backgroundColor: '#0f0f1a', borderRadius: 24,
            borderWidth: 1, borderColor: '#1e1e2e',
            padding: 16, marginBottom: 24,
          }}>
            <Text style={{
              fontSize: 11, fontWeight: '700', letterSpacing: 2,
              color: '#555577', textTransform: 'uppercase', marginBottom: 14,
            }}>
              Choose icon
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {ICONS.map((emoji, i) => (
                <Animated.View key={emoji} style={{ transform: [{ scale: iconAnims[i] }] }}>
                  <Pressable
                    onPress={() => handleIconPress(emoji, i)}
                    style={{
                      width: ICON_SIZE, height: ICON_SIZE,
                      borderRadius: 16, alignItems: 'center', justifyContent: 'center',
                      backgroundColor: icon === emoji ? '#1e1e40' : '#161625',
                      borderWidth: 1.5,
                      borderColor: icon === emoji ? '#6c6cff' : 'transparent',
                    }}
                  >
                    <Text style={{ fontSize: ICON_SIZE * 0.5 }}>{emoji}</Text>
                  </Pressable>
                </Animated.View>
              ))}
            </View>
          </View>

          {/* Username */}
          <View style={{
            backgroundColor: '#0f0f1a', borderRadius: 24,
            borderWidth: 1, borderColor: '#1e1e2e',
            padding: 16, marginBottom: 24,
          }}>
            <Text style={{
              fontSize: 11, fontWeight: '700', letterSpacing: 2,
              color: '#555577', textTransform: 'uppercase', marginBottom: 14,
            }}>
              Username
            </Text>
            <View style={{
              flexDirection: 'row', alignItems: 'center',
              backgroundColor: '#161625', borderRadius: 16,
              borderWidth: 1, borderColor: name ? '#6c6cff33' : '#1e1e2e',
              paddingHorizontal: 16, height: 52,
            }}>
              <Text style={{ color: '#6c6cff', fontWeight: '700', fontSize: 16, marginRight: 4 }}>@</Text>
              <TextInput
                value={name}
                onChangeText={(t) => { setName(t); setProfileError(''); }}
                placeholder="your_username"
                placeholderTextColor="#333355"
                autoCapitalize="none"
                autoCorrect={false}
                maxLength={32}
                style={{ flex: 1, fontSize: 16, color: '#ffffff', fontWeight: '500', letterSpacing: 0.3 }}
              />
              <Text style={{ color: '#333355', fontSize: 12 }}>{name.length}/32</Text>
            </View>
          </View>

          {/* Error */}
          {profileError ? (
            <View style={{
              backgroundColor: '#2a0a14', borderRadius: 12,
              borderWidth: 1, borderColor: '#ff3355',
              paddingHorizontal: 14, paddingVertical: 10, marginBottom: 16,
            }}>
              <Text style={{ color: '#ff3355', fontSize: 14, fontWeight: '500' }}>⚠ {profileError}</Text>
            </View>
          ) : null}

          {/* CTA */}
          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <Pressable
              onPress={handleProfileContinue}
              style={({ pressed }) => ({
                height: 58, borderRadius: 20,
                backgroundColor: '#6c6cff',
                alignItems: 'center', justifyContent: 'center',
                opacity: pressed ? 0.85 : 1,
                shadowColor: '#6c6cff',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.45, shadowRadius: 20,
              })}
            >
              <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '700', letterSpacing: 0.4 }}>
                Continue →
              </Text>
            </Pressable>
          </Animated.View>
        </ScrollView>
      </View>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // STEP 2 — GROUP
  // ════════════════════════════════════════════════════════════════════════════
  const isLeader = me?.isGroupLeader === true;
  const tabs: GroupTab[] = isLeader ? ['join', 'create'] : ['join'];

  return (
    <View style={{ flex: 1, backgroundColor: '#080810' }}>
      <Blobs />
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 24,
          paddingBottom: insets.bottom + 32,
          paddingHorizontal: 24,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={{ marginBottom: 32 }}>
          <Text style={{
            fontSize: 13, fontWeight: '600', letterSpacing: 3,
            color: '#6c6cff', textTransform: 'uppercase', marginBottom: 12,
          }}>
            Step 2 of 2
          </Text>
          <Text style={{
            fontSize: 34, fontWeight: '800', color: '#ffffff',
            letterSpacing: -0.5, lineHeight: 40,
          }}>
            Join a group{'\n'}to continue
          </Text>
          <Text style={{ fontSize: 15, color: '#8888aa', marginTop: 8, lineHeight: 22 }}>
            {isLeader
              ? 'Create a new group or join an existing one with a code.'
              : 'Enter your group\'s invite code to get started.'}
          </Text>
        </View>

        {/* Tab switcher — only rendered if leader */}
        {isLeader && (
          <View style={{
            flexDirection: 'row',
            backgroundColor: '#0f0f1a',
            borderRadius: 16, borderWidth: 1, borderColor: '#1e1e2e',
            padding: 4, marginBottom: 24,
          }}>
            {tabs.map((tab) => (
              <Pressable
                key={tab}
                onPress={() => { setGroupTab(tab); setGroupError(''); }}
                style={{
                  flex: 1, height: 44, borderRadius: 13,
                  alignItems: 'center', justifyContent: 'center',
                  backgroundColor: groupTab === tab ? '#6c6cff' : 'transparent',
                }}
              >
                <Text style={{
                  fontSize: 14, fontWeight: '700',
                  color: groupTab === tab ? '#ffffff' : '#555577',
                  textTransform: 'capitalize',
                }}>
                  {tab === 'join' ? 'Join Group' : 'Create Group'}
                </Text>
              </Pressable>
            ))}
          </View>
        )}

        {/* ── JOIN TAB ─────────────────────────────────────────────────────── */}
        {groupTab === 'join' && (
          <View style={{
            backgroundColor: '#0f0f1a', borderRadius: 24,
            borderWidth: 1, borderColor: '#1e1e2e',
            padding: 16, marginBottom: 24,
          }}>
            <Text style={{
              fontSize: 11, fontWeight: '700', letterSpacing: 2,
              color: '#555577', textTransform: 'uppercase', marginBottom: 14,
            }}>
              Invite Code
            </Text>
            <View style={{
              flexDirection: 'row', alignItems: 'center',
              backgroundColor: '#161625', borderRadius: 16,
              borderWidth: 1, borderColor: joinCode ? '#6c6cff33' : '#1e1e2e',
              paddingHorizontal: 16, height: 52,
            }}>
              <TextInput
                value={joinCode}
                onChangeText={(t) => { setJoinCode(t.toUpperCase()); setGroupError(''); }}
                placeholder="ABC123"
                placeholderTextColor="#333355"
                autoCapitalize="characters"
                autoCorrect={false}
                maxLength={6}
                style={{
                  flex: 1, fontSize: 22, color: '#ffffff',
                  fontWeight: '700', letterSpacing: 6, textAlign: 'center',
                }}
              />
            </View>
            <Text style={{
              color: '#444466', fontSize: 12, textAlign: 'center', marginTop: 10,
            }}>
              Ask your group leader for their 6-character code
            </Text>
          </View>
        )}

        {/* ── CREATE TAB ───────────────────────────────────────────────────── */}
        {groupTab === 'create' && (
          <>
            {/* Group icon picker */}
            <View style={{
              backgroundColor: '#0f0f1a', borderRadius: 24,
              borderWidth: 1, borderColor: '#1e1e2e',
              padding: 16, marginBottom: 16,
            }}>
              <Text style={{
                fontSize: 11, fontWeight: '700', letterSpacing: 2,
                color: '#555577', textTransform: 'uppercase', marginBottom: 14,
              }}>
                Group Icon
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {GROUP_ICONS.map((emoji, i) => (
                  <Animated.View key={emoji} style={{ transform: [{ scale: groupIconAnims[i] }] }}>
                    <Pressable
                      onPress={() => handleGroupIconPress(emoji, i)}
                      style={{
                        width: GROUP_ICON_SIZE, height: GROUP_ICON_SIZE,
                        borderRadius: 16, alignItems: 'center', justifyContent: 'center',
                        backgroundColor: groupIcon === emoji ? '#1e1e40' : '#161625',
                        borderWidth: 1.5,
                        borderColor: groupIcon === emoji ? '#6c6cff' : 'transparent',
                      }}
                    >
                      <Text style={{ fontSize: GROUP_ICON_SIZE * 0.5 }}>{emoji}</Text>
                    </Pressable>
                  </Animated.View>
                ))}
              </View>
            </View>

            {/* Group name */}
            <View style={{
              backgroundColor: '#0f0f1a', borderRadius: 24,
              borderWidth: 1, borderColor: '#1e1e2e',
              padding: 16, marginBottom: 16,
            }}>
              <Text style={{
                fontSize: 11, fontWeight: '700', letterSpacing: 2,
                color: '#555577', textTransform: 'uppercase', marginBottom: 14,
              }}>
                Group Name
              </Text>
              <View style={{
                backgroundColor: '#161625', borderRadius: 16,
                borderWidth: 1, borderColor: groupName ? '#6c6cff33' : '#1e1e2e',
                paddingHorizontal: 16, height: 52, justifyContent: 'center',
              }}>
                <TextInput
                  value={groupName}
                  onChangeText={(t) => { setGroupName(t); setGroupError(''); }}
                  placeholder="My Awesome Group"
                  placeholderTextColor="#333355"
                  maxLength={40}
                  style={{ fontSize: 16, color: '#ffffff', fontWeight: '500' }}
                />
              </View>
            </View>

            {/* Group description */}
            <View style={{
              backgroundColor: '#0f0f1a', borderRadius: 24,
              borderWidth: 1, borderColor: '#1e1e2e',
              padding: 16, marginBottom: 24,
            }}>
              <Text style={{
                fontSize: 11, fontWeight: '700', letterSpacing: 2,
                color: '#555577', textTransform: 'uppercase', marginBottom: 14,
              }}>
                Description{' '}
                <Text style={{ color: '#333355', textTransform: 'none', letterSpacing: 0 }}>(optional)</Text>
              </Text>
              <View style={{
                backgroundColor: '#161625', borderRadius: 16,
                borderWidth: 1, borderColor: groupDescription ? '#6c6cff33' : '#1e1e2e',
                paddingHorizontal: 16, paddingVertical: 12, minHeight: 80,
              }}>
                <TextInput
                  value={groupDescription}
                  onChangeText={(t) => { setGroupDescription(t); setGroupError(''); }}
                  placeholder="What's this group about?"
                  placeholderTextColor="#333355"
                  multiline
                  maxLength={120}
                  style={{ fontSize: 15, color: '#ffffff', lineHeight: 22 }}
                />
              </View>
            </View>
          </>
        )}

        {/* Error */}
        {groupError ? (
          <View style={{
            backgroundColor: '#2a0a14', borderRadius: 12,
            borderWidth: 1, borderColor: '#ff3355',
            paddingHorizontal: 14, paddingVertical: 10, marginBottom: 16,
          }}>
            <Text style={{ color: '#ff3355', fontSize: 14, fontWeight: '500' }}>⚠ {groupError}</Text>
          </View>
        ) : null}

        {/* CTA */}
        <Pressable
          onPress={groupTab === 'join' ? handleJoin : handleCreate}
          disabled={loading}
          style={({ pressed }) => ({
            height: 58, borderRadius: 20,
            backgroundColor: '#6c6cff',
            alignItems: 'center', justifyContent: 'center',
            opacity: pressed || loading ? 0.7 : 1,
            shadowColor: '#6c6cff',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.45, shadowRadius: 20,
          })}
        >
          <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '700', letterSpacing: 0.4 }}>
            {loading
              ? '...'
              : groupTab === 'join'
                ? 'Join Group →'
                : 'Create Group →'}
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
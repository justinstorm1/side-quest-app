import {
  View,
  Text,
  TextInput,
  Pressable,
  Animated,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useState, useRef } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function JoinGroup() {
  const insets = useSafeAreaInsets();

  const [joinCode, setJoinCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const joinGroup = useMutation(api.groups.joinGroup);
  const inputRef = useRef<TextInput>(null);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const slots = Array.from({ length: 6 }, (_, i) => joinCode[i] ?? '');

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 6, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -6, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 40, useNativeDriver: true }),
    ]).start();
  };

  const handleJoin = async () => {
    const code = joinCode.trim().toUpperCase();
    if (code.length < 6) {
      setError('Enter the full 6-character code');
      shake();
      return;
    }
    setError('');
    setLoading(true);

    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.97, duration: 100, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 4, useNativeDriver: true }),
    ]).start();

    const result = await joinGroup({ joinCode: code });
    setLoading(false);

    if (!result?.success) {
      setError('Group not found — double-check your code');
      shake();
    } else {
      setSuccess(true);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-[#080810]"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Background blobs */}
      <View className="absolute -top-20 -left-16 w-72 h-72 rounded-full bg-[#1a0a3e] opacity-80" />
      <View className="absolute bottom-16 -right-20 w-60 h-60 rounded-full bg-[#0d1f3e] opacity-60" />

      <View
        className="flex-1 justify-center px-6"
        style={{ paddingTop: insets.top + 24, paddingBottom: insets.bottom + 32 }}
      >
        {/* Icon */}
        <View className="items-center mb-8">
          <View className="rounded-[28px] bg-[#1a1a2e] border-2 border-[#6c6cff] items-center justify-center"
            style={{
              width: 88, height: 88,
              shadowColor: '#6c6cff',
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.4,
              shadowRadius: 20,
            }}
          >
            <Text className="text-4xl">🔑</Text>
          </View>
        </View>

        {/* Header */}
        <View className="items-center mb-10">
          <Text className="text-xs font-semibold tracking-[3px] text-[#6c6cff] uppercase mb-2.5">
            Join a Group
          </Text>
          <Text className="text-3xl font-extrabold text-white text-center leading-9 tracking-tight">
            Enter your{'\n'}invite code
          </Text>
          <Text className="text-[15px] text-[#8888aa] mt-2.5 leading-6 text-center">
            Ask your group leader for their{'\n'}6-character code to join.
          </Text>
        </View>

        {/* Code slots */}
        <Animated.View
          className="mb-8"
          style={{ transform: [{ translateX: shakeAnim }] }}
        >
          {/* Tapping anywhere on slots focuses the hidden input */}
          <Pressable onPress={() => inputRef.current?.focus()}>
            <View className="flex-row gap-2">
              {slots.map((char, i) => {
                const isFilled = !!char;
                const isActive = joinCode.length === i;
                return (
                  <View
                    key={i}
                    className="flex-1 h-16 rounded-2xl items-center justify-center"
                    style={{
                      backgroundColor: isFilled ? '#1e1e40' : '#0f0f1a',
                      borderWidth: 1.5,
                      borderColor: isFilled
                        ? '#6c6cff'
                        : isActive
                          ? '#6c6cff66'
                          : '#1e1e2e',
                      shadowColor: isFilled ? '#6c6cff' : 'transparent',
                      shadowOffset: { width: 0, height: 0 },
                      shadowOpacity: 0.35,
                      shadowRadius: 10,
                    }}
                  >
                    <Text className="text-2xl font-extrabold text-white">
                      {char}
                    </Text>
                  </View>
                );
              })}
            </View>
          </Pressable>

          {/* Hidden input — always mounted, focused on slot tap */}
          <TextInput
            ref={inputRef}
            value={joinCode}
            onChangeText={(t) => {
              setJoinCode(t.toUpperCase().replace(/[^A-Z0-9]/g, ''));
              setError('');
            }}
            maxLength={6}
            autoCapitalize="characters"
            autoCorrect={false}
            autoFocus
            className="absolute opacity-0 w-full h-full"
          />

          {/* Progress pills */}
          <View className="flex-row justify-center gap-1.5 mt-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <View
                key={i}
                className="h-1 rounded-full"
                style={{
                  width: i < joinCode.length ? 20 : 6,
                  backgroundColor: i < joinCode.length ? '#6c6cff' : '#1e1e2e',
                }}
              />
            ))}
          </View>
        </Animated.View>

        {/* Error */}
        {error ? (
          <View className="bg-[#2a0a14] rounded-2xl border border-[#ff3355] px-4 py-3 mb-5 flex-row items-center gap-2">
            <Text className="text-base">⚠️</Text>
            <Text className="text-[#ff3355] text-sm font-medium flex-1">{error}</Text>
          </View>
        ) : null}

        {/* Success */}
        {success ? (
          <View className="bg-[#0a2a14] rounded-2xl border border-[#33ff88] px-4 py-3 mb-5 flex-row items-center gap-2">
            <Text className="text-base">✅</Text>
            <Text className="text-[#33ff88] text-sm font-medium">Joined! Taking you in...</Text>
          </View>
        ) : null}

        {/* CTA */}
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <Pressable
            onPress={handleJoin}
            disabled={loading || success || joinCode.length < 6}
            style={{
              shadowColor: joinCode.length === 6 ? '#6c6cff' : 'transparent',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.45,
              shadowRadius: 20,
            }}
            className={`h-14 rounded-2xl items-center justify-center border ${
              joinCode.length === 6
                ? 'bg-[#6c6cff] border-transparent'
                : 'bg-[#1a1a2e] border-[#222233]'
            }`}
          >
            {({ pressed }) => (
              <Text
                className={`text-base font-bold tracking-wide ${
                  joinCode.length === 6 ? 'text-white' : 'text-[#444466]'
                }`}
                style={{ opacity: pressed || loading ? 0.7 : 1 }}
              >
                {loading ? 'Joining...' : 'Join Group →'}
              </Text>
            )}
          </Pressable>
        </Animated.View>

        {/* Helper */}
        <Text className="text-[#444466] text-xs text-center mt-5 leading-5">
          Codes are 3 letters + 3 numbers{'\n'}(e.g. ABC123)
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}
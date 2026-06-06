import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Animated,
  useColorScheme,
  Dimensions,
} from 'react-native';
import { useState, useRef } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ICONS = [
  '🐶','🐱','🦊','🐻','🐼','🐯','🦁','🐺','🦄','🐸',
  '🦋','🐝','🦅','🦉','🐬','🦈','🐙','🌵','🔥','⚡',
  '🌙','⭐','🌊','❄️','🍄','🌈','🎯','💎','🎸','🚀',
];

const { width } = Dimensions.get('window');
const ICON_SIZE = (width - 48 - 40) / 6; // 6 per row with padding

export default function Onboarding() {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('');
  const [error, setError] = useState('');
  const completeProfile = useMutation(api.users.completeProfile);
  const insets = useSafeAreaInsets();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const iconAnims = useRef(ICONS.map(() => new Animated.Value(1))).current;

  const handleIconPress = (emoji: string, index: number) => {
    setIcon(emoji);
    Animated.sequence([
      Animated.timing(iconAnims[index], { toValue: 0.8, duration: 80, useNativeDriver: true }),
      Animated.spring(iconAnims[index], { toValue: 1, friction: 4, useNativeDriver: true }),
    ]).start();
  };

  const handleContinue = async () => {
    if (!name.trim()) return setError('Choose a username');
    if (!icon) return setError('Pick an icon first');
    setError('');

    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.97, duration: 100, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 4, useNativeDriver: true }),
    ]).start();

    await completeProfile({ name: name.trim(), icon });
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#080810' }}>
      {/* Background gradient blobs */}
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

      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top + 24, paddingBottom: insets.bottom + 32, paddingHorizontal: 24 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={{ marginBottom: 36 }}>
          <Text style={{
            fontSize: 13, fontWeight: '600', letterSpacing: 3,
            color: '#6c6cff', textTransform: 'uppercase', marginBottom: 12,
          }}>
            Welcome
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

        {/* Icon Preview Card */}
        <View style={{
          alignItems: 'center', marginBottom: 32,
        }}>
          <View style={{
            width: 100, height: 100, borderRadius: 32,
            backgroundColor: icon ? '#1a1a2e' : '#111122',
            borderWidth: 1.5,
            borderColor: icon ? '#6c6cff' : '#222233',
            alignItems: 'center', justifyContent: 'center',
            shadowColor: icon ? '#6c6cff' : 'transparent',
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.5,
            shadowRadius: 20,
          }}>
            {icon ? (
              <Text style={{ fontSize: 52 }}>{icon}</Text>
            ) : (
              <Text style={{ fontSize: 28, opacity: 0.2 }}>?</Text>
            )}
          </View>
          {name.trim() || icon ? (
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
          backgroundColor: '#0f0f1a',
          borderRadius: 24,
          borderWidth: 1,
          borderColor: '#1e1e2e',
          padding: 16,
          marginBottom: 24,
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
                    borderRadius: 16,
                    alignItems: 'center', justifyContent: 'center',
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

        {/* Username Input */}
        <View style={{
          backgroundColor: '#0f0f1a',
          borderRadius: 24,
          borderWidth: 1,
          borderColor: '#1e1e2e',
          padding: 16,
          marginBottom: 24,
        }}>
          <Text style={{
            fontSize: 11, fontWeight: '700', letterSpacing: 2,
            color: '#555577', textTransform: 'uppercase', marginBottom: 14,
          }}>
            Username
          </Text>
          <View style={{
            flexDirection: 'row', alignItems: 'center',
            backgroundColor: '#161625',
            borderRadius: 16,
            borderWidth: 1,
            borderColor: name ? '#6c6cff33' : '#1e1e2e',
            paddingHorizontal: 16, height: 52,
          }}>
            <Text style={{ color: '#6c6cff', fontWeight: '700', fontSize: 16, marginRight: 4 }}>@</Text>
            <TextInput
              value={name}
              onChangeText={(t) => { setName(t); setError(''); }}
              placeholder="your_username"
              placeholderTextColor="#333355"
              autoCapitalize="none"
              autoCorrect={false}
              maxLength={32}
              style={{
                flex: 1, fontSize: 16, color: '#ffffff',
                fontWeight: '500', letterSpacing: 0.3,
              }}
            />
            <Text style={{ color: '#333355', fontSize: 12 }}>{name.length}/32</Text>
          </View>
        </View>

        {/* Error */}
        {error ? (
          <View style={{
            backgroundColor: '#2a0a14', borderRadius: 12,
            borderWidth: 1, borderColor: '#ff3355',
            paddingHorizontal: 14, paddingVertical: 10, marginBottom: 16,
          }}>
            <Text style={{ color: '#ff3355', fontSize: 14, fontWeight: '500' }}>
              ⚠ {error}
            </Text>
          </View>
        ) : null}

        {/* CTA */}
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <Pressable
            onPress={handleContinue}
            style={({ pressed }) => ({
              height: 58, borderRadius: 20,
              backgroundColor: '#6c6cff',
              alignItems: 'center', justifyContent: 'center',
              opacity: pressed ? 0.85 : 1,
              shadowColor: '#6c6cff',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.45,
              shadowRadius: 20,
            })}
          >
            <Text style={{
              color: '#ffffff', fontSize: 16,
              fontWeight: '700', letterSpacing: 0.4,
            }}>
              Continue →
            </Text>
          </Pressable>
        </Animated.View>
      </ScrollView>
    </View>
  );
}
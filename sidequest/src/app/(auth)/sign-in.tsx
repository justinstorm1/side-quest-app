import { View, Text, Pressable, useColorScheme, Dimensions, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthActions } from '@convex-dev/auth/react';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { useEffect } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  withSequence,
  withRepeat,
  interpolate,
  Easing,
} from 'react-native-reanimated';

WebBrowser.maybeCompleteAuthSession();

const { width, height } = Dimensions.get('window');

const PROVIDERS = [
  { id: 'apple'  as const, label: 'Apple',  icon: 'logo-apple'  as const, delay: 600 },
  { id: 'google' as const, label: 'Google', icon: 'logo-google' as const, delay: 700 },
  { id: 'github' as const, label: 'GitHub', icon: 'logo-github' as const, delay: 800 },
];

// Floating orb
function Orb({ x, y, size, color, delay }: { x: number; y: number; size: number; color: string; delay: number }) {
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 1200 }));
    translateY.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(-18, { duration: 3200 + delay * 0.3, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: 3200 + delay * 0.3, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
        true,
      ),
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View
      style={[style, {
        position: 'absolute',
        left: x,
        top: y,
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
      }]}
    />
  );
}

function OAuthButton({
  provider,
  onPress,
  isDark,
}: {
  provider: typeof PROVIDERS[0];
  onPress: () => void;
  isDark: boolean;
}) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(24);

  useEffect(() => {
    opacity.value = withDelay(provider.delay, withTiming(1, { duration: 500 }));
    translateY.value = withDelay(provider.delay, withSpring(0, { damping: 18, stiffness: 120 }));
  }, []);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
  }));

  return (
    <Animated.View style={containerStyle}>
      <Pressable
        onPressIn={() => { scale.value = withSpring(0.97, { damping: 20 }); }}
        onPressOut={() => { scale.value = withSpring(1, { damping: 15 }); }}
        onPress={onPress}
        style={{
          width: '100%',
          height: 56,
          borderRadius: 18,
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 20,
          gap: 14,
          backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.9)',
          borderWidth: 1,
          borderColor: isDark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.07)',
        }}
      >
        <View style={{
          width: 34, height: 34, borderRadius: 10,
          backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <Ionicons
            name={provider.icon}
            size={18}
            color={isDark ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.75)'}
          />
        </View>
        <Text style={{
          flex: 1,
          fontSize: 15,
          fontWeight: '600',
          letterSpacing: 0.1,
          color: isDark ? 'rgba(255,255,255,0.88)' : 'rgba(0,0,0,0.78)',
        }}>
          Continue with {provider.label}
        </Text>
        <Ionicons
          name="chevron-forward"
          size={14}
          color={isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'}
        />
      </Pressable>
    </Animated.View>
  );
}

export default function SignIn() {
  const isDark = useColorScheme() === 'dark';
  const { signIn } = useAuthActions();

  // Entrance animations
  const logoScale = useSharedValue(0.7);
  const logoOpacity = useSharedValue(0);
  const logoRotate = useSharedValue(-8);
  const titleOpacity = useSharedValue(0);
  const titleY = useSharedValue(20);
  const subtitleOpacity = useSharedValue(0);
  const dividerOpacity = useSharedValue(0);
  const legalOpacity = useSharedValue(0);

  useEffect(() => {
    logoScale.value = withDelay(100, withSpring(1, { damping: 14, stiffness: 100 }));
    logoOpacity.value = withDelay(100, withTiming(1, { duration: 600 }));
    logoRotate.value = withDelay(100, withSpring(0, { damping: 12 }));
    titleOpacity.value = withDelay(280, withTiming(1, { duration: 600 }));
    titleY.value = withDelay(280, withSpring(0, { damping: 18, stiffness: 120 }));
    subtitleOpacity.value = withDelay(420, withTiming(1, { duration: 600 }));
    dividerOpacity.value = withDelay(900, withTiming(1, { duration: 500 }));
    legalOpacity.value = withDelay(1000, withTiming(1, { duration: 500 }));
  }, []);

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [
      { scale: logoScale.value },
      { rotate: `${logoRotate.value}deg` },
    ],
  }));

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleY.value }],
  }));

  const subtitleStyle = useAnimatedStyle(() => ({
    opacity: subtitleOpacity.value,
  }));

  const dividerStyle = useAnimatedStyle(() => ({ opacity: dividerOpacity.value }));
  const legalStyle = useAnimatedStyle(() => ({ opacity: legalOpacity.value }));

  const handleOAuth = async (provider: 'github' | 'google' | 'apple') => {
    try {
      const redirectUrl = AuthSession.makeRedirectUri();
      const { redirect } = await signIn(provider, { redirectTo: redirectUrl });
      if (redirect) {
        const result = await WebBrowser.openAuthSessionAsync(redirect.toString(), redirectUrl);
        if (result.type === 'success') {
          const url = new URL(result.url);
          const code = url.searchParams.get('code');
          if (code) await signIn(provider, { code });
        }
      }
    } catch (e) {
      console.error(`Error signing in with ${provider}:`, e);
    }
  };

  const bg = isDark ? '#08080f' : '#f0efe9';
  const textPrimary = isDark ? '#ffffff' : '#0d0d12';
  const textMuted = isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.3)';
  const divider = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)';

  return (
    <View style={{ flex: 1, backgroundColor: bg }}>

      {/* Background orbs */}
      <Orb x={-60}       y={height * 0.05}  size={280} color={isDark ? 'rgba(99,102,241,0.09)' : 'rgba(99,102,241,0.07)'}  delay={0}   />
      <Orb x={width*0.5} y={height * 0.55}  size={220} color={isDark ? 'rgba(168,85,247,0.07)' : 'rgba(168,85,247,0.05)'}  delay={400} />
      <Orb x={width*0.6} y={height * 0.1}   size={160} color={isDark ? 'rgba(59,130,246,0.06)' : 'rgba(59,130,246,0.05)'}  delay={200} />

      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ flex: 1, paddingHorizontal: 28, justifyContent: 'space-between' }}>

          {/* Hero */}
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 0 }}>

            {/* Logo badge */}
            <Animated.View style={[logoStyle, { marginBottom: 32 }]}>
              <View style={{
                width: 88, height: 88,
                borderRadius: 26,
                backgroundColor: isDark ? 'rgba(99,102,241,0.12)' : 'rgba(99,102,241,0.09)',
                borderWidth: 1,
                borderColor: isDark ? 'rgba(99,102,241,0.25)' : 'rgba(99,102,241,0.18)',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Text style={{ fontSize: 44, lineHeight: 52 }}>⚔️</Text>
              </View>
            </Animated.View>

            {/* Title */}
            <Animated.View style={[titleStyle, { alignItems: 'center' }]}>
              <Text style={{
                fontSize: 42,
                fontWeight: '800',
                color: textPrimary,
                letterSpacing: -1.5,
                lineHeight: 46,
                marginBottom: 12,
              }}>
                SideQuest
              </Text>
            </Animated.View>

            {/* Subtitle */}
            <Animated.View style={[subtitleStyle, { alignItems: 'center' }]}>
              <Text style={{
                fontSize: 15,
                color: textMuted,
                textAlign: 'center',
                lineHeight: 23,
                letterSpacing: 0.1,
                maxWidth: 220,
              }}>
                Real-world challenges.{'\n'}Earn XP. Climb the ranks.
              </Text>

              {/* Pill badges */}
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 24 }}>
                {['🏃 Fitness', '🧠 Mind', '🌍 Explore'].map((tag) => (
                  <View key={tag} style={{
                    paddingHorizontal: 12,
                    paddingVertical: 5,
                    borderRadius: 20,
                    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                    borderWidth: 1,
                    borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                  }}>
                    <Text style={{ fontSize: 12, color: textMuted, fontWeight: '500' }}>{tag}</Text>
                  </View>
                ))}
              </View>
            </Animated.View>
          </View>

          {/* Auth section */}
          <View style={{ paddingBottom: 8 }}>

            {/* Sign in label */}
            <Animated.View style={[subtitleStyle, { marginBottom: 14 }]}>
              <Text style={{
                fontSize: 12,
                fontWeight: '600',
                letterSpacing: 1.5,
                textTransform: 'uppercase',
                color: textMuted,
                textAlign: 'center',
              }}>
                Sign in to continue
              </Text>
            </Animated.View>

            {/* Buttons */}
            <View style={{ gap: 10, marginBottom: 24 }}>
              {PROVIDERS.map((p) => (
                <OAuthButton
                  key={p.id}
                  provider={p}
                  onPress={() => handleOAuth(p.id)}
                  isDark={isDark}
                />
              ))}
            </View>

            {/* Divider + legal */}
            <Animated.View style={dividerStyle}>
              <View style={{ height: 1, backgroundColor: divider, marginBottom: 18 }} />
            </Animated.View>

            <Animated.View style={legalStyle}>
              <Text style={{
                textAlign: 'center',
                fontSize: 12,
                color: textMuted,
                lineHeight: 18,
              }}>
                By continuing you agree to our{' '}
                <Text style={{ color: isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.5)', fontWeight: '500' }}>
                  Terms
                </Text>
                {' '}&{' '}
                <Text style={{ color: isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.5)', fontWeight: '500' }}>
                  Privacy Policy
                </Text>
              </Text>
            </Animated.View>
          </View>

        </View>
      </SafeAreaView>
    </View>
  );
}
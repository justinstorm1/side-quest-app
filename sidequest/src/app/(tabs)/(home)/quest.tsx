import React, { useState, useEffect, useRef } from 'react';
import { useLocalSearchParams, router, Stack, useNavigation } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import MapView, { Marker, Circle, Polyline, PROVIDER_DEFAULT } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, Pressable, ScrollView, Alert, Image, useColorScheme, Platform } from 'react-native';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { Id } from '../../../../convex/_generated/dataModel';

const DIFF: Record<string, { bg: string; text: string; dot: string }> = {
  easy:   { bg: 'bg-green-100 dark:bg-green-950',  text: 'text-green-700 dark:text-green-400',  dot: 'bg-green-500'  },
  medium: { bg: 'bg-orange-100 dark:bg-orange-950', text: 'text-orange-700 dark:text-orange-400', dot: 'bg-orange-500' },
  hard:   { bg: 'bg-red-100 dark:bg-red-950',      text: 'text-red-700 dark:text-red-400',      dot: 'bg-red-500'    },
};

type UserCoords = { latitude: number; longitude: number };

function haversineMiles(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 3958.8;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function regionForCoords(uLat: number, uLng: number, qLat: number, qLng: number) {
  const minLat = Math.min(uLat, qLat);
  const maxLat = Math.max(uLat, qLat);
  const minLng = Math.min(uLng, qLng);
  const maxLng = Math.max(uLng, qLng);
  return {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLng + maxLng) / 2,
    latitudeDelta: Math.max((maxLat - minLat) * 1.6, 0.05),
    longitudeDelta: Math.max((maxLng - minLng) * 1.6, 0.05),
  };
}

export default function QuestScreen() {
  const navigation = useNavigation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const isDark = useColorScheme() === 'dark';
  const mapRef = useRef<MapView>(null);

  const quest = useQuery(api.quests.getQuest, { questId: id as Id<'quests'> });
  const completeQuest = useMutation(api.quests.completeQuest);

  const [image, setImage] = useState<string | null>(null);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'checking' | 'ok' | 'fail'>('idle');
  const [distanceMiles, setDistanceMiles] = useState<number | null>(null);
  const [userCoords, setUserCoords] = useState<UserCoords | null>(null);
  const [questCoords, setQuestCoords] = useState<UserCoords | null>(null);
  const [questAddress, setQuestAddress] = useState<string | null>(null);
  const [fullScreenMap, setFullScreenMap] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const threshold = quest?.locationThresholdMiles ?? 100;
  const inRange = locationStatus === 'ok';

  const locationRequired = quest?.needsLocationVerification ?? false;
  const imageRequired = quest?.needsImageVerification ?? false;

  const locationDone = !locationRequired || inRange;
  const imageDone = !imageRequired || !!image;
  const canSubmit = locationDone && imageDone;

  const d = DIFF[quest?.difficultly ?? 'easy'];

  // Remove the geocodeAsync useEffect entirely and replace with:
    useEffect(() => {
    if (!quest?.location) return;
    setQuestCoords({ latitude: quest.location.latitude, longitude: quest.location.longitude });
    // Reverse geocode for human-readable address display
    Location.reverseGeocodeAsync({ latitude: quest.location.latitude, longitude: quest.location.longitude })
        .then((results) => {
        if (results[0]) {
            const r = results[0];
            setQuestAddress([r.name, r.street, r.city, r.region].filter(Boolean).join(', '));
        }
        })
        .catch(() => {});
    }, [quest?.location]);

  const checkLocation = async () => {
    if (!questCoords) {
      Alert.alert('No location set', 'This quest has no location to verify against.');
      return;
    }
    setLocationStatus('checking');
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission denied', 'Location access is required.');
      setLocationStatus('fail');
      return;
    }
    const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
    const { latitude, longitude } = loc.coords;
    setUserCoords({ latitude, longitude });
    const miles = haversineMiles(latitude, longitude, questCoords.latitude, questCoords.longitude);
    setDistanceMiles(Math.round(miles));
    setLocationStatus(miles <= threshold ? 'ok' : 'fail');
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') { Alert.alert('Permission denied', 'Photo access is required.'); return; }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [4, 3], quality: 0.8 });
    if (!result.canceled) setImage(result.assets[0].uri);
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') { Alert.alert('Permission denied', 'Camera access is required.'); return; }
    const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [4, 3], quality: 0.8 });
    if (!result.canceled) setImage(result.assets[0].uri);
  };

  const handleSubmit = async () => {
    if (!canSubmit || !quest) return;
    setSubmitting(true);
    try {
      await completeQuest({ questId: quest._id });
      router.back();
      Alert.alert('Quest Complete! 🎉', `+${quest.points ?? 0} XP earned`);
    } catch (e) {
      console.log("Error completing quest", e);
    } finally {
      setSubmitting(false);
    }
  };

  const fitMap = () => {
    if (!mapRef.current || !userCoords || !questCoords) return;
    mapRef.current.fitToCoordinates(
      [{ latitude: userCoords.latitude, longitude: userCoords.longitude }, { latitude: questCoords.latitude, longitude: questCoords.longitude }],
      { edgePadding: { top: 60, right: 60, bottom: 60, left: 60 }, animated: true },
    );
  };

  if (!quest) return (
    <View className="flex-1 bg-slate-100 dark:bg-slate-900 items-center justify-center">
      <Text className="text-slate-400 dark:text-slate-500">Loading…</Text>
    </View>
  );

  let stepNum = 1;
  const locationStep = locationRequired ? stepNum++ : null;
  const imageStep = imageRequired ? stepNum++ : null;

  return (
    <>
      {Platform.OS === 'ios' && (
        <Stack.Toolbar placement='right'>
          <Stack.Toolbar.Button icon='xmark' onPress={() => router.back()} />
        </Stack.Toolbar>
      )}

      <View className="flex-1 bg-slate-100 dark:bg-slate-900">
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 100, paddingTop: insets.top + 8 }}
        >

          {/* ── Header ── */}
          <View className="px-5 pt-5 pb-4">
            <View className="flex-row items-center gap-3">
              <View className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 items-center justify-center">
                <Text className="text-4xl">{quest.icon ?? '🎯'}</Text>
              </View>
              <View className="flex-1">
                <Text className="text-slate-900 dark:text-white text-xl font-black leading-tight">{quest.title}</Text>
                <Text className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">{quest.description}</Text>
                <View className="flex-row items-center gap-2 mt-2">
                  {quest.difficultly && (
                    <View className={`flex-row items-center gap-1 px-2 py-0.5 rounded-full ${d.bg}`}>
                      <View className={`w-1.5 h-1.5 rounded-full ${d.dot}`} />
                      <Text className={`text-xs font-semibold ${d.text}`}>
                        {quest.difficultly.charAt(0).toUpperCase() + quest.difficultly.slice(1)}
                      </Text>
                    </View>
                  )}
                  <View className="bg-indigo-50 dark:bg-indigo-950 rounded-full px-2.5 py-0.5 border border-indigo-100 dark:border-indigo-900">
                    <Text className="text-indigo-600 dark:text-indigo-400 text-xs font-bold">+{quest.points} XP</Text>
                  </View>
                  {locationRequired && (
                    <View className="flex-row items-center gap-0.5">
                      <Ionicons name="location" size={11} color={isDark ? '#818cf8' : '#6366f1'} />
                      <Text className="text-slate-400 dark:text-slate-500 text-xs">{threshold} mi</Text>
                    </View>
                  )}
                </View>
              </View>

              {Platform.OS !== 'ios' && (
                <Pressable
                  onPress={() => navigation.goBack()}
                  className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-700 items-center justify-center self-start"
                >
                  <Ionicons name='close' size={20} color={isDark ? '#fff' : '#000'} />
                </Pressable>
              )}
            </View>

            {questAddress && (
              <View className="flex-row items-center gap-1.5 mt-3 bg-white dark:bg-slate-800 rounded-xl px-3 py-2.5 border border-slate-200 dark:border-slate-700">
                <Ionicons name="location" size={14} color={isDark ? '#818cf8' : '#6366f1'} />
                <Text className="text-slate-500 dark:text-slate-400 text-xs flex-1" numberOfLines={1}>{questAddress}</Text>
              </View>
            )}
          </View>

          {/* ── Step: Location verification ── */}
          {locationRequired && (
            <View className="mx-5 mb-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4">
              <View className="flex-row items-center gap-2.5 mb-2">
                <View className={`w-6 h-6 rounded-full items-center justify-center ${inRange ? 'bg-green-500' : 'bg-slate-200 dark:bg-slate-700'}`}>
                  <Text className="text-white text-xs font-bold">{inRange ? '✓' : locationStep}</Text>
                </View>
                <Text className="text-slate-900 dark:text-white font-bold flex-1">Verify Location</Text>
                {locationStatus === 'ok' && (
                  <View className="bg-green-100 dark:bg-green-950 rounded-full px-2.5 py-0.5 border border-green-200 dark:border-green-900">
                    <Text className="text-green-700 dark:text-green-400 text-xs font-semibold">Within range</Text>
                  </View>
                )}
                {locationStatus === 'fail' && (
                  <View className="bg-red-100 dark:bg-red-950 rounded-full px-2.5 py-0.5 border border-red-200 dark:border-red-900">
                    <Text className="text-red-700 dark:text-red-400 text-xs font-semibold">Too far</Text>
                  </View>
                )}
              </View>
              <Text className="text-slate-400 dark:text-slate-500 text-sm mb-3">
                You must be within {threshold} miles of the quest location.
              </Text>
              {locationStatus !== 'ok' && (
                <Pressable
                  onPress={checkLocation}
                  className="bg-indigo-50 dark:bg-indigo-950 border border-indigo-200 dark:border-indigo-800 rounded-xl py-3 items-center active:opacity-70"
                >
                  <Text className="text-indigo-600 dark:text-indigo-400 font-semibold text-sm">
                    {locationStatus === 'checking' ? 'Locating you…' : '📍 Check My Location'}
                  </Text>
                </Pressable>
              )}
            </View>
          )}

          {/* ── Map ── */}
          {locationRequired && userCoords && questCoords && (
            <View className="mx-5 mb-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              <MapView
                ref={mapRef}
                style={{ width: '100%', height: fullScreenMap ? 420 : 220 }}
                provider={PROVIDER_DEFAULT}
                userInterfaceStyle={isDark ? 'dark' : 'light'}
                initialRegion={regionForCoords(userCoords.latitude, userCoords.longitude, questCoords.latitude, questCoords.longitude)}
                scrollEnabled={fullScreenMap}
                zoomEnabled={fullScreenMap}
                rotateEnabled={fullScreenMap}
                showsCompass={fullScreenMap}
              >
                <Circle
                  center={{ latitude: questCoords.latitude, longitude: questCoords.longitude }}
                  radius={threshold * 1609.34}
                  fillColor="rgba(99,102,241,0.07)"
                  strokeColor="rgba(99,102,241,0.35)"
                  strokeWidth={1.5}
                />
                <Polyline
                  coordinates={[
                    { latitude: userCoords.latitude, longitude: userCoords.longitude },
                    { latitude: questCoords.latitude, longitude: questCoords.longitude },
                  ]}
                  strokeColor={inRange ? '#22c55e' : '#ef4444'}
                  strokeWidth={2}
                  lineDashPattern={[6, 4]}
                />
                <Marker coordinate={{ latitude: questCoords.latitude, longitude: questCoords.longitude }} title={quest.title ?? ''}>
                  <View style={{ alignItems: 'center' }}>
                    <View style={{ backgroundColor: '#6366f1', borderRadius: 12, paddingHorizontal: 8, paddingVertical: 4, borderWidth: 2, borderColor: 'white' }}>
                      <Text style={{ fontSize: 18 }}>{quest.icon ?? '🎯'}</Text>
                    </View>
                    <View style={{ borderLeftWidth: 5, borderRightWidth: 5, borderTopWidth: 6, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderTopColor: '#6366f1' }} />
                  </View>
                </Marker>
                <Marker coordinate={userCoords} title="You">
                  <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: 'white', borderWidth: 2.5, borderColor: '#6366f1', alignItems: 'center', justifyContent: 'center' }}>
                    <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#6366f1' }} />
                  </View>
                </Marker>
              </MapView>

              <Pressable
                onPress={() => { setFullScreenMap((v) => !v); if (!fullScreenMap) setTimeout(fitMap, 100); }}
                style={{ position: 'absolute', top: 10, right: 10 }}
                className="bg-white dark:bg-slate-800 rounded-xl px-2.5 py-1.5 border border-slate-200 dark:border-slate-600 flex-row items-center gap-1.5"
              >
                <Ionicons name={fullScreenMap ? 'contract' : 'expand'} size={14} color={isDark ? '#818cf8' : '#6366f1'} />
                <Text className="text-indigo-600 dark:text-indigo-400 text-xs font-semibold">{fullScreenMap ? 'Collapse' : 'Expand'}</Text>
              </Pressable>

              {fullScreenMap && (
                <Pressable
                  onPress={fitMap}
                  style={{ position: 'absolute', top: 10, left: 10 }}
                  className="bg-white dark:bg-slate-800 rounded-xl px-2.5 py-1.5 border border-slate-200 dark:border-slate-600 flex-row items-center gap-1.5"
                >
                  <Ionicons name="scan" size={14} color={isDark ? '#818cf8' : '#6366f1'} />
                  <Text className="text-indigo-600 dark:text-indigo-400 text-xs font-semibold">Fit both</Text>
                </Pressable>
              )}

              <View className="p-4">
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center gap-2">
                    <Text className="text-slate-600 dark:text-slate-300 text-sm">🧍 You</Text>
                    <View className="flex-row items-center gap-1">
                      <View className="w-5 h-px" style={{ backgroundColor: inRange ? '#22c55e' : '#ef4444' }} />
                      <View className={`px-2 py-0.5 rounded-full border ${inRange ? 'bg-green-100 dark:bg-green-950 border-green-200 dark:border-green-800' : 'bg-red-100 dark:bg-red-950 border-red-200 dark:border-red-800'}`}>
                        <Text className={`text-xs font-bold ${inRange ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>{distanceMiles} mi</Text>
                      </View>
                      <View className="w-5 h-px" style={{ backgroundColor: inRange ? '#22c55e' : '#ef4444' }} />
                    </View>
                    <Text className="text-slate-600 dark:text-slate-300 text-sm">{quest.icon} Quest</Text>
                  </View>
                  <View className={`px-2.5 py-1 rounded-full border ${inRange ? 'bg-green-100 dark:bg-green-950 border-green-200 dark:border-green-800' : 'bg-red-100 dark:bg-red-950 border-red-200 dark:border-red-800'}`}>
                    <Text className={`text-xs font-semibold ${inRange ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
                      {inRange ? '✓ In range' : `✗ ${distanceMiles! - threshold} mi too far`}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* ── Step: Photo proof ── */}
          {imageRequired && (
            <View className="mx-5 mb-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4">
              <View className="flex-row items-center gap-2.5 mb-2">
                <View className={`w-6 h-6 rounded-full items-center justify-center ${image ? 'bg-green-500' : 'bg-slate-200 dark:bg-slate-700'}`}>
                  <Text className="text-white text-xs font-bold">{image ? '✓' : imageStep}</Text>
                </View>
                <Text className="text-slate-900 dark:text-white font-bold">Submit Photo Proof</Text>
              </View>
              <Text className="text-slate-400 dark:text-slate-500 text-sm mb-3">
                Take or upload a photo proving you completed the quest.
              </Text>
              {image ? (
                <View>
                  <Image source={{ uri: image }} className="w-full h-52 rounded-xl" resizeMode="cover" />
                  <Pressable onPress={() => setImage(null)} className="mt-2 items-center py-1">
                    <Text className="text-slate-400 dark:text-slate-500 text-sm">Remove photo</Text>
                  </Pressable>
                </View>
              ) : (
                <View className="flex-row gap-3">
                  <Pressable
                    onPress={takePhoto}
                    className="flex-1 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl py-3 items-center gap-1 active:opacity-70"
                  >
                    <Ionicons name="camera" size={20} color={isDark ? '#94a3b8' : '#64748b'} />
                    <Text className="text-slate-600 dark:text-slate-300 text-sm font-semibold">Camera</Text>
                  </Pressable>
                  <Pressable
                    onPress={pickImage}
                    className="flex-1 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl py-3 items-center gap-1 active:opacity-70"
                  >
                    <Ionicons name="image" size={20} color={isDark ? '#94a3b8' : '#64748b'} />
                    <Text className="text-slate-600 dark:text-slate-300 text-sm font-semibold">Library</Text>
                  </Pressable>
                </View>
              )}
            </View>
          )}

        </ScrollView>

        {/* ── Submit ── */}
        <View
          className="absolute bottom-0 left-0 right-0 px-5 bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800"
          style={{ paddingBottom: insets.bottom + 8, paddingTop: 12 }}
        >
          <Pressable
            onPress={handleSubmit}
            disabled={!canSubmit || submitting}
            className={`w-full h-14 rounded-2xl items-center justify-center ${canSubmit && !submitting ? 'bg-indigo-500 active:opacity-80' : 'bg-slate-200 dark:bg-slate-800'}`}
          >
            <Text className={`text-base font-bold ${canSubmit && !submitting ? 'text-white' : 'text-slate-400 dark:text-slate-600'}`}>
              {submitting ? 'Submitting…' : canSubmit ? '🎯 Complete Quest' : 'Complete steps above'}
            </Text>
          </Pressable>
        </View>
      </View>
    </>
  );
}

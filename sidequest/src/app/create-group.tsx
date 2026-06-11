import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert, Platform, useColorScheme } from 'react-native'
import React, { useState } from 'react'
import { insertAtPosition, useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { router, Stack } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { BlurView } from 'expo-blur'

const EMOJIS = [
  "⚡️","🔥","🏆","🎯","🚀","💎","🌟","🎮","🏅","⚔️","🛡️","🎲",
  "🧩","🎪","🏋️","🤝","🌈","🦁","🐉","🍀","🎭","🌊","⛰️","🏔️",
  "🎸","🎵","🌙","☀️","🌀","💫","🎉","🔮","🎨","🦋","🐺","🦊",
]

export default function CreateGroup() {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [icon, setIcon] = useState('⚡️')
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [loading, setLoading] = useState(false);

  const insets = useSafeAreaInsets();
  const isDark = useColorScheme() === 'dark';

  const createGroup = useMutation(api.groups.createGroup)

  const handleCreate = async () => {
    if (!name.trim()) return
    setLoading(true)
    try {
      const result = await createGroup({ name: name.trim(), description: description.trim() || undefined, icon })
      if (result?.success) {
        router.back()
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to create group. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
        <Stack.Screen 
            options={{
                headerTitle: "Create Group",
                headerTransparent: true,
                headerBackButtonDisplayMode: "minimal",
                headerTintColor: isDark ? '#fff' : '#000',
                headerBackground: Platform.OS !== "ios" ? () => (
                    <BlurView 
                        style={StyleSheet.absoluteFill}
                        intensity={80}
                        tint={isDark ? 'dark' : 'light'}
                    />
                ) : undefined,
            }}
        />
        <View className="flex-1 bg-slate-950">

        <ScrollView 
            className="flex-1" 
            contentContainerStyle={{ 
                padding: 20, 
                gap: 24,
                paddingTop: Platform.OS != "ios" ? insets.top + 90 : 0
            }} 
            keyboardShouldPersistTaps="handled"
            contentInsetAdjustmentBehavior='automatic'
        >

            {/* Icon Picker */}
            <View className="items-center gap-3">
                <TouchableOpacity
                    onPress={() => setShowEmojiPicker(v => !v)}
                    className="w-20 h-20 rounded-full bg-indigo-950 border-2 border-dashed border-indigo-400 items-center justify-center"
                >
                    <Text style={{ fontSize: 36 }}>{icon}</Text>
                </TouchableOpacity>
                <Text className="text-slate-400 text-sm">Tap to choose an icon</Text>
            </View>

            {showEmojiPicker && (
            <View className="bg-slate-900 rounded-2xl p-3 border border-slate-800">
                <View className="flex-row flex-wrap justify-center gap-1">
                {EMOJIS.map(e => (
                    <TouchableOpacity
                        key={e}
                        onPress={() => { setIcon(e); setShowEmojiPicker(false) }}
                        className={`w-10 h-10 rounded-lg items-center justify-center ${e === icon ? 'bg-indigo-900' : ''}`}
                    >
                        <Text style={{ fontSize: 22 }}>{e}</Text>
                    </TouchableOpacity>
                ))}
                </View>
            </View>
            )}

            {/* Name */}
            <View className="gap-2">
            <Text className="text-slate-400 text-xs font-medium tracking-widest uppercase">Group name</Text>
            <TextInput
                value={name}
                onChangeText={setName}
                maxLength={30}
                placeholder="e.g. Weekend Warriors"
                placeholderTextColor="#475569"
                className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white text-base"
            />
            <Text className="text-slate-600 text-xs text-right">{name.length} / 30</Text>
            </View>

            {/* Description */}
            <View className="gap-2">
            <Text className="text-slate-400 text-xs font-medium tracking-widest uppercase">
                Description <Text className="text-slate-600 normal-case">(optional)</Text>
            </Text>
            <TextInput
                value={description}
                onChangeText={setDescription}
                maxLength={100}
                placeholder="What's your group about?"
                placeholderTextColor="#475569"
                multiline
                numberOfLines={3}
                className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white text-base"
                style={{ textAlignVertical: 'top', minHeight: 80 }}
            />
            <Text className="text-slate-600 text-xs text-right">{description.length} / 100</Text>
            </View>

            {/* Preview */}
            <View className="gap-3">
            <Text className="text-slate-600 text-xs font-medium tracking-widest uppercase">Preview</Text>
            <View className="bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 flex-row items-center gap-3">
                <View className="w-12 h-12 rounded-full bg-indigo-950 items-center justify-center">
                <Text style={{ fontSize: 24 }}>{icon}</Text>
                </View>
                <View className="flex-1">
                <Text className="text-white font-medium text-base" numberOfLines={1}>
                    {name || 'Your group name'}
                </Text>
                <Text className="text-slate-400 text-sm" numberOfLines={1}>
                    {description || 'Group description goes here'}
                </Text>
                </View>
                <View className="bg-indigo-950 rounded-full px-2 py-1">
                <Text className="text-indigo-400 text-xs font-medium">New</Text>
                </View>
            </View>
            </View>

            {/* Create Button */}
            <TouchableOpacity
            onPress={handleCreate}
            disabled={!name.trim() || loading}
            className={`rounded-2xl py-4 items-center ${name.trim() && !loading ? 'bg-indigo-500' : 'bg-slate-800'}`}
            >
            <Text className={`font-medium text-base ${name.trim() && !loading ? 'text-white' : 'text-slate-500'}`}>
                {loading ? 'Creating...' : 'Create group'}
            </Text>
            </TouchableOpacity>

            <View style={{ height: 40 }} />
        </ScrollView>
        </View>
    </>
  )
}
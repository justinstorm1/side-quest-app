import { View, Text, TextInput, Pressable, FlatList, useColorScheme } from 'react-native';
import { useState, useEffect } from 'react';
import { useLocalSearchParams, Stack } from 'expo-router';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { KeyboardStickyView } from 'react-native-keyboard-controller';
import * as Swift from '@expo/ui/swift-ui';

export default function Conversation() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const isDark = useColorScheme() === 'dark';
  const [text, setText] = useState('');

  const currentUser = useQuery(api.users.currentUser);
  const messages = useQuery(api.messages.getMessages, { conversationId: id as Id<'conversations'> });
  const sendMessage = useMutation(api.messages.sendMessage);
  const markRead = useMutation(api.messages.markRead);

  useEffect(() => {
    if (id) markRead({ conversationId: id as Id<'conversations'> });
  }, [id, messages?.length]);

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setText('');
    await sendMessage({ conversationId: id as Id<'conversations'>, text: trimmed });
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: 'Message',
          headerTransparent: true,
          headerTintColor: isDark ? '#fff' : '#000',
        }}
      />

      <View className="flex-1 bg-slate-100 dark:bg-slate-900">
        {messages?.length === 0 && (
          <View className="flex-1 items-center justify-center">
            <Text className="text-5xl mb-3">👋</Text>
            <Text className="text-slate-500 dark:text-slate-400 font-semibold text-base">No messages yet</Text>
            <Text className="text-slate-400 dark:text-slate-500 text-sm mt-1">Say hello!</Text>
          </View>
        )}

        <FlatList
          data={messages}
          keyExtractor={(m) => m._id}
          contentContainerStyle={{
            paddingTop: insets.top + 60,
            paddingBottom: 16,
            paddingHorizontal: 16,
            gap: 8,
          }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item, index }) => {
            const isMe = item.senderId === currentUser?._id;
            return (
              <View className={`flex-row ${isMe ? 'justify-end' : 'justify-start'}`}>
                <View
                  className={`max-w-[78%] px-4 py-2.5 rounded-2xl ${
                    isMe
                      ? 'bg-indigo-500'
                      : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <Text className={`text-base ${isMe ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                    {item.text}
                  </Text>
                </View>
              </View>
            );
          }}
        />

        <KeyboardStickyView offset={{ closed: 0, opened: 0 }}>
          <View
            className="flex-row items-end gap-2 px-4 pt-2 bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800"
            style={{ paddingBottom: insets.bottom + 8 }}
          >
            <View className="flex-1 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 px-4 py-2.5 min-h-[44px] justify-center">
              <TextInput
                value={text}
                onChangeText={setText}
                placeholder="Message…"
                placeholderTextColor={isDark ? '#475569' : '#94a3b8'}
                className="text-slate-900 dark:text-white text-base"
                multiline
                returnKeyType="default"
              />
            </View>
            <Pressable
              onPress={handleSend}
              disabled={!text.trim()}
              className={`w-11 h-11 rounded-full items-center justify-center ${
                text.trim() ? 'bg-indigo-500' : 'bg-slate-200 dark:bg-slate-700'
              }`}
            >
              <Ionicons
                name="arrow-up"
                size={20}
                color={text.trim() ? 'white' : isDark ? '#475569' : '#94a3b8'}
              />
            </Pressable>
          </View>
        </KeyboardStickyView>
      </View>
    </>
  );
}
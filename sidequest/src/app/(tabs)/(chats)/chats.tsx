// import { View, Text, ScrollView, Pressable, TextInput, useColorScheme } from 'react-native'
// import { useState, useMemo } from 'react'
// import { router, Stack } from 'expo-router'
// import { useMutation, useQuery } from 'convex/react'
// import { api } from '../../../../convex/_generated/api'
// import { useSafeAreaInsets } from 'react-native-safe-area-context'
// import { Ionicons } from '@expo/vector-icons'
// import { Id } from '../../../../convex/_generated/dataModel'

// function timeAgo(ms: number) {
//   const diff = Date.now() - ms;
//   const mins = Math.floor(diff / 60000);
//   const hours = Math.floor(diff / 3600000);
//   const days = Math.floor(diff / 86400000);
//   if (mins < 1) return 'now';
//   if (mins < 60) return `${mins}m`;
//   if (hours < 24) return `${hours}h`;
//   return `${days}d`;
// }

// export default function Messages() {
//   const insets = useSafeAreaInsets();
//   const isDark = useColorScheme() === 'dark';
//   const conversations = useQuery(api.messages.listConversations);
//   const currentUser = useQuery(api.users.currentUser);
//   const getOrCreate = useMutation(api.messages.getOrCreateConversation);
//   const friends = useQuery(api.users.getFriends);

//   const [search, setSearch] = useState('');

//   // Build a combined list: friends with their conversation if one exists
//   const friendRows = useMemo(() => {
//   if (!currentUser || !friends) return [];
//   return friends.filter(Boolean).map((friend) => {
//     const conv = conversations?.find((c) => c.other?._id === friend!._id);
//     return { friendId: friend!._id, conv, friendUser: friend };
//   });
// }, [currentUser, friends, conversations]);

//   // Also include conversations with people NOT in friends list (edge case)
//   const nonFriendConvs = useMemo(() => {
//     if (!currentUser || !conversations) return [];
//     const friendIds = new Set([
//       ...(currentUser.following ?? []),
//       ...(currentUser.followers ?? []),
//     ]);
//     return conversations.filter((c) => c.other && !friendIds.has(c.other._id as Id<'users'>));
//   }, [currentUser, conversations]);

//   const allRows = useMemo(() => {
//     const combined = [
//       ...friendRows,
//       ...nonFriendConvs.map((conv) => ({ friendId: conv.other!._id as Id<'users'>, conv })),
//     ];
//     if (!search.trim()) return combined;
//     const q = search.toLowerCase();
//     return combined.filter((r) => r.conv?.other?.name?.toLowerCase().includes(q));
//   }, [friendRows, nonFriendConvs, search]);

//   const handlePress = async (friendId: Id<'users'>, convId?: Id<'conversations'>) => {
//     if (convId) {
//       router.push(`/conversation?id=${convId}` as any);
//     } else {
//       const newConvId = await getOrCreate({ otherUserId: friendId });
//       router.push(`/conversation?id=${newConvId}` as any);
//     }
//   };

//   return (
//     <>
//       <Stack.Screen
//         options={{
//           headerTitle: 'Messages',
//           headerTransparent: true,
//           headerTintColor: isDark ? '#fff' : '#000',
//         }}
//       />

//       <View className="flex-1 bg-slate-100 dark:bg-slate-900">
//         <ScrollView
//           showsVerticalScrollIndicator={false}
//           keyboardShouldPersistTaps="handled"
//           contentContainerStyle={{ paddingTop: insets.top + 60, paddingBottom: insets.bottom + 32 }}
//         >
//           {/* Search bar */}
//           <View className="flex-row items-center mx-5 mb-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 px-3 h-11">
//             <Ionicons name="search" size={16} color={isDark ? '#475569' : '#94a3b8'} />
//             <TextInput
//               value={search}
//               onChangeText={setSearch}
//               placeholder="Search messages…"
//               placeholderTextColor={isDark ? '#475569' : '#94a3b8'}
//               className="flex-1 ml-2 text-slate-900 dark:text-white text-sm"
//               autoCapitalize="none"
//               autoCorrect={false}
//             />
//             {search.length > 0 && (
//               <Pressable onPress={() => setSearch('')}>
//                 <Ionicons name="close-circle" size={16} color={isDark ? '#475569' : '#94a3b8'} />
//               </Pressable>
//             )}
//           </View>

//           {/* No friends at all */}
//           {allRows.length === 0 && currentUser !== undefined && (
//             <View className="items-center py-20">
//               <Text className="text-5xl mb-4">👥</Text>
//               <Text className="text-slate-600 dark:text-slate-300 font-bold text-lg">No friends yet</Text>
//               <Text className="text-slate-400 dark:text-slate-500 text-sm mt-1 text-center px-10">
//                 Follow people to start messaging them
//               </Text>
//               <Pressable
//                 onPress={() => router.push('/(tabs)/(search)/search' as any)}
//                 className="mt-4 bg-indigo-500 rounded-2xl px-5 py-2.5 active:opacity-80"
//               >
//                 <Text className="text-white font-bold">Find People</Text>
//               </Pressable>
//             </View>
//           )}

//           {/* No search results */}
//           {allRows.length === 0 && search.trim().length > 0 && (
//             <View className="items-center py-20">
//               <Text className="text-4xl mb-3">🔍</Text>
//               <Text className="text-slate-500 dark:text-slate-400 font-semibold">No results</Text>
//             </View>
//           )}

//           {/* Friend / conversation rows */}
//           <View className="px-5 gap-2">
//             {allRows.map(({ friendId, conv }) => {
//               const other = conv?.other;
//               const isLastMe = conv?.lastMessageSenderId === currentUser?._id;
//               const hasConv = !!conv;

//               return (
//                 <Pressable
//                   key={friendId}
//                   onPress={() => handlePress(friendId, conv?._id)}
//                   className="flex-row items-center gap-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-3.5 active:opacity-70"
//                 >
//                   {/* Avatar */}
//                   <View className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 items-center justify-center shrink-0">
//                     <Text className="text-2xl">{other?.icon ?? '👤'}</Text>
//                   </View>

//                   {/* Content */}
//                   <View className="flex-1 min-w-0">
//                     <View className="flex-row items-center justify-between mb-0.5">
//                       <Text className="text-slate-900 dark:text-white font-bold text-base" numberOfLines={1}>
//                         {other?.name ?? 'Unknown'}
//                       </Text>
//                       {conv?.lastMessageTime && (
//                         <Text className="text-slate-400 dark:text-slate-500 text-xs ml-2 shrink-0">
//                           {timeAgo(conv.lastMessageTime)}
//                         </Text>
//                       )}
//                     </View>

//                     <Text className="text-slate-400 dark:text-slate-500 text-sm" numberOfLines={1}>
//                       {hasConv && conv.lastMessage
//                         ? `${isLastMe ? 'You: ' : ''}${conv.lastMessage}`
//                         : 'Tap to say hi 👋'}
//                     </Text>
//                   </View>

//                   <Ionicons
//                     name="chevron-forward"
//                     size={14}
//                     color={isDark ? '#475569' : '#cbd5e1'}
//                   />
//                 </Pressable>
//               );
//             })}
//           </View>
//         </ScrollView>

//         {/* FAB */}
//         <Pressable
//           onPress={() => router.push('/(tabs)/(search)/search' as any)}
//           className="absolute right-5 w-14 h-14 bg-indigo-500 rounded-full items-center justify-center active:opacity-80"
//           style={{ bottom: insets.bottom + 16 }}
//         >
//           <Ionicons name="create" size={22} color="white" />
//         </Pressable>
//       </View>
//     </>
//   );
// }

import { View, Text, ScrollView, useColorScheme } from 'react-native'
import React from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Stack } from 'expo-router';

export default function chats() {
  const isDark = useColorScheme() === 'dark';
  const insets = useSafeAreaInsets();

  return (
    <>
      <Stack.Screen 
        options={{
          headerTitle: "Chats",
          headerTransparent: true,
          headerTintColor: isDark ? '#fff' : '#000',
        }}
      />
      <View className="flex-1 bg-slate-100 dark:bg-slate-900">
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingTop: insets.top + 60, paddingBottom: insets.bottom + 32 }}
        >
          
        </ScrollView>
      </View>
    </>
  )
}
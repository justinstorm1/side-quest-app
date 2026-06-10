import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// // Get or create a conversation between two users
// export const getOrCreateConversation = mutation({
//   args: { otherUserId: v.id("users") },
//   handler: async (ctx, { otherUserId }) => {
//     const userId = await getAuthUserId(ctx);
//     if (!userId) throw new Error("Not authenticated");

//     const all = await ctx.db.query("conversations").collect();
//     const existing = all.find(
//       (c) => c.participants.includes(userId) && c.participants.includes(otherUserId)
//     );
//     if (existing) return existing._id;

//     return await ctx.db.insert("conversations", {
//       participants: [userId, otherUserId],
//     });
//   },
// });

// // List all conversations for current user
// export const listConversations = query({
//   args: {},
//   handler: async (ctx) => {
//     const userId = await getAuthUserId(ctx);
//     if (!userId) return [];

//     const all = await ctx.db.query("conversations").collect();
//     const mine = all.filter((c) => c.participants.includes(userId));

//     // Attach other participant's user data
//     const withUsers = await Promise.all(
//       mine.map(async (c) => {
//         const otherId = c.participants.find((p) => p !== userId)!;
//         const other = await ctx.db.get(otherId);
//         return { ...c, other };
//       })
//     );

//     return withUsers.sort((a, b) =>
//       (b.lastMessageTime ?? 0) - (a.lastMessageTime ?? 0)
//     );
//   },
// });

// // Get messages for a conversation
// export const getMessages = query({
//   args: { conversationId: v.id("conversations") },
//   handler: async (ctx, { conversationId }) => {
//     const userId = await getAuthUserId(ctx);
//     if (!userId) return [];
//     return await ctx.db
//       .query("messages")
//       .withIndex("by_conversation", (q) => q.eq("conversationId", conversationId))
//       .order("asc")
//       .collect();
//   },
// });

// // Send a message
// export const sendMessage = mutation({
//   args: {
//     conversationId: v.id("conversations"),
//     text: v.string(),
//   },
//   handler: async (ctx, { conversationId, text }) => {
//     const userId = await getAuthUserId(ctx);
//     if (!userId) throw new Error("Not authenticated");

//     await ctx.db.insert("messages", {
//       conversationId,
//       senderId: userId,
//       text,
//       readBy: [userId],
//     });

//     await ctx.db.patch(conversationId, {
//       lastMessage: text,
//       lastMessageTime: Date.now(),
//       lastMessageSenderId: userId,
//     });
//   },
// });

// // Mark all messages in a conversation as read
// export const markRead = mutation({
//   args: { conversationId: v.id("conversations") },
//   handler: async (ctx, { conversationId }) => {
//     const userId = await getAuthUserId(ctx);
//     if (!userId) return;

//     const msgs = await ctx.db
//       .query("messages")
//       .withIndex("by_conversation", (q) => q.eq("conversationId", conversationId))
//       .collect();

//     await Promise.all(
//       msgs
//         .filter((m) => !m.readBy.includes(userId))
//         .map((m) => ctx.db.patch(m._id, { readBy: [...m.readBy, userId] }))
//     );
//   },
// });

// // Unread count for current user
// export const unreadCount = query({
//   args: {},
//   handler: async (ctx) => {
//     const userId = await getAuthUserId(ctx);
//     if (!userId) return 0;

//     const all = await ctx.db.query("conversations").collect();
//     const mine = all.filter((c) => c.participants.includes(userId));

//     let count = 0;
//     for (const conv of mine) {
//       const msgs = await ctx.db
//         .query("messages")
//         .withIndex("by_conversation", (q) => q.eq("conversationId", conv._id))
//         .collect();
//       count += msgs.filter(
//         (m) => m.senderId !== userId && !m.readBy.includes(userId)
//       ).length;
//     }
//     return count;
//   },
// });
import { authTables } from "@convex-dev/auth/server";
import { defineTable, defineSchema } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    ...authTables,

    group: defineTable({
        leaderId: v.id("users"),
        joinCode: v.string(),
        name: v.string(),
        description: v.optional(v.string()),
        icon: v.optional(v.string()),
        members: v.array(v.id("users")),
    })
    .index("by_member", ["members"])
    .index("by_join_code", ["joinCode"]),
    
    
    users: defineTable({
        email: v.optional(v.string()),
        emailVerificationTime: v.optional(v.float64()),
        image: v.optional(v.string()),
        isAnonymous: v.optional(v.boolean()),
        name: v.optional(v.string()),
        phone: v.optional(v.string()),
        phoneVerificationTime: v.optional(v.float64()),
        groupId: v.optional(v.id("group")),
        isGroupLeader: v.optional(v.boolean()),
        icon: v.optional(v.string()),
        points: v.optional(v.number()),
        following: v.optional(v.array(v.id("users"))),
        followers: v.optional(v.array(v.id("users"))),
    })
    .index("email", ["email"])
    .index("phone", ["phone"]),

    quests: defineTable({
        title: v.optional(v.string()),
        description: v.optional(v.string()),
        icon: v.optional(v.string()),
        points: v.optional(v.number()),
        difficultly: v.optional(v.union(
            v.literal("easy"),
            v.literal("medium"),
            v.literal("hard"),
        )),
        location: v.optional(v.object({
            latitude: v.number(),
            longitude: v.number() 
        })),
        needsLocationVerification: v.boolean(),
        locationThresholdMiles: v.optional(v.number()),
        needsImageVerification: v.boolean(),
        timeThreshold: v.optional(v.number()),
    }),

    //  conversations: defineTable({
    //     participants: v.array(v.id("users")),
    //     lastMessage: v.optional(v.string()),
    //     lastMessageTime: v.optional(v.float64()),
    //     lastMessageSenderId: v.optional(v.id("users")),
    // })
    //     .index("by_participants", ["participants"]),

    // messages: defineTable({
    //     conversationId: v.id("conversations"),
    //     senderId: v.id("users"),
    //     text: v.string(),
    //     readBy: v.array(v.id("users")),
    // })
    //     .index("by_conversation", ["conversationId"]),

    chats: defineTable({
        name: v.optional(v.string()),
        users: v.array(v.id("users")),
        messages: v.optional(v.array(
            v.object({
                userId: v.id("users"),
                body: v.string(),
                timeSent: v.float64()
            })
        )),
        type: v.union(
            v.literal("direct"),
            v.literal("group")
        ),
        groupId: v.optional(v.id("groups"))
    })
    .index("by_users", ["users"])
})
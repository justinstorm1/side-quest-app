import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const createGroup = mutation({
    args: {
        name: v.string(),
        description: v.optional(v.string()),
        icon: v.string(),
    },
    handler: async (ctx, { name, description, icon }) => {
        const leaderId = await getAuthUserId(ctx);
        if (!leaderId) return null;
        const leader = await ctx.db.get(leaderId);
        if (!leader) return null;

        const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const numbers = "0123456789";
        let joinCode = "";
        for (let i = 0; i < 3; i++) {
            joinCode += letters[Math.floor(Math.random() * letters.length)];
        }
        for (let i = 0; i < 3; i++) {
            joinCode += numbers[Math.floor(Math.random() * numbers.length)];
        }

        const groupId = await ctx.db.insert("group", {
            leaderId: leader._id,
            joinCode,
            name,
            description,
            icon,
            members: [leader._id]
        });

        await ctx.db.patch(leader._id, {
            groupId
        });

        return { success: true };
    }
})

export const joinGroup = mutation({
    args: {
        joinCode: v.string(),
    },
    handler: async (ctx, { joinCode }) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return null;
        const user = await ctx.db.get(userId);
        if (!user) return null;

        const group = await ctx.db
            .query("group")
            .withIndex("by_join_code", q => q.eq("joinCode", joinCode))
            .first();
        if (!group) return null;

        await ctx.db.patch(group._id, {
            members: [...group.members, user._id]
        });

        await ctx.db.patch(user._id, {
            groupId: group._id
        });

        return { success: true };
    }
})

export const leaveGroup = mutation({
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return null;
        const user = await ctx.db.get(userId);
        if (!user) return null;

        await ctx.db.patch(user._id, {
            groupId: undefined
        });

        return { success: true };
    }
})

export const getCurrentUserGroup = query({
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return null;
        const user = await ctx.db.get(userId);
        if (!user) return null;

        const groupId = user.groupId;
        if (!groupId) return null;

        const group = await ctx.db.get(groupId);
        if (!group) return null;

        // 1. Fetch full user documents for every member ID
        const memberDocs = await Promise.all(
            group.members.map((memberId) => ctx.db.get(memberId))
        );

        // 2. Filter out nulls and sort by points descending for the leaderboard
        const sortedMembers = memberDocs
            .filter((m): m is NonNullable<typeof m> => m !== null)
            .sort((a, b) => (b.points ?? 0) - (a.points ?? 0));

        // 3. Return the group with fully populated and ordered member data
        return {
            ...group,
            members: sortedMembers,
        };
    }
});

export const createGroupInDB = mutation({
    handler: async (ctx) => {
        const leader = await ctx.db.query('users').first();
        if (!leader) return null;
        const leaderId = leader._id;
        if (!leaderId) return null;

        const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const numbers = "0123456789";
        let joinCode = "";
        for (let i = 0; i < 3; i++) {
            joinCode += letters[Math.floor(Math.random() * letters.length)];
        }
        for (let i = 0; i < 3; i++) {
            joinCode += numbers[Math.floor(Math.random() * numbers.length)];
        }

        const groupId = await ctx.db.insert("group", {
            leaderId: leader._id,
            joinCode,
            name: "New Group",
            description: "Description for new group",
            icon: "⚡️",
            members: [leader._id]
        });

        await ctx.db.patch(leader._id, {
            groupId
        });

        return { success: true };
    }
})
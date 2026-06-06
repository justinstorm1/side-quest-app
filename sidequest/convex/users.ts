import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const currentUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    return await ctx.db.get(userId);
  },
});

export const completeProfile = mutation({
  args: {
    name: v.string(),
    icon: v.string(),
  },
  handler: async (ctx, { name, icon }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    await ctx.db.patch(userId, { name, icon });
  },
});

export const getGlobalRank = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const allUsers = await ctx.db.query("users").collect();
    const sorted = allUsers
      .filter((u) => u.points !== undefined)
      .sort((a, b) => (b.points ?? 0) - (a.points ?? 0));
    const rank = sorted.findIndex((u) => u._id === userId);
    return rank === -1 ? null : rank + 1;
  },
});

export const getAllUsers = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    const users = await ctx.db
      .query("users")
      .collect();

    return users.filter(user => user._id !== userId);
  }
})

export const getUser = query({
  args: {
    userId: v.id("users")
  },
  handler: async (ctx, { userId }) => {
    const user = await ctx.db.get(userId);
    return user;
  }
})


export const followUser = mutation({
  args: {
    followedId: v.id("users")
  },
  handler: async (ctx, { followedId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const user = await ctx.db.get(userId);
    if (!user) return null;

    const followedUser = await ctx.db.get(followedId);
    if (!followedUser) return null;

    if (user.following?.includes(followedUser._id) && followedUser.followers?.includes(user._id)) {
      return null;
    }
    
    await ctx.db.patch(followedUser?._id, {
      followers: [...(followedUser.followers ?? []), user?._id]
    });

    await ctx.db.patch(user._id, {
      following: [...(user.following ?? []), followedUser._id]
    })

    return { success: true };
  }
})

export const unfollowUser = mutation({
  args: {
    unfollowedId: v.id("users")
  },
  handler: async (ctx, { unfollowedId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const user = await ctx.db.get(userId);
    if (!user) return null;

    const unfollowedUser = await ctx.db.get(unfollowedId);
    if (!unfollowedUser) return null;

    if (!user.following?.includes(unfollowedUser._id) && !unfollowedUser.followers?.includes(user._id)) {
      return null;
    }
    
    await ctx.db.patch(unfollowedUser?._id, {
      followers: unfollowedUser.followers?.filter(u => u != user._id)
      
    });

    await ctx.db.patch(user._id, {
      following: user.following?.filter(u => u != unfollowedUser._id)
    })

    return { success: true };
  }
})
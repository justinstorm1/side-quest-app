import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getAllQuests = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("quests").collect();
  },
});


export const seedQuests = mutation({
  args: {},
  handler: async (ctx) => {
    const quests = [
      // Fitness
      { title: "Morning Run", description: "Run 1 mile before 9am", icon: "🏃", points: 50, difficultly: "easy" as const, needsLocationVerification: false, needsImageVerification: true },
      { title: "10,000 Steps", description: "Hit 10k steps in a single day", icon: "👟", points: 75, difficultly: "medium" as const, needsLocationVerification: false, needsImageVerification: true },
      { title: "Do 50 Push-Ups", description: "Complete 50 push-ups in one session", icon: "💪", points: 60, difficultly: "medium" as const, needsLocationVerification: false, needsImageVerification: true },
      { title: "Ride a Bike", description: "Bike at least 5 miles", icon: "🚴", points: 80, difficultly: "medium" as const, needsLocationVerification: false, needsImageVerification: true },
      { title: "Swim Laps", description: "Swim 10 laps at a pool", icon: "🏊", points: 100, difficultly: "hard" as const, needsLocationVerification: true, location: { latitude: 40.7580, longitude: -73.9855 }, locationThresholdMiles: 10, needsImageVerification: true },
      { title: "Hike a Trail", description: "Complete a trail of at least 3 miles", icon: "🥾", points: 120, difficultly: "hard" as const, needsLocationVerification: true, location: { latitude: 41.0534, longitude: -74.1301 }, locationThresholdMiles: 50, needsImageVerification: true },
      { title: "Do Yoga", description: "Complete a 20-minute yoga session", icon: "🧘", points: 50, difficultly: "easy" as const, needsLocationVerification: false, needsImageVerification: true },
      { title: "Jump Rope", description: "Jump rope for 10 minutes straight", icon: "🪢", points: 60, difficultly: "medium" as const, needsLocationVerification: false, needsImageVerification: true },
      // Mind
      { title: "Read 30 Minutes", description: "Read any book for 30 minutes", icon: "📚", points: 40, difficultly: "easy" as const, needsLocationVerification: false, needsImageVerification: true },
      { title: "Finish a Book", description: "Complete an entire book", icon: "📖", points: 200, difficultly: "hard" as const, needsLocationVerification: false, needsImageVerification: true },
      { title: "No Screen Hour", description: "Go one full hour without any screens", icon: "🚫", points: 80, difficultly: "hard" as const, needsLocationVerification: false, needsImageVerification: false },
      { title: "Meditate", description: "Meditate for at least 10 minutes", icon: "🧠", points: 50, difficultly: "easy" as const, needsLocationVerification: false, needsImageVerification: false },
      { title: "Learn Something New", description: "Watch or read an educational article/video", icon: "🎓", points: 40, difficultly: "easy" as const, needsLocationVerification: false, needsImageVerification: true },
      { title: "Write in a Journal", description: "Write at least one full page", icon: "📝", points: 40, difficultly: "easy" as const, needsLocationVerification: false, needsImageVerification: true },
      { title: "Do a Puzzle", description: "Complete a jigsaw or logic puzzle", icon: "🧩", points: 60, difficultly: "medium" as const, needsLocationVerification: false, needsImageVerification: true },
      // Food
      { title: "Cook a New Recipe", description: "Try cooking something you've never made", icon: "🍳", points: 90, difficultly: "medium" as const, needsLocationVerification: false, needsImageVerification: true },
      { title: "Eat No Junk Food", description: "Go a full day without junk food", icon: "🥗", points: 70, difficultly: "medium" as const, needsLocationVerification: false, needsImageVerification: false },
      { title: "Try a New Restaurant", description: "Eat at a restaurant you've never been to", icon: "🍽️", points: 60, difficultly: "easy" as const, needsLocationVerification: true, location: { latitude: 40.7128, longitude: -74.0060 }, locationThresholdMiles: 25, needsImageVerification: true },
      { title: "Bake Something", description: "Bake bread, cookies, or a cake from scratch", icon: "🍞", points: 80, difficultly: "medium" as const, needsLocationVerification: false, needsImageVerification: true },
      { title: "Drink 8 Glasses of Water", description: "Stay hydrated all day", icon: "💧", points: 30, difficultly: "easy" as const, needsLocationVerification: false, needsImageVerification: false },
      // Social
      { title: "Call a Friend", description: "Have a real phone call with a friend", icon: "📞", points: 40, difficultly: "easy" as const, needsLocationVerification: false, needsImageVerification: false },
      { title: "Meet Someone New", description: "Have a real conversation with a stranger", icon: "🤝", points: 80, difficultly: "hard" as const, needsLocationVerification: false, needsImageVerification: false },
      { title: "Write a Letter", description: "Write and send a handwritten letter", icon: "✉️", points: 70, difficultly: "medium" as const, needsLocationVerification: false, needsImageVerification: true },
      { title: "Compliment 3 People", description: "Give genuine compliments to 3 different people", icon: "😊", points: 40, difficultly: "easy" as const, needsLocationVerification: false, needsImageVerification: false },
      { title: "Volunteer", description: "Volunteer for at least 1 hour", icon: "🙌", points: 150, difficultly: "hard" as const, needsLocationVerification: true, location: { latitude: 40.7282, longitude: -73.7949 }, locationThresholdMiles: 25, needsImageVerification: true },
      // Explore
      { title: "Visit a Museum", description: "Go to any museum", icon: "🏛️", points: 100, difficultly: "medium" as const, needsLocationVerification: true, location: { latitude: 40.7794, longitude: -73.9632 }, locationThresholdMiles: 50, needsImageVerification: true },
      { title: "Watch a Sunrise", description: "Be outside to watch the sun come up", icon: "🌅", points: 80, difficultly: "medium" as const, needsLocationVerification: false, needsImageVerification: true },
      { title: "Visit a Park", description: "Spend at least 30 minutes at a park", icon: "🌳", points: 40, difficultly: "easy" as const, needsLocationVerification: true, location: { latitude: 40.7851, longitude: -73.9683 }, locationThresholdMiles: 10, needsImageVerification: true },
      { title: "Go to a Concert", description: "Attend any live music event", icon: "🎵", points: 120, difficultly: "hard" as const, needsLocationVerification: true, location: { latitude: 40.6782, longitude: -73.9442 }, locationThresholdMiles: 50, needsImageVerification: true },
      { title: "Explore a New City", description: "Visit a city you've never been to", icon: "🏙️", points: 150, difficultly: "hard" as const, needsLocationVerification: true, location: { latitude: 42.3601, longitude: -71.0589 }, locationThresholdMiles: 100, needsImageVerification: true },
      { title: "Find a Hidden Gem", description: "Discover a local spot most people don't know", icon: "💎", points: 100, difficultly: "medium" as const, needsLocationVerification: false, needsImageVerification: true },
      { title: "Watch a Sunset", description: "Find a great spot and watch the sun go down", icon: "🌇", points: 50, difficultly: "easy" as const, needsLocationVerification: false, needsImageVerification: true },
      // Creative
      { title: "Draw Something", description: "Create any piece of artwork", icon: "🎨", points: 50, difficultly: "easy" as const, needsLocationVerification: false, needsImageVerification: true },
      { title: "Take 10 Photos", description: "Go on a photography walk", icon: "📸", points: 50, difficultly: "easy" as const, needsLocationVerification: false, needsImageVerification: true },
      { title: "Learn a Song", description: "Learn to play or sing a song", icon: "🎸", points: 100, difficultly: "hard" as const, needsLocationVerification: false, needsImageVerification: true },
      { title: "Write a Poem", description: "Write an original poem of at least 8 lines", icon: "✍️", points: 60, difficultly: "medium" as const, needsLocationVerification: false, needsImageVerification: true },
      { title: "Make a Video", description: "Record and edit a short video", icon: "🎬", points: 80, difficultly: "medium" as const, needsLocationVerification: false, needsImageVerification: true },
      // Productivity
      { title: "Clean Your Room", description: "Fully clean and organize your room", icon: "🧹", points: 60, difficultly: "medium" as const, needsLocationVerification: false, needsImageVerification: true },
      { title: "Wake Up Before 7am", description: "Get up early and start your day", icon: "⏰", points: 50, difficultly: "medium" as const, needsLocationVerification: false, needsImageVerification: false },
      { title: "Plan Your Week", description: "Write out a full weekly plan", icon: "🗓️", points: 40, difficultly: "easy" as const, needsLocationVerification: false, needsImageVerification: true },
      { title: "Go to Bed Before 10pm", description: "Get a full night's rest", icon: "😴", points: 40, difficultly: "easy" as const, needsLocationVerification: false, needsImageVerification: false },
      { title: "Do a Digital Detox", description: "No social media for an entire day", icon: "📵", points: 100, difficultly: "hard" as const, needsLocationVerification: false, needsImageVerification: false },
    ];

    for (const quest of quests) {
      await ctx.db.insert("quests", quest);
    }

    return `Inserted ${quests.length} quests`;
  },
});


export const getQuest = query({
  args: { questId: v.id("quests") },
  handler: async (ctx, { questId }) => {
    return await ctx.db.get(questId);
  },
});

export const completeQuest = mutation({
    args: { questId: v.id("quests") },
    handler: async (ctx, { questId }) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return null;

        const user = await ctx.db.get(userId);
        if (!user) return null;

        const quest = await ctx.db.get(questId);
        if (!quest) return null;

        await ctx.db.patch(user._id, {
            points: (user.points ?? 0) + (quest.points ?? 0)
        })

        return { success: true };
    }
})
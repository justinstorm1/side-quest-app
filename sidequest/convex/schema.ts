import { authTables } from "@convex-dev/auth/server";
import { defineTable, defineSchema } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    ...authTables,
})